const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { sendEmail } = require("../utils/emailUtility");
const generateResetToken = require("../utils/tokenGenerator"); // Import the function
const db = require("../config/db");

// Store reset tokens temporarily
const resetTokens = new Map(); // { email: { token, expires } }

// 📌 Request a password reset (Step 1)
const requestPasswordReset = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email is required." });

        // Check if user exists
        const [user] = await db.query("SELECT * FROM users WHERE user_email = ?", [email]);
        if (!user) return res.status(404).json({ error: "User not found." });

        // Generate secure alphanumeric reset code
        const resetToken = generateResetToken();
        resetTokens.set(email, { token: resetToken, expires: Date.now() + 10 * 60 * 1000 }); // 10 min expiry

        // Professional email content
        const subject = "Password Reset Request - Kho Veterinary Clinic";
        const body = `Greetings! \n\n
We received a request to reset your password for your Kho Veterinary Clinic account. If you requested this reset, please use the verification code below.\n\n
The code is valid for **10 minutes**. If you did not request this, please ignore this email, and your password will remain unchanged.\n\n
For security reasons, do not share this code with anyone.\n\n
Best regards,\n
**Kho Veterinary Clinic Support Team**\n\n\n
🔑 **Reset Code:** ${resetToken}\n\n`;

        // Send email
        await sendEmail(email, subject, body);

        res.json({ message: "Reset code sent to your email." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error while requesting password reset." });
    }
};



// 📌 Verify reset code (Step 2)
const verifyResetCode = async (req, res) => {
    try {
        const { email, code } = req.body;
        const storedToken = resetTokens.get(email);

        if (!storedToken || storedToken.token !== code || storedToken.expires < Date.now()) {
            return res.status(400).json({ error: "Invalid or expired reset code." });
        }

        res.json({ message: "Code verified. Proceed to reset your password." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error while verifying reset code." });
    }
};

// 📌 Reset password (Step 3)
const resetPassword = async (req, res) => {
    try {
        const { email, code, newPassword, confirmPassword } = req.body;
        if (newPassword !== confirmPassword) return res.status(400).json({ error: "Passwords do not match." });

        const storedToken = resetTokens.get(email);
        if (!storedToken || storedToken.token !== code || storedToken.expires < Date.now()) {
            return res.status(400).json({ error: "Invalid or expired reset code." });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query("UPDATE users SET user_password = ? WHERE user_email = ?", [hashedPassword, email]);

        // Clear reset token
        resetTokens.delete(email);

        res.json({ message: "Password reset successfully. You can now log in." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error while resetting password." });
    }
};

module.exports = { requestPasswordReset, verifyResetCode, resetPassword };