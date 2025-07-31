import React from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  const getWelcomeMessage = () => {
    const role = user?.role;
    switch (role) {
      case "senior":
        return "Welcome back! Ready to find talented junior doctors for your projects?";
      case "junior":
        return "Welcome back! Discover new opportunities to expand your medical career.";
      case "admin":
        return "Admin Dashboard - Manage users and platform operations.";
      default:
        return "Welcome to Dockernet!";
    }
  };

  const getDashboardCards = () => {
    const role = user?.role;

    if (role === "senior") {
      return [
        {
          title: "Post a Job",
          description:
            "Create a new job posting to find qualified junior doctors",
          link: "/jobs/create",
          icon: "📝",
          color: "bg-blue-500",
        },
        {
          title: "My Jobs",
          description: "View and manage your posted jobs",
          link: "/jobs/my-jobs",
          icon: "💼",
          color: "bg-green-500",
        },
        {
          title: "Messages",
          description: "Chat with applicants and hired doctors",
          link: "/messages",
          icon: "💬",
          color: "bg-purple-500",
        },
        {
          title: "Subscription",
          description: "Manage your subscription plan",
          link: "/subscription",
          icon: "💳",
          color: "bg-yellow-500",
        },
      ];
    } else if (role === "junior") {
      return [
        {
          title: "Browse Jobs",
          description: "Find exciting medical opportunities",
          link: "/jobs",
          icon: "🔍",
          color: "bg-blue-500",
        },
        {
          title: "My Applications",
          description: "Track your job applications",
          link: "/applications",
          icon: "📋",
          color: "bg-green-500",
        },
        {
          title: "Messages",
          description: "Chat with potential employers",
          link: "/messages",
          icon: "💬",
          color: "bg-purple-500",
        },
        {
          title: "Subscription",
          description: "Manage your subscription plan",
          link: "/subscription",
          icon: "💳",
          color: "bg-yellow-500",
        },
      ];
    } else {
      return [
        {
          title: "User Management",
          description: "Verify and manage doctor accounts",
          link: "/admin/users",
          icon: "👥",
          color: "bg-red-500",
        },
        {
          title: "Reports",
          description: "View platform analytics and reports",
          link: "/admin/reports",
          icon: "📊",
          color: "bg-indigo-500",
        },
      ];
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-gray-900">Dockernet</h1>
              <span className="ml-4 px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize">
                {user?.role}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Hello, Dr. {user?.firstName} {user?.lastName}
              </div>
              <Link
                to="/profile"
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Profile
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Welcome Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                Welcome back, Dr. {user?.firstName}!
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {getWelcomeMessage()}
              </p>

              {/* Account Status */}
              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user?.isVerified
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {user?.isVerified ? "✓ Verified" : "⏳ Pending Verification"}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    user?.subscriptionStatus === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {user?.subscriptionStatus === "active"
                    ? "✓ Active Subscription"
                    : "✗ No Active Subscription"}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {getDashboardCards().map((card, index) => (
              <Link
                key={index}
                to={card.link}
                className="relative group bg-white p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div>
                  <span
                    className={`rounded-lg inline-flex p-3 text-white text-2xl ${card.color}`}
                  >
                    {card.icon}
                  </span>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600">
                    {card.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    {card.description}
                  </p>
                </div>
                <span
                  className="pointer-events-none absolute top-6 right-6 text-gray-300 group-hover:text-gray-400"
                  aria-hidden="true"
                >
                  →
                </span>
              </Link>
            ))}
          </div>

          {/* Recent Activity Section */}
          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Recent Activity
              </h3>
              <div className="text-sm text-gray-500">
                <p>No recent activity to display.</p>
                <p className="mt-2">
                  {user?.role === "senior"
                    ? "Post your first job to get started!"
                    : "Browse available jobs to begin your journey!"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
