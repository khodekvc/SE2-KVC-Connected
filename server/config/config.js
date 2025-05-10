// Server configuration
require('dotenv').config();

const config = {
  port: process.env.PORT || 5000,
  
  // Database configuration
  database: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },
  
  // Session configuration
  session: {
    secret: process.env.SESSION_SECRET,
  },
  
  // JWT configuration
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
  },
  
  // CORS configuration
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
  },
  
  // Email configuration
  email: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
    clinicOwnerEmail: process.env.CLINIC_OWNER_EMAIL,
  },
  
  // Encryption configuration
  encryption: {
    key: process.env.ENCRYPTION_KEY,
    cipher: process.env.ENCRYPTION_CIPHER,
  },
};

module.exports = config;