const jwt = require("jsonwebtoken");

// Middleware to authenticate JWT tokens
const authenticateToken = (req, res, next) => {
  // Extract the Authorization header
  const authHeader = req.headers["authorization"];
  console.log("Authorization Header:", authHeader); // Debugging

  // Check if the Authorization header exists and starts with "Bearer"
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("Invalid or missing Authorization header.");
    return res.status(401).json({
      message: "Access denied. Token must be in 'Bearer <token>' format.",
    });
  }

  // Extract the token from the Authorization header
  const token = authHeader.split(" ")[1];
  console.log("Extracted Token:", token); // Debugging

  // Verify the token
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach the decoded token payload to the request
    console.log("Decoded Token:", decoded); // Debugging
    next(); // Pass control to the next middleware
  } catch (err) {
    console.error("Token verification failed:", err.message); // Debugging
    return res.status(403).json({
      message: "Invalid or expired token. Please log in again.",
      error: err.message,
    });
  }
};

// Middleware for role-based authorization
const authorizeRole = (role) => {
  return (req, res, next) => {
    // Check if the user role matches the required role
    console.log("User Role:", req.user.role); // Debugging
    if (req.user.role !== role) {
      console.error(`Access denied. Required role: ${role}, User role: ${req.user.role}`);
      return res.status(403).json({
        message: `Access denied. ${role} role required.`,
        currentRole: req.user.role,
      });
    }
    next(); // User has the required role, proceed
  };
};

// Middleware for allowing multiple roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Check if the user's role matches any of the allowed roles
    console.log("User Role:", req.user.role); // Debugging
    if (!roles.includes(req.user.role)) {
      console.error(`Access denied. Allowed roles: ${roles}, User role: ${req.user.role}`);
      return res.status(403).json({
        message: `Access denied. One of the following roles is required: ${roles.join(", ")}`,
        currentRole: req.user.role,
      });
    }
    next(); // User has one of the required roles, proceed
  };
};

module.exports = {
  authenticateToken,
  authorizeRole,
  authorizeRoles,
};
