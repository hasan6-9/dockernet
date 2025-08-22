import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [stats, setStats] = useState({
    totalJobs: 12,
    activeApplications: 5,
    completedProjects: 28,
    earnings: 15750,
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const getWelcomeMessage = () => {
    const hour = currentTime.getHours();
    const greeting =
      hour < 12
        ? "Good morning"
        : hour < 18
        ? "Good afternoon"
        : "Good evening";
    const role = user?.role;

    switch (role) {
      case "senior":
        return `${greeting}, Dr. ${user?.firstName}! Ready to find exceptional junior doctors for your practice?`;
      case "junior":
        return `${greeting}, Dr. ${user?.firstName}! Discover new opportunities to advance your medical career.`;
      case "admin":
        return `${greeting}! Welcome to your administrative dashboard.`;
      default:
        return `${greeting}! Welcome to Doconnect.`;
    }
  };

  const getDashboardCards = () => {
    const role = user?.role;

    if (role === "senior") {
      return [
        {
          title: "Post New Job",
          description: "Create opportunities for junior doctors",
          link: "/jobs/create",
          icon: (
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          ),
          gradient: "from-primary-500 to-primary-600",
          stats: "12 Active Jobs",
        },
        {
          title: "Find Doctors",
          description: "Search and discover qualified junior doctors",
          link: "/search",
          icon: (
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          ),
          gradient: "from-trust-500 to-trust-600",
          stats: "200+ Available",
        },
        {
          title: "Manage Jobs",
          description: "Review applications and manage postings",
          link: "/jobs/my-jobs",
          icon: (
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          ),
          gradient: "from-medical-500 to-medical-600",
          stats: "24 Applications",
        },
        {
          title: "Messages",
          description: "Communicate with candidates",
          link: "/messages",
          icon: (
            <svg
              className="w-8 h-8"
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
          ),
          gradient: "from-accent-500 to-accent-600",
          stats: "3 New Messages",
        },
      ];
    } else if (role === "junior") {
      return [
        {
          title: "Find Opportunities",
          description: "Search available positions and projects",
          link: "/search",
          icon: (
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          ),
          gradient: "from-primary-500 to-primary-600",
          stats: "47 New Jobs",
        },
        {
          title: "Browse Jobs",
          description: "Discover exciting medical opportunities",
          link: "/jobs",
          icon: (
            <svg
              className="w-8 h-8"
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
          ),
          gradient: "from-medical-500 to-medical-600",
          stats: "5 Active Apps",
        },
        {
          title: "My Applications",
          description: "Track your job applications and status",
          link: "/applications",
          icon: (
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
              />
            </svg>
          ),
          gradient: "from-accent-500 to-accent-600",
          stats: "3 Pending",
        },
        {
          title: "My Profile",
          description: "Update your professional information",
          link: "/profile",
          icon: (
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          ),
          gradient: "from-trust-500 to-trust-600",
          stats: "85% Complete",
        },
      ];
    } else if (role === "admin") {
      return [
        {
          title: "Admin Dashboard",
          description: "Access comprehensive admin controls",
          link: "/admin",
          icon: (
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          ),
          gradient: "from-error-500 to-error-600",
          stats: "15 Pending Verifications",
        },
        {
          title: "User Management",
          description: "Verify and manage doctor accounts",
          link: "/admin",
          icon: (
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
          ),
          gradient: "from-primary-500 to-primary-600",
          stats: "1.2K Active Users",
        },
        {
          title: "Platform Analytics",
          description: "Monitor platform performance and metrics",
          link: "/admin",
          icon: (
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          ),
          gradient: "from-warning-500 to-warning-600",
          stats: "↑ 23% Growth",
        },
        {
          title: "Doctor Search",
          description: "Browse all registered doctors on platform",
          link: "/search",
          icon: (
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          ),
          gradient: "from-medical-500 to-medical-600",
          stats: "All Users",
        },
      ];
    } else {
      return [
        {
          title: "User Management",
          description: "Verify and manage doctor accounts",
          link: "/admin/users",
          icon: (
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
          ),
          gradient: "from-error-500 to-error-600",
          stats: "15 Pending",
        },
        {
          title: "Platform Analytics",
          description: "Monitor platform performance",
          link: "/admin/analytics",
          icon: (
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          ),
          gradient: "from-primary-500 to-primary-600",
          stats: "1.2K Active Users",
        },
      ];
    }
  };

  const getQuickStats = () => {
    const role = user?.role;
    if (role === "senior") {
      return [
        {
          label: "Active Jobs",
          value: stats.totalJobs,
          icon: "💼",
          color: "text-primary-600",
        },
        {
          label: "Applications",
          value: stats.activeApplications,
          icon: "📋",
          color: "text-medical-600",
        },
        {
          label: "Hired Doctors",
          value: 8,
          icon: "👨‍⚕️",
          color: "text-success-600",
        },
        {
          label: "This Month",
          value: `$${stats.earnings.toLocaleString()}`,
          icon: "💰",
          color: "text-warning-600",
        },
      ];
    } else if (role === "junior") {
      return [
        {
          label: "Applications",
          value: stats.activeApplications,
          icon: "📝",
          color: "text-primary-600",
        },
        {
          label: "Interviews",
          value: 3,
          icon: "🎯",
          color: "text-medical-600",
        },
        {
          label: "Completed",
          value: stats.completedProjects,
          icon: "✅",
          color: "text-success-600",
        },
        {
          label: "Earnings",
          value: `$${stats.earnings.toLocaleString()}`,
          icon: "💰",
          color: "text-warning-600",
        },
      ];
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-trust-50 via-white to-medical-50">
      {/* Background Pattern */}
      <div className="fixed inset-0 pattern-trust opacity-30 pointer-events-none"></div>

      {/* Navigation Header */}
      <nav className="relative bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-medical rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">D</span>
                </div>
                <span className="text-2xl font-bold text-gradient-medical">
                  Doconnect
                </span>
              </div>

              <div className="hidden sm:flex items-center space-x-2">
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user?.role === "senior"
                      ? "badge-verified"
                      : user?.role === "junior"
                      ? "badge-pending"
                      : "bg-trust-100 text-trust-800"
                  }`}
                >
                  {user?.role === "senior"
                    ? "👨‍⚕️ Senior Doctor"
                    : user?.role === "junior"
                    ? "👩‍⚕️ Junior Doctor"
                    : "⚙️ Administrator"}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3 text-sm text-trust-600">
                <span>{currentTime.toLocaleDateString()}</span>
                <span className="text-trust-400">•</span>
                <span>
                  {currentTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <Link
                to="/profile"
                className="flex items-center space-x-2 bg-white/50 hover:bg-white/80 px-3 py-2 rounded-lg transition-all duration-300 group"
              >
                <div className="w-8 h-8 bg-gradient-medical rounded-lg flex items-center justify-center text-white text-sm font-semibold">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </div>
                <span className="hidden sm:block text-trust-700 font-medium group-hover:text-trust-900">
                  Dr. {user?.firstName}
                </span>
              </Link>

              <button
                onClick={handleLogout}
                className="btn-ghost-enhanced text-sm"
              >
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in-up">
          <div className="card-glass">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="mb-4 md:mb-0">
                <h1 className="text-2xl md:text-3xl font-bold text-trust-900 mb-2">
                  {getWelcomeMessage()}
                </h1>
                <p className="text-trust-600">
                  {user?.role === "senior"
                    ? "Manage your practice and connect with talented junior doctors."
                    : user?.role === "junior"
                    ? "Explore opportunities and advance your medical career."
                    : "Monitor platform activities and manage user accounts."}
                </p>
              </div>

              {/* Account Status Indicators */}
              <div className="flex flex-wrap gap-2">
                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user?.isVerified ? "badge-verified" : "badge-pending"
                  }`}
                >
                  {user?.isVerified ? (
                    <>
                      <svg
                        className="w-3 h-3 inline mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Verified
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-3 h-3 inline mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Pending Verification
                    </>
                  )}
                </div>

                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    user?.subscriptionStatus === "active"
                      ? "badge-verified"
                      : "bg-error-100 text-error-800"
                  }`}
                >
                  {user?.subscriptionStatus === "active" ? (
                    <>
                      <svg
                        className="w-3 h-3 inline mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Active Plan
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-3 h-3 inline mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Inactive
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {user?.role !== "admin" && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-fade-in-up animation-delay-200">
            {getQuickStats().map((stat, index) => (
              <div key={index} className="card-trust text-center">
                <div className="text-2xl mb-2">{stat.icon}</div>
                <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                  {stat.value}
                </div>
                <div className="text-trust-600 text-sm font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {getDashboardCards().map((card, index) => (
            <Link
              key={index}
              to={card.link}
              className="group card-medical hover:scale-105 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${(index + 3) * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`w-12 h-12 bg-gradient-to-r ${card.gradient} rounded-xl flex items-center justify-center text-white group-hover:shadow-lg transition-all duration-300`}
                >
                  {card.icon}
                </div>
                <svg
                  className="w-5 h-5 text-trust-400 group-hover:text-trust-600 group-hover:translate-x-1 transition-all duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>

              <h3 className="text-lg font-semibold text-trust-900 mb-2 group-hover:text-medical-600 transition-colors">
                {card.title}
              </h3>
              <p className="text-trust-600 text-sm mb-3 leading-relaxed">
                {card.description}
              </p>

              {card.stats && (
                <div className="flex items-center justify-between pt-3 border-t border-trust-100">
                  <span className="text-xs text-trust-500 font-medium">
                    {card.stats}
                  </span>
                  <div className="w-2 h-2 bg-medical-400 rounded-full animate-pulse-soft"></div>
                </div>
              )}
            </Link>
          ))}
        </div>

        {/* Recent Activity & Notifications */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-2 animate-fade-in-up animation-delay-600">
            <div className="card-medical">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-trust-900">
                  Recent Activity
                </h2>
                <Link
                  to="/activity"
                  className="text-medical-600 hover:text-medical-700 text-sm font-medium"
                >
                  View All
                </Link>
              </div>

              <div className="space-y-4">
                {user?.role === "senior" ? (
                  <>
                    <div className="flex items-start space-x-3 p-3 bg-trust-50 rounded-lg">
                      <div className="w-8 h-8 bg-medical-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-4 h-4 text-medical-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-trust-900 font-medium">
                          New application received for "Cardiology Consultation
                          Support"
                        </p>
                        <p className="text-xs text-trust-500 mt-1">
                          Dr. Sarah Johnson • 2 hours ago
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-primary-50 rounded-lg">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-4 h-4 text-primary-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-trust-900 font-medium">
                          Job posting "Emergency Medicine Support" is expiring
                          in 3 days
                        </p>
                        <p className="text-xs text-trust-500 mt-1">
                          5 hours ago
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-success-50 rounded-lg">
                      <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-4 h-4 text-success-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-trust-900 font-medium">
                          Dr. Michael Chen completed "Radiology Review" project
                          successfully
                        </p>
                        <p className="text-xs text-trust-500 mt-1">Yesterday</p>
                      </div>
                    </div>
                  </>
                ) : user?.role === "junior" ? (
                  <>
                    <div className="flex items-start space-x-3 p-3 bg-medical-50 rounded-lg">
                      <div className="w-8 h-8 bg-medical-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-4 h-4 text-medical-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-trust-900 font-medium">
                          Your application for "Pediatric Consultation" was
                          reviewed
                        </p>
                        <p className="text-xs text-trust-500 mt-1">
                          Dr. Amanda Wilson • 1 hour ago
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-primary-50 rounded-lg">
                      <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-4 h-4 text-primary-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-trust-900 font-medium">
                          New matching opportunity: "Dermatology Research
                          Assistant"
                        </p>
                        <p className="text-xs text-trust-500 mt-1">
                          3 hours ago
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-3 bg-success-50 rounded-lg">
                      <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-4 h-4 text-success-600"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-trust-900 font-medium">
                          Payment received: $850 for "Telemedicine Consultation"
                        </p>
                        <p className="text-xs text-trust-500 mt-1">
                          2 days ago
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8 text-trust-500">
                    <svg
                      className="w-12 h-12 mx-auto mb-4 text-trust-300"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <p>No recent activity to display</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notifications & Quick Links */}
          <div className="space-y-6 animate-fade-in-up animation-delay-800">
            {/* Notifications */}
            <div className="card-trust">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-trust-900">
                  Notifications
                </h3>
                <span className="bg-medical-100 text-medical-800 text-xs font-medium px-2 py-1 rounded-full">
                  3 New
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-2 hover:bg-trust-50 rounded-lg transition-colors">
                  <div className="w-2 h-2 bg-medical-400 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-trust-900 font-medium truncate">
                      Profile verification update
                    </p>
                    <p className="text-xs text-trust-500">2 minutes ago</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-2 hover:bg-trust-50 rounded-lg transition-colors">
                  <div className="w-2 h-2 bg-primary-400 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-trust-900 font-medium truncate">
                      New message received
                    </p>
                    <p className="text-xs text-trust-500">1 hour ago</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-2 hover:bg-trust-50 rounded-lg transition-colors">
                  <div className="w-2 h-2 bg-warning-400 rounded-full flex-shrink-0"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-trust-900 font-medium truncate">
                      Subscription renewal reminder
                    </p>
                    <p className="text-xs text-trust-500">3 hours ago</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-trust-100">
                <Link
                  to="/notifications"
                  className="text-medical-600 hover:text-medical-700 text-sm font-medium"
                >
                  View all notifications →
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div className="card-medical">
              <h3 className="text-lg font-semibold text-trust-900 mb-4">
                Quick Links
              </h3>

              <div className="space-y-2">
                <Link
                  to="/help"
                  className="flex items-center justify-between p-2 hover:bg-medical-50 rounded-lg transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-4 h-4 text-trust-500 group-hover:text-medical-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm text-trust-700 group-hover:text-trust-900">
                      Help Center
                    </span>
                  </div>
                  <svg
                    className="w-4 h-4 text-trust-400 group-hover:text-trust-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>

                <Link
                  to="/settings"
                  className="flex items-center justify-between p-2 hover:bg-medical-50 rounded-lg transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-4 h-4 text-trust-500 group-hover:text-medical-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="text-sm text-trust-700 group-hover:text-trust-900">
                      Account Settings
                    </span>
                  </div>
                  <svg
                    className="w-4 h-4 text-trust-400 group-hover:text-trust-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>

                <Link
                  to="/billing"
                  className="flex items-center justify-between p-2 hover:bg-medical-50 rounded-lg transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <svg
                      className="w-4 h-4 text-trust-500 group-hover:text-medical-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    <span className="text-sm text-trust-700 group-hover:text-trust-900">
                      Billing & Payments
                    </span>
                  </div>
                  <svg
                    className="w-4 h-4 text-trust-400 group-hover:text-trust-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Upgrade Notice (if not premium) */}
            {user?.subscriptionStatus !== "active" && (
              <div className="card-glass bg-gradient-to-r from-medical-500/10 to-primary-500/10 border-medical-200">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-medical rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 10V3L4 14h7v7l9-11h-7z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-trust-900 mb-2">
                    Upgrade to Premium
                  </h3>
                  <p className="text-sm text-trust-600 mb-4">
                    Unlock advanced features and priority support
                  </p>
                  <Link to="/subscription" className="btn-medical text-sm">
                    Learn More
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
export default Dashboard;
