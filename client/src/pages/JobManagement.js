import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
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
} from "lucide-react";

const JobManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State management
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedJobs, setSelectedJobs] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    averageApplications: 0,
    successRate: 0,
  });

  // Filter state
  const [filters, setFilters] = useState({
    status: "all",
    category: "",
    dateRange: "30d",
    sortBy: "newest",
  });

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Sample job data - would come from API
  const [sampleJobs] = useState([
    {
      id: "1",
      title: "Cardiology Consultation Support",
      category: "Consultation",
      specialty: "Cardiology",
      status: "active",
      budget: 2500,
      budgetType: "fixed",
      applications: 12,
      deadline: "2024-02-15",
      createdAt: "2024-01-15",
      views: 89,
      featured: true,
      description:
        "Need assistance with complex cardiac cases and second opinions...",
    },
    {
      id: "2",
      title: "Medical Chart Review - Emergency Cases",
      category: "Chart Review",
      specialty: "Emergency Medicine",
      status: "paused",
      budget: 75,
      budgetType: "hourly",
      applications: 8,
      deadline: "2024-02-20",
      createdAt: "2024-01-10",
      views: 67,
      featured: false,
      description:
        "Review emergency department charts for quality assurance...",
    },
    {
      id: "3",
      title: "Research Data Analysis Support",
      category: "Research Support",
      specialty: "Internal Medicine",
      status: "closed",
      budget: 5000,
      budgetType: "milestone",
      applications: 25,
      deadline: "2024-01-30",
      createdAt: "2023-12-15",
      views: 156,
      featured: false,
      description: "Statistical analysis for clinical research study...",
    },
    {
      id: "4",
      title: "Pediatric Case Consultation",
      category: "Consultation",
      specialty: "Pediatrics",
      status: "active",
      budget: 150,
      budgetType: "hourly",
      applications: 6,
      deadline: "2024-02-25",
      createdAt: "2024-01-20",
      views: 45,
      featured: false,
      description: "Need pediatric specialist input on complex cases...",
    },
  ]);

  // Initialize data
  useEffect(() => {
    loadJobs();
    loadStats();
  }, [filters]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      // API call would be here
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setJobs(sampleJobs);
    } catch (err) {
      setError("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      // Calculate stats from sample data
      const totalJobs = sampleJobs.length;
      const activeJobs = sampleJobs.filter(
        (job) => job.status === "active"
      ).length;
      const totalApplications = sampleJobs.reduce(
        (sum, job) => sum + job.applications,
        0
      );
      const averageApplications = Math.round(totalApplications / totalJobs);
      const successRate = 94; // Would be calculated from API

      setStats({
        totalJobs,
        activeJobs,
        totalApplications,
        averageApplications,
        successRate,
      });
    } catch (err) {
      console.error("Error loading stats:", err);
    }
  };

  // Filter and search jobs
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.specialty.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filters.status === "all" || job.status === filters.status;
    const matchesCategory =
      !filters.category || job.category === filters.category;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    switch (filters.sortBy) {
      case "newest":
        return new Date(b.createdAt) - new Date(a.createdAt);
      case "oldest":
        return new Date(a.createdAt) - new Date(b.createdAt);
      case "applications":
        return b.applications - a.applications;
      case "budget":
        return b.budget - a.budget;
      case "deadline":
        return new Date(a.deadline) - new Date(b.deadline);
      default:
        return 0;
    }
  });

  // Job actions
  const handleJobAction = async (jobId, action) => {
    try {
      // API call would be here
      await new Promise((resolve) => setTimeout(resolve, 500));

      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          job.id === jobId ? { ...job, status: action } : job
        )
      );
    } catch (err) {
      setError(`Failed to ${action} job`);
    }
  };

  // Bulk actions
  const handleBulkAction = async (action) => {
    try {
      // API call would be here
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setJobs((prevJobs) =>
        prevJobs.map((job) =>
          selectedJobs.includes(job.id) ? { ...job, status: action } : job
        )
      );
      setSelectedJobs([]);
    } catch (err) {
      setError(`Failed to ${action} selected jobs`);
    }
  };

  // Status styling
  const getStatusStyle = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "paused":
        return <Pause className="w-4 h-4" />;
      case "closed":
        return <XCircle className="w-4 h-4" />;
      case "completed":
        return <Target className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  // Stats cards component
  const StatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Jobs</p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalJobs}
            </p>
          </div>
          <Briefcase className="w-8 h-8 text-blue-600" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Active Jobs</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.activeJobs}
            </p>
          </div>
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Applications</p>
            <p className="text-2xl font-bold text-purple-600">
              {stats.totalApplications}
            </p>
          </div>
          <FileText className="w-8 h-8 text-purple-600" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Avg Applications</p>
            <p className="text-2xl font-bold text-orange-600">
              {stats.averageApplications}
            </p>
          </div>
          <BarChart3 className="w-8 h-8 text-orange-600" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Success Rate</p>
            <p className="text-2xl font-bold text-teal-600">
              {stats.successRate}%
            </p>
          </div>
          <TrendingUp className="w-8 h-8 text-teal-600" />
        </div>
      </div>
    </div>
  );

  // Filters component
  const FiltersPanel = () => (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 transition-all duration-300 ${
        showFilters ? "block" : "hidden"
      }`}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, category: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            <option value="Consultation">Consultation</option>
            <option value="Chart Review">Chart Review</option>
            <option value="Research Support">Research Support</option>
            <option value="Medical Writing">Medical Writing</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date Range
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, dateRange: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, sortBy: e.target.value }))
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="applications">Most Applications</option>
            <option value="budget">Highest Budget</option>
            <option value="deadline">Deadline Soon</option>
          </select>
        </div>
      </div>
    </div>
  );

  // Job card component
  const JobCard = ({ job }) => {
    const [showDropdown, setShowDropdown] = useState(false);

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
        {/* Job Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <input
                type="checkbox"
                checked={selectedJobs.includes(job.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedJobs((prev) => [...prev, job.id]);
                  } else {
                    setSelectedJobs((prev) =>
                      prev.filter((id) => id !== job.id)
                    );
                  }
                }}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                {job.title}
              </h3>
              {job.featured && (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                  Featured
                </span>
              )}
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center space-x-1">
                <Briefcase className="w-4 h-4" />
                <span>{job.category}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Star className="w-4 h-4" />
                <span>{job.specialty}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Due {new Date(job.deadline).toLocaleDateString()}</span>
              </span>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-500" />
            </button>

            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                <Link
                  to={`/jobs/${job.id}`}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
                >
                  <Eye className="w-4 h-4" />
                  <span>View Details</span>
                </Link>
                <Link
                  to={`/jobs/${job.id}/edit`}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Job</span>
                </Link>
                <Link
                  to={`/jobs/${job.id}/applications`}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                >
                  <FileText className="w-4 h-4" />
                  <span>View Applications</span>
                </Link>
                <button
                  onClick={() =>
                    handleJobAction(
                      job.id,
                      job.status === "active" ? "paused" : "active"
                    )
                  }
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50 w-full text-left"
                >
                  {job.status === "active" ? (
                    <>
                      <Pause className="w-4 h-4" />
                      <span>Pause Job</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4" />
                      <span>Resume Job</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleJobAction(job.id, "closed")}
                  className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left last:rounded-b-lg"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Close Job</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Job Status and Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <span
              className={`inline-flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(
                job.status
              )}`}
            >
              {getStatusIcon(job.status)}
              <span className="capitalize">{job.status}</span>
            </span>

            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center space-x-1">
                <Users className="w-4 h-4" />
                <span>{job.applications} applications</span>
              </span>
              <span className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{job.views} views</span>
              </span>
            </div>
          </div>

          <div className="text-right">
            <div className="text-lg font-bold text-green-600">
              ${job.budget.toLocaleString()}
              {job.budgetType === "hourly" && (
                <span className="text-sm">/hr</span>
              )}
            </div>
            <p className="text-xs text-gray-500 capitalize">{job.budgetType}</p>
          </div>
        </div>

        {/* Job Description Preview */}
        <p className="text-gray-700 text-sm mb-4 line-clamp-2">
          {job.description}
        </p>

        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-3">
            <Link
              to={`/jobs/${job.id}/applications`}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <FileText className="w-4 h-4" />
              <span>View Applications ({job.applications})</span>
            </Link>

            <Link
              to={`/jobs/${job.id}`}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <Eye className="w-4 h-4" />
              <span>View Details</span>
            </Link>
          </div>

          <div className="flex space-x-2">
            <button className="p-2 text-gray-500 hover:text-blue-600 transition-colors">
              <MessageSquare className="w-4 h-4" />
            </button>
            <button className="p-2 text-gray-500 hover:text-green-600 transition-colors">
              <BarChart3 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Job Management</h1>
            <p className="text-gray-600 mt-2">
              Manage your posted jobs and review applications
            </p>
          </div>
          <Link
            to="/jobs/post"
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span>Post New Job</span>
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-400 text-red-700 p-4 rounded-lg mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-3" />
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <StatsCards />

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs by title or specialty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>

              <button
                onClick={loadJobs}
                className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>

              <button className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        <FiltersPanel />

        {/* Bulk Actions */}
        {selectedJobs.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-blue-800 font-medium">
                {selectedJobs.length} job{selectedJobs.length > 1 ? "s" : ""}{" "}
                selected
              </span>
              <div className="flex space-x-3">
                <button
                  onClick={() => handleBulkAction("paused")}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-sm"
                >
                  Pause Selected
                </button>
                <button
                  onClick={() => handleBulkAction("active")}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Activate Selected
                </button>
                <button
                  onClick={() => handleBulkAction("closed")}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Close Selected
                </button>
                <button
                  onClick={() => setSelectedJobs([])}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Jobs List */}
        <div className="space-y-6">
          {loading ? (
            <div className="grid gap-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : sortedJobs.length > 0 ? (
            <div className="grid gap-6">
              {sortedJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No Jobs Found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || filters.status !== "all" || filters.category
                  ? "No jobs match your current filters. Try adjusting your search criteria."
                  : "You haven't posted any jobs yet. Create your first job posting to get started."}
              </p>
              {!searchTerm && filters.status === "all" && !filters.category && (
                <Link
                  to="/jobs/post"
                  className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Post Your First Job</span>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobManagement;
