const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
    if (!process.env.JWT_SECRET) {
        return res.status(500).json({ error: "❌ Server error. Missing JWT_SECRET." });
    }

    // Check for token in cookies or Authorization header
    const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "❌ Unauthorized: No token provided." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ error: err.name === "TokenExpiredError"
                ? "❌ Unauthorized: Token expired. Please log in again."
                : "❌ Unauthorized: Invalid token." });
        }

        req.user = decoded;
        console.log("Authenticated User:", req.user); // Debugging log
        next();
    });
};

const authorize = ({ roles = [], userIdParam = "" }) => {
    return (req, res, next) => {
        const user = req.user;
        
        if (!user) {
            return res.status(401).json({ error: "❌ Unauthorized: No user found." });
        }

        console.log("User Role:", user.role); // Debugging log

        if (roles.length > 0 && !roles.includes(user.role)) {
            return res.status(403).json({ error: "❌ Forbidden: You do not have the required role." });
        }

        next();
    };
};

module.exports = { authenticate, authorize };