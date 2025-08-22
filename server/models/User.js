// server/models/User.js - Enhanced User Model
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const ExperienceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    institution: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      default: null, // null means current position
    },
    current: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    type: {
      type: String,
      enum: ["residency", "fellowship", "employment", "education"],
      required: true,
    },
  },
  { timestamps: true }
);

const CertificationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    issuingOrganization: {
      type: String,
      required: true,
      trim: true,
    },
    issueDate: {
      type: Date,
      required: true,
    },
    expirationDate: {
      type: Date,
    },
    credentialId: {
      type: String,
      trim: true,
    },
    credentialUrl: {
      type: String,
      trim: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const SkillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ["clinical", "research", "administrative", "technical", "other"],
    default: "clinical",
  },
  proficiencyLevel: {
    type: String,
    enum: ["beginner", "intermediate", "advanced", "expert"],
    default: "intermediate",
  },
  yearsOfExperience: {
    type: Number,
    min: 0,
    max: 50,
  },
  verified: {
    type: Boolean,
    default: false,
  },
});

const ReviewSchema = new mongoose.Schema(
  {
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project", // Future implementation
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    categories: {
      communication: { type: Number, min: 1, max: 5 },
      expertise: { type: Number, min: 1, max: 5 },
      reliability: { type: Number, min: 1, max: 5 },
      professionalism: { type: Number, min: 1, max: 5 },
    },
    helpful: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    verified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const AvailabilitySchema = new mongoose.Schema({
  timezone: {
    type: String,
    required: true,
    default: "UTC",
  },
  weeklySchedule: [
    {
      day: {
        type: String,
        enum: [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ],
        required: true,
      },
      available: {
        type: Boolean,
        default: true,
      },
      timeSlots: [
        {
          startTime: { type: String, required: true }, // Format: "09:00"
          endTime: { type: String, required: true }, // Format: "17:00"
        },
      ],
    },
  ],
  blackoutDates: [
    {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      reason: { type: String, trim: true },
    },
  ],
  hoursPerWeek: {
    type: Number,
    min: 0,
    max: 168,
    default: 40,
  },
  responseTime: {
    type: String,
    enum: ["immediate", "within-hour", "within-day", "within-week"],
    default: "within-day",
  },
});

const DocumentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "medical_license",
        "cv_resume",
        "certification",
        "identification",
        "other",
      ],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true, // Cloudinary public ID for deletion
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
      default: false,
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const ProfileAnalyticsSchema = new mongoose.Schema({
  views: {
    total: { type: Number, default: 0 },
    thisMonth: { type: Number, default: 0 },
    thisWeek: { type: Number, default: 0 },
  },
  profileViews: [
    {
      viewer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      viewedAt: {
        type: Date,
        default: Date.now,
      },
      anonymousId: {
        type: String, // For tracking anonymous views
      },
    },
  ],
  searchAppearances: {
    total: { type: Number, default: 0 },
    thisMonth: { type: Number, default: 0 },
  },
  contactAttempts: {
    total: { type: Number, default: 0 },
    thisMonth: { type: Number, default: 0 },
  },
});

const UserSchema = new mongoose.Schema(
  {
    // Basic Information (existing)
    firstName: {
      type: String,
      required: [true, "Please provide first name"],
      trim: true,
      maxlength: [50, "First name cannot be more than 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Please provide last name"],
      trim: true,
      maxlength: [50, "Last name cannot be more than 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Please provide email address"],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    phone: {
      type: String,
      required: [true, "Please provide phone number"],
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Please provide password"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["senior", "junior", "admin"],
      default: "junior",
    },

    // Medical Professional Information (existing + enhanced)
    medicalLicenseNumber: {
      type: String,
      required: [true, "Please provide medical license number"],
      unique: true,
      trim: true,
    },
    licenseState: {
      type: String,
      required: [true, "Please provide license state"],
      trim: true,
    },
    primarySpecialty: {
      type: String,
      required: [true, "Please provide primary specialty"],
      trim: true,
    },
    subspecialties: [
      {
        type: String,
        trim: true,
      },
    ],
    yearsOfExperience: {
      type: Number,
      required: [true, "Please provide years of experience"],
      min: [0, "Years of experience cannot be negative"],
      max: [50, "Years of experience seems too high"],
    },
    medicalSchool: {
      name: {
        type: String,
        required: [true, "Please provide medical school name"],
        trim: true,
      },
      graduationYear: {
        type: Number,
        required: [true, "Please provide graduation year"],
        min: [1950, "Graduation year seems too early"],
        max: [
          new Date().getFullYear(),
          "Graduation year cannot be in the future",
        ],
      },
      location: {
        type: String,
        trim: true,
      },
    },

    // Enhanced Profile Information
    profilePhoto: {
      url: String,
      publicId: String, // Cloudinary public ID
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [2000, "Bio cannot be more than 2000 characters"],
    },
    location: {
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      country: { type: String, trim: true, default: "United States" },
      timezone: { type: String, default: "America/New_York" },
    },
    languages: [
      {
        language: { type: String, required: true },
        proficiency: {
          type: String,
          enum: ["basic", "conversational", "fluent", "native"],
          default: "conversational",
        },
      },
    ],

    // Professional Experience
    experiences: [ExperienceSchema],
    certifications: [CertificationSchema],
    skills: [SkillSchema],

    // Documents and Verification
    documents: [DocumentSchema],
    verificationStatus: {
      identity: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending",
      },
      medical_license: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending",
      },
      background_check: {
        type: String,
        enum: ["pending", "verified", "rejected"],
        default: "pending",
      },
      overall: {
        type: String,
        enum: ["unverified", "partial", "verified"],
        default: "unverified",
      },
    },

    // Ratings and Reviews
    reviews: [ReviewSchema],
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
      breakdown: {
        5: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        1: { type: Number, default: 0 },
      },
      categories: {
        communication: { type: Number, default: 0 },
        expertise: { type: Number, default: 0 },
        reliability: { type: Number, default: 0 },
        professionalism: { type: Number, default: 0 },
      },
    },

    // Availability and Preferences
    availability: AvailabilitySchema,
    preferences: {
      projectTypes: [
        {
          type: String,
          enum: [
            "consultation",
            "second_opinion",
            "chart_review",
            "research",
            "writing",
            "teaching",
            "other",
          ],
        },
      ],
      minimumRate: { type: Number, min: 0 },
      preferredProjectDuration: {
        type: String,
        enum: ["short_term", "medium_term", "long_term", "flexible"],
      },
      remoteOnly: { type: Boolean, default: true },
      maxSimultaneousProjects: { type: Number, default: 3, min: 1, max: 10 },
    },

    // Profile Analytics
    analytics: ProfileAnalyticsSchema,

    // Profile Completion
    profileCompletion: {
      percentage: { type: Number, default: 0, min: 0, max: 100 },
      completedSections: [
        {
          type: String,
          enum: [
            "basic_info",
            "medical_info",
            "profile_photo",
            "bio",
            "experience",
            "skills",
            "certifications",
            "documents",
            "availability",
          ],
        },
      ],
      lastUpdated: { type: Date, default: Date.now },
    },

    // Account Status and Subscription
    accountStatus: {
      type: String,
      enum: ["active", "inactive", "suspended", "pending"],
      default: "pending",
    },
    subscription: {
      plan: {
        type: String,
        enum: ["free", "basic", "premium", "enterprise"],
        default: "free",
      },
      status: {
        type: String,
        enum: ["active", "canceled", "past_due", "trialing"],
        default: "active",
      },
      stripeCustomerId: String,
      currentPeriodEnd: Date,
    },

    // Privacy and Settings
    privacy: {
      profileVisibility: {
        type: String,
        enum: ["public", "members_only", "private"],
        default: "members_only",
      },
      showEmail: { type: Boolean, default: false },
      showPhone: { type: Boolean, default: false },
      allowDirectContact: { type: Boolean, default: true },
      showLastSeen: { type: Boolean, default: true },
    },

    // Activity Tracking
    lastActive: {
      type: Date,
      default: Date.now,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: Date,

    // SEO and Discovery
    slug: {
      type: String,
      unique: true,
      sparse: true,
    },
    featuredProfile: {
      type: Boolean,
      default: false,
    },
    searchKeywords: [String], // Auto-generated from profile data
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ medicalLicenseNumber: 1 });
UserSchema.index({ slug: 1 });
UserSchema.index({ "rating.average": -1 });
UserSchema.index({ "verificationStatus.overall": 1 });
UserSchema.index({ accountStatus: 1 });
UserSchema.index({ primarySpecialty: 1 });
UserSchema.index({ "location.city": 1, "location.state": 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ lastActive: -1 });

