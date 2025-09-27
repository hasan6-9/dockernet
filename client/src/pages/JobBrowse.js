import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
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

const JobBrowse = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // State management
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // grid or list
  const [showFilters, setShowFilters] = useState(false);
  const [savedJobs, setSavedJobs] = useState(new Set());

  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    specialty: "",
    category: "",
    experienceLevel: "",
    budgetMin: "",
    budgetMax: "",
    budgetType: "",
    location: "remote",
    timeline: "",
    verified: false,
    sortBy: "newest",
  });

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  // Sample job data
  const [sampleJobs] = useState([
    {
      id: "1",
      title: "Cardiology Consultation Support",
      category: "Consultation",
      specialty: "Cardiology",
      description:
        "We are seeking an experienced cardiologist to provide consultation support for complex cardiac cases. This remote position involves reviewing patient charts, providing second opinions, and collaborating with our medical team.",
      budget: 2500,
      budgetType: "fixed",
      experienceLevel: "senior",
      timeline: "medium",
      location: "remote",
      deadline: "2024-02-15",
      postedDate: "2024-01-15",
      applications: 12,
      views: 89,
      featured: true,
      employer: {
        id: "emp1",
        name: "Dr. Sarah Wilson",
        title: "Cardiothoracic Surgeon",
        rating: 4.9,
        verified: true,
        location: "Los Angeles, CA",
      },
      requiredSkills: [
        "Cardiac Catheterization",
        "Echocardiography",
        "Clinical Assessment",
      ],
      matchScore: 92,
    },
    {
      id: "2",
      title: "Emergency Medicine Chart Review",
      category: "Chart Review",
      specialty: "Emergency Medicine",
      description:
        "Need experienced emergency medicine physician to review charts for quality assurance. Cases involve trauma, cardiac emergencies, and complex presentations.",
      budget: 75,
      budgetType: "hourly",
      experienceLevel: "mid",
      timeline: "ongoing",
      location: "remote",
      deadline: "2024-02-20",
      postedDate: "2024-01-10",
      applications: 8,
      views: 67,
      featured: false,
      employer: {
        id: "emp2",
        name: "Metropolitan Hospital",
        title: "Healthcare Institution",
        rating: 4.7,
        verified: true,
        location: "Chicago, IL",
      },
      requiredSkills: [
        "Emergency Medicine",
        "Chart Review",
        "Quality Assurance",
      ],
      matchScore: 85,
    },
    {
      id: "3",
      title: "Pediatric Telemedicine Consultations",
      category: "Consultation",
      specialty: "Pediatrics",
      description:
        "Join our telemedicine platform to provide pediatric consultations. Flexible scheduling with competitive hourly rates. Perfect for building remote practice experience.",
      budget: 120,
      budgetType: "hourly",
      experienceLevel: "entry",
      timeline: "long",
      location: "remote",
      deadline: "2024-02-25",
      postedDate: "2024-01-20",
      applications: 15,
      views: 134,
      featured: false,
      employer: {
        id: "emp3",
        name: "TeleCare Solutions",
        title: "Telemedicine Company",
        rating: 4.6,
        verified: true,
        location: "Remote",
      },
      requiredSkills: [
        "Pediatric Medicine",
        "Telemedicine",
        "Patient Communication",
      ],
      matchScore: 78,
    },
    {
      id: "4",
      title: "Medical Research Data Analysis",
      category: "Research Support",
      specialty: "Internal Medicine",
      description:
        "Seeking internal medicine physician to assist with clinical research data analysis. Experience with statistical analysis and research methodology preferred.",
      budget: 5000,
      budgetType: "milestone",
      experienceLevel: "senior",
      timeline: "medium",
      location: "hybrid",
      deadline: "2024-03-01",
      postedDate: "2024-01-18",
      applications: 6,
      views: 45,
      featured: true,
      employer: {
        id: "emp4",
        name: "Dr. Michael Chen",
        title: "Research Director",
        rating: 4.8,
        verified: true,
        location: "Boston, MA",
      },
      requiredSkills: [
        "Clinical Research",
        "Data Analysis",
        "Statistical Methods",
      ],
      matchScore: 88,
    },
    {
      id: "5",
      title: "Radiology Report Review",
      category: "Chart Review",
      specialty: "Radiology",
      description:
        "Looking for board-certified radiologist to provide secondary review of imaging studies. Excellent opportunity for supplemental income with flexible hours.",
      budget: 150,
      budgetType: "hourly",
      experienceLevel: "senior",
      timeline: "ongoing",
      location: "remote",
      deadline: "2024-02-28",
      postedDate: "2024-01-12",
      applications: 4,
      views: 78,
      featured: false,
      employer: {
        id: "emp5",
        name: "Imaging Associates",
        title: "Radiology Group",
        rating: 4.5,
        verified: true,
        location: "Denver, CO",
      },
      requiredSkills: ["Radiology", "Image Interpretation", "Report Writing"],
      matchScore: 94,
    },
    {
      id: "6",
      title: "Psychiatry Consultation Service",
      category: "Consultation",
      specialty: "Psychiatry",
      description:
        "Remote psychiatry consultations for hospital patients. Part-time position with excellent work-life balance. Board certification required.",
      budget: 180,
      budgetType: "hourly",
      experienceLevel: "mid",
      timeline: "long",
      location: "remote",
      deadline: "2024-03-15",
      postedDate: "2024-01-22",
      applications: 9,
      views: 92,
      featured: false,
      employer: {
        id: "emp6",
        name: "Regional Medical Center",
        title: "Healthcare System",
        rating: 4.4,
        verified: true,
        location: "Phoenix, AZ",
      },
      requiredSkills: ["Psychiatry", "Consultation", "Patient Assessment"],
      matchScore: 76,
    },
  ]);

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
    "Consultation",
    "Second Opinion",
    "Chart Review",
    "Research Support",
    "Medical Writing",
    "Teaching/Training",
    "Administrative Support",
    "Other",
  ];

  const experienceLevels = [
    { value: "entry", label: "Entry Level (0-2 years)" },
    { value: "mid", label: "Mid Level (3-5 years)" },
    { value: "senior", label: "Senior Level (5+ years)" },
    { value: "expert", label: "Expert Level (10+ years)" },
  ];

  const sortOptions = [
    { value: "newest", label: "Most Recent" },
    { value: "match", label: "Best Match" },
    { value: "budget_high", label: "Highest Budget" },
    { value: "deadline", label: "Deadline Soon" },
    { value: "applications", label: "Fewest Applications" },
  ];

  // Load jobs
  useEffect(() => {
    loadJobs();
  }, [filters, pagination.page]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      // API call would be here
      await new Promise((resolve) => setTimeout(resolve, 1000));

      let filteredJobs = [...sampleJobs];

      // Apply filters
      if (filters.search) {
        filteredJobs = filteredJobs.filter(
          (job) =>
            job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
            job.description
              .toLowerCase()
              .includes(filters.search.toLowerCase()) ||
            job.specialty.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      if (filters.specialty) {
        filteredJobs = filteredJobs.filter(
          (job) => job.specialty === filters.specialty
        );
      }

      if (filters.category) {
        filteredJobs = filteredJobs.filter(
          (job) => job.category === filters.category
        );
      }

      if (filters.experienceLevel) {
        filteredJobs = filteredJobs.filter(
          (job) => job.experienceLevel === filters.experienceLevel
        );
      }

      if (filters.budgetMin) {
        filteredJobs = filteredJobs.filter(
          (job) => job.budget >= parseInt(filters.budgetMin)
        );
      }

      if (filters.budgetMax) {
        filteredJobs = filteredJobs.filter(
          (job) => job.budget <= parseInt(filters.budgetMax)
        );
      }

      if (filters.budgetType) {
        filteredJobs = filteredJobs.filter(
          (job) => job.budgetType === filters.budgetType
        );
      }

      if (filters.timeline) {
        filteredJobs = filteredJobs.filter(
          (job) => job.timeline === filters.timeline
        );
      }

      if (filters.verified) {
        filteredJobs = filteredJobs.filter((job) => job.employer.verified);
      }

      // Apply sorting
      filteredJobs.sort((a, b) => {
        switch (filters.sortBy) {
          case "newest":
            return new Date(b.postedDate) - new Date(a.postedDate);
          case "match":
            return b.matchScore - a.matchScore;
          case "budget_high":
            return b.budget - a.budget;
          case "deadline":
            return new Date(a.deadline) - new Date(b.deadline);
          case "applications":
            return a.applications - b.applications;
          default:
            return 0;
        }
      });

      setJobs(filteredJobs);
      setPagination((prev) => ({
        ...prev,
        total: filteredJobs.length,
        pages: Math.ceil(filteredJobs.length / prev.limit),
      }));
    } catch (err) {
      setError("Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Save/unsave job
  const toggleSaveJob = (jobId) => {
    setSavedJobs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(jobId)) {
        newSet.delete(jobId);
      } else {
        newSet.add(jobId);
      }
      return newSet;
    });
  };

  // Get match score color
  const getMatchScoreColor = (score) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 80) return "text-blue-600 bg-blue-100";
    if (score >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  // Format budget display
  const formatBudget = (job) => {
    const { budget, budgetType } = job;
    if (budgetType === "hourly") {
      return `${budget}/hour`;
    } else if (budgetType === "milestone") {
      return `${budget.toLocaleString()} milestone`;
    }
    return `${budget.toLocaleString()} fixed`;
  };

  // Get timeline display
  const getTimelineDisplay = (timeline) => {
    const timelineMap = {
      urgent: "Urgent (24h)",
      short: "Short-term (1-7 days)",
      medium: "Medium-term (1-4 weeks)",
      long: "Long-term (1+ months)",
      ongoing: "Ongoing",
    };
    return timelineMap[timeline] || timeline;
  };

  // Search and filters header
  const SearchFiltersHeader = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
      {/* Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs by title, specialty, or keywords..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
            {showFilters ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          <div className="flex border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-3 ${
                viewMode === "grid"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              } transition-colors`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-3 ${
                viewMode === "list"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-600 hover:bg-gray-50"
              } transition-colors`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      {showFilters && (
        <div className="border-t border-gray-200 pt-6 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialty
              </label>
              <select
                value={filters.specialty}
                onChange={(e) =>
                  handleFilterChange("specialty", e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Specialties</option>
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience Level
              </label>
              <select
                value={filters.experienceLevel}
                onChange={(e) =>
                  handleFilterChange("experienceLevel", e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any Experience</option>
                {experienceLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.budgetMin}
                  onChange={(e) =>
                    handleFilterChange("budgetMin", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.budgetMax}
                  onChange={(e) =>
                    handleFilterChange("budgetMax", e.target.value)
                  }
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Budget Type
              </label>
              <select
                value={filters.budgetType}
                onChange={(e) =>
                  handleFilterChange("budgetType", e.target.value)
                }
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any Type</option>
                <option value="fixed">Fixed Price</option>
                <option value="hourly">Hourly</option>
                <option value="milestone">Milestone</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timeline
              </label>
              <select
                value={filters.timeline}
                onChange={(e) => handleFilterChange("timeline", e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.verified}
                onChange={(e) =>
                  handleFilterChange("verified", e.target.checked)
                }
                className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-sm text-gray-700">
                Verified employers only
              </span>
            </label>

            <button
              onClick={() => {
                setFilters({
                  search: "",
                  specialty: "",
                  category: "",
                  experienceLevel: "",
                  budgetMin: "",
                  budgetMax: "",
                  budgetType: "",
                  location: "remote",
                  timeline: "",
                  verified: false,
                  sortBy: "newest",
                });
              }}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
            >
              <X className="w-4 h-4" />
              <span>Clear all filters</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  // Job card component
  const JobCard = ({ job, isListView = false }) => (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 ${
        job.featured ? "ring-2 ring-yellow-200 bg-yellow-50/30" : ""
      }`}
    >
      {job.featured && (
        <div className="flex items-center space-x-2 mb-4">
          <Star className="w-4 h-4 text-yellow-500 fill-current" />
          <span className="text-yellow-700 text-sm font-medium">Featured</span>
        </div>
      )}

      {/* Job Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Link
            to={`/jobs/${job.id}`}
            className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors line-clamp-2"
          >
            {job.title}
          </Link>
          <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
            <span className="flex items-center space-x-1">
              <Briefcase className="w-4 h-4" />
              <span>{job.category}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Star className="w-4 h-4" />
              <span>{job.specialty}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{getTimelineDisplay(job.timeline)}</span>
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-2 ml-4">
          {isAuthenticated && job.matchScore && (
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${getMatchScoreColor(
                job.matchScore
              )}`}
            >
              {job.matchScore}% match
            </div>
          )}
          <button
            onClick={() => toggleSaveJob(job.id)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {savedJobs.has(job.id) ? (
              <BookmarkCheck className="w-5 h-5 text-blue-600" />
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
      {job.requiredSkills && job.requiredSkills.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {job.requiredSkills.slice(0, 3).map((skill, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium"
              >
                {skill}
              </span>
            ))}
            {job.requiredSkills.length > 3 && (
              <span className="text-gray-500 text-xs">
                +{job.requiredSkills.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Job Details */}
      <div className="flex items-center justify-between mb-4 pt-4 border-t border-gray-100">
        <div className="space-y-1">
          <div className="text-2xl font-bold text-green-600">
            {formatBudget(job)}
          </div>
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
          <div className="text-sm text-gray-500 mb-1">
            Deadline: {new Date(job.deadline).toLocaleDateString()}
          </div>
          <div className="text-xs text-gray-400">
            Posted {new Date(job.postedDate).toLocaleDateString()}
          </div>
        </div>
      </div>

      {/* Employer Info */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
            <Users className="w-5 h-5 text-gray-600" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <p className="font-medium text-gray-900">{job.employer.name}</p>
              {job.employer.verified && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <span>{job.employer.title}</span>
              {job.employer.rating && (
                <>
                  <span>•</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-3 h-3 text-yellow-400 fill-current" />
                    <span>{job.employer.rating}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex space-x-2">
          <Link
            to={`/jobs/${job.id}`}
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
          >
            View Details
          </Link>
          {isAuthenticated ? (
            <Link
              to={`/jobs/${job.id}/apply`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center space-x-2"
            >
              <span>Apply Now</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Login to Apply
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Find Medical Opportunities
          </h1>
          <p className="text-gray-600">
            Discover freelance projects and consulting opportunities from
            verified medical professionals
          </p>
        </div>

        {/* Search and Filters */}
        <SearchFiltersHeader />

        {/* Results Count and View Toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <p className="text-gray-600">
              {loading ? "Loading..." : `${jobs.length} jobs found`}
            </p>
            <button
              onClick={loadJobs}
              disabled={loading}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              <span>Refresh</span>
            </button>
          </div>

          {savedJobs.size > 0 && (
            <Link
              to="/jobs/saved"
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Bookmark className="w-4 h-4" />
              <span>{savedJobs.size} saved jobs</span>
            </Link>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-400 text-red-700 p-4 rounded-lg mb-6 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-3" />
            {error}
          </div>
        )}

        {/* Jobs List */}
        <div className="space-y-6">
          {loading ? (
            <div className="grid gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse"
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
                  <div className="flex space-x-2 mb-4">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div>
                        <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : jobs.length > 0 ? (
            <div
              className={
                viewMode === "grid" ? "grid lg:grid-cols-2 gap-6" : "space-y-6"
              }
            >
              {jobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  isListView={viewMode === "list"}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No Jobs Found
              </h3>
              <p className="text-gray-600 mb-6">
                No jobs match your current search criteria. Try adjusting your
                filters or search terms.
              </p>
              <button
                onClick={() => {
                  setFilters({
                    search: "",
                    specialty: "",
                    category: "",
                    experienceLevel: "",
                    budgetMin: "",
                    budgetMax: "",
                    budgetType: "",
                    location: "remote",
                    timeline: "",
                    verified: false,
                    sortBy: "newest",
                  });
                }}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center mt-12 space-x-2">
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: Math.max(1, prev.page - 1),
                }))
              }
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() =>
                    setPagination((prev) => ({ ...prev, page: pageNum }))
                  }
                  className={`px-4 py-2 border rounded-lg ${
                    pagination.page === pageNum
                      ? "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: Math.min(prev.pages, prev.page + 1),
                }))
              }
              disabled={pagination.page === pagination.pages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobBrowse;
