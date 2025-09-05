import React, { useState, useEffect } from "react";
import {
  Shield,
  CheckCircle,
  XCircle,
  Clock,
  User,
  FileText,
  Eye,
  Filter,
  Calendar,
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
  Phone,
  MapPin,
  Star,
  Activity,
  Settings,
  Ban,
  UserCheck,
  UserX,
  MessageSquare,
  BarChart3,
  PieChart,
  FileCheck,
  AlertCircle,
  Plus,
  Edit3,
  Trash2,
  ExternalLink,
  Bell,
  CheckSquare,
  Square,
} from "lucide-react";

// Mock auth context
const useAuth = () => ({
  user: { id: "1", role: "admin", firstName: "Admin", lastName: "User" },
  token: "mock-admin-token",
});

const AdminDashboard = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Dashboard data states
  const [dashboardData, setDashboardData] = useState(null);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [verificationStats, setVerificationStats] = useState(null);
  const [userList, setUserList] = useState([]);
  const [adminNotifications, setAdminNotifications] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [platformMetrics, setPlatformMetrics] = useState(null);

  // UI states
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    page: 1,
    limit: 10,
    search: "",
    dateRange: "all",
    specialty: "all",
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [expandedProfile, setExpandedProfile] = useState(null);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [bulkActionType, setBulkActionType] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - in real app, these would come from API
  useEffect(() => {
    // Initialize with mock data for demonstration
    setDashboardData({
      metrics: {
        users: { total: 1247, active: 1089, pending: 158 },
        verification: { verified: 892, pending: 197, rate: 71.5 },
        activity: { newUsers: 23, recentlyVerified: 15 },
      },
      topSpecialties: [
        { _id: "Cardiology", count: 156 },
        { _id: "Internal Medicine", count: 134 },
        { _id: "Pediatrics", count: 98 },
        { _id: "Surgery", count: 87 },
        { _id: "Radiology", count: 76 },
      ],
      usersNeedingAttention: [
        {
          _id: "1",
          firstName: "Sarah",
          lastName: "Johnson",
          email: "sarah.johnson@email.com",
          verificationStatus: {
            identity: "pending",
            medical_license: "pending",
          },
          createdAt: new Date().toISOString(),
        },
        {
          _id: "2",
          firstName: "Michael",
          lastName: "Chen",
          email: "michael.chen@email.com",
          verificationStatus: {
            identity: "verified",
            medical_license: "pending",
          },
          createdAt: new Date().toISOString(),
        },
      ],
      quickActions: [
        { label: "Pending Identity Verification", count: 45 },
        { label: "Pending License Verification", count: 32 },
        { label: "Incomplete Profiles", count: 28 },
      ],
    });

    setPendingVerifications([
      {
        _id: "1",
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah.johnson@email.com",
        primarySpecialty: "Cardiology",
        medicalLicenseNumber: "MD123456",
        licenseState: "CA",
        yearsOfExperience: 8,
        profilePhoto: { url: null },
        verificationStatus: {
          identity: "pending",
          medical_license: "pending",
          background_check: "verified",
        },
        documents: [
          { _id: "doc1", type: "medical_license", verified: false },
          { _id: "doc2", type: "identification", verified: false },
        ],
        createdAt: "2024-01-15T10:30:00Z",
        medicalSchool: { name: "Stanford Medical School" },
        accountStatus: "pending",
      },
      {
        _id: "2",
        firstName: "Michael",
        lastName: "Chen",
        email: "michael.chen@email.com",
        primarySpecialty: "Internal Medicine",
        medicalLicenseNumber: "MD789012",
        licenseState: "NY",
        yearsOfExperience: 12,
        profilePhoto: { url: null },
        verificationStatus: {
          identity: "verified",
          medical_license: "pending",
          background_check: "pending",
        },
        documents: [
          { _id: "doc3", type: "medical_license", verified: true },
          { _id: "doc4", type: "cv_resume", verified: false },
        ],
        createdAt: "2024-01-14T15:45:00Z",
        medicalSchool: { name: "Harvard Medical School" },
        accountStatus: "active",
      },
    ]);

    setVerificationStats({
      overview: {
        verificationRate: 71.5,
        verifiedUsers: 892,
        partiallyVerified: 197,
        unverified: 158,
      },
      pending: {
        identity: 45,
        medicalLicense: 32,
        backgroundCheck: 28,
        total: 105,
      },
      recent: { newVerified: 15 },
      averageVerificationTime: "2.3 days",
    });

    setPlatformMetrics({
      activeUsers: { today: 245, thisWeek: 1089, thisMonth: 1247 },
      engagement: {
        averageSessionTime: "24m",
        pageViews: 45230,
        bounceRate: 23.5,
      },
      revenue: { thisMonth: 45780, growth: 12.3 },
      support: { openTickets: 12, averageResponseTime: "2.1h" },
    });

    setAdminNotifications([
      {
        id: 1,
        type: "verification",
        title: "High volume of pending verifications",
        message: "45 identity verifications require attention",
        severity: "warning",
        timestamp: new Date().toISOString(),
        read: false,
      },
      {
        id: 2,
        type: "system",
        title: "System maintenance scheduled",
        message: "Scheduled maintenance on Sunday 2AM-4AM EST",
        severity: "info",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        read: false,
      },
    ]);
  }, []);

  // Mock API functions
  const verifyProfile = async (
    userId,
    verificationType,
    status,
    notes = ""
  ) => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setSuccess(`Profile ${status} successfully`);
      setLoading(false);
      // Update local state
      setPendingVerifications((prev) =>
        prev.map((profile) => {
          if (profile._id === userId) {
            return {
              ...profile,
              verificationStatus: {
                ...profile.verificationStatus,
                [verificationType]: status,
              },
            };
          }
          return profile;
        })
      );
      setTimeout(() => setSuccess(""), 3000);
    }, 1000);
  };

  const updateAccountStatus = async (userId, status) => {
    setLoading(true);
    setTimeout(() => {
      setSuccess(`Account status updated to ${status}`);
      setLoading(false);
      setTimeout(() => setSuccess(""), 3000);
    }, 800);
  };

  const bulkVerify = async (status) => {
    if (selectedUsers.length === 0) {
      setError("Please select users to verify");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setSuccess(`Bulk ${status} completed for ${selectedUsers.length} users`);
      setSelectedUsers([]);
      setLoading(false);
      setTimeout(() => setSuccess(""), 3000);
    }, 1500);
  };

  const sendNotification = async (userIds, message) => {
    setLoading(true);
    setTimeout(() => {
      setSuccess("Notification sent successfully");
      setLoading(false);
      setTimeout(() => setSuccess(""), 3000);
    }, 800);
  };

  // UI Components
  const MetricCard = ({
    title,
    value,
    icon: Icon,
    trend,
    color = "blue",
    subtitle,
  }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <div className="flex items-center mt-2">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">{trend}</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  const StatusBadge = ({ status, type = "verification" }) => {
    const colors = {
      verified: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800",
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      suspended: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          colors[status] || colors.pending
        }`}
      >
        {status}
      </span>
    );
  };

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      {dashboardData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Total Users"
            value={dashboardData.metrics.users.total}
            icon={Users}
            color="blue"
            subtitle={`${dashboardData.metrics.users.active} active`}
          />
          <MetricCard
            title="Verified Users"
            value={dashboardData.metrics.verification.verified}
            icon={CheckCircle}
            color="green"
            trend="+12% this month"
          />
          <MetricCard
            title="Pending Verification"
            value={dashboardData.metrics.verification.pending}
            icon={Clock}
            color="yellow"
          />
          <MetricCard
            title="Verification Rate"
            value={`${dashboardData.metrics.verification.rate}%`}
            icon={Award}
            color="purple"
            trend="+3.2% vs last month"
          />
        </div>
      )}

      {/* Platform Health Metrics */}
      {platformMetrics && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            Platform Health
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {platformMetrics.activeUsers.today}
              </p>
              <p className="text-sm text-gray-600">Active Today</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {platformMetrics.engagement.averageSessionTime}
              </p>
              <p className="text-sm text-gray-600">Avg Session</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {platformMetrics.support.openTickets}
              </p>
              <p className="text-sm text-gray-600">Open Tickets</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                ${(platformMetrics.revenue.thisMonth / 1000).toFixed(1)}k
              </p>
              <p className="text-sm text-gray-600">Revenue MTD</p>
            </div>
          </div>
        </div>
      )}

      {/* Notifications and Alerts */}
      {adminNotifications.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Admin Notifications
          </h3>
          <div className="space-y-3">
            {adminNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`flex items-start p-3 rounded-lg ${
                  notification.severity === "warning"
                    ? "bg-yellow-50 border border-yellow-200"
                    : notification.severity === "error"
                    ? "bg-red-50 border border-red-200"
                    : "bg-blue-50 border border-blue-200"
                }`}
              >
                <div
                  className={`p-1 rounded-full mr-3 ${
                    notification.severity === "warning"
                      ? "bg-yellow-100"
                      : notification.severity === "error"
                      ? "bg-red-100"
                      : "bg-blue-100"
                  }`}
                >
                  {notification.severity === "warning" ? (
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  ) : notification.severity === "error" ? (
                    <AlertCircle className="w-4 h-4 text-red-600" />
                  ) : (
                    <Bell className="w-4 h-4 text-blue-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">
                    {notification.title}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(notification.timestamp).toLocaleTimeString()}
                  </p>
                </div>
                {!notification.read && (
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="space-y-3">
            {dashboardData?.quickActions.map((action, index) => (
              <button
                key={index}
                className="w-full flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
                onClick={() => setActiveTab("pending")}
              >
                <div>
                  <h4 className="font-medium text-gray-900">{action.label}</h4>
                  <p className="text-sm text-gray-600">
                    {action.count} items require attention
                  </p>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400" />
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Top Specialties
          </h3>
          <div className="space-y-3">
            {dashboardData?.topSpecialties.map((specialty, index) => (
              <div
                key={specialty._id}
                className="flex items-center justify-between"
              >
                <span className="text-gray-900">{specialty._id}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${
                          (specialty.count /
                            dashboardData.topSpecialties[0].count) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-8 text-right">
                    {specialty.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const PendingVerificationsTab = () => (
    <div className="space-y-6">
      {/* Enhanced Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm w-64"
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
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Types</option>
              <option value="identity">Identity</option>
              <option value="medical_license">Medical License</option>
              <option value="background_check">Background Check</option>
            </select>

            <select
              value={filters.specialty}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, specialty: e.target.value }))
              }
              className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            >
              <option value="all">All Specialties</option>
              <option value="cardiology">Cardiology</option>
              <option value="internal">Internal Medicine</option>
              <option value="pediatrics">Pediatrics</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                /* fetchPendingVerifications() */
              }}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>

            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="mt-4 flex items-center justify-between bg-blue-50 p-4 rounded-lg">
            <span className="text-blue-700 font-medium">
              {selectedUsers.length} user(s) selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => bulkVerify("verified")}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
                disabled={loading}
              >
                Bulk Approve
              </button>
              <button
                onClick={() => bulkVerify("rejected")}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
                disabled={loading}
              >
                Bulk Reject
              </button>
              <button
                onClick={() => setSelectedUsers([])}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 text-sm"
              >
                Clear
              </button>
            </div>
          </div>
        )}
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
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : pendingVerifications.length > 0 ? (
          pendingVerifications.map((profile) => (
            <div
              key={profile._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
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
                  className="mt-1 w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />

                <div className="w-16 h-16 bg-gray-100 rounded-full overflow-hidden flex-shrink-0">
                  {profile.profilePhoto?.url ? (
                    <img
                      src={profile.profilePhoto.url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-lg">
                        Dr. {profile.firstName} {profile.lastName}
                      </h4>
                      <p className="text-blue-600 font-medium">
                        {profile.primarySpecialty}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Mail className="w-4 h-4 mr-1" />
                          {profile.email}
                        </span>
                        <span>
                          Experience: {profile.yearsOfExperience} years
                        </span>
                      </div>
                      <p className="text-gray-500 text-sm mt-1">
                        License: {profile.medicalLicenseNumber} (
                        {profile.licenseState})
                      </p>
                    </div>

                    <div className="text-right">
                      <StatusBadge
                        status={profile.accountStatus}
                        type="account"
                      />
                      <p className="text-sm text-gray-500 mt-1">
                        Joined{" "}
                        {new Date(profile.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Verification Status */}
                  <div className="flex items-center space-x-4 mt-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Identity:</span>
                      <StatusBadge
                        status={profile.verificationStatus.identity}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">License:</span>
                      <StatusBadge
                        status={profile.verificationStatus.medical_license}
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Background:</span>
                      <StatusBadge
                        status={profile.verificationStatus.background_check}
                      />
                    </div>
                  </div>

                  {/* Documents */}
                  {profile.documents && profile.documents.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">Documents:</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.documents.map((doc) => (
                          <div
                            key={doc._id}
                            className="flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-md"
                          >
                            <FileText className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-700">
                              {doc.type.replace("_", " ")}
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
                  <div className="flex items-center justify-between mt-6">
                    <button
                      onClick={() =>
                        setExpandedProfile(
                          expandedProfile === profile._id ? null : profile._id
                        )
                      }
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 text-sm"
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
                          verifyProfile(profile._id, "identity", "verified")
                        }
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm flex items-center space-x-2"
                        disabled={loading}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() =>
                          verifyProfile(profile._id, "identity", "rejected")
                        }
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm flex items-center space-x-2"
                        disabled={loading}
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedProfile === profile._id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">
                            Profile Information
                          </h5>
                          <div className="space-y-1">
                            <p>
                              <span className="text-gray-600">
                                Medical School:
                              </span>{" "}
                              {profile.medicalSchool?.name}
                            </p>
                            <p>
                              <span className="text-gray-600">Experience:</span>{" "}
                              {profile.yearsOfExperience} years
                            </p>
                            <p>
                              <span className="text-gray-600">
                                Account Status:
                              </span>{" "}
                              {profile.accountStatus}
                            </p>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">
                            Admin Actions
                          </h5>
                          <div className="space-y-2">
                            <button
                              onClick={() =>
                                updateAccountStatus(profile._id, "suspended")
                              }
                              className="w-full text-left text-red-600 hover:text-red-800 text-sm py-1"
                            >
                              Suspend Account
                            </button>
                            <button className="w-full text-left text-blue-600 hover:text-blue-800 text-sm py-1">
                              Send Message
                            </button>
                            <button className="w-full text-left text-gray-600 hover:text-gray-800 text-sm py-1">
                              View Full Profile
                            </button>
                          </div>
                        </div>

                        <div>
                          <h5 className="font-medium text-gray-900 mb-2">
                            Risk Assessment
                          </h5>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span className="text-gray-600">
                                Low risk profile
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                              <span className="text-gray-600">
                                Complete documentation
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              No pending verifications
            </h3>
            <p className="text-gray-600">All verifications are up to date!</p>
          </div>
        )}
      </div>
    </div>
  );

  const UserManagementTab = () => (
    <div className="space-y-6">
      {/* User Management Controls */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            User Management
          </h3>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>

        {/* Advanced Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <select className="border border-gray-300 rounded-md px-3 py-2">
            <option value="">All Roles</option>
            <option value="senior">Senior Doctor</option>
            <option value="junior">Junior Doctor</option>
            <option value="admin">Admin</option>
          </select>
          <select className="border border-gray-300 rounded-md px-3 py-2">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="suspended">Suspended</option>
          </select>
          <select className="border border-gray-300 rounded-md px-3 py-2">
            <option value="">All Verification</option>
            <option value="verified">Verified</option>
            <option value="partial">Partially Verified</option>
            <option value="unverified">Unverified</option>
          </select>
        </div>

        {/* User List Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input type="checkbox" className="w-4 h-4" />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Specialty
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verification
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {pendingVerifications.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input type="checkbox" className="w-4 h-4" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <User className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          Dr. {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.primarySpecialty}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={user.accountStatus} type="account" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-1">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          user.verificationStatus.identity === "verified"
                            ? "bg-green-400"
                            : user.verificationStatus.identity === "rejected"
                            ? "bg-red-400"
                            : "bg-yellow-400"
                        }`}
                      ></div>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          user.verificationStatus.medical_license === "verified"
                            ? "bg-green-400"
                            : user.verificationStatus.medical_license ===
                              "rejected"
                            ? "bg-red-400"
                            : "bg-yellow-400"
                        }`}
                      ></div>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          user.verificationStatus.background_check ===
                          "verified"
                            ? "bg-green-400"
                            : user.verificationStatus.background_check ===
                              "rejected"
                            ? "bg-red-400"
                            : "bg-yellow-400"
                        }`}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900">
                        <UserCheck className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Ban className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            Showing 1 to 10 of 247 results
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 border border-gray-300 rounded text-sm">
              Previous
            </button>
            <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
              1
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm">
              2
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm">
              3
            </button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const StatsTab = () => (
    <div className="space-y-6">
      {verificationStats && (
        <>
          {/* Enhanced Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Verification Rate"
              value={`${verificationStats.overview.verificationRate}%`}
              icon={Award}
              color="green"
              trend="+2.1% vs last month"
            />
            <MetricCard
              title="Avg. Processing Time"
              value={verificationStats.averageVerificationTime}
              icon={Clock}
              color="blue"
              subtitle="Target: <3 days"
            />
            <MetricCard
              title="This Month Verified"
              value={verificationStats.recent.newVerified}
              icon={TrendingUp}
              color="purple"
              trend="+23% vs last month"
            />
            <MetricCard
              title="Pending Queue"
              value={verificationStats.pending.total}
              icon={AlertTriangle}
              color="yellow"
              subtitle="Requires attention"
            />
          </div>

          {/* Charts and Detailed Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Verification Breakdown Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Verification Status Distribution
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-gray-600">Fully Verified</span>
                  </div>
                  <span className="font-medium text-green-600">
                    {verificationStats.overview.verifiedUsers} (71.5%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-gray-600">Partially Verified</span>
                  </div>
                  <span className="font-medium text-yellow-600">
                    {verificationStats.overview.partiallyVerified} (15.8%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-gray-600">Unverified</span>
                  </div>
                  <span className="font-medium text-red-600">
                    {verificationStats.overview.unverified} (12.7%)
                  </span>
                </div>
              </div>

              {/* Visual Progress Bar */}
              <div className="mt-6">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-green-500 h-3 rounded-l-full"
                    style={{ width: "71.5%" }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>

            {/* Pending by Type */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BarChart3 className="w-5 h-5 mr-2" />
                Pending Verification Queue
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Identity Verification</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-2 rounded-full"
                        style={{ width: "60%" }}
                      ></div>
                    </div>
                    <span className="font-medium text-right w-8">
                      {verificationStats.pending.identity}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Medical License</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-orange-500 h-2 rounded-full"
                        style={{ width: "45%" }}
                      ></div>
                    </div>
                    <span className="font-medium text-right w-8">
                      {verificationStats.pending.medicalLicense}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Background Check</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-red-500 h-2 rounded-full"
                        style={{ width: "35%" }}
                      ></div>
                    </div>
                    <span className="font-medium text-right w-8">
                      {verificationStats.pending.backgroundCheck}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Performance Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">94.2%</div>
                <div className="text-sm text-gray-600">
                  Verification Accuracy
                </div>
                <div className="text-xs text-green-600">
                  +1.2% from last month
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">1.8 days</div>
                <div className="text-sm text-gray-600">
                  Average Response Time
                </div>
                <div className="text-xs text-green-600">
                  -0.3 days improvement
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">98.5%</div>
                <div className="text-sm text-gray-600">User Satisfaction</div>
                <div className="text-xs text-gray-500">Based on feedback</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">156</div>
                <div className="text-sm text-gray-600">
                  Verifications This Week
                </div>
                <div className="text-xs text-blue-600">+12% from last week</div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const AuditTrailTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <FileCheck className="w-5 h-5 mr-2" />
          Audit Trail & Activity Log
        </h3>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <select className="border border-gray-300 rounded-md px-3 py-2">
            <option value="">All Actions</option>
            <option value="verification">Verification Actions</option>
            <option value="user_management">User Management</option>
            <option value="system">System Changes</option>
          </select>
          <input
            type="date"
            className="border border-gray-300 rounded-md px-3 py-2"
          />
          <input
            type="text"
            placeholder="Search by admin or user..."
            className="flex-1 border border-gray-300 rounded-md px-3 py-2"
          />
        </div>

        {/* Audit Log Entries */}
        <div className="space-y-3">
          {[
            {
              id: 1,
              action: "Verified Identity",
              admin: "John Admin",
              target: "Dr. Sarah Johnson",
              timestamp: new Date().toISOString(),
              details:
                "Identity verification approved with medical license validation",
            },
            {
              id: 2,
              action: "Bulk Verification",
              admin: "Jane Admin",
              target: "15 users",
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              details: "Bulk approved 15 medical license verifications",
            },
            {
              id: 3,
              action: "Account Suspended",
              admin: "John Admin",
              target: "Dr. Mike Wilson",
              timestamp: new Date(Date.now() - 7200000).toISOString(),
              details: "Account suspended due to policy violation",
            },
          ].map((entry) => (
            <div
              key={entry.id}
              className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
            >
              <div
                className={`p-2 rounded-full ${
                  entry.action.includes("Verified") ||
                  entry.action.includes("Approved")
                    ? "bg-green-100"
                    : entry.action.includes("Suspended") ||
                      entry.action.includes("Rejected")
                    ? "bg-red-100"
                    : "bg-blue-100"
                }`}
              >
                {entry.action.includes("Verified") ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : entry.action.includes("Suspended") ? (
                  <Ban className="w-4 h-4 text-red-600" />
                ) : (
                  <Activity className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">
                    {entry.action}
                  </span>
                  <span className="text-gray-500">by</span>
                  <span className="text-blue-600">{entry.admin}</span>
                  <span className="text-gray-500">on</span>
                  <span className="text-gray-900">{entry.target}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{entry.details}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(entry.timestamp).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const TabNavigation = () => {
    const tabs = [
      { id: "overview", label: "Overview", icon: BarChart3 },
      { id: "pending", label: "Verification Queue", icon: Clock },
      { id: "users", label: "User Management", icon: Users },
      { id: "stats", label: "Analytics", icon: TrendingUp },
      { id: "audit", label: "Audit Trail", icon: FileCheck },
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
                className={`flex items-center space-x-2 px-6 py-4 whitespace-nowrap border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Alert Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {success}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Comprehensive platform management and user verification system
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Bell className="w-6 h-6 text-gray-500" />
              {adminNotifications.some((n) => !n.read) && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-gray-900">
                {user.firstName} {user.lastName}
              </span>
            </div>
          </div>
        </div>
      </div>

      <TabNavigation />

      <div className="min-h-96">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "pending" && <PendingVerificationsTab />}
        {activeTab === "users" && <UserManagementTab />}
        {activeTab === "stats" && <StatsTab />}
        {activeTab === "audit" && <AuditTrailTab />}
      </div>
    </div>
  );
};

export default AdminDashboard;
