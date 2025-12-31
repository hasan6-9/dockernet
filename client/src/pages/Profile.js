import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

const Profile = () => {
  const { user, updateProfile, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    bio: user?.bio || "",
    primarySpecialty: user?.primarySpecialty || "",
    medicalLicenseNumber: user?.medicalLicenseNumber || "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await updateProfile(formData);

    if (result.success) {
      setMessage("Profile updated successfully!");
      setIsEditing(false);
      setTimeout(() => setMessage(""), 3000);
    } else {
      setMessage(result.message || "Failed to update profile");
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      bio: user?.bio || "",
      primarySpecialty: user?.primarySpecialty || "",
      medicalLicenseNumber: user?.medicalLicenseNumber || "",
    });
    setIsEditing(false);
    setMessage("");
  };

  const tabs = [
    { id: "overview", name: "Overview", icon: "👤" },
    { id: "credentials", name: "Credentials", icon: "🏥" },
    { id: "activity", name: "Activity", icon: "📊" },
    { id: "settings", name: "Settings", icon: "⚙️" },
  ];

  const getCompletionPercentage = () => {
    const fields = [
      user?.firstName,
      user?.lastName,
      user?.email,
      user?.primarySpecialty,
      user?.bio,
      user?.medicalSchool,
      user?.medicalLicenseNumber,
      user?.yearsOfExperience,
    ];
    const completed = fields.filter(
      (field) => field && field.toString().trim()
    ).length;
    return Math.round((completed / fields.length) * 100);
  };

  const achievements = [
    {
      title: "Profile Complete",
      description: "Completed your professional profile",
      earned: getCompletionPercentage() >= 80,
      date: "2024-01-15",
    },
    {
      title: "Verified Doctor",
      description: "Successfully verified medical credentials",
      earned: user?.isVerified,
      date: "2024-01-10",
    },
    {
      title: "Active Member",
      description: "Member for over 30 days",
      earned: true,
      date: "2024-01-01",
    },
    {
      title: "Premium Subscriber",
      description: "Subscribed to premium features",
      earned: user?.subscriptionStatus === "active",
      date: "2024-01-20",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Background Pattern */}
      <style jsx>{`
        .pattern-trust {
          background-image: radial-gradient(
            circle at 1px 1px,
            rgba(16, 185, 129, 0.1) 1px,
            transparent 0
          );
          background-size: 20px 20px;
        }
        .card-glass {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .card-medical {
          background: linear-gradient(145deg, #ffffff, #f8fafc);
          border: 1px solid rgba(16, 185, 129, 0.1);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .card-trust {
          background: linear-gradient(145deg, #ffffff, #f1f5f9);
          border: 1px solid rgba(59, 130, 246, 0.1);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .btn-medical {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 4px 14px 0 rgba(16, 185, 129, 0.25);
        }
        .btn-medical:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px 0 rgba(16, 185, 129, 0.35);
        }
        .btn-ghost-enhanced {
          background: transparent;
          color: #6b7280;
          border: 2px solid #e5e7eb;
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .btn-ghost-enhanced:hover {
          border-color: #10b981;
          color: #10b981;
          background: rgba(16, 185, 129, 0.05);
        }
        .input-medical {
          width: 100%;
          padding: 0.875rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.75rem;
          background: rgba(255, 255, 255, 0.9);
          transition: all 0.3s ease;
          font-size: 0.875rem;
        }
        .input-medical:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
          background: white;
        }
        .badge-verified {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }
        .badge-pending {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: white;
        }
        .text-gradient-medical {
          background: linear-gradient(135deg, #10b981, #059669);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .bg-gradient-medical {
          background: linear-gradient(135deg, #10b981, #059669);
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out;
        }
        .animate-scale-in {
          animation: scaleIn 0.3s ease-out;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
        .animation-delay-400 {
          animation-delay: 0.4s;
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>

      <div className="fixed inset-0 pattern-trust opacity-30 pointer-events-none"></div>

      {/* Navigation Header */}
      <nav className="relative bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link
                to="/dashboard"
                className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors group ml-3"
              >
                <svg
                  className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                <span className="font-medium">Back to Dashboard</span>
              </Link>
            </div>

            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-medical rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="text-2xl font-bold text-gradient-medical">
                Doconnect
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        {/* Profile Header */}
        <div className="mb-8 animate-fade-in-up">
          <div className="card-glass rounded-2xl p-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center space-x-6 mb-6 lg:mb-0">
                {/* Profile Avatar */}
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-medical rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </div>
                  <div className="absolute -bottom-2 -right-2">
                    {user?.isVerified ? (
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                        <svg
                          className="w-5 h-5 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                {/* Profile Info */}
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    Dr. {user?.firstName} {user?.lastName}
                  </h1>
                  <p className="text-gray-600 text-lg mb-2">
                    {user?.primarySpecialty || "Medical Professional"}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        user?.role === "senior"
                          ? "badge-verified"
                          : "badge-pending"
                      }`}
                    >
                      {user?.role === "senior"
                        ? "👨‍⚕️ Senior Doctor"
                        : "👩‍⚕️ Junior Doctor"}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        user?.isVerified ? "badge-verified" : "badge-pending"
                      }`}
                    >
                      {user?.isVerified ? "✓ Verified" : "⏳ Pending"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Profile Actions */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {getCompletionPercentage()}%
                  </div>
                  <div className="text-sm text-gray-600">Complete</div>
                  <div className="w-16 h-2 bg-gray-200 rounded-full mt-2">
                    <div
                      className="h-full bg-gradient-medical rounded-full transition-all duration-500"
                      style={{ width: `${getCompletionPercentage()}%` }}
                    ></div>
                  </div>
                </div>

                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-medical flex items-center space-x-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div
            className={`mb-6 p-4 rounded-xl animate-scale-in ${
              message.includes("success")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            <div className="flex items-center space-x-2">
              {message.includes("success") ? (
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              <span className="font-medium">{message}</span>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-8 animate-fade-in-up animation-delay-200">
          <div className="card-trust rounded-xl p-2">
            <nav className="flex space-x-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-green-500 text-white shadow-md"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="animate-fade-in-up animation-delay-400">
          {activeTab === "overview" && (
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Main Profile Content */}
              <div className="lg:col-span-2 space-y-6">
                {isEditing ? (
                  <div className="card-medical rounded-2xl p-8">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                      Edit Profile Information
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label
                            htmlFor="firstName"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                          >
                            First Name
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            id="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className="input-medical"
                            placeholder="Enter your first name"
                          />
                        </div>
                        <div>
                          <label
                            htmlFor="lastName"
                            className="block text-sm font-semibold text-gray-700 mb-2"
                          >
                            Last Name
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            id="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className="input-medical"
                            placeholder="Enter your last name"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="primarySpecialty"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Primary Specialty
                        </label>
                        <input
                          type="text"
                          name="primarySpecialty"
                          id="primarySpecialty"
                          value={formData.primarySpecialty}
                          onChange={handleChange}
                          className="input-medical"
                          placeholder="e.g., Cardiology, Pediatrics, Internal Medicine"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="medicalLicenseNumber"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Medical License Number
                        </label>
                        <input
                          type="text"
                          name="medicalLicenseNumber"
                          id="medicalLicenseNumber"
                          value={formData.medicalLicenseNumber}
                          onChange={handleChange}
                          className="input-medical"
                          placeholder="Enter your medical license number"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="bio"
                          className="block text-sm font-semibold text-gray-700 mb-2"
                        >
                          Professional Bio
                        </label>
                        <textarea
                          name="bio"
                          id="bio"
                          rows="5"
                          value={formData.bio}
                          onChange={handleChange}
                          placeholder="Tell us about your medical experience, expertise, and what makes you unique as a healthcare professional..."
                          className="input-medical resize-none"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          This information will be visible to other medical
                          professionals on the platform.
                        </p>
                      </div>

                      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="btn-ghost-enhanced"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading}
                          className={`btn-medical ${
                            loading ? "opacity-75 cursor-not-allowed" : ""
                          }`}
                        >
                          {loading ? (
                            <>
                              <svg
                                className="animate-spin w-4 h-4 mr-2"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Saving...
                            </>
                          ) : (
                            "Save Changes"
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <>
                    {/* Professional Information */}
                    <div className="card-medical rounded-2xl p-8">
                      <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        Professional Information
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Email Address
                            </label>
                            <p className="text-gray-900 font-medium">
                              {user?.email}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Primary Specialty
                            </label>
                            <p className="text-gray-900 font-medium">
                              {user?.primarySpecialty || "Not specified"}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Years of Experience
                            </label>
                            <p className="text-gray-900 font-medium">
                              {user?.yearsOfExperience} years
                            </p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Account Type
                            </label>
                            <p className="text-gray-900 font-medium capitalize">
                              {user?.role} Doctor
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              Medical School
                            </label>
                            <p className="text-gray-900 font-medium">
                              {user?.medicalSchool}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500">
                              License Information
                            </label>
                            <p className="text-gray-900 font-medium">
                              {user?.medicalLicenseNumber} ({user?.licenseState}
                              )
                            </p>
                          </div>
                        </div>
                      </div>

                      {user?.bio && (
                        <div className="mt-6 pt-6 border-t border-gray-100">
                          <label className="text-sm font-medium text-gray-500">
                            Professional Bio
                          </label>
                          <p className="text-gray-900 mt-2 leading-relaxed">
                            {user?.bio}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Account Status */}
                    <div className="card-trust rounded-2xl p-8">
                      <h2 className="text-xl font-semibold text-gray-900 mb-6">
                        Account Status
                      </h2>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              user?.isVerified
                                ? "bg-green-100"
                                : "bg-yellow-100"
                            }`}
                          >
                            {user?.isVerified ? (
                              <svg
                                className="w-5 h-5 text-green-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : (
                              <svg
                                className="w-5 h-5 text-yellow-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              Verification Status
                            </p>
                            <p
                              className={`text-sm ${
                                user?.isVerified
                                  ? "text-green-600"
                                  : "text-yellow-600"
                              }`}
                            >
                              {user?.isVerified
                                ? "Verified Professional"
                                : "Verification Pending"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              user?.subscriptionStatus === "active"
                                ? "bg-green-100"
                                : "bg-red-100"
                            }`}
                          >
                            {user?.subscriptionStatus === "active" ? (
                              <svg
                                className="w-5 h-5 text-green-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : (
                              <svg
                                className="w-5 h-5 text-red-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              Subscription
                            </p>
                            <p
                              className={`text-sm capitalize ${
                                user?.subscriptionStatus === "active"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {user?.subscriptionStatus === "active"
                                ? "Active Premium"
                                : "Inactive"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-6 border-t border-gray-100 text-sm text-gray-500">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="font-medium">Member since:</span>
                            <span className="ml-2">
                              {new Date(user?.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          {user?.lastLogin && (
                            <div>
                              <span className="font-medium">Last active:</span>
                              <span className="ml-2">
                                {new Date(user?.lastLogin).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Achievements */}
                <div className="card-medical rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Achievements
                  </h3>
                  <div className="space-y-3">
                    {achievements.map((achievement, index) => (
                      <div
                        key={index}
                        className={`flex items-start space-x-3 p-3 rounded-lg ${
                          achievement.earned
                            ? "bg-green-50 border border-green-200"
                            : "bg-gray-50"
                        }`}
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            achievement.earned ? "bg-green-500" : "bg-gray-300"
                          }`}
                        >
                          {achievement.earned ? (
                            <svg
                              className="w-4 h-4 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm font-medium ${
                              achievement.earned
                                ? "text-green-900"
                                : "text-gray-700"
                            }`}
                          >
                            {achievement.title}
                          </p>
                          <p
                            className={`text-xs ${
                              achievement.earned
                                ? "text-green-600"
                                : "text-gray-500"
                            }`}
                          >
                            {achievement.description}
                          </p>
                          {achievement.earned && (
                            <p className="text-xs text-green-500 mt-1">
                              Earned{" "}
                              {new Date(achievement.date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="card-trust rounded-2xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Quick Actions
                  </h3>
                  <div className="space-y-2">
                    <Link
                      to="/change-password"
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <svg
                          className="w-5 h-5 text-gray-500 group-hover:text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          />
                        </svg>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                          Change Password
                        </span>
                      </div>
                      <svg
                        className="w-4 h-4 text-gray-400 group-hover:text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>

                    <Link
                      to="/subscription"
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <svg
                          className="w-5 h-5 text-gray-500 group-hover:text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                          />
                        </svg>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                          Manage Subscription
                        </span>
                      </div>
                      <svg
                        className="w-4 h-4 text-gray-400 group-hover:text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>

                    <button className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors group">
                      <div className="flex items-center space-x-3">
                        <svg
                          className="w-5 h-5 text-gray-500 group-hover:text-green-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                        <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                          Download Data
                        </span>
                      </div>
                      <svg
                        className="w-4 h-4 text-gray-400 group-hover:text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "credentials" && (
            <div className="card-medical rounded-2xl p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Medical Credentials
              </h2>
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p className="text-gray-500">
                  Credentials management coming soon
                </p>
              </div>
            </div>
          )}

          {activeTab === "activity" && (
            <div className="card-medical rounded-2xl p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Activity History
              </h2>
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <p className="text-gray-500">Activity tracking coming soon</p>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="card-medical rounded-2xl p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                Account Settings
              </h2>
              <div className="text-center py-12">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <p className="text-gray-500">Advanced settings coming soon</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;
