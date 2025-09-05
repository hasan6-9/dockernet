import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import {
  User,
  Upload,
  FileText,
  Search,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Star,
  Eye,
  Calendar,
  DollarSign,
  Award,
  Users,
  Settings,
  HelpCircle,
  Bell,
  ArrowRight,
  ChevronRight,
  Activity,
  Shield,
  Briefcase,
  GraduationCap,
  Stethoscope,
  Plus,
  Filter,
  BarChart3,
  Target,
} from "lucide-react";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [dashboardData, setDashboardData] = useState({
    profileCompletion: 65,
    unreadNotifications: 3,
    pendingVerifications: 2,
    recentActivity: [],
    stats: {
      profileViews: 124,
      applications: 8,
      projects: 12,
      earnings: 15750,
    },
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getVerificationBadge = (status) => {
    const badges = {
      verified: {
        color: "bg-emerald-100 text-emerald-800",
        icon: CheckCircle,
        text: "Verified",
      },
      partial: {
        color: "bg-yellow-100 text-yellow-800",
        icon: AlertCircle,
        text: "Partial Verification",
      },
      unverified: {
        color: "bg-red-100 text-red-800",
        icon: XCircle,
        text: "Unverified",
      },
      pending: {
        color: "bg-blue-100 text-blue-800",
        icon: Clock,
        text: "Under Review",
      },
    };
    const badge = badges[status] || badges.unverified;
    const Icon = badge.icon;
    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {badge.text}
      </span>
    );
  };

  const getProfileCompletionSteps = () => {
    const allSteps = [
      { key: "basic_info", title: "Basic Information", completed: true },
      {
        key: "profile_photo",
        title: "Profile Photo",
        completed: user?.profilePhoto?.url,
      },
      {
        key: "bio",
        title: "Professional Bio",
        completed: user?.bio?.length > 50,
      },
      {
        key: "experience",
        title: "Experience",
        completed: user?.experiences?.length > 0,
      },
      {
        key: "skills",
        title: "Skills & Expertise",
        completed: user?.skills?.length >= 3,
      },
      {
        key: "certifications",
        title: "Certifications",
        completed: user?.certifications?.length > 0,
      },
      {
        key: "documents",
        title: "Documents",
        completed: user?.documents?.length > 0,
      },
      {
        key: "availability",
        title: "Availability",
        completed: user?.availability?.weeklySchedule,
      },
    ];

    const completed = allSteps.filter((step) => step.completed).length;
    return {
      steps: allSteps,
      completion: Math.round((completed / allSteps.length) * 100),
    };
  };

  // Role-specific dashboard content
  const getSeniorDoctorDashboard = () => {
    const quickActions = [
      {
        title: "Post New Job",
        description: "Create opportunities for junior doctors",
        icon: Plus,
        link: "/jobs/create",
        color: "bg-gradient-to-r from-blue-500 to-blue-600",
        urgent: false,
      },
      {
        title: "Review Applications",
        description: "24 new applications pending review",
        icon: FileText,
        link: "/applications/review",
        color: "bg-gradient-to-r from-amber-500 to-amber-600",
        urgent: true,
        badge: "24",
      },
      {
        title: "Find Doctors",
        description: "Search qualified junior doctors",
        icon: Search,
        link: "/search",
        color: "bg-gradient-to-r from-emerald-500 to-emerald-600",
        urgent: false,
      },
      {
        title: "Messages",
        description: "3 new messages from candidates",
        icon: MessageSquare,
        link: "/messages",
        color: "bg-gradient-to-r from-purple-500 to-purple-600",
        urgent: true,
        badge: "3",
      },
    ];

    const stats = [
      {
        label: "Active Jobs",
        value: "12",
        icon: Briefcase,
        trend: "+2 this month",
      },
      {
        label: "Applications",
        value: "89",
        icon: FileText,
        trend: "+15 this week",
      },
      {
        label: "Hired Doctors",
        value: "8",
        icon: Users,
        trend: "2 this month",
      },
      {
        label: "Success Rate",
        value: "94%",
        icon: Target,
        trend: "+3% improvement",
      },
    ];

    return { quickActions, stats, roleSpecific: true };
  };

  const getJuniorDoctorDashboard = () => {
    const quickActions = [
      {
        title: "Browse Jobs",
        description: "47 new opportunities available",
        icon: Search,
        link: "/jobs",
        color: "bg-gradient-to-r from-blue-500 to-blue-600",
        urgent: false,
        badge: "47",
      },
      {
        title: "My Applications",
        description: "5 applications awaiting response",
        icon: FileText,
        link: "/applications",
        color: "bg-gradient-to-r from-amber-500 to-amber-600",
        urgent: true,
        badge: "5",
      },
      {
        title: "Complete Profile",
        description: `${
          100 - getProfileCompletionSteps().completion
        }% remaining to complete`,
        icon: User,
        link: "/profile",
        color: "bg-gradient-to-r from-emerald-500 to-emerald-600",
        urgent: getProfileCompletionSteps().completion < 80,
      },
      {
        title: "Skill Assessment",
        description: "Take tests to verify your expertise",
        icon: Award,
        link: "/assessments",
        color: "bg-gradient-to-r from-purple-500 to-purple-600",
        urgent: false,
      },
    ];

    const stats = [
      {
        label: "Profile Views",
        value: "124",
        icon: Eye,
        trend: "+18 this week",
      },
      { label: "Applications", value: "8", icon: FileText, trend: "3 pending" },
      {
        label: "Success Rate",
        value: "75%",
        icon: Target,
        trend: "Above average",
      },
      {
        label: "Earnings",
        value: "$2,850",
        icon: DollarSign,
        trend: "This month",
      },
    ];

    return { quickActions, stats, roleSpecific: true };
  };

  const getAdminDashboard = () => {
    const quickActions = [
      {
        title: "Pending Verifications",
        description: "15 doctors awaiting verification",
        icon: Shield,
        link: "/admin/verifications",
        color: "bg-gradient-to-r from-red-500 to-red-600",
        urgent: true,
        badge: "15",
      },
      {
        title: "User Management",
        description: "Manage registered doctors",
        icon: Users,
        link: "/admin/users",
        color: "bg-gradient-to-r from-blue-500 to-blue-600",
        urgent: false,
      },
      {
        title: "Platform Analytics",
        description: "View system performance metrics",
        icon: BarChart3,
        link: "/admin/analytics",
        color: "bg-gradient-to-r from-emerald-500 to-emerald-600",
        urgent: false,
      },
      {
        title: "Support Tickets",
        description: "7 open support requests",
        icon: HelpCircle,
        link: "/admin/support",
        color: "bg-gradient-to-r from-amber-500 to-amber-600",
        urgent: true,
        badge: "7",
      },
    ];

    const stats = [
      {
        label: "Total Users",
        value: "1,247",
        icon: Users,
        trend: "+23 this week",
      },
      { label: "Pending Reviews", value: "15", icon: Clock, trend: "2 urgent" },
      {
        label: "Active Jobs",
        value: "89",
        icon: Briefcase,
        trend: "+12 this week",
      },
      {
        label: "Platform Health",
        value: "98.9%",
        icon: Activity,
        trend: "All systems operational",
      },
    ];

    return { quickActions, stats, roleSpecific: true };
  };

  // Get role-specific data
  const getDashboardContent = () => {
    switch (user?.role) {
      case "senior":
        return getSeniorDoctorDashboard();
      case "junior":
        return getJuniorDoctorDashboard();
      case "admin":
        return getAdminDashboard();
      default:
        return getJuniorDoctorDashboard();
    }
  };

  const { quickActions, stats } = getDashboardContent();
  const { steps: profileSteps, completion: profileCompletion } =
    getProfileCompletionSteps();
  const incompleteSteps = profileSteps
    .filter((step) => !step.completed)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                  <Stethoscope className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Doconnect
                </span>
              </Link>

              <div className="hidden sm:flex items-center">
                {getVerificationBadge(
                  user?.verificationStatus?.overall || "unverified"
                )}
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3 text-sm text-slate-600">
                <Calendar className="w-4 h-4" />
                <span>{currentTime.toLocaleDateString()}</span>
                <span className="text-slate-400">•</span>
                <Clock className="w-4 h-4" />
                <span>
                  {currentTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <button className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                {dashboardData.unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {dashboardData.unreadNotifications}
                  </span>
                )}
              </button>

              <Link
                to="/profile"
                className="flex items-center space-x-3 bg-white hover:bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 transition-all duration-200 group"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white text-sm font-semibold">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-900 group-hover:text-blue-600">
                    Dr. {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">
                    {user?.role === "senior"
                      ? "Senior Doctor"
                      : user?.role === "junior"
                      ? "Junior Doctor"
                      : "Administrator"}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
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
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-4 lg:mb-0">
                <h1 className="text-3xl font-bold text-slate-900 mb-2">
                  {getGreeting()}, Dr. {user?.firstName}!
                </h1>
                <p className="text-slate-600 text-lg">
                  {user?.role === "senior"
                    ? "Ready to find exceptional junior doctors for your practice?"
                    : user?.role === "junior"
                    ? "Discover new opportunities to advance your medical career."
                    : "Welcome to your administrative dashboard."}
                </p>
              </div>

              {/* Profile Completion - Only for non-admin users */}
              {user?.role !== "admin" && profileCompletion < 100 && (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">
                      Profile Completion
                    </span>
                    <span className="text-sm font-bold text-blue-600">
                      {profileCompletion}%
                    </span>
                  </div>
                  <div className="w-48 bg-white rounded-full h-2 mb-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${profileCompletion}%` }}
                    ></div>
                  </div>
                  <Link
                    to="/profile"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center"
                  >
                    Complete profile <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600 mb-1">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-slate-900">
                      {stat.value}
                    </p>
                    <p className="text-xs text-emerald-600 font-medium mt-1">
                      {stat.trend}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Actions */}
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-6">
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {quickActions.map((action, index) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={index}
                      to={action.link}
                      className="group relative bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
                    >
                      {action.urgent && (
                        <div className="absolute top-3 right-3">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        </div>
                      )}

                      <div className="flex items-center justify-between mb-4">
                        <div
                          className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center text-white shadow-lg`}
                        >
                          <Icon className="w-6 h-6" />
                        </div>
                        {action.badge && (
                          <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                            {action.badge}
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-semibold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                        {action.title}
                      </h3>
                      <p className="text-slate-600 text-sm mb-4">
                        {action.description}
                      </p>

                      <div className="flex items-center text-blue-600 font-medium text-sm">
                        <span>Take action</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900">
                  Recent Activity
                </h2>
                <Link
                  to="/activity"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                >
                  View all <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              <div className="space-y-4">
                {/* Sample activities based on role */}
                {user?.role === "senior" && (
                  <>
                    <div className="flex items-start space-x-4 p-3 bg-slate-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">
                          New application received
                        </p>
                        <p className="text-xs text-slate-500">
                          Dr. Sarah Johnson applied for "Cardiology
                          Consultation" • 2 hours ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4 p-3 bg-slate-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">
                          Message from Dr. Michael Chen
                        </p>
                        <p className="text-xs text-slate-500">
                          Regarding the "Emergency Medicine Support" project • 5
                          hours ago
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {user?.role === "junior" && (
                  <>
                    <div className="flex items-start space-x-4 p-3 bg-slate-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Eye className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">
                          Profile viewed by senior doctor
                        </p>
                        <p className="text-xs text-slate-500">
                          Dr. Amanda Wilson viewed your profile • 1 hour ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4 p-3 bg-slate-50 rounded-lg">
                      <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Star className="w-4 h-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">
                          New matching opportunity
                        </p>
                        <p className="text-xs text-slate-500">
                          "Pediatric Consultation Support" matches your skills •
                          3 hours ago
                        </p>
                      </div>
                    </div>
                  </>
                )}

                {user?.role === "admin" && (
                  <>
                    <div className="flex items-start space-x-4 p-3 bg-slate-50 rounded-lg">
                      <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Clock className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">
                          New verification request
                        </p>
                        <p className="text-xs text-slate-500">
                          Dr. Jennifer Lopez submitted documents for review • 30
                          minutes ago
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-4 p-3 bg-slate-50 rounded-lg">
                      <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <HelpCircle className="w-4 h-4 text-red-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-900">
                          Support ticket opened
                        </p>
                        <p className="text-xs text-slate-500">
                          User reported login issues #ST-2024-001 • 2 hours ago
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Completion (for non-admin users) */}
            {user?.role !== "admin" && profileCompletion < 100 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Complete Your Profile
                </h3>
                <div className="space-y-3">
                  {incompleteSteps.map((step, index) => (
                    <Link
                      key={step.key}
                      to="/profile"
                      className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 border-2 border-slate-300 rounded-full flex items-center justify-center">
                          {step.completed ? (
                            <CheckCircle className="w-4 h-4 text-green-600" />
                          ) : (
                            <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                          )}
                        </div>
                        <span className="text-sm font-medium text-slate-900">
                          {step.title}
                        </span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Notifications */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Notifications
                </h3>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                  {dashboardData.unreadNotifications} New
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                  <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0 mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      Profile verification update
                    </p>
                    <p className="text-xs text-slate-500">2 minutes ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                  <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0 mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      New message received
                    </p>
                    <p className="text-xs text-slate-500">1 hour ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">
                  <div className="w-2 h-2 bg-amber-400 rounded-full flex-shrink-0 mt-2"></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900">
                      Document approval needed
                    </p>
                    <p className="text-xs text-slate-500">3 hours ago</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100">
                <Link
                  to="/notifications"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  View all notifications <ArrowRight className="w-3 h-3 ml-1" />
                </Link>
              </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">
                Quick Links
              </h3>

              <div className="space-y-2">
                <Link
                  to="/profile"
                  className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <User className="w-4 h-4 text-slate-500 group-hover:text-blue-600" />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                      My Profile
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                </Link>

                <Link
                  to="/settings"
                  className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <Settings className="w-4 h-4 text-slate-500 group-hover:text-blue-600" />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                      Settings
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                </Link>

                <Link
                  to="/help"
                  className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <HelpCircle className="w-4 h-4 text-slate-500 group-hover:text-blue-600" />
                    <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                      Help Center
                    </span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                </Link>

                {user?.role !== "admin" && (
                  <Link
                    to="/billing"
                    className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors group"
                  >
                    <div className="flex items-center space-x-3">
                      <DollarSign className="w-4 h-4 text-slate-500 group-hover:text-blue-600" />
                      <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                        Billing & Plans
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                  </Link>
                )}
              </div>
            </div>

            {/* Verification Status (for non-admin users) */}
            {user?.role !== "admin" &&
              user?.verificationStatus?.overall !== "verified" && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Shield className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-amber-900 mb-2">
                        Complete Verification
                      </h3>
                      <p className="text-sm text-amber-700 mb-4">
                        Get verified to access all platform features and build
                        trust with other professionals.
                      </p>

                      <div className="space-y-2 mb-4">
                        {user?.verificationStatus?.identity !== "verified" && (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-amber-400 rounded-full flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                            </div>
                            <span className="text-sm text-amber-800">
                              Identity verification pending
                            </span>
                          </div>
                        )}

                        {user?.verificationStatus?.medical_license !==
                          "verified" && (
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 border-2 border-amber-400 rounded-full flex items-center justify-center">
                              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                            </div>
                            <span className="text-sm text-amber-800">
                              Medical license verification pending
                            </span>
                          </div>
                        )}
                      </div>

                      <Link
                        to="/profile?tab=documents"
                        className="inline-flex items-center px-4 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors"
                      >
                        Upload Documents <Upload className="w-3 h-3 ml-1" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

            {/* Subscription Upgrade (for free/basic users) */}
            {user?.subscription?.plan === "free" && user?.role !== "admin" && (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">
                    Upgrade to Premium
                  </h3>
                  <p className="text-sm text-blue-700 mb-4">
                    Access advanced features, priority support, and unlimited
                    opportunities.
                  </p>
                  <div className="space-y-2 mb-4 text-xs text-blue-600">
                    <div className="flex items-center justify-center space-x-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Unlimited job applications</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Advanced search filters</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>Priority customer support</span>
                    </div>
                  </div>
                  <Link
                    to="/subscription"
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Upgrade Now <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </div>
              </div>
            )}

            {/* Success Story/Achievement (for verified users) */}
            {user?.verificationStatus?.overall === "verified" &&
              user?.role !== "admin" && (
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-emerald-900 mb-2">
                      Verified Professional
                    </h3>
                    <p className="text-sm text-emerald-700 mb-4">
                      Your profile is verified and you're ready to connect with
                      other medical professionals.
                    </p>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="text-center">
                        <div className="text-lg font-bold text-emerald-800">
                          {dashboardData.stats.profileViews}
                        </div>
                        <div className="text-xs text-emerald-600">
                          Profile Views
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-emerald-800">
                          {user?.rating?.average
                            ? user.rating.average.toFixed(1)
                            : "5.0"}
                        </div>
                        <div className="text-xs text-emerald-600">Rating</div>
                      </div>
                    </div>
                    {user?.role === "junior" && (
                      <Link
                        to="/jobs"
                        className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        Find Opportunities <Search className="w-3 h-3 ml-1" />
                      </Link>
                    )}
                    {user?.role === "senior" && (
                      <Link
                        to="/jobs/create"
                        className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        Post New Job <Plus className="w-3 h-3 ml-1" />
                      </Link>
                    )}
                  </div>
                </div>
              )}
          </div>
        </div>

        {/* Additional Role-Specific Sections */}
        {user?.role === "admin" && (
          <div className="mt-8">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-slate-900">
                  System Overview
                </h2>
                <Link
                  to="/admin/reports"
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                >
                  View Reports <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-slate-600 mb-2">
                    Pending Actions
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">
                        Verifications
                      </span>
                      <span className="text-sm font-semibold text-red-600">
                        15
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">
                        Support Tickets
                      </span>
                      <span className="text-sm font-semibold text-amber-600">
                        7
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">Disputes</span>
                      <span className="text-sm font-semibold text-blue-600">
                        2
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-slate-600 mb-2">
                    Platform Health
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">Uptime</span>
                      <span className="text-sm font-semibold text-green-600">
                        99.9%
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">
                        Response Time
                      </span>
                      <span className="text-sm font-semibold text-green-600">
                        125ms
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">Error Rate</span>
                      <span className="text-sm font-semibold text-green-600">
                        0.01%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-slate-600 mb-2">
                    Recent Growth
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">New Users</span>
                      <span className="text-sm font-semibold text-blue-600">
                        +23 this week
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">
                        Active Jobs
                      </span>
                      <span className="text-sm font-semibold text-blue-600">
                        +12 this week
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">Revenue</span>
                      <span className="text-sm font-semibold text-green-600">
                        +18% this month
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
