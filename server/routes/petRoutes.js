const express = require("express");
const router = express.Router();
const petController = require("../controllers/petController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const db = require("../config/db");


// Routes that require clinician or doctor authorization
router.post("/:pet_id/vaccines", authenticate, authorize({ roles: ["clinician", "doctor"] }), async (req, res) => {
    const { pet_id } = req.params
    const { vax_type, imm_rec_quantity, imm_rec_date } = req.body
 
    try {
      // First, get the vax_id based on the vax_type
      const [vaxResult] = await db.query("SELECT vax_id FROM vax_info WHERE vax_type = ?", [vax_type])
 
      if (vaxResult.length === 0) {
        return res.status(404).json({ error: "Vaccine type not found" })
      }
 
      const vax_id = vaxResult[0].vax_id
 
      // Insert the vaccination record
      const [result] = await db.query(
        "INSERT INTO immunization_record (vax_id, pet_id, imm_rec_quantity, imm_rec_date) VALUES (?, ?, ?, ?)",
        [vax_id, pet_id, imm_rec_quantity, imm_rec_date],
      )
 
      if (result.affectedRows === 0) {
        return res.status(500).json({ error: "Failed to add vaccination record" })
      }
 
      // Return the newly created record with its ID
      res.status(201).json({
        id: result.insertId,
        vax_id,
        pet_id,
        vax_type,
        imm_rec_quantity,
        imm_rec_date,
      })
    } catch (error) {
      console.error("Error adding vaccination record:", error)
      res.status(500).json({ error: "Failed to add vaccination record" })
    }
  })
 
  // Route to get all vaccination records for a pet
  router.get("/:pet_id/vaccines", authenticate, async (req, res) => {
    const { pet_id } = req.params
 
    try {
      const [records] = await db.query(
        `SELECT ir.*, vi.vax_type
         FROM immunization_record ir
         JOIN vax_info vi ON ir.vax_id = vi.vax_id
         WHERE ir.pet_id = ?
         ORDER BY ir.imm_rec_date DESC`,
        [pet_id],
      )
 
      res.json(records)
    } catch (error) {
      console.error("Error fetching vaccination records:", error)
      res.status(500).json({ error: "Failed to fetch vaccination records" })
    }
  })
 
  // Route to update a vaccination record (for the + button)
  router.put(
    "/:pet_id/vaccines/:record_id",
    authenticate,
    authorize({ roles: ["clinician", "doctor"] }),
    async (req, res) => {
      const { pet_id, record_id } = req.params
      const { imm_rec_quantity, imm_rec_date } = req.body
 
      try {
        const [result] = await db.query(
          "UPDATE immunization_record SET imm_rec_quantity = ?, imm_rec_date = ? WHERE vax_id = ? AND pet_id = ?",
          [imm_rec_quantity, imm_rec_date, record_id, pet_id],
        )
 
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "Vaccination record not found" })
        }
 
        res.json({ message: "Vaccination record updated successfully" })
      } catch (error) {
        console.error("Error updating vaccination record:", error)
        res.status(500).json({ error: "Failed to update vaccination record" })
      }
    },
  )
 
  router.put("/edit/:pet_id", authenticate, authorize({ roles: ["clinician", "doctor"] }), async (req, res) => {
    const { pet_id } = req.params
    const updatedData = req.body
    console.log("API called to update pet profile for pet ID:", pet_id, "with data:", updatedData) // Debugging line
  
    try {
      await db.query("START TRANSACTION")
  
      const {
        pet_name = "",
        pet_breed = "",
        pet_gender = "", 
        pet_birthday = null,
        pet_age_month = "",
        pet_age_year = "",
        pet_color = "",
        pet_status = "1", 
        spec_id = 1, 
      } = updatedData
  
      const [petResult] = await db.query(
        `UPDATE pet_info
               SET pet_name = ?, pet_breed = ?, pet_gender = ?, pet_birthday = ?, pet_age_month = ?, pet_age_year = ?, pet_color = ?, pet_status = ?
               WHERE pet_id = ?`,
        [pet_name, pet_breed, pet_gender, pet_birthday, pet_age_month, pet_age_year, pet_color, pet_status, pet_id],
      )
  
      const [existingRecords] = await db.query(`SELECT * FROM match_pet_species WHERE pet_id = ?`, [pet_id])
  
      if (existingRecords.length > 0) {
        await db.query(
          `UPDATE match_pet_species
                   SET spec_id = ?
                   WHERE pet_id = ?`,
          [spec_id, pet_id],
        )
        console.log(`Updated species for pet_id ${pet_id} to spec_id ${spec_id}`)
      } else {
        await db.query(
          `INSERT INTO match_pet_species (pet_id, spec_id)
                   VALUES (?, ?)`,
          [pet_id, spec_id],
        )
        console.log(`Inserted new species record for pet_id ${pet_id} with spec_id ${spec_id}`)
      }
  
      await db.query("COMMIT")
  
      console.log("Database query result:", petResult) // Debugging line
  
      if (petResult.affectedRows === 0) {
        console.log("No rows affected") // Debugging line
        return res.status(404).json({ error: "Pet not found or no changes made" })
      }
  
      const [updatedPet] = await db.query(
        `SELECT p.*, ps.spec_description as species
               FROM pet_info p
               JOIN match_pet_species mps ON p.pet_id = mps.pet_id
               JOIN pet_species ps ON mps.spec_id = ps.spec_id
               WHERE p.pet_id = ?`,
        [pet_id],
      )
  
      res.status(200).json({
        message: "Pet profile updated successfully",
        pet: updatedPet[0],
      })
    } catch (error) {
      // Rollback the transaction in case of error
      await db.query("ROLLBACK")
      console.error("Error updating pet profile:", error)
      res.status(500).json({ error: "Failed to update pet profile" })
    }
  })
  

