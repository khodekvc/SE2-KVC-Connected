const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

const UserModel = require("../models/userModel");
const PetModel = require("../models/petModel");
const { generateCaptcha, generateCaptchaImage } = require("../utils/captchaUtility");
const { hashPassword } = require("../utils/passwordUtility");
const { generateToken } = require("../utils/authUtility");
const { sendEmail } = require("../utils/emailUtility");

exports.getCaptcha = (req, res) => {
    const captchaText = generateCaptcha();
    const captchaImage = generateCaptchaImage(captchaText);

    req.session.captcha = captchaText;
    res.json({ image: captchaImage, captchaKey: captchaText });
};

exports.loginUser = async (req, res) => {
    try {
        const { email, password, captchaInput } = req.body;

        if (!req.session.captcha || captchaInput !== req.session.captcha) {
            return res.status(401).json({ error: "❌ Incorrect CAPTCHA" });
        }
        req.session.captcha = null;

        const user = await UserModel.findByEmail(email);
        if (!user || !(await bcrypt.compare(password, user.user_password))) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = generateToken(user.user_id, user.user_role);
        console.log("Generated Token:", token);

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 15 * 60 * 1000
        });

        res.json({
            message: "✅ Login successful!",
            redirectUrl: "/patients",
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ error: "❌ Server error during login" });
    }
};

exports.signupPetOwnerStep1 = async (req, res) => {
    const { fname, lname, email, contact, address, password, confirmPassword } = req.body;

    if (!fname || !lname || !email || !contact || !address || !password || !confirmPassword) {
        return res.status(400).json({ error: "❌ All fields are required!" });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ error: "❌ Passwords do not match!" });
    }

    try {
        if (await UserModel.isEmailTaken(email)) {
            return res.status(400).json({ error: "❌ Email already in use." });
        }

        req.session.petOwnerData = {
            fname, lname, email, contact, address, password: await hashPassword(password)
        };
        req.session.step1Completed = true;

        res.json({
            message: "✅ Step 1 completed. Proceed to pet info.",
            redirectUrl: "/signup-petowner-petinfo"
        });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ error: "❌ Server error during signup." });
    }
};

exports.signupPetOwnerStep2 = async (req, res) => {
    const { petname, gender, speciesDescription, breed, birthdate, altPerson1, altContact1, captchaInput } = req.body;

    if (!req.session.captcha || captchaInput !== req.session.captcha) {
        console.log("❌ CAPTCHA Mismatch! Expected:", req.session.captcha, "Received:", req.body.captchaInput);
        return res.status(400).json({ error: "❌ Incorrect CAPTCHA!" });
    }
    req.session.captcha = null;

    if (!req.session.petOwnerData || !req.session.step1Completed) {
        return res.status(400).json({ error: "❌ Personal info missing or Step 1 not completed. Restart signup process." });
    }

    if (!petname || !gender || !speciesDescription || !altPerson1 || !altContact1) {
        return res.status(400).json({ error: "❌ All fields are required except breed and birthdate!" });
    }
    const { fname, lname, email, contact, address, password } = req.session.petOwnerData;

    try {
        const species = await PetModel.findSpeciesByDescription(speciesDescription);
        if (!species) {
            return res.status(400).json({ error: "❌ Invalid species selected." });
        }
        const speciesId = species.spec_id;

        console.log("Creating pet owner...");
        const userId = await UserModel.createPetOwner({ fname, lname, email, contact, address, password, altPerson1, altContact1 });
        console.log("Pet owner created with ID:", userId);

        console.log("Creating pet...");
        const petId = await PetModel.createPet({ petname, gender, speciesId, breed, birthdate, userId });
        console.log("Pet created with ID:", petId);

        const token = generateToken(userId, "owner");
        console.log('Generated Token:', token);
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 15 * 60 * 1000
        });

        req.session.petOwnerData = null;
        req.session.step1Completed = null;
        res.status(201).json({ message: "✅ Pet Owner account created successfully!" });
    } catch (error) {
        console.error("Signup Error:", error.message);
        res.status(500).json({ error: "❌ Server error during signup." });
    }
};

// employee signup
exports.signupEmployeeRequest = async (req, res) => {
    const { fname, lname, contact, email, role, password, confirmPassword, captchaInput } = req.body;

    if (!req.session.captcha || captchaInput !== req.session.captcha) {
        return res.status(400).json({ error: "❌ Incorrect CAPTCHA!" });
    }
    req.session.captcha = null;

    if (!fname || !lname || !email || !role || !password || !confirmPassword) {
        return res.status(400).json({ error: "❌ All fields are required!" });
    }

    if (password !== confirmPassword) {
        return res.status(400).json({ error: "❌ Passwords do not match!" });
    }

    try {
        const existingUser = await UserModel.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: "❌ Email already in use." });
        }

        const accessCode = crypto.randomBytes(4).toString("hex").toUpperCase();

        req.session.employeeData = { fname, lname, contact, email, role, password, accessCode };

        const clinicOwnerEmail = process.env.CLINIC_OWNER_EMAIL;
        const subject = "New Employee Signup Request - PAWtient Tracker";
        const body = `Hello Clinic Owner,\n\nA new employee has requested to sign up:\n\nName: ${fname} ${lname}\n Contact Number: ${contact}\nEmail: ${email}\nPosition: ${role}\n\nTo approve, provide them with the following access code:\n\nAccess Code: ${accessCode}\n\nIf this request is unauthorized, please ignore this email.`;

        await sendEmail(clinicOwnerEmail, subject, body);

        res.json({
            message: "✅ Signup request sent. Await access code from the clinic owner.",
            redirectUrl: "/signup-employee-accesscode",
        });
    } catch (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "❌ Server error." });
    }
};

// Complete Employee Signup
exports.signupEmployeeComplete = async (req, res) => {
    const { accessCode } = req.body;

    if (!accessCode) {
        return res.status(400).json({ error: "❌ Access code is required!" });
    }

    try {
        if (!req.session.employeeData) {
            return res.status(400).json({ error: "❌ No signup request found. Please start again." });
        }

        const { fname, lname, contact, role, password, accessCode: storedCode, email } = req.session.employeeData;

        if (accessCode !== storedCode) {
            return res.status(400).json({ error: "❌ Invalid access code." });
        }

        const hashedPassword = await hashPassword(password);
        const userId = await UserModel.createEmployee({ fname, lname, contact, email, role, hashedPassword });

        const token = generateToken(userId, role);
        console.log('Generated Token:', token);
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "Strict",
            maxAge: 15 * 60 * 1000
        });

        req.session.employeeData = null;

        res.json({
            message: "✅ Signup successful! You can now log in.",
            redirectUrl: "/patients",
        });
    } catch (error) {
        console.error("Employee Signup Error:", error);
        res.status(500).json({ error: "❌ Server error." });
    }
};

// user logout
exports.logoutUser = (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                return res.status(500).json({ message: "Logout failed" });
            }

            res.clearCookie("connect.sid", { path: "/" });
            res.clearCookie("token", { path: "/" });

            return res.json({ message: "Logout successful" });
        });
    } catch (error) {
        console.error("Logout Error:", error);
        return res.status(500).json({ error: "❌ Server error during logout" });
    }
};


