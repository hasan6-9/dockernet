import React, { createContext, useContext, useReducer, useEffect } from "react";
import { authAPI } from "../api/auth";

const AuthContext = createContext();

// Auth states
const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Auth actions
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
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case "LOAD_USER_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case "AUTH_ERROR":
    case "LOGIN_FAIL":
    case "REGISTER_FAIL":
    case "LOGOUT":
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    case "UPDATE_USER":
      localStorage.setItem("user", JSON.stringify(action.payload));
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
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

  // Load user from token
  const loadUser = async () => {
    try {
      dispatch({ type: "AUTH_LOADING" });
      const response = await authAPI.getMe();
      dispatch({ type: "LOAD_USER_SUCCESS", payload: response.data.data });
    } catch (error) {
      dispatch({ type: "AUTH_ERROR", payload: error.response?.data?.message });
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

  // Clear errors
  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  const value = {
    ...state,
    register,
    login,
    logout,
    loadUser,
    updateProfile,
    clearError,
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
