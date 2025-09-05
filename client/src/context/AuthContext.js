import React, { createContext, useContext, useReducer, useEffect } from "react";
import { authAPI } from "../api/auth";

const AuthContext = createContext();

// Enhanced initial state with new user model fields
const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  loading: true,
  error: null,

  // Account status tracking
  accountStatus: null, // pending, active, inactive, suspended
  verificationStatus: {
    identity: "pending",
    medical_license: "pending",
    background_check: "pending",
    overall: "unverified",
  },

  // Profile completion
  profileCompletion: {
    percentage: 0,
    completedSections: [],
    lastUpdated: null,
  },

  // User role and permissions
  role: "junior", // senior, junior, admin
  permissions: {
    canAccessBasicFeatures: false,
    canAccessActiveFeatures: false,
    canAccessProfessionalFeatures: false,
    canAccessPremiumFeatures: false,
    canAccessAdminFeatures: false,
  },

  // Profile analytics
  profileAnalytics: {
    views: { total: 0, thisMonth: 0, thisWeek: 0 },
    searchAppearances: { total: 0, thisMonth: 0 },
    contactAttempts: { total: 0, thisMonth: 0 },
  },
};

// Enhanced auth reducer with new actions
const authReducer = (state, action) => {
  switch (action.type) {
    case "AUTH_LOADING":
      return {
        ...state,
        loading: true,
        error: null,
      };

    case "LOGIN_SUCCESS":
    case "REGISTER_SUCCESS":
      const userData = action.payload.user;
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(userData));

      return {
        ...state,
        user: userData,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
        accountStatus: userData.accountStatus,
        verificationStatus:
          userData.verificationStatus || state.verificationStatus,
        profileCompletion:
          userData.profileCompletion || state.profileCompletion,
        role: userData.role,
        permissions: calculatePermissions(userData),
        profileAnalytics: userData.analytics || state.profileAnalytics,
      };

    case "LOAD_USER_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
        accountStatus: action.payload.accountStatus,
        verificationStatus:
          action.payload.verificationStatus || state.verificationStatus,
        profileCompletion:
          action.payload.profileCompletion || state.profileCompletion,
        role: action.payload.role,
        permissions: calculatePermissions(action.payload),
        profileAnalytics: action.payload.analytics || state.profileAnalytics,
      };

    case "UPDATE_USER":
      const updatedUser = action.payload;
      localStorage.setItem("user", JSON.stringify(updatedUser));

      return {
        ...state,
        user: updatedUser,
        accountStatus: updatedUser.accountStatus,
        verificationStatus:
          updatedUser.verificationStatus || state.verificationStatus,
        profileCompletion:
          updatedUser.profileCompletion || state.profileCompletion,
        role: updatedUser.role,
        permissions: calculatePermissions(updatedUser),
        profileAnalytics: updatedUser.analytics || state.profileAnalytics,
      };

    case "UPDATE_PROFILE_COMPLETION":
      return {
        ...state,
        profileCompletion: {
          ...state.profileCompletion,
          ...action.payload,
        },
      };

    case "UPDATE_VERIFICATION_STATUS":
      const newVerificationStatus = {
        ...state.verificationStatus,
        ...action.payload,
      };

      return {
        ...state,
        verificationStatus: newVerificationStatus,
        permissions: calculatePermissions({
          ...state.user,
          verificationStatus: newVerificationStatus,
        }),
      };

    case "UPDATE_ACCOUNT_STATUS":
      return {
        ...state,
        accountStatus: action.payload,
        permissions: calculatePermissions({
          ...state.user,
          accountStatus: action.payload,
        }),
      };

    case "UPDATE_ANALYTICS":
      return {
        ...state,
        profileAnalytics: {
          ...state.profileAnalytics,
          ...action.payload,
        },
      };

    case "AUTH_ERROR":
    case "LOGIN_FAIL":
    case "REGISTER_FAIL":
    case "LOGOUT":
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      return {
        ...initialState,
        loading: false,
        error: action.payload,
        token: null,
        isAuthenticated: false,
      };

    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };

    case "REFRESH_PERMISSIONS":
      return {
        ...state,
        permissions: calculatePermissions(state.user),
      };

    default:
      return state;
  }
};

