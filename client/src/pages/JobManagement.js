import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { jobAPI, handleApiError, formatters } from "../api";
import {
  Plus,
  Eye,
  Edit,
  Pause,
  Play,
  XCircle,
  MoreVertical,
  Filter,
  Search,
  Calendar,
  DollarSign,
  Users,
  FileText,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  MessageSquare,
  BarChart3,
  Target,
  Briefcase,
  MapPin,
  Download,
  RefreshCw,
  ChevronDown,
  Loader2,
} from "lucide-react";

const JobManagement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isSenior, hasPermission } = useAuth();

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(null);

  const [filters, setFilters] = useState({
    status: "all",
    category: "",
    sortBy: "recent",
    page: 1,
    limit: 10,
  });

  // ============================================================================
  // PERMISSION CHECK
  // ============================================================================
  useEffect(() => {
    if (!isSenior() || !hasPermission("canPostJobs")) {
      toast.error("Only senior doctors can access job management");
      navigate("/dashboard");
    }
  }, [isSenior, hasPermission, navigate]);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  // Fetch my jobs
  const {
    data: jobsData,
    isLoading: jobsLoading,
    error: jobsError,
    refetch: refetchJobs,
  } = useQuery({
    queryKey: ["my-jobs", filters, searchTerm],
    queryFn: async () => {
      const params = { ...filters };
      if (searchTerm) params.search = searchTerm;
      if (filters.status === "all") delete params.status;
      return jobAPI.getMyJobs(params);
    },
    keepPreviousData: true,
    staleTime: 30000, // 30 seconds
    onError: (error) => {
      const errorInfo = handleApiError(error);
      toast.error(errorInfo.message);
    },
  });

  // Fetch dashboard statistics
  const { data: statsData } = useQuery({
    queryKey: ["job-stats"],
    queryFn: async () => {
      // Get all jobs for stats
      const response = await jobAPI.getMyJobs({ limit: 100 });
      const jobs = response.data.data || [];

      return {
        totalJobs: jobs.length,
        activeJobs: jobs.filter((j) => j.status === "active").length,
        pausedJobs: jobs.filter((j) => j.status === "paused").length,
        closedJobs: jobs.filter((j) => j.status === "closed").length,
        totalApplications: jobs.reduce(
          (sum, j) => sum + (j.applications_count || 0),
          0
        ),
        averageApplications:
          jobs.length > 0
            ? Math.round(
                jobs.reduce((sum, j) => sum + (j.applications_count || 0), 0) /
                  jobs.length
              )
            : 0,
        totalViews: jobs.reduce((sum, j) => sum + (j.views_count || 0), 0),
      };
    },
    staleTime: 60000, // 1 minute
  });

  const jobs = jobsData?.data?.data || [];
  const pagination = jobsData?.data?.pagination || {};
  const stats = statsData || {
    totalJobs: 0,
    activeJobs: 0,
    pausedJobs: 0,
    closedJobs: 0,
    totalApplications: 0,
    averageApplications: 0,
    totalViews: 0,
  };

  // ============================================================================
  // MUTATIONS
  // ============================================================================

  // Pause job mutation
  const pauseMutation = useMutation({
    mutationFn: (jobId) => jobAPI.pause(jobId),
    onSuccess: () => {
      toast.success("Job paused successfully");
      queryClient.invalidateQueries(["my-jobs"]);
      queryClient.invalidateQueries(["job-stats"]);
    },
    onError: (error) => {
      const errorInfo = handleApiError(error);
      toast.error(errorInfo.message);
    },
  });

  // Activate job mutation
  const activateMutation = useMutation({
    mutationFn: (jobId) => jobAPI.activate(jobId),
    onSuccess: () => {
      toast.success("Job activated successfully");
      queryClient.invalidateQueries(["my-jobs"]);
      queryClient.invalidateQueries(["job-stats"]);
    },
    onError: (error) => {
      const errorInfo = handleApiError(error);
      toast.error(errorInfo.message);
    },
  });

  // Delete job mutation
  const deleteMutation = useMutation({
    mutationFn: (jobId) => jobAPI.delete(jobId),
    onSuccess: () => {
      toast.success("Job deleted successfully");
      queryClient.invalidateQueries(["my-jobs"]);
      queryClient.invalidateQueries(["job-stats"]);
    },
    onError: (error) => {
      const errorInfo = handleApiError(error);
      toast.error(errorInfo.message);
    },
  });

  // Bulk action mutation
  const bulkActionMutation = useMutation({
    mutationFn: async ({ action, jobIds }) => {
      const promises = jobIds.map((jobId) => {
        switch (action) {
          case "pause":
            return jobAPI.pause(jobId);
          case "activate":
            return jobAPI.activate(jobId);
          case "delete":
            return jobAPI.delete(jobId);
          default:
            return Promise.resolve();
        }
      });
      return Promise.all(promises);
    },
    onSuccess: (_, variables) => {
      toast.success(
        `${variables.jobIds.length} job(s) ${variables.action}d successfully`
      );
      setSelectedJobs([]);
      queryClient.invalidateQueries(["my-jobs"]);
      queryClient.invalidateQueries(["job-stats"]);
    },
    onError: (error) => {
      const errorInfo = handleApiError(error);
      toast.error(errorInfo.message);
    },
  });

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleJobAction = async (jobId, action) => {
    setDropdownOpen(null);

    switch (action) {
      case "pause":
        pauseMutation.mutate(jobId);
        break;
      case "activate":
        activateMutation.mutate(jobId);
        break;
      case "delete":
        if (
          window.confirm(
            "Are you sure you want to delete this job? This action cannot be undone."
          )
        ) {
          deleteMutation.mutate(jobId);
        }
        break;
      default:
        break;
    }
  };

  const handleBulkAction = (action) => {
    if (selectedJobs.length === 0) return;

    const actionText = action === "delete" ? "delete" : action;
    if (
      action === "delete" &&
      !window.confirm(
        `Are you sure you want to ${actionText} ${selectedJobs.length} job(s)?`
      )
    ) {
      return;
    }

    bulkActionMutation.mutate({ action, jobIds: selectedJobs });
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedJobs(jobs.map((job) => job._id));
    } else {
      setSelectedJobs([]);
    }
  };

  const handleSelectJob = (jobId) => {
    setSelectedJobs((prev) =>
      prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [...prev, jobId]
    );
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handleExport = () => {
    // Create CSV content
    const headers = [
      "Title",
      "Category",
      "Specialty",
      "Status",
      "Budget",
      "Applications",
      "Views",
      "Created",
    ];
    const rows = jobs.map((job) => [
      job.title,
      job.category,
      job.specialty,
      job.status,
      formatters.budget(job),
      job.applications_count || 0,
      job.views_count || 0,
      new Date(job.createdAt).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    // Download CSV
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `jobs-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success("Jobs exported successfully");
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "paused":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "closed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-3.5 h-3.5" />;
      case "paused":
        return <Pause className="w-3.5 h-3.5" />;
      case "closed":
        return <XCircle className="w-3.5 h-3.5" />;
      case "completed":
        return <Target className="w-3.5 h-3.5" />;
      default:
        return <Clock className="w-3.5 h-3.5" />;
    }
  };

  const isJobExpiringSoon = (deadline) => {
    const daysUntil = Math.ceil(
      (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)
    );
    return daysUntil <= 7 && daysUntil > 0;
  };

  const isJobExpired = (deadline) => {
    return new Date(deadline) < new Date();
  };

  // ============================================================================
  // COMPONENTS
  // ============================================================================

  // Stats Cards
  const StatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-2xl font-bold text-gray-900">
            {stats.totalJobs}
          </span>
        </div>
        <p className="text-sm text-gray-600">Total Jobs</p>
        <div className="mt-2 flex items-center text-xs text-gray-500">
          <span className="text-green-600 font-medium">
            {stats.activeJobs} active
          </span>
          <span className="mx-2">•</span>
          <span className="text-yellow-600 font-medium">
            {stats.pausedJobs} paused
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <span className="text-2xl font-bold text-green-600">
            {stats.activeJobs}
          </span>
        </div>
        <p className="text-sm text-gray-600">Active Jobs</p>
        <p className="mt-2 text-xs text-gray-500">
          {stats.totalJobs > 0
            ? Math.round((stats.activeJobs / stats.totalJobs) * 100)
            : 0}
          % of total
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <FileText className="w-6 h-6 text-purple-600" />
          </div>
          <span className="text-2xl font-bold text-purple-600">
            {stats.totalApplications}
          </span>
        </div>
        <p className="text-sm text-gray-600">Total Applications</p>
        <p className="mt-2 text-xs text-gray-500">
          Avg: {stats.averageApplications} per job
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
            <Eye className="w-6 h-6 text-orange-600" />
          </div>
          <span className="text-2xl font-bold text-orange-600">
            {stats.totalViews}
          </span>
        </div>
        <p className="text-sm text-gray-600">Total Views</p>
        <p className="mt-2 text-xs text-gray-500">
          Avg:{" "}
          {stats.totalJobs > 0
            ? Math.round(stats.totalViews / stats.totalJobs)
            : 0}{" "}
          per job
        </p>
      </div>
    </div>
  );

  // Filters Panel
  const FiltersPanel = () => (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 transition-all duration-300 ${
        showFilters ? "block" : "hidden"
      }`}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="closed">Closed</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Categories</option>
            <option value="consultation">Consultation</option>
            <option value="research">Research</option>
            <option value="documentation">Documentation</option>
            <option value="review">Review</option>
            <option value="telemedicine">Telemedicine</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) => handleFilterChange("sortBy", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="recent">Most Recent</option>
            <option value="oldest">Oldest First</option>
            <option value="applications">Most Applications</option>
            <option value="views">Most Views</option>
            <option value="deadline">Deadline Soon</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Per Page
          </label>
          <select
            value={filters.limit}
            onChange={(e) =>
              handleFilterChange("limit", parseInt(e.target.value))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="5">5 jobs</option>
            <option value="10">10 jobs</option>
            <option value="20">20 jobs</option>
            <option value="50">50 jobs</option>
          </select>
        </div>
      </div>
    </div>
  );

  // Job Card
  const JobCard = ({ job }) => {
    const isSelected = selectedJobs.includes(job._id);
    const isActive = dropdownOpen === job._id;
    const expiringSoon = isJobExpiringSoon(job.timeline?.deadline);
    const expired = isJobExpired(job.timeline?.deadline);

    return (
      <div
        className={`bg-white rounded-xl shadow-sm border-2 transition-all hover:shadow-md ${
          isSelected ? "border-blue-500 bg-blue-50" : "border-gray-200"
        }`}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start space-x-3 flex-1">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleSelectJob(job._id)}
                className="mt-1 w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex-1 min-w-0">
                <Link
                  to={`/jobs/${job._id}`}
                  className="text-lg font-semibold text-gray-900 hover:text-blue-600 block truncate"
                >
                  {job.title}
                </Link>

                <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
                  <span className="flex items-center space-x-1">
                    <Briefcase className="w-4 h-4" />
                    <span className="capitalize">{job.category}</span>
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center space-x-1">
                    <Star className="w-4 h-4" />
                    <span>{job.specialty}</span>
                  </span>
                  <span className="text-gray-300">•</span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Posted {formatters.timeAgo(job.createdAt)}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="relative ml-4">
              <button
                onClick={() => setDropdownOpen(isActive ? null : job._id)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-gray-500" />
              </button>

              {isActive && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(null)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                    <Link
                      to={`/jobs/${job._id}`}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 first:rounded-t-lg transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </Link>

                    <Link
                      to={`/jobs/${job._id}/edit`}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit Job</span>
                    </Link>

                    <Link
                      to={`/jobs/${job._id}/applications`}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <FileText className="w-4 h-4" />
                      <span>
                        View Applications ({job.applications_count || 0})
                      </span>
                    </Link>

                    <Link
                      to={`/jobs/${job._id}/analytics`}
                      className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>View Analytics</span>
                    </Link>

                    <div className="border-t border-gray-100" />

                    {job.status === "active" ? (
                      <button
                        onClick={() => handleJobAction(job._id, "pause")}
                        className="flex items-center space-x-3 px-4 py-3 text-yellow-600 hover:bg-yellow-50 w-full text-left transition-colors"
                        disabled={pauseMutation.isLoading}
                      >
                        <Pause className="w-4 h-4" />
                        <span>Pause Job</span>
                      </button>
                    ) : job.status === "paused" ? (
                      <button
                        onClick={() => handleJobAction(job._id, "activate")}
                        className="flex items-center space-x-3 px-4 py-3 text-green-600 hover:bg-green-50 w-full text-left transition-colors"
                        disabled={activateMutation.isLoading}
                      >
                        <Play className="w-4 h-4" />
                        <span>Activate Job</span>
                      </button>
                    ) : null}

                    <button
                      onClick={() => handleJobAction(job._id, "delete")}
                      className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 w-full text-left last:rounded-b-lg transition-colors"
                      disabled={deleteMutation.isLoading}
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Delete Job</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Status and Stats */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <span
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusStyle(
                  job.status
                )}`}
              >
                {getStatusIcon(job.status)}
                <span className="capitalize">{job.status}</span>
              </span>

              {expired && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Expired</span>
                </span>
              )}

              {!expired && expiringSoon && (
                <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Expiring Soon</span>
                </span>
              )}
            </div>

            <div className="text-right">
              <div className="text-lg font-bold text-green-600">
                {formatters.budget(job)}
              </div>
              <p className="text-xs text-gray-500 capitalize">
                {job.budget?.type || "fixed"}
              </p>
            </div>
          </div>

          {/* Description Preview */}
          <p className="text-gray-700 text-sm mb-4 line-clamp-2">
            {job.description}
          </p>

          {/* Stats Bar */}
          <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg mb-4">
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2 text-gray-600">
                <Users className="w-4 h-4" />
                <span className="font-medium">
                  {job.applications_count || 0}
                </span>
                <span className="hidden sm:inline">applications</span>
              </div>

              <div className="flex items-center space-x-2 text-gray-600">
                <Eye className="w-4 h-4" />
                <span className="font-medium">{job.views_count || 0}</span>
                <span className="hidden sm:inline">views</span>
              </div>

              {job.timeline?.deadline && (
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span className="hidden sm:inline">Due:</span>
                  <span className="font-medium">
                    {formatters.date(job.timeline.deadline)}
                  </span>
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                onClick={() => navigate(`/jobs/${job._id}/applications`)}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Messages"
              >
                <MessageSquare className="w-4 h-4" />
              </button>

              <button
                onClick={() => navigate(`/jobs/${job._id}/analytics`)}
                className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Analytics"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <Link
              to={`/jobs/${job._id}/applications`}
              className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex-1 sm:flex-initial"
            >
              <FileText className="w-4 h-4" />
              <span>Applications ({job.applications_count || 0})</span>
            </Link>

            <Link
              to={`/jobs/${job._id}`}
              className="flex items-center justify-center space-x-2 px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex-1 sm:flex-initial"
            >
              <Eye className="w-4 h-4" />
              <span>View Details</span>
            </Link>
          </div>
        </div>
      </div>
    );
  };

  // Pagination
  const Pagination = () => {
    if (!pagination.pages || pagination.pages <= 1) return null;

    const pages = [];
    const showPages = 5;
    let startPage = Math.max(1, filters.page - Math.floor(showPages / 2));
    let endPage = Math.min(pagination.pages, startPage + showPages - 1);

    if (endPage - startPage < showPages - 1) {
      startPage = Math.max(1, endPage - showPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between mt-8">
        <div className="text-sm text-gray-600">
          Showing {(filters.page - 1) * filters.limit + 1} to{" "}
          {Math.min(filters.page * filters.limit, pagination.total)} of{" "}
          {pagination.total} jobs
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(filters.page - 1)}
            disabled={filters.page === 1}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          {startPage > 1 && (
            <>
              <button
                onClick={() => handlePageChange(1)}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                1
              </button>
              {startPage > 2 && <span className="text-gray-400">...</span>}
            </>
          )}

          {pages.map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`px-3 py-2 border rounded-lg transition-colors ${
                page === filters.page
                  ? "bg-blue-600 text-white border-blue-600"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}

          {endPage < pagination.pages && (
            <>
              {endPage < pagination.pages - 1 && (
                <span className="text-gray-400">...</span>
              )}
              <button
                onClick={() => handlePageChange(pagination.pages)}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {pagination.pages}
              </button>
            </>
          )}

          <button
            onClick={() => handlePageChange(filters.page + 1)}
            disabled={filters.page === pagination.pages}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    );
  };

  // Loading State
  const LoadingSkeleton = () => (
    <div className="space-y-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="h-5 bg-gray-200 rounded w-2/3 mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="space-y-2 mb-4">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
          </div>
          <div className="flex space-x-3">
            <div className="h-10 bg-gray-200 rounded flex-1"></div>
            <div className="h-10 bg-gray-200 rounded flex-1"></div>
          </div>
        </div>
      ))}
    </div>
  );

  // Empty State
  const EmptyState = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
      <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <Briefcase className="w-10 h-10 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        {searchTerm || filters.status !== "all" || filters.category
          ? "No Jobs Found"
          : "No Jobs Posted Yet"}
      </h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">
        {searchTerm || filters.status !== "all" || filters.category
          ? "No jobs match your current filters. Try adjusting your search criteria."
          : "You haven't posted any jobs yet. Create your first job posting to start connecting with talented junior doctors."}
      </p>
      {!searchTerm && filters.status === "all" && !filters.category && (
        <Link
          to="/jobs/post"
          className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Post Your First Job</span>
        </Link>
      )}
    </div>
  );

  // Error State
  const ErrorState = () => (
    <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg">
      <div className="flex items-start">
        <AlertCircle className="w-6 h-6 text-red-400 mt-0.5" />
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            Error Loading Jobs
          </h3>
          <p className="mt-2 text-sm text-red-700">
            {handleApiError(jobsError).message}
          </p>
          <button
            onClick={() => refetchJobs()}
            className="mt-3 text-sm font-medium text-red-800 hover:text-red-900"
          >
            Try Again →
          </button>
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
            <p className="text-gray-600 mt-2">
              Manage your job postings and review applications
            </p>
          </div>
          <Link
            to="/jobs/post"
            className="inline-flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Post New Job</span>
          </Link>
        </div>

        {/* Stats Cards */}
        <StatsCards />

        {/* Search and Filters Bar */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs by title or specialty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-4 py-3 border-2 rounded-lg transition-colors ${
                  showFilters
                    ? "border-blue-600 bg-blue-50 text-blue-600"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {(filters.status !== "all" || filters.category) && (
                  <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                )}
              </button>

              <button
                onClick={() => refetchJobs()}
                disabled={jobsLoading}
                className="flex items-center space-x-2 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${jobsLoading ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <button
                onClick={handleExport}
                disabled={jobs.length === 0}
                className="flex items-center space-x-2 px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        <FiltersPanel />

        {/* Bulk Actions Bar */}
        {selectedJobs.length > 0 && (
          <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={selectedJobs.length === jobs.length}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-blue-800 font-medium">
                  {selectedJobs.length} job{selectedJobs.length > 1 ? "s" : ""}{" "}
                  selected
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleBulkAction("pause")}
                  disabled={bulkActionMutation.isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {bulkActionMutation.isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Pause className="w-4 h-4" />
                  )}
                  <span>Pause</span>
                </button>

                <button
                  onClick={() => handleBulkAction("activate")}
                  disabled={bulkActionMutation.isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {bulkActionMutation.isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  <span>Activate</span>
                </button>

                <button
                  onClick={() => handleBulkAction("delete")}
                  disabled={bulkActionMutation.isLoading}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium disabled:opacity-50"
                >
                  {bulkActionMutation.isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <XCircle className="w-4 h-4" />
                  )}
                  <span>Delete</span>
                </button>

                <button
                  onClick={() => setSelectedJobs([])}
                  className="flex items-center space-x-2 px-4 py-2 border-2 border-gray-300 bg-white rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  <span>Clear</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Jobs List */}
        <div className="space-y-6">
          {jobsLoading ? (
            <LoadingSkeleton />
          ) : jobsError ? (
            <ErrorState />
          ) : jobs.length > 0 ? (
            <>
              {jobs.map((job) => (
                <JobCard key={job._id} job={job} />
              ))}
              <Pagination />
            </>
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
};

export default JobManagement;
