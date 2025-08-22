import React, { useState, useEffect, useContext } from "react";
import { useAuth } from "../context/AuthContext";
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
} from "lucide-react";

const DoctorSearch = () => {
  const { user, token } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [showFilters, setShowFilters] = useState(false);

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    specialty: "",
    experience: "",
    rating: "",
    location: "",
    verified: false,
    sortBy: "relevance",
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  // Specialty options (would come from API in real app)
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
  ];

  const sortOptions = [
    { value: "relevance", label: "Most Relevant" },
    { value: "rating", label: "Highest Rated" },
    { value: "experience", label: "Most Experienced" },
    { value: "recent", label: "Recently Joined" },
  ];

  // Fetch doctors
  useEffect(() => {
    searchDoctors();
  }, [filters, pagination.page]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== "") {
        searchDoctors();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const searchDoctors = async () => {
    try {
      setLoading(true);
      setError("");

      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(searchTerm && { q: searchTerm }),
        ...(filters.specialty && { specialty: filters.specialty }),
        ...(filters.experience && { experience: filters.experience }),
        ...(filters.rating && { rating: filters.rating }),
        ...(filters.location && { location: filters.location }),
        ...(filters.verified && { verified: "true" }),
        sortBy: filters.sortBy,
      });

      const response = await fetch(`/api/profile/search?${queryParams}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDoctors(data.data);
        setPagination((prev) => ({
          ...prev,
          total: data.pagination.total,
          pages: data.pagination.pages,
        }));
      } else {
        setError("Failed to search doctors");
      }
    } catch (err) {
      setError("Error searching doctors");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const clearFilters = () => {
    setFilters({
      specialty: "",
      experience: "",
      rating: "",
      location: "",
      verified: false,
      sortBy: "relevance",
    });
    setSearchTerm("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage,
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const SearchHeader = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      {/* Search Bar */}
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, specialty, or keywords..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Quick Filters */}
        <div className="flex space-x-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
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
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialty
              </label>
              <select
                value={filters.specialty}
                onChange={(e) =>
                  handleFilterChange("specialty", e.target.value)
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience
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
              </select>
            </div>

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
                <option value="4">4+ stars</option>
                <option value="4.5">4.5+ stars</option>
                <option value="4.8">4.8+ stars</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="City or State"
                value={filters.location}
                onChange={(e) => handleFilterChange("location", e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
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
                  Verified doctors only
                </span>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort by
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={clearFilters}
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

  const DoctorCard = ({ doctor }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Doctor Header */}
      <div className="flex items-start space-x-4 mb-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-100">
            {doctor.profilePhoto?.url ? (
              <img
                src={doctor.profilePhoto.url}
                alt={doctor.fullName}
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
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">
                {doctor.displayName ||
                  `Dr. ${doctor.firstName} ${doctor.lastName}`}
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

            {doctor.rating?.average > 0 && (
              <div className="text-right">
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-medium">{doctor.rating.average}</span>
                  <span className="text-gray-500 text-sm">
                    ({doctor.rating.count})
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Doctor Details */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-gray-600 text-sm">
          <Briefcase className="w-4 h-4 mr-2" />
          <span>{doctor.yearsOfExperience} years experience</span>
        </div>

        {doctor.subspecialties?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {doctor.subspecialties.slice(0, 3).map((subspecialty, index) => (
              <span
                key={index}
                className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
              >
                {subspecialty}
              </span>
            ))}
            {doctor.subspecialties.length > 3 && (
              <span className="text-gray-500 text-xs">
                +{doctor.subspecialties.length - 3} more
              </span>
            )}
          </div>
        )}

        {doctor.bio && (
          <p className="text-gray-700 text-sm mt-3 line-clamp-3">
            {doctor.bio.substring(0, 150)}
            {doctor.bio.length > 150 && "..."}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-2 pt-4 border-t border-gray-100">
        <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
          View Profile
        </button>
        {user && (
          <button className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
            <Mail className="w-4 h-4 text-gray-600" />
          </button>
        )}
      </div>
    </div>
  );

  const DoctorListItem = ({ doctor }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center space-x-6">
        {/* Profile Photo */}
        <div className="relative flex-shrink-0">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100">
            {doctor.profilePhoto?.url ? (
              <img
                src={doctor.profilePhoto.url}
                alt={doctor.fullName}
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
        </div>

        {/* Doctor Info */}
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900 text-xl">
                {doctor.displayName ||
                  `Dr. ${doctor.firstName} ${doctor.lastName}`}
              </h3>
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
          </div>

          {doctor.bio && (
            <p className="text-gray-700 mb-4 line-clamp-2">
              {doctor.bio.substring(0, 200)}
              {doctor.bio.length > 200 && "..."}
            </p>
          )}

          {doctor.subspecialties?.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {doctor.subspecialties.slice(0, 4).map((subspecialty, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {subspecialty}
                </span>
              ))}
              {doctor.subspecialties.length > 4 && (
                <span className="text-gray-500 text-sm">
                  +{doctor.subspecialties.length - 4} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-2 flex-shrink-0">
          <button className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors font-medium">
            View Profile
          </button>
          {user && (
            <button className="border border-gray-300 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-50 transition-colors font-medium">
              Contact
            </button>
          )}
        </div>
      </div>
    </div>
  );

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
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="relative inline-flex items-center px-2 py-2 rounded-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {getVisiblePages().map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
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
              onClick={() => handlePageChange(pagination.page + 1)}
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
          Connect with experienced doctors for consultation, collaboration, and
          professional opportunities
        </p>
      </div>

      <SearchHeader />

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

export default DoctorSearch;
