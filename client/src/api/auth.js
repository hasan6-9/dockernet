import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Include credentials for CORS requests
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => {
    // Transform userData to match backend schema
    const transformedData = {
      ...userData,
      // Ensure correct field names for backend
      medicalLicenseNumber:
        userData.medicalLicenseNumber || userData.licenseNumber,
      primarySpecialty: userData.primarySpecialty || userData.specialty,
    };

    // Remove old field names if they exist
    delete transformedData.licenseNumber;
    delete transformedData.specialty;

    return api.post("/auth/register", transformedData);
  },
  login: (credentials) => api.post("/auth/login", credentials),
  logout: () => api.get("/auth/logout"),
  getMe: () => api.get("/auth/me"),
  updateProfile: (userData) => {
    // Transform userData to match backend schema
    const transformedData = {
      ...userData,
      // Ensure correct field names for backend
      medicalLicenseNumber:
        userData.medicalLicenseNumber || userData.licenseNumber,
      primarySpecialty: userData.primarySpecialty || userData.specialty,
    };

    // Remove old field names if they exist
    delete transformedData.licenseNumber;
    delete transformedData.specialty;

    return api.put("/auth/updatedetails", transformedData);
  },
  updatePassword: (passwordData) =>
    api.put("/auth/updatepassword", passwordData),
};

// Profile Management API
export const profileAPI = {
  // Profile Information
  getMyProfile: () => api.get("/profile/me"),
  getPublicProfile: (identifier) => api.get(`/profile/${identifier}`),
  updateBasicProfile: (profileData) => api.put("/profile/basic", profileData),

  // Photo and Documents
  uploadProfilePhoto: (photoFile) => {
    const formData = new FormData();
    formData.append("photo", photoFile);
    return api.post("/profile/photo", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  uploadDocuments: (files, documentTypes) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append("documents", file);
      if (documentTypes && documentTypes[index]) {
        formData.append("documentTypes", documentTypes[index]);
      }
    });
    return api.post("/profile/documents", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  deleteDocument: (documentId) =>
    api.delete(`/profile/documents/${documentId}`),

  // Experience Management
  addExperience: (experienceData) =>
    api.post("/profile/experience", experienceData),
  updateExperience: (experienceId, experienceData) =>
    api.put(`/profile/experience/${experienceId}`, experienceData),
  deleteExperience: (experienceId) =>
    api.delete(`/profile/experience/${experienceId}`),

  // Skills Management
  updateSkills: (skillsData) => api.put("/profile/skills", skillsData),

  // Certifications
  addCertification: (certificationData) =>
    api.post("/profile/certifications", certificationData),
  updateCertification: (certificationId, certificationData) =>
    api.put(`/profile/certifications/${certificationId}`, certificationData),
  deleteCertification: (certificationId) =>
    api.delete(`/profile/certifications/${certificationId}`),

  // Availability
  updateAvailability: (availabilityData) =>
    api.put("/profile/availability", availabilityData),

  // Privacy Settings
  updatePrivacy: (privacyData) => api.put("/profile/privacy", privacyData),

  // Search and Analytics
  searchProfiles: (searchParams) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value);
      }
    });
    return api.get(`/profile/search?${params.toString()}`);
  },

  getAnalytics: () => api.get("/profile/analytics"),

  // Test endpoints (for development)
  testProfile: () => api.get("/profile/test"),
  testAuth: () => api.get("/profile/test-auth"),
};

// Admin Management API
export const adminAPI = {
  // Dashboard and Stats
  getDashboard: () => api.get("/admin/dashboard"),
  getVerificationStats: (timeframe = "30d") =>
    api.get(`/admin/verification/stats?timeframe=${timeframe}`),

  // Verification Management
  getPendingVerifications: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.type) searchParams.append("type", params.type);
    if (params.page) searchParams.append("page", params.page);
    if (params.limit) searchParams.append("limit", params.limit);

    const queryString = searchParams.toString();
    return api.get(
      `/admin/verification/pending${queryString ? `?${queryString}` : ""}`
    );
  },

  getProfileForVerification: (userId) =>
    api.get(`/admin/verification/profile/${userId}`),

  // Individual Verification Actions
  verifyIdentity: (userId, verificationData) =>
    api.put(`/admin/verification/identity/${userId}`, verificationData),

  verifyMedicalLicense: (userId, verificationData) =>
    api.put(`/admin/verification/medical-license/${userId}`, verificationData),

  verifyBackgroundCheck: (userId, verificationData) =>
    api.put(`/admin/verification/background-check/${userId}`, verificationData),

  // Bulk Operations
  bulkVerification: (bulkData) => api.put("/admin/verification/bulk", bulkData),
};

// Utility functions for API error handling
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    return {
      success: false,
      message: error.response.data?.message || "An error occurred",
      errors: error.response.data?.errors || null,
      status: error.response.status,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      success: false,
      message: "Network error - please check your connection",
      status: null,
    };
  } else {
    // Something else happened
    return {
      success: false,
      message: error.message || "An unexpected error occurred",
      status: null,
    };
  }
};

// Helper function for file uploads with progress
export const uploadWithProgress = (url, formData, onProgress) => {
  return api.post(url, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onProgress(percentCompleted);
      }
    },
  });
};

// Enhanced profile photo upload with progress
export const uploadProfilePhotoWithProgress = (photoFile, onProgress) => {
  const formData = new FormData();
  formData.append("photo", photoFile);
  return uploadWithProgress("/profile/photo", formData, onProgress);
};

// Enhanced document upload with progress
export const uploadDocumentsWithProgress = (
  files,
  documentTypes,
  onProgress
) => {
  const formData = new FormData();
  files.forEach((file, index) => {
    formData.append("documents", file);
    if (documentTypes && documentTypes[index]) {
      formData.append("documentTypes", documentTypes[index]);
    }
  });
  return uploadWithProgress("/profile/documents", formData, onProgress);
};

// Validation helpers
export const validateFileUpload = (
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

// Common validation for images
export const validateImageUpload = (file) => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  return validateFileUpload(file, maxSize, allowedTypes);
};

// Common validation for documents
export const validateDocumentUpload = (file) => {
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];
  const maxSize = 10 * 1024 * 1024; // 10MB

  return validateFileUpload(file, maxSize, allowedTypes);
};

// API response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    // Transform successful responses to include success flag
    return {
      ...response,
      data: {
        success: true,
        ...response.data,
      },
    };
  },
  (error) => {
    // Enhanced error handling
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    // Transform error response
    const transformedError = {
      ...error,
      response: {
        ...error.response,
        data: {
          success: false,
          ...error.response?.data,
        },
      },
    };

    return Promise.reject(transformedError);
  }
);

export default api;
