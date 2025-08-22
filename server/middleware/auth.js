const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Protect routes - verify JWT token
exports.protect = async (req, res, next) => {
  let token;

  console.log("Authorization header:", req.headers.authorization);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    console.log("Token found:", token ? "Yes" : "No");
  }

  if (!token) {
    console.log("No token provided");
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token ID:", decoded.id);

    // Get user from token
    const user = await User.findById(decoded.id).select("-password");
    console.log("User found:", user ? user._id : "Not found");

    if (!user) {
      console.log("User not found in database");
      return res.status(401).json({
        success: false,
        message: "No user found with this token",
      });
    }

    // Check if user is active
    console.log("Account status:", user.accountStatus);
    if (user.accountStatus !== "active") {
      console.log("Account not active");
      return res.status(401).json({
        success: false,
        message: "User account has been deactivated",
      });
    }

    req.user = user;
    console.log("Authentication successful, user:", user._id);
    next();
  } catch (error) {
    console.error("Token verification error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Not authorized to access this route",
    });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

// Check if user is verified
exports.requireVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      message: "Account verification required to access this resource",
    });
  }
  next();
};

// Check if user has active subscription
exports.requireSubscription = (req, res, next) => {
  if (req.user.subscriptionStatus !== "active") {
    return res.status(403).json({
      success: false,
      message: "Active subscription required to access this resource",
    });
  }
  next();
};
