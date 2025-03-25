const express = require("express");
const router = express.Router();
const petController = require("../controllers/petController");
const { authenticate, authorize } = require("../middleware/authMiddleware");
const db = require("../config/db");

// Routes that require clinician or doctor authorization
router.put("/edit/:pet_id", authenticate, authorize({ roles: ["clinician", "doctor"] }), petController.updatePetProfile);
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
