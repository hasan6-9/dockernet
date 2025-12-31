// client/src/pages/ApplicationSubmission.js - Enhanced with Cached Match Score
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { applicationAPI, jobAPI, handleApiError } from "../api";
import {
  ArrowLeft,
  Loader,
  AlertCircle,
  CheckCircle,
  Send,
  Save,
  Briefcase,
  DollarSign,
  Calendar,
  Clock,
  TrendingUp,
  User,
  Award,
  Info,
} from "lucide-react";

const ApplicationSubmission = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [job, setJob] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    cover_letter: "",
    approach: "",
    timeline_days: "",
    proposed_budget: "",
    start_date: "",
    hours_per_week: "",
    relevant_experience: "",
    questions: "",
  });

  // Validation errors
  const [validationErrors, setValidationErrors] = useState({});

  // Load job data
  useEffect(() => {
    loadJobData();
    loadDraft();
  }, [jobId]);

  const loadJobData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await jobAPI.getById(jobId);
      setJob(response.data.data);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(apiError.message || "Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  // Cached match score query
  const { data: matchScore, isLoading: matchLoading } = useQuery({
    queryKey: ["match-score", jobId, user?.id],
    queryFn: async () => {
      const response = await applicationAPI.calculateMatch?.(jobId);
      return response?.data?.data?.matchScore;
    },
    enabled: !!user && user?.role === "junior" && !!jobId,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
    onError: (err) => {
      console.log("Match score not available:", err);
    },
  });

  const loadDraft = () => {
    try {
      const draft = localStorage.getItem(`application_draft_${jobId}`);
      if (draft) {
        const parsedDraft = JSON.parse(draft);
        setFormData(parsedDraft);
      }
    } catch (err) {
      console.error("Failed to load draft:", err);
    }
  };

  // Debounced auto-save function
  const saveDraftDebounced = useCallback(() => {
    try {
      localStorage.setItem(
        `application_draft_${jobId}`,
        JSON.stringify(formData)
      );
      console.log("Draft auto-saved");
    } catch (err) {
      console.error("Failed to save draft:", err);
    }
  }, [formData, jobId]);

  // Manual save for button
  const saveDraft = () => {
    try {
      localStorage.setItem(
        `application_draft_${jobId}`,
        JSON.stringify(formData)
      );
      setSuccess("Draft saved");
      setTimeout(() => setSuccess(""), 2000);
    } catch (err) {
      console.error("Failed to save draft:", err);
    }
  };

  // Auto-save effect (every 30 seconds)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.cover_letter || formData.approach) {
        saveDraftDebounced();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearTimeout(timer);
  }, [formData, saveDraftDebounced]);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.cover_letter.trim()) {
      errors.cover_letter = "Cover letter is required";
    } else if (formData.cover_letter.length < 100) {
      errors.cover_letter = "Cover letter must be at least 100 characters";
    } else if (formData.cover_letter.length > 1000) {
      errors.cover_letter = "Cover letter cannot exceed 1000 characters";
    }

    if (!formData.approach.trim()) {
      errors.approach = "Project approach is required";
    } else if (formData.approach.length < 50) {
      errors.approach = "Project approach must be at least 50 characters";
    } else if (formData.approach.length > 1500) {
      errors.approach = "Project approach cannot exceed 1500 characters";
    }

    if (!formData.timeline_days) {
      errors.timeline_days = "Timeline is required";
    } else if (
      parseInt(formData.timeline_days) < 1 ||
      parseInt(formData.timeline_days) > 365
    ) {
      errors.timeline_days = "Timeline must be between 1 and 365 days";
    }

    if (!formData.proposed_budget) {
      errors.proposed_budget = "Proposed budget is required";
    } else if (parseFloat(formData.proposed_budget) < 0) {
      errors.proposed_budget = "Budget cannot be negative";
    }

    if (!formData.start_date) {
      errors.start_date = "Availability start date is required";
    } else if (new Date(formData.start_date) < new Date()) {
      errors.start_date = "Start date must be in the future";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      setError("Please fix the validation errors");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const applicationData = {
        job_id: jobId,
        proposal: {
          cover_letter: formData.cover_letter.trim(),
          approach: formData.approach.trim(),
          timeline_days: parseInt(formData.timeline_days),
          proposed_budget: parseFloat(formData.proposed_budget),
          availability: {
            start_date: formData.start_date,
            hours_per_week: formData.hours_per_week
              ? parseInt(formData.hours_per_week)
              : undefined,
          },
          relevant_experience: formData.relevant_experience.trim() || undefined,
          questions_for_employer: formData.questions.trim() || undefined,
        },
        source: "search",
      };

      const response = await applicationAPI.submit(applicationData);

      setSuccess("Application submitted successfully!");
      localStorage.removeItem(`application_draft_${jobId}`);

      // Redirect after brief delay
      setTimeout(() => {
        navigate("/applications");
      }, 1500);
    } catch (err) {
      const apiError = handleApiError(err);
      setError(
        apiError.message || "Failed to submit application. Please try again."
      );

      // Show validation errors if provided by API
      if (apiError.errors && Array.isArray(apiError.errors)) {
        const backendErrors = {};
        apiError.errors.forEach((error) => {
          if (error.field) {
            backendErrors[error.field] = error.message;
          }
        });
        setValidationErrors((prev) => ({ ...prev, ...backendErrors }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Format budget display
  const formatBudget = () => {
    if (!job?.budget) return "Not specified";
    const { amount, type } = job.budget;
    if (type === "negotiable") return "Negotiable";
    if (type === "hourly") return `$${amount}/hour`;
    return `$${amount?.toLocaleString()} fixed`;
  };

  // Get match score color
  const getMatchScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 60) return "text-blue-600 bg-blue-50";
    if (score >= 40) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <Loader className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-gray-600">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Job Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The job you're trying to apply for doesn't exist or is no longer
            available.
          </p>
          <Link
            to="/jobs"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Browse Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Link
            to={`/jobs/${jobId}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            Back to Job Details
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            Apply for Position
          </h1>
          <p className="text-gray-600 mt-1">
            Submit your application for: {job.title}
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3" />
              <div>
                <p className="font-medium text-red-800">Error</p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <div className="flex items-start">
              <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 mr-3" />
              <div>
                <p className="font-medium text-green-800">Success</p>
                <p className="text-green-700 text-sm">{success}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Cover Letter */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Cover Letter *
                </h2>
                <div>
                  <textarea
                    value={formData.cover_letter}
                    onChange={(e) =>
                      handleChange("cover_letter", e.target.value)
                    }
                    rows={6}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.cover_letter
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                    placeholder="Dear Hiring Manager,&#10;&#10;I am writing to express my strong interest in this position...&#10;&#10;• Highlight your relevant experience&#10;• Explain your interest in this role&#10;• Mention specific qualifications"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`text-sm ${
                        formData.cover_letter.length < 100
                          ? "text-red-500"
                          : formData.cover_letter.length > 1000
                          ? "text-red-500"
                          : "text-gray-500"
                      }`}
                    >
                      {formData.cover_letter.length} / 1000 characters (min:
                      100)
                    </span>
                  </div>
                  {validationErrors.cover_letter && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.cover_letter}
                    </p>
                  )}
                </div>
              </div>

              {/* Project Approach */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Project Approach *
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How would you approach this project?
                  </label>
                  <textarea
                    value={formData.approach}
                    onChange={(e) => handleChange("approach", e.target.value)}
                    rows={6}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      validationErrors.approach
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                    placeholder="Describe your methodology:&#10;&#10;• Initial assessment phase&#10;• Key deliverables&#10;• Timeline breakdown&#10;• Quality assurance measures"
                  />
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`text-sm ${
                        formData.approach.length < 50
                          ? "text-red-500"
                          : formData.approach.length > 1500
                          ? "text-red-500"
                          : "text-gray-500"
                      }`}
                    >
                      {formData.approach.length} / 1500 characters (min: 50)
                    </span>
                  </div>
                  {validationErrors.approach && (
                    <p className="text-red-500 text-sm mt-1">
                      {validationErrors.approach}
                    </p>
                  )}
                </div>
              </div>

              {/* Budget & Timeline */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Budget & Timeline *
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proposed Budget ($)
                    </label>
                    <input
                      type="number"
                      value={formData.proposed_budget}
                      onChange={(e) =>
                        handleChange("proposed_budget", e.target.value)
                      }
                      min="0"
                      step="0.01"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.proposed_budget
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter amount"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Job budget: {formatBudget()}
                    </p>
                    {validationErrors.proposed_budget && (
                      <p className="text-red-500 text-sm mt-1">
                        {validationErrors.proposed_budget}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Timeline (days)
                    </label>
                    <input
                      type="number"
                      value={formData.timeline_days}
                      onChange={(e) =>
                        handleChange("timeline_days", e.target.value)
                      }
                      min="1"
                      max="365"
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.timeline_days
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                      placeholder="e.g., 30"
                    />
                    {validationErrors.timeline_days && (
                      <p className="text-red-500 text-sm mt-1">
                        {validationErrors.timeline_days}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Availability Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.start_date}
                      onChange={(e) =>
                        handleChange("start_date", e.target.value)
                      }
                      min={new Date().toISOString().split("T")[0]}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        validationErrors.start_date
                          ? "border-red-300"
                          : "border-gray-300"
                      }`}
                    />
                    {validationErrors.start_date && (
                      <p className="text-red-500 text-sm mt-1">
                        {validationErrors.start_date}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hours per Week (optional)
                    </label>
                    <input
                      type="number"
                      value={formData.hours_per_week}
                      onChange={(e) =>
                        handleChange("hours_per_week", e.target.value)
                      }
                      min="1"
                      max="168"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., 20"
                    />
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Additional Information
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Relevant Experience (optional)
                    </label>
                    <textarea
                      value={formData.relevant_experience}
                      onChange={(e) =>
                        handleChange("relevant_experience", e.target.value)
                      }
                      rows={3}
                      maxLength={1500}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe your most relevant experience for this role..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Questions for Employer (optional)
                    </label>
                    <textarea
                      value={formData.questions}
                      onChange={(e) =>
                        handleChange("questions", e.target.value)
                      }
                      rows={3}
                      maxLength={500}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Any questions about the project, expectations, or requirements..."
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      * Required fields must be completed
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Draft auto-saves every 30 seconds
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={saveDraft}
                      disabled={submitting}
                      className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Draft
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {submitting ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Submit Application
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Job Summary
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start">
                  <Briefcase className="w-4 h-4 text-gray-400 mt-0.5 mr-2" />
                  <div>
                    <p className="font-medium text-gray-900">{job.title}</p>
                    <p className="text-gray-600">{job.category}</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-600">
                  <Award className="w-4 h-4 mr-2" />
                  {job.specialty}
                </div>
                <div className="flex items-center text-gray-600">
                  <DollarSign className="w-4 h-4 mr-2" />
                  {formatBudget()}
                </div>
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-4 h-4 mr-2" />
                  Deadline:{" "}
                  {new Date(job.timeline?.deadline).toLocaleDateString()}
                </div>
              </div>

              {job.posted_by && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {job.posted_by.firstName} {job.posted_by.lastName}
                      </p>
                      <div className="flex items-center text-sm text-gray-600">
                        {job.posted_by.verificationStatus?.overall ===
                          "verified" && (
                          <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                        )}
                        Verified Employer
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Match Score */}
            {matchScore !== null && matchScore !== undefined && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Your Match Score
                </h3>
                <div className="text-center">
                  <div
                    className={`text-4xl font-bold mb-2 ${
                      matchScore >= 80
                        ? "text-green-600"
                        : matchScore >= 60
                        ? "text-blue-600"
                        : matchScore >= 40
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {matchScore}%
                  </div>
                  <p className="text-sm text-gray-600">
                    {matchScore >= 80
                      ? "Excellent match"
                      : matchScore >= 60
                      ? "Good match"
                      : matchScore >= 40
                      ? "Fair match"
                      : "Weak match"}
                  </p>
                  <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        matchScore >= 80
                          ? "bg-green-500"
                          : matchScore >= 60
                          ? "bg-blue-500"
                          : matchScore >= 40
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${matchScore}%` }}
                    />
                  </div>
                </div>
              </div>
            )}

            {matchLoading && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-center">
                  <Loader className="w-6 h-6 text-blue-600 animate-spin" />
                  <span className="ml-2 text-sm text-gray-600">
                    Calculating match score...
                  </span>
                </div>
              </div>
            )}

            {/* Application Tips */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <div className="flex items-start mb-3">
                <Info className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                <h3 className="text-lg font-semibold text-blue-900">
                  Application Tips
                </h3>
              </div>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>
                    Personalize your cover letter for this specific role
                  </span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Be specific about your approach and timeline</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Propose a competitive but realistic budget</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Proofread carefully before submitting</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationSubmission;
