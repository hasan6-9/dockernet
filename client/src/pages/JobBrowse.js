// ============================================================================
// IMPORTS
// ============================================================================
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { jobAPI, matchingAPI, handleApiError, formatters } from "../api";
import {
  Search,
  Filter,
  Grid,
  List,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Briefcase,
  Users,
  Eye,
  Heart,
  Share2,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle,
  Target,
  TrendingUp,
  Calendar,
  Award,
  Bookmark,
  BookmarkCheck,
  ArrowRight,
  RefreshCw,
  X,
  Plus,
} from "lucide-react";

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const JobBrowse = () => {
  // --------------------------------------------------------------------------
  // HOOKS & STATE
  // --------------------------------------------------------------------------
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isJunior, isSenior } = useAuth();

  // UI State
  const [viewMode, setViewMode] = useState(
    localStorage.getItem("jobViewMode") || "grid"
  );
  const [showFilters, setShowFilters] = useState(false);

  // Filter State (sync with URL params)
  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    specialty: searchParams.get("specialty") || "",
    category: searchParams.get("category") || "",
    experienceLevel: searchParams.get("experience") || "",
    budgetMin: searchParams.get("budgetMin") || "",
    budgetMax: searchParams.get("budgetMax") || "",
    budgetType: searchParams.get("budgetType") || "",
    timeline: searchParams.get("timeline") || "",
    verified: searchParams.get("verified") === "true",
    sortBy: searchParams.get("sortBy") || "recent",
  });

  // Pagination State
  const [page, setPage] = useState(parseInt(searchParams.get("page")) || 1);
  const [limit] = useState(12);

  // Debounced search term
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  // --------------------------------------------------------------------------
  // DEBOUNCE SEARCH
  // --------------------------------------------------------------------------
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // --------------------------------------------------------------------------
  // SYNC FILTERS WITH URL
  // --------------------------------------------------------------------------
  useEffect(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.set(key, value.toString());
    });
    if (page > 1) params.set("page", page.toString());
    setSearchParams(params, { replace: true });
  }, [filters, page, setSearchParams]);

  // --------------------------------------------------------------------------
  // DATA FETCHING - JOBS LIST
  // --------------------------------------------------------------------------
  const {
    data: jobsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["jobs-browse", debouncedSearch, filters, page],
    queryFn: async () => {
      // Prepare query params
      const params = {
        page,
        limit,
        sortBy: filters.sortBy,
        ...(filters.specialty && { specialty: filters.specialty }),
        ...(filters.category && { category: filters.category }),
        ...(filters.experienceLevel && {
          experience_level: filters.experienceLevel,
        }),
        ...(filters.budgetMin && { budget_min: parseFloat(filters.budgetMin) }),
        ...(filters.budgetMax && { budget_max: parseFloat(filters.budgetMax) }),
        ...(filters.budgetType && { budget_type: filters.budgetType }),
        ...(filters.timeline && { timeline: filters.timeline }),
        ...(filters.verified && { verified: true }),
      };

      // Use search or browse endpoint
      if (debouncedSearch.trim()) {
        return await jobAPI.search({
          searchTerm: debouncedSearch,
          ...params,
        });
      } else {
        return await jobAPI.browse(params);
      }
    },
    keepPreviousData: true, // Smooth pagination
    staleTime: 2 * 60 * 1000, // 2 minutes
    onError: (error) => {
      const errorInfo = handleApiError(error);
      toast.error(errorInfo.message);
    },
  });

  // --------------------------------------------------------------------------
  // DATA FETCHING - SAVED JOBS
  // --------------------------------------------------------------------------
  const { data: savedJobsData } = useQuery({
    queryKey: ["saved-jobs"],
    queryFn: () => jobAPI.getSavedJobs(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });

  // Extract saved job IDs
  const savedJobIds = new Set(
    savedJobsData?.data?.data?.map((job) => job.id) || []
  );

  // --------------------------------------------------------------------------
  // MUTATIONS - SAVE/UNSAVE JOB
  // --------------------------------------------------------------------------
  const saveMutation = useMutation({
    mutationFn: (jobId) => jobAPI.saveJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries(["saved-jobs"]);
      toast.success("Job saved!");
    },
    onError: (error) => {
      const errorInfo = handleApiError(error);
      toast.error(errorInfo.message);
    },
  });

  const unsaveMutation = useMutation({
    mutationFn: (jobId) => jobAPI.unsaveJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries(["saved-jobs"]);
      toast.success("Job removed from saved");
    },
    onError: (error) => {
      const errorInfo = handleApiError(error);
      toast.error(errorInfo.message);
    },
  });

  // --------------------------------------------------------------------------
  // MUTATIONS - TRACK JOB VIEW
  // --------------------------------------------------------------------------
  const trackViewMutation = useMutation({
    mutationFn: (jobId) => jobAPI.trackView(jobId),
  });

  // --------------------------------------------------------------------------
  // EVENT HANDLERS
  // --------------------------------------------------------------------------
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPage(1); // Reset to first page on filter change
  };

  const toggleSaveJob = (jobId) => {
    if (!isAuthenticated) {
      toast.error("Please login to save jobs");
      navigate("/login");
      return;
    }

    if (savedJobIds.has(jobId)) {
      unsaveMutation.mutate(jobId);
    } else {
      saveMutation.mutate(jobId);
    }
  };

  const handleJobClick = (jobId) => {
    // Track view
    trackViewMutation.mutate(jobId);
    // Navigate to job details
    navigate(`/jobs/${jobId}`);
  };

  const clearAllFilters = () => {
    setFilters({
      search: "",
      specialty: "",
      category: "",
      experienceLevel: "",
      budgetMin: "",
      budgetMax: "",
      budgetType: "",
      timeline: "",
      verified: false,
      sortBy: "recent",
    });
    setPage(1);
  };

  // --------------------------------------------------------------------------
  // VIEW MODE PERSISTENCE
  // --------------------------------------------------------------------------
  useEffect(() => {
    localStorage.setItem("jobViewMode", viewMode);
  }, [viewMode]);

  // --------------------------------------------------------------------------
  // HELPER FUNCTIONS
  // --------------------------------------------------------------------------
  const getMatchScoreColor = (score) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 80) return "text-blue-600 bg-blue-100";
    if (score >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-gray-600 bg-gray-100";
  };

  const getTimelineDisplay = (timeline) => {
    const timelineMap = {
      urgent: "Urgent (< 1 week)",
      short: "Short-term (1-4 weeks)",
      medium: "Medium-term (1-3 months)",
      long: "Long-term (3+ months)",
      ongoing: "Ongoing",
    };
    return timelineMap[timeline] || timeline;
  };

  // --------------------------------------------------------------------------
  // CONSTANTS
  // --------------------------------------------------------------------------
  const specialties = [
    "Internal Medicine",
    "Cardiology",
    "Dermatology",
    "Emergency Medicine",
    "Family Medicine",
    "Neurology",
    "Orthopedics",
    "Pediatrics",
    "Psychiatry",
    "Radiology",
    "Surgery",
    "Other",
  ];

  const categories = [
    "consultation",
    "research",
    "documentation",
    "review",
    "telemedicine",
  ];

  const experienceLevels = [
    { value: "resident", label: "Resident" },
    { value: "junior", label: "Junior (0-3 years)" },
    { value: "mid-level", label: "Mid-Level (3-7 years)" },
    { value: "senior", label: "Senior (7+ years)" },
    { value: "attending", label: "Attending" },
  ];

  const sortOptions = [
    { value: "recent", label: "Most Recent" },
    { value: "budget_high", label: "Highest Budget" },
    { value: "budget_low", label: "Lowest Budget" },
    { value: "deadline", label: "Deadline Soon" },
    { value: "match", label: "Best Match" },
  ];

  // --------------------------------------------------------------------------
  // SUB-COMPONENTS
  // --------------------------------------------------------------------------

  // Search and Filters Header
  const SearchFiltersHeader = () => (
    <div className="bg-white rounded-xl shadow-elevation-2 border border-gray-100 p-6 mb-6">
      {/* Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs by title, specialty, or keywords..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all"
          />
          {filters.search && (
            <button
              onClick={() => handleFilterChange("search", "")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 border-2 rounded-lg transition-all ${
              showFilters
                ? "border-primary-500 bg-primary-50 text-primary-700"
                : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {showFilters ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          <div className="flex border-2 border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-3 transition-colors ${
                viewMode === "grid"
                  ? "bg-primary-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-3 transition-colors ${
                viewMode === "list"
                  ? "bg-primary-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="border-t border-gray-100 pt-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Specialty Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specialty
              </label>
              <select
                value={filters.specialty}
                onChange={(e) =>
                  handleFilterChange("specialty", e.target.value)
                }
                className="input w-full"
              >
                <option value="">All Specialties</option>
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="input w-full"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience Level Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level
              </label>
              <select
                value={filters.experienceLevel}
                onChange={(e) =>
                  handleFilterChange("experienceLevel", e.target.value)
                }
                className="input w-full"
              >
                <option value="">Any Experience</option>
                {experienceLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="input w-full"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Budget Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Range
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.budgetMin}
                  onChange={(e) =>
                    handleFilterChange("budgetMin", e.target.value)
                  }
                  className="input w-full"
                  min="0"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.budgetMax}
                  onChange={(e) =>
                    handleFilterChange("budgetMax", e.target.value)
                  }
                  className="input w-full"
                  min="0"
                />
              </div>
            </div>

            {/* Budget Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Type
              </label>
              <select
                value={filters.budgetType}
                onChange={(e) =>
                  handleFilterChange("budgetType", e.target.value)
                }
                className="input w-full"
              >
                <option value="">Any Type</option>
                <option value="fixed">Fixed Price</option>
                <option value="hourly">Hourly Rate</option>
                <option value="negotiable">Negotiable</option>
              </select>
            </div>

            {/* Timeline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeline
              </label>
              <select
                value={filters.timeline}
                onChange={(e) => handleFilterChange("timeline", e.target.value)}
                className="input w-full"
              >
                <option value="">Any Timeline</option>
                <option value="urgent">Urgent</option>
                <option value="short">Short-term</option>
                <option value="medium">Medium-term</option>
                <option value="long">Long-term</option>
                <option value="ongoing">Ongoing</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.verified}
                onChange={(e) =>
                  handleFilterChange("verified", e.target.checked)
                }
                className="w-4 h-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                Verified employers only
              </span>
            </label>

            <button
              onClick={clearAllFilters}
              className="text-primary-600 hover:text-primary-700 text-sm flex items-center gap-1 font-medium"
            >
              <X className="w-4 h-4" />
              <span>Clear all filters</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Job Card Component
  const JobCard = ({ job }) => (
    <div
      className={`bg-white rounded-xl shadow-elevation-2 border border-gray-100 p-6 hover:shadow-elevation-3 hover:-translate-y-1 transition-all duration-300 ${
        job.featured
          ? "ring-2 ring-yellow-400 bg-gradient-to-br from-yellow-50/30 to-white"
          : ""
      }`}
    >
      {/* Featured Badge */}
      {job.featured && (
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-yellow-700 text-sm font-medium">
            Featured Job
          </span>
        </div>
      )}

      {/* Job Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <button
            onClick={() => handleJobClick(job._id || job.id)}
            className="text-xl font-bold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2 text-left w-full"
          >
            {job.title}
          </button>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Briefcase className="w-4 h-4" />
              <span className="capitalize">{job.category}</span>
            </span>
            <span className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              <span>{job.specialty}</span>
            </span>
            {job.timeline && (
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>
                  {getTimelineDisplay(
                    job.timeline?.estimated_hours ? "medium" : job.status
                  )}
                </span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          {/* Match Score (for junior doctors only) */}
          {isAuthenticated && isJunior() && job.matchScore && (
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchScoreColor(
                job.matchScore
              )}`}
            >
              {job.matchScore}% match
            </div>
          )}

          {/* Save/Bookmark Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSaveJob(job._id || job.id);
            }}
            disabled={saveMutation.isLoading || unsaveMutation.isLoading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            {savedJobIds.has(job._id || job.id) ? (
              <BookmarkCheck className="w-5 h-5 text-primary-600" />
            ) : (
              <Bookmark className="w-5 h-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>

      {/* Job Description */}
      <p className="text-gray-700 text-sm mb-4 line-clamp-3">
        {job.description}
      </p>

      {/* Required Skills */}
      {job.skills_required && job.skills_required.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {job.skills_required.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium"
              >
                {skill}
              </span>
            ))}
            {job.skills_required.length > 3 && (
              <span className="text-gray-500 text-xs py-1">
                +{job.skills_required.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Job Details */}
      <div className="flex items-center justify-between mb-4 pt-4 border-t border-gray-100">
        <div className="space-y-1">
          <div className="text-2xl font-bold text-success-600">
            {formatters.budget(job)}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{job.applications_count || 0} applications</span>
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{job.views_count || 0} views</span>
            </span>
          </div>
        </div>

        <div className="text-right">
          {job.timeline?.deadline && (
            <div className="text-sm text-gray-500 mb-1">
              Deadline: {formatters.date(job.timeline.deadline)}
            </div>
          )}
          <div className="text-xs text-gray-400">
            Posted {formatters.timeAgo(job.createdAt)}
          </div>
        </div>
      </div>

      {/* Employer Info */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm">
              {job.posted_by?.firstName?.[0] || "U"}
              {job.posted_by?.lastName?.[0] || ""}
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="font-medium text-gray-900 truncate">
                {job.posted_by?.firstName} {job.posted_by?.lastName}
              </p>
              {job.posted_by?.verificationStatus?.overall === "verified" && (
                <CheckCircle className="w-4 h-4 text-success-500 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="truncate">
                {job.posted_by?.primarySpecialty}
              </span>
              {job.posted_by?.rating?.average > 0 && (
                <>
                  <span>•</span>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                    <span>{job.posted_by.rating.average.toFixed(1)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2 ml-4 flex-shrink-0">
          <button
            onClick={() => handleJobClick(job._id || job.id)}
            className="px-4 py-2 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors text-sm font-medium"
          >
            View Details
          </button>
          {isAuthenticated && isJunior() ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/jobs/${job._id || job.id}/apply`);
              }}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <span>Apply</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : !isAuthenticated ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate("/login", {
                  state: { from: `/jobs/${job._id || job.id}` },
                });
              }}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
            >
              Login to Apply
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );

  // --------------------------------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------------------------------
  if (isLoading && !jobsData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-96 animate-pulse"></div>
          </div>

          <SearchFiltersHeader />

          <div className="grid lg:grid-cols-2 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-elevation-2 border border-gray-100 p-6 animate-pulse"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="flex gap-2 mb-4">
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-24"></div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                    <div>
                      <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // ERROR STATE
  // --------------------------------------------------------------------------
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Find Medical Opportunities
            </h1>
            <p className="text-gray-600">
              Discover freelance projects and consulting opportunities
            </p>
          </div>

          <div className="max-w-md mx-auto mt-12">
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-900 mb-2">
                    Error Loading Jobs
                  </h3>
                  <p className="text-red-700 mb-4">
                    {error.response?.data?.message ||
                      "Unable to load jobs. Please try again."}
                  </p>
                  <button
                    onClick={() => refetch()}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Extract jobs and pagination from response
  const jobs = jobsData?.data?.data || [];
  const pagination = jobsData?.data?.pagination || { total: 0, pages: 0 };

  // --------------------------------------------------------------------------
  // EMPTY STATE
  // --------------------------------------------------------------------------
  if (!isLoading && jobs.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Find Medical Opportunities
            </h1>
            <p className="text-gray-600">
              Discover freelance projects and consulting opportunities
            </p>
          </div>

          <SearchFiltersHeader />

          <div className="bg-white rounded-xl shadow-elevation-2 border border-gray-100 p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Jobs Found
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {debouncedSearch ||
              Object.values(filters).some((v) => v && v !== "recent")
                ? "No jobs match your current search criteria. Try adjusting your filters or search terms."
                : "No jobs are currently available. Check back soon for new opportunities."}
            </p>
            <div className="flex justify-center gap-3">
              {(debouncedSearch ||
                Object.values(filters).some((v) => v && v !== "recent")) && (
                <button
                  onClick={clearAllFilters}
                  className="btn-secondary px-6 py-3"
                >
                  Clear All Filters
                </button>
              )}
              {isAuthenticated && isSenior() && (
                <button
                  onClick={() => navigate("/jobs/create")}
                  className="btn-medical px-6 py-3 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Post a Job
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER MAIN CONTENT
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                Find Medical Opportunities
              </h1>
              <p className="text-gray-600">
                Discover freelance projects and consulting opportunities from
                verified medical professionals
              </p>
            </div>
            {isAuthenticated && isSenior() && (
              <button
                onClick={() => navigate("/jobs/create")}
                className="btn-medical px-6 py-3 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Post a Job
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <SearchFiltersHeader />

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <p className="text-gray-600 font-medium">
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Loading...
                </span>
              ) : (
                `${pagination.total} ${
                  pagination.total === 1 ? "job" : "jobs"
                } found`
              )}
            </p>
            <button
              onClick={() => refetch()}
              disabled={isLoading}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors disabled:opacity-50 text-sm font-medium"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>

          {savedJobIds.size > 0 && (
            <button
              onClick={() => navigate("/jobs/saved")}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors text-sm font-medium"
            >
              <Bookmark className="w-4 h-4" />
              <span>
                {savedJobIds.size} saved{" "}
                {savedJobIds.size === 1 ? "job" : "jobs"}
              </span>
            </button>
          )}
        </div>

        {/* Jobs Grid/List */}
        <div
          className={
            viewMode === "grid"
              ? "grid lg:grid-cols-2 gap-6 mb-8"
              : "space-y-6 mb-8"
          }
        >
          {jobs.map((job) => (
            <JobCard key={job._id || job.id} job={job} />
          ))}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl shadow-elevation-2 border border-gray-100 p-6">
            <p className="text-sm text-gray-600">
              Showing page {page} of {pagination.pages}
            </p>

            <div className="flex items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => {
                  setPage((p) => Math.max(1, p - 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={page === 1}
                className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex gap-2">
                {(() => {
                  const pageNumbers = [];
                  const maxVisible = 5;
                  let startPage = Math.max(
                    1,
                    page - Math.floor(maxVisible / 2)
                  );
                  let endPage = Math.min(
                    pagination.pages,
                    startPage + maxVisible - 1
                  );

                  // Adjust start if we're near the end
                  if (endPage - startPage < maxVisible - 1) {
                    startPage = Math.max(1, endPage - maxVisible + 1);
                  }

                  // First page
                  if (startPage > 1) {
                    pageNumbers.push(
                      <button
                        key={1}
                        onClick={() => {
                          setPage(1);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        1
                      </button>
                    );
                    if (startPage > 2) {
                      pageNumbers.push(
                        <span key="ellipsis1" className="px-2 text-gray-500">
                          ...
                        </span>
                      );
                    }
                  }

                  // Visible pages
                  for (let i = startPage; i <= endPage; i++) {
                    pageNumbers.push(
                      <button
                        key={i}
                        onClick={() => {
                          setPage(i);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={`px-4 py-2 border-2 rounded-lg transition-colors font-medium ${
                          page === i
                            ? "border-primary-600 bg-primary-600 text-white"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {i}
                      </button>
                    );
                  }

                  // Last page
                  if (endPage < pagination.pages) {
                    if (endPage < pagination.pages - 1) {
                      pageNumbers.push(
                        <span key="ellipsis2" className="px-2 text-gray-500">
                          ...
                        </span>
                      );
                    }
                    pageNumbers.push(
                      <button
                        key={pagination.pages}
                        onClick={() => {
                          setPage(pagination.pages);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        {pagination.pages}
                      </button>
                    );
                  }

                  return pageNumbers;
                })()}
              </div>

              {/* Next Button */}
              <button
                onClick={() => {
                  setPage((p) => Math.min(pagination.pages, p + 1));
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                disabled={page === pagination.pages}
                className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions for Junior Doctors */}
        {isAuthenticated && isJunior() && (
          <div className="mt-8 bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl shadow-elevation-3 p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-white">
                <h3 className="text-xl font-bold mb-1">
                  Get Personalized Job Recommendations
                </h3>
                <p className="text-primary-100">
                  View jobs matched to your skills and experience
                </p>
              </div>
              <button
                onClick={() => navigate("/jobs/recommendations")}
                className="bg-white text-primary-600 px-6 py-3 rounded-lg hover:bg-primary-50 transition-colors font-medium flex items-center gap-2"
              >
                <Target className="w-5 h-5" />
                View Recommendations
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// EXPORT
// ============================================================================
export default JobBrowse;
