// server/server.js - Updated with Job System Routes and Auto-Admin Creation
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://your-production-domain.com"
        : "http://localhost:3000",
    credentials: true,
  })
);

// Rate limiting with different tiers for different endpoints
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: "Too many requests from this IP, please try again later.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 auth requests per windowMs
  message: {
    success: false,
    message: "Too many authentication attempts, please try again later.",
  },
});

const jobPostingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // limit each IP to 20 job postings per hour
  message: {
    success: false,
    message: "Too many job postings from this IP, please try again later.",
  },
});

const applicationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // limit each IP to 30 applications per hour
  message: {
    success: false,
    message: "Too many applications from this IP, please try again later.",
  },
});

// Apply rate limiting
app.use("/api/", generalLimiter);
app.use("/api/auth/", authLimiter);
app.use("/api/jobs/create", jobPostingLimiter);
app.use("/api/applications/submit", applicationLimiter);

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// MongoDB connection with enhanced options
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    family: 4, // Use IPv4, skip trying IPv6
  })
  .then(async () => {
    console.log("MongoDB connected successfully");
    console.log(`Database: ${mongoose.connection.name}`);

    // ============================================
    // AUTO-CREATE ADMIN USER IF NOT EXISTS
    // ============================================
    try {
      const User = require("./models/User");

      // Check if admin user already exists
      const existingAdmin = await User.findOne({ role: "admin" });

      if (!existingAdmin) {
        console.log("\n🔍 No admin user found. Creating default admin...");

        // Create default admin user
        const adminUser = await User.create({
          firstName: "System",
          lastName: "Admin",
          email: "admin@doconnect.com",
          phone: "+1-000-000-0000", // Required field
          password: "Admin@123", // Will be hashed automatically by pre-save hook
          role: "admin",
          accountStatus: "active",
          medicalLicenseNumber: "ADMIN-000000", // Required field
          licenseState: "System", // Required field
          primarySpecialty: "Administration", // Required field
          yearsOfExperience: 0, // Required field
          medicalSchool: {
            name: "System Administration",
            graduationYear: new Date().getFullYear(),
          },
          verificationStatus: {
            identity: "verified",
            medical_license: "verified",
            background_check: "verified",
            overall: "verified",
          },
        });

        console.log("✅ Default admin user created successfully!");
        console.log("📧 Email: admin@doconnect.com");
        console.log("🔑 Password: Admin@123");
        console.log("⚠️  IMPORTANT: Change this password after first login!\n");
      } else {
        console.log("✅ Admin user already exists.");
      }
    } catch (error) {
      console.error("❌ Error creating admin user:", error.message);
      // Don't exit - let the app continue even if admin creation fails
    }
    // ============================================
  })
  .catch((err) => {
    console.log("MongoDB connection error:", err);
    process.exit(1);
  });

// MongoDB connection event handlers
mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB disconnected");
});

// Handle app termination
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("MongoDB connection closed through app termination");
  process.exit(0);
});

// Health check routes
app.get("/api/health", (req, res) => {
  res.json({
    message: "Dockernet API is running!",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: "1.0.0",
  });
});

