// client/src/api/jobs.js - Job API Service Layer
import axios from "axios";

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000/api",
  timeout: 10000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Job Management API
export const jobAPI = {
  // Job CRUD operations
  createJob: (jobData) => apiClient.post("/jobs", jobData),

  updateJob: (jobId, jobData) => apiClient.put(`/jobs/${jobId}`, jobData),

  deleteJob: (jobId) => apiClient.delete(`/jobs/${jobId}`),

  getJob: (jobId) => apiClient.get(`/jobs/${jobId}`),

  // Job discovery and browsing
  browseJobs: (params = {}) => apiClient.get("/jobs/browse", { params }),

  searchJobs: (params = {}) => apiClient.get("/jobs/search", { params }),

  getFeaturedJobs: () => apiClient.get("/jobs/featured"),

  getRecommendedJobs: () => apiClient.get("/jobs/recommendations"),

  // Job management for employers
  getMyJobs: (params = {}) => apiClient.get("/jobs/my-jobs", { params }),

  pauseJob: (jobId) => apiClient.put(`/jobs/${jobId}/pause`),

  resumeJob: (jobId) => apiClient.put(`/jobs/${jobId}/resume`),

  closeJob: (jobId) => apiClient.put(`/jobs/${jobId}/close`),

  // Job analytics
  getJobAnalytics: (jobId) => apiClient.get(`/jobs/${jobId}/analytics`),

  trackJobView: (jobId) => apiClient.post(`/jobs/${jobId}/view`),

  // Job interactions
  saveJob: (jobId) => apiClient.post(`/jobs/${jobId}/save`),

  unsaveJob: (jobId) => apiClient.delete(`/jobs/${jobId}/save`),

  getSavedJobs: (params = {}) => apiClient.get("/jobs/saved", { params }),

  reportJob: (jobId, reason) =>
    apiClient.post(`/jobs/${jobId}/report`, { reason }),

  // Bulk operations
  bulkUpdateJobs: (jobIds, action, data = {}) =>
    apiClient.put("/jobs/bulk-update", { jobIds, action, ...data }),
};

// Application Management API
export const applicationAPI = {
  // Application submission
  submitApplication: (applicationData) =>
    apiClient.post("/applications", applicationData),

  // Draft management
  saveDraft: (jobId, draftData) =>
    apiClient.post(`/applications/drafts/${jobId}`, draftData),

  getDraft: (jobId) => apiClient.get(`/applications/drafts/${jobId}`),

  deleteDraft: (jobId) => apiClient.delete(`/applications/drafts/${jobId}`),

  // Application management for applicants
  getMyApplications: (params = {}) =>
    apiClient.get("/applications/my-applications", { params }),

  getApplication: (applicationId) =>
    apiClient.get(`/applications/${applicationId}`),

  withdrawApplication: (applicationId) =>
    apiClient.delete(`/applications/${applicationId}`),

  updateApplication: (applicationId, data) =>
    apiClient.put(`/applications/${applicationId}`, data),

  // Application management for employers
  getReceivedApplications: (params = {}) =>
    apiClient.get("/applications/received", { params }),

  getJobApplications: (jobId, params = {}) =>
    apiClient.get(`/jobs/${jobId}/applications`, { params }),

  updateApplicationStatus: (applicationId, status, notes = "") =>
    apiClient.put(`/applications/${applicationId}/status`, { status, notes }),

  // Communication
  sendMessage: (applicationId, message) =>
    apiClient.post(`/applications/${applicationId}/messages`, { message }),

  getMessages: (applicationId) =>
    apiClient.get(`/applications/${applicationId}/messages`),

  // Ratings and reviews
  rateApplicant: (applicationId, rating, review) =>
    apiClient.post(`/applications/${applicationId}/rate`, { rating, review }),

  rateEmployer: (applicationId, rating, review) =>
    apiClient.post(`/applications/${applicationId}/rate-employer`, {
      rating,
      review,
    }),

  // Bulk operations
  bulkUpdateApplications: (applicationIds, action, data = {}) =>
    apiClient.put("/applications/bulk-update", {
      applicationIds,
      action,
      ...data,
    }),
};

