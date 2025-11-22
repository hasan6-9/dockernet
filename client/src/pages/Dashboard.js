// client/src/pages/Dashboard.js - MVP Testing Version
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../context/AuthContext";
import {
  profileAPI,
  jobAPI,
  applicationAPI,
  adminAPI,
  handleApiError,
} from "../api";
import {
  User,
  Briefcase,
  FileText,
  Search,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  TrendingUp,
  Users,
  Shield,
  ArrowRight,
  Loader,
  AlertCircle,
  LogOut,
} from "lucide-react";

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout, isJunior, isSenior, isAdmin } = useAuth();

  // Fetch profile data for all users
  const { data: profileData } = useQuery({
    queryKey: ["profile", "me"],
    queryFn: () => profileAPI.getMe(),
    enabled: !!user && !isAdmin(),
  });

  const profile = profileData?.data?.data || profileData?.data || user;

  // Role-specific data fetching
  const { data: myApplicationsData } = useQuery({
    queryKey: ["my-applications", "dashboard"],
    queryFn: () => applicationAPI.getMyApplications({ limit: 5 }),
    enabled: isJunior(),
  });

  const { data: jobRecommendationsData } = useQuery({
    queryKey: ["job-recommendations", "dashboard"],
    queryFn: () => jobAPI.getRecommendations({ limit: 5 }),
    enabled: isJunior(),
  });

  const { data: myJobsData } = useQuery({
    queryKey: ["my-jobs", "dashboard"],
    queryFn: () => jobAPI.getMyJobs({ limit: 5 }),
    enabled: isSenior(),
  });

  const { data: receivedApplicationsData } = useQuery({
    queryKey: ["received-applications", "dashboard"],
    queryFn: () => applicationAPI.getReceived({ limit: 5 }),
    enabled: isSenior(),
  });

  const { data: adminDashboardData } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminAPI.getDashboard(),
    enabled: isAdmin(),
  });

  const { data: pendingVerificationsData } = useQuery({
    queryKey: ["pending-verifications", "dashboard"],
    queryFn: () => adminAPI.getPendingVerifications({ limit: 5 }),
    enabled: isAdmin(),
  });

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-2xl font-bold text-blue-600">Doconnect</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                {user.firstName} {user.lastName} ({user.role})
              </span>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-red-600"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, Dr. {user.firstName}!
          </h2>
          <p className="text-gray-600">
            {isJunior() &&
              "Discover new opportunities to advance your medical career."}
            {isSenior() && "Manage your job postings and review applications."}
            {isAdmin() && "Oversee platform operations and user verifications."}
          </p>

          {!isAdmin() && profile?.profileCompletion && (
            <div className="mt-4 flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    Profile Completion
                  </span>
                  <span className="text-sm font-bold text-blue-600">
                    {profile.profileCompletion.percentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{
                      width: `${profile.profileCompletion.percentage}%`,
                    }}
                  />
                </div>
              </div>
              {profile.profileCompletion.percentage < 100 && (
                <Link to="/profile" className="btn-primary text-sm">
                  Complete Profile
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Role-Based Dashboard */}
        {isJunior() && (
          <JuniorDashboard
            user={user}
            profile={profile}
            myApplicationsData={myApplicationsData}
            jobRecommendationsData={jobRecommendationsData}
          />
        )}
        {isSenior() && (
          <SeniorDashboard
            user={user}
            profile={profile}
            myJobsData={myJobsData}
            receivedApplicationsData={receivedApplicationsData}
          />
        )}
        {isAdmin() && (
          <AdminDashboard
            adminDashboardData={adminDashboardData}
            pendingVerificationsData={pendingVerificationsData}
          />
        )}
      </main>
    </div>
  );
};

// ============================================================================
// JUNIOR DOCTOR DASHBOARD
// ============================================================================
const JuniorDashboard = ({
  user,
  profile,
  myApplicationsData,
  jobRecommendationsData,
}) => {
  const applications = myApplicationsData?.data?.data || [];
  const recommendations = jobRecommendationsData?.data?.data || [];
  const appsPagination = myApplicationsData?.data?.pagination || {};

  const stats = [
    {
      label: "Total Applications",
      value: appsPagination.total || 0,
      icon: FileText,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Pending",
      value: applications.filter(
        (a) => a.status === "submitted" || a.status === "under_review"
      ).length,
      icon: Clock,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      label: "Accepted",
      value: applications.filter((a) => a.status === "accepted").length,
      icon: CheckCircle,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Profile Views",
      value: profile?.analytics?.views?.total || 0,
      icon: Eye,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  const quickActions = [
    { label: "Browse Jobs", icon: Search, link: "/jobs", color: "bg-blue-600" },
    {
      label: "My Applications",
      icon: FileText,
      link: "/applications",
      color: "bg-purple-600",
    },
    {
      label: "Update Profile",
      icon: User,
      link: "/profile",
      color: "bg-emerald-600",
    },
    {
      label: "Search Doctors",
      icon: Users,
      link: "/search",
      color: "bg-indigo-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <Link
              key={idx}
              to={action.link}
              className={`${action.color} text-white rounded-xl p-6 hover:opacity-90 transition-opacity group`}
            >
              <Icon className="w-8 h-8 mb-3" />
              <h3 className="font-semibold text-lg mb-1">{action.label}</h3>
              <div className="flex items-center text-sm opacity-90">
                <span>Go now</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Applications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Recent Applications
            </h3>
            <Link
              to="/applications"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>

          {applications.length > 0 ? (
            <div className="space-y-3">
              {applications.map((app) => (
                <Link
                  key={app._id}
                  to={`/applications`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">
                        {app.job_id?.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {app.job_id?.specialty}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Applied: {new Date(app.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No applications yet</p>
              <Link to="/jobs" className="btn-primary text-sm">
                Browse Jobs
              </Link>
            </div>
          )}
        </div>

        {/* Job Recommendations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Recommended Jobs
            </h3>
            <Link
              to="/jobs"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>

          {recommendations.length > 0 ? (
            <div className="space-y-3">
              {recommendations.map((job) => (
                <Link
                  key={job._id}
                  to={`/jobs/${job._id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{job.title}</h4>
                    {job.matchScore && (
                      <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        {job.matchScore}% match
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{job.specialty}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-medium text-blue-600">
                      ${job.budget?.amount?.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500">
                      {job.timeline?.deadline &&
                        new Date(job.timeline.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No recommendations available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// SENIOR DOCTOR DASHBOARD
// ============================================================================
const SeniorDashboard = ({
  user,
  profile,
  myJobsData,
  receivedApplicationsData,
}) => {
  const jobs = myJobsData?.data?.data || [];
  const applications = receivedApplicationsData?.data?.data || [];
  const jobsPagination = myJobsData?.data?.pagination || {};
  const appsPagination = receivedApplicationsData?.data?.pagination || {};

  const activeJobs = jobs.filter((j) => j.status === "active").length;
  const pendingApps = applications.filter(
    (a) => a.status === "submitted" || a.status === "under_review"
  ).length;

  const stats = [
    {
      label: "Jobs Posted",
      value: jobsPagination.total || 0,
      icon: Briefcase,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Active Jobs",
      value: activeJobs,
      icon: TrendingUp,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Total Applications",
      value: appsPagination.total || 0,
      icon: FileText,
      color: "bg-purple-100 text-purple-600",
    },
    {
      label: "Pending Reviews",
      value: pendingApps,
      icon: Clock,
      color: "bg-yellow-100 text-yellow-600",
    },
  ];

  const quickActions = [
    {
      label: "Post New Job",
      icon: Plus,
      link: "/jobs/post",
      color: "bg-blue-600",
    },
    {
      label: "Manage Jobs",
      icon: Briefcase,
      link: "/jobs/manage",
      color: "bg-green-600",
    },
    {
      label: "Review Applications",
      icon: FileText,
      link: "/applications",
      color: "bg-purple-600",
    },
    {
      label: "Find Doctors",
      icon: Search,
      link: "/search",
      color: "bg-indigo-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                </div>
                <div
                  className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <Link
              key={idx}
              to={action.link}
              className={`${action.color} text-white rounded-xl p-6 hover:opacity-90 transition-opacity group`}
            >
              <Icon className="w-8 h-8 mb-3" />
              <h3 className="font-semibold text-lg mb-1">{action.label}</h3>
              <div className="flex items-center text-sm opacity-90">
                <span>Go now</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Jobs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Recent Jobs</h3>
            <Link
              to="/jobs/manage"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>

          {jobs.length > 0 ? (
            <div className="space-y-3">
              {jobs.map((job) => (
                <Link
                  key={job._id}
                  to={`/jobs/${job._id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{job.title}</h4>
                    <StatusBadge status={job.status} />
                  </div>
                  <p className="text-sm text-gray-600">{job.category}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-gray-500">
                      {job.applications_count || 0} applications
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">No jobs posted yet</p>
              <Link to="/jobs/post" className="btn-primary text-sm">
                Post Your First Job
              </Link>
            </div>
          )}
        </div>

        {/* Recent Applications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Recent Applications
            </h3>
            <Link
              to="/applications"
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>

          {applications.length > 0 ? (
            <div className="space-y-3">
              {applications.map((app) => (
                <Link
                  key={app._id}
                  to={`/applications`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Dr. {app.applicant_id?.firstName}{" "}
                        {app.applicant_id?.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {app.applicant_id?.primarySpecialty}
                      </p>
                    </div>
                    <StatusBadge status={app.status} />
                  </div>
                  <p className="text-xs text-gray-500">
                    Applied: {new Date(app.createdAt).toLocaleDateString()}
                  </p>
                  {app.match_score && (
                    <div className="mt-2">
                      <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-800 rounded-full">
                        {app.match_score}% match
                      </span>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No applications yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ADMIN DASHBOARD
// ============================================================================
const AdminDashboard = ({ adminDashboardData, pendingVerificationsData }) => {
  const dashData = adminDashboardData?.data || {};
  const pending = pendingVerificationsData?.data?.data || [];
  const pendingCount = pendingVerificationsData?.data?.pagination?.total || 0;

  const stats = [
    {
      label: "Total Users",
      value: dashData.metrics?.users?.total || 0,
      icon: Users,
      color: "bg-blue-100 text-blue-600",
      subtitle: `${dashData.metrics?.users?.active || 0} active`,
    },
    {
      label: "Pending Verifications",
      value: pendingCount,
      icon: Clock,
      color: "bg-yellow-100 text-yellow-600",
      urgent: pendingCount > 0,
    },
    {
      label: "Active Jobs",
      value: dashData.metrics?.jobs?.active || 0,
      icon: Briefcase,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Platform Health",
      value: "98.9%",
      icon: TrendingUp,
      color: "bg-purple-100 text-purple-600",
    },
  ];

  const quickActions = [
    {
      label: "Verification Dashboard",
      icon: Shield,
      link: "/admin",
      color: "bg-red-600",
      badge: pendingCount > 0 ? pendingCount : null,
    },
    {
      label: "User Management",
      icon: Users,
      link: "/admin/users",
      color: "bg-blue-600",
    },
    {
      label: "Platform Analytics",
      icon: TrendingUp,
      link: "/admin/analytics",
      color: "bg-green-600",
    },
    {
      label: "Job Moderation",
      icon: Briefcase,
      link: "/admin/jobs",
      color: "bg-purple-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`bg-white rounded-xl shadow-sm border p-6 ${
                stat.urgent ? "border-red-300" : "border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stat.value}
                  </p>
                  {stat.subtitle && (
                    <p className="text-xs text-gray-500 mt-1">
                      {stat.subtitle}
                    </p>
                  )}
                </div>
                <div
                  className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}
                >
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {quickActions.map((action, idx) => {
          const Icon = action.icon;
          return (
            <Link
              key={idx}
              to={action.link}
              className={`${action.color} text-white rounded-xl p-6 hover:opacity-90 transition-opacity group relative`}
            >
              {action.badge && (
                <div className="absolute top-3 right-3 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold">
                  {action.badge}
                </div>
              )}
              <Icon className="w-8 h-8 mb-3" />
              <h3 className="font-semibold text-lg mb-1">{action.label}</h3>
              <div className="flex items-center text-sm opacity-90">
                <span>Go now</span>
                <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pending Verification Queue */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            Pending Verifications
          </h3>
          <Link
            to="/admin"
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            View All
          </Link>
        </div>

        {pending.length > 0 ? (
          <div className="space-y-3">
            {pending.map((user) => (
              <Link
                key={user._id}
                to="/admin"
                className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Dr. {user.firstName} {user.lastName}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {user.primarySpecialty}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                      {user.verificationStatus?.identity === "pending" &&
                        "ID Pending"}
                      {user.verificationStatus?.medical_license === "pending" &&
                        "License Pending"}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No pending verifications</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// UTILITY COMPONENTS
// ============================================================================
const StatusBadge = ({ status }) => {
  const config = {
    submitted: { color: "bg-blue-100 text-blue-800", label: "Submitted" },
    under_review: {
      color: "bg-purple-100 text-purple-800",
      label: "Under Review",
    },
    accepted: { color: "bg-green-100 text-green-800", label: "Accepted" },
    rejected: { color: "bg-red-100 text-red-800", label: "Rejected" },
    active: { color: "bg-green-100 text-green-800", label: "Active" },
    closed: { color: "bg-gray-100 text-gray-800", label: "Closed" },
    completed: { color: "bg-blue-100 text-blue-800", label: "Completed" },
  };

  const { color, label } = config[status] || {
    color: "bg-gray-100 text-gray-800",
    label: status,
  };

  return (
    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${color}`}>
      {label}
    </span>
  );
};

export default Dashboard;
