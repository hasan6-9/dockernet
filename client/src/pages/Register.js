// ============================================================================
// IMPORTS
// ============================================================================
import React, { useState, useEffect, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { authAPI, handleApiError } from "../api";

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const Register = () => {
  // --------------------------------------------------------------------------
  // HOOKS & STATE
  // --------------------------------------------------------------------------
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailCheckStatus, setEmailCheckStatus] = useState({
    checking: false,
    available: null,
    message: "",
  });
  const [emailCheckTimeout, setEmailCheckTimeout] = useState(null);

  const totalSteps = 5;

  // React Hook Form for each step
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
    getValues,
  } = useForm({
    mode: "onBlur",
    defaultValues: {
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
    },
  });

  // Watch form values
  const watchRole = watch("role");
  const watchPassword = watch("password");
  const watchLanguages = watch("languages");
  const watchSubspecialties = watch("subspecialties");

  // --------------------------------------------------------------------------
  // EFFECTS
  // --------------------------------------------------------------------------
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // --------------------------------------------------------------------------
  // VALIDATION FUNCTIONS
  // --------------------------------------------------------------------------
  const validateStep = async (step) => {
    let fieldsToValidate = [];

    switch (step) {
      case 1:
        fieldsToValidate = [
          "firstName",
          "lastName",
          "email",
          "phone",
          "password",
          "confirmPassword",
          "role",
        ];
        break;
      case 2:
        fieldsToValidate = [
          "medicalLicenseNumber",
          "licenseState",
          "primarySpecialty",
          "yearsOfExperience",
        ];
        break;
      case 3:
        fieldsToValidate = [
          "medicalSchool.name",
          "medicalSchool.graduationYear",
        ];
        break;
      case 4:
        fieldsToValidate = ["location.city", "location.state"];
        break;
      case 5:
        // Optional fields, no validation needed
        return true;
      default:
        return false;
    }

    const result = await trigger(fieldsToValidate);
    return result;
  };

  // --------------------------------------------------------------------------
  // EVENT HANDLERS
  // --------------------------------------------------------------------------
  const handleNext = async () => {
    // STEP 1 SPECIFIC: Check email availability
    if (currentStep === 1) {
      const email = getValues("email");

      // Check if email format is valid
      const emailValid = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email);

      if (!emailValid) {
        toast.error("Please enter a valid email address");
        return;
      }

      // If we know email is not available
      if (emailCheckStatus.available === false) {
        toast.error("This email is already registered. Please login instead.", {
          duration: 5000,
          icon: "⚠️",
        });
        return;
      }

      // If we're still checking, wait
      if (emailCheckStatus.checking) {
        toast.loading("Checking email availability...", { duration: 1000 });
        setTimeout(() => handleNext(), 1000);
        return;
      }

      // If we haven't checked at all, check now
      if (emailCheckStatus.available === null && email) {
        setEmailCheckStatus({ checking: true, available: null, message: "" });
        try {
          const response = await authAPI.checkEmailAvailability(email);
          if (!response.data.available) {
            toast.error(
              "This email is already registered. Please login instead.",
              {
                duration: 5000,
                icon: "⚠️",
              }
            );
            setEmailCheckStatus({
              checking: false,
              available: false,
              message: response.data.message,
            });
            return;
          }
          setEmailCheckStatus({
            checking: false,
            available: true,
            message: response.data.message,
          });
        } catch (error) {
          console.error("Email check error:", error);
        }
      }
    }

    // Original validation for all steps
    const isValid = await validateStep(currentStep);

    if (isValid) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast.error("Please fix the errors before continuing");
    }
  };

  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleLanguageChange = (index, field, value) => {
    const currentLanguages = getValues("languages");
    const updatedLanguages = [...currentLanguages];
    updatedLanguages[index] = { ...updatedLanguages[index], [field]: value };
    setValue("languages", updatedLanguages);
  };

  const addLanguage = () => {
    const currentLanguages = getValues("languages");
    setValue("languages", [
      ...currentLanguages,
      { language: "", proficiency: "conversational" },
    ]);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (emailCheckTimeout) {
        clearTimeout(emailCheckTimeout);
      }
    };
  }, [emailCheckTimeout]);

  // Check email availability
  const checkEmailAvailability = useCallback(async (email) => {
    setEmailCheckStatus({ checking: true, available: null, message: "" });

    try {
      const response = await authAPI.checkEmailAvailability(email);

      if (response.data.success) {
        setEmailCheckStatus({
          checking: false,
          available: response.data.available,
          message: response.data.message,
        });
      }
    } catch (error) {
      console.error("Email check error:", error);
      setEmailCheckStatus({
        checking: false,
        available: null,
        message: "",
      });
    }
  }, []);

  // Handle email change with debouncing
  const handleEmailChange = (e) => {
    const email = e.target.value;

    if (emailCheckTimeout) {
      clearTimeout(emailCheckTimeout);
    }

    if (!email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      setEmailCheckStatus({ checking: false, available: null, message: "" });
      return;
    }

    const timeout = setTimeout(() => {
      checkEmailAvailability(email);
    }, 800);

    setEmailCheckTimeout(timeout);
  };

  const removeLanguage = (index) => {
    const currentLanguages = getValues("languages");
    if (currentLanguages.length > 1) {
      const updatedLanguages = currentLanguages.filter((_, i) => i !== index);
      setValue("languages", updatedLanguages);
    }
  };

  const toggleSubspecialty = (subspecialty) => {
    const current = getValues("subspecialties") || [];
    if (current.includes(subspecialty)) {
      setValue(
        "subspecialties",
        current.filter((s) => s !== subspecialty)
      );
    } else {
      setValue("subspecialties", [...current, subspecialty]);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // Prepare data for submission
      const { confirmPassword, ...submitData } = data;

      // Convert string numbers to integers
      submitData.yearsOfExperience = parseInt(submitData.yearsOfExperience);
      submitData.medicalSchool.graduationYear = parseInt(
        submitData.medicalSchool.graduationYear
      );

      // Filter out empty languages
      submitData.languages = submitData.languages.filter(
        (lang) => lang.language.trim() !== ""
      );

      // Make API call
      const response = await authAPI.register(submitData);

      if (response.data.success) {
        toast.success("Account created successfully! Redirecting...");
        // Note: AuthContext will handle user state update via login
        setTimeout(() => {
          navigate("/dashboard");
        }, 1000);
      }
    } catch (error) {
      const errorInfo = handleApiError(error);
      toast.error(errorInfo.message);

      // Display validation errors if present
      if (errorInfo.errors && Array.isArray(errorInfo.errors)) {
        errorInfo.errors.forEach((err) => {
          toast.error(`${err.field}: ${err.message}`);
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------------------------------------------------------
  // DATA ARRAYS
  // --------------------------------------------------------------------------
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

  // --------------------------------------------------------------------------
  // STEP CONTENT RENDERER
  // --------------------------------------------------------------------------
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
                I am a... <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 gap-3">
                <label
                  className={`relative flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 ${
                    watchRole === "junior"
                      ? "border-medical-500 bg-medical-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    value="junior"
                    {...register("role", { required: "Role is required" })}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        watchRole === "junior"
                          ? "border-medical-500 bg-medical-500"
                          : "border-gray-300"
                      }`}
                    >
                      {watchRole === "junior" && (
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
                    watchRole === "senior"
                      ? "border-primary-500 bg-primary-50 shadow-md"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    value="senior"
                    {...register("role", { required: "Role is required" })}
                    className="sr-only"
                  />
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                        watchRole === "senior"
                          ? "border-primary-500 bg-primary-500"
                          : "border-gray-300"
                      }`}
                    >
                      {watchRole === "senior" && (
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
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.role.message}
                </p>
              )}
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  {...register("firstName", {
                    required: "First name is required",
                    minLength: {
                      value: 2,
                      message: "Minimum 2 characters required",
                    },
                    maxLength: {
                      value: 50,
                      message: "Maximum 50 characters allowed",
                    },
                  })}
                  className={`input w-full ${
                    errors.firstName
                      ? "border-red-300 focus:border-red-500"
                      : ""
                  }`}
                  placeholder="Enter your first name"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.firstName.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="lastName"
                  type="text"
                  {...register("lastName", {
                    required: "Last name is required",
                    minLength: {
                      value: 2,
                      message: "Minimum 2 characters required",
                    },
                    maxLength: {
                      value: 50,
                      message: "Maximum 50 characters allowed",
                    },
                  })}
                  className={`input w-full ${
                    errors.lastName ? "border-red-300 focus:border-red-500" : ""
                  }`}
                  placeholder="Enter your last name"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.lastName.message}
                  </p>
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
                  Professional Email <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="email"
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                      onChange: handleEmailChange, // ADD THIS LINE
                    })}
                    className={`input w-full pr-10 ${
                      errors.email
                        ? "border-red-300 focus:border-red-500"
                        : emailCheckStatus.available === true
                        ? "border-green-300 focus:border-green-500"
                        : emailCheckStatus.available === false
                        ? "border-red-300 focus:border-red-500"
                        : ""
                    }`}
                    placeholder="doctor@medicalpractice.com"
                  />

                  {/* Status Icons */}
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    {emailCheckStatus.checking && (
                      <svg
                        className="animate-spin h-5 w-5 text-blue-500"
                        xmlns="http://www.w3.org/2000/svg"
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
                    )}
                    {!emailCheckStatus.checking &&
                      emailCheckStatus.available === true && (
                        <svg
                          className="h-5 w-5 text-green-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    {!emailCheckStatus.checking &&
                      emailCheckStatus.available === false && (
                        <svg
                          className="h-5 w-5 text-red-500"
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
                </div>

                {/* Validation Messages */}
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.email.message}
                  </p>
                )}

                {!errors.email && emailCheckStatus.checking && (
                  <p className="mt-1 text-sm text-blue-600 flex items-center">
                    <svg
                      className="animate-spin w-4 h-4 mr-1"
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
                    Checking availability...
                  </p>
                )}

                {!errors.email && emailCheckStatus.available === true && (
                  <p className="mt-1 text-sm text-green-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Email available! ✓
                  </p>
                )}

                {!errors.email && emailCheckStatus.available === false && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Email already registered.{" "}
                    <Link
                      to="/login"
                      className="underline ml-1 hover:text-red-700"
                    >
                      Login instead?
                    </Link>
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="phone"
                  type="tel"
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^\+?[\d\s\-\(\)]{10,}$/,
                      message: "Please enter a valid phone number",
                    },
                  })}
                  className={`input w-full ${
                    errors.phone ? "border-red-300 focus:border-red-500" : ""
                  }`}
                  placeholder="+1 (555) 123-4567"
                />
                {errors.phone && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.phone.message}
                  </p>
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
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
                      pattern: {
                        value:
                          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                        message:
                          "Must contain uppercase, lowercase, number, and special character",
                      },
                    })}
                    className={`input w-full pr-10 ${
                      errors.password
                        ? "border-red-300 focus:border-red-500"
                        : ""
                    }`}
                    placeholder="Create a strong password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <svg
                        className="h-5 w-5 text-gray-400 hover:text-gray-600"
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
                        className="h-5 w-5 text-gray-400 hover:text-gray-600"
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
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="confirmPassword"
                  type={showPassword ? "text" : "password"}
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === watchPassword || "Passwords do not match",
                  })}
                  className={`input w-full ${
                    errors.confirmPassword
                      ? "border-red-300 focus:border-red-500"
                      : ""
                  }`}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.confirmPassword.message}
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
                  Medical License Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="medicalLicenseNumber"
                  type="text"
                  {...register("medicalLicenseNumber", {
                    required: "License number is required",
                    minLength: {
                      value: 3,
                      message: "Minimum 3 characters required",
                    },
                    maxLength: {
                      value: 50,
                      message: "Maximum 50 characters allowed",
                    },
                  })}
                  className={`input w-full ${
                    errors.medicalLicenseNumber
                      ? "border-red-300 focus:border-red-500"
                      : ""
                  }`}
                  placeholder="Enter your license number"
                />
                {errors.medicalLicenseNumber && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.medicalLicenseNumber.message}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="licenseState"
                  className="block text-sm font-semibold text-gray-700 mb-2"
                >
                  License State <span className="text-red-500">*</span>
                </label>
                <select
                  id="licenseState"
                  {...register("licenseState", {
                    required: "License state is required",
                  })}
                  className={`input w-full ${
                    errors.licenseState
                      ? "border-red-300 focus:border-red-500"
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
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.licenseState.message}
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
                Primary Medical Specialty{" "}
                <span className="text-red-500">*</span>
              </label>
              <select
                id="primarySpecialty"
                {...register("primarySpecialty", {
                  required: "Primary specialty is required",
                })}
                className={`input w-full ${
                  errors.primarySpecialty
                    ? "border-red-300 focus:border-red-500"
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
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.primarySpecialty.message}
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
                    className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-gray-50 p-1 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={watchSubspecialties?.includes(subspecialty)}
                      onChange={() => toggleSubspecialty(subspecialty)}
                      className="rounded border-gray-300 text-medical-600 focus:ring-medical-500"
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
                Years of Medical Experience{" "}
                <span className="text-red-500">*</span>
              </label>
              <select
                id="yearsOfExperience"
                {...register("yearsOfExperience", {
                  required: "Years of experience is required",
                  validate: (value) =>
                    value !== "" || "Please select your experience level",
                })}
                className={`input w-full ${
                  errors.yearsOfExperience
                    ? "border-red-300 focus:border-red-500"
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
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.yearsOfExperience.message}
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
                Medical School Name <span className="text-red-500">*</span>
              </label>
              <input
                id="medicalSchool.name"
                type="text"
                {...register("medicalSchool.name", {
                  required: "Medical school name is required",
                  minLength: {
                    value: 2,
                    message: "Minimum 2 characters required",
                  },
                  maxLength: {
                    value: 200,
                    message: "Maximum 200 characters allowed",
                  },
                })}
                className={`input w-full ${
                  errors.medicalSchool?.name
                    ? "border-red-300 focus:border-red-500"
                    : ""
                }`}
                placeholder="e.g., Harvard Medical School"
              />
              {errors.medicalSchool?.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {errors.medicalSchool.name.message}
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
                  Graduation Year <span className="text-red-500">*</span>
                </label>
                <select
                  id="medicalSchool.graduationYear"
                  {...register("medicalSchool.graduationYear", {
                    required: "Graduation year is required",
                    validate: (value) => {
                      const year = parseInt(value);
                      const currentYear = new Date().getFullYear();
                      if (year < 1950 || year > currentYear) {
                        return `Please enter a year between 1950 and ${currentYear}`;
                      }
                      return true;
                    },
                  })}
                  className={`input w-full ${
                    errors.medicalSchool?.graduationYear
                      ? "border-red-300 focus:border-red-500"
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
                {errors.medicalSchool?.graduationYear && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.medicalSchool.graduationYear.message}
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
                  type="text"
                  {...register("medicalSchool.location")}
                  className="input w-full"
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
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="location.city"
                    type="text"
                    {...register("location.city", {
                      required: "City is required",
                      maxLength: {
                        value: 100,
                        message: "Maximum 100 characters allowed",
                      },
                    })}
                    className={`input w-full ${
                      errors.location?.city
                        ? "border-red-300 focus:border-red-500"
                        : ""
                    }`}
                    placeholder="e.g., New York"
                  />
                  {errors.location?.city && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.location.city.message}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="location.state"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    State <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="location.state"
                    {...register("location.state", {
                      required: "State is required",
                    })}
                    className={`input w-full ${
                      errors.location?.state
                        ? "border-red-300 focus:border-red-500"
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
                  {errors.location?.state && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <svg
                        className="w-4 h-4 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      {errors.location.state.message}
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
                    type="text"
                    {...register("location.country")}
                    className="input w-full"
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
                    {...register("location.timezone")}
                    className="input w-full"
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
                  className="text-sm text-medical-600 hover:text-medical-700 font-medium flex items-center"
                >
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Add Language
                </button>
              </div>

              <div className="space-y-3">
                {watchLanguages?.map((lang, index) => (
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
                        className="input w-full"
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
                        className="input w-full"
                      >
                        <option value="basic">Basic</option>
                        <option value="conversational">Conversational</option>
                        <option value="fluent">Fluent</option>
                        <option value="native">Native</option>
                      </select>
                    </div>

                    {watchLanguages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLanguage(index)}
                        className="text-red-500 hover:text-red-700 p-1"
                        aria-label="Remove language"
                      >
                        <svg
                          className="w-5 h-5"
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
            </div>
          </div>
        );

      case 5:
        const formValues = getValues();
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                Professional Profile
              </h3>
              <p className="text-gray-600 text-sm">
                Complete your professional profile and review your information
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
                rows={5}
                {...register("bio", {
                  maxLength: {
                    value: 2000,
                    message: "Bio cannot exceed 2000 characters",
                  },
                })}
                className={`input w-full resize-none ${
                  errors.bio ? "border-red-300 focus:border-red-500" : ""
                }`}
                placeholder="Write a brief professional bio highlighting your experience, expertise, and what makes you unique as a medical professional..."
                maxLength={2000}
              />
              <div className="flex justify-between items-center mt-1">
                {errors.bio && (
                  <p className="text-sm text-red-600 flex items-center">
                    <svg
                      className="w-4 h-4 mr-1"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {errors.bio.message}
                  </p>
                )}
                <p className="text-xs text-gray-500 ml-auto">
                  {watch("bio")?.length || 0}/2000 characters
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
                    {...register("privacy.profileVisibility")}
                    className="input w-full"
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
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("privacy.showEmail")}
                      className="rounded border-gray-300 text-medical-600 focus:ring-medical-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Show email address on profile
                    </span>
                  </label>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("privacy.showPhone")}
                      className="rounded border-gray-300 text-medical-600 focus:ring-medical-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Show phone number on profile
                    </span>
                  </label>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("privacy.allowDirectContact")}
                      className="rounded border-gray-300 text-medical-600 focus:ring-medical-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Allow other doctors to contact me directly
                    </span>
                  </label>

                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("privacy.showLastSeen")}
                      className="rounded border-gray-300 text-medical-600 focus:ring-medical-500"
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
            <div className="bg-primary-50 rounded-xl p-6 border border-primary-200">
              <h4 className="font-semibold text-primary-900 mb-3">
                Account Summary
              </h4>
              <div className="text-sm text-primary-800 space-y-2">
                <p>
                  <span className="font-medium">Name:</span> Dr.{" "}
                  {formValues.firstName} {formValues.lastName}
                </p>
                <p>
                  <span className="font-medium">Email:</span> {formValues.email}
                </p>
                <p>
                  <span className="font-medium">Role:</span>{" "}
                  {formValues.role === "senior"
                    ? "Senior Doctor"
                    : "Junior Doctor"}
                </p>
                <p>
                  <span className="font-medium">Specialty:</span>{" "}
                  {formValues.primarySpecialty}
                </p>
                <p>
                  <span className="font-medium">Experience:</span>{" "}
                  {formValues.yearsOfExperience}{" "}
                  {formValues.yearsOfExperience === "1" ? "year" : "years"}
                </p>
                <p>
                  <span className="font-medium">Location:</span>{" "}
                  {formValues.location.city}, {formValues.location.state}
                </p>
                <p>
                  <span className="font-medium">Medical School:</span>{" "}
                  {formValues.medicalSchool.name} (
                  {formValues.medicalSchool.graduationYear})
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // --------------------------------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------------------------------
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-medical-600 border-opacity-50" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-medical-50">
      {/* Header */}
      <nav className="relative bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-medical-600 to-medical-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">D</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-medical-600 to-medical-500 bg-clip-text text-transparent">
                Doconnect
              </span>
            </Link>

            <Link
              to="/login"
              className="text-gray-600 hover:text-medical-600 font-medium transition-colors"
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
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[1, 2, 3, 4, 5].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all duration-300 ${
                    currentStep >= step
                      ? "bg-medical-500 text-white shadow-lg"
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
                      currentStep > step ? "bg-medical-500" : "bg-gray-200"
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
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-100">
          <div className="p-8">
            {/* Step Content */}
            <form
              onSubmit={
                currentStep === totalSteps
                  ? handleSubmit(onSubmit)
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
                    className="btn-secondary flex items-center space-x-2 px-6 py-2.5 rounded-lg font-medium transition-all duration-200 hover:bg-gray-50"
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
                    className="btn-medical flex items-center space-x-2 px-6 py-2.5 rounded-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5"
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
                    disabled={isSubmitting}
                    className={`btn-medical flex items-center space-x-2 px-6 py-2.5 rounded-lg font-medium shadow-lg transition-all duration-200 ${
                      isSubmitting
                        ? "opacity-75 cursor-not-allowed"
                        : "hover:shadow-xl hover:-translate-y-0.5"
                    }`}
                  >
                    {isSubmitting ? (
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
        <div className="mt-12 text-center">
          <div className="flex justify-center items-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5 text-medical-500"
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
                className="w-5 h-5 text-medical-500"
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
                className="w-5 h-5 text-medical-500"
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

      {/* Styles */}
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        .btn-medical {
          background: linear-gradient(135deg, #10b981, #059669);
          color: white;
        }
        .btn-secondary {
          background: white;
          color: #6b7280;
          border: 2px solid #e5e7eb;
        }
        .btn-secondary:hover {
          border-color: #10b981;
          color: #10b981;
        }
        .input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }
        .input:focus {
          outline: none;
          border-color: #10b981;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
        }
      `}</style>
    </div>
  );
};

// ============================================================================
// EXPORT
// ============================================================================
export default Register;
