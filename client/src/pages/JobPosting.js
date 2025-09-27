import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Eye,
  Plus,
  X,
  DollarSign,
  Clock,
  MapPin,
  FileText,
  Star,
  AlertCircle,
  CheckCircle,
  Calendar,
  Users,
  Briefcase,
  Target,
  Settings,
  Upload,
  Award,
  Globe,
  Shield,
  Zap,
  BookOpen,
  Building,
  Mail,
  Phone,
  Camera,
  Send,
} from "lucide-react";

const JobPosting = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { jobId } = useParams();
  const isEditing = !!jobId;

  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState({});

  // Auto-save state
  const [lastSaved, setLastSaved] = useState(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Job form data with comprehensive structure
  const [jobData, setJobData] = useState({
    // Basic Information
    title: "",
    category: "",
    description: "",
    specialty: "",
    subspecialties: [],

    // Requirements
    experienceLevel: "",
    requiredSkills: [],
    certifications: [],
    languages: [],
    educationLevel: "",

    // Budget & Timeline
    budgetType: "fixed", // fixed, hourly, milestone
    budgetAmount: "",
    budgetMin: "",
    budgetMax: "",
    timeline: "",
    startDate: "",
    deadline: "",
    expectedDuration: "",
    hoursPerWeek: "",

    // Preferences & Settings
    locationPreference: "remote",
    timezonePreference: "",
    equipmentProvided: false,
    trainingProvided: false,

    // Matching Settings
    autoMatch: true,
    visibility: "public", // public, verified_only, invitation_only
    featured: false,
    applicationDeadline: "",

    // Additional Details
    responsibilities: [],
    benefits: [],
    attachments: [],
    screeningQuestions: [],

    // Contact & Company Info
    contactEmail: user?.email || "",
    contactPhone: user?.phone || "",
    companyInfo: {
      name: "",
      description: "",
      website: "",
      size: "",
      location: "",
    },
  });

  // Form validation schemas
  const validationSchema = {
    1: {
      title: { required: true, minLength: 10, maxLength: 100 },
      category: { required: true },
      description: { required: true, minLength: 100 },
      specialty: { required: true },
    },
    2: {
      experienceLevel: { required: true },
      requiredSkills: { required: true, minLength: 1 },
    },
    3: {
      budgetType: { required: true },
      budgetAmount: { required: true, min: 1 },
    },
    4: {
      locationPreference: { required: true },
    },
    5: {}, // Review step - no additional validation
  };

  // Static data
  const categories = [
    "Consultation",
    "Second Opinion",
    "Chart Review",
    "Research Support",
    "Medical Writing",
    "Teaching/Training",
    "Administrative Support",
    "Telemedicine",
    "Emergency Coverage",
    "Other",
  ];

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
    "Anesthesiology",
    "Pathology",
    "Oncology",
    "Pulmonology",
    "Gastroenterology",
    "Endocrinology",
    "Rheumatology",
    "Nephrology",
    "Other",
  ];

  const experienceLevels = [
    {
      value: "entry",
      label: "Entry Level (0-2 years)",
      desc: "Recent graduates or early career",
    },
    {
      value: "mid",
      label: "Mid Level (3-7 years)",
      desc: "Established practice experience",
    },
    {
      value: "senior",
      label: "Senior Level (8-15 years)",
      desc: "Extensive clinical experience",
    },
    {
      value: "expert",
      label: "Expert Level (15+ years)",
      desc: "Recognized expertise and leadership",
    },
  ];

  const timelineOptions = [
    {
      value: "urgent",
      label: "Urgent (within 24 hours)",
      desc: "Immediate need",
    },
    {
      value: "short",
      label: "Short-term (1-7 days)",
      desc: "Quick turnaround",
    },
    {
      value: "medium",
      label: "Medium-term (1-4 weeks)",
      desc: "Standard timeline",
    },
    {
      value: "long",
      label: "Long-term (1+ months)",
      desc: "Extended engagement",
    },
    {
      value: "ongoing",
      label: "Ongoing/Recurring",
      desc: "Continuous collaboration",
    },
  ];

  // Steps configuration
  const steps = [
    {
      number: 1,
      title: "Basic Information",
      description: "Job title, category, and description",
      icon: FileText,
    },
    {
      number: 2,
      title: "Requirements",
      description: "Skills, experience, and qualifications",
      icon: Target,
    },
    {
      number: 3,
      title: "Budget & Timeline",
      description: "Payment structure and project timeline",
      icon: DollarSign,
    },
    {
      number: 4,
      title: "Preferences & Settings",
      description: "Location, matching, and visibility settings",
      icon: Settings,
    },
    {
      number: 5,
      title: "Review & Publish",
      description: "Final review before publishing",
      icon: Eye,
    },
  ];

  // Load existing job data if editing
  useEffect(() => {
    if (isEditing) {
      loadJobData();
    }
  }, [jobId, isEditing]);

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges) {
      const timer = setTimeout(() => {
        saveDraft();
      }, 30000); // Auto-save every 30 seconds

      return () => clearTimeout(timer);
    }
  }, [jobData, hasUnsavedChanges]);

  // Handle beforeunload for unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const loadJobData = async () => {
    try {
      setLoading(true);
      // API call would be here to load existing job data
      await new Promise((resolve) => setTimeout(resolve, 1000));
      // setJobData(existingJobData);
    } catch (err) {
      setError("Failed to load job data");
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes with validation
  const handleInputChange = (field, value) => {
    setJobData((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasUnsavedChanges(true);

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: null,
      }));
    }
  };

  // Handle nested input changes
  const handleNestedInputChange = (section, field, value) => {
    setJobData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    setHasUnsavedChanges(true);
  };

  // Handle array fields
  const addArrayItem = (field, item) => {
    if (item && !jobData[field].includes(item)) {
      setJobData((prev) => ({
        ...prev,
        [field]: [...prev[field], item],
      }));
      setHasUnsavedChanges(true);
    }
  };

  const removeArrayItem = (field, index) => {
    setJobData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
    setHasUnsavedChanges(true);
  };

  // Validation functions
  const validateField = (field, value, rules) => {
    const errors = [];

    if (
      rules.required &&
      (!value || (Array.isArray(value) && value.length === 0))
    ) {
      errors.push(`${field} is required`);
    }

    if (rules.minLength && value && value.length < rules.minLength) {
      errors.push(`${field} must be at least ${rules.minLength} characters`);
    }

    if (rules.maxLength && value && value.length > rules.maxLength) {
      errors.push(
        `${field} must be no more than ${rules.maxLength} characters`
      );
    }

    if (rules.min && value && Number(value) < rules.min) {
      errors.push(`${field} must be at least ${rules.min}`);
    }

    return errors;
  };

  const validateStep = (step) => {
    const stepRules = validationSchema[step];
    const errors = {};
    let isValid = true;

    Object.keys(stepRules).forEach((field) => {
      const fieldErrors = validateField(
        field,
        jobData[field],
        stepRules[field]
      );
      if (fieldErrors.length > 0) {
        errors[field] = fieldErrors[0];
        isValid = false;
      }
    });

    setValidationErrors(errors);
    return isValid;
  };

  // Navigation between steps
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 5));
      setError("");
    } else {
      setError("Please fix the validation errors before continuing.");
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError("");
  };

  const goToStep = (step) => {
    if (step <= currentStep || validateStep(currentStep)) {
      setCurrentStep(step);
      setError("");
    }
  };

  // Save as draft
  const saveDraft = async () => {
    setSaving(true);
    try {
      // API call to save draft
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      setSuccess("Draft saved successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to save draft");
    } finally {
      setSaving(false);
    }
  };

  // Submit job posting
  const submitJob = async () => {
    if (!validateAllSteps()) return;

    setLoading(true);
    try {
      // API call to submit job
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSuccess("Job posted successfully!");
      setHasUnsavedChanges(false);
      setTimeout(() => {
        navigate("/jobs/manage");
      }, 2000);
    } catch (err) {
      setError("Failed to post job");
    } finally {
      setLoading(false);
    }
  };

  const validateAllSteps = () => {
    for (let step = 1; step <= 4; step++) {
      if (!validateStep(step)) {
        setCurrentStep(step);
        return false;
      }
    }
    return true;
  };

  // Step indicator component
  const StepIndicator = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.number;
          const isCompleted = currentStep > step.number;
          const isAccessible =
            step.number <= currentStep || validateStep(currentStep);

          return (
            <div key={step.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <button
                  onClick={() => isAccessible && goToStep(step.number)}
                  disabled={!isAccessible}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
                    isCompleted
                      ? "bg-green-500 text-white shadow-lg"
                      : isActive
                      ? "bg-blue-600 text-white shadow-lg scale-110"
                      : isAccessible
                      ? "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105"
                      : "bg-gray-50 text-gray-300 cursor-not-allowed"
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    <Icon className="w-6 h-6" />
                  )}
                </button>
                <div className="mt-3 text-center max-w-24">
                  <p
                    className={`text-sm font-medium ${
                      isActive
                        ? "text-blue-600"
                        : isCompleted
                        ? "text-green-600"
                        : "text-gray-500"
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {step.description}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.number ? "bg-green-500" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // Form field components
  const FormField = ({ label, required, error, children, description }) => (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {description && <p className="text-xs text-gray-500">{description}</p>}
      {error && (
        <p className="text-sm text-red-600 flex items-center space-x-1">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );

  const TagInput = ({
    value,
    onChange,
    onAdd,
    placeholder,
    suggestions = [],
  }) => {
    const [inputValue, setInputValue] = useState("");

    const handleKeyPress = (e) => {
      if (e.key === "Enter" && inputValue.trim()) {
        e.preventDefault();
        onAdd(inputValue.trim());
        setInputValue("");
      }
    };

    return (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2 mb-3">
          {value.map((item, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center space-x-2"
            >
              <span>{item}</span>
              <button
                onClick={() => onChange(value.filter((_, i) => i !== index))}
                className="hover:bg-blue-200 rounded-full p-1"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={() => {
              if (inputValue.trim()) {
                onAdd(inputValue.trim());
                setInputValue("");
              }
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-xs text-gray-500">Suggestions:</span>
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onAdd(suggestion)}
                className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  // Step 1: Basic Information
  const BasicInformationStep = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Basic Information
        </h2>
        <p className="text-gray-600">
          Provide essential details about your job posting
        </p>
      </div>

      <div className="space-y-6">
        <FormField
          label="Job Title"
          required
          error={validationErrors.title}
          description="Create a clear, specific title that describes the role"
        >
          <input
            type="text"
            value={jobData.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationErrors.title ? "border-red-300" : "border-gray-300"
            }`}
            placeholder="e.g., Cardiology Consultation Support"
            maxLength={100}
          />
          <div className="text-xs text-gray-500 text-right">
            {jobData.title.length}/100 characters
          </div>
        </FormField>

        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            label="Category"
            required
            error={validationErrors.category}
            description="Select the type of work needed"
          >
            <select
              value={jobData.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.category ? "border-red-300" : "border-gray-300"
              }`}
            >
              <option value="">Select Category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </FormField>

          <FormField
            label="Primary Specialty"
            required
            error={validationErrors.specialty}
            description="Main medical specialty for this position"
          >
            <select
              value={jobData.specialty}
              onChange={(e) => handleInputChange("specialty", e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.specialty
                  ? "border-red-300"
                  : "border-gray-300"
              }`}
            >
              <option value="">Select Specialty</option>
              {specialties.map((specialty) => (
                <option key={specialty} value={specialty}>
                  {specialty}
                </option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField
          label="Job Description"
          required
          error={validationErrors.description}
          description="Detailed description of the project, requirements, and expectations (minimum 100 characters)"
        >
          <textarea
            value={jobData.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
            rows={8}
            className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              validationErrors.description
                ? "border-red-300"
                : "border-gray-300"
            }`}
            placeholder="Describe the project requirements, expectations, deliverables, and any specific details..."
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>
              {jobData.description.length >= 100 ? "✓" : "⚠️"}{" "}
              {jobData.description.length}/100 characters minimum
            </span>
            <span>{jobData.description.length}/2000 characters</span>
          </div>
        </FormField>

        <FormField
          label="Subspecialties"
          description="Additional specialties that would be beneficial (optional)"
        >
          <TagInput
            value={jobData.subspecialties}
            onChange={(newSubspecialties) =>
              handleInputChange("subspecialties", newSubspecialties)
            }
            onAdd={(subspecialty) =>
              addArrayItem("subspecialties", subspecialty)
            }
            placeholder="Add subspecialty (e.g., Interventional Cardiology)"
            suggestions={[
              "Interventional Cardiology",
              "Pediatric Cardiology",
              "Nuclear Cardiology",
              "Cardiac Electrophysiology",
            ]}
          />
        </FormField>

        <FormField
          label="Key Responsibilities"
          description="Main tasks and duties for this role"
        >
          <TagInput
            value={jobData.responsibilities}
            onChange={(newResponsibilities) =>
              handleInputChange("responsibilities", newResponsibilities)
            }
            onAdd={(responsibility) =>
              addArrayItem("responsibilities", responsibility)
            }
            placeholder="Add responsibility (e.g., Review patient charts)"
            suggestions={[
              "Patient consultation",
              "Chart review",
              "Case analysis",
              "Treatment planning",
              "Second opinions",
            ]}
          />
        </FormField>
      </div>
    </div>
  );

  // Step 2: Requirements
  const RequirementsStep = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Requirements & Qualifications
        </h2>
        <p className="text-gray-600">
          Define the skills and experience needed for this role
        </p>
      </div>

      <div className="space-y-8">
        <FormField
          label="Experience Level Required"
          required
          error={validationErrors.experienceLevel}
          description="Select the minimum experience level needed"
        >
          <div className="space-y-3">
            {experienceLevels.map((level) => (
              <label
                key={level.value}
                className={`flex items-start space-x-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  jobData.experienceLevel === level.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="experienceLevel"
                  value={level.value}
                  checked={jobData.experienceLevel === level.value}
                  onChange={(e) =>
                    handleInputChange("experienceLevel", e.target.value)
                  }
                  className="w-4 h-4 text-blue-600 mt-1"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{level.label}</p>
                  <p className="text-sm text-gray-600">{level.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </FormField>

        <FormField
          label="Required Skills"
          required
          error={validationErrors.requiredSkills}
          description="Essential skills and expertise needed (minimum 1 required)"
        >
          <TagInput
            value={jobData.requiredSkills}
            onChange={(newSkills) =>
              handleInputChange("requiredSkills", newSkills)
            }
            onAdd={(skill) => addArrayItem("requiredSkills", skill)}
            placeholder="Add required skill (e.g., Echocardiography)"
            suggestions={[
              "Echocardiography",
              "Cardiac Catheterization",
              "Clinical Assessment",
              "Patient Communication",
              "Medical Documentation",
            ]}
          />
        </FormField>

        <FormField
          label="Required Certifications"
          description="Board certifications or licenses required (optional)"
        >
          <TagInput
            value={jobData.certifications}
            onChange={(newCertifications) =>
              handleInputChange("certifications", newCertifications)
            }
            onAdd={(certification) =>
              addArrayItem("certifications", certification)
            }
            placeholder="Add certification requirement (e.g., Board Certified in Cardiology)"
            suggestions={[
              "Board Certified in Cardiology",
              "ACLS Certification",
              "Medical License",
              "DEA Registration",
            ]}
          />
        </FormField>

        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            label="Education Level"
            description="Minimum education requirement"
          >
            <select
              value={jobData.educationLevel}
              onChange={(e) =>
                handleInputChange("educationLevel", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">No specific requirement</option>
              <option value="md">Doctor of Medicine (MD)</option>
              <option value="do">Doctor of Osteopathic Medicine (DO)</option>
              <option value="phd">PhD in Medical Science</option>
              <option value="residency">Completed Residency</option>
              <option value="fellowship">Completed Fellowship</option>
            </select>
          </FormField>

          <FormField
            label="Language Requirements"
            description="Languages that should be spoken"
          >
            <TagInput
              value={jobData.languages}
              onChange={(newLanguages) =>
                handleInputChange("languages", newLanguages)
              }
              onAdd={(language) => addArrayItem("languages", language)}
              placeholder="Add language (e.g., Spanish)"
              suggestions={[
                "Spanish",
                "French",
                "German",
                "Mandarin",
                "Portuguese",
                "Arabic",
              ]}
            />
          </FormField>
        </div>
      </div>
    </div>
  );

  // Step 3: Budget & Timeline
  const BudgetTimelineStep = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Budget & Timeline
        </h2>
        <p className="text-gray-600">
          Set compensation and project timeline details
        </p>
      </div>

      <div className="space-y-8">
        <FormField
          label="Budget Type"
          required
          error={validationErrors.budgetType}
          description="Choose how you want to structure payments"
        >
          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                value: "fixed",
                label: "Fixed Price",
                desc: "One-time payment for the entire project",
                icon: Target,
              },
              {
                value: "hourly",
                label: "Hourly Rate",
                desc: "Payment based on hours worked",
                icon: Clock,
              },
              {
                value: "milestone",
                label: "Milestone-based",
                desc: "Payments tied to project milestones",
                icon: Award,
              },
            ].map((type) => {
              const Icon = type.icon;
              return (
                <label
                  key={type.value}
                  className={`p-6 border-2 rounded-lg cursor-pointer transition-all ${
                    jobData.budgetType === type.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="budgetType"
                    value={type.value}
                    checked={jobData.budgetType === type.value}
                    onChange={(e) =>
                      handleInputChange("budgetType", e.target.value)
                    }
                    className="sr-only"
                  />
                  <div className="text-center">
                    <Icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                    <p className="font-semibold text-gray-900 mb-2">
                      {type.label}
                    </p>
                    <p className="text-sm text-gray-600">{type.desc}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </FormField>

        <FormField
          label="Budget Amount"
          required
          error={validationErrors.budgetAmount}
          description={
            jobData.budgetType === "hourly"
              ? "Enter your hourly rate in USD. Typical rates: $50-200/hour"
              : jobData.budgetType === "milestone"
              ? "Enter total project value to be paid across milestones"
              : "Enter the total fixed amount for the entire project"
          }
        >
          <div className="relative">
            <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input
              type="number"
              value={jobData.budgetAmount}
              onChange={(e) =>
                handleInputChange("budgetAmount", e.target.value)
              }
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.budgetAmount
                  ? "border-red-300"
                  : "border-gray-300"
              }`}
              placeholder={jobData.budgetType === "hourly" ? "75" : "2500"}
              min="1"
              step={jobData.budgetType === "hourly" ? "5" : "100"}
            />
          </div>
          {jobData.budgetType === "hourly" && (
            <div className="text-sm text-gray-500 mt-2">
              <div className="flex justify-between">
                <span>Entry level: $25-50/hour</span>
                <span>Expert level: $100-200/hour</span>
              </div>
            </div>
          )}
        </FormField>

        {/* Budget Range for flexible pricing */}
        {jobData.budgetType !== "hourly" && (
          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              label="Minimum Budget"
              description="Minimum acceptable amount"
            >
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={jobData.budgetMin}
                  onChange={(e) =>
                    handleInputChange("budgetMin", e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="2000"
                />
              </div>
            </FormField>

            <FormField
              label="Maximum Budget"
              description="Maximum you're willing to pay"
            >
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="number"
                  value={jobData.budgetMax}
                  onChange={(e) =>
                    handleInputChange("budgetMax", e.target.value)
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="5000"
                />
              </div>
            </FormField>
          </div>
        )}

        <FormField
          label="Project Timeline"
          required
          description="How quickly do you need this completed?"
        >
          <div className="space-y-3">
            {timelineOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-center space-x-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  jobData.timeline === option.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="timeline"
                  value={option.value}
                  checked={jobData.timeline === option.value}
                  onChange={(e) =>
                    handleInputChange("timeline", e.target.value)
                  }
                  className="w-4 h-4 text-blue-600"
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{option.label}</p>
                  <p className="text-sm text-gray-600">{option.desc}</p>
                </div>
              </label>
            ))}
          </div>
        </FormField>

        <div className="grid md:grid-cols-2 gap-6">
          <FormField
            label="Preferred Start Date"
            description="When would you like to begin?"
          >
            <input
              type="date"
              value={jobData.startDate}
              onChange={(e) => handleInputChange("startDate", e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>

          <FormField
            label="Project Deadline"
            description="Final completion date"
          >
            <input
              type="date"
              value={jobData.deadline}
              onChange={(e) => handleInputChange("deadline", e.target.value)}
              min={jobData.startDate || new Date().toISOString().split("T")[0]}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </FormField>
        </div>

        {jobData.budgetType === "hourly" && (
          <div className="grid md:grid-cols-2 gap-6">
            <FormField
              label="Expected Hours per Week"
              description="Estimated weekly time commitment"
            >
              <input
                type="number"
                value={jobData.hoursPerWeek}
                onChange={(e) =>
                  handleInputChange("hoursPerWeek", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="10"
                min="1"
                max="40"
              />
            </FormField>

            <FormField
              label="Expected Duration"
              description="How long will the project last?"
            >
              <select
                value={jobData.expectedDuration}
                onChange={(e) =>
                  handleInputChange("expectedDuration", e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select duration</option>
                <option value="1-2 weeks">1-2 weeks</option>
                <option value="3-4 weeks">3-4 weeks</option>
                <option value="1-2 months">1-2 months</option>
                <option value="3-6 months">3-6 months</option>
                <option value="6+ months">6+ months</option>
                <option value="ongoing">Ongoing</option>
              </select>
            </FormField>
          </div>
        )}
      </div>
    </div>
  );

  // Step 4: Preferences & Settings
  const PreferencesStep = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Preferences & Settings
        </h2>
        <p className="text-gray-600">
          Configure location, matching, and visibility settings
        </p>
      </div>

      <div className="space-y-8">
        <FormField
          label="Work Location"
          required
          description="Where will the work be performed?"
        >
          <div className="space-y-3">
            {[
              {
                value: "remote",
                label: "Remote Only",
                desc: "Work can be done completely remotely",
                icon: Globe,
              },
              {
                value: "hybrid",
                label: "Hybrid",
                desc: "Combination of remote and in-person work",
                icon: Building,
              },
              {
                value: "onsite",
                label: "On-site Required",
                desc: "Must be able to work at specific location",
                icon: MapPin,
              },
            ].map((option) => {
              const Icon = option.icon;
              return (
                <label
                  key={option.value}
                  className={`flex items-center space-x-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    jobData.locationPreference === option.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="locationPreference"
                    value={option.value}
                    checked={jobData.locationPreference === option.value}
                    onChange={(e) =>
                      handleInputChange("locationPreference", e.target.value)
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <Icon className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className="font-medium text-gray-900">{option.label}</p>
                    <p className="text-sm text-gray-600">{option.desc}</p>
                  </div>
                </label>
              );
            })}
          </div>
        </FormField>

        {jobData.locationPreference !== "remote" && (
          <FormField
            label="Work Location Details"
            description="Specify the work location"
          >
            <input
              type="text"
              value={jobData.companyInfo.location}
              onChange={(e) =>
                handleNestedInputChange(
                  "companyInfo",
                  "location",
                  e.target.value
                )
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Los Angeles, CA or specific hospital address"
            />
          </FormField>
        )}

        <FormField
          label="Timezone Preference"
          description="Preferred timezone for collaboration"
        >
          <select
            value={jobData.timezonePreference}
            onChange={(e) =>
              handleInputChange("timezonePreference", e.target.value)
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">No preference</option>
            <option value="EST">Eastern Time (EST)</option>
            <option value="CST">Central Time (CST)</option>
            <option value="MST">Mountain Time (MST)</option>
            <option value="PST">Pacific Time (PST)</option>
            <option value="GMT">Greenwich Mean Time (GMT)</option>
            <option value="CET">Central European Time (CET)</option>
          </select>
        </FormField>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Additional Benefits & Support
          </h3>

          <div className="grid md:grid-cols-2 gap-6">
            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <Upload className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">
                    Equipment Provided
                  </p>
                  <p className="text-sm text-gray-500">
                    You will provide necessary equipment/software
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={jobData.equipmentProvided}
                onChange={(e) =>
                  handleInputChange("equipmentProvided", e.target.checked)
                }
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">Training Provided</p>
                  <p className="text-sm text-gray-500">
                    You will provide job-specific training
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={jobData.trainingProvided}
                onChange={(e) =>
                  handleInputChange("trainingProvided", e.target.checked)
                }
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Job Visibility & Matching
          </h3>

          <FormField
            label="Job Visibility"
            description="Who can see this job posting?"
          >
            <div className="space-y-3">
              {[
                {
                  value: "public",
                  label: "Public",
                  desc: "Visible to all users and search engines",
                },
                {
                  value: "verified_only",
                  label: "Verified Doctors Only",
                  desc: "Only verified medical professionals can see and apply",
                },
                {
                  value: "invitation_only",
                  label: "Invitation Only",
                  desc: "Only doctors you invite can apply",
                },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="visibility"
                    value={option.value}
                    checked={jobData.visibility === option.value}
                    onChange={(e) =>
                      handleInputChange("visibility", e.target.value)
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{option.label}</p>
                    <p className="text-sm text-gray-500">{option.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </FormField>

          <div className="grid md:grid-cols-2 gap-6">
            <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <Zap className="w-5 h-5 text-gray-500" />
                <div>
                  <p className="font-medium text-gray-900">
                    Auto-Match Candidates
                  </p>
                  <p className="text-sm text-gray-500">
                    Automatically match with qualified doctors
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={jobData.autoMatch}
                onChange={(e) =>
                  handleInputChange("autoMatch", e.target.checked)
                }
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between p-4 border border-yellow-200 rounded-lg hover:bg-yellow-50 cursor-pointer">
              <div className="flex items-center space-x-3">
                <Star className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="font-medium text-gray-900">Featured Listing</p>
                  <p className="text-sm text-gray-500">
                    Highlight your job for better visibility
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked={jobData.featured}
                onChange={(e) =>
                  handleInputChange("featured", e.target.checked)
                }
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        <FormField
          label="Application Deadline"
          description="Last date to accept applications (optional)"
        >
          <input
            type="date"
            value={jobData.applicationDeadline}
            onChange={(e) =>
              handleInputChange("applicationDeadline", e.target.value)
            }
            min={new Date().toISOString().split("T")[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </FormField>

        <FormField
          label="Screening Questions"
          description="Optional questions for applicants to answer"
        >
          <TagInput
            value={jobData.screeningQuestions}
            onChange={(newQuestions) =>
              handleInputChange("screeningQuestions", newQuestions)
            }
            onAdd={(question) => addArrayItem("screeningQuestions", question)}
            placeholder="Add a screening question"
            suggestions={[
              "What is your experience with this specialty?",
              "Are you available for the proposed timeline?",
              "What is your approach to this type of work?",
            ]}
          />
        </FormField>
      </div>
    </div>
  );

  // Step 5: Review & Publish
  const ReviewStep = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Review & Publish
        </h2>
        <p className="text-gray-600">
          Review your job posting before publishing
        </p>
      </div>

      <div className="space-y-8">
        {/* Job Preview */}
        <div className="border border-gray-200 rounded-lg p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {jobData.title || "Untitled Job"}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                <span className="flex items-center space-x-1">
                  <Briefcase className="w-4 h-4" />
                  <span>{jobData.category || "No category"}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Star className="w-4 h-4" />
                  <span>{jobData.specialty || "No specialty"}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{jobData.timeline || "No timeline"}</span>
                </span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {jobData.budgetAmount ? (
                  <>
                    ${Number(jobData.budgetAmount).toLocaleString()}
                    {jobData.budgetType === "hourly" && "/hr"}
                    {jobData.budgetType === "milestone" && " total"}
                  </>
                ) : (
                  "Budget not set"
                )}
              </div>
              <p className="text-sm text-gray-500 capitalize">
                {jobData.budgetType} {jobData.budgetType && "payment"}
              </p>
            </div>
          </div>

          <div className="prose max-w-none mb-6">
            <p className="text-gray-700">
              {jobData.description || "No description provided"}
            </p>
          </div>

          {/* Requirements Summary */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Requirements</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>
                    Experience: {jobData.experienceLevel || "Not specified"}
                  </span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Skills: {jobData.requiredSkills.length} required</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Location: {jobData.locationPreference}</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">
                Project Details
              </h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span>Timeline: {jobData.timeline || "Not specified"}</span>
                </li>
                {jobData.startDate && (
                  <li className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>
                      Start: {new Date(jobData.startDate).toLocaleDateString()}
                    </span>
                  </li>
                )}
                {jobData.deadline && (
                  <li className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-500" />
                    <span>
                      Deadline:{" "}
                      {new Date(jobData.deadline).toLocaleDateString()}
                    </span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Skills Tags */}
          {jobData.requiredSkills.length > 0 && (
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">
                Required Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {jobData.requiredSkills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Validation Checklist */}
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Publishing Checklist
          </h3>
          <div className="space-y-3">
            {[
              {
                check: jobData.title.length >= 10,
                text: "Job title is descriptive (10+ characters)",
              },
              { check: jobData.category, text: "Category is selected" },
              {
                check: jobData.description.length >= 100,
                text: "Description is comprehensive (100+ characters)",
              },
              { check: jobData.specialty, text: "Specialty is specified" },
              {
                check: jobData.experienceLevel,
                text: "Experience level is defined",
              },
              {
                check: jobData.requiredSkills.length > 0,
                text: "Required skills are listed",
              },
              {
                check: jobData.budgetType && jobData.budgetAmount,
                text: "Budget details are complete",
              },
              { check: jobData.timeline, text: "Timeline is specified" },
            ].map((item, index) => (
              <div key={index} className="flex items-center space-x-3">
                {item.check ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-500" />
                )}
                <span
                  className={`text-sm ${
                    item.check ? "text-green-700" : "text-red-600"
                  }`}
                >
                  {item.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">
            Contact Information
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-1">
                Contact Email
              </label>
              <div className="flex">
                <Mail className="w-5 h-5 text-blue-600 mt-2 mr-2" />
                <input
                  type="email"
                  value={jobData.contactEmail}
                  onChange={(e) =>
                    handleInputChange("contactEmail", e.target.value)
                  }
                  className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-800 mb-1">
                Contact Phone (Optional)
              </label>
              <div className="flex">
                <Phone className="w-5 h-5 text-blue-600 mt-2 mr-2" />
                <input
                  type="tel"
                  value={jobData.contactPhone}
                  onChange={(e) =>
                    handleInputChange("contactPhone", e.target.value)
                  }
                  className="flex-1 px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Final Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            {lastSaved && <p>Last saved: {lastSaved.toLocaleTimeString()}</p>}
            {hasUnsavedChanges && (
              <p className="text-orange-600">You have unsaved changes</p>
            )}
          </div>

          <div className="flex space-x-4">
            <button
              onClick={saveDraft}
              disabled={saving}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : "Save Draft"}</span>
            </button>

            <button
              onClick={submitJob}
              disabled={loading || !validateAllSteps()}
              className="flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Publishing...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>{isEditing ? "Update Job" : "Publish Job"}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate("/jobs/manage")}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Job Management</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              {isEditing ? "Edit Job Posting" : "Create Job Posting"}
            </h1>
            <p className="text-gray-600 mt-2">
              {isEditing
                ? "Update your job posting details"
                : "Find the perfect medical professional for your needs"}
            </p>
          </div>

          {/* Auto-save indicator */}
          {lastSaved && (
            <div className="text-right text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Draft saved at {lastSaved.toLocaleTimeString()}</span>
              </div>
            </div>
          )}
        </div>

        {/* Error/Success Messages */}
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
            <div className="bg-white rounded-lg p-8 flex items-center space-x-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="text-gray-700 font-medium">
                Processing your job posting...
              </span>
            </div>
          </div>
        )}

        <StepIndicator />

        {/* Step Content */}
        <div className="transition-all duration-300">
          {currentStep === 1 && <BasicInformationStep />}
          {currentStep === 2 && <RequirementsStep />}
          {currentStep === 3 && <BudgetTimelineStep />}
          {currentStep === 4 && <PreferencesStep />}
          {currentStep === 5 && <ReviewStep />}
        </div>

        {/* Navigation */}
        {currentStep < 5 && (
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex space-x-4">
              <button
                onClick={saveDraft}
                disabled={saving}
                className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Saving..." : "Save Draft"}</span>
              </button>

              <button
                onClick={nextStep}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobPosting;
