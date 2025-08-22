import React, { useState, useEffect, useContext } from "react";
import { useAuth } from "../context/AuthContext";
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
} from "lucide-react";

const AdminVerificationDashboard = () => {
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Dashboard data
  const [dashboardData, setDashboardData] = useState(null);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [verificationStats, setVerificationStats] = useState(null);

  // Filters and pagination
  const [filters, setFilters] = useState({
    type: "all",
    page: 1,
    limit: 10,
  });
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [expandedProfile, setExpandedProfile] = useState(null);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchDashboardData();
      fetchVerificationStats();
    }
  }, [user]);

  useEffect(() => {
    if (user?.role === "admin" && activeTab === "pending") {
      fetchPendingVerifications();
    }
  }, [activeTab, filters]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("/api/admin/dashboard", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data.data);
      }
    } catch (err) {
      setError("Failed to load dashboard data");
    }
  };

  const fetchVerificationStats = async () => {
    try {
      const response = await fetch("/api/admin/verification/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setVerificationStats(data.data);
      }
    } catch (err) {
      setError("Failed to load verification stats");
    }
  };

  const fetchPendingVerifications = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        type: filters.type,
        page: filters.page.toString(),
        limit: filters.limit.toString(),
      });

      const response = await fetch(
        `/api/admin/verification/pending?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPendingVerifications(data.data);
      }
    } catch (err) {
      setError("Failed to load pending verifications");
    } finally {
      setLoading(false);
    }
  };

  const verifyProfile = async (
    userId,
    verificationType,
    status,
    notes = ""
  ) => {
    try {
      const response = await fetch(
        `/api/admin/verification/${verificationType}/${userId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status, notes }),
        }
      );

      if (response.ok) {
        setSuccess(`Profile ${status} successfully`);
        fetchPendingVerifications();
        fetchDashboardData();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to update verification");
      }
    } catch (err) {
      setError("Error updating verification");
    }
  };

  const bulkVerify = async (status) => {
    if (selectedUsers.length === 0) {
      setError("Please select users to verify");
      return;
    }

    try {
      const response = await fetch("/api/admin/verification/bulk", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userIds: selectedUsers,
          verificationType: filters.type === "all" ? "identity" : filters.type,
          status,
        }),
      });

      if (response.ok) {
        setSuccess(`Bulk ${status} completed successfully`);
        setSelectedUsers([]);
        fetchPendingVerifications();
        fetchDashboardData();
        setTimeout(() => setSuccess(""), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to perform bulk action");
      }
    } catch (err) {
      setError("Error performing bulk action");
    }
  };

  // Don't render if not admin
  if (user?.role !== "admin") {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Access denied. Admin privileges required.
        </div>
      </div>
    );
  }

  const MetricCard = ({ title, value, icon: Icon, trend, color = "blue" }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
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
          />
          <MetricCard
            title="Verified Users"
            value={dashboardData.metrics.verification.verified}
            icon={CheckCircle}
            color="green"
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
          />
        </div>
      )}

      {/* Quick Actions */}
      {dashboardData && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dashboardData.quickActions.map((action, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {action.label}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      {action.count} items
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {dashboardData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Users Needing Attention
            </h3>
            <div className="space-y-3">
              {dashboardData.usersNeedingAttention.slice(0, 5).map((user) => (
                <div
                  key={user._id}
                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      Dr. {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <div className="flex items-center space-x-1">
                    {user.verificationStatus.identity === "pending" && (
                      <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full"></span>
                    )}
                    {user.verificationStatus.medical_license === "pending" && (
                      <span className="inline-block w-2 h-2 bg-red-400 rounded-full"></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Top Specialties
            </h3>
            <div className="space-y-3">
              {dashboardData.topSpecialties.map((specialty, index) => (
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
      )}
    </div>
  );

  const PendingVerificationsTab = () => (
    <div className="space-y-6">
      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Pending Verifications
          </h3>
          <div className="flex items-center space-x-4">
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
            <button
              onClick={() => fetchPendingVerifications()}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.length > 0 && (
          <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg mb-4">
            <span className="text-blue-700 font-medium">
              {selectedUsers.length} user(s) selected
            </span>
            <div className="flex space-x-2">
              <button
                onClick={() => bulkVerify("verified")}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 text-sm"
              >
                Bulk Approve
              </button>
              <button
                onClick={() => bulkVerify("rejected")}
                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm"
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

      {/* Pending Verification List */}
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
                      <p className="text-gray-600 text-sm">{profile.email}</p>
                      <p className="text-gray-500 text-sm">
                        License: {profile.medicalLicenseNumber} (
                        {profile.licenseState})
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        Joined{" "}
                        {new Date(profile.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Verification Status */}
                  <div className="flex items-center space-x-4 mt-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Identity:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          profile.verificationStatus.identity === "verified"
                            ? "bg-green-100 text-green-800"
                            : profile.verificationStatus.identity === "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {profile.verificationStatus.identity}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">License:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          profile.verificationStatus.medical_license ===
                          "verified"
                            ? "bg-green-100 text-green-800"
                            : profile.verificationStatus.medical_license ===
                              "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {profile.verificationStatus.medical_license}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Background:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          profile.verificationStatus.background_check ===
                          "verified"
                            ? "bg-green-100 text-green-800"
                            : profile.verificationStatus.background_check ===
                              "rejected"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {profile.verificationStatus.background_check}
                      </span>
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
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() =>
                          verifyProfile(profile._id, "identity", "rejected")
                        }
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 text-sm flex items-center space-x-2"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedProfile === profile._id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border-t border-gray-200">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
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

  const StatsTab = () => (
    <div className="space-y-6">
      {verificationStats && (
        <>
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Verification Rate"
              value={`${verificationStats.overview.verificationRate}%`}
              icon={Award}
              color="green"
            />
            <MetricCard
              title="Avg. Processing Time"
              value={verificationStats.averageVerificationTime}
              icon={Clock}
              color="blue"
            />
            <MetricCard
              title="This Month"
              value={verificationStats.recent.newVerified}
              icon={TrendingUp}
              color="purple"
            />
            <MetricCard
              title="Pending Total"
              value={verificationStats.pending.total}
              icon={AlertTriangle}
              color="yellow"
            />
          </div>

          {/* Detailed Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Verification Breakdown
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Verified</span>
                  <span className="font-medium text-green-600">
                    {verificationStats.overview.verifiedUsers}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Partially Verified</span>
                  <span className="font-medium text-yellow-600">
                    {verificationStats.overview.partiallyVerified}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Unverified</span>
                  <span className="font-medium text-red-600">
                    {verificationStats.overview.unverified}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Pending by Type
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Identity Verification</span>
                  <span className="font-medium">
                    {verificationStats.pending.identity}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Medical License</span>
                  <span className="font-medium">
                    {verificationStats.pending.medicalLicense}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Background Check</span>
                  <span className="font-medium">
                    {verificationStats.pending.backgroundCheck}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

  const TabNavigation = () => {
    const tabs = [
      { id: "overview", label: "Overview", icon: Users },
      { id: "pending", label: "Pending Verifications", icon: Clock },
      { id: "stats", label: "Statistics", icon: TrendingUp },
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
    <div className="max-w-7xl mx-auto p-6">
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

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Admin Verification Dashboard
        </h1>
        <p className="text-gray-600">
          Manage and verify medical professional profiles, licenses, and
          credentials
        </p>
      </div>

      <TabNavigation />

      <div className="min-h-96">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "pending" && <PendingVerificationsTab />}
        {activeTab === "stats" && <StatsTab />}
      </div>
    </div>
  );
};

export default AdminVerificationDashboard;
