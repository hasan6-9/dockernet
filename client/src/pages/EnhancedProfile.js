import React, { useState, useEffect, useContext } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../api/auth";
import {
  User,
  Camera,
  Upload,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  Calendar,
  MapPin,
  Globe,
  Award,
  Briefcase,
  Star,
  Clock,
  Shield,
  Eye,
  Settings,
} from "lucide-react";

const EnhancedProfile = () => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [editMode, setEditMode] = useState({});
  const [formData, setFormData] = useState({});

  // Fetch profile data
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("/profile/me");

      if (response.data.success) {
        setProfile(response.data.data);
        setFormData(response.data.data);
      } else {
        setError(response.data.message || "Failed to fetch profile data");
      }
    } catch (err) {
      console.error("Profile fetch error:", err);

      if (err.response) {
        // Server responded with error status
        if (err.response.status === 401) {
          setError("Authentication failed. Please login again.");
          // Redirect to login or handle token expiration
        } else if (err.response.status === 404) {
          setError("Profile not found. Please contact support.");
        } else {
          setError(
            `Server error: ${err.response.data?.message || err.response.status}`
          );
        }
      } else if (err.request) {
        // Request was made but no response received
        setError("Network error: Cannot connect to server");
      } else {
        // Something else happened
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value, section = null) => {
    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const toggleEditMode = (section) => {
    setEditMode((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const saveSection = async (section, endpoint) => {
    try {
      const response = await api.put(`/profile/${endpoint}`, formData); // Use axios instance

      if (response.status === 200) {
        const data = response.data;
        setProfile(data.data);
        setSuccess(`${section} updated successfully!`);
        setEditMode((prev) => ({ ...prev, [section]: false }));
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError(response.data.message || `Failed to update ${section}`);
      }
    } catch (err) {
      setError(`Error updating ${section}`);
    }
  };

  const handlePhotoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("profilePhoto", file);

    try {
      const response = await api.post("/profile/photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        const data = response.data;
        setProfile((prev) => ({
          ...prev,
          profilePhoto: data.data.profilePhoto,
        }));
        setSuccess("Profile photo updated successfully!");
        setTimeout(() => setSuccess(""), 3000);
      } else {
        setError("Failed to upload photo");
      }
    } catch (err) {
      setError("Error uploading photo");
    }
  };

  const ProfileHeader = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-6">
          {/* Profile Photo */}
          <div className="relative">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
              {profile?.profilePhoto?.url ? (
                <img
                  src={profile.profilePhoto.url}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-blue-100">
                  <User className="w-12 h-12 text-blue-600" />
                </div>
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {profile?.displayName || "Dr. Name"}
              </h1>
              {profile?.verificationStatus?.overall === "verified" && (
                <CheckCircle className="w-6 h-6 text-green-500" />
              )}
            </div>
            <p className="text-lg text-blue-600 font-medium mb-2">
              {profile?.primarySpecialty}
            </p>
            <div className="flex items-center space-x-4 text-gray-600">
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>
                  {profile?.location?.city}, {profile?.location?.state}
                </span>
              </div>
              <div className="flex items-center space-x-1">
                <Briefcase className="w-4 h-4" />
                <span>{profile?.yearsOfExperience} years experience</span>
              </div>
              {profile?.rating?.average > 0 && (
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span>
                    {profile.rating.average} ({profile.rating.count} reviews)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Completion */}
        <div className="text-right">
          <div className="mb-2">
            <span className="text-sm text-gray-500">Profile Completion</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-24 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${profile?.profileCompletion?.percentage || 0}%`,
                }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-700">
              {profile?.profileCompletion?.percentage || 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const TabNavigation = () => {
    const tabs = [
      { id: "overview", label: "Overview", icon: User },
      { id: "experience", label: "Experience", icon: Briefcase },
      { id: "skills", label: "Skills & Certifications", icon: Award },
      { id: "documents", label: "Documents", icon: FileText },
      { id: "availability", label: "Availability", icon: Clock },
      { id: "settings", label: "Settings", icon: Settings },
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

  const OverviewTab = () => (
    <div className="space-y-6">
      {/* Bio Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">About Me</h3>
          <button
            onClick={() => toggleEditMode("bio")}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>

        {editMode.bio ? (
          <div className="space-y-4">
            <textarea
              value={formData.bio || ""}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              rows={6}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tell other doctors about your experience, interests, and what makes you unique..."
            />
            <div className="flex space-x-2">
              <button
                onClick={() => saveSection("Bio", "basic")}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button
                onClick={() => toggleEditMode("bio")}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="text-gray-700 leading-relaxed">
            {profile?.bio || (
              <span className="text-gray-400 italic">
                Add a bio to help other doctors learn about you...
              </span>
            )}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Profile Views</p>
              <p className="text-2xl font-bold text-gray-900">
                {profile?.analytics?.views?.total || 0}
              </p>
            </div>
            <Eye className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Verification Status</p>
              <p className="text-lg font-semibold">
                <span
                  className={`capitalize ${
                    profile?.verificationStatus?.overall === "verified"
                      ? "text-green-600"
                      : profile?.verificationStatus?.overall === "partial"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {profile?.verificationStatus?.overall || "Unverified"}
                </span>
              </p>
            </div>
            <Shield
              className={`w-8 h-8 ${
                profile?.verificationStatus?.overall === "verified"
                  ? "text-green-600"
                  : profile?.verificationStatus?.overall === "partial"
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Rating</p>
              <div className="flex items-center space-x-2">
                <p className="text-2xl font-bold text-gray-900">
                  {profile?.rating?.average || 0}
                </p>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= (profile?.rating?.average || 0)
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
            <Star className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Subspecialties */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Subspecialties
          </h3>
          <button
            onClick={() => toggleEditMode("subspecialties")}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>

        {editMode.subspecialties ? (
          <div className="space-y-4">
            <div>
              {(formData.subspecialties || []).map((specialty, index) => (
                <div key={index} className="flex items-center space-x-2 mb-2">
                  <input
                    type="text"
                    value={specialty}
                    onChange={(e) => {
                      const newSubspecialties = [
                        ...(formData.subspecialties || []),
                      ];
                      newSubspecialties[index] = e.target.value;
                      handleInputChange("subspecialties", newSubspecialties);
                    }}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter subspecialty"
                  />
                  <button
                    onClick={() => {
                      const newSubspecialties = (
                        formData.subspecialties || []
                      ).filter((_, i) => i !== index);
                      handleInputChange("subspecialties", newSubspecialties);
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => {
                const newSubspecialties = [
                  ...(formData.subspecialties || []),
                  "",
                ];
                handleInputChange("subspecialties", newSubspecialties);
              }}
              className="text-blue-600 hover:text-blue-800 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subspecialty</span>
            </button>
            <div className="flex space-x-2">
              <button
                onClick={() => saveSection("Subspecialties", "basic")}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button
                onClick={() => toggleEditMode("subspecialties")}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {profile?.subspecialties?.length > 0 ? (
              profile.subspecialties.map((specialty, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {specialty}
                </span>
              ))
            ) : (
              <span className="text-gray-400 italic">
                Add subspecialties to showcase your expertise...
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const ExperienceTab = () => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Professional Experience
        </h3>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Experience</span>
        </button>
      </div>

      <div className="space-y-6">
        {profile?.experiences?.length > 0 ? (
          profile.experiences.map((experience, index) => (
            <div
              key={experience._id || index}
              className="border-l-4 border-blue-200 pl-4 relative"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">
                    {experience.title}
                  </h4>
                  <p className="text-blue-600 font-medium">
                    {experience.institution}
                  </p>
                  <p className="text-gray-600 text-sm">{experience.location}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {new Date(experience.startDate).toLocaleDateString()} -
                    {experience.current
                      ? " Present"
                      : new Date(experience.endDate).toLocaleDateString()}
                  </p>
                  {experience.description && (
                    <p className="text-gray-700 mt-2">
                      {experience.description}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button className="text-red-600 hover:text-red-800">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-center py-8 italic">
            No experience added yet. Click "Add Experience" to get started.
          </p>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-48 rounded-lg mb-6"></div>
          <div className="space-y-4">
            <div className="bg-gray-200 h-12 rounded-lg"></div>
            <div className="bg-gray-200 h-32 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {success}
        </div>
      )}

      <ProfileHeader />
      <TabNavigation />

      <div className="min-h-96">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "experience" && <ExperienceTab />}
        {activeTab === "skills" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Skills & Certifications
            </h3>
            <p className="text-gray-500">
              Skills and certifications section coming soon...
            </p>
          </div>
        )}
        {activeTab === "documents" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Documents
            </h3>
            <p className="text-gray-500">Documents section coming soon...</p>
          </div>
        )}
        {activeTab === "availability" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Availability
            </h3>
            <p className="text-gray-500">Availability section coming soon...</p>
          </div>
        )}
        {activeTab === "settings" && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Privacy & Settings
            </h3>
            <p className="text-gray-500">Settings section coming soon...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedProfile;
