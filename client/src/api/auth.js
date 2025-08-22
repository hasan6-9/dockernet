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

export default api;
