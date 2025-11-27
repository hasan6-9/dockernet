// client/src/api/index.js - Consolidated API Service Layer (Updated with Subscriptions)
import axios from "axios";

// ============================================================================
// BASE CONFIGURATION
// ============================================================================

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Token management (keep your existing implementation)
let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

export const getAuthToken = () => authToken;
export const clearAuthToken = () => {
  authToken = null;
  delete api.defaults.headers.common["Authorization"];
};

// Request/Response interceptors (keep your existing implementation)
api.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    if (process.env.NODE_ENV === "development") {
      console.log(`📤 ${config.method.toUpperCase()} ${config.url}`);
    }
    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `✅ ${response.config.method.toUpperCase()} ${response.config.url}`,
        response.data
      );
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      clearAuthToken();
      window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    if (process.env.NODE_ENV === "development") {
      console.error(
        `❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        {
          status: error.response?.status,
          message: error.response?.data?.message,
          errors: error.response?.data?.errors,
        }
      );
    }

    const transformedError = {
      ...error,
      response: {
        ...error.response,
        data: {
          success: false,
          message: error.response?.data?.message || "An error occurred",
          errors: error.response?.data?.errors || [],
          status: error.response?.status,
        },
      },
    };

    return Promise.reject(transformedError);
  }
);

// ============================================================================
// SUBSCRIPTION API
// ============================================================================
export const subscriptionAPI = {
  // Get all available plans (public)
  getPlans: () => api.get("/subscriptions/plans"),

  // Create checkout session for payment
  createCheckoutSession: (planId, billingCycle = "monthly") =>
    api.post("/subscriptions/create-checkout-session", {
      planId,
      billingCycle,
    }),

  // Get current user's subscription
  getCurrentSubscription: () => api.get("/subscriptions/current"),

  // Cancel active subscription
  cancelSubscription: (reason = "", feedback = "") =>
    api.post("/subscriptions/cancel", {
      reason,
      feedback,
    }),

  // Reactivate canceled subscription
  reactivateSubscription: (planId = null) =>
    api.post("/subscriptions/reactivate", {
      ...(planId && { planId }),
    }),

  // Get update payment method setup intent
  updatePaymentMethod: () => api.post("/subscriptions/update-payment-method"),

  // Get subscription invoices/payment history
  getInvoices: (page = 1, limit = 10) =>
    api.get("/subscriptions/invoices", {
      params: { page, limit },
    }),

  // Upgrade to higher tier plan
  upgradePlan: (targetPlanId) =>
    api.post("/subscriptions/upgrade", {
      targetPlanId,
    }),

  // Downgrade to lower tier plan
  downgradePlan: (targetPlanId) =>
    api.post("/subscriptions/downgrade", {
      targetPlanId,
    }),

  // Track usage of limited features
  trackUsage: (usageType, amount = 1) =>
    api.post("/subscriptions/track-usage", {
      usageType,
      amount,
    }),

  // Check if feature is accessible in current plan
  checkFeatureAccess: (featureName) =>
    api.get(`/subscriptions/feature/${featureName}`),
};

// ============================================================================
// AUTHENTICATION API
// ============================================================================
export const authAPI = {
  register: (userData) => {
    const payload = {
      ...userData,
      medicalLicenseNumber:
        userData.medicalLicenseNumber || userData.licenseNumber,
      primarySpecialty: userData.primarySpecialty || userData.specialty,
    };
    delete payload.licenseNumber;
    delete payload.specialty;
    return api.post("/auth/register", payload);
  },

  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.get("/auth/logout"),
  getMe: () => api.get("/auth/me"),
  checkEmailAvailability: (email) => api.post("/auth/check-email", { email }),
  updateDetails: (userData) => {
    const payload = {
      ...userData,
      medicalLicenseNumber:
        userData.medicalLicenseNumber || userData.licenseNumber,
      primarySpecialty: userData.primarySpecialty || userData.specialty,
    };
    delete payload.licenseNumber;
    delete payload.specialty;
    return api.put("/auth/updatedetails", payload);
  },
  updatePassword: (passwordData) =>
    api.put("/auth/updatepassword", passwordData),
};

// ============================================================================
// PROFILE MANAGEMENT API
// ============================================================================
export const profileAPI = {
  getMyProfile: () => api.get("/profile/me"),
  getMe: () => api.get("/profile/me"),
  getPublicProfile: (identifier) => api.get(`/profile/${identifier}`),
  updateBasic: (profileData) => api.put("/profile/basic", profileData),

  uploadPhoto: (photoFile, onProgress) => {
    const formData = new FormData();
    formData.append("profilePhoto", photoFile);

    return api.post("/profile/photo", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },

  uploadDocuments: (files, documentTypes, onProgress) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("documents", file);
    });

    if (documentTypes && documentTypes.length > 0) {
      documentTypes.forEach((type) => {
        formData.append("documentTypes", type);
      });
    }

    return api.post("/profile/documents", formData, {
      headers: { "Content-Type": "multipart/form-data" },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(percentCompleted);
        }
      },
    });
  },

  deleteDocument: (documentId) =>
    api.delete(`/profile/documents/${documentId}`),

  addExperience: (experienceData) =>
    api.post("/profile/experience", experienceData),
  updateExperience: (experienceId, experienceData) =>
    api.put(`/profile/experience/${experienceId}`, experienceData),
  deleteExperience: (experienceId) =>
    api.delete(`/profile/experience/${experienceId}`),

  updateSkills: (skillsData) => api.put("/profile/skills", skillsData),

  addCertification: (certificationData) =>
    api.post("/profile/certifications", certificationData),
  updateCertification: (certificationId, certificationData) =>
    api.put(`/profile/certifications/${certificationId}`, certificationData),
  deleteCertification: (certificationId) =>
    api.delete(`/profile/certifications/${certificationId}`),

  updateAvailability: (availabilityData) =>
    api.put("/profile/availability", availabilityData),
  updatePrivacy: (privacyData) => api.put("/profile/privacy", privacyData),

  search: (params) => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        queryParams.append(key, value);
      }
    });
    return api.get(`/profile/search?${queryParams.toString()}`);
  },

  getAnalytics: () => api.get("/profile/analytics"),
};

// ============================================================================
// JOB MANAGEMENT API
// ============================================================================

export const jobAPI = {
  create: (jobData) => api.post("/jobs/create", jobData),
  update: (jobId, jobData) => api.put(`/jobs/${jobId}/update`, jobData),
  delete: (jobId) => api.delete(`/jobs/${jobId}`),
  getById: (jobId) => api.get(`/jobs/${jobId}`),

  browse: (params = {}) => api.get("/jobs/browse", { params }),
  search: (params = {}) => api.get("/jobs/search", { params }),
  getMyJobs: (params = {}) => api.get("/jobs/my-jobs", { params }),
  getRecommendations: (params = {}) =>
    api.get("/jobs/recommendations", { params }),

  pause: (jobId) => api.put(`/jobs/${jobId}/pause`),
  activate: (jobId) => api.put(`/jobs/${jobId}/activate`),

  getAnalytics: (jobId) => api.get(`/jobs/${jobId}/analytics`),
  trackView: (jobId) => api.post(`/jobs/${jobId}/view`),

  getApplications: (jobId, params = {}) =>
    api.get(`/jobs/${jobId}/applications`, { params }),

  getCategories: () => api.get("/jobs/categories"),
  getTrending: () => api.get("/jobs/trending"),
  getStatistics: (params = {}) => api.get("/jobs/statistics", { params }),
};

// ============================================================================
// APPLICATION MANAGEMENT API
// ============================================================================

export const applicationAPI = {
  submit: (applicationData) =>
    api.post("/applications/submit", applicationData),

  getMyApplications: (params = {}) =>
    api.get("/applications/my-apps", { params }),
  getReceived: (params = {}) => api.get("/applications/received", { params }),
  getById: (applicationId) => api.get(`/applications/${applicationId}`),

  updateStatus: (applicationId, status) =>
    api.put(`/applications/${applicationId}/status`, { status }),
  withdraw: (applicationId) =>
    api.put(`/applications/${applicationId}/withdraw`),

  sendMessage: (applicationId, content) =>
    api.post(`/applications/${applicationId}/message`, { content }),

  scheduleInterview: (applicationId, interviewData) =>
    api.post(`/applications/${applicationId}/interview`, interviewData),
  accept: (applicationId, contractDetails) =>
    api.put(`/applications/${applicationId}/accept`, { contractDetails }),
  reject: (applicationId, reason) =>
    api.put(`/applications/${applicationId}/reject`, { reason }),

  rate: (applicationId, rating, review) =>
    api.post(`/applications/${applicationId}/rate`, { rating, review }),

  bulkWithdraw: (applicationIds) =>
    api.post("/applications/bulk/withdraw", { applicationIds }),
};

// ============================================================================
// ADMIN API
// ============================================================================

export const adminAPI = {
  getDashboard: () => api.get("/admin/dashboard"),
  getVerificationStats: (timeframe = "30d") =>
    api.get(`/admin/verification/stats?timeframe=${timeframe}`),

  getPendingVerifications: (params = {}) => {
    const queryParams = new URLSearchParams();
    if (params.type) queryParams.append("type", params.type);
    if (params.page) queryParams.append("page", params.page);
    if (params.limit) queryParams.append("limit", params.limit);

    const queryString = queryParams.toString();
    return api.get(
      `/admin/verification/pending${queryString ? `?${queryString}` : ""}`
    );
  },

  getProfileForVerification: (userId) =>
    api.get(`/admin/verification/profile/${userId}`),

  verifyIdentity: (userId, verificationData) =>
    api.put(`/admin/verification/identity/${userId}`, verificationData),
  verifyMedicalLicense: (userId, verificationData) =>
    api.put(`/admin/verification/medical-license/${userId}`, verificationData),
  verifyBackgroundCheck: (userId, verificationData) =>
    api.put(`/admin/verification/background-check/${userId}`, verificationData),

  bulkVerification: (bulkData) => api.put("/admin/verification/bulk", bulkData),
};

// ============================================================================
// MATCHING & RECOMMENDATIONS API
// ============================================================================

export const matchingAPI = {
  calculateScore: (jobId) => api.post(`/matching/calculate/${jobId}`),
  getRecommendations: (params = {}) =>
    api.get("/matching/recommendations", { params }),
  getCandidates: (jobId, params = {}) =>
    api.get(`/matching/candidates/${jobId}`, { params }),
  getAnalytics: (jobId) => api.get(`/matching/analytics/${jobId}`),
  bulkCalculate: (jobIds) => api.post("/matching/bulk", { jobIds }),
};

// ============================================================================
// ERROR HANDLING UTILITIES
// ============================================================================

export const handleApiError = (error) => {
  if (error.response) {
    const { status, data } = error.response;

    const errorMap = {
      400: {
        type: "validation",
        message: data.message || "Please check your input and try again",
        errors: data.errors || [],
      },
      401: {
        type: "auth",
        message: "Please log in to continue",
      },
      403: {
        type: "permission",
        message: "You don't have permission to perform this action",
      },
      404: {
        type: "notfound",
        message: "The requested resource was not found",
      },
      429: {
        type: "ratelimit",
        message: "Too many requests. Please try again later",
      },
      500: {
        type: "server",
        message: "Server error. Please try again later",
      },
    };

    return (
      errorMap[status] || {
        type: "unknown",
        message: data.message || "An unexpected error occurred",
      }
    );
  } else if (error.request) {
    return {
      type: "network",
      message: "Network error. Please check your connection and try again",
    };
  } else {
    return {
      type: "unknown",
      message: error.message || "An unexpected error occurred",
    };
  }
};

// ============================================================================
// FILE VALIDATION UTILITIES
// ============================================================================

export const validateFile = (
  file,
  maxSize = 10 * 1024 * 1024,
  allowedTypes = []
) => {
  const errors = [];

  if (file.size > maxSize) {
    errors.push(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`File type must be one of: ${allowedTypes.join(", ")}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export const validateImage = (file) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const maxSize = 5 * 1024 * 1024;
  return validateFile(file, maxSize, allowedTypes);
};

export const validateDocument = (file) => {
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const maxSize = 10 * 1024 * 1024;
  return validateFile(file, maxSize, allowedTypes);
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const formatters = {
  budget: (job) => {
    const { budget, budgetType } = job;
    if (!budget) return "Negotiable";

    if (budgetType === "hourly") {
      return `$${budget.amount}/hour`;
    } else if (budgetType === "fixed") {
      return `$${budget.amount.toLocaleString()} fixed`;
    }
    return `$${budget.amount?.toLocaleString() || "Negotiable"}`;
  },

  statusColor: (status) => {
    const colors = {
      active: "text-green-600 bg-green-100",
      paused: "text-yellow-600 bg-yellow-100",
      closed: "text-gray-600 bg-gray-100",
      completed: "text-blue-600 bg-blue-100",
      pending: "text-orange-600 bg-orange-100",
      draft: "text-gray-600 bg-gray-100",
      submitted: "text-blue-600 bg-blue-100",
      under_review: "text-purple-600 bg-purple-100",
      accepted: "text-green-600 bg-green-100",
      rejected: "text-red-600 bg-red-100",
      withdrawn: "text-gray-600 bg-gray-100",
    };
    return colors[status] || colors.pending;
  },

  date: (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  },

  daysUntilDeadline: (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const timeDiff = deadlineDate - now;
    const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return days;
  },
};

export default api;
