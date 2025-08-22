import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Import pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile"; // Keep for backward compatibility if needed
import EnhancedProfile from "./pages/EnhancedProfile";
import DoctorSearch from "./pages/DoctorSearch";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Public Doctor Search - Allow non-authenticated users to browse */}
            <Route path="/search" element={<DoctorSearch />} />

            {/* Protected Routes - Require Authentication */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            {/* Enhanced Profile - Protected and replaces old profile */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <EnhancedProfile />
                </ProtectedRoute>
              }
            />

            {/* Legacy Profile Route - Redirect to enhanced profile */}
            <Route
              path="/profile/legacy"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Role-Based Protected Routes */}

            {/* Admin Dashboard - Admin Only */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Admin Routes - All require admin role */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute roles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Future Protected Routes */}
            <Route
              path="/jobs"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gradient-to-br from-trust-50 to-medical-50 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-medical rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 00-2 2h-4a2 2 0 00-2-2V4"
                          />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-trust-900 mb-2">
                        Job System Coming Soon
                      </h2>
                      <p className="text-trust-600">
                        Advanced job posting and application system is in
                        development.
                      </p>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />

            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <div className="min-h-screen bg-gradient-to-br from-trust-50 to-medical-50 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gradient-to-r from-accent-500 to-accent-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                      </div>
                      <h2 className="text-2xl font-bold text-trust-900 mb-2">
                        Messaging System Coming Soon
                      </h2>
                      <p className="text-trust-600">
                        Real-time messaging and communication features are in
                        development.
                      </p>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />

            {/* Redirect unknown routes */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
