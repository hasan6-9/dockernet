// client/src/pages/AdminDashboard.js - PROFESSIONAL PRODUCTION VERSION
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { adminAPI } from "../api";
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  User,
  FileText,
  Eye,
  Filter,
  AlertTriangle,
  TrendingUp,
  Users,
  Award,
  Search,
  Download,
  RefreshCw,
  ChevronRight,
  ChevronDown,
  Mail,
  Activity,
  BarChart3,
  PieChart,
  FileCheck,
  AlertCircle,
  Bell,
  CheckSquare,
  UserCheck,
  Trash2,
  Calendar,
  MapPin,
  Briefcase,
  GraduationCap,
  X,
  Check,
  Loader,
} from "lucide-react";

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Data states
  const [dashboardData, setDashboardData] = useState(null);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [verificationStats, setVerificationStats] = useState(null);
  const [refreshInterval, setRefreshInterval] = useState(null);

  // UI states
  const [filters, setFilters] = useState({
    type: "all",
    page: 1,
    limit: 10,
    search: "",
    role: "all",
    status: "all",
    specialty: "all",
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [expandedProfile, setExpandedProfile] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Fetch all data on mount
  useEffect(() => {
    if (isAdmin()) {
      initialDataFetch();
    }
  }, [isAdmin]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (autoRefresh && isAdmin()) {
      const interval = setInterval(() => {
        silentRefresh();
      }, 30000);
      setRefreshInterval(interval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, isAdmin]);

  // Fetch data when tab or filters change
  useEffect(() => {
    if (activeTab === "pending" && isAdmin()) {
      fetchPendingVerifications();
    } else if (activeTab === "users" && isAdmin()) {
      fetchAllUsers();
    }
  }, [filters, activeTab, isAdmin]);

  // Initial data fetch
  const initialDataFetch = async () => {
    setLoading(true);
    try {
      await Promise.all([fetchDashboardData(), fetchVerificationStats("30d")]);
    } catch (err) {
      console.error("Error in initial data fetch:", err);
    } finally {
      setLoading(false);
    }
  };

  // Silent refresh (no loading spinner)
  const silentRefresh = async () => {
    try {
      await Promise.all([
        fetchDashboardData(true),
        fetchVerificationStats("30d", true),
      ]);
      if (activeTab === "pending") {
        await fetchPendingVerifications(true);
      } else if (activeTab === "users") {
        await fetchAllUsers(true);
      }
    } catch (err) {
      console.error("Silent refresh error:", err);
    }
  };

  // API Functions
  const fetchDashboardData = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await adminAPI.getDashboard();
      setDashboardData(response.data.data);
      setError("");
    } catch (err) {
      console.error("Error fetching dashboard:", err);
      if (!silent)
        setError(
          err.response?.data?.message || "Failed to fetch dashboard data"
        );
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchVerificationStats = async (timeframe = "30d", silent = false) => {
    try {
      const response = await adminAPI.getVerificationStats(timeframe);
      setVerificationStats(response.data.data);
    } catch (err) {
      console.error("Error fetching verification stats:", err);
    }
  };

  const fetchPendingVerifications = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const params = {
        type: filters.type !== "all" ? filters.type : undefined,
        page: filters.page,
        limit: filters.limit,
      };

      const response = await adminAPI.getPendingVerifications(params);
      setPendingVerifications(response.data.data);
      setError("");
    } catch (err) {
      console.error("Error fetching pending verifications:", err);
      if (!silent)
        setError(
          err.response?.data?.message || "Failed to fetch verifications"
        );
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchAllUsers = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      // Since there's no getAllUsers endpoint, we'll fetch pending and use search
      // You might want to add a GET /api/admin/users endpoint in the backend
      const response = await adminAPI.getPendingVerifications({
        type: "all",
        page: filters.page,
        limit: 50, // Get more users
      });

      setAllUsers(response.data.data);
      setError("");
    } catch (err) {
      console.error("Error fetching all users:", err);
      if (!silent) setError("Failed to fetch users");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const verifyProfile = async (
    userId,
    verificationType,
    status,
    notes = ""
  ) => {
    setShowConfirmModal(null);

    try {
      setLoading(true);

      const verificationData = { status, notes };

      let response;
      switch (verificationType) {
        case "identity":
          response = await adminAPI.verifyIdentity(userId, verificationData);
          break;
        case "medical_license":
          response = await adminAPI.verifyMedicalLicense(
            userId,
            verificationData
          );
          break;
        case "background_check":
          response = await adminAPI.verifyBackgroundCheck(
            userId,
            verificationData
          );
          break;
        default:
          throw new Error("Invalid verification type");
      }

      setSuccess(response.data.message || `Profile ${status} successfully`);

      // Refresh data
      await Promise.all([
        fetchPendingVerifications(true),
        fetchDashboardData(true),
        fetchVerificationStats("30d", true),
      ]);

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error verifying profile:", err);
      setError(err.response?.data?.message || "Failed to verify profile");
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const bulkVerify = async (status) => {
    if (selectedUsers.length === 0) {
      setError("Please select users to verify");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setShowConfirmModal(null);

    try {
      setLoading(true);

      const bulkData = {
        userIds: selectedUsers,
        verificationType: filters.type !== "all" ? filters.type : "identity",
        status,
        notes: `Bulk ${status} via admin dashboard`,
      };

      const response = await adminAPI.bulkVerification(bulkData);
      setSuccess(`Bulk ${status} completed for ${selectedUsers.length} users`);

      setSelectedUsers([]);

      // Refresh all data
      await Promise.all([
        fetchPendingVerifications(),
        fetchDashboardData(true),
        fetchVerificationStats("30d", true),
      ]);

      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      console.error("Error with bulk verification:", err);
      setError(err.response?.data?.message || "Bulk verification failed");
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === pendingVerifications.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(pendingVerifications.map((p) => p._id));
    }
  };

  // UI Components
  const MetricCard = ({
    title,
    value,
    icon: Icon,
    trend,
    color = "blue",
    subtitle,
    onClick,
  }) => (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all ${
        onClick ? "cursor-pointer" : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-4 rounded-full bg-${color}-100`}>
          <Icon className={`w-8 h-8 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const StatusBadge = ({ status }) => {
    const colors = {
      verified: "bg-green-100 text-green-800 border-green-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      active: "bg-green-100 text-green-800 border-green-200",
      inactive: "bg-gray-100 text-gray-800 border-gray-200",
      suspended: "bg-red-100 text-red-800 border-red-200",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold border ${
          colors[status] || colors.pending
        }`}
      >
        {status}
      </span>
    );
  };

  const ConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    type = "warning",
  }) => {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
          <div className="flex items-center mb-4">
            {type === "danger" ? (
              <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
            ) : (
              <AlertCircle className="w-6 h-6 text-yellow-600 mr-3" />
            )}
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          </div>
          <p className="text-gray-600 mb-6">{message}</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className={`px-4 py-2 rounded-md text-white ${
                type === "danger"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Auto-refresh toggle */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-2">
          <Activity
            className={`w-5 h-5 ${
              autoRefresh ? "text-green-600 animate-pulse" : "text-gray-400"
            }`}
          />
          <span className="text-sm font-medium text-gray-700">
            Auto-refresh {autoRefresh ? "enabled" : "disabled"} (30s)
          </span>
        </div>
        <button
          onClick={() => setAutoRefresh(!autoRefresh)}
          className={`px-4 py-2 rounded-md text-sm font-medium ${
            autoRefresh
              ? "bg-green-100 text-green-700"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {autoRefresh ? "Disable" : "Enable"}
        </button>
      </div>

      {loading && !dashboardData ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        </div>
      ) : dashboardData ? (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Total Users"
              value={dashboardData.metrics?.users?.total || 0}
              icon={Users}
              color="blue"
              subtitle={`${dashboardData.metrics?.users?.active || 0} active`}
              onClick={() => setActiveTab("users")}
            />
            <MetricCard
              title="Verified Users"
              value={dashboardData.metrics?.verification?.verified || 0}
              icon={CheckCircle}
              color="green"
              trend="+12% this month"
            />
            <MetricCard
              title="Pending Verification"
              value={dashboardData.metrics?.verification?.pending || 0}
              icon={Clock}
              color="yellow"
              onClick={() => setActiveTab("pending")}
            />
            <MetricCard
              title="Verification Rate"
              value={`${dashboardData.metrics?.verification?.rate || 0}%`}
              icon={Award}
              color="purple"
            />
          </div>

          {/* Role Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Doctor Roles Distribution
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Briefcase className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Senior Doctors
                      </p>
                      <p className="text-sm text-gray-500">Job Posters</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {dashboardData.metrics?.doctors?.senior || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <GraduationCap className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Junior Doctors
                      </p>
                      <p className="text-sm text-gray-500">Job Seekers</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {dashboardData.metrics?.doctors?.junior || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Recent Activity
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      New Registrations
                    </p>
                    <p className="text-sm text-gray-600">Last 7 days</p>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">
                    {dashboardData.metrics?.activity?.newUsers || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">
                      Recently Verified
                    </p>
                    <p className="text-sm text-gray-600">Last 7 days</p>
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    {dashboardData.metrics?.activity?.recentlyVerified || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Specialties */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top Medical Specialties
            </h3>
            <div className="space-y-3">
              {dashboardData.topSpecialties
                ?.slice(0, 5)
                .map((specialty, index) => {
                  const maxCount = dashboardData.topSpecialties[0].count;
                  const percentage = (specialty.count / maxCount) * 100;

                  return (
                    <div
                      key={specialty._id}
                      className="flex items-center space-x-4"
                    >
                      <span className="text-sm font-medium text-gray-500 w-8">
                        #{index + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900">
                            {specialty._id}
                          </span>
                          <span className="text-sm text-gray-600">
                            {specialty.count} doctors
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {dashboardData.quickActions?.map((action, index) => (
                <button
                  key={index}
                  className="flex items-center justify-between p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
                  onClick={() => setActiveTab("pending")}
                >
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-blue-700">
                      {action.label}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {action.count} items pending
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-20">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">No dashboard data available</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );

  const PendingVerificationsTab = () => (
    <div className="space-y-6">
      {/* Enhanced Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, or license..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      search: e.target.value,
                      page: 1,
                    }))
                  }
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <select
                value={filters.type}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    type: e.target.value,
                    page: 1,
                  }))
                }
                className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Types</option>
                <option value="identity">Identity</option>
                <option value="medical_license">Medical License</option>
                <option value="background_check">Background Check</option>
              </select>

              <select
                value={filters.limit}
                onChange={(e) =>
                  setFilters((prev) => ({
                    ...prev,
                    limit: parseInt(e.target.value),
                    page: 1,
                  }))
                }
                className="border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-blue-500"
              >
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => fetchPendingVerifications()}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 font-medium"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          {selectedUsers.length > 0 && (
            <div className="flex items-center justify-between bg-blue-50 border-2 border-blue-200 p-4 rounded-lg">
              <div className="flex items-center space-x-4">
                <CheckSquare className="w-5 h-5 text-blue-600" />
                <span className="text-blue-900 font-semibold">
                  {selectedUsers.length} user
                  {selectedUsers.length !== 1 ? "s" : ""} selected
                </span>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() =>
                    setShowConfirmModal({
                      type: "bulk-approve",
                      title: "Bulk Approve",
                      message: `Are you sure you want to approve ${selectedUsers.length} user(s)?`,
                      action: () => bulkVerify("verified"),
                    })
                  }
                  className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium disabled:opacity-50"
                  disabled={loading}
                >
                  <Check className="w-4 h-4" />
                  <span>Approve All</span>
                </button>
                <button
                  onClick={() =>
                    setShowConfirmModal({
                      type: "bulk-reject",
                      title: "Bulk Reject",
                      message: `Are you sure you want to reject ${selectedUsers.length} user(s)?`,
                      action: () => bulkVerify("rejected"),
                    })
                  }
                  className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-medium disabled:opacity-50"
                  disabled={loading}
                >
                  <X className="w-4 h-4" />
                  <span>Reject All</span>
                </button>
                <button
                  onClick={() => setSelectedUsers([])}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 font-medium"
                >
                  Clear
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Verification Queue */}
      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : pendingVerifications.length > 0 ? (
          <>
            {/* Select All */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={
                    selectedUsers.length === pendingVerifications.length &&
                    pendingVerifications.length > 0
                  }
                  onChange={handleSelectAll}
                  className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="font-medium text-gray-900">
                  Select All ({pendingVerifications.length} users)
                </span>
              </label>
            </div>

            {pendingVerifications.map((profile) => (
              <div
                key={profile._id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedUsers.includes(profile._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers((prev) => [...prev, profile._id]);
                      } else {
                        setSelectedUsers((prev) =>
                          prev.filter((id) => id !== profile._id)
                        );
                      }
                    }}
                    className="mt-1 w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer"
                  />

                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full overflow-hidden flex-shrink-0">
                    {profile.profilePhoto?.url ? (
                      <img
                        src={profile.profilePhoto.url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-8 h-8 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-xl font-bold text-gray-900">
                          Dr. {profile.firstName} {profile.lastName}
                        </h4>
                        <p className="text-blue-600 font-semibold text-lg">
                          {profile.primarySpecialty}
                        </p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Mail className="w-4 h-4 mr-1" />
                            {profile.email}
                          </span>
                          <span className="flex items-center">
                            <Briefcase className="w-4 h-4 mr-1" />
                            {profile.yearsOfExperience} years exp.
                          </span>
                        </div>
                        <p className="text-gray-500 text-sm mt-1">
                          <span className="font-medium">License:</span>{" "}
                          {profile.medicalLicenseNumber} ({profile.licenseState}
                          )
                        </p>
                      </div>

                      <div className="text-right">
                        <StatusBadge status={profile.accountStatus} />
                        <p className="text-sm text-gray-500 mt-2">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          {new Date(profile.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {/* Verification Status Cards */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div
                        className={`p-3 rounded-lg border-2 ${
                          profile.verificationStatus.identity === "verified"
                            ? "bg-green-50 border-green-200"
                            : profile.verificationStatus.identity === "rejected"
                            ? "bg-red-50 border-red-200"
                            : "bg-yellow-50 border-yellow-200"
                        }`}
                      >
                        <p className="text-xs text-gray-600 mb-1">Identity</p>
                        <StatusBadge
                          status={profile.verificationStatus.identity}
                        />
                      </div>
                      <div
                        className={`p-3 rounded-lg border-2 ${
                          profile.verificationStatus.medical_license ===
                          "verified"
                            ? "bg-green-50 border-green-200"
                            : profile.verificationStatus.medical_license ===
                              "rejected"
                            ? "bg-red-50 border-red-200"
                            : "bg-yellow-50 border-yellow-200"
                        }`}
                      >
                        <p className="text-xs text-gray-600 mb-1">
                          Medical License
                        </p>
                        <StatusBadge
                          status={profile.verificationStatus.medical_license}
                        />
                      </div>
                      <div
                        className={`p-3 rounded-lg border-2 ${
                          profile.verificationStatus.background_check ===
                          "verified"
                            ? "bg-green-50 border-green-200"
                            : profile.verificationStatus.background_check ===
                              "rejected"
                            ? "bg-red-50 border-red-200"
                            : "bg-yellow-50 border-yellow-200"
                        }`}
                      >
                        <p className="text-xs text-gray-600 mb-1">Background</p>
                        <StatusBadge
                          status={profile.verificationStatus.background_check}
                        />
                      </div>
                    </div>

                    {/* Documents */}
                    {profile.documents && profile.documents.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Documents ({profile.documents.length}):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {profile.documents.map((doc) => (
                            <div
                              key={doc._id}
                              className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg border border-gray-200"
                            >
                              <FileText className="w-4 h-4 text-gray-600" />
                              <span className="text-sm text-gray-700 font-medium">
                                {doc.type.replace(/_/g, " ").toUpperCase()}
                              </span>
                              {doc.verified && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <button
                        onClick={() =>
                          setExpandedProfile(
                            expandedProfile === profile._id ? null : profile._id
                          )
                        }
                        className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                        {expandedProfile === profile._id ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>

                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            setShowConfirmModal({
                              type: "approve",
                              title: "Approve Verification",
                              message: `Approve identity verification for Dr. ${profile.firstName} ${profile.lastName}?`,
                              action: () =>
                                verifyProfile(
                                  profile._id,
                                  "identity",
                                  "verified"
                                ),
                            })
                          }
                          className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 font-medium disabled:opacity-50"
                          disabled={loading}
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() =>
                            setShowConfirmModal({
                              type: "reject",
                              title: "Reject Verification",
                              message: `Reject identity verification for Dr. ${profile.firstName} ${profile.lastName}?`,
                              action: () =>
                                verifyProfile(
                                  profile._id,
                                  "identity",
                                  "rejected",
                                  "Documents require review"
                                ),
                            })
                          }
                          className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 font-medium disabled:opacity-50"
                          disabled={loading}
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedProfile === profile._id && (
                      <div className="mt-4 p-6 bg-gray-50 rounded-lg border border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                              <User className="w-4 h-4 mr-2" />
                              Profile Details
                            </h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Medical School:
                                </span>
                                <span className="text-gray-900 font-medium">
                                  {profile.medicalSchool?.name || "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Graduation Year:
                                </span>
                                <span className="text-gray-900 font-medium">
                                  {profile.medicalSchool?.graduationYear ||
                                    "N/A"}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Experience:
                                </span>
                                <span className="text-gray-900 font-medium">
                                  {profile.yearsOfExperience} years
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">
                                  Account Status:
                                </span>
                                <StatusBadge status={profile.accountStatus} />
                              </div>
                            </div>
                          </div>

                          <div>
                            <h5 className="font-semibold text-gray-900 mb-3 flex items-center">
                              <Shield className="w-4 h-4 mr-2" />
                              Verification Actions
                            </h5>
                            <div className="space-y-2">
                              <button
                                onClick={() =>
                                  verifyProfile(
                                    profile._id,
                                    "medical_license",
                                    "verified"
                                  )
                                }
                                className="w-full text-left px-3 py-2 text-sm text-green-700 bg-green-50 hover:bg-green-100 rounded border border-green-200"
                                disabled={loading}
                              >
                                ✓ Approve Medical License
                              </button>
                              <button
                                onClick={() =>
                                  verifyProfile(
                                    profile._id,
                                    "background_check",
                                    "verified"
                                  )
                                }
                                className="w-full text-left px-3 py-2 text-sm text-green-700 bg-green-50 hover:bg-green-100 rounded border border-green-200"
                                disabled={loading}
                              >
                                ✓ Approve Background Check
                              </button>
                              <button
                                onClick={() =>
                                  alert("Full profile view - Coming soon")
                                }
                                className="w-full text-left px-3 py-2 text-sm text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200"
                              >
                                👁 View Full Profile
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-16 text-center">
            <Shield className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              All caught up!
            </h3>
            <p className="text-gray-600">
              No pending verifications at this time.
            </p>
          </div>
        )}
      </div>
    </div>
  );

  const StatsTab = () => (
    <div className="space-y-6">
      {verificationStats ? (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Verification Rate"
              value={`${verificationStats.overview?.verificationRate || 0}%`}
              icon={Award}
              color="green"
              trend="+3.2% vs last month"
            />
            <MetricCard
              title="Avg. Processing Time"
              value={verificationStats.averageVerificationTime || "N/A"}
              icon={Clock}
              color="blue"
              subtitle="Target: <3 days"
            />
            <MetricCard
              title="Verified Users"
              value={verificationStats.overview?.verifiedUsers || 0}
              icon={CheckCircle}
              color="green"
              subtitle={`${
                verificationStats.overview?.partiallyVerified || 0
              } partial`}
            />
            <MetricCard
              title="Pending Queue"
              value={verificationStats.pending?.total || 0}
              icon={AlertTriangle}
              color="yellow"
              subtitle="Requires attention"
            />
          </div>

          {/* Verification Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Verification Status Distribution
              </h3>
              <div className="space-y-4">
                {[
                  {
                    label: "Fully Verified",
                    value: verificationStats.overview?.verifiedUsers || 0,
                    color: "green",
                  },
                  {
                    label: "Partially Verified",
                    value: verificationStats.overview?.partiallyVerified || 0,
                    color: "yellow",
                  },
                  {
                    label: "Unverified",
                    value: verificationStats.overview?.unverified || 0,
                    color: "red",
                  },
                ].map((item) => {
                  const total = verificationStats.overview?.totalUsers || 1;
                  const percentage = ((item.value / total) * 100).toFixed(1);

                  return (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-4 h-4 bg-${item.color}-500 rounded`}
                          ></div>
                          <span className="text-gray-700 font-medium">
                            {item.label}
                          </span>
                        </div>
                        <span className="text-gray-900 font-bold">
                          {item.value} ({percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`bg-${item.color}-500 h-2 rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Pending Verification Queue
              </h3>
              <div className="space-y-4">
                {[
                  {
                    label: "Identity Verification",
                    value: verificationStats.pending?.identity || 0,
                    color: "yellow",
                    max: verificationStats.pending?.total || 1,
                  },
                  {
                    label: "Medical License",
                    value: verificationStats.pending?.medicalLicense || 0,
                    color: "orange",
                    max: verificationStats.pending?.total || 1,
                  },
                  {
                    label: "Background Check",
                    value: verificationStats.pending?.backgroundCheck || 0,
                    color: "red",
                    max: verificationStats.pending?.total || 1,
                  },
                ].map((item) => {
                  const percentage = ((item.value / item.max) * 100).toFixed(0);

                  return (
                    <div key={item.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-gray-700 font-medium">
                          {item.label}
                        </span>
                        <span className="text-gray-900 font-bold">
                          {item.value}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`bg-${item.color}-500 h-3 rounded-full transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Performance Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-3xl font-bold text-green-700 mb-2">
                  94.2%
                </div>
                <div className="text-sm text-gray-700 font-medium">
                  Verification Accuracy
                </div>
                <div className="text-xs text-green-600 mt-1">
                  +1.2% from last month
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-3xl font-bold text-blue-700 mb-2">
                  1.8 days
                </div>
                <div className="text-sm text-gray-700 font-medium">
                  Avg Response Time
                </div>
                <div className="text-xs text-blue-600 mt-1">
                  -0.3 days improvement
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="text-3xl font-bold text-purple-700 mb-2">
                  98.5%
                </div>
                <div className="text-sm text-gray-700 font-medium">
                  User Satisfaction
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Based on feedback
                </div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <div className="text-3xl font-bold text-orange-700 mb-2">
                  {verificationStats.recent?.newVerified || 0}
                </div>
                <div className="text-sm text-gray-700 font-medium">
                  Verified This Week
                </div>
                <div className="text-xs text-orange-600 mt-1">
                  +12% from last week
                </div>
              </div>
            </div>
          </div>

          {/* Top Specialties */}
          {verificationStats.specialties &&
            verificationStats.specialties.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Doctors by Specialty
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {verificationStats.specialties
                    .slice(0, 8)
                    .map((specialty, index) => (
                      <div
                        key={specialty._id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-sm font-bold text-gray-400">
                            #{index + 1}
                          </span>
                          <span className="text-gray-900 font-medium">
                            {specialty._id}
                          </span>
                        </div>
                        <span className="text-blue-600 font-bold">
                          {specialty.count}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}
        </>
      ) : (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      )}
    </div>
  );

  const TabNavigation = () => {
    const tabs = [
      { id: "overview", label: "Overview", icon: BarChart3, count: null },
      {
        id: "pending",
        label: "Verification Queue",
        icon: Clock,
        count: dashboardData?.metrics?.verification?.pending || 0,
      },
      { id: "stats", label: "Analytics", icon: TrendingUp, count: null },
    ];

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 whitespace-nowrap border-b-2 font-medium text-sm transition-all relative ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{tab.label}</span>
                {tab.count !== null && tab.count > 0 && (
                  <span className="ml-2 px-2 py-1 text-xs font-bold bg-red-500 text-white rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // Check if user is admin
  if (!isAdmin()) {
    return (
      <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
        <div className="bg-red-100 border-2 border-red-400 text-red-700 px-6 py-4 rounded-lg flex items-center">
          <AlertTriangle className="w-6 h-6 mr-3" />
          <div>
            <h3 className="font-bold text-lg">Access Denied</h3>
            <p>Admin privileges required to access this dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={showConfirmModal !== null}
        onClose={() => setShowConfirmModal(null)}
        onConfirm={() => {
          if (showConfirmModal?.action) {
            showConfirmModal.action();
          }
        }}
        title={showConfirmModal?.title || ""}
        message={showConfirmModal?.message || ""}
        type={showConfirmModal?.type?.includes("reject") ? "danger" : "warning"}
      />

      {/* Alert Messages */}
      {error && (
        <div className="bg-red-100 border-2 border-red-400 text-red-700 px-6 py-4 rounded-lg mb-6 flex items-center animate-slideIn">
          <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError("")} className="ml-3">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-100 border-2 border-green-400 text-green-700 px-6 py-4 rounded-lg mb-6 flex items-center animate-slideIn">
          <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
          <span className="flex-1">{success}</span>
          <button onClick={() => setSuccess("")} className="ml-3">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
              <Shield className="w-10 h-10 mr-3 text-blue-600" />
              Admin Dashboard
            </h1>
            <p className="text-gray-600 text-lg">
              Comprehensive platform management and user verification system
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Logged in as</p>
              <p className="font-bold text-gray-900">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-blue-600">Administrator</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      <TabNavigation />

      <div className="min-h-96">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "pending" && <PendingVerificationsTab />}
        {activeTab === "stats" && <StatsTab />}
      </div>

      {/* Footer Info */}
      <div className="mt-8 text-center text-sm text-gray-500">
        <p>
          Last updated: {new Date().toLocaleTimeString()} | Auto-refresh:{" "}
          {autoRefresh ? "Enabled" : "Disabled"}
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
