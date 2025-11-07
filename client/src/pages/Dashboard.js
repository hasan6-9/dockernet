// ============================================================================
// IMPORTS
// ============================================================================
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import {
  authAPI,
  profileAPI,
  jobAPI,
  applicationAPI,
  adminAPI,
  handleApiError,
} from "../api";
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
  Stethoscope,
  Plus,
  BarChart3,
  Target,
} from "lucide-react";

// ============================================================================
// LOADING COMPONENT
// ============================================================================
const DashboardSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="animate-pulse space-y-8">
        {/* Header Skeleton */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="h-6 bg-slate-200 rounded w-2/3"></div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
            >
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-slate-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>

        {/* Quick Actions Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm border border-slate-200 p-6"
            >
              <div className="h-12 w-12 bg-slate-200 rounded-xl mb-4"></div>
              <div className="h-6 bg-slate-200 rounded w-2/3 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const Dashboard = () => {
  // --------------------------------------------------------------------------
  // HOOKS & STATE
  // --------------------------------------------------------------------------
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, logout, isJunior, isSenior, isAdmin } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());

  // --------------------------------------------------------------------------
  // DATA FETCHING - Profile & Analytics
  // --------------------------------------------------------------------------
  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: () => profileAPI.getMe(),
    enabled: !!user && !isAdmin(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: analyticsData } = useQuery({
    queryKey: ["profile-analytics", user?.id],
    queryFn: () => profileAPI.getAnalytics(),
    enabled:
      !!user && !isAdmin() && user?.verificationStatus?.overall === "verified",
    staleTime: 10 * 60 * 1000,
  });

  // --------------------------------------------------------------------------
  // JUNIOR DOCTOR DATA
  // --------------------------------------------------------------------------
  const { data: myApplications } = useQuery({
    queryKey: ["my-applications", "dashboard"],
    queryFn: () =>
      applicationAPI.getMyApplications({ limit: 5, sortBy: "recent" }),
    enabled: isJunior(),
    staleTime: 2 * 60 * 1000,
  });

  const { data: jobRecommendations } = useQuery({
    queryKey: ["job-recommendations", "dashboard"],
    queryFn: () => jobAPI.getRecommendations({ limit: 5 }),
    enabled: isJunior(),
    staleTime: 5 * 60 * 1000,
  });

  // --------------------------------------------------------------------------
  // SENIOR DOCTOR DATA
  // --------------------------------------------------------------------------
  const { data: myJobs } = useQuery({
    queryKey: ["my-jobs", "dashboard"],
    queryFn: () => jobAPI.getMyJobs({ limit: 5, sortBy: "recent" }),
    enabled: isSenior(),
    staleTime: 2 * 60 * 1000,
  });

  const { data: receivedApplications } = useQuery({
    queryKey: ["received-applications", "dashboard"],
    queryFn: () => applicationAPI.getReceived({ limit: 5, sortBy: "recent" }),
    enabled: isSenior(),
    staleTime: 2 * 60 * 1000,
  });

  // --------------------------------------------------------------------------
  // ADMIN DATA
  // --------------------------------------------------------------------------
  const { data: adminDashboardData } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminAPI.getDashboard(),
    enabled: isAdmin(),
    staleTime: 2 * 60 * 1000,
  });

  const { data: pendingVerifications } = useQuery({
    queryKey: ["pending-verifications"],
    queryFn: () => adminAPI.getPendingVerifications({ limit: 5 }),
    enabled: isAdmin(),
    staleTime: 2 * 60 * 1000,
  });

  // --------------------------------------------------------------------------
  // EFFECTS
  // --------------------------------------------------------------------------
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --------------------------------------------------------------------------
  // EVENT HANDLERS
  // --------------------------------------------------------------------------
  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      const errorInfo = handleApiError(error);
      toast.error(errorInfo.message);
    }
  };

  // --------------------------------------------------------------------------
  // UTILITY FUNCTIONS
  // --------------------------------------------------------------------------
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
      pending: {
        color: "bg-blue-100 text-blue-800",
        icon: Clock,
        text: "Under Review",
      },
      rejected: {
        color: "bg-red-100 text-red-800",
        icon: XCircle,
        text: "Verification Failed",
      },
    };
    const badge = badges[status] || badges.pending;
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

  const calculateProfileCompletion = () => {
    // ✅ FIX: Access the nested data structure correctly
    const profile = profileData?.data?.data || profileData?.data || user;

    if (!profile) return { percentage: 0, steps: [], missing: [] };

    console.log("🔍 Profile object:", profile);
    console.log("🔍 Profile completion field:", profile.profileCompletion);

    // ✅ Prefer backend calculation if available
    if (
      profile.profileCompletion &&
      typeof profile.profileCompletion.percentage === "number"
    ) {
      const backendData = {
        percentage: profile.profileCompletion.percentage,
        steps: [],
        missing: profile.profileCompletion.missingSections || [],
      };
      console.log("✅ Using backend calculation:", backendData);
      return backendData;
    }

    console.log("⚠️ Backend data not available, using frontend calculation");

    // Fallback to frontend calculation
    const allSteps = [
      { key: "basic_info", title: "Basic Information", completed: true },
      {
        key: "profile_photo",
        title: "Profile Photo",
        completed: !!(profile.profilePhoto?.url || profile.profilePhoto),
      },
      {
        key: "bio",
        title: "Professional Bio",
        completed: profile.bio?.length > 50,
      },
      {
        key: "experience",
        title: "Work Experience",
        completed: profile.experiences?.length > 0,
      },
      {
        key: "skills",
        title: "Skills & Expertise",
        completed: profile.skills?.length >= 3,
      },
      {
        key: "certifications",
        title: "Certifications",
        completed: profile.certifications?.length > 0,
      },
      {
        key: "documents",
        title: "Verification Documents",
        completed: profile.documents?.length > 0,
      },
      {
        key: "availability",
        title: "Availability Settings",
        completed: !!(
          profile.availability?.weeklySchedule ||
          profile.availability?.hoursPerWeek
        ),
      },
    ];

    const completed = allSteps.filter((step) => step.completed).length;
    const missing = allSteps.filter((step) => !step.completed);

    return {
      percentage: Math.round((completed / allSteps.length) * 100),
      steps: allSteps,
      missing: missing.slice(0, 3),
    };
  };

  // Add this right after the calculateProfileCompletion function definition
  useEffect(() => {
    if (profileData) {
      console.log("=== Dashboard Profile Data ===");
      console.log("Raw profileData:", profileData);
      console.log("profileData.data:", profileData.data);
      console.log("profileData.data.data:", profileData.data?.data);

      const profile = profileData?.data?.data || profileData?.data;
      console.log("Extracted profile:", profile);
      console.log(
        "Profile completion from backend:",
        profile?.profileCompletion
      );

      const calculated = calculateProfileCompletion();
      console.log("Calculated result:", calculated);
    }
  }, [profileData]);

  // --------------------------------------------------------------------------
  // ROLE-SPECIFIC DASHBOARD CONTENT
  // --------------------------------------------------------------------------
  const getSeniorDoctorDashboard = () => {
    const jobsData = myJobs?.data?.data || [];
    const applicationsData = receivedApplications?.data?.data || [];
    const jobsPagination = myJobs?.data?.pagination || {};
    const appsPagination = receivedApplications?.data?.pagination || {};

    // Count pending applications
    const pendingAppsCount =
      applicationsData.filter(
        (app) => app.status === "submitted" || app.status === "under_review"
      ).length || 0;

    // Count new messages (mock for now - will be real when messaging implemented)
    const newMessagesCount = 3;

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
        title: "Manage Jobs",
        description: `${jobsPagination.total || 0} active job postings`,
        icon: Briefcase,
        link: "/jobs/manage",
        color: "bg-gradient-to-r from-green-500 to-green-600",
        urgent: false,
        badge: jobsPagination.total > 0 ? String(jobsPagination.total) : null,
      },
      {
        title: "Review Applications",
        description: `${pendingAppsCount} applications pending review`,
        icon: FileText,
        link: "/applications",
        color: "bg-gradient-to-r from-amber-500 to-amber-600",
        urgent: pendingAppsCount > 0,
        badge: pendingAppsCount > 0 ? String(pendingAppsCount) : null,
      },
      {
        title: "Find Doctors",
        description: "Search qualified junior doctors",
        icon: Search,
        link: "/search",
        color: "bg-gradient-to-r from-emerald-500 to-emerald-600",
        urgent: false,
      },
    ];

    const stats = [
      {
        label: "Active Jobs",
        value: String(jobsPagination.total || 0),
        icon: Briefcase,
        trend:
          jobsData.length > 0 ? `${jobsData.length} recent` : "No jobs yet",
      },
      {
        label: "Total Applications",
        value: String(appsPagination.total || 0),
        icon: FileText,
        trend:
          pendingAppsCount > 0 ? `${pendingAppsCount} pending` : "All reviewed",
      },
      {
        label: "Profile Views",
        value: String(analyticsData?.data?.profileViews?.length || 0),
        icon: Eye,
        trend: "This month",
      },
      {
        label: "Success Rate",
        value: "94%",
        icon: Target,
        trend: "Above average",
      },
    ];

    return { quickActions, stats };
  };

  const getJuniorDoctorDashboard = () => {
    const applicationsData = myApplications?.data?.data || [];
    const recommendationsData = jobRecommendations?.data?.data || [];
    const appsPagination = myApplications?.data?.pagination || {};
    const { percentage: profileCompletion } = calculateProfileCompletion();

    // Count pending applications
    const pendingAppsCount =
      applicationsData.filter(
        (app) => app.status === "submitted" || app.status === "under_review"
      ).length || 0;

    const quickActions = [
      {
        title: "Browse Jobs",
        description: `${recommendationsData.length} new opportunities`,
        icon: Search,
        link: "/jobs",
        color: "bg-gradient-to-r from-blue-500 to-blue-600",
        urgent: false,
        badge:
          recommendationsData.length > 0
            ? String(recommendationsData.length)
            : null,
      },
      {
        title: "My Applications",
        description: `${appsPagination.total || 0} total applications`,
        icon: FileText,
        link: "/applications",
        color: "bg-gradient-to-r from-purple-500 to-purple-600",
        urgent: pendingAppsCount > 0,
        badge: pendingAppsCount > 0 ? String(pendingAppsCount) : null,
      },
      {
        title: "Complete Profile",
        description: `${100 - profileCompletion}% remaining`,
        icon: User,
        link: "/profile",
        color: "bg-gradient-to-r from-emerald-500 to-emerald-600",
        urgent: profileCompletion < 80,
      },
      {
        title: "Skill Assessment",
        description: "Verify your expertise",
        icon: Award,
        link: "/assessments",
        color: "bg-gradient-to-r from-purple-500 to-purple-600",
        urgent: false,
      },
    ];

    const stats = [
      {
        label: "Profile Views",
        value: String(analyticsData?.data?.recentViews || 0),
        icon: Eye,
        trend: "Last 30 days",
      },
      {
        label: "Applications",
        value: String(appsPagination.total || 0),
        icon: FileText,
        trend:
          pendingAppsCount > 0 ? `${pendingAppsCount} pending` : "All reviewed",
      },
      {
        label: "Profile Score",
        value: `${profileCompletion}%`,
        icon: Target,
        trend: profileCompletion >= 80 ? "Excellent" : "Needs improvement",
      },
      {
        label: "Match Rate",
        value: "85%",
        icon: Star,
        trend: "Above average",
      },
    ];

    return { quickActions, stats };
  };

  const getAdminDashboard = () => {
    const dashData = adminDashboardData?.data || {};
    const pendingData = pendingVerifications?.data?.data || [];
    const pendingCount = pendingVerifications?.data?.pagination?.total || 0;

    const quickActions = [
      {
        title: "Pending Verifications",
        description: `${pendingCount} doctors awaiting verification`,
        icon: Shield,
        link: "/admin/verifications",
        color: "bg-gradient-to-r from-red-500 to-red-600",
        urgent: pendingCount > 0,
        badge: pendingCount > 0 ? String(pendingCount) : null,
      },
      {
        title: "User Management",
        description: `${dashData.totalUsers || 0} registered users`,
        icon: Users,
        link: "/admin/users",
        color: "bg-gradient-to-r from-blue-500 to-blue-600",
        urgent: false,
      },
      {
        title: "Platform Analytics",
        description: "View system metrics",
        icon: BarChart3,
        link: "/admin/analytics",
        color: "bg-gradient-to-r from-emerald-500 to-emerald-600",
        urgent: false,
      },
      {
        title: "Job Moderation",
        description: `${dashData.activeJobs || 0} active jobs`,
        icon: Briefcase,
        link: "/admin/jobs",
        color: "bg-gradient-to-r from-amber-500 to-amber-600",
        urgent: false,
      },
    ];

    const stats = [
      {
        label: "Total Users",
        value: String(dashData.totalUsers || 0),
        icon: Users,
        trend: dashData.newUsersThisWeek
          ? `+${dashData.newUsersThisWeek} this week`
          : "No data",
      },
      {
        label: "Pending Reviews",
        value: String(pendingCount),
        icon: Clock,
        trend: pendingCount > 5 ? "Urgent" : "On track",
      },
      {
        label: "Active Jobs",
        value: String(dashData.activeJobs || 0),
        icon: Briefcase,
        trend: "Platform-wide",
      },
      {
        label: "Platform Health",
        value: "98.9%",
        icon: Activity,
        trend: "All systems operational",
      },
    ];

    return { quickActions, stats };
  };

  // --------------------------------------------------------------------------
  // GET DASHBOARD CONTENT BASED ON ROLE
  // --------------------------------------------------------------------------
  const getDashboardContent = () => {
    if (isSenior()) return getSeniorDoctorDashboard();
    if (isJunior()) return getJuniorDoctorDashboard();
    if (isAdmin()) return getAdminDashboard();
    return getJuniorDoctorDashboard(); // Default
  };

  // --------------------------------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------------------------------
  if (!user || profileLoading) {
    return <DashboardSkeleton />;
  }

  // --------------------------------------------------------------------------
  // GET DASHBOARD DATA
  // --------------------------------------------------------------------------
  const { quickActions, stats } = getDashboardContent();
  const { percentage: profileCompletion, missing: incompleteSections } =
    calculateProfileCompletion();

  // --------------------------------------------------------------------------
  // RECENT ACTIVITY (Real data when available)
  // --------------------------------------------------------------------------
  const getRecentActivity = () => {
    if (isSenior()) {
      const applications = receivedApplications?.data?.data || [];
      return applications.slice(0, 3).map((app) => ({
        icon: FileText,
        iconBg: "bg-green-100",
        iconColor: "text-green-600",
        title: "New application received",
        description: `Dr. ${app.applicant_id?.firstName} ${app.applicant_id?.lastName} applied for "${app.job_id?.title}"`,
        time: new Date(app.createdAt).toLocaleString(),
      }));
    }

    if (isJunior()) {
      const applications = myApplications?.data?.data || [];
      return applications.slice(0, 3).map((app) => ({
        icon: app.status === "accepted" ? CheckCircle : Clock,
        iconBg: app.status === "accepted" ? "bg-green-100" : "bg-blue-100",
        iconColor:
          app.status === "accepted" ? "text-green-600" : "text-blue-600",
        title: `Application ${app.status}`,
        description: `Your application for "${app.job_id?.title}"`,
        time: new Date(app.updatedAt).toLocaleString(),
      }));
    }

    if (isAdmin()) {
      const pending = pendingVerifications?.data?.data || [];
      return pending.slice(0, 3).map((user) => ({
        icon: Shield,
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
        title: "New verification request",
        description: `Dr. ${user.firstName} ${user.lastName} submitted documents`,
        time: user.documents?.[0]?.uploadedAt
          ? new Date(user.documents[0].uploadedAt).toLocaleString()
          : "Recently",
      }));
    }

    return [];
  };

  const recentActivity = getRecentActivity();

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------
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

              {!isAdmin() && (
                <div className="hidden sm:flex items-center">
                  {getVerificationBadge(
                    user?.verificationStatus?.overall || "pending"
                  )}
                </div>
              )}
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
                {recentActivity.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {recentActivity.length}
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
                  {isSenior()
                    ? "Ready to find exceptional junior doctors for your practice?"
                    : isJunior()
                    ? "Discover new opportunities to advance your medical career."
                    : "Welcome to your administrative dashboard."}
                </p>
              </div>

              {/* Profile Completion - Only for non-admin users */}
              {!isAdmin() && profileCompletion < 100 && (
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
                      className="group relative bg-white rounded-xl shadow-sm border-slate-200 p-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
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
                  to={isAdmin() ? "/admin/activity" : "/activity"}
                  className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center"
                >
                  View all <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              <div className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => {
                    const Icon = activity.icon;
                    return (
                      <div
                        key={index}
                        className="flex items-start space-x-4 p-3 bg-slate-50 rounded-lg"
                      >
                        <div
                          className={`w-8 h-8 ${activity.iconBg} rounded-lg flex items-center justify-center flex-shrink-0`}
                        >
                          <Icon className={`w-4 h-4 ${activity.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900">
                            {activity.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {activity.description} • {activity.time}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Activity className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-sm text-slate-600">No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Complete Your Profile Section */}
            {!isAdmin() &&
              profileCompletion < 100 &&
              incompleteSections.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">
                    Complete Your Profile
                  </h3>
                  <div className="space-y-3">
                    {incompleteSections.map((section, index) => {
                      // ✅ Handle both string and object formats
                      const sectionTitle =
                        typeof section === "string" ? section : section.title;
                      const sectionKey =
                        typeof section === "string" ? section : section.key;

                      return (
                        <Link
                          key={sectionKey || index}
                          to="/profile"
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors group"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 border-2 border-slate-300 rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-slate-300 rounded-full"></div>
                            </div>
                            <span className="text-sm font-medium text-slate-900">
                              {sectionTitle}
                            </span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}

            {/* Notifications */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900">
                  Notifications
                </h3>
                {recentActivity.length > 0 && (
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    {recentActivity.length} New
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {recentActivity.slice(0, 3).map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0 mt-2"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900">
                        {activity.title}
                      </p>
                      <p className="text-xs text-slate-500">{activity.time}</p>
                    </div>
                  </div>
                ))}

                {recentActivity.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No new notifications
                  </p>
                )}
              </div>

              {recentActivity.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <Link
                    to="/notifications"
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                  >
                    View all notifications{" "}
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Link>
                </div>
              )}
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

                {!isAdmin() && (
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
            {!isAdmin() && user?.verificationStatus?.overall !== "verified" && (
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

            {/* Verified Professional Badge */}
            {!isAdmin() && user?.verificationStatus?.overall === "verified" && (
              <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-emerald-900 mb-2">
                    Verified Professional
                  </h3>
                  <p className="text-sm text-emerald-700 mb-4">
                    Your profile is verified and you're ready to connect!
                  </p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="text-center">
                      <div className="text-lg font-bold text-emerald-800">
                        {analyticsData?.data?.recentViews || 0}
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
                  {isJunior() && (
                    <Link
                      to="/jobs"
                      className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white text-sm font-medium rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Find Opportunities <Search className="w-3 h-3 ml-1" />
                    </Link>
                  )}
                  {isSenior() && (
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

        {/* Admin System Overview */}
        {isAdmin() && adminDashboardData?.data && (
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
                        {pendingVerifications?.data?.pagination?.total || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">
                        Support Tickets
                      </span>
                      <span className="text-sm font-semibold text-amber-600">
                        {adminDashboardData.data.supportTickets || 0}
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
                      <span className="text-sm text-slate-700">Status</span>
                      <span className="text-sm font-semibold text-green-600">
                        Operational
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
                        +{adminDashboardData.data.newUsersThisWeek || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-700">
                        Active Jobs
                      </span>
                      <span className="text-sm font-semibold text-blue-600">
                        {adminDashboardData.data.activeJobs || 0}
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

// ============================================================================
// EXPORT
// ============================================================================
export default Dashboard;