app.get("/api/health/db", async (req, res) => {
  try {
    await mongoose.connection.db.admin().ping();
    const stats = await mongoose.connection.db.stats();
    res.json({
      success: true,
      message: "Database connected successfully",
      stats: {
        collections: stats.collections,
        dataSize: stats.dataSize,
        indexSize: stats.indexSize,
        objects: stats.objects,
      },
      connection: {
        host: mongoose.connection.host,
        port: mongoose.connection.port,
        name: mongoose.connection.name,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
    });
  }
});

// API status endpoint
app.get("/api/status", async (req, res) => {
  try {
    const User = require("./models/User");
    const Job = require("./models/Job");
    const Application = require("./models/Application");

    const [totalUsers, activeJobs, totalApplications] = await Promise.all([
      User.countDocuments({ accountStatus: "active" }),
      Job.countDocuments({ status: "active" }),
      Application.countDocuments(),
    ]);

    res.json({
      success: true,
      platform: {
        name: "Dockernet",
        version: "1.0.0",
        environment: process.env.NODE_ENV,
      },
      statistics: {
        totalUsers,
        activeJobs,
        totalApplications,
      },
      features: {
        authentication: "✅ Active",
        profiles: "✅ Active",
        jobs: "✅ Active",
        applications: "✅ Active",
        matching: "✅ Active",
        messaging: "🚧 Coming Soon",
        payments: "🚧 Coming Soon",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching API status",
      error: error.message,
    });
  }
});

// Import routes
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const adminRoutes = require("./routes/admin");
const jobRoutes = require("./routes/jobs");
const applicationRoutes = require("./routes/applications");

// Mount routes with appropriate middleware
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/applications", applicationRoutes);

// 404 handler for API routes
app.all(/^\/api\/.*$/, (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint ${req.originalUrl} not found`,
    availableEndpoints: [
      "/api/health",
      "/api/health/db",
      "/api/status",
      "/api/auth/*",
      "/api/profile/*",
      "/api/admin/*",
      "/api/jobs/*",
      "/api/applications/*",
    ],
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error("Global error handler:", err.stack);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const validationErrors = Object.values(err.errors).map((error) => ({
      field: error.path,
      message: error.message,
    }));

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: validationErrors,
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const fieldMessages = {
      email: "Email address is already registered",
      medicalLicenseNumber: "Medical license number is already registered",
      slug: "This identifier is already taken",
    };

    return res.status(400).json({
      success: false,
      message: fieldMessages[field] || "Duplicate field value",
      field,
    });
  }

  // Mongoose cast error (invalid ObjectId)
  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid ID format",
      field: err.path,
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid authentication token",
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Authentication token has expired",
    });
  }

  // Multer errors (file upload)
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      message: "File too large. Maximum size is 10MB",
    });
  }

  if (err.code === "LIMIT_FILE_COUNT") {
    return res.status(400).json({
      success: false,
      message: "Too many files uploaded",
    });
  }

  // Rate limiting errors
  if (err.status === 429) {
    return res.status(429).json({
      success: false,
      message: "Rate limit exceeded. Please try again later.",
    });
  }

  // Default server error
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && {
      stack: err.stack,
      error: err,
    }),
  });
});

// Graceful shutdown handling
const gracefulShutdown = (signal) => {
  console.log(`Received ${signal}. Starting graceful shutdown...`);

  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });

  server.close(async () => {
    console.log("HTTP server closed");

    try {
      await mongoose.connection.close();
      console.log("MongoDB connection closed");
      process.exit(0);
    } catch (error) {
      console.error("Error during graceful shutdown:", error);
      process.exit(1);
    }
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error(
      "Could not close connections in time, forcefully shutting down"
    );
    process.exit(1);
  }, 10000);
};

// Handle termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle unhandled promise rejections
process.on("unhandledRejection", (err, promise) => {
  console.error("Unhandled Promise Rejection:", err.message);
  console.error("Stack:", err.stack);

  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
  console.error("Stack:", err.stack);

  // Close server & exit process
  process.exit(1);
});

// Start server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log("=================================");
  console.log(`🏥 Dockernet API Server Started`);
  console.log(`📡 Port: ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🗄️  Database: ${mongoose.connection.name}`);
  console.log("=================================");
  console.log("✅ Features Active:");
  console.log("   • Authentication System");
  console.log("   • Enhanced Doctor Profiles");
  console.log("   • Job Posting System");
  console.log("   • Application Management");
  console.log("   • Smart Job Matching");
  console.log("   • Admin Dashboard");
  console.log("=================================");
  console.log(`🚀 API Documentation: http://localhost:${PORT}/api/status`);
  console.log(`💊 Health Check: http://localhost:${PORT}/api/health`);
  console.log("=================================");

  // ✅ Add THIS block here, after server start
  if (app._router && app._router.stack) {
    console.log("📋 Registered API Routes:");
    app._router.stack.forEach((r) => {
      if (r.route && r.route.path) {
        console.log(
          `   ${Object.keys(r.route.methods)[0].toUpperCase()} ${r.route.path}`
        );
      }
    });
    console.log("=================================");
  }
});

// Set server timeout
server.setTimeout(30000); // 30 seconds

module.exports = app;