router.put("/archive/:pet_id", authenticate, authorize({ roles: ["clinician", "doctor"] }), petController.archivePet);
router.put("/restore/:pet_id", authenticate, authorize({ roles: ["clinician", "doctor"] }), petController.restorePet);


// Routes accessible to all authenticated users
router.get("/active", authenticate, petController.getAllActivePets);
router.get("/archived", authenticate, petController.getAllArchivedPets);


// Route to fetch pet details by pet_id
router.get("/:pet_id", authenticate, petController.getPetById);


// Search pets with filtering and sorting
router.get("/search-pets", async (req, res) => {
    try {
        const { pet_id, pet_name, owner_name, species, sort_by, sort_order, min_id, max_id } = req.query;


        let query = `
            SELECT pet_info.pet_id, pet_info.pet_name, pet_info.pet_breed, pet_info.pet_gender,
                users.user_firstname AS owner_firstname, users.user_lastname AS owner_lastname,
                pet_species.spec_description
            FROM pet_info
            JOIN users ON pet_info.user_id = users.user_id
            JOIN match_pet_species ON pet_info.pet_id = match_pet_species.pet_id
            JOIN pet_species ON match_pet_species.spec_id = pet_species.spec_id
            WHERE 1
        `;


        let queryParams = [];


        // Search by pet_id (exact match or range)
        if (pet_id) {
            query += " AND pet_info.pet_id = ?";
            queryParams.push(pet_id);
        }
        if (min_id && max_id) {
            query += " AND pet_info.pet_id BETWEEN ? AND ?";
            queryParams.push(min_id, max_id);
        }


        // Search by pet_name (partial match)
        if (pet_name) {
            query += " AND pet_info.pet_name LIKE ?";
            queryParams.push(`%${pet_name}%`);
        }


        // Search by owner_name (partial match in first or last name)
        if (owner_name) {
            query += " AND (users.user_firstname LIKE ? OR users.user_lastname LIKE ?)";
            queryParams.push(`%${owner_name}%`, `%${owner_name}%`);
        }


        // Search by species (partial match)
        if (species) {
            query += " AND pet_species.spec_description LIKE ?";
            queryParams.push(`%${species}%`);
        }


        // Sorting logic
        const allowedSorts = {
            pet_id: "pet_info.pet_id",
            pet_name: "pet_info.pet_name",
            owner_name: "users.user_lastname",
            species: "pet_species.spec_description"
        };


        // Validate sorting column
        if (sort_by in allowedSorts) {
            let order = sort_order === "desc" ? "DESC" : "ASC"; // Default to ASC
            query += ` ORDER BY ${allowedSorts[sort_by]} ${order}`;
        }


        const [results] = await db.query(query, queryParams);
        res.json(results);
    } catch (error) {
        console.error("Error searching pets:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


module.exports = router;
