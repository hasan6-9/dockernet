// server/controllers/adminController.js - Admin Profile Verification System
const User = require("../models/User");
const { validationResult } = require("express-validator");

// @desc    Get all profiles pending verification
// @route   GET /api/admin/verification/pending
// @access  Private/Admin
exports.getPendingVerifications = async (req, res) => {
  try {
    const {
      type = "all", // 'all', 'identity', 'medical_license', 'background_check'
      page = 1,
      limit = 20,
    } = req.query;

    let query = { accountStatus: { $in: ["active", "pending"] } };

    // Filter by verification type
    if (type !== "all") {
      query[`verificationStatus.${type}`] = "pending";
    } else {
      query.$or = [
        { "verificationStatus.identity": "pending" },
        { "verificationStatus.medical_license": "pending" },
        { "verificationStatus.background_check": "pending" },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const profiles = await User.find(query)
      .select(
        "firstName lastName email profilePhoto verificationStatus documents createdAt primarySpecialty medicalLicenseNumber licenseState"
      )
      .populate("documents")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      data: profiles,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching pending verifications:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching pending verifications",
    });
  }
};

// @desc    Get detailed profile for verification
// @route   GET /api/admin/verification/profile/:userId
// @access  Private/Admin
exports.getProfileForVerification = async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await User.findById(userId)
      .select("-password")
      .populate("documents")
      .populate("reviews.reviewer", "firstName lastName profilePhoto");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // Include verification history if needed (future enhancement)
    const verificationData = {
      profile,
      verificationHistory: [], // Placeholder for future implementation
      riskFactors: await calculateRiskFactors(profile),
      recommendations: generateVerificationRecommendations(profile),
    };

    res.status(200).json({
      success: true,
      data: verificationData,
    });
  } catch (error) {
    console.error("Error fetching profile for verification:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching profile for verification",
    });
  }
};

// @desc    Verify user identity
// @route   PUT /api/admin/verification/identity/:userId
// @access  Private/Admin
exports.verifyIdentity = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors.array(),
      });
    }

    const { userId } = req.params;
    const { status, notes, documentIds } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update verification status
    user.verificationStatus.identity = status;

    // Update document verification status
    if (documentIds && documentIds.length > 0) {
      documentIds.forEach((docId) => {
        const document = user.documents.id(docId);
        if (document) {
          document.verified = status === "verified";
          document.verifiedBy = req.user.id;
          document.verifiedAt = new Date();
          if (status === "rejected" && notes) {
            document.rejectionReason = notes;
          }
        }
      });
    }

    // Update overall verification status
    user.updateVerificationStatus();

    // Add verification note/history (future enhancement)
    // user.verificationHistory.push({
    //   type: 'identity',
    //   status,
    //   verifiedBy: req.user.id,
    //   notes,
    //   verifiedAt: new Date()
    // });

    await user.save();

    // Send notification to user (future enhancement)
    // await sendVerificationNotification(user, 'identity', status);

    res.status(200).json({
      success: true,
      message: `Identity verification ${status} successfully`,
      data: {
        verificationStatus: user.verificationStatus,
        overallStatus: user.verificationStatus.overall,
      },
    });
  } catch (error) {
    console.error("Error verifying identity:", error);
    res.status(500).json({
      success: false,
      message: "Server error while verifying identity",
    });
  }
};

// @desc    Verify medical license
// @route   PUT /api/admin/verification/medical-license/:userId
// @access  Private/Admin
exports.verifyMedicalLicense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors.array(),
      });
    }

    const { userId } = req.params;
    const { status, notes, licenseVerified, documentIds } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update verification status
    user.verificationStatus.medical_license = status;

    // Update document verification status for medical license documents
    if (documentIds && documentIds.length > 0) {
      documentIds.forEach((docId) => {
        const document = user.documents.id(docId);
        if (document && document.type === "medical_license") {
          document.verified = status === "verified";
          document.verifiedBy = req.user.id;
          document.verifiedAt = new Date();
          if (status === "rejected" && notes) {
            document.rejectionReason = notes;
          }
        }
      });
    }

    // Update overall verification status
    user.updateVerificationStatus();

    await user.save();

    res.status(200).json({
      success: true,
      message: `Medical license verification ${status} successfully`,
      data: {
        verificationStatus: user.verificationStatus,
        overallStatus: user.verificationStatus.overall,
      },
    });
  } catch (error) {
    console.error("Error verifying medical license:", error);
    res.status(500).json({
      success: false,
      message: "Server error while verifying medical license",
    });
  }
};

