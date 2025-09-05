import React, { useState, useEffect, useRef } from "react";
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
  ChevronDown,
  ChevronUp,
  DragHandleDots2,
  Image,
  FileCheck,
  Target,
  BookOpen,
  GraduationCap,
  Building,
  Phone,
  Mail,
  Lock,
  Unlock,
  Download,
  Filter,
  Search,
  BarChart3,
} from "lucide-react";

const ProfileManager = () => {
  // Main state management
  const [profile, setProfile] = useState({
    firstName: "Dr. Sarah",
    lastName: "Johnson",
    displayName: "Dr. Sarah Johnson, MD",
    email: "sarah.johnson@hospital.com",
    phone: "+1 (555) 123-4567",
    primarySpecialty: "Cardiology",
    subspecialties: ["Interventional Cardiology", "Heart Failure"],
    bio: "Experienced cardiologist with over 15 years of practice. Specialized in interventional procedures and complex cardiac cases.",
    yearsOfExperience: 15,
    medicalLicenseNumber: "MD12345678",
    licenseState: "California",
    location: { city: "Los Angeles", state: "CA", country: "United States" },
    profilePhoto: { url: null, publicId: null },
    verificationStatus: { overall: "verified" },
    rating: { average: 4.8, count: 127 },
    profileCompletion: { percentage: 85 },
    experiences: [
      {
        _id: "1",
        title: "Senior Cardiologist",
        institution: "UCLA Medical Center",
        location: "Los Angeles, CA",
        startDate: "2015-01-01",
        current: true,
        type: "employment",
        description: "Leading interventional cardiology department",
      },
      {
        _id: "2",
        title: "Cardiology Fellow",
        institution: "Mayo Clinic",
        location: "Rochester, MN",
        startDate: "2012-07-01",
        endDate: "2015-01-01",
        type: "fellowship",
        description: "Advanced training in interventional cardiology",
      },
    ],
    skills: [
      {
        name: "Cardiac Catheterization",
        category: "clinical",
        proficiencyLevel: "expert",
        yearsOfExperience: 12,
      },
      {
        name: "Echocardiography",
        category: "clinical",
        proficiencyLevel: "expert",
        yearsOfExperience: 15,
      },
      {
        name: "Research Methods",
        category: "research",
        proficiencyLevel: "advanced",
        yearsOfExperience: 10,
      },
    ],
    certifications: [
      {
        _id: "1",
        name: "Board Certification in Cardiology",
        issuingOrganization: "American Board of Internal Medicine",
        issueDate: "2010-06-01",
        verified: true,
      },
    ],
    documents: [
      {
        _id: "1",
        type: "medical_license",
        name: "Medical License",
        verified: true,
      },
      { _id: "2", type: "cv_resume", name: "CV_Johnson.pdf", verified: true },
    ],
    analytics: {
      views: { total: 1250, thisMonth: 85, thisWeek: 23 },
      contactAttempts: { total: 45, thisMonth: 8 },
    },
    privacy: {
      profileVisibility: "members_only",
      showEmail: false,
      showPhone: false,
    },
  });

  const [activeTab, setActiveTab] = useState("overview");
  const [editMode, setEditMode] = useState({});
  const [formData, setFormData] = useState(profile);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [draggedItem, setDraggedItem] = useState(null);
  const fileInputRef = useRef(null);

  // Tab configuration
  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "skills", label: "Skills & Certifications", icon: Award },
    { id: "documents", label: "Documents", icon: FileText },
    { id: "availability", label: "Availability", icon: Clock },
    { id: "privacy", label: "Privacy & Settings", icon: Shield },
    { id: "analytics", label: "Analytics", icon: BarChart3 },
  ];

  const handleInputChange = (field, value, section = null) => {
    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: { ...prev[section], [field]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const toggleEditMode = (section) => {
    setEditMode((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const saveSection = async (section) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setProfile({ ...formData });
      setSuccess(`${section} updated successfully!`);
      setEditMode((prev) => ({ ...prev, [section]: false }));
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(`Error updating ${section}`);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event, type) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    // Simulate file upload
    setTimeout(() => {
      if (type === "photo") {
        const photoUrl = URL.createObjectURL(file);
        setProfile((prev) => ({
          ...prev,
          profilePhoto: { url: photoUrl, publicId: "temp_id" },
        }));
        setSuccess("Profile photo updated successfully!");
      } else {
        const newDoc = {
          _id: Date.now().toString(),
          type: "other",
          name: file.name,
          verified: false,
        };
        setProfile((prev) => ({
          ...prev,
          documents: [...prev.documents, newDoc],
        }));
        setSuccess("Document uploaded successfully!");
      }
      setLoading(false);
      setTimeout(() => setSuccess(""), 3000);
    }, 2000);
  };

  // Profile Header Component
  const ProfileHeader = () => (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-xl shadow-lg p-8 mb-8">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-8">
          {/* Profile Photo with Upload */}
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-xl">
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
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e, "photo")}
                className="hidden"
              />
            </label>
          </div>

          {/* Basic Info */}
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-3">
              <h1 className="text-4xl font-bold">{profile.displayName}</h1>
              {profile.verificationStatus?.overall === "verified" && (
                <CheckCircle className="w-7 h-7 text-green-400" />
              )}
            </div>
            <p className="text-xl text-blue-100 font-medium mb-3">
              {profile.primarySpecialty}
            </p>
            <div className="flex items-center space-x-6 text-blue-100">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5" />
                <span>
                  {profile.location?.city}, {profile.location?.state}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5" />
                <span>{profile.yearsOfExperience} years experience</span>
              </div>
              {profile.rating?.average > 0 && (
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-300 fill-current" />
                  <span>
                    {profile.rating.average} ({profile.rating.count} reviews)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Completion */}
        <div className="text-right bg-white bg-opacity-10 rounded-lg p-4">
          <div className="mb-2">
            <span className="text-sm text-blue-100">Profile Completion</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-32 bg-blue-200 bg-opacity-30 rounded-full h-3">
              <div
                className="bg-green-400 h-3 rounded-full transition-all duration-300"
                style={{
                  width: `${profile.profileCompletion?.percentage || 0}%`,
                }}
              />
            </div>
            <span className="text-2xl font-bold text-green-300">
              {profile.profileCompletion?.percentage || 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  // Tab Navigation
  const TabNavigation = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
      <div className="flex overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-3 px-8 py-5 whitespace-nowrap border-b-3 font-semibold text-sm transition-all duration-200 ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-600 bg-blue-50"
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
  const OverviewTab = () => (
    <div className="space-y-8">
      {/* Bio Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">About Me</h3>
          <button
            onClick={() => toggleEditMode("bio")}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors px-4 py-2 rounded-lg hover:bg-blue-50"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
        </div>

        {editMode.bio ? (
          <div className="space-y-4">
            <textarea
              value={formData.bio || ""}
              onChange={(e) => handleInputChange("bio", e.target.value)}
              rows={8}
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Tell other doctors about your experience, interests, and what makes you unique..."
            />
            <div className="flex space-x-3">
              <button
                onClick={() => saveSection("Bio")}
                disabled={loading}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? "Saving..." : "Save"}</span>
              </button>
              <button
                onClick={() => toggleEditMode("bio")}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="prose max-w-none">
            {profile.bio ? (
              <p className="text-gray-700 text-lg leading-relaxed">
                {profile.bio}
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">
            Contact Information
          </h3>
          <button
            onClick={() => toggleEditMode("contact")}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors px-4 py-2 rounded-lg hover:bg-blue-50"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex items-center space-x-3">
            <Mail className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700">{profile.email}</span>
            {profile.privacy?.showEmail ? (
              <Eye className="w-4 h-4 text-green-500" />
            ) : (
              <Lock className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="w-5 h-5 text-gray-400" />
            <span className="text-gray-700">{profile.phone}</span>
            {profile.privacy?.showPhone ? (
              <Eye className="w-4 h-4 text-green-500" />
            ) : (
              <Lock className="w-4 h-4 text-gray-400" />
            )}
          </div>
        </div>
      </div>

      {/* Specialties */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Specialties</h3>
          <button
            onClick={() => toggleEditMode("specialties")}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors px-4 py-2 rounded-lg hover:bg-blue-50"
          >
            <Edit className="w-4 h-4" />
            <span>Edit</span>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Primary Specialty
            </span>
            <p className="text-xl font-semibold text-gray-900 mt-1">
              {profile.primarySpecialty}
            </p>
          </div>

          <div>
            <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
              Subspecialties
            </span>
            <div className="flex flex-wrap gap-2 mt-2">
              {profile.subspecialties?.map((specialty, index) => (
                <span
                  key={index}
                  className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Experience Tab
  const ExperienceTab = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">
          Professional Experience
        </h2>
        <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-lg">
          <Plus className="w-5 h-5" />
          <span>Add Experience</span>
        </button>
      </div>

      <div className="relative">
        {/* Timeline Line */}
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-blue-200"></div>

        <div className="space-y-8">
          {profile.experiences?.map((experience, index) => (
            <div
              key={experience._id}
              className="relative bg-white rounded-xl shadow-sm border border-gray-200 p-8 ml-14"
            >
              {/* Timeline Dot */}
              <div className="absolute -left-14 top-8 w-4 h-4 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>

              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-xl font-bold text-gray-900">
                      {experience.title}
                    </h4>
                    {experience.current && (
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-lg text-blue-600 font-semibold mb-1">
                    {experience.institution}
                  </p>
                  <p className="text-gray-600 mb-2">{experience.location}</p>
                  <p className="text-gray-500 text-sm mb-4">
                    {new Date(experience.startDate).toLocaleDateString()} -
                    {experience.current
                      ? " Present"
                      : ` ${new Date(experience.endDate).toLocaleDateString()}`}
                  </p>
                  {experience.description && (
                    <p className="text-gray-700 leading-relaxed">
                      {experience.description}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg transition-colors">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Skills Tab
  const SkillsTab = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-gray-900">
          Skills & Certifications
        </h2>
        <div className="flex space-x-3">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Add Skill</span>
          </button>
          <button className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2">
            <Award className="w-5 h-5" />
            <span>Add Certification</span>
          </button>
        </div>
      </div>

      {/* Skills Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Clinical Skills
        </h3>
        <div className="grid md:grid-cols-2 gap-6">
          {profile.skills?.map((skill, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">{skill.name}</h4>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
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
              <p className="text-gray-600 text-sm mb-3">{skill.category}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {skill.yearsOfExperience} years
                </span>
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
          ))}
        </div>
      </div>

      {/* Certifications Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Certifications
        </h3>
        <div className="space-y-4">
          {profile.certifications?.map((cert) => (
            <div
              key={cert._id}
              className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-900">{cert.name}</h4>
                    {cert.verified && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <p className="text-blue-600 font-medium">
                    {cert.issuingOrganization}
                  </p>
                  <p className="text-gray-500 text-sm">
                    Issued: {new Date(cert.issueDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 p-2 hover:bg-blue-50 rounded-lg">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
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
          onClick={() => fileInputRef.current?.click()}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
        >
          <Upload className="w-5 h-5" />
          <span>Upload Document</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {profile.documents?.map((doc) => (
          <div
            key={doc._id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <FileText className="w-8 h-8 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-gray-900">{doc.name}</h4>
                  <p className="text-sm text-gray-500 capitalize">
                    {doc.type.replace("_", " ")}
                  </p>
                </div>
              </div>
              {doc.verified ? (
                <FileCheck className="w-6 h-6 text-green-500" />
              ) : (
                <Clock className="w-6 h-6 text-yellow-500" />
              )}
            </div>

            <div className="flex space-x-2">
              <button className="flex-1 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2">
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
              <button className="text-red-600 hover:text-red-800 p-2 hover:bg-red-50 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={(e) => handleFileUpload(e, "document")}
        className="hidden"
      />
    </div>
  );

  // Analytics Tab
  const AnalyticsTab = () => (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-900">Profile Analytics</h2>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Views</p>
              <p className="text-3xl font-bold">
                {profile.analytics?.views?.total}
              </p>
            </div>
            <Eye className="w-10 h-10 text-blue-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">This Month</p>
              <p className="text-3xl font-bold">
                {profile.analytics?.views?.thisMonth}
              </p>
            </div>
            <TrendingUp className="w-10 h-10 text-green-200" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Contact Attempts</p>
              <p className="text-3xl font-bold">
                {profile.analytics?.contactAttempts?.total}
              </p>
            </div>
            <Users className="w-10 h-10 text-purple-200" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Profile Performance
        </h3>
        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Profile Completeness</span>
              <span className="font-semibold">
                {profile.profileCompletion?.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${profile.profileCompletion?.percentage}%` }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600">Verification Status</span>
              <span
                className={`font-semibold ${
                  profile.verificationStatus?.overall === "verified"
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              >
                {profile.verificationStatus?.overall === "verified"
                  ? "Verified"
                  : "Pending"}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  profile.verificationStatus?.overall === "verified"
                    ? "bg-green-500"
                    : "bg-yellow-500"
                }`}
                style={{
                  width:
                    profile.verificationStatus?.overall === "verified"
                      ? "100%"
                      : "60%",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Privacy & Settings Tab
  const PrivacyTab = () => (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-900">Privacy & Settings</h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Profile Visibility
        </h3>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Who can see your profile?
            </label>
            <div className="space-y-3">
              {[
                {
                  value: "public",
                  label: "Public",
                  description: "Anyone can view your profile",
                },
                {
                  value: "members_only",
                  label: "Members Only",
                  description: "Only registered users can view",
                },
                {
                  value: "private",
                  label: "Private",
                  description: "Only you can view your profile",
                },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="profileVisibility"
                    value={option.value}
                    checked={
                      profile.privacy?.profileVisibility === option.value
                    }
                    onChange={(e) =>
                      handleInputChange(
                        "profileVisibility",
                        e.target.value,
                        "privacy"
                      )
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{option.label}</p>
                    <p className="text-sm text-gray-500">
                      {option.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="border-t pt-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">
              Contact Information Visibility
            </h4>
            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Show Email Address
                    </p>
                    <p className="text-sm text-gray-500">
                      Allow others to see your email
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={profile.privacy?.showEmail}
                  onChange={(e) =>
                    handleInputChange("showEmail", e.target.checked, "privacy")
                  }
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </label>

              <label className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">
                      Show Phone Number
                    </p>
                    <p className="text-sm text-gray-500">
                      Allow others to see your phone
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={profile.privacy?.showPhone}
                  onChange={(e) =>
                    handleInputChange("showPhone", e.target.checked, "privacy")
                  }
                  className="w-4 h-4 text-blue-600 rounded"
                />
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Account Settings
        </h3>
        <div className="space-y-6">
          <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Change Password</p>
                <p className="text-sm text-gray-500">
                  Update your account password
                </p>
              </div>
              <Settings className="w-5 h-5 text-gray-400" />
            </div>
          </button>

          <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  Two-Factor Authentication
                </p>
                <p className="text-sm text-gray-500">
                  Add an extra layer of security
                </p>
              </div>
              <Shield className="w-5 h-5 text-gray-400" />
            </div>
          </button>

          <button className="w-full text-left p-4 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-red-900">Delete Account</p>
                <p className="text-sm text-red-500">
                  Permanently delete your account
                </p>
              </div>
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  // Availability Tab
  const AvailabilityTab = () => (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold text-gray-900">
        Availability & Scheduling
      </h2>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">
          Weekly Schedule
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
          {[
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday",
          ].map((day) => (
            <div key={day} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">{day}</h4>
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 rounded"
                  defaultChecked={day !== "Saturday" && day !== "Sunday"}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="time"
                    defaultValue="09:00"
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  />
                  <span className="text-sm text-gray-500">-</span>
                  <input
                    type="time"
                    defaultValue="17:00"
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-6">Response Time</h3>
        <div className="space-y-3">
          {[
            {
              value: "immediate",
              label: "Immediate",
              description: "Usually respond within minutes",
            },
            {
              value: "within-hour",
              label: "Within 1 hour",
              description: "Respond within an hour",
            },
            {
              value: "within-day",
              label: "Within 24 hours",
              description: "Respond within a day",
            },
            {
              value: "within-week",
              label: "Within a week",
              description: "Respond within 7 days",
            },
          ].map((option) => (
            <label
              key={option.value}
              className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
            >
              <input
                type="radio"
                name="responseTime"
                value={option.value}
                defaultChecked={option.value === "within-day"}
                className="w-4 h-4 text-blue-600"
              />
              <div>
                <p className="font-medium text-gray-900">{option.label}</p>
                <p className="text-sm text-gray-500">{option.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );

  // Render current tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab />;
      case "experience":
        return <ExperienceTab />;
      case "skills":
        return <SkillsTab />;
      case "documents":
        return <DocumentsTab />;
      case "availability":
        return <AvailabilityTab />;
      case "privacy":
        return <PrivacyTab />;
      case "analytics":
        return <AnalyticsTab />;
      default:
        return <OverviewTab />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Success/Error Messages */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-400 text-red-700 p-4 rounded-lg mb-6 flex items-center">
            <AlertCircle className="w-5 h-5 mr-3" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border-l-4 border-green-400 text-green-700 p-4 rounded-lg mb-6 flex items-center">
            <CheckCircle className="w-5 h-5 mr-3" />
            {success}
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-700">Processing...</span>
            </div>
          </div>
        )}

        <ProfileHeader />
        <TabNavigation />

        <div className="transition-all duration-300">{renderTabContent()}</div>
      </div>
    </div>
  );
};

export default ProfileManager;
