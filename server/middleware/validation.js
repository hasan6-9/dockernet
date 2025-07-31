const { body } = require("express-validator");

exports.validateRegister = [
  body("firstName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),

  body("lastName")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),

  body("role")
    .isIn(["senior", "junior"])
    .withMessage("Role must be either senior or junior"),

  body("licenseNumber")
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("License number is required"),

  body("licenseState")
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("License state is required"),

  body("specialty")
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Medical specialty is required"),

  body("yearsOfExperience")
    .isInt({ min: 0, max: 70 })
    .withMessage("Years of experience must be a number between 0 and 70"),

  body("medicalSchool")
    .trim()
    .isLength({ min: 2, max: 200 })
    .withMessage("Medical school information is required"),
];

exports.validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email"),

  body("password").exists().withMessage("Password is required"),
];