// @desc    Verify background check
// @route   PUT /api/admin/verification/background-check/:userId
// @access  Private/Admin
exports.verifyBackgroundCheck = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors.array(),
      });
    }

    const { userId } = req.params;
    const { status, notes, backgroundCheckPassed } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update verification status
    user.verificationStatus.background_check = status;

    // Update overall verification status
    user.updateVerificationStatus();

    await user.save();

    res.status(200).json({
      success: true,
      message: `Background check verification ${status} successfully`,
      data: {
        verificationStatus: user.verificationStatus,
        overallStatus: user.verificationStatus.overall,
      },
    });
  } catch (error) {
    console.error("Error verifying background check:", error);
    res.status(500).json({
      success: false,
      message: "Server error while verifying background check",
    });
  }
};

// @desc    Bulk verification action
// @route   PUT /api/admin/verification/bulk
// @access  Private/Admin
exports.bulkVerification = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: errors.array(),
      });
    }

    const { userIds, verificationType, status, notes } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "User IDs array is required",
      });
    }

    const updateQuery = {};
    updateQuery[`verificationStatus.${verificationType}`] = status;

    const result = await User.updateMany(
      { _id: { $in: userIds } },
      updateQuery
    );

    // Update overall verification status for each user
    const users = await User.find({ _id: { $in: userIds } });
    const updatePromises = users.map(async (user) => {
      user.updateVerificationStatus();
      return user.save();
    });

    await Promise.all(updatePromises);

    res.status(200).json({
      success: true,
      message: `Bulk verification completed for ${result.modifiedCount} users`,
      data: {
        modifiedCount: result.modifiedCount,
        requestedCount: userIds.length,
      },
    });
  } catch (error) {
    console.error("Error performing bulk verification:", error);
    res.status(500).json({
      success: false,
      message: "Server error while performing bulk verification",
    });
  }
};

// @desc    Get verification statistics
// @route   GET /api/admin/verification/stats
// @access  Private/Admin
exports.getVerificationStats = async (req, res) => {
  try {
    const { timeframe = "30d" } = req.query;

    let dateFilter = {};
    if (timeframe === "7d") {
      dateFilter = {
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      };
    } else if (timeframe === "30d") {
      dateFilter = {
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      };
    } else if (timeframe === "90d") {
      dateFilter = {
        createdAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
      };
    }

    // Overall statistics
    const totalUsers = await User.countDocuments({
      accountStatus: { $in: ["active", "pending"] },
    });
    const verifiedUsers = await User.countDocuments({
      "verificationStatus.overall": "verified",
    });
    const partiallyVerified = await User.countDocuments({
      "verificationStatus.overall": "partial",
    });
    const unverified = await User.countDocuments({
      "verificationStatus.overall": "unverified",
    });

    // Pending verifications
    const pendingIdentity = await User.countDocuments({
      "verificationStatus.identity": "pending",
    });
    const pendingMedicalLicense = await User.countDocuments({
      "verificationStatus.medical_license": "pending",
    });
    const pendingBackgroundCheck = await User.countDocuments({
      "verificationStatus.background_check": "pending",
    });

    // Recent activity
    const recentUsers = await User.countDocuments(dateFilter);
    const recentVerified = await User.countDocuments({
      ...dateFilter,
      "verificationStatus.overall": "verified",
    });

    // Specialties breakdown
    const specialtiesData = await User.aggregate([
      { $match: { accountStatus: { $in: ["active", "pending"] } } },
      { $group: { _id: "$primarySpecialty", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    const stats = {
      overview: {
        totalUsers,
        verifiedUsers,
        partiallyVerified,
        unverified,
        verificationRate:
          totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(1) : 0,
      },
      pending: {
        identity: pendingIdentity,
        medicalLicense: pendingMedicalLicense,
        backgroundCheck: pendingBackgroundCheck,
        total: pendingIdentity + pendingMedicalLicense + pendingBackgroundCheck,
      },
      recent: {
        newUsers: recentUsers,
        newVerified: recentVerified,
        timeframe,
      },
      specialties: specialtiesData,
      averageVerificationTime: "2.5 days", // Placeholder for future calculation
      topRejectionReasons: [
        // Placeholder for future implementation
        "Incomplete documentation",
        "License verification failed",
        "Identity mismatch",
      ],
    };

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching verification stats:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching verification stats",
    });
  }
};

// @desc    Get admin dashboard data
// @route   GET /api/admin/dashboard
// @access  Private/Admin
exports.getAdminDashboard = async (req, res) => {
  try {
    // Get key metrics
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ accountStatus: "active" });
    const pendingUsers = await User.countDocuments({
      accountStatus: "pending",
    });

    const seniorDoctors = await User.countDocuments({
      role: "senior",
      accountStatus: "active",
    });
    const juniorDoctors = await User.countDocuments({
      role: "junior",
      accountStatus: "active",
    });

    const fullyVerified = await User.countDocuments({
      "verificationStatus.overall": "verified",
    });
    const pendingVerification = await User.countDocuments({
      "verificationStatus.overall": { $in: ["unverified", "partial"] },
    });

    // Recent activity (last 7 days)
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newUsers = await User.countDocuments({
      createdAt: { $gte: last7Days },
    });
    const recentlyVerified = await User.countDocuments({
      "verificationStatus.overall": "verified",
      updatedAt: { $gte: last7Days },
    });

    // Top specialties
    const topSpecialties = await User.aggregate([
      { $match: { accountStatus: "active" } },
      { $group: { _id: "$primarySpecialty", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]);

    // Users requiring attention
    const usersNeedingAttention = await User.find({
      $or: [
        { "verificationStatus.identity": "pending" },
        { "verificationStatus.medical_license": "pending" },
        { "verificationStatus.background_check": "pending" },
        { accountStatus: "pending" },
      ],
    })
      .select(
        "firstName lastName email verificationStatus accountStatus createdAt"
      )
      .sort({ createdAt: -1 })
      .limit(10);

    const dashboardData = {
      metrics: {
        users: {
          total: totalUsers,
          active: activeUsers,
          pending: pendingUsers,
        },
        doctors: {
          senior: seniorDoctors,
          junior: juniorDoctors,
        },
        verification: {
          verified: fullyVerified,
          pending: pendingVerification,
          rate:
            totalUsers > 0
              ? ((fullyVerified / totalUsers) * 100).toFixed(1)
              : 0,
        },
        activity: {
          newUsers,
          recentlyVerified,
        },
      },
      topSpecialties,
      usersNeedingAttention,
      quickActions: [
        {
          label: "Pending Identity Verification",
          count: await User.countDocuments({
            "verificationStatus.identity": "pending",
          }),
          url: "/admin/verification?type=identity",
        },
        {
          label: "Pending License Verification",
          count: await User.countDocuments({
            "verificationStatus.medical_license": "pending",
          }),
          url: "/admin/verification?type=medical_license",
        },
        {
          label: "Incomplete Profiles",
          count: await User.countDocuments({
            "profileCompletion.percentage": { $lt: 70 },
          }),
          url: "/admin/users?filter=incomplete",
        },
      ],
    };

    res.status(200).json({
      success: true,
      data: dashboardData,
    });
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching admin dashboard",
    });
  }
};

