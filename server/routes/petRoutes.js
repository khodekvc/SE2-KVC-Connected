const express = require("express");
const router = express.Router();
const petController = require("../controllers/petController");
const { authenticate, authorize } = require("../middleware/authMiddleware");

// Routes that require clinician or doctor authorization
router.put("/edit/:pet_id", authenticate, authorize({ roles: ["clinician", "doctor"] }), petController.updatePetProfile);
router.put("/archive/:pet_id", authenticate, authorize({ roles: ["clinician", "doctor"] }), petController.archivePet);
router.put("/restore/:pet_id", authenticate, authorize({ roles: ["clinician", "doctor"] }), petController.restorePet);

// Routes accessible to all authenticated users
router.get("/active", authenticate, petController.getAllActivePets);
router.get("/archived", authenticate, petController.getAllArchivedPets);

module.exports = router;