// Text search index
UserSchema.index({
  firstName: "text",
  lastName: "text",
  primarySpecialty: "text",
  subspecialties: "text",
  bio: "text",
  "skills.name": "text",
  searchKeywords: "text",
});

// Virtual for full name
UserSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for display name with credentials
UserSchema.virtual("displayName").get(function () {
  const degree = this.role === "senior" ? "MD" : "MD";
  return `Dr. ${this.firstName} ${this.lastName}, ${degree}`;
});

// Virtual for profile completion percentage calculation
UserSchema.virtual("calculatedProfileCompletion").get(function () {
  let completionScore = 0;
  const sections = {
    basic_info:
      this.firstName && this.lastName && this.email && this.phone ? 15 : 0,
    medical_info:
      this.medicalLicenseNumber &&
      this.primarySpecialty &&
      this.medicalSchool.name
        ? 15
        : 0,
    profile_photo: this.profilePhoto && this.profilePhoto.url ? 10 : 0,
    bio: this.bio && this.bio.length > 100 ? 10 : 0,
    experience: this.experiences && this.experiences.length > 0 ? 15 : 0,
    skills: this.skills && this.skills.length >= 3 ? 10 : 0,
    certifications:
      this.certifications && this.certifications.length > 0 ? 10 : 0,
    documents: this.documents && this.documents.length > 0 ? 10 : 0,
    availability: this.availability && this.availability.weeklySchedule ? 5 : 0,
  };

  completionScore = Object.values(sections).reduce(
    (sum, score) => sum + score,
    0
  );
  return Math.min(completionScore, 100);
});

