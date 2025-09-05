import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({
  children,
  // Protection levels
  requireActive = false,
  requireVerified = false,
  requireVerifiedAccount = false,
  requireSubscription = false,
  requireAdmin = false,
  // Legacy role-based support
  roles = [],
  // Custom redirect paths
  redirectTo = null,
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Level 1: Basic Authentication Check
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Level 2: Account Status Check (pending vs active vs suspended)
  const isAccountAccessible = ["active", "pending"].includes(
    user?.accountStatus
  );

  if (!isAccountAccessible) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Account Suspended
            </h2>
            <p className="text-gray-600 mb-6">
              Your account has been{" "}
              {user?.accountStatus === "inactive" ? "deactivated" : "suspended"}
              . Please contact support for assistance.
            </p>
            <button
              onClick={() =>
                (window.location.href = "mailto:support@yourapp.com")
              }
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Level 3: Active Account Requirement (excludes pending users)
  if (requireActive && user?.accountStatus !== "active") {
    const isPending = user?.accountStatus === "pending";

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
              <svg
                className="h-6 w-6 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Account Verification Required
            </h2>
            <p className="text-gray-600 mb-6">
              {isPending
                ? "Your account is pending verification. Complete your profile to unlock this feature."
                : "An active account status is required for this operation."}
            </p>
            {isPending ? (
              <Navigate to="/profile/complete" replace />
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-gray-500">
                  Please contact support if you believe this is an error.
                </p>
                <Navigate to="/dashboard" replace />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Level 4: Email Verification Check
  if (requireVerified && !user?.isVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Email Verification Required
            </h2>
            <p className="text-gray-600 mb-6">
              Please verify your email address to access this feature.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  /* Trigger resend verification email */
                }}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Resend Verification Email
              </button>
              <Navigate to="/dashboard" replace />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Level 5: Professional Account Verification
  if (requireVerifiedAccount) {
    const hasVerificationStatus = user?.verificationStatus?.overall;
    const isVerified = hasVerificationStatus === "verified";

    if (!isVerified) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 mb-4">
                <svg
                  className="h-6 w-6 text-purple-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Professional Verification Required
              </h2>
              <p className="text-gray-600 mb-6">
                This feature requires professional account verification to
                ensure quality and trust.
              </p>
              <div className="space-y-3">
                <button
                  onClick={() =>
                    (window.location.href = "/verification/professional")
                  }
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                >
                  Start Verification Process
                </button>
                <p className="text-sm text-gray-500">
                  Verification includes identity confirmation and credential
                  review.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }
  }

  // Level 6: Subscription Check
  if (requireSubscription && user?.subscriptionStatus !== "active") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Premium Subscription Required
            </h2>
            <p className="text-gray-600 mb-6">
              This is a premium feature that requires an active subscription.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => (window.location.href = "/subscription")}
                className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
              >
                Upgrade to Premium
              </button>
              <Navigate to={redirectTo || "/dashboard"} replace />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Level 7: Admin Role Check
  if (requireAdmin && user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Administrator Access Required
            </h2>
            <p className="text-gray-600 mb-6">
              This area is restricted to system administrators only.
            </p>
            <Navigate to="/dashboard" replace />
          </div>
        </div>
      </div>
    );
  }

  // Legacy: Role-based access (for backward compatibility)
  if (roles.length > 0 && !roles.includes(user?.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-orange-100 mb-4">
              <svg
                className="h-6 w-6 text-orange-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Access Denied
            </h2>
            <p className="text-gray-600 mb-6">
              Your current role ({user?.role}) doesn't have permission to access
              this page.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Required role{roles.length > 1 ? "s" : ""}: {roles.join(", ")}
            </p>
            <Navigate to="/dashboard" replace />
          </div>
        </div>
      </div>
    );
  }

  // All checks passed - render the protected content
  return children;
};

export default ProtectedRoute;