// Helper function to calculate risk factors
const calculateRiskFactors = async (profile) => {
  const riskFactors = [];

  // Check for incomplete profile
  if (profile.profileCompletion.percentage < 50) {
    riskFactors.push({
      type: "incomplete_profile",
      severity: "medium",
      description: "Profile is less than 50% complete",
    });
  }

  // Check for missing documents
  if (!profile.documents || profile.documents.length === 0) {
    riskFactors.push({
      type: "no_documents",
      severity: "high",
      description: "No verification documents uploaded",
    });
  }

  // Check for suspicious activity patterns
  if (profile.loginAttempts > 5) {
    riskFactors.push({
      type: "high_failed_logins",
      severity: "high",
      description: "High number of failed login attempts",
    });
  }

  // Check account age
  const accountAge = Date.now() - profile.createdAt.getTime();
  const daysOld = accountAge / (24 * 60 * 60 * 1000);

  if (daysOld < 1) {
    riskFactors.push({
      type: "new_account",
      severity: "low",
      description: "Account created very recently",
    });
  }

  return riskFactors;
};

// Helper function to generate verification recommendations
const generateVerificationRecommendations = (profile) => {
  const recommendations = [];

  // Document-based recommendations
  const licenseDoc = profile.documents.find(
    (doc) => doc.type === "medical_license"
  );
  if (!licenseDoc) {
    recommendations.push("Request medical license documentation");
  } else if (!licenseDoc.verified) {
    recommendations.push(
      "Verify medical license document against state registry"
    );
  }

  const idDoc = profile.documents.find((doc) => doc.type === "identification");
  if (!idDoc) {
    recommendations.push("Request government-issued identification");
  }

  // Profile completeness recommendations
  if (profile.profileCompletion.percentage < 70) {
    recommendations.push("Encourage profile completion before verification");
  }

  // Experience verification
  if (!profile.experiences || profile.experiences.length === 0) {
    recommendations.push("Request professional experience documentation");
  }

  return recommendations;
};

module.exports = {
  getPendingVerifications: exports.getPendingVerifications,
  getProfileForVerification: exports.getProfileForVerification,
  verifyIdentity: exports.verifyIdentity,
  verifyMedicalLicense: exports.verifyMedicalLicense,
  verifyBackgroundCheck: exports.verifyBackgroundCheck,
  bulkVerification: exports.bulkVerification,
  getVerificationStats: exports.getVerificationStats,
  getAdminDashboard: exports.getAdminDashboard,
};
