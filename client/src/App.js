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
import JobPosting from "./pages/JobPosting";
import JobManagement from "./pages/JobManagement";
import JobBrowse from "./pages/JobBrowse";
import JobDetails from "./pages/JobDetails";
import ApplicationSubmission from "./pages/ApplicationSubmission";
import ApplicationTracking from "./pages/ApplicationTracking";

// Import subscription pages
import SubscriptionPlans from "./pages/SubscriptionPlans";
import SubscriptionStatus from "./pages/SubscriptionStatus";
import ManageSubscription from "./pages/ManageSubscription";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CheckoutCancel from "./pages/CheckoutCancel";

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
            <Link
              to="/subscription/status"
              className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
            >
              Subscription
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
                {path.replace("-", " ")}
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

// AppContent component to handle auth logic
const AppContent = () => {
  // ✅ FIX: Use 'loading' instead of 'isLoading' to match AuthContext
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  useEffect(() => {
    console.log(`Page view tracked: ${location.pathname}${location.search}`);
  }, [location]);

  if (loading) {
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

      {/* Subscription Routes (Protected) */}
      <Route
        path="/subscription/plans"
        element={
          <ProtectedRoute>
            <SubscriptionPlans />
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscription/status"
        element={
          <ProtectedRoute>
            <SubscriptionStatus />
          </ProtectedRoute>
        }
      />
      <Route
        path="/subscription/manage"
        element={
          <ProtectedRoute>
            <ManageSubscription />
          </ProtectedRoute>
        }
      />

      {/* Checkout Routes (Can be public for Stripe redirect) */}
      <Route path="/subscription/success" element={<CheckoutSuccess />} />
      <Route path="/subscription/cancel" element={<CheckoutCancel />} />

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

        {/* Admin Only */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Job Management Routes (Senior Doctors) */}
        <Route
          path="/jobs/post"
          element={
            <ProtectedRoute roles={["senior"]}>
              <JobPosting />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/manage"
          element={
            <ProtectedRoute roles={["senior"]}>
              <JobManagement />
            </ProtectedRoute>
          }
        />
        <Route
          path="/jobs/:jobId/edit"
          element={
            <ProtectedRoute roles={["senior"]}>
              <JobPosting />
            </ProtectedRoute>
          }
        />

        {/* Job Discovery Routes */}
        <Route path="/jobs" element={<JobBrowse />} />
        <Route path="/jobs/:jobId" element={<JobDetails />} />

        {/* Application Routes */}
        <Route
          path="/jobs/:jobId/apply"
          element={
            <ProtectedRoute requireActive={true}>
              <ApplicationSubmission />
            </ProtectedRoute>
          }
        />
        <Route
          path="/applications"
          element={
            <ProtectedRoute requireActive={true}>
              <ApplicationTracking />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
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
