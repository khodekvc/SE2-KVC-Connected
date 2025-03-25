const bcrypt = require("bcrypt");

// hash password before storing
const hashPassword = async (password) => {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
};

// compare entered password with stored hash
const comparePassword = async (enteredPassword, storedHash) => {
    return await bcrypt.compare(enteredPassword, storedHash);
};

module.exports = { hashPassword, comparePassword };
