const crypto = require("crypto");

const generateResetToken = () => {
    return crypto.randomBytes(3).toString("hex").toUpperCase(); // Generates an 8-character alphanumeric code
};

module.exports = generateResetToken;