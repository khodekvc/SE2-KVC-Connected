const express = require("express");
const usersController = require("../controllers/usersController");
const { authenticate } = require("../middleware/authMiddleware");
const router = express.Router();

router.get("/myAccount", authenticate, usersController.getEmployeeProfile);

// update profile (Protected route)
router.put("/update-employee-profile", authenticate, usersController.updateEmployeeProfile);
router.put("/update-petowner-profile", authenticate, usersController.updateOwnerProfile);

// change password (Protected route)
router.post("/change-password", authenticate, usersController.changePassword);

module.exports = router;
