import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
  Link,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Import existing pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import EnhancedProfile from "./pages/EnhancedProfile";
import DoctorSearch from "./pages/DoctorSearch";
import AdminDashboard from "./pages/AdminDashboard";

// ErrorBoundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
          <div className="text-center p-8 bg-white rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Something went wrong
            </h2>
            <p className="text-slate-600 mb-4">{this.state.error?.message}</p>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loader component
const Loader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600 border-opacity-50"></div>
  </div>
);

// Role-aware NavBar component
const NavBar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
              Doconnect
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/dashboard"
              className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/profile"
              className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
            >
              Profile
            </Link>
            <Link
              to="/search"
              className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
            >
              Search Doctors
            </Link>
            {user?.role === "senior" && (
              <Link
                to="/jobs"
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
              >
                My Jobs
              </Link>
            )}
            {user?.role === "junior" && (
              <Link
                to="/jobs"
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
              >
                Opportunities
              </Link>
            )}
            <Link
              to="/messages"
              className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
            >
              Messages
            </Link>
            {user?.role === "admin" && (
              <Link
                to="/admin"
                className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
              >
                Admin
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <Link
              to="/notifications"
              className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 17h5l-5 5-5-5h5v-8a5 5 0 1 1 10 0v8z"
                />
              </svg>
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2 text-slate-600 hover:text-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

// Breadcrumb component
const Breadcrumb = () => {
  const location = useLocation();
  const paths = location.pathname.split("/").filter((p) => p);

  return (
    <div className="bg-white py-4 border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-2 text-sm text-slate-600">
          <Link to="/" className="hover:text-blue-600">
            Home
          </Link>
          {paths.map((path, index) => (
            <React.Fragment key={index}>
              <span>/</span>
              <Link
                to={`/${paths.slice(0, index + 1).join("/")}`}
                className="capitalize hover:text-blue-600"
              >
                {path}
              </Link>
            </React.Fragment>
          ))}
        </nav>
      </div>
    </div>
  );
};

// Protected Layout
const ProtectedLayout = () => (
  <>
    <NavBar />
    <Breadcrumb />
    <div className="pt-24">
      <Outlet />
    </div>
  </>
);

// Jobs Placeholder
const JobsPlaceholder = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
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
      <h2 className="text-2xl font-bold text-slate-900 mb-2">
        Job System Coming Soon
      </h2>
      <p className="text-slate-600">
        Advanced job posting and application system is in development.
      </p>
    </div>
  </div>
);

// Messages Placeholder
const MessagesPlaceholder = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
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
      <h2 className="text-2xl font-bold text-slate-900 mb-2">
        Messaging System Coming Soon
      </h2>
      <p className="text-slate-600">
        Real-time messaging and communication features are in development.
      </p>
    </div>
  </div>
);

// AppContent component to handle auth logic
const AppContent = () => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Analytics tracking
    console.log(`Page view tracked: ${location.pathname}${location.search}`);
  }, [location]);

  if (isLoading) {
    return <Loader />;
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />
      <Route
        path="/register"
        element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />
        }
      />
      <Route path="/search" element={<DoctorSearch />} />

      {/* Protected Routes with Layout */}
      <Route element={<ProtectedLayout />}>
        {/* Basic Protected - Auth only */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Profile Routes - Active Required */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute requireActive={true}>
              <EnhancedProfile />
            </ProtectedRoute>
          }
        />

        {/* Legacy Profile */}
        <Route
          path="/profile/legacy"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Admin Only - Fixed syntax */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Verified Required - For jobs and messages */}
        <Route
          path="/jobs"
          element={
            <ProtectedRoute requireVerifiedAccount={true}>
              <JobsPlaceholder />
            </ProtectedRoute>
          }
        />

        <Route
          path="/jobs/create"
          element={
            <ProtectedRoute requireVerifiedAccount={true}>
              <JobsPlaceholder />
            </ProtectedRoute>
          }
        />

        <Route
          path="/applications"
          element={
            <ProtectedRoute requireVerifiedAccount={true}>
              <JobsPlaceholder />
            </ProtectedRoute>
          }
        />

        <Route
          path="/applications/review"
          element={
            <ProtectedRoute requireVerifiedAccount={true}>
              <JobsPlaceholder />
            </ProtectedRoute>
          }
        />

        <Route
          path="/assessments"
          element={
            <ProtectedRoute requireVerifiedAccount={true}>
              <JobsPlaceholder />
            </ProtectedRoute>
          }
        />

        <Route
          path="/messages"
          element={
            <ProtectedRoute requireVerifiedAccount={true}>
              <MessagesPlaceholder />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes - All require admin access */}
        <Route
          path="/admin/verifications"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/support"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* Redirect unknown routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ErrorBoundary>
          <div className="App">
            <AppContent />
          </div>
        </ErrorBoundary>
      </Router>
    </AuthProvider>
  );
}

export default App;
