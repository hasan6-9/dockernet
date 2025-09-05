import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [searchParams] = useSearchParams();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(() => {
    // Try to load saved progress from localStorage
    const savedData = localStorage.getItem("registration_progress");
    if (savedData) {
      try {
        return JSON.parse(savedData);
      } catch (e) {
        console.error("Error parsing saved registration data:", e);
      }
    }

    return {
      // Basic Information
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      role: searchParams.get("role") || "junior",

      // Medical Credentials
      medicalLicenseNumber: "",
      licenseState: "",
      primarySpecialty: "",
      subspecialties: [],
      yearsOfExperience: "",

      // Medical School Information
      medicalSchool: {
        name: "",
        graduationYear: "",
        location: "",
      },

      // Location Information
      location: {
        city: "",
        state: "",
        country: "United States",
        timezone: "America/New_York",
      },

      // Languages
      languages: [{ language: "English", proficiency: "native" }],

      // Professional Bio
      bio: "",

      // Privacy Preferences
      privacy: {
        profileVisibility: "members_only",
        showEmail: false,
        showPhone: false,
        allowDirectContact: true,
        showLastSeen: true,
      },
    };
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const { register, loading, error, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const totalSteps = 5;

  // Save progress to localStorage whenever formData changes
  useEffect(() => {
    const dataToSave = { ...formData };
    delete dataToSave.password;
    delete dataToSave.confirmPassword;
    localStorage.setItem("registration_progress", JSON.stringify(dataToSave));
  }, [formData]);

  useEffect(() => {
    if (isAuthenticated) {
      // Clear saved progress on successful registration
      localStorage.removeItem("registration_progress");
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes(".")) {
      // Handle nested objects like location.city, medicalSchool.name
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else if (name === "subspecialties") {
      // Handle subspecialties array
      const currentSubspecialties = formData.subspecialties || [];
      if (checked) {
        setFormData((prev) => ({
          ...prev,
          subspecialties: [...currentSubspecialties, value],
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          subspecialties: currentSubspecialties.filter(
            (spec) => spec !== value
          ),
        }));
      }
    } else if (name.startsWith("privacy.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        privacy: {
          ...prev.privacy,
          [field]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleLanguageChange = (index, field, value) => {
    const updatedLanguages = [...formData.languages];
    updatedLanguages[index] = { ...updatedLanguages[index], [field]: value };
    setFormData((prev) => ({ ...prev, languages: updatedLanguages }));
  };

  const addLanguage = () => {
    setFormData((prev) => ({
      ...prev,
      languages: [
        ...prev.languages,
        { language: "", proficiency: "conversational" },
      ],
    }));
  };

  const removeLanguage = (index) => {
    if (formData.languages.length > 1) {
      const updatedLanguages = formData.languages.filter((_, i) => i !== index);
      setFormData((prev) => ({ ...prev, languages: updatedLanguages }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};

    if (step === 1) {
      // Basic Information
      if (!formData.firstName.trim())
        newErrors.firstName = "First name is required";
      if (!formData.lastName.trim())
        newErrors.lastName = "Last name is required";
      if (!formData.email.trim()) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email))
        newErrors.email = "Email is invalid";

      if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
      else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone))
        newErrors.phone = "Please enter a valid phone number";

      // Password validation
      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (formData.password.length < 8) {
        newErrors.password = "Password must be at least 8 characters";
      } else if (
        !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(
          formData.password
        )
      ) {
        newErrors.password =
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)";
      }

      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
    } else if (step === 2) {
      // Medical Credentials
      if (!formData.medicalLicenseNumber.trim())
        newErrors.medicalLicenseNumber = "License number is required";
      if (!formData.licenseState.trim())
        newErrors.licenseState = "License state is required";
      if (!formData.primarySpecialty.trim())
        newErrors.primarySpecialty = "Primary specialty is required";
      if (!formData.yearsOfExperience)
        newErrors.yearsOfExperience = "Years of experience is required";
    } else if (step === 3) {
      // Medical School
      if (!formData.medicalSchool.name.trim())
        newErrors["medicalSchool.name"] = "Medical school name is required";
      if (!formData.medicalSchool.graduationYear)
        newErrors["medicalSchool.graduationYear"] =
          "Graduation year is required";
      else if (
        formData.medicalSchool.graduationYear < 1950 ||
        formData.medicalSchool.graduationYear > new Date().getFullYear()
      )
        newErrors["medicalSchool.graduationYear"] =
          "Please enter a valid graduation year";
    } else if (step === 4) {
      // Location and Languages
      if (!formData.location.city.trim())
        newErrors["location.city"] = "City is required";
      if (!formData.location.state.trim())
        newErrors["location.state"] = "State is required";

      // Validate languages
      const hasEmptyLanguage = formData.languages.some(
        (lang) => !lang.language.trim()
      );
      if (hasEmptyLanguage) {
        newErrors.languages =
          "Please fill in all language fields or remove empty ones";
      }
    } else if (step === 5) {
      // Bio and preferences - optional but validate if provided
      if (formData.bio && formData.bio.length > 2000) {
        newErrors.bio = "Bio cannot exceed 2000 characters";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep(currentStep)) return;

    setIsLoading(true);

    // Prepare data for submission
    const { confirmPassword, ...submitData } = formData;
    submitData.yearsOfExperience = parseInt(submitData.yearsOfExperience);
    submitData.medicalSchool.graduationYear = parseInt(
      submitData.medicalSchool.graduationYear
    );

    const result = await register(submitData);
    if (result.success) {
      localStorage.removeItem("registration_progress");
      navigate("/dashboard");
    }
    setIsLoading(false);
  };

  // Data arrays
  const specialties = [
    "Anesthesiology",
    "Cardiology",
    "Dermatology",
    "Emergency Medicine",
    "Endocrinology",
    "Family Medicine",
    "Gastroenterology",
    "Hematology",
    "Infectious Disease",
    "Internal Medicine",
    "Nephrology",
    "Neurology",
    "Obstetrics & Gynecology",
    "Oncology",
    "Ophthalmology",
    "Orthopedics",
    "Otolaryngology",
    "Pathology",
    "Pediatrics",
    "Psychiatry",
    "Pulmonology",
    "Radiology",
    "Rheumatology",
    "Surgery",
    "Urology",
    "Other",
  ];

  const subspecialties = [
    "Interventional Cardiology",
    "Pediatric Cardiology",
    "Cardiac Surgery",
    "Orthopedic Surgery",
    "Neurosurgery",
    "Plastic Surgery",
    "Vascular Surgery",
    "Pediatric Surgery",
    "Medical Oncology",
    "Radiation Oncology",
    "Interventional Radiology",
    "Diagnostic Radiology",
    "Nuclear Medicine",
    "Child & Adolescent Psychiatry",
    "Geriatric Medicine",
    "Sports Medicine",
    "Pain Management",
    "Critical Care Medicine",
    "Hospice & Palliative Medicine",
  ];

  const states = [
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MN",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY",
  ];

  const languages = [
    "English",
    "Spanish",
    "French",
    "German",
    "Italian",
    "Portuguese",
    "Russian",
    "Chinese (Mandarin)",
    "Chinese (Cantonese)",
    "Japanese",
    "Korean",
    "Arabic",
    "Hindi",
    "Other",
  ];

  const timezones = [
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Anchorage",
    "Pacific/Honolulu",
  ];

  const getStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Personal Information
              </h3>
              <p className="text-gray-600 text-sm">
                Let's start with your basic information
              </p>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                I am a...
              </label>
              <div className="grid grid-cols-1 gap-3">
                <label
                  className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    formData.role === "junior"
                      ? "border-green-400 bg-green-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="junior"
                    checked={formData.role === "junior"}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        formData.role === "junior"
                          ? "border-green-500 bg-green-500"
                          : "border-gray-300"
                      }`}
                    >
                      {formData.role === "junior" && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">
                          Junior Doctor
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Looking for opportunities to gain experience and work
                        with senior doctors
                      </p>
                    </div>
                  </div>
                </label>

                <label
                  className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    formData.role === "senior"
                      ? "border-blue-400 bg-blue-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="role"
                    value="senior"
                    checked={formData.role === "senior"}
                    onChange={handleChange}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        formData.role === "senior"
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {formData.role === "senior" && (
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-gray-900">
                          Senior Doctor
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        Looking to hire junior doctors and delegate medical
                        tasks
                      </p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`input-medical ${
                    errors.firstName
                      ? "border-red-400 focus:border-red-500"
                      : ""
                  }`}
                  placeholder="Enter your first name"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`input-medical ${
                    errors.lastName ? "border-red-400 focus:border-red-500" : ""
                  }`}
                  placeholder="Enter your last name"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Professional Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input-medical ${
                    errors.email ? "border-red-400 focus:border-red-500" : ""
                  }`}
                  placeholder="doctor@medicalpractice.com"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Phone Number
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`input-medical ${
                    errors.phone ? "border-red-400 focus:border-red-500" : ""
                  }`}
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className={`input-medical pr-10 ${
                      errors.password
                        ? "border-red-400 focus:border-red-500"
                        : ""
                    }`}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
                        />
                      </svg>
                    ) : (
                      <svg
                        className="h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`input-medical ${
                    errors.confirmPassword
                      ? "border-red-400 focus:border-red-500"
                      : ""
                  }`}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Medical Credentials
              </h3>
              <p className="text-gray-600 text-sm">
                Please provide your professional medical information
              </p>
            </div>

            {/* Medical License */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="medicalLicenseNumber"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Medical License Number
                </label>
                <input
                  id="medicalLicenseNumber"
                  name="medicalLicenseNumber"
                  type="text"
                  value={formData.medicalLicenseNumber}
                  onChange={handleChange}
                  className={`input-medical ${
                    errors.medicalLicenseNumber
                      ? "border-red-400 focus:border-red-500"
                      : ""
                  }`}
                  placeholder="Enter your license number"
                />
                {errors.medicalLicenseNumber && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.medicalLicenseNumber}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="licenseState"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  License State
                </label>
                <select
                  id="licenseState"
                  name="licenseState"
                  value={formData.licenseState}
                  onChange={handleChange}
                  className={`input-medical ${
                    errors.licenseState
                      ? "border-red-400 focus:border-red-500"
                      : ""
                  }`}
                >
                  <option value="">Select State</option>
                  {states.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
                {errors.licenseState && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.licenseState}
                  </p>
                )}
              </div>
            </div>

            {/* Primary Specialty */}
            <div>
              <label
                htmlFor="primarySpecialty"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Primary Medical Specialty
              </label>
              <select
                id="primarySpecialty"
                name="primarySpecialty"
                value={formData.primarySpecialty}
                onChange={handleChange}
                className={`input-medical ${
                  errors.primarySpecialty
                    ? "border-red-400 focus:border-red-500"
                    : ""
                }`}
              >
                <option value="">Select your primary specialty</option>
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
              {errors.primarySpecialty && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.primarySpecialty}
                </p>
              )}
            </div>

            {/* Subspecialties */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Subspecialties (Optional)
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Select any subspecialties that apply
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {subspecialties.map((subspecialty) => (
                  <label
                    key={subspecialty}
                    className="flex items-center space-x-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      name="subspecialties"
                      value={subspecialty}
                      checked={formData.subspecialties.includes(subspecialty)}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="text-gray-700">{subspecialty}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Years of Experience */}
            <div>
              <label
                htmlFor="yearsOfExperience"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Years of Medical Experience
              </label>
              <select
                id="yearsOfExperience"
                name="yearsOfExperience"
                value={formData.yearsOfExperience}
                onChange={handleChange}
                className={`input-medical ${
                  errors.yearsOfExperience
                    ? "border-red-400 focus:border-red-500"
                    : ""
                }`}
              >
                <option value="">Select experience level</option>
                <option value="0">Less than 1 year</option>
                {Array.from({ length: 30 }, (_, i) => i + 1).map((year) => (
                  <option key={year} value={year}>
                    {year} year{year > 1 ? "s" : ""}
                  </option>
                ))}
                <option value="30">30+ years</option>
              </select>
              {errors.yearsOfExperience && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.yearsOfExperience}
                </p>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Medical Education
              </h3>
              <p className="text-gray-600 text-sm">
                Tell us about your medical education background
              </p>
            </div>

            {/* Medical School Name */}
            <div>
              <label
                htmlFor="medicalSchool.name"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Medical School Name
              </label>
              <input
                id="medicalSchool.name"
                name="medicalSchool.name"
                type="text"
                value={formData.medicalSchool.name}
                onChange={handleChange}
                className={`input-medical ${
                  errors["medicalSchool.name"]
                    ? "border-red-400 focus:border-red-500"
                    : ""
                }`}
                placeholder="e.g., Harvard Medical School"
              />
              {errors["medicalSchool.name"] && (
                <p className="mt-1 text-sm text-red-600">
                  {errors["medicalSchool.name"]}
                </p>
              )}
            </div>

            {/* Graduation Year and Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="medicalSchool.graduationYear"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Graduation Year
                </label>
                <select
                  id="medicalSchool.graduationYear"
                  name="medicalSchool.graduationYear"
                  value={formData.medicalSchool.graduationYear}
                  onChange={handleChange}
                  className={`input-medical ${
                    errors["medicalSchool.graduationYear"]
                      ? "border-red-400 focus:border-red-500"
                      : ""
                  }`}
                >
                  <option value="">Select year</option>
                  {Array.from(
                    { length: new Date().getFullYear() - 1949 },
                    (_, i) => new Date().getFullYear() - i
                  ).map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                {errors["medicalSchool.graduationYear"] && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors["medicalSchool.graduationYear"]}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="medicalSchool.location"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Medical School Location (Optional)
                </label>
                <input
                  id="medicalSchool.location"
                  name="medicalSchool.location"
                  type="text"
                  value={formData.medicalSchool.location}
                  onChange={handleChange}
                  className="input-medical"
                  placeholder="e.g., Boston, MA"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Location & Languages
              </h3>
              <p className="text-gray-600 text-sm">
                Help us connect you with the right opportunities
              </p>
            </div>

            {/* Current Location */}
            <div>
              <h4 className="text-md font-semibold text-gray-800 mb-3">
                Current Location
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="location.city"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    City
                  </label>
                  <input
                    id="location.city"
                    name="location.city"
                    type="text"
                    value={formData.location.city}
                    onChange={handleChange}
                    className={`input-medical ${
                      errors["location.city"]
                        ? "border-red-400 focus:border-red-500"
                        : ""
                    }`}
                    placeholder="e.g., New York"
                  />
                  {errors["location.city"] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors["location.city"]}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="location.state"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    State
                  </label>
                  <select
                    id="location.state"
                    name="location.state"
                    value={formData.location.state}
                    onChange={handleChange}
                    className={`input-medical ${
                      errors["location.state"]
                        ? "border-red-400 focus:border-red-500"
                        : ""
                    }`}
                  >
                    <option value="">Select State</option>
                    {states.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  {errors["location.state"] && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors["location.state"]}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label
                    htmlFor="location.country"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Country
                  </label>
                  <input
                    id="location.country"
                    name="location.country"
                    type="text"
                    value={formData.location.country}
                    onChange={handleChange}
                    className="input-medical"
                    placeholder="United States"
                  />
                </div>

                <div>
                  <label
                    htmlFor="location.timezone"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Timezone
                  </label>
                  <select
                    id="location.timezone"
                    name="location.timezone"
                    value={formData.location.timezone}
                    onChange={handleChange}
                    className="input-medical"
                  >
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">
                      Pacific Time (PT)
                    </option>
                    <option value="America/Anchorage">Alaska Time (AKT)</option>
                    <option value="Pacific/Honolulu">Hawaii Time (HT)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Languages */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-md font-semibold text-gray-800">
                  Languages
                </h4>
                <button
                  type="button"
                  onClick={addLanguage}
                  className="text-sm text-green-600 hover:text-green-700 font-medium"
                >
                  + Add Language
                </button>
              </div>

              <div className="space-y-3">
                {formData.languages.map((lang, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <select
                        value={lang.language}
                        onChange={(e) =>
                          handleLanguageChange(
                            index,
                            "language",
                            e.target.value
                          )
                        }
                        className="input-medical"
                      >
                        <option value="">Select Language</option>
                        {languages.map((language) => (
                          <option key={language} value={language}>
                            {language}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex-1">
                      <select
                        value={lang.proficiency}
                        onChange={(e) =>
                          handleLanguageChange(
                            index,
                            "proficiency",
                            e.target.value
                          )
                        }
                        className="input-medical"
                      >
                        <option value="basic">Basic</option>
                        <option value="conversational">Conversational</option>
                        <option value="fluent">Fluent</option>
                        <option value="native">Native</option>
                      </select>
                    </div>

                    {formData.languages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLanguage(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {errors.languages && (
                <p className="mt-1 text-sm text-red-600">{errors.languages}</p>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Professional Profile
              </h3>
              <p className="text-gray-600 text-sm">
                Complete your professional profile and privacy settings
              </p>
            </div>

            {/* Professional Bio */}
            <div>
              <label
                htmlFor="bio"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Professional Bio (Optional)
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={5}
                value={formData.bio}
                onChange={handleChange}
                className={`input-medical resize-none ${
                  errors.bio ? "border-red-400 focus:border-red-500" : ""
                }`}
                placeholder="Write a brief professional bio highlighting your experience, expertise, and what makes you unique as a medical professional..."
                maxLength={2000}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.bio && (
                  <p className="text-sm text-red-600">{errors.bio}</p>
                )}
                <p className="text-xs text-gray-500 ml-auto">
                  {formData.bio.length}/2000 characters
                </p>
              </div>
            </div>

            {/* Privacy Settings */}
            <div>
              <h4 className="text-md font-semibold text-gray-800 mb-3">
                Privacy Settings
              </h4>

              <div className="space-y-4 bg-gray-50 rounded-lg p-4">
                <div>
                  <label
                    htmlFor="privacy.profileVisibility"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Profile Visibility
                  </label>
                  <select
                    id="privacy.profileVisibility"
                    name="privacy.profileVisibility"
                    value={formData.privacy.profileVisibility}
                    onChange={handleChange}
                    className="input-medical"
                  >
                    <option value="public">Public - Visible to everyone</option>
                    <option value="members_only">
                      Members Only - Only registered doctors
                    </option>
                    <option value="private">
                      Private - Only direct contacts
                    </option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="privacy.showEmail"
                      checked={formData.privacy.showEmail}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Show email address on profile
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="privacy.showPhone"
                      checked={formData.privacy.showPhone}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Show phone number on profile
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="privacy.allowDirectContact"
                      checked={formData.privacy.allowDirectContact}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Allow other doctors to contact me directly
                    </span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="privacy.showLastSeen"
                      checked={formData.privacy.showLastSeen}
                      onChange={handleChange}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Show when I was last active
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3">
                Professional Agreement
              </h4>
              <div className="text-sm text-gray-600 space-y-2">
                <p>By creating an account, you agree to:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Provide accurate and truthful medical credentials</li>
                  <li>Maintain professional medical standards</li>
                  <li>Comply with all applicable medical regulations</li>
                  <li>Respect patient confidentiality and HIPAA compliance</li>
                  <li>Use the platform responsibly and ethically</li>
                </ul>
              </div>
            </div>

            {/* Account Summary */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-3">
                Account Summary
              </h4>
              <div className="text-sm text-blue-800 space-y-2">
                <p>
                  <span className="font-medium">Name:</span> Dr.{" "}
                  {formData.firstName} {formData.lastName}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {formData.email}
                </p>
                <p>
                  <span className="font-medium">Role:</span>{" "}
                  {formData.role === "senior"
                    ? "Senior Doctor"
                    : "Junior Doctor"}
                </p>
                <p>
                  <span className="font-medium">Specialty:</span>{" "}
                  {formData.primarySpecialty}
                </p>
                <p>
                  <span className="font-medium">Experience:</span>{" "}
                  {formData.yearsOfExperience} years
                </p>
                <p>
                  <span className="font-medium">Location:</span>{" "}
                  {formData.location.city}, {formData.location.state}
                </p>
                <p>
                  <span className="font-medium">Medical School:</span>{" "}
                  {formData.medicalSchool.name} (
                  {formData.medicalSchool.graduationYear})
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Styles */}
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
        .btn-secondary {
          background: transparent;
          color: #6b7280;
          border: 2px solid #e5e7eb;
          padding: 0.75rem 1.5rem;
          border-radius: 0.75rem;
          font-weight: 600;
          transition: all 0.3s ease;
        }
        .btn-secondary:hover {
          border-color: #10b981;
          color: #10b981;
          background: rgba(16, 185, 129, 0.05);
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
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        .animate-slide-up {
          animation: slideUp 0.6s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      <div className="fixed inset-0 pattern-trust opacity-30 pointer-events-none"></div>

      {/* Header */}
      <nav className="relative bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-medical rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="text-2xl font-bold text-gradient-medical">
                Doconnect
              </span>
            </Link>

            <Link
              to="/login"
              className="text-gray-600 hover:text-green-600 font-medium transition-colors"
            >
              Already have an account? Sign In
            </Link>
          </div>
        </div>
      </nav>

      <main className="relative max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Join the Future of Medical Collaboration
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Connect with medical professionals worldwide and advance your career
            in healthcare
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                    currentStep >= step
                      ? "bg-green-500 text-white shadow-lg"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {currentStep > step ? (
                    <svg
                      className="w-5 h-5"
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
                    step
                  )}
                </div>
                {step < 5 && (
                  <div
                    className={`w-16 h-1 mx-2 transition-all duration-300 ${
                      currentStep > step ? "bg-green-500" : "bg-gray-200"
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between max-w-2xl mx-auto mt-2 text-sm text-gray-500">
            <span>Personal</span>
            <span>Credentials</span>
            <span>Education</span>
            <span>Location</span>
            <span>Profile</span>
          </div>
        </div>

        {/* Registration Form */}
        <div className="card-glass rounded-2xl shadow-2xl animate-slide-up">
          <div className="p-8">
            {/* Error Display */}
            {error && (
              <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                <div className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {error}
                </div>
              </div>
            )}

            {/* Step Content */}
            <form
              onSubmit={
                currentStep === totalSteps
                  ? handleSubmit
                  : (e) => {
                      e.preventDefault();
                      handleNext();
                    }
              }
            >
              {getStepContent()}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-8 mt-8 border-t border-gray-100">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevious}
                    className="btn-secondary flex items-center space-x-2"
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
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                    <span>Previous</span>
                  </button>
                ) : (
                  <div></div>
                )}

                {currentStep < totalSteps ? (
                  <button
                    type="submit"
                    className="btn-medical flex items-center space-x-2"
                  >
                    <span>Next Step</span>
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
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading || isLoading}
                    className={`btn-medical flex items-center space-x-2 ${
                      loading || isLoading
                        ? "opacity-75 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    {loading || isLoading ? (
                      <>
                        <svg
                          className="animate-spin w-4 h-4"
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
                        <span>Creating Account...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Account</span>
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
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center animate-fade-in">
          <div className="flex justify-center items-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>HIPAA Compliant</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Secure Platform</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-green-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Verified Professionals</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;
