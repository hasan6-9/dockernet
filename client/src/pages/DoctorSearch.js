import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Filter,
  MapPin,
  Star,
  Briefcase,
  User,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  SlidersHorizontal,
  X,
  Award,
  Phone,
  Mail,
  Globe,
  TrendingUp,
  Users,
  Calendar,
  BookOpen,
  Heart,
  Shield,
  ArrowUpDown,
  Bookmark,
  BookmarkCheck,
  Eye,
  MessageCircle,
  ChevronDown,
  Building,
  GraduationCap,
  Stethoscope,
  Clock4,
  Zap,
  Target,
  Filter as FilterIcon,
} from "lucide-react";

// Mock auth context for demo
const useAuth = () => ({
  user: { id: "123", firstName: "John", lastName: "Doe" },
  token: "mock-token",
});

const AdvancedDoctorSearch = () => {
  const { user, token } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [savedSearches, setSavedSearches] = useState([]);
  const [searchAnalytics, setSearchAnalytics] = useState(null);
  const [infiniteScroll, setInfiniteScroll] = useState(false);
  const searchInputRef = useRef(null);
  const loadingRef = useRef(null);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    primarySpecialty: "",
    subspecialties: [],
    experience: "",
    rating: "",
    location: "",
    verified: false,
    sortBy: "relevance",
    availability: "",
    languages: [],
    certifications: [],
    hospitalsAffiliated: [],
    priceRange: { min: "", max: "" },
    responseTime: "",
    profileCompletion: "",
    lastActive: "",
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  // Specialty and filter options
  const specialties = [
    "Anesthesiology",
    "Cardiology",
    "Dermatology",
    "Emergency Medicine",
    "Endocrinology",
    "Family Medicine",
    "Gastroenterology",
    "General Surgery",
    "Hematology",
    "Infectious Disease",
    "Internal Medicine",
    "Neurology",
    "Nephrology",
    "Obstetrics & Gynecology",
    "Oncology",
    "Ophthalmology",
    "Orthopedics",
    "Otolaryngology",
    "Pathology",
    "Pediatrics",
    "Physical Medicine",
    "Psychiatry",
    "Pulmonology",
    "Radiology",
    "Rheumatology",
    "Urology",
  ];

  const subspecialtiesMap = {
    Cardiology: [
      "Interventional Cardiology",
      "Electrophysiology",
      "Heart Failure",
      "Preventive Cardiology",
    ],
    "Internal Medicine": [
      "Critical Care",
      "Hospital Medicine",
      "Geriatrics",
      "Infectious Disease",
    ],
    Surgery: [
      "Cardiac Surgery",
      "Neurosurgery",
      "Plastic Surgery",
      "Vascular Surgery",
    ],
    Pediatrics: [
      "Neonatology",
      "Pediatric Cardiology",
      "Pediatric Oncology",
      "Pediatric Surgery",
    ],
  };

  const languages = [
    "English",
    "Spanish",
    "French",
    "German",
    "Italian",
    "Portuguese",
    "Chinese",
    "Japanese",
    "Korean",
    "Arabic",
    "Hindi",
    "Russian",
  ];

  const sortOptions = [
    { value: "relevance", label: "Most Relevant", icon: Target },
    { value: "rating", label: "Highest Rated", icon: Star },
    { value: "experience", label: "Most Experienced", icon: Award },
    { value: "recent", label: "Recently Joined", icon: Clock },
    { value: "availability", label: "Most Available", icon: Calendar },
    { value: "price_low", label: "Price: Low to High", icon: TrendingUp },
    { value: "price_high", label: "Price: High to Low", icon: TrendingUp },
    { value: "reviews", label: "Most Reviews", icon: MessageCircle },
  ];

  // Mock data for demonstration
  const mockDoctors = [
    {
      _id: "1",
      firstName: "Sarah",
      lastName: "Johnson",
      displayName: "Dr. Sarah Johnson, MD",
      primarySpecialty: "Cardiology",
      subspecialties: ["Interventional Cardiology", "Heart Failure"],
      yearsOfExperience: 12,
      location: { city: "New York", state: "NY" },
      bio: "Board-certified cardiologist specializing in interventional procedures and heart failure management. Extensive experience in complex cardiac interventions with over 1000 successful procedures.",
      profilePhoto: { url: "/api/placeholder/80/80" },
      rating: { average: 4.8, count: 156 },
      verificationStatus: { overall: "verified" },
      languages: [
        { language: "English", proficiency: "native" },
        { language: "Spanish", proficiency: "fluent" },
      ],
      availability: { responseTime: "within-hour", hoursPerWeek: 40 },
      certifications: [{ name: "Board Certified in Cardiology" }],
      preferences: { minimumRate: 250 },
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      profileCompletion: { percentage: 95 },
      analytics: { views: { total: 1250, thisMonth: 89 } },
    },
    {
      _id: "2",
      firstName: "Michael",
      lastName: "Chen",
      displayName: "Dr. Michael Chen, MD",
      primarySpecialty: "Neurology",
      subspecialties: ["Stroke", "Epilepsy"],
      yearsOfExperience: 8,
      location: { city: "San Francisco", state: "CA" },
      bio: "Neurologist with expertise in stroke treatment and epilepsy management. Published researcher with focus on innovative treatment approaches.",
      profilePhoto: { url: "/api/placeholder/80/80" },
      rating: { average: 4.6, count: 89 },
      verificationStatus: { overall: "verified" },
      languages: [
        { language: "English", proficiency: "native" },
        { language: "Chinese", proficiency: "native" },
      ],
      availability: { responseTime: "within-day", hoursPerWeek: 35 },
      certifications: [{ name: "Board Certified in Neurology" }],
      preferences: { minimumRate: 200 },
      lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      profileCompletion: { percentage: 88 },
      analytics: { views: { total: 890, thisMonth: 67 } },
    },
    {
      _id: "3",
      firstName: "Emily",
      lastName: "Rodriguez",
      displayName: "Dr. Emily Rodriguez, MD",
      primarySpecialty: "Pediatrics",
      subspecialties: ["Pediatric Cardiology", "Neonatology"],
      yearsOfExperience: 15,
      location: { city: "Chicago", state: "IL" },
      bio: "Pediatric specialist with extensive experience in neonatal care and pediatric cardiology. Known for compassionate patient care and family-centered approach.",
      profilePhoto: { url: "/api/placeholder/80/80" },
      rating: { average: 4.9, count: 234 },
      verificationStatus: { overall: "verified" },
      languages: [
        { language: "English", proficiency: "native" },
        { language: "Spanish", proficiency: "native" },
      ],
      availability: { responseTime: "within-hour", hoursPerWeek: 45 },
      certifications: [{ name: "Board Certified in Pediatrics" }],
      preferences: { minimumRate: 180 },
      lastActive: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      profileCompletion: { percentage: 92 },
      analytics: { views: { total: 1890, thisMonth: 156 } },
    },
  ];

  // Mock search suggestions
  const mockSuggestions = [
    "Cardiologist in New York",
    "Pediatric specialists",
    "Board certified neurologists",
    "Spanish speaking doctors",
    "Emergency medicine physicians",
  ];

  // Initialize with mock data
  useEffect(() => {
    setDoctors(mockDoctors);
    setPagination((prev) => ({ ...prev, total: mockDoctors.length, pages: 1 }));
    setSearchAnalytics({
      totalResults: mockDoctors.length,
      averageRating: 4.77,
      verifiedPercentage: 100,
      responseTime: "< 1 hour average",
      searchTime: "0.12s",
    });
  }, []);

  // Debounced search with suggestions
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm.length >= 2) {
        const suggestions = mockSuggestions.filter((suggestion) =>
          suggestion.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setSearchSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
      } else {
        setShowSuggestions(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Search functionality
  const performSearch = useCallback(
    async (resetPagination = true) => {
      if (resetPagination) {
        setPagination((prev) => ({ ...prev, page: 1 }));
      }

      setLoading(true);
      setError("");

      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 500));

        let filteredDoctors = [...mockDoctors];

        // Apply search term filter
        if (searchTerm) {
          filteredDoctors = filteredDoctors.filter(
            (doctor) =>
              doctor.firstName
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              doctor.lastName
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              doctor.primarySpecialty
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              doctor.subspecialties.some((sub) =>
                sub.toLowerCase().includes(searchTerm.toLowerCase())
              ) ||
              doctor.bio.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        // Apply specialty filter
        if (filters.primarySpecialty) {
          filteredDoctors = filteredDoctors.filter(
            (doctor) => doctor.primarySpecialty === filters.primarySpecialty
          );
        }

        // Apply experience filter
        if (filters.experience) {
          filteredDoctors = filteredDoctors.filter(
            (doctor) => doctor.yearsOfExperience >= parseInt(filters.experience)
          );
        }

        // Apply rating filter
        if (filters.rating) {
          filteredDoctors = filteredDoctors.filter(
            (doctor) => doctor.rating.average >= parseFloat(filters.rating)
          );
        }

        // Apply verification filter
        if (filters.verified) {
          filteredDoctors = filteredDoctors.filter(
            (doctor) => doctor.verificationStatus.overall === "verified"
          );
        }

        // Apply sorting
        if (filters.sortBy === "rating") {
          filteredDoctors.sort((a, b) => b.rating.average - a.rating.average);
        } else if (filters.sortBy === "experience") {
          filteredDoctors.sort(
            (a, b) => b.yearsOfExperience - a.yearsOfExperience
          );
        } else if (filters.sortBy === "recent") {
          filteredDoctors.sort(
            (a, b) => new Date(b.lastActive) - new Date(a.lastActive)
          );
        }

        setDoctors(filteredDoctors);
        setPagination((prev) => ({
          ...prev,
          total: filteredDoctors.length,
          pages: Math.ceil(filteredDoctors.length / prev.limit),
        }));

        // Update analytics
        setSearchAnalytics({
          totalResults: filteredDoctors.length,
          averageRating:
            filteredDoctors.reduce((sum, doc) => sum + doc.rating.average, 0) /
            filteredDoctors.length,
          verifiedPercentage:
            (filteredDoctors.filter(
              (doc) => doc.verificationStatus.overall === "verified"
            ).length /
              filteredDoctors.length) *
            100,
          responseTime: "< 1 hour average",
          searchTime: "0.15s",
        });
      } catch (err) {
        setError("Error searching doctors");
      } finally {
        setLoading(false);
      }
    },
    [searchTerm, filters]
  );

  // Trigger search on filter changes
  useEffect(() => {
    performSearch();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleArrayFilterChange = (key, value, checked) => {
    setFilters((prev) => ({
      ...prev,
      [key]: checked
        ? [...prev[key], value]
        : prev[key].filter((item) => item !== value),
    }));
  };

  const clearFilters = () => {
    setFilters({
      primarySpecialty: "",
      subspecialties: [],
      experience: "",
      rating: "",
      location: "",
      verified: false,
      sortBy: "relevance",
      availability: "",
      languages: [],
      certifications: [],
      hospitalsAffiliated: [],
      priceRange: { min: "", max: "" },
      responseTime: "",
      profileCompletion: "",
      lastActive: "",
    });
    setSearchTerm("");
  };

  const saveSearch = () => {
    const searchData = {
      id: Date.now(),
      term: searchTerm,
      filters: { ...filters },
      timestamp: new Date(),
      results: doctors.length,
    };
    setSavedSearches((prev) => [searchData, ...prev].slice(0, 5)); // Keep last 5
  };

  const loadSavedSearch = (savedSearch) => {
    setSearchTerm(savedSearch.term);
    setFilters(savedSearch.filters);
  };

  // Enhanced Search Header Component
  const SearchHeader = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      {/* Search Bar with Suggestions */}
      <div className="flex flex-col lg:flex-row gap-4 mb-4 relative">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search by name, specialty, keywords, or medical school..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => searchTerm.length >= 2 && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {/* Search Suggestions Dropdown */}
          {showSuggestions && searchSuggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-50 mt-1">
              {searchSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setSearchTerm(suggestion);
                    setShowSuggestions(false);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                >
                  <Search className="inline w-4 h-4 mr-2 text-gray-400" />
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Controls */}
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center space-x-2 px-4 py-3 border rounded-lg transition-colors ${
              showFilters
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-300 hover:bg-gray-50"
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
            {Object.values(filters).some((v) =>
              Array.isArray(v) ? v.length > 0 : v !== "" && v !== false
            ) && (
              <span className="bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {
                  Object.values(filters).filter((v) =>
                    Array.isArray(v) ? v.length > 0 : v !== "" && v !== false
                  ).length
                }
              </span>
            )}
          </button>

          <button
            onClick={saveSearch}
            className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title="Save this search"
          >
            <Bookmark className="w-4 h-4" />
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

      {/* Quick Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => handleFilterChange("verified", !filters.verified)}
          className={`px-3 py-1 rounded-full text-sm ${
            filters.verified
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          } transition-colors`}
        >
          <Shield className="w-3 h-3 inline mr-1" />
          Verified Only
        </button>
        <button
          onClick={() =>
            handleFilterChange("rating", filters.rating === "4.5" ? "" : "4.5")
          }
          className={`px-3 py-1 rounded-full text-sm ${
            filters.rating === "4.5"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          } transition-colors`}
        >
          <Star className="w-3 h-3 inline mr-1" />
          4.5+ Rating
        </button>
        <button
          onClick={() =>
            handleFilterChange(
              "experience",
              filters.experience === "10" ? "" : "10"
            )
          }
          className={`px-3 py-1 rounded-full text-sm ${
            filters.experience === "10"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          } transition-colors`}
        >
          <Award className="w-3 h-3 inline mr-1" />
          10+ Years
        </button>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Primary Specialty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Specialty
              </label>
              <select
                value={filters.primarySpecialty}
                onChange={(e) =>
                  handleFilterChange("primarySpecialty", e.target.value)
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Specialties</option>
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min. Experience
              </label>
              <select
                value={filters.experience}
                onChange={(e) =>
                  handleFilterChange("experience", e.target.value)
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any Experience</option>
                <option value="1">1+ years</option>
                <option value="3">3+ years</option>
                <option value="5">5+ years</option>
                <option value="10">10+ years</option>
                <option value="15">15+ years</option>
                <option value="20">20+ years</option>
              </select>
            </div>

            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Minimum Rating
              </label>
              <select
                value={filters.rating}
                onChange={(e) => handleFilterChange("rating", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any Rating</option>
                <option value="3">3+ stars</option>
                <option value="4">4+ stars</option>
                <option value="4.5">4.5+ stars</option>
                <option value="4.8">4.8+ stars</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="City, State, or ZIP"
                value={filters.location}
                onChange={(e) => handleFilterChange("location", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Response Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Response Time
              </label>
              <select
                value={filters.responseTime}
                onChange={(e) =>
                  handleFilterChange("responseTime", e.target.value)
                }
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any Response Time</option>
                <option value="immediate">Immediate</option>
                <option value="within-hour">Within 1 hour</option>
                <option value="within-day">Within 24 hours</option>
                <option value="within-week">Within a week</option>
              </select>
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hourly Rate Range
              </label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.priceRange.min}
                  onChange={(e) =>
                    handleFilterChange("priceRange", {
                      ...filters.priceRange,
                      min: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.priceRange.max}
                  onChange={(e) =>
                    handleFilterChange("priceRange", {
                      ...filters.priceRange,
                      max: e.target.value,
                    })
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort by
              </label>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={clearFilters}
              className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Clear all filters</span>
            </button>

            <div className="text-sm text-gray-500">
              {doctors.length} doctors found
            </div>
          </div>
        </div>
      )}

      {/* Saved Searches */}
      {savedSearches.length > 0 && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Recent Searches
          </h4>
          <div className="flex flex-wrap gap-2">
            {savedSearches.map((search) => (
              <button
                key={search.id}
                onClick={() => loadSavedSearch(search)}
                className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors"
              >
                <BookmarkCheck className="w-3 h-3" />
                <span>{search.term || "Advanced Search"}</span>
                <span className="text-gray-500">({search.results})</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Search Analytics Component
  const SearchAnalytics = () =>
    searchAnalytics && (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200 p-4 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {searchAnalytics.totalResults}
            </div>
            <div className="text-sm text-gray-600">Results Found</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {searchAnalytics.averageRating.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Avg Rating</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {searchAnalytics.verifiedPercentage.toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600">Verified</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {searchAnalytics.responseTime}
            </div>
            <div className="text-sm text-gray-600">Response Time</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {searchAnalytics.searchTime}
            </div>
            <div className="text-sm text-gray-600">Search Time</div>
          </div>
        </div>
      </div>
    );

  // Enhanced Doctor Card Component
  const DoctorCard = ({ doctor }) => {
    const [isSaved, setIsSaved] = useState(false);
    const isOnline = new Date() - new Date(doctor.lastActive) < 60 * 60 * 1000; // 1 hour

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
        {/* Doctor Header */}
        <div className="flex items-start space-x-4 mb-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
              {doctor.profilePhoto?.url ? (
                <img
                  src={doctor.profilePhoto.url}
                  alt={doctor.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-100">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
              )}
            </div>
            {doctor.verificationStatus?.overall === "verified" && (
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
            )}
            {isOnline && (
              <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 text-lg">
                  {doctor.displayName}
                </h3>
                <p className="text-blue-600 font-medium">
                  {doctor.primarySpecialty}
                </p>
                <div className="flex items-center text-gray-600 text-sm mt-1">
                  <MapPin className="w-3 h-3 mr-1" />
                  <span>
                    {doctor.location?.city}, {doctor.location?.state}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsSaved(!isSaved)}
                className={`p-2 rounded-full ${
                  isSaved
                    ? "text-red-500 bg-red-50"
                    : "text-gray-400 hover:text-gray-600"
                } transition-colors`}
              >
                <Heart className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Rating and Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            {doctor.rating?.average > 0 && (
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                <span className="font-medium">{doctor.rating.average}</span>
                <span className="text-gray-500 text-sm">
                  ({doctor.rating.count})
                </span>
              </div>
            )}
            <div className="flex items-center text-gray-600 text-sm">
              <Briefcase className="w-4 h-4 mr-1" />
              <span>{doctor.yearsOfExperience}yr exp</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {doctor.availability?.responseTime && (
              <div className="flex items-center text-green-600 text-sm">
                <Clock4 className="w-3 h-3 mr-1" />
                <span className="capitalize">
                  {doctor.availability.responseTime.replace("-", " ")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Subspecialties */}
        {doctor.subspecialties?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {doctor.subspecialties.slice(0, 2).map((subspecialty, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium"
              >
                {subspecialty}
              </span>
            ))}
            {doctor.subspecialties.length > 2 && (
              <span className="text-gray-500 text-xs">
                +{doctor.subspecialties.length - 2} more
              </span>
            )}
          </div>
        )}

        {/* Languages */}
        {doctor.languages?.length > 0 && (
          <div className="flex items-center text-gray-600 text-sm mb-3">
            <Globe className="w-3 h-3 mr-1" />
            <span>{doctor.languages.map((l) => l.language).join(", ")}</span>
          </div>
        )}

        {/* Bio Preview */}
        {doctor.bio && (
          <p className="text-gray-700 text-sm mb-4 line-clamp-2">
            {doctor.bio.substring(0, 120)}
            {doctor.bio.length > 120 && "..."}
          </p>
        )}

        {/* Trust Indicators */}
        <div className="flex items-center justify-between mb-4 text-sm">
          <div className="flex items-center space-x-3">
            {doctor.verificationStatus?.overall === "verified" && (
              <div className="flex items-center text-green-600">
                <Shield className="w-3 h-3 mr-1" />
                <span>Verified</span>
              </div>
            )}
            {doctor.profileCompletion?.percentage >= 90 && (
              <div className="flex items-center text-blue-600">
                <Target className="w-3 h-3 mr-1" />
                <span>{doctor.profileCompletion.percentage}% Complete</span>
              </div>
            )}
            <div className="flex items-center text-gray-500">
              <Eye className="w-3 h-3 mr-1" />
              <span>{doctor.analytics?.views?.thisMonth || 0} views</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-4 border-t border-gray-100">
          <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
            View Profile
          </button>
          {user && (
            <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              <MessageCircle className="w-4 h-4 text-gray-600" />
            </button>
          )}
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <Phone className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>
    );
  };

  // Enhanced List View Component
  const DoctorListItem = ({ doctor }) => {
    const [isSaved, setIsSaved] = useState(false);
    const isOnline = new Date() - new Date(doctor.lastActive) < 60 * 60 * 1000;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center space-x-6">
          {/* Profile Photo */}
          <div className="relative flex-shrink-0">
            <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
              {doctor.profilePhoto?.url ? (
                <img
                  src={doctor.profilePhoto.url}
                  alt={doctor.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-100">
                  <User className="w-8 h-8 text-blue-600" />
                </div>
              )}
            </div>
            {doctor.verificationStatus?.overall === "verified" && (
              <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            )}
            {isOnline && (
              <div className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
            )}
          </div>

          {/* Doctor Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold text-gray-900 text-xl">
                    {doctor.displayName}
                  </h3>
                  <button
                    onClick={() => setIsSaved(!isSaved)}
                    className={`p-1 rounded-full ${
                      isSaved
                        ? "text-red-500"
                        : "text-gray-400 hover:text-gray-600"
                    } transition-colors`}
                  >
                    <Heart
                      className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`}
                    />
                  </button>
                </div>
                <p className="text-blue-600 font-medium text-lg">
                  {doctor.primarySpecialty}
                </p>
              </div>

              {doctor.rating?.average > 0 && (
                <div className="flex items-center space-x-1">
                  <Star className="w-5 h-5 text-yellow-400 fill-current" />
                  <span className="font-medium text-lg">
                    {doctor.rating.average}
                  </span>
                  <span className="text-gray-500">
                    ({doctor.rating.count} reviews)
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-6 text-gray-600 mb-3">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                <span>
                  {doctor.location?.city}, {doctor.location?.state}
                </span>
              </div>
              <div className="flex items-center">
                <Briefcase className="w-4 h-4 mr-1" />
                <span>{doctor.yearsOfExperience} years experience</span>
              </div>
              {doctor.availability?.responseTime && (
                <div className="flex items-center text-green-600">
                  <Clock4 className="w-4 h-4 mr-1" />
                  <span className="capitalize">
                    {doctor.availability.responseTime.replace("-", " ")}
                  </span>
                </div>
              )}
            </div>

            {doctor.bio && (
              <p className="text-gray-700 mb-4 line-clamp-2">
                {doctor.bio.substring(0, 200)}
                {doctor.bio.length > 200 && "..."}
              </p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Subspecialties */}
                {doctor.subspecialties?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {doctor.subspecialties
                      .slice(0, 3)
                      .map((subspecialty, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          {subspecialty}
                        </span>
                      ))}
                    {doctor.subspecialties.length > 3 && (
                      <span className="text-gray-500 text-sm">
                        +{doctor.subspecialties.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Languages */}
                {doctor.languages?.length > 0 && (
                  <div className="flex items-center text-gray-600 text-sm">
                    <Globe className="w-4 h-4 mr-1" />
                    <span>
                      {doctor.languages
                        .map((l) => l.language)
                        .slice(0, 2)
                        .join(", ")}
                    </span>
                  </div>
                )}
              </div>

              {/* Trust Indicators */}
              <div className="flex items-center space-x-4 text-sm">
                {doctor.verificationStatus?.overall === "verified" && (
                  <div className="flex items-center text-green-600">
                    <Shield className="w-4 h-4 mr-1" />
                    <span>Verified</span>
                  </div>
                )}
                <div className="flex items-center text-gray-500">
                  <Eye className="w-4 h-4 mr-1" />
                  <span>{doctor.analytics?.views?.thisMonth || 0} views</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col space-y-2 flex-shrink-0">
            <button className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors font-medium">
              View Profile
            </button>
            {user && (
              <div className="flex space-x-2">
                <button className="border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors font-medium">
                  <MessageCircle className="w-4 h-4" />
                </button>
                <button className="border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors font-medium">
                  <Phone className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Pagination Component
  const Pagination = () => {
    if (pagination.pages <= 1) return null;

    const getVisiblePages = () => {
      const current = pagination.page;
      const total = pagination.pages;
      const delta = 2;

      let start = Math.max(1, current - delta);
      let end = Math.min(total, current + delta);

      if (end - start < 2 * delta) {
        start = Math.max(1, end - 2 * delta);
        end = Math.min(total, start + 2 * delta);
      }

      return Array.from({ length: end - start + 1 }, (_, i) => start + i);
    };

    return (
      <div className="flex items-center justify-between bg-white px-4 py-3 sm:px-6 rounded-lg shadow-sm border border-gray-200 mt-6">
        <div className="flex flex-1 justify-between items-center">
          <div>
            <p className="text-sm text-gray-700">
              Showing{" "}
              <span className="font-medium">
                {(pagination.page - 1) * pagination.limit + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(pagination.page * pagination.limit, pagination.total)}
              </span>{" "}
              of <span className="font-medium">{pagination.total}</span> results
            </p>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: Math.max(1, prev.page - 1),
                }))
              }
              disabled={pagination.page === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {getVisiblePages().map((page) => (
              <button
                key={page}
                onClick={() => setPagination((prev) => ({ ...prev, page }))}
                className={`relative inline-flex items-center px-4 py-2 rounded-md border text-sm font-medium ${
                  page === pagination.page
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: Math.min(prev.pages, prev.page + 1),
                }))
              }
              disabled={pagination.page === pagination.pages}
              className="relative inline-flex items-center px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Find Medical Professionals
        </h1>
        <p className="text-gray-600">
          Connect with verified doctors for consultation, collaboration, and
          professional opportunities
        </p>
      </div>

      <SearchHeader />
      <SearchAnalytics />

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse"
            >
              <div className="flex items-start space-x-4 mb-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-4/5"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {doctors.length > 0 ? (
            <>
              <div
                className={
                  viewMode === "grid"
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "space-y-4"
                }
              >
                {doctors.map((doctor) => (
                  <div key={doctor._id}>
                    {viewMode === "grid" ? (
                      <DoctorCard doctor={doctor} />
                    ) : (
                      <DoctorListItem doctor={doctor} />
                    )}
                  </div>
                ))}
              </div>
              <Pagination />
            </>
          ) : (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
              <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No doctors found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search criteria or clearing some filters
              </p>
              <button
                onClick={clearFilters}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdvancedDoctorSearch;