// Calculate user permissions based on account status, verification, and role
const calculatePermissions = (user) => {
  if (!user) return initialState.permissions;

  const accountStatus = user.accountStatus;
  const verificationStatus = user.verificationStatus || {};
  const role = user.role;
  const subscription = user.subscription || {};

  return {
    // Basic features: authenticated users (pending + active)
    canAccessBasicFeatures:
      accountStatus === "pending" || accountStatus === "active",

    // Active features: active account status only
    canAccessActiveFeatures: accountStatus === "active",

    // Professional features: verified professional account
    canAccessProfessionalFeatures:
      accountStatus === "active" &&
      (verificationStatus.overall === "verified" ||
        verificationStatus.overall === "partial"),

    // Premium features: active subscription
    canAccessPremiumFeatures:
      accountStatus === "active" &&
      subscription.status === "active" &&
      subscription.plan !== "free",

    // Admin features: admin role
    canAccessAdminFeatures: role === "admin" && accountStatus === "active",
  };
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user on app start
  useEffect(() => {
    if (state.token) {
      loadUser();
    } else {
      dispatch({ type: "AUTH_ERROR", payload: null });
    }
  }, []);

  // Auto-refresh user data periodically for status updates
  useEffect(() => {
    if (state.isAuthenticated && state.token) {
      const interval = setInterval(() => {
        loadUser(true); // Silent refresh
      }, 5 * 60 * 1000); // Every 5 minutes

      return () => clearInterval(interval);
    }
  }, [state.isAuthenticated, state.token]);

  // Load user from token
  const loadUser = async (silent = false) => {
    try {
      if (!silent) {
        dispatch({ type: "AUTH_LOADING" });
      }

      const response = await authAPI.getMe();
      dispatch({ type: "LOAD_USER_SUCCESS", payload: response.data.data });
    } catch (error) {
      console.error("Load user error:", error);
      if (!silent) {
        dispatch({
          type: "AUTH_ERROR",
          payload: error.response?.data?.message,
        });
      }
    }
  };

  // Register user
  const register = async (userData) => {
    try {
      dispatch({ type: "AUTH_LOADING" });
      const response = await authAPI.register(userData);

      dispatch({
        type: "REGISTER_SUCCESS",
        payload: {
          token: response.data.token,
          user: response.data.data,
        },
      });

      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      dispatch({ type: "REGISTER_FAIL", payload: message });
      return { success: false, message };
    }
  };

  // Login user
  const login = async (credentials) => {
    try {
      dispatch({ type: "AUTH_LOADING" });
      const response = await authAPI.login(credentials);

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: {
          token: response.data.token,
          user: response.data.data,
        },
      });

      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      dispatch({ type: "LOGIN_FAIL", payload: message });
      return { success: false, message };
    }
  };

  // Logout user
  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch({ type: "LOGOUT" });
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      const response = await authAPI.updateProfile(userData);
      dispatch({ type: "UPDATE_USER", payload: response.data.data });
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || "Update failed";
      return { success: false, message };
    }
  };

  // Update specific profile sections
  const updateProfileSection = async (section, data) => {
    try {
      const response = await authAPI.updateProfileSection(section, data);
      dispatch({ type: "UPDATE_USER", payload: response.data.data });
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || "Update failed";
      return { success: false, message };
    }
  };

  // Upload documents
  const uploadDocument = async (documentData) => {
    try {
      const response = await authAPI.uploadDocument(documentData);
      dispatch({ type: "UPDATE_USER", payload: response.data.data });
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || "Upload failed";
      return { success: false, message };
    }
  };

  // Update profile photo
  const updateProfilePhoto = async (photoData) => {
    try {
      const response = await authAPI.updateProfilePhoto(photoData);
      dispatch({ type: "UPDATE_USER", payload: response.data.data });
      return { success: true, message: response.data.message };
    } catch (error) {
      const message = error.response?.data?.message || "Photo upload failed";
      return { success: false, message };
    }
  };

  // Track profile completion
  const updateProfileCompletion = (completionData) => {
    dispatch({ type: "UPDATE_PROFILE_COMPLETION", payload: completionData });
  };

  // Update verification status (typically called after document review)
  const updateVerificationStatus = (statusUpdates) => {
    dispatch({ type: "UPDATE_VERIFICATION_STATUS", payload: statusUpdates });
  };

  // Update account status
  const updateAccountStatus = (status) => {
    dispatch({ type: "UPDATE_ACCOUNT_STATUS", payload: status });
  };

  // Track profile analytics
  const trackProfileView = async (viewerId = null) => {
    try {
      await authAPI.trackProfileView(viewerId);
      // Update local analytics
      dispatch({
        type: "UPDATE_ANALYTICS",
        payload: {
          views: {
            ...state.profileAnalytics.views,
            total: state.profileAnalytics.views.total + 1,
          },
        },
      });
    } catch (error) {
      console.error("Error tracking profile view:", error);
    }
  };

  // Get profile analytics
  const getProfileAnalytics = async () => {
    try {
      const response = await authAPI.getProfileAnalytics();
      dispatch({ type: "UPDATE_ANALYTICS", payload: response.data.data });
      return response.data.data;
    } catch (error) {
      console.error("Error getting profile analytics:", error);
      return null;
    }
  };

  // Permission check helpers
  const hasPermission = (permission) => {
    return state.permissions[permission] || false;
  };

  const canAccessRoute = (routeLevel) => {
    switch (routeLevel) {
      case "basic":
        return hasPermission("canAccessBasicFeatures");
      case "active":
        return hasPermission("canAccessActiveFeatures");
      case "professional":
        return hasPermission("canAccessProfessionalFeatures");
      case "premium":
        return hasPermission("canAccessPremiumFeatures");
      case "admin":
        return hasPermission("canAccessAdminFeatures");
      default:
        return false;
    }
  };

  // Account status helpers
  const isAccountPending = () => state.accountStatus === "pending";
  const isAccountActive = () => state.accountStatus === "active";
  const isAccountInactive = () => state.accountStatus === "inactive";
  const isAccountSuspended = () => state.accountStatus === "suspended";

  // Verification status helpers
  const isIdentityVerified = () =>
    state.verificationStatus.identity === "verified";
  const isMedicalLicenseVerified = () =>
    state.verificationStatus.medical_license === "verified";
  const isBackgroundCheckVerified = () =>
    state.verificationStatus.background_check === "verified";
  const isFullyVerified = () => state.verificationStatus.overall === "verified";
  const isPartiallyVerified = () =>
    state.verificationStatus.overall === "partial";

  // Profile completion helpers
  const getProfileCompletionPercentage = () =>
    state.profileCompletion.percentage;
  const isProfileComplete = () => state.profileCompletion.percentage >= 80;
  const getMissingProfileSections = () => {
    const allSections = [
      "basic_info",
      "medical_info",
      "profile_photo",
      "bio",
      "experience",
      "skills",
      "certifications",
      "documents",
      "availability",
    ];
    return allSections.filter(
      (section) => !state.profileCompletion.completedSections.includes(section)
    );
  };

  // Role helpers
  const isAdmin = () => state.role === "admin";
  const isSenior = () => state.role === "senior";
  const isJunior = () => state.role === "junior";

  // Clear errors
  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  // Refresh permissions (useful after profile updates)
  const refreshPermissions = () => {
    dispatch({ type: "REFRESH_PERMISSIONS" });
  };

  const value = {
    // State
    ...state,

    // Core auth methods
    register,
    login,
    logout,
    loadUser,
    updateProfile,
    updateProfileSection,
    uploadDocument,
    updateProfilePhoto,
    clearError,

    // Profile management
    updateProfileCompletion,
    updateVerificationStatus,
    updateAccountStatus,
    refreshPermissions,

    // Analytics
    trackProfileView,
    getProfileAnalytics,

    // Permission helpers
    hasPermission,
    canAccessRoute,

    // Account status helpers
    isAccountPending,
    isAccountActive,
    isAccountInactive,
    isAccountSuspended,

    // Verification helpers
    isIdentityVerified,
    isMedicalLicenseVerified,
    isBackgroundCheckVerified,
    isFullyVerified,
    isPartiallyVerified,

    // Profile completion helpers
    getProfileCompletionPercentage,
    isProfileComplete,
    getMissingProfileSections,

    // Role helpers
    isAdmin,
    isSenior,
    isJunior,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Higher-order component for route protection
export const withAuth = (WrappedComponent, requiredPermission) => {
  return (props) => {
    const auth = useAuth();

    if (!auth.isAuthenticated) {
      return <div>Please log in to access this page.</div>;
    }

    if (requiredPermission && !auth.canAccessRoute(requiredPermission)) {
      return <div>You don't have permission to access this page.</div>;
    }

    return <WrappedComponent {...props} />;
  };
};
