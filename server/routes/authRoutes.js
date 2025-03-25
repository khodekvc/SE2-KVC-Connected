const express = require("express");
const { generateCaptcha, generateCaptchaImage } = require("../utils/captchaUtility");
const authController = require("../controllers/authController");
const { requestPasswordReset, verifyResetCode, resetPassword } = require("../controllers/forgotPasswordController");
const { authenticate } = require("../middleware/authMiddleware");
const db = require("../config/db");
const bcrypt = require('bcrypt');
const crypto = require("crypto");

console.log("DB module:", db);

// create router instance
const router = express.Router();
const captchaStore = new Map();
const pendingSignups = new Map();

// Postman test: verify captcha
router.post("/captcha/verify", (req, res) => {
    const { captchaResponse } = req.body;

    if (!captchaResponse) {
        return res.status(400).json({ error: "Missing CAPTCHA response." });
    }

    if (!req.session.captcha) {
        return res.status(400).json({ error: "Session expired. Please refresh CAPTCHA." });
    }

    if (captchaResponse !== req.session.captcha) {
        return res.status(400).json({ error: "❌ Incorrect CAPTCHA!" });
    }

    delete req.session.captcha;
    res.json({ message: "✅ CAPTCHA verified!" });
});

// route to generate captcha
router.get("/captcha", authController.getCaptcha);

// Routes for user signup and logout (delegated to authController)
router.post("/login", authController.loginUser);
router.post("/signup/petowner-step1", authController.signupPetOwnerStep1);
router.post("/signup/petowner-step2", authController.signupPetOwnerStep2);
router.post("/signup/employee", authController.signupEmployeeRequest);
router.post("/signup/employee-verify", authController.signupEmployeeComplete);
router.post("/logout", authenticate, authController.logoutUser);

// Routes for password reset
 router.post("/forgot-password", requestPasswordReset);
 router.post("/verify-reset-code", verifyResetCode);
 router.post("/reset-password", resetPassword);

module.exports = router;