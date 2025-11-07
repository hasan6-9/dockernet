// ============================================================================
// IMPORTS
// ============================================================================
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { profileAPI, handleApiError, formatters } from "../api";
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
  TrendingUp,
  Users,
  Activity,
  Mail,
  Phone,
  Lock,
  Download,
  FileCheck,
  Building,
  GraduationCap,
  Target,
  BarChart3,
} from "lucide-react";

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const EnhancedProfile = () => {
  // --------------------------------------------------------------------------
  // HOOKS & STATE
  // --------------------------------------------------------------------------
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, hasPermission } = useAuth();
  const fileInputRef = useRef(null);
  const documentInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("overview");
  const [editMode, setEditMode] = useState({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showExperienceModal, setShowExperienceModal] = useState(false);
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [showCertificationModal, setShowCertificationModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // --------------------------------------------------------------------------
  // DATA FETCHING
  // --------------------------------------------------------------------------
  // Fetch profile data
  const {
    data: profileData,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["profile", "me"],
    queryFn: () => profileAPI.getMe(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });

  // Fetch analytics data
  const {
    data: analyticsData,
    isLoading: analyticsLoading,
    error: analyticsError,
  } = useQuery({
    queryKey: ["profile", "analytics"],
    queryFn: () => profileAPI.getAnalytics(),
    enabled: isAuthenticated && hasPermission("canAccessProfessionalFeatures"),
    staleTime: 5 * 60 * 1000,
  });

  // --------------------------------------------------------------------------
  // DATA EXTRACTION WITH FALLBACKS
  // --------------------------------------------------------------------------
  // ✅ FIX: Safely extract profile data with multiple fallback paths
  const profile = React.useMemo(() => {
    // Try different possible data structures
    const data = profileData?.data?.data || profileData?.data || profileData;

    if (process.env.NODE_ENV === "development") {
      console.log("📊 Profile Data Structure:", {
        profileData,
        extractedData: data,
        hasData: !!data,
      });
    }

    return data;
  }, [profileData]);

  // ✅ FIX: Safely extract analytics data
  const analytics = React.useMemo(() => {
    const data =
      analyticsData?.data?.data || analyticsData?.data || analyticsData;

    if (process.env.NODE_ENV === "development") {
      console.log("📊 Analytics Data Structure:", {
        analyticsData,
        extractedData: data,
        hasData: !!data,
      });
    }

    return data;
  }, [analyticsData]);

  // ✅ ADD: Data validation check
  React.useEffect(() => {
    if (!profileLoading && !profile) {
      console.error("❌ Profile data is undefined after loading", {
        profileData,
        profile,
      });
    }
  }, [profileLoading, profile, profileData]);

  // --------------------------------------------------------------------------
  // FORM HANDLING
  // --------------------------------------------------------------------------
  const {
    register: registerBasic,
    handleSubmit: handleSubmitBasic,
    formState: { errors: errorsBasic },
    reset: resetBasic,
  } = useForm({
    defaultValues: profile || {},
  });

  const {
    register: registerExperience,
    handleSubmit: handleSubmitExperience,
    formState: { errors: errorsExperience },
    reset: resetExperience,
  } = useForm();

  const {
    register: registerSkill,
    handleSubmit: handleSubmitSkill,
    formState: { errors: errorsSkill },
    reset: resetSkill,
  } = useForm();

  const {
    register: registerCertification,
    handleSubmit: handleSubmitCertification,
    formState: { errors: errorsCertification },
    reset: resetCertification,
  } = useForm();

  // Reset forms when profile data loads
  useEffect(() => {
    if (profile) {
      resetBasic(profile);
    }
  }, [profile, resetBasic]);

  // --------------------------------------------------------------------------
  // MUTATIONS
  // --------------------------------------------------------------------------
  // Update basic profile
  const updateBasicMutation = useMutation({
    mutationFn: (data) => profileAPI.updateBasic(data),
    onSuccess: () => {
      toast.success("Profile updated successfully!");
      queryClient.invalidateQueries(["profile"]);
      setEditMode((prev) => ({ ...prev, basic: false }));
    },
    onError: (error) => {
      const errorInfo = handleApiError(error);
      toast.error(errorInfo.message);
    },
  });

  // Upload profile photo
  const uploadPhotoMutation = useMutation({
    mutationFn: (file) => profileAPI.uploadPhoto(file, setUploadProgress),
    onSuccess: () => {
      toast.success("Photo uploaded successfully!");
      setUploadProgress(0);
      queryClient.invalidateQueries(["profile"]);
    },
    onError: (error) => {
      toast.error("Failed to upload photo");
      setUploadProgress(0);
    },
  });

  // Upload documents
  const uploadDocumentsMutation = useMutation({
    mutationFn: ({ files, types }) =>
      profileAPI.uploadDocuments(files, types, setUploadProgress),
    onSuccess: () => {
      toast.success("Documents uploaded successfully!");
      setUploadProgress(0);
      queryClient.invalidateQueries(["profile"]);
    },
    onError: (error) => {
      toast.error("Failed to upload documents");
      setUploadProgress(0);
    },
  });

  // Delete document
  const deleteDocumentMutation = useMutation({
    mutationFn: (docId) => profileAPI.deleteDocument(docId),
    onSuccess: () => {
      toast.success("Document deleted successfully!");
      queryClient.invalidateQueries(["profile"]);
    },
    onError: (error) => {
      toast.error("Failed to delete document");
    },
  });

  // Add/Update experience
  const experienceMutation = useMutation({
    mutationFn: (data) => {
      if (editingItem) {
        return profileAPI.updateExperience(editingItem._id, data);
      }
      return profileAPI.addExperience(data);
    },
    onSuccess: () => {
      toast.success(editingItem ? "Experience updated!" : "Experience added!");
      queryClient.invalidateQueries(["profile"]);
      setShowExperienceModal(false);
      setEditingItem(null);
      resetExperience();
    },
    onError: (error) => {
      toast.error("Failed to save experience");
    },
  });

  // Delete experience
  const deleteExperienceMutation = useMutation({
    mutationFn: (expId) => profileAPI.deleteExperience(expId),
    onSuccess: () => {
      toast.success("Experience deleted!");
      queryClient.invalidateQueries(["profile"]);
    },
    onError: (error) => {
      toast.error("Failed to delete experience");
    },
  });

  // Update skills
  const skillsMutation = useMutation({
    mutationFn: (skills) => profileAPI.updateSkills(skills),
    onSuccess: () => {
      toast.success("Skills updated!");
      queryClient.invalidateQueries(["profile"]);
      setShowSkillModal(false);
      resetSkill();
    },
    onError: (error) => {
      toast.error("Failed to update skills");
    },
  });

  // Add/Update certification
  const certificationMutation = useMutation({
    mutationFn: (data) => {
      if (editingItem) {
        return profileAPI.updateCertification(editingItem._id, data);
      }
      return profileAPI.addCertification(data);
    },
    onSuccess: () => {
      toast.success(
        editingItem ? "Certification updated!" : "Certification added!"
      );
      queryClient.invalidateQueries(["profile"]);
      setShowCertificationModal(false);
      setEditingItem(null);
      resetCertification();
    },
    onError: (error) => {
      toast.error("Failed to save certification");
    },
  });

  // Delete certification
  const deleteCertificationMutation = useMutation({
    mutationFn: (certId) => profileAPI.deleteCertification(certId),
    onSuccess: () => {
      toast.success("Certification deleted!");
      queryClient.invalidateQueries(["profile"]);
    },
    onError: (error) => {
      toast.error("Failed to delete certification");
    },
  });

  // Update privacy settings
  const privacyMutation = useMutation({
    mutationFn: (data) => profileAPI.updatePrivacy(data),
    onSuccess: () => {
      toast.success("Privacy settings updated!");
      queryClient.invalidateQueries(["profile"]);
    },
    onError: (error) => {
      toast.error("Failed to update privacy settings");
    },
  });

  // Update availability
  const availabilityMutation = useMutation({
    mutationFn: (data) => profileAPI.updateAvailability(data),
    onSuccess: () => {
      toast.success("Availability updated!");
      queryClient.invalidateQueries(["profile"]);
    },
    onError: (error) => {
      toast.error("Failed to update availability");
    },
  });

  // --------------------------------------------------------------------------
  // EVENT HANDLERS
  // --------------------------------------------------------------------------
  const handlePhotoUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    uploadPhotoMutation.mutate(file);
  };

  const handleDocumentUpload = (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    // Validate files
    for (const file of files) {
      if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
        toast.error("Only images and PDFs are allowed");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Files must be less than 10MB");
        return;
      }
    }

    // For now, mark all as 'other' type
    const types = files.map(() => "other");
    uploadDocumentsMutation.mutate({ files, types });
  };

  const handleBasicUpdate = (data) => {
    updateBasicMutation.mutate(data);
  };

  const handleExperienceSubmit = (data) => {
    experienceMutation.mutate(data);
  };

  const handleSkillSubmit = (data) => {
    const currentSkills = profile?.skills || [];
    const newSkill = {
      name: data.name,
      category: data.category,
      proficiencyLevel: data.proficiencyLevel,
      yearsOfExperience: parseInt(data.yearsOfExperience),
    };
    skillsMutation.mutate([...currentSkills, newSkill]);
  };

  const handleCertificationSubmit = (data) => {
    certificationMutation.mutate(data);
  };

  const toggleEditMode = (section) => {
    setEditMode((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // --------------------------------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------------------------------
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-primary-600 border-opacity-50 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading profile...</p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // ERROR STATE
  // --------------------------------------------------------------------------
  if (profileError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Profile
          </h2>
          <p className="text-gray-600 mb-6">
            {profileError.response?.data?.message ||
              "Failed to load profile data"}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => refetchProfile()}
              className="btn-medical px-6 py-2 rounded-lg"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="btn-secondary px-6 py-2 rounded-lg"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // TAB CONFIGURATION
  // --------------------------------------------------------------------------
  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "skills", label: "Skills & Certifications", icon: Award },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "privacy", label: "Privacy & Settings", icon: Shield },
    {
      id: "analytics",
      label: "Analytics",
      icon: BarChart3,
      requiresPermission: "canAccessProfessionalFeatures",
    },
  ];

  // Filter tabs based on permissions
  const visibleTabs = tabs.filter(
    (tab) => !tab.requiresPermission || hasPermission(tab.requiresPermission)
  );

  // ============================================================================
  // SUB-COMPONENTS
  // ============================================================================

  // Profile Header Component
  // Replace your ProfileHeader component with this safe version

  const ProfileHeader = () => {
    // Safe fallbacks for all data
    const firstName = profile?.firstName || "User";
    const lastName = profile?.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();
    const specialty = profile?.primarySpecialty || "Medical Professional";
    const photoUrl = profile?.profilePhoto?.url || profile?.profilePhoto;
    const isVerified = profile?.verificationStatus?.overall === "verified";

    const location = profile?.location || {};
    const city = location.city;
    const state = location.state;
    const locationString = [city, state].filter(Boolean).join(", ");

    const experience = profile?.yearsOfExperience || 0;
    const rating = profile?.rating || {};
    const avgRating = rating.average || 0;
    const ratingCount = rating.count || 0;

    const completion = profile?.profileCompletion || {};
    const completionPercent = completion.percentage || 0;

    return (
      <div className="bg-gradient-to-r from-primary-600 to-indigo-700 text-white rounded-xl shadow-elevation-3 p-8 mb-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 flex-1">
            {/* Profile Photo with Upload */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-white border-4 border-white shadow-elevation-2">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={fullName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error("Failed to load profile photo:", photoUrl);
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : null}
                <div
                  className="w-full h-full flex items-center justify-center bg-primary-100"
                  style={{ display: photoUrl ? "none" : "flex" }}
                >
                  <User className="w-12 h-12 text-primary-600" />
                </div>
              </div>
              <label className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-full">
                  <div className="text-white text-sm font-bold">
                    {uploadProgress}%
                  </div>
                </div>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 mb-3">
                <h1 className="text-3xl lg:text-4xl font-bold">{fullName}</h1>
                {isVerified && (
                  <CheckCircle className="w-6 h-6 lg:w-7 lg:h-7 text-medical-400 flex-shrink-0" />
                )}
              </div>
              <p className="text-xl text-primary-100 font-medium mb-3">
                {specialty}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 lg:gap-6 text-primary-100">
                {locationString && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    <span>{locationString}</span>
                  </div>
                )}
                {experience > 0 && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    <span>{experience} years experience</span>
                  </div>
                )}
                {avgRating > 0 && (
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-300 fill-current" />
                    <span>
                      {avgRating.toFixed(1)} ({ratingCount} reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Profile Completion */}
          <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-4 w-full sm:w-auto">
            <div className="mb-2">
              <span className="text-sm text-primary-100">
                Profile Completion
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-32 bg-primary-200 bg-opacity-30 rounded-full h-3">
                <div
                  className="bg-medical-400 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${completionPercent}%` }}
                />
              </div>
              <span className="text-2xl font-bold text-medical-300">
                {completionPercent}%
              </span>
            </div>
            {completionPercent < 100 && (
              <p className="text-xs text-primary-100 mt-2">
                Complete your profile to unlock more features
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Tab Navigation
  const TabNavigation = () => (
    <div className="bg-white rounded-xl shadow-elevation-2 border border-gray-100 mb-8 overflow-hidden">
      <div className="flex overflow-x-auto scrollbar-hide">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 lg:px-8 py-4 lg:py-5 whitespace-nowrap border-b-3 font-semibold text-sm transition-all duration-200 flex-shrink-0 ${
                activeTab === tab.id
                  ? "border-primary-600 text-primary-600 bg-primary-50"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  // Overview Tab
  const OverviewTab = () => {
    // Safe data extraction
    const bio = profile?.bio || "";
    const email = profile?.email || user?.email || "";
    const phone = profile?.phone || "";
    const showEmail = profile?.privacy?.showEmail ?? true;
    const showPhone = profile?.privacy?.showPhone ?? true;
    const primarySpecialty = profile?.primarySpecialty || "Not specified";
    const subspecialties = profile?.subspecialties || [];

    return (
      <div className="space-y-8">
        {/* Bio Section */}
        <div className="bg-white rounded-xl shadow-elevation-2 border border-gray-100 p-6 lg:p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900">About Me</h3>
            <button
              onClick={() => toggleEditMode("bio")}
              className="flex items-center gap-2 text-primary-600 hover:text-primary-700 transition-colors px-4 py-2 rounded-lg hover:bg-primary-50"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </button>
          </div>

          {editMode.bio ? (
            <form onSubmit={handleSubmitBasic(handleBasicUpdate)}>
              <div className="space-y-4">
                <textarea
                  {...registerBasic("bio", {
                    maxLength: { value: 2000, message: "Max 2000 characters" },
                  })}
                  rows={8}
                  className="input w-full"
                  placeholder="Tell other doctors about your experience, interests, and what makes you unique..."
                  defaultValue={bio}
                />
                {errorsBasic.bio && (
                  <p className="text-sm text-red-600">
                    {errorsBasic.bio.message}
                  </p>
                )}
                <div className="flex gap-3">
                  <button
                    type="submit"
                    disabled={updateBasicMutation.isLoading}
                    className="btn-primary px-6 py-2 rounded-lg flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>
                      {updateBasicMutation.isLoading ? "Saving..." : "Save"}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleEditMode("bio")}
                    className="btn-secondary px-6 py-2 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="prose max-w-none">
              {bio ? (
                <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
                  {bio}
                </p>
              ) : (
                <p className="text-gray-400 italic text-lg">
                  Add a bio to help other doctors learn about you...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-elevation-2 border border-gray-100 p-6 lg:p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Contact Information
          </h3>
          <div className="grid sm:grid-cols-2 gap-6">
            {email && (
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <span className="text-gray-700 break-all">{email}</span>
                {showEmail ? (
                  <Eye
                    className="w-4 h-4 text-medical-500 flex-shrink-0"
                    title="Visible to others"
                  />
                ) : (
                  <Lock
                    className="w-4 h-4 text-gray-400 flex-shrink-0"
                    title="Hidden from others"
                  />
                )}
              </div>
            )}
            {phone && (
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <span className="text-gray-700">{phone}</span>
                {showPhone ? (
                  <Eye
                    className="w-4 h-4 text-medical-500 flex-shrink-0"
                    title="Visible to others"
                  />
                ) : (
                  <Lock
                    className="w-4 h-4 text-gray-400 flex-shrink-0"
                    title="Hidden from others"
                  />
                )}
              </div>
            )}
            {!email && !phone && (
              <p className="text-gray-400 italic col-span-2">
                No contact information available
              </p>
            )}
          </div>
        </div>

        {/* Specialties */}
        <div className="bg-white rounded-xl shadow-elevation-2 border border-gray-100 p-6 lg:p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Specialties</h3>
          <div className="space-y-4">
            <div>
              <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Primary Specialty
              </span>
              <p className="text-xl font-semibold text-gray-900 mt-1">
                {primarySpecialty}
              </p>
            </div>

            {subspecialties.length > 0 && (
              <div>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Subspecialties
                </span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {subspecialties.map((specialty, index) => (
                    <span
                      key={index}
                      className="badge badge-primary px-4 py-2 rounded-full text-sm font-medium"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {subspecialties.length === 0 && (
              <p className="text-gray-400 italic text-sm">
                No subspecialties added yet
              </p>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Experience Tab
  const ExperienceTab = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">
          Professional Experience
        </h2>
        <button
          onClick={() => {
            setEditingItem(null);
            resetExperience();
            setShowExperienceModal(true);
          }}
          className="btn-medical px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg"
        >
          <Plus className="w-5 h-5" />
          <span>Add Experience</span>
        </button>
      </div>

      {profile?.experiences && profile.experiences.length > 0 ? (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-primary-200 hidden lg:block"></div>

          <div className="space-y-8">
            {profile.experiences.map((experience) => (
              <div
                key={experience._id}
                className="relative bg-white rounded-xl shadow-elevation-2 border border-gray-100 p-6 lg:p-8 lg:ml-14"
              >
                {/* Timeline Dot */}
                <div className="absolute -left-14 top-8 w-4 h-4 bg-primary-600 rounded-full border-4 border-white shadow-lg hidden lg:block"></div>

                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h4 className="text-xl font-bold text-gray-900">
                        {experience.title}
                      </h4>
                      {experience.current && (
                        <span className="badge badge-success px-3 py-1 rounded-full text-xs font-medium">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-lg text-primary-600 font-semibold mb-1">
                      {experience.institution}
                    </p>
                    <p className="text-gray-600 mb-2">{experience.location}</p>
                    <p className="text-gray-500 text-sm mb-4">
                      {new Date(experience.startDate).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "long" }
                      )}{" "}
                      -{" "}
                      {experience.current
                        ? "Present"
                        : new Date(experience.endDate).toLocaleDateString(
                            "en-US",
                            { year: "numeric", month: "long" }
                          )}
                    </p>
                    {experience.description && (
                      <p className="text-gray-700 leading-relaxed">
                        {experience.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingItem(experience);
                        resetExperience(experience);
                        setShowExperienceModal(true);
                      }}
                      className="text-primary-600 hover:text-primary-700 p-2 hover:bg-primary-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this experience?"
                          )
                        ) {
                          deleteExperienceMutation.mutate(experience._id);
                        }
                      }}
                      disabled={deleteExperienceMutation.isLoading}
                      className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-elevation-2 border border-gray-100">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
            <Briefcase className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Experience Added
          </h3>
          <p className="text-gray-600 mb-6">
            Add your professional experience to build your profile
          </p>
          <button
            onClick={() => {
              setEditingItem(null);
              resetExperience();
              setShowExperienceModal(true);
            }}
            className="btn-medical px-6 py-3 rounded-lg"
          >
            Add Your First Experience
          </button>
        </div>
      )}

      {/* Experience Modal */}
      {showExperienceModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-lg font-semibold">
                {editingItem ? "Edit Experience" : "Add Experience"}
              </h3>
              <button
                onClick={() => {
                  setShowExperienceModal(false);
                  setEditingItem(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form
              onSubmit={handleSubmitExperience(handleExperienceSubmit)}
              className="p-6 space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...registerExperience("title", {
                    required: "Title is required",
                  })}
                  className="input w-full"
                  placeholder="e.g., Senior Cardiologist"
                />
                {errorsExperience.title && (
                  <p className="text-sm text-red-600 mt-1">
                    {errorsExperience.title.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Institution <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...registerExperience("institution", {
                    required: "Institution is required",
                  })}
                  className="input w-full"
                  placeholder="e.g., UCLA Medical Center"
                />
                {errorsExperience.institution && (
                  <p className="text-sm text-red-600 mt-1">
                    {errorsExperience.institution.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...registerExperience("location", {
                    required: "Location is required",
                  })}
                  className="input w-full"
                  placeholder="e.g., Los Angeles, CA"
                />
                {errorsExperience.location && (
                  <p className="text-sm text-red-600 mt-1">
                    {errorsExperience.location.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...registerExperience("startDate", {
                      required: "Start date is required",
                    })}
                    className="input w-full"
                  />
                  {errorsExperience.startDate && (
                    <p className="text-sm text-red-600 mt-1">
                      {errorsExperience.startDate.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    {...registerExperience("endDate")}
                    className="input w-full"
                    disabled={
                      registerExperience("current")?.value ||
                      editingItem?.current
                    }
                  />
                </div>
              </div>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  {...registerExperience("current")}
                  className="w-4 h-4 text-primary-600 rounded"
                />
                <span className="text-sm text-gray-700">
                  I currently work here
                </span>
              </label>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type <span className="text-red-500">*</span>
                </label>
                <select
                  {...registerExperience("type", {
                    required: "Type is required",
                  })}
                  className="input w-full"
                >
                  <option value="">Select type</option>
                  <option value="employment">Employment</option>
                  <option value="residency">Residency</option>
                  <option value="fellowship">Fellowship</option>
                  <option value="education">Education</option>
                </select>
                {errorsExperience.type && (
                  <p className="text-sm text-red-600 mt-1">
                    {errorsExperience.type.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  {...registerExperience("description")}
                  rows={4}
                  className="input w-full"
                  placeholder="Describe your responsibilities and achievements..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowExperienceModal(false);
                    setEditingItem(null);
                  }}
                  className="btn-secondary px-6 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={experienceMutation.isLoading}
                  className="btn-medical px-6 py-2 rounded-lg"
                >
                  {experienceMutation.isLoading
                    ? "Saving..."
                    : editingItem
                    ? "Update"
                    : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // Skills Tab
  const SkillsTab = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">
          Skills & Certifications
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => {
              resetSkill();
              setShowSkillModal(true);
            }}
            className="btn-primary px-6 py-3 rounded-lg flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Add Skill</span>
          </button>
          <button
            onClick={() => {
              setEditingItem(null);
              resetCertification();
              setShowCertificationModal(true);
            }}
            className="btn-medical px-6 py-3 rounded-lg flex items-center gap-2"
          >
            <Award className="w-5 h-5" />
            <span>Add Certification</span>
          </button>
        </div>
      </div>

      {/* Skills Section */}
      <div className="bg-white rounded-xl shadow-elevation-2 border border-gray-100 p-6 lg:p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Skills</h3>
        {profile?.skills && profile.skills.length > 0 ? (
          <div className="grid sm:grid-cols-2 gap-6">
            {profile.skills.map((skill, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-gray-900">{skill.name}</h4>
                  <span
                    className={`badge px-3 py-1 rounded-full text-xs font-medium ${
                      skill.proficiencyLevel === "expert"
                        ? "bg-purple-100 text-purple-800"
                        : skill.proficiencyLevel === "advanced"
                        ? "bg-blue-100 text-blue-800"
                        : skill.proficiencyLevel === "intermediate"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {skill.proficiencyLevel}
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3 capitalize">
                  {skill.category}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {skill.yearsOfExperience} years
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No skills added yet. Add your first skill!</p>
          </div>
        )}
      </div>

      {/* Certifications Section */}
      <div className="bg-white rounded-xl shadow-elevation-2 border border-gray-100 p-6 lg:p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Certifications
        </h3>
        {profile?.certifications && profile.certifications.length > 0 ? (
          <div className="space-y-4">
            {profile.certifications.map((cert) => (
              <div
                key={cert._id}
                className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">
                        {cert.name}
                      </h4>
                      {cert.verified && (
                        <CheckCircle className="w-5 h-5 text-medical-500" />
                      )}
                    </div>
                    <p className="text-primary-600 font-medium">
                      {cert.issuingOrganization}
                    </p>
                    <p className="text-gray-500 text-sm">
                      Issued:{" "}
                      {new Date(cert.issueDate).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                      })}
                    </p>
                    {cert.expirationDate && (
                      <p className="text-gray-500 text-sm">
                        Expires:{" "}
                        {new Date(cert.expirationDate).toLocaleDateString(
                          "en-US",
                          { year: "numeric", month: "long" }
                        )}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingItem(cert);
                        resetCertification(cert);
                        setShowCertificationModal(true);
                      }}
                      className="text-primary-600 hover:text-primary-700 p-2 hover:bg-primary-50 rounded-lg"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            "Are you sure you want to delete this certification?"
                          )
                        ) {
                          deleteCertificationMutation.mutate(cert._id);
                        }
                      }}
                      disabled={deleteCertificationMutation.isLoading}
                      className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Award className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p>No certifications added yet. Add your first certification!</p>
          </div>
        )}
      </div>

      {/* Skill Modal */}
      {showSkillModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
            <div className="px-6 py-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-semibold">Add Skill</h3>
              <button
                onClick={() => setShowSkillModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form
              onSubmit={handleSubmitSkill(handleSkillSubmit)}
              className="p-6 space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skill Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...registerSkill("name", { required: "Name is required" })}
                  className="input w-full"
                  placeholder="e.g., Cardiac Catheterization"
                />
                {errorsSkill.name && (
                  <p className="text-sm text-red-600 mt-1">
                    {errorsSkill.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  {...registerSkill("category", {
                    required: "Category is required",
                  })}
                  className="input w-full"
                >
                  <option value="">Select category</option>
                  <option value="clinical">Clinical</option>
                  <option value="research">Research</option>
                  <option value="administrative">Administrative</option>
                  <option value="technical">Technical</option>
                  <option value="other">Other</option>
                </select>
                {errorsSkill.category && (
                  <p className="text-sm text-red-600 mt-1">
                    {errorsSkill.category.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Proficiency Level <span className="text-red-500">*</span>
                </label>
                <select
                  {...registerSkill("proficiencyLevel", {
                    required: "Proficiency level is required",
                  })}
                  className="input w-full"
                >
                  <option value="">Select level</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
                {errorsSkill.proficiencyLevel && (
                  <p className="text-sm text-red-600 mt-1">
                    {errorsSkill.proficiencyLevel.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  {...registerSkill("yearsOfExperience", {
                    required: "Years of experience is required",
                    min: { value: 0, message: "Must be 0 or greater" },
                    max: { value: 50, message: "Must be 50 or less" },
                  })}
                  className="input w-full"
                  min="0"
                  max="50"
                />
                {errorsSkill.yearsOfExperience && (
                  <p className="text-sm text-red-600 mt-1">
                    {errorsSkill.yearsOfExperience.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowSkillModal(false)}
                  className="btn-secondary px-6 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={skillsMutation.isLoading}
                  className="btn-medical px-6 py-2 rounded-lg"
                >
                  {skillsMutation.isLoading ? "Adding..." : "Add Skill"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Certification Modal */}
      {showCertificationModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-lg font-semibold">
                {editingItem ? "Edit Certification" : "Add Certification"}
              </h3>
              <button
                onClick={() => {
                  setShowCertificationModal(false);
                  setEditingItem(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <form
              onSubmit={handleSubmitCertification(handleCertificationSubmit)}
              className="p-6 space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Certification Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...registerCertification("name", {
                    required: "Name is required",
                  })}
                  className="input w-full"
                  placeholder="e.g., Board Certification in Cardiology"
                />
                {errorsCertification.name && (
                  <p className="text-sm text-red-600 mt-1">
                    {errorsCertification.name.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issuing Organization <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...registerCertification("issuingOrganization", {
                    required: "Organization is required",
                  })}
                  className="input w-full"
                  placeholder="e.g., American Board of Internal Medicine"
                />
                {errorsCertification.issuingOrganization && (
                  <p className="text-sm text-red-600 mt-1">
                    {errorsCertification.issuingOrganization.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Issue Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    {...registerCertification("issueDate", {
                      required: "Issue date is required",
                    })}
                    className="input w-full"
                  />
                  {errorsCertification.issueDate && (
                    <p className="text-sm text-red-600 mt-1">
                      {errorsCertification.issueDate.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiration Date
                  </label>
                  <input
                    type="date"
                    {...registerCertification("expirationDate")}
                    className="input w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credential ID
                </label>
                <input
                  type="text"
                  {...registerCertification("credentialId")}
                  className="input w-full"
                  placeholder="e.g., CERT-123456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Credential URL
                </label>
                <input
                  type="url"
                  {...registerCertification("credentialUrl")}
                  className="input w-full"
                  placeholder="https://..."
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCertificationModal(false);
                    setEditingItem(null);
                  }}
                  className="btn-secondary px-6 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={certificationMutation.isLoading}
                  className="btn-medical px-6 py-2 rounded-lg"
                >
                  {certificationMutation.isLoading
                    ? "Saving..."
                    : editingItem
                    ? "Update"
                    : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  // Documents Tab
  const DocumentsTab = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">
          Documents & Verification
        </h2>
        <button
          onClick={() => documentInputRef.current?.click()}
          className="btn-medical px-6 py-3 rounded-lg flex items-center gap-2"
        >
          <Upload className="w-5 h-5" />
          <span>Upload Document</span>
        </button>
      </div>

      {profile?.documents && profile.documents.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {profile.documents.map((doc) => (
            <div
              key={doc._id}
              className="bg-white rounded-xl shadow-elevation-2 border border-gray-100 p-6 hover:shadow-elevation-3 transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-primary-600 flex-shrink-0" />
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {doc.type.replace(/_/g, " ").toUpperCase()}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {doc.verified ? (
                  <FileCheck className="w-6 h-6 text-medical-500" />
                ) : (
                  <Clock className="w-6 h-6 text-warning-500" />
                )}
              </div>

              <div className="flex gap-2">
                href={doc.url}
                target="_blank" rel="noopener noreferrer" className="flex-1
                bg-primary-50 text-primary-600 px-4 py-2 rounded-lg
                hover:bg-primary-100 transition-colors flex items-center
                justify-center gap-2 text-sm"
                <a>
                  <Download className="w-4 h-4" />
                  <span>View</span>
                </a>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to delete this document?"
                      )
                    ) {
                      deleteDocumentMutation.mutate(doc._id);
                    }
                  }}
                  disabled={deleteDocumentMutation.isLoading}
                  className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl shadow-elevation-2 border border-gray-100">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Documents Uploaded
          </h3>
          <p className="text-gray-600 mb-6">
            Upload verification documents to complete your profile
          </p>
          <button
            onClick={() => documentInputRef.current?.click()}
            className="btn-medical px-6 py-3 rounded-lg"
          >
            Upload Your First Document
          </button>
        </div>
      )}

      <input
        ref={documentInputRef}
        type="file"
        multiple
        accept="image/*,application/pdf"
        onChange={handleDocumentUpload}
        className="hidden"
      />

      {/* Upload Progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="bg-white rounded-xl shadow-elevation-2 border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Uploading...
            </span>
            <span className="text-sm font-medium text-primary-600">
              {uploadProgress}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );

  // Privacy Tab
  const PrivacyTab = () => {
    const [privacySettings, setPrivacySettings] = useState(
      profile?.privacy || {
        showEmail: false,
        showPhone: false,
        searchVisibility: "public",
      }
    );

    const handlePrivacyChange = (field, value) => {
      setPrivacySettings((prev) => ({
        ...prev,
        [field]: value,
      }));
    };

    const savePrivacySettings = () => {
      privacyMutation.mutate(privacySettings);
    };

    return (
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-gray-900">Privacy & Settings</h2>

        <div className="bg-white rounded-xl shadow-elevation-2 border border-gray-100 p-6 lg:p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Profile Visibility
          </h3>
          <div className="space-y-4">
            {[
              {
                value: "public",
                label: "Public",
                description: "Anyone can view your profile",
              },
              {
                value: "connections",
                label: "Connections Only",
                description: "Only your connections can view your profile",
              },
              {
                value: "private",
                label: "Private",
                description: "Only you can view your profile",
              },
            ].map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-3 p-4 border-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                style={{
                  borderColor:
                    privacySettings.searchVisibility === option.value
                      ? "#0284c7"
                      : "#e5e7eb",
                }}
              >
                <input
                  type="radio"
                  name="searchVisibility"
                  value={option.value}
                  checked={privacySettings.searchVisibility === option.value}
                  onChange={(e) =>
                    handlePrivacyChange("searchVisibility", e.target.value)
                  }
                  className="w-4 h-4 text-primary-600"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{option.label}</p>
                  <p className="text-sm text-gray-500">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-elevation-2 border border-gray-100 p-6 lg:p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Contact Information Visibility
          </h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">
                    Show Email Address
                  </p>
                  <p className="text-sm text-gray-500">
                    Allow others to see your email address
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={privacySettings.showEmail}
                onChange={(e) =>
                  handlePrivacyChange("showEmail", e.target.checked)
                }
                className="w-4 h-4 text-primary-600 rounded"
              />
            </label>

            <label className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-900">Show Phone Number</p>
                  <p className="text-sm text-gray-500">
                    Allow others to see your phone number
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={privacySettings.showPhone}
                onChange={(e) =>
                  handlePrivacyChange("showPhone", e.target.checked)
                }
                className="w-4 h-4 text-primary-600 rounded"
              />
            </label>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={savePrivacySettings}
              disabled={privacyMutation.isLoading}
              className="btn-medical px-6 py-3 rounded-lg flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              <span>
                {privacyMutation.isLoading ? "Saving..." : "Save Settings"}
              </span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-elevation-2 border border-gray-100 p-6 lg:p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Account Actions
          </h3>
          <div className="space-y-4">
            <button
              onClick={() => navigate("/settings/password")}
              className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Lock className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">Change Password</p>
                    <p className="text-sm text-gray-500">
                      Update your account password
                    </p>
                  </div>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>

            <button
              onClick={() => navigate("/settings/security")}
              className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Security Settings
                    </p>
                    <p className="text-sm text-gray-500">
                      Manage two-factor authentication and sessions
                    </p>
                  </div>
                </div>
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Analytics Tab
  const AnalyticsTab = () => {
    if (analyticsLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-600 border-opacity-50 mb-4" />
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      );
    }

    if (analyticsError) {
      return (
        <div className="text-center py-12 bg-white rounded-xl shadow-elevation-2 border border-gray-100">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error Loading Analytics
          </h3>
          <p className="text-gray-600 mb-6">
            {analyticsError.response?.data?.message ||
              "Failed to load analytics"}
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-gray-900">Profile Analytics</h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl p-6 shadow-elevation-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-sm mb-1">Total Views</p>
                <p className="text-3xl font-bold">
                  {analytics?.profileViews?.length || 0}
                </p>
              </div>
              <Eye className="w-10 h-10 text-primary-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-medical-500 to-medical-600 text-white rounded-xl p-6 shadow-elevation-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-medical-100 text-sm mb-1">This Month</p>
                <p className="text-3xl font-bold">
                  {analytics?.recentViews || 0}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-medical-200" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-elevation-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm mb-1">Profile Score</p>
                <p className="text-3xl font-bold">
                  {profile?.profileCompletion?.percentage || 0}%
                </p>
              </div>
              <Activity className="w-10 h-10 text-purple-200" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-elevation-2 border border-gray-100 p-6 lg:p-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Profile Performance
          </h3>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 font-medium">
                  Profile Completeness
                </span>
                <span className="font-semibold text-gray-900">
                  {profile?.profileCompletion?.percentage || 0}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                  style={{
                    width: `${profile?.profileCompletion?.percentage || 0}%`,
                  }}
                />
              </div>
              {profile?.profileCompletion?.missingSections &&
                profile.profileCompletion.missingSections.length > 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    Missing sections:{" "}
                    {profile.profileCompletion.missingSections.join(", ")}
                  </p>
                )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600 font-medium">
                  Verification Status
                </span>
                <span
                  className={`font-semibold ${
                    profile?.verificationStatus?.overall === "verified"
                      ? "text-medical-600"
                      : profile?.verificationStatus?.overall === "pending"
                      ? "text-warning-600"
                      : "text-red-600"
                  }`}
                >
                  {profile?.verificationStatus?.overall === "verified"
                    ? "Verified"
                    : profile?.verificationStatus?.overall === "pending"
                    ? "Pending"
                    : "Not Verified"}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className={`h-3 rounded-full transition-all duration-300 ${
                    profile?.verificationStatus?.overall === "verified"
                      ? "bg-medical-500"
                      : profile?.verificationStatus?.overall === "pending"
                      ? "bg-warning-500"
                      : "bg-red-500"
                  }`}
                  style={{
                    width:
                      profile?.verificationStatus?.overall === "verified"
                        ? "100%"
                        : profile?.verificationStatus?.overall === "pending"
                        ? "60%"
                        : "30%",
                  }}
                />
              </div>
            </div>

            {profile?.rating && profile.rating.count > 0 && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600 font-medium">
                    Average Rating
                  </span>
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="font-semibold text-gray-900">
                      {profile.rating.average.toFixed(1)} / 5.0
                    </span>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Based on {profile.rating.count} review
                  {profile.rating.count !== 1 ? "s" : ""}
                </p>
              </div>
            )}
          </div>
        </div>

        {analytics?.trend && (
          <div className="bg-white rounded-xl shadow-elevation-2 border border-gray-100 p-6 lg:p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Trends</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Views Growth</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.trend.viewsGrowth === "up" ? "↗" : "↘"}{" "}
                  {Math.abs(analytics.trend.viewsGrowthPercent || 0)}%
                </p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Engagement Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.trend.engagementRate || 0}%
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <ProfileHeader />
        <TabNavigation />

        <div className="transition-all duration-300">
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "experience" && <ExperienceTab />}
          {activeTab === "skills" && <SkillsTab />}
          {activeTab === "documents" && <DocumentsTab />}
          {activeTab === "privacy" && <PrivacyTab />}
          {activeTab === "analytics" && <AnalyticsTab />}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EXPORT
// ============================================================================
export default EnhancedProfile;