// Pre-save middleware to hash password
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Pre-save middleware to generate slug
UserSchema.pre("save", async function (next) {
  if (
    !this.isModified("firstName") &&
    !this.isModified("lastName") &&
    !this.isModified("primarySpecialty") &&
    this.slug
  ) {
    return next();
  }

  try {
    // SAFETY: Provide defaults for undefined fields
    const first = this.firstName
      ? this.firstName.toLowerCase().replace(/\s+/g, "-")
      : "user";
    const last = this.lastName
      ? this.lastName.toLowerCase().replace(/\s+/g, "-")
      : "unknown";
    const specialty = this.primarySpecialty
      ? this.primarySpecialty.toLowerCase().replace(/\s+/g, "-")
      : "general";

    const baseSlug = `${first}-${last}-${specialty}`;
    let slug = baseSlug;
    let counter = 1;

    // Check for existing slugs and make unique
    while (await this.constructor.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
    next();
  } catch (error) {
    console.error("Error generating slug:", error);
    next(error);
  }
});

// Pre-save middleware to update profile completion
UserSchema.pre("save", function (next) {
  const newPercentage = this.calculatedProfileCompletion;
  if (this.profileCompletion.percentage !== newPercentage) {
    this.profileCompletion.percentage = newPercentage;
    this.profileCompletion.lastUpdated = new Date();
  }
  next();
});

// Method to check password
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const jwt = require("jsonwebtoken");

// Method to sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Method to calculate overall verification status
UserSchema.methods.updateVerificationStatus = function () {
  const statuses = Object.values(this.verificationStatus);
  const verifiedCount = statuses.filter(
    (status) => status === "verified"
  ).length;

  if (verifiedCount === 0) {
    this.verificationStatus.overall = "unverified";
  } else if (verifiedCount < statuses.length - 1) {
    // -1 to exclude 'overall'
    this.verificationStatus.overall = "partial";
  } else {
    this.verificationStatus.overall = "verified";
  }
};

// Method to add profile view
UserSchema.methods.addProfileView = async function (
  viewer = null,
  anonymousId = null
) {
  // Don't count self-views
  if (viewer && viewer.toString() === this._id.toString()) {
    return;
  }

  // Don't count duplicate views from same user within 24 hours
  if (viewer) {
    const recentView = this.analytics.profileViews.find(
      (view) =>
        view.viewer &&
        view.viewer.toString() === viewer.toString() &&
        view.viewedAt > new Date(Date.now() - 24 * 60 * 60 * 1000)
    );
    if (recentView) return;
  }

  this.analytics.profileViews.push({
    viewer,
    anonymousId,
    viewedAt: new Date(),
  });

  this.analytics.views.total += 1;
  this.analytics.views.thisMonth += 1;
  this.analytics.views.thisWeek += 1;

  await this.save();
};

// Method to update rating
UserSchema.methods.updateRating = function () {
  if (this.reviews.length === 0) {
    this.rating = {
      average: 0,
      count: 0,
      breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      categories: {
        communication: 0,
        expertise: 0,
        reliability: 0,
        professionalism: 0,
      },
    };
    return;
  }

  const ratings = this.reviews.map((review) => review.rating);
  const average =
    ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;

  // Calculate breakdown
  const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  ratings.forEach((rating) => {
    breakdown[rating] += 1;
  });

  // Calculate category averages
  const categories = {
    communication: 0,
    expertise: 0,
    reliability: 0,
    professionalism: 0,
  };
  const reviewsWithCategories = this.reviews.filter(
    (review) => review.categories
  );

  if (reviewsWithCategories.length > 0) {
    Object.keys(categories).forEach((category) => {
      const categoryRatings = reviewsWithCategories
        .map((review) => review.categories[category])
        .filter((rating) => rating !== undefined);

      if (categoryRatings.length > 0) {
        categories[category] =
          categoryRatings.reduce((sum, rating) => sum + rating, 0) /
          categoryRatings.length;
      }
    });
  }

  this.rating = {
    average: Math.round(average * 10) / 10, // Round to 1 decimal place
    count: this.reviews.length,
    breakdown,
    categories,
  };
};

// Static method to find verified doctors
UserSchema.statics.findVerified = function () {
  return this.find({
    "verificationStatus.overall": "verified",
    accountStatus: "active",
  });
};

// Static method for search with filters
UserSchema.statics.searchDoctors = function (searchTerm, filters = {}) {
  let query = { accountStatus: "active" };

  if (searchTerm) {
    query.$text = { $search: searchTerm };
  }

  if (filters.specialty) {
    query.$or = [
      { primarySpecialty: { $regex: filters.primarySpecialty, $options: "i" } },
      { subspecialties: { $regex: filters.primarySpecialty, $options: "i" } },
    ];
  }

  if (filters.experience) {
    query.yearsOfExperience = { $gte: filters.experience };
  }

  if (filters.rating) {
    query["rating.average"] = { $gte: filters.rating };
  }

  if (filters.location) {
    query.$or = [
      { "location.city": { $regex: filters.location, $options: "i" } },
      { "location.state": { $regex: filters.location, $options: "i" } },
    ];
  }

  if (filters.verified) {
    query["verificationStatus.overall"] = "verified";
  }

  let sortOptions = {};
  if (searchTerm) {
    sortOptions.score = { $meta: "textScore" };
  }
  if (filters.sortBy === "rating") {
    sortOptions["rating.average"] = -1;
  } else if (filters.sortBy === "experience") {
    sortOptions.yearsOfExperience = -1;
  } else if (filters.sortBy === "recent") {
    sortOptions.createdAt = -1;
  }

  return this.find(query).sort(sortOptions);
};

module.exports = mongoose.model("User", UserSchema);
