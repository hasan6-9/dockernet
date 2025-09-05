const express = require("express");
const {
  register,
  login,
  getMe,
  updateDetails,
  updatePassword,
  logout,
} = require("../controllers/authController");

const {
  protect,
  requireActive,
  checkAccountStatus,
} = require("../middleware/auth");
const { validateRegister, validateLogin } = require("../middleware/validation");

const router = express.Router();

// Public routes - no authentication required
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.get("/logout", logout);

// Basic protected routes - accessible to pending + active users
router.get("/me", protect, checkAccountStatus, getMe);

// Profile updates - basic info can be updated by pending users
router.put("/updatedetails", protect, updateDetails);

// Sensitive operations - require active account
router.put("/updatepassword", protect, requireActive, updatePassword);

module.exports = router;