// Matching and Recommendations API
export const matchingAPI = {
  // Get job matches for current user
  getJobMatches: (params = {}) => apiClient.get("/matching/jobs", { params }),

  // Get doctor matches for a job
  getDoctorMatches: (jobId, params = {}) =>
    apiClient.get(`/matching/doctors/${jobId}`, { params }),

  // Calculate match score
  calculateMatchScore: (jobId, userId = null) =>
    apiClient.get(`/matching/score/${jobId}`, { params: { userId } }),

  // Update matching preferences
  updateMatchingPreferences: (preferences) =>
    apiClient.put("/matching/preferences", preferences),

  // Get matching analytics
  getMatchingAnalytics: () => apiClient.get("/matching/analytics"),
};

// Job Categories and Metadata API
export const metadataAPI = {
  // Get available categories and specialties
  getCategories: () => apiClient.get("/jobs/categories"),

  getSpecialties: () => apiClient.get("/jobs/specialties"),

  getSkills: () => apiClient.get("/jobs/skills"),

  // Get market data
  getBudgetRanges: (category, specialty) =>
    apiClient.get("/jobs/budget-ranges", { params: { category, specialty } }),

  getMarketRates: (specialty, experienceLevel) =>
    apiClient.get("/jobs/market-rates", {
      params: { specialty, experienceLevel },
    }),

  // Platform statistics
  getPlatformStats: () => apiClient.get("/jobs/stats"),
};

// Error handling utilities
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;

    switch (status) {
      case 400:
        return {
          type: "validation",
          message: data.message || "Please check your input and try again",
          errors: data.errors || [],
        };
      case 401:
        return {
          type: "auth",
          message: "Please log in to continue",
        };
      case 403:
        return {
          type: "permission",
          message: "You don't have permission to perform this action",
        };
      case 404:
        return {
          type: "notfound",
          message: "The requested resource was not found",
        };
      case 429:
        return {
          type: "ratelimit",
          message: "Too many requests. Please try again later",
        };
      case 500:
        return {
          type: "server",
          message: "Server error. Please try again later",
        };
      default:
        return {
          type: "unknown",
          message: data.message || "An unexpected error occurred",
        };
    }
  } else if (error.request) {
    // Network error
    return {
      type: "network",
      message: "Network error. Please check your connection and try again",
    };
  } else {
    // Other error
    return {
      type: "unknown",
      message: error.message || "An unexpected error occurred",
    };
  }
};

// Utility functions for common operations
export const jobUtils = {
  // Format budget display
  formatBudget: (job) => {
    const { budget, budgetType } = job;
    if (budgetType === "hourly") {
      return `${budget}/hour`;
    } else if (budgetType === "milestone") {
      return `${budget.toLocaleString()} milestone`;
    }
    return `${budget.toLocaleString()} fixed`;
  },

  // Get timeline display text
  getTimelineDisplay: (timeline) => {
    const timelineMap = {
      urgent: "Urgent (24 hours)",
      short: "Short-term (1-7 days)",
      medium: "Medium-term (1-4 weeks)",
      long: "Long-term (1+ months)",
      ongoing: "Ongoing",
    };
    return timelineMap[timeline] || timeline;
  },

  // Get experience level display
  getExperienceLevelDisplay: (level) => {
    const levels = {
      entry: "Entry Level (0-2 years)",
      mid: "Mid Level (3-5 years)",
      senior: "Senior Level (5+ years)",
      expert: "Expert Level (10+ years)",
    };
    return levels[level] || level;
  },

  // Calculate days until deadline
  getDaysUntilDeadline: (deadline) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const timeDiff = deadlineDate - now;
    const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    return days;
  },

  // Get status color
  getStatusColor: (status) => {
    const colors = {
      active: "text-green-600 bg-green-100",
      paused: "text-yellow-600 bg-yellow-100",
      closed: "text-gray-600 bg-gray-100",
      completed: "text-blue-600 bg-blue-100",
      pending: "text-orange-600 bg-orange-100",
    };
    return colors[status] || colors.pending;
  },

  // Get match score color
  getMatchScoreColor: (score) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 80) return "text-blue-600 bg-blue-100";
    if (score >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  },
};

// Export default API client for custom requests
export default apiClient;
