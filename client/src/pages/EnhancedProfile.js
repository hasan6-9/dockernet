// client/src/pages/EnhancedProfile.js - MVP Testing Version
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { profileAPI, handleApiError } from "../api";
import {
  User,
  Camera,
  Upload,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  FileText,
  Briefcase,
  Award,
  ArrowLeft,
  Loader,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const EnhancedProfile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const photoInputRef = useRef(null);
  const docInputRef = useRef(null);

  const [activeTab, setActiveTab] = useState("overview");
  const [editingBasic, setEditingBasic] = useState(false);
  const [editingExperience, setEditingExperience] = useState(null);
  const [editingSkill, setEditingSkill] = useState(false);
  const [editingCertification, setEditingCertification] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // ============================================================================
  // DATA FETCHING
  // ============================================================================
  const {
    data: profileData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["profile", "me"],
    queryFn: () => profileAPI.getMe(),
    staleTime: 2 * 60 * 1000,
  });

  // Extract profile safely
  const profile = profileData?.data?.data || profileData?.data || null;

  // ============================================================================
  // MUTATIONS
  // ============================================================================
  const updateBasicMutation = useMutation({
    mutationFn: (data) => profileAPI.updateBasic(data),
    onSuccess: () => {
      toast.success("Profile updated!");
      queryClient.invalidateQueries(["profile"]);
      setEditingBasic(false);
    },
    onError: (error) => {
      toast.error(handleApiError(error).message);
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: (file) => profileAPI.uploadPhoto(file, setUploadProgress),
    onSuccess: () => {
      toast.success("Photo uploaded!");
      setUploadProgress(0);
      queryClient.invalidateQueries(["profile"]);
    },
    onError: (error) => {
      toast.error("Failed to upload photo");
      setUploadProgress(0);
    },
  });

  const uploadDocsMutation = useMutation({
    mutationFn: ({ files, types }) =>
      profileAPI.uploadDocuments(files, types, setUploadProgress),
    onSuccess: () => {
      toast.success("Documents uploaded!");
      setUploadProgress(0);
      queryClient.invalidateQueries(["profile"]);
    },
    onError: (error) => {
      toast.error("Failed to upload documents");
      setUploadProgress(0);
    },
  });

  const deleteDocMutation = useMutation({
    mutationFn: (docId) => profileAPI.deleteDocument(docId),
    onSuccess: () => {
      toast.success("Document deleted!");
      queryClient.invalidateQueries(["profile"]);
    },
    onError: () => toast.error("Failed to delete document"),
  });

  const experienceMutation = useMutation({
    mutationFn: ({ id, data }) => {
      return id
        ? profileAPI.updateExperience(id, data)
        : profileAPI.addExperience(data);
    },
    onSuccess: () => {
      toast.success(
        editingExperience ? "Experience updated!" : "Experience added!"
      );
      queryClient.invalidateQueries(["profile"]);
      setEditingExperience(null);
    },
    onError: () => toast.error("Failed to save experience"),
  });

  const deleteExpMutation = useMutation({
    mutationFn: (expId) => profileAPI.deleteExperience(expId),
    onSuccess: () => {
      toast.success("Experience deleted!");
      queryClient.invalidateQueries(["profile"]);
    },
    onError: () => toast.error("Failed to delete experience"),
  });

  const skillsMutation = useMutation({
    mutationFn: (skills) => profileAPI.updateSkills({ skills }),
    onSuccess: () => {
      toast.success("Skills updated!");
      queryClient.invalidateQueries(["profile"]);
      setEditingSkill(false);
    },
    onError: () => toast.error("Failed to update skills"),
  });

  const certificationMutation = useMutation({
    mutationFn: ({ id, data }) => {
      return id
        ? profileAPI.updateCertification(id, data)
        : profileAPI.addCertification(data);
    },
    onSuccess: () => {
      toast.success(
        editingCertification ? "Certification updated!" : "Certification added!"
      );
      queryClient.invalidateQueries(["profile"]);
      setEditingCertification(null);
    },
    onError: () => toast.error("Failed to save certification"),
  });

  const deleteCertMutation = useMutation({
    mutationFn: (certId) => profileAPI.deleteCertification(certId),
    onSuccess: () => {
      toast.success("Certification deleted!");
      queryClient.invalidateQueries(["profile"]);
    },
    onError: () => toast.error("Failed to delete certification"),
  });

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be less than 5MB");
      return;
    }

    uploadPhotoMutation.mutate(file);
  };

  const handleDocUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

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

    const types = files.map(() => "other");
    uploadDocsMutation.mutate({ files, types });
  };

  const handleBasicSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      bio: formData.get("bio"),
      location: {
        city: formData.get("city"),
        state: formData.get("state"),
        country: formData.get("country"),
      },
    };
    updateBasicMutation.mutate(data);
  };

  const handleExperienceSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      title: formData.get("title"),
      institution: formData.get("institution"),
      location: formData.get("location"),
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate") || null,
      current: formData.get("current") === "on",
      description: formData.get("description"),
      type: formData.get("type"),
    };

    experienceMutation.mutate({
      id: editingExperience?._id,
      data,
    });
  };

  const handleSkillSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newSkill = {
      name: formData.get("name"),
      category: formData.get("category"),
      proficiencyLevel: formData.get("proficiencyLevel"),
      yearsOfExperience: parseInt(formData.get("yearsOfExperience")),
    };

    const currentSkills = profile?.skills || [];
    skillsMutation.mutate([...currentSkills, newSkill]);
  };

  const handleCertificationSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      name: formData.get("name"),
      issuingOrganization: formData.get("issuingOrganization"),
      issueDate: formData.get("issueDate"),
      expirationDate: formData.get("expirationDate") || null,
      credentialId: formData.get("credentialId"),
      credentialUrl: formData.get("credentialUrl"),
    };

    certificationMutation.mutate({
      id: editingCertification?._id,
      data,
    });
  };

  // ============================================================================
  // LOADING & ERROR STATES
  // ============================================================================
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Loading Profile
          </h2>
          <p className="text-gray-600 mb-6">{error.message}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="btn-primary px-6 py-2"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No profile data available</p>
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER
  // ============================================================================
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Dashboard
          </button>

          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl p-8">
            <div className="flex items-center gap-6">
              {/* Profile Photo */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-white border-4 border-white shadow-lg">
                  {profile.profilePhoto?.url ? (
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
                <label className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
                {uploadProgress > 0 && uploadProgress < 100 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-full">
                    <span className="text-white text-sm font-bold">
                      {uploadProgress}%
                    </span>
                  </div>
                )}
              </div>

              {/* Basic Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-2">
                  Dr. {profile.firstName} {profile.lastName}
                  {profile.verificationStatus?.overall === "verified" && (
                    <CheckCircle className="w-6 h-6 inline ml-2 text-green-400" />
                  )}
                </h1>
                <p className="text-xl text-blue-100 mb-2">
                  {profile.primarySpecialty}
                </p>
                <p className="text-blue-200">
                  {profile.yearsOfExperience} years experience • {profile.role}
                </p>
                <div className="mt-4 bg-white bg-opacity-20 rounded-lg p-3 inline-block">
                  <span className="text-sm text-white">Profile Completion</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-32 bg-white bg-opacity-30 rounded-full h-2">
                      <div
                        className="bg-green-400 h-2 rounded-full transition-all"
                        style={{
                          width: `${
                            profile.profileCompletion?.percentage || 0
                          }%`,
                        }}
                      />
                    </div>
                    <span className="text-white font-bold">
                      {profile.profileCompletion?.percentage || 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
          <div className="flex overflow-x-auto p-2">
            {[
              { id: "overview", label: "Overview", icon: User },
              { id: "professional", label: "Professional", icon: Briefcase },
              { id: "documents", label: "Documents", icon: FileText },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 font-medium transition-all rounded-lg mx-1 ${
                    activeTab === tab.id
                      ? "bg-blue-600 text-white shadow-md"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "overview" && (
            <OverviewTab
              profile={profile}
              editingBasic={editingBasic}
              setEditingBasic={setEditingBasic}
              handleBasicSubmit={handleBasicSubmit}
              updateBasicMutation={updateBasicMutation}
            />
          )}
          {activeTab === "professional" && (
            <ProfessionalTab
              profile={profile}
              editingExperience={editingExperience}
              setEditingExperience={setEditingExperience}
              handleExperienceSubmit={handleExperienceSubmit}
              experienceMutation={experienceMutation}
              deleteExpMutation={deleteExpMutation}
              editingSkill={editingSkill}
              setEditingSkill={setEditingSkill}
              handleSkillSubmit={handleSkillSubmit}
              skillsMutation={skillsMutation}
              editingCertification={editingCertification}
              setEditingCertification={setEditingCertification}
              handleCertificationSubmit={handleCertificationSubmit}
              certificationMutation={certificationMutation}
              deleteCertMutation={deleteCertMutation}
            />
          )}
          {activeTab === "documents" && (
            <DocumentsTab
              profile={profile}
              docInputRef={docInputRef}
              handleDocUpload={handleDocUpload}
              uploadProgress={uploadProgress}
              uploadDocsMutation={uploadDocsMutation}
              deleteDocMutation={deleteDocMutation}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// OVERVIEW TAB
// ============================================================================
const OverviewTab = ({
  profile,
  editingBasic,
  setEditingBasic,
  handleBasicSubmit,
  updateBasicMutation,
}) => (
  <div className="space-y-6">
    {/* Basic Information */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
        {!editingBasic && (
          <button
            onClick={() => setEditingBasic(true)}
            className="btn-secondary flex items-center gap-2"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        )}
      </div>

      {editingBasic ? (
        <form onSubmit={handleBasicSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <input
                name="firstName"
                defaultValue={profile.firstName}
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <input
                name="lastName"
                defaultValue={profile.lastName}
                className="input w-full"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Professional Bio
            </label>
            <textarea
              name="bio"
              defaultValue={profile.bio}
              rows={4}
              className="input w-full"
              maxLength={2000}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                name="city"
                defaultValue={profile.location?.city}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                name="state"
                defaultValue={profile.location?.state}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                name="country"
                defaultValue={profile.location?.country}
                className="input w-full"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={updateBasicMutation.isLoading}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {updateBasicMutation.isLoading ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => setEditingBasic(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="text-gray-900 font-medium">
                Dr. {profile.firstName} {profile.lastName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Specialty</p>
              <p className="text-gray-900 font-medium">
                {profile.primarySpecialty}
              </p>
            </div>
          </div>

          {profile.bio && (
            <div>
              <p className="text-sm text-gray-600">Bio</p>
              <p className="text-gray-900">{profile.bio}</p>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Location</p>
              <p className="text-gray-900">
                {[
                  profile.location?.city,
                  profile.location?.state,
                  profile.location?.country,
                ]
                  .filter(Boolean)
                  .join(", ") || "Not specified"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-gray-900">{profile.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Experience</p>
              <p className="text-gray-900">{profile.yearsOfExperience} years</p>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Verification Status */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-4">
        Verification Status
      </h3>
      <div className="grid grid-cols-4 gap-4">
        {["overall", "identity", "medical_license", "background_check"].map(
          (type) => {
            const status = profile.verificationStatus?.[type] || "pending";
            const colors = {
              verified: "bg-green-100 text-green-800 border-green-200",
              pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
              rejected: "bg-red-100 text-red-800 border-red-200",
            };

            return (
              <div key={type} className="text-center">
                <p className="text-sm text-gray-600 mb-2 capitalize">
                  {type.replace(/_/g, " ")}
                </p>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border ${colors[status]}`}
                >
                  {status}
                </span>
              </div>
            );
          }
        )}
      </div>
    </div>
  </div>
);

// ============================================================================
// PROFESSIONAL TAB
// ============================================================================
const ProfessionalTab = ({
  profile,
  editingExperience,
  setEditingExperience,
  handleExperienceSubmit,
  experienceMutation,
  deleteExpMutation,
  editingSkill,
  setEditingSkill,
  handleSkillSubmit,
  skillsMutation,
  editingCertification,
  setEditingCertification,
  handleCertificationSubmit,
  certificationMutation,
  deleteCertMutation,
}) => (
  <div className="space-y-6">
    {/* Experience Section */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">Experience</h3>
        {!editingExperience && (
          <button
            onClick={() => setEditingExperience({})}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Experience
          </button>
        )}
      </div>

      {editingExperience && (
        <form
          onSubmit={handleExperienceSubmit}
          className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                name="title"
                defaultValue={editingExperience.title}
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Institution *
              </label>
              <input
                name="institution"
                defaultValue={editingExperience.institution}
                className="input w-full"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <input
              name="location"
              defaultValue={editingExperience.location}
              className="input w-full"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                name="startDate"
                type="date"
                defaultValue={editingExperience.startDate?.split("T")[0]}
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                name="endDate"
                type="date"
                defaultValue={editingExperience.endDate?.split("T")[0]}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type *
              </label>
              <select
                name="type"
                defaultValue={editingExperience.type}
                className="input w-full"
                required
              >
                <option value="employment">Employment</option>
                <option value="residency">Residency</option>
                <option value="fellowship">Fellowship</option>
                <option value="education">Education</option>
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                name="current"
                type="checkbox"
                defaultChecked={editingExperience.current}
                className="w-4 h-4"
              />
              <span className="text-sm text-gray-700">
                I currently work here
              </span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              defaultValue={editingExperience.description}
              rows={3}
              className="input w-full"
              maxLength={1000}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={experienceMutation.isLoading}
              className="btn-primary"
            >
              {experienceMutation.isLoading ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditingExperience(null)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {profile.experiences?.length > 0 ? (
          profile.experiences.map((exp) => (
            <div
              key={exp._id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {exp.title}
                  </h4>
                  <p className="text-blue-600 font-medium">{exp.institution}</p>
                  <p className="text-gray-600 text-sm">{exp.location}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {new Date(exp.startDate).toLocaleDateString()} -{" "}
                    {exp.current
                      ? "Present"
                      : new Date(exp.endDate).toLocaleDateString()}
                  </p>
                  {exp.description && (
                    <p className="text-gray-700 mt-2">{exp.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingExperience(exp)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      window.confirm("Delete this experience?") &&
                      deleteExpMutation.mutate(exp._id)
                    }
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">
            No experience added yet
          </p>
        )}
      </div>
    </div>

    {/* Skills Section */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">Skills</h3>
        {!editingSkill && (
          <button
            onClick={() => setEditingSkill(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Skill
          </button>
        )}
      </div>

      {editingSkill && (
        <form
          onSubmit={handleSkillSubmit}
          className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skill Name *
              </label>
              <input name="name" className="input w-full" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select name="category" className="input w-full" required>
                <option value="clinical">Clinical</option>
                <option value="research">Research</option>
                <option value="administrative">Administrative</option>
                <option value="technical">Technical</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Proficiency Level *
              </label>
              <select name="proficiencyLevel" className="input w-full" required>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Years of Experience *
              </label>
              <input
                name="yearsOfExperience"
                type="number"
                min="0"
                max="50"
                defaultValue="1"
                className="input w-full"
                required
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={skillsMutation.isLoading}
              className="btn-primary"
            >
              {skillsMutation.isLoading ? "Adding..." : "Add Skill"}
            </button>
            <button
              type="button"
              onClick={() => setEditingSkill(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-2 gap-4">
        {profile.skills?.length > 0 ? (
          profile.skills.map((skill, idx) => (
            <div key={idx} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-gray-900">{skill.name}</h4>
                  <p className="text-sm text-gray-600 capitalize">
                    {skill.category}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full capitalize">
                      {skill.proficiencyLevel}
                    </span>
                    <span className="text-xs text-gray-500">
                      {skill.yearsOfExperience} years
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-8 col-span-2">
            No skills added yet
          </p>
        )}
      </div>
    </div>

    {/* Certifications Section */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">Certifications</h3>
        {!editingCertification && (
          <button
            onClick={() => setEditingCertification({})}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Certification
          </button>
        )}
      </div>

      {editingCertification && (
        <form
          onSubmit={handleCertificationSubmit}
          className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4"
        >
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Certification Name *
              </label>
              <input
                name="name"
                defaultValue={editingCertification.name}
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issuing Organization *
              </label>
              <input
                name="issuingOrganization"
                defaultValue={editingCertification.issuingOrganization}
                className="input w-full"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Issue Date *
              </label>
              <input
                name="issueDate"
                type="date"
                defaultValue={editingCertification.issueDate?.split("T")[0]}
                className="input w-full"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiration Date
              </label>
              <input
                name="expirationDate"
                type="date"
                defaultValue={
                  editingCertification.expirationDate?.split("T")[0]
                }
                className="input w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credential ID
              </label>
              <input
                name="credentialId"
                defaultValue={editingCertification.credentialId}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Credential URL
              </label>
              <input
                name="credentialUrl"
                type="url"
                defaultValue={editingCertification.credentialUrl}
                className="input w-full"
              />
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={certificationMutation.isLoading}
              className="btn-primary"
            >
              {certificationMutation.isLoading ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setEditingCertification(null)}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {profile.certifications?.length > 0 ? (
          profile.certifications.map((cert) => (
            <div
              key={cert._id}
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-semibold text-gray-900">
                    {cert.name}
                  </h4>
                  <p className="text-blue-600 font-medium">
                    {cert.issuingOrganization}
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Issued: {new Date(cert.issueDate).toLocaleDateString()}
                    {cert.expirationDate &&
                      ` • Expires: ${new Date(
                        cert.expirationDate
                      ).toLocaleDateString()}`}
                  </p>
                  {cert.credentialId && (
                    <p className="text-gray-600 text-sm">
                      ID: {cert.credentialId}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingCertification(cert)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      window.confirm("Delete this certification?") &&
                      deleteCertMutation.mutate(cert._id)
                    }
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center py-8">
            No certifications added yet
          </p>
        )}
      </div>
    </div>
  </div>
);

// ============================================================================
// DOCUMENTS TAB
// ============================================================================
const DocumentsTab = ({
  profile,
  docInputRef,
  handleDocUpload,
  uploadProgress,
  uploadDocsMutation,
  deleteDocMutation,
}) => (
  <div className="space-y-6">
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-gray-900">
          Verification Documents
        </h3>
        <button
          onClick={() => docInputRef.current?.click()}
          className="btn-primary flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Upload Documents
        </button>
        <input
          ref={docInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf"
          onChange={handleDocUpload}
          className="hidden"
        />
      </div>

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">
              Uploading...
            </span>
            <span className="text-sm font-bold text-blue-600">
              {uploadProgress}%
            </span>
          </div>
          <div className="w-full bg-blue-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profile.documents?.length > 0 ? (
          profile.documents.map((doc) => (
            <div
              key={doc._id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">
                      {doc.type.replace(/_/g, " ").toUpperCase()}
                    </h4>
                    <p className="text-xs text-gray-500">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {doc.verified ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                    Pending
                  </span>
                )}
              </div>

              <div className="flex gap-2">
                <a
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center bg-blue-50 text-blue-600 px-3 py-2 rounded text-sm hover:bg-blue-100 transition-colors"
                >
                  View
                </a>
                <button
                  onClick={() =>
                    window.confirm("Delete this document?") &&
                    deleteDocMutation.mutate(doc._id)
                  }
                  disabled={deleteDocMutation.isLoading}
                  className="text-red-600 hover:text-red-700 px-3 py-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-3 text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No documents uploaded yet</p>
            <button
              onClick={() => docInputRef.current?.click()}
              className="btn-primary"
            >
              Upload Your First Document
            </button>
          </div>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-900 mb-2">
          Document Requirements
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Accepted formats: JPG, PNG, PDF</li>
          <li>• Maximum file size: 10MB per file</li>
          <li>• Upload up to 5 files at once</li>
          <li>• Documents will be reviewed by admin for verification</li>
        </ul>
      </div>
    </div>
  </div>
);

export default EnhancedProfile;
