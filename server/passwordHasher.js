const { hashPassword } = require('./utils/passwordUtility');

const password = 'april24taurusshei'; // Replace with the password you want to hash

hashPassword(password)
    .then(hashedPassword => {
        console.log('Hashed password:', hashedPassword);
    })
    .catch(err => {
        console.error('Error hashing password:', err);
    });