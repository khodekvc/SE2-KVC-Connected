const express = require("express");
const router = express.Router();
const petController = require("../controllers/petController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const db = require("../config/db");
const mysql = require("mysql2");

// Routes that require clinician or doctor authorization
router.put("/edit/:pet_id", authenticate, authorize({ roles: ["clinician", "doctor"] }), petController.updatePetProfile);
router.put("/archive/:pet_id", authenticate, authorize({ roles: ["clinician", "doctor"] }), petController.archivePet);
router.put("/restore/:pet_id", authenticate, authorize({ roles: ["clinician", "doctor"] }), petController.restorePet);

// Routes accessible to all authenticated users
router.get("/active", authenticate, petController.getAllActivePets);
router.get("/archived", authenticate, petController.getAllArchivedPets);

// Search pets with filtering and sorting
router.get("/search-pets", async (req, res) => {
    try {
        console.log("Received query parameters:", req.query);

        const { pet_id, pet_name, owner_name, species, sort_by, sort_order, min_id, max_id, search } = req.query;

        let query = `
            SELECT pet_info.pet_id, pet_info.pet_name, pet_info.pet_breed, pet_info.pet_gender, 
                   CONCAT(users.user_firstname, ' ', users.user_lastname) AS owner_name,
                   pet_species.spec_description AS species
            FROM pet_info
            JOIN users ON pet_info.user_id = users.user_id
            JOIN match_pet_species ON pet_info.pet_id = match_pet_species.pet_id
            JOIN pet_species ON match_pet_species.spec_id = pet_species.spec_id
            WHERE 1
        `;

        let queryParams = [];

        // Add filters
        if (pet_id && !min_id && !max_id) {
            query += " AND pet_info.pet_id = ?";
            queryParams.push(pet_id);
        } else if (min_id && max_id) {
            query += " AND pet_info.pet_id BETWEEN ? AND ?";
            queryParams.push(min_id, max_id);
        } else if (min_id) {
            query += " AND pet_info.pet_id >= ?";
            queryParams.push(min_id);
        } else if (max_id) {
            query += " AND pet_info.pet_id <= ?";
            queryParams.push(max_id);
        }
        if (pet_name) {
            query += " AND pet_info.pet_name LIKE ?";
            queryParams.push(`%${pet_name}%`);
        }
        if (owner_name) {
            query += " AND (users.user_firstname LIKE ? OR users.user_lastname LIKE ?)";
            queryParams.push(`%${owner_name}%`, `%${owner_name}%`);
        }
        if (species) {
            query += " AND pet_species.spec_description LIKE ?";
            queryParams.push(`%${species}%`);
        }

        // Add general search
        if (search) {
            const searchTerm = `%${search}%`;
            query += `
                AND (
                    pet_info.pet_name LIKE ?
                    OR CONCAT(users.user_firstname, ' ', users.user_lastname) LIKE ?
                    OR pet_species.spec_description LIKE ?
                    OR pet_info.pet_id LIKE ?
                )
            `;
            queryParams.push(searchTerm, searchTerm, searchTerm, searchTerm);
        }

        // Sorting logic
        const allowedSorts = {
            pet_id: "pet_info.pet_id",
            pet_name: "pet_info.pet_name",
            owner_name: "users.user_lastname",
            species: "pet_species.spec_description"
        };

        let orderClause = "";

        // Determine sorting priority
        if (sort_by && sort_by in allowedSorts) {
            // If a specific sort_by is provided, use it as the primary sorting field
            let order = sort_order === "desc" ? "DESC" : "ASC";
            orderClause = ` ORDER BY ${allowedSorts[sort_by]} ${order}`;
        } else if (species && !sort_by) {
            // If only species is selected, sort by pet_id in ascending order
            orderClause = ` ORDER BY pet_info.pet_id ASC`;
        } else if (min_id || max_id) {
            // If range of id is selected, default to sorting by pet_id
            orderClause = ` ORDER BY pet_info.pet_id ASC`;
        }

        // Handle combinations of filters
        if (sort_by === "pet_name" && species) {
            orderClause = ` ORDER BY pet_info.pet_name ${sort_order === "desc" ? "DESC" : "ASC"}`;
        } else if (sort_by === "owner_name" && species) {
            orderClause = ` ORDER BY users.user_lastname ${sort_order === "desc" ? "DESC" : "ASC"}`;
        } else if (sort_by === "pet_name" && sort_by === "owner_name") {
            // Default to pet_name if both pet_name and owner_name are selected
            orderClause = ` ORDER BY pet_info.pet_name ${sort_order === "desc" ? "DESC" : "ASC"}`;
        }

        // Default sorting if no specific sort_by is provided
        if (!orderClause) {
            orderClause = ` ORDER BY pet_info.pet_id ASC`;
        }

        // Append the order clause to the query
        query += orderClause;

        // Log the raw SQL query
        const rawQuery = mysql.format(query, queryParams);
        console.log("Sorting by:", sort_by, "Order:", sort_order);
        console.log("Raw SQL Query:", rawQuery);

        const [results] = await db.query(query, queryParams);
        console.log("Query Results:", results);
        res.json(results);
    } catch (error) {
        console.error("Error searching pets:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


// Route to fetch pet details by pet_id
//router.get("/:pet_id", authenticate, petController.getPetById);
module.exports = router;
