const jwt = require("jsonwebtoken");

const authenticate = (req, res, next) => {
    if (!process.env.JWT_SECRET) {
        console.error("❌ Server error: Missing JWT_SECRET environment variable.");
        process.exit(1); // Terminate the server
    }

    // Check for token in Authorization header or cookies
    const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token;

    if (!token) {
        console.log("❌ No token provided");
        return res.status(401).json({ error: "❌ Unauthorized: No token provided." });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error("❌ Token verification error:", err.message); // Log the error
            return res.status(401).json({
                error: err.name === "TokenExpiredError"
                    ? "❌ Unauthorized: Token expired. Please log in again."
                    : "❌ Unauthorized: Invalid token.",
            });
        }

        console.log("✅ Token verified:", decoded);
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

        // Check if the user has the required role
        if (roles.length > 0 && !roles.includes(user.role)) {
            console.error(`❌ Role mismatch: User role (${user.role}) not in required roles (${roles.join(", ")})`);
            return res.status(403).json({ error: "❌ Forbidden: You do not have the required role." });
        }

        // Check if the userId matches the parameter (if applicable)
        if (userIdParam && req.params[userIdParam] && req.params[userIdParam] !== user.userId) {
            console.error(`❌ User ID mismatch: User ID (${user.userId}) does not match parameter (${req.params[userIdParam]})`);
            return res.status(403).json({ error: "❌ Forbidden: You do not have access to this resource." });
        }

        next();
    };
};

module.exports = { authenticate, authorize };