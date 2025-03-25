const nodemailer = require("nodemailer");
require("dotenv").config();

const sendEmail = async (to, subject, body) => {
    try {
        let transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS, 
            },
        });

        let mailOptions = {
            from: `"Kho Veterinary Clinic Support" <${process.env.EMAIL_USER}>`,
            to: to,
            subject: subject,
            text: body,
        };

        let info = await transporter.sendMail(mailOptions);
        console.log("Email sent:", info.response);
    } catch (error) {
        console.error("Error sending email:", error);
    }
};

module.exports = { sendEmail };
