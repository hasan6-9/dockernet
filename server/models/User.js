const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // Don't include password in queries by default
    },

    // Role & Status
    role: {
      type: String,
      enum: ["senior", "junior", "admin"],
      required: [true, "Role is required"],
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // Medical License Info
    licenseNumber: {
      type: String,
      required: function () {
        return this.role !== "admin";
      },
      trim: true,
    },
    licenseState: {
      type: String,
      required: function () {
        return this.role !== "admin";
      },
    },
    licenseDocument: {
      type: String, // Cloudinary URL
      required: function () {
        return this.role !== "admin";
      },
    },

    // Professional Info
    specialty: {
      type: String,
      required: function () {
        return this.role !== "admin";
      },
    },
    yearsOfExperience: {
      type: Number,
      required: function () {
        return this.role !== "admin";
      },
      min: [0, "Years of experience cannot be negative"],
    },
    medicalSchool: {
      type: String,
      required: function () {
        return this.role !== "admin";
      },
    },

    // Profile
    profilePhoto: {
      type: String, // Cloudinary URL
      default: null,
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
    },

    // Subscription
    subscriptionStatus: {
      type: String,
      enum: ["active", "inactive", "cancelled"],
      default: "inactive",
    },
    subscriptionId: String, // Stripe subscription ID

    // Account Status
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: Date,

    // Reset Password
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // Email Verification
    emailVerificationToken: String,
    emailVerificationExpire: Date,
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate JWT token
userSchema.methods.getSignedJwtToken = function () {
  return jwt.sign(
    {
      id: this._id,
      role: this.role,
      email: this.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// Generate password reset token
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = require("crypto").randomBytes(20).toString("hex");

  this.resetPasswordToken = require("crypto")
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

module.exports = mongoose.model("User", userSchema);
