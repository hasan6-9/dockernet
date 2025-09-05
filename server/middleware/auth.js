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

    // Check if user account is accessible
    console.log("Account status:", user.accountStatus);

    // ✅ FIXED: Allow both 'active' and 'pending' accounts
    // Only reject 'inactive' and 'suspended' accounts
    if (!["active", "pending"].includes(user.accountStatus)) {
      console.log("Account not accessible, status:", user.accountStatus);
      return res.status(401).json({
        success: false,
        message: "User account has been deactivated or suspended",
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

// ✅ NEW: Allow only active accounts (for sensitive operations)
exports.requireActive = (req, res, next) => {
  if (req.user.accountStatus !== "active") {
    return res.status(403).json({
      success: false,
      message:
        "Active account status required for this operation. Please complete your account verification.",
    });
  }
  next();
};

// ✅ NEW: Allow only verified accounts (for professional features)
exports.requireVerifiedAccount = (req, res, next) => {
  // Check if user has overall verification status
  const hasVerificationStatus =
    req.user.verificationStatus && req.user.verificationStatus.overall;

  if (
    !hasVerificationStatus ||
    req.user.verificationStatus.overall !== "verified"
  ) {
    return res.status(403).json({
      success: false,
      message: "Account verification required for this professional feature",
    });
  }
  next();
};

// ✅ NEW: Check if user is admin (alternative to authorize for cleaner usage)
exports.requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }
  next();
};

// ✅ NEW: Check account status and provide appropriate guidance
exports.checkAccountStatus = (req, res, next) => {
  const status = req.user.accountStatus;

  // Add status info to request for controllers to use
  req.accountStatusInfo = {
    status: status,
    isPending: status === "pending",
    isActive: status === "active",
    canAccessBasicFeatures: ["active", "pending"].includes(status),
    canAccessProfessionalFeatures: status === "active",
  };

  next();
};
