import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Upload,
  Calendar,
  DollarSign,
  Clock,
  Star,
  CheckCircle,
  AlertTriangle,
  Briefcase,
  User,
  Target,
  MessageSquare,
  Plus,
  X,
  Save,
  Send,
  Eye,
  Award,
  Heart,
  TrendingUp,
} from "lucide-react";

const ApplicationSubmission = () => {
  const { jobId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // State management
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [job, setJob] = useState(null);

  // Application form state
  const [applicationData, setApplicationData] = useState({
    coverLetter: "",
    proposalDescription: "",
    proposedBudget: "",
    proposedTimeline: "",
    availabilityStart: "",
    hoursPerWeek: "",
    portfolioItems: [],
    additionalDocuments: [],
    questionsForEmployer: "",
    whyInterested: "",
    relevantExperience: "",
  });

  // Draft saving
  const [isDraft, setIsDraft] = useState(true);
  const [lastSaved, setLastSaved] = useState(null);

  // Sample job data
  const sampleJob = {
    id: jobId,
    title: "Cardiology Consultation Support",
    category: "Consultation",
    specialty: "Cardiology",
    budget: 2500,
    budgetType: "fixed",
    timeline: "medium",
    employer: {
      name: "Dr. Sarah Wilson",
      title: "Cardiothoracic Surgeon",
      rating: 4.9,
      verified: true,
    },
    requiredSkills: [
      "Cardiac Catheterization",
      "Echocardiography",
      "Clinical Assessment",
    ],
    deadline: "2024-02-15",
    description:
      "We are seeking an experienced cardiologist to provide consultation support for complex cardiac cases...",
  };

  // Load job data and any existing draft
  useEffect(() => {
    loadJobData();
    loadDraft();
  }, [jobId]);

  const loadJobData = async () => {
    try {
      setLoading(true);
      // API call would be here
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setJob(sampleJob);
    } catch (err) {
      setError("Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  const loadDraft = async () => {
    try {
      // Load any existing draft from API or localStorage
      const draft = localStorage.getItem(`application_draft_${jobId}`);
      if (draft) {
        const parsedDraft = JSON.parse(draft);
        setApplicationData(parsedDraft);
        setLastSaved(new Date());
      }
    } catch (err) {
      console.error("Failed to load draft:", err);
    }
  };

  // Auto-save draft
  useEffect(() => {
    const timer = setInterval(() => {
      if (
        isDraft &&
        (applicationData.coverLetter || applicationData.proposalDescription)
      ) {
        saveDraft();
      }
    }, 30000); // Auto-save every 30 seconds

    return () => clearInterval(timer);
  }, [applicationData, isDraft]);

  const handleInputChange = (field, value) => {
    setApplicationData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addPortfolioItem = (item) => {
    setApplicationData((prev) => ({
      ...prev,
      portfolioItems: [...prev.portfolioItems, item],
    }));
  };

  const removePortfolioItem = (index) => {
    setApplicationData((prev) => ({
      ...prev,
      portfolioItems: prev.portfolioItems.filter((_, i) => i !== index),
    }));
  };

  const saveDraft = async () => {
    try {
      // Save to localStorage and API
      localStorage.setItem(
        `application_draft_${jobId}`,
        JSON.stringify(applicationData)
      );
      setLastSaved(new Date());

      // API call to save draft would be here
      // await applicationAPI.saveDraft(jobId, applicationData);
    } catch (err) {
      console.error("Failed to save draft:", err);
    }
  };

  const submitApplication = async () => {
    try {
      setSubmitting(true);
      setError("");

      // Validation
      if (!applicationData.coverLetter.trim()) {
        throw new Error("Cover letter is required");
      }
      if (!applicationData.proposalDescription.trim()) {
        throw new Error("Project proposal is required");
      }
      if (!applicationData.proposedBudget) {
        throw new Error("Budget proposal is required");
      }

      // API call to submit application
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSuccess("Application submitted successfully!");
      setIsDraft(false);

      // Clear draft
      localStorage.removeItem(`application_draft_${jobId}`);

      // Redirect after success
      setTimeout(() => {
        navigate("/applications");
      }, 2000);
    } catch (err) {
      setError(err.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  const calculateMatchScore = () => {
    // Simple match calculation based on user skills vs required skills
    if (!user?.skills || !job?.requiredSkills) return null;

    const userSkills = user.skills.map((skill) => skill.name.toLowerCase());
    const requiredSkills = job.requiredSkills.map((skill) =>
      skill.toLowerCase()
    );

    const matches = requiredSkills.filter((skill) =>
      userSkills.some(
        (userSkill) =>
          userSkill.includes(skill.toLowerCase()) || skill.includes(userSkill)
      )
    );

    return Math.round((matches.length / requiredSkills.length) * 100);
  };

  const formatBudget = () => {
    const { budget, budgetType } = job;
    if (budgetType === "hourly") return `${budget}/hour`;
    if (budgetType === "milestone")
      return `${budget.toLocaleString()} milestone`;
    return `${budget.toLocaleString()} fixed`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="bg-gray-200 h-8 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="space-y-4">
                <div className="bg-gray-200 h-6 rounded w-3/4"></div>
                <div className="bg-gray-200 h-32 rounded"></div>
                <div className="bg-gray-200 h-6 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Job Not Found
            </h3>
            <p className="text-gray-600">
              The job you're trying to apply for doesn't exist or is no longer
              available.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const matchScore = calculateMatchScore();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate(`/jobs/${jobId}`)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Job Details</span>
            </button>
            <h1 className="text-3xl font-bold text-gray-900">
              Apply for Position
            </h1>
            <p className="text-gray-600 mt-2">
              Submit your application for this opportunity
            </p>
          </div>

          {lastSaved && (
            <div className="text-right text-sm text-gray-500">
              <p>Draft saved</p>
              <p>{lastSaved.toLocaleTimeString()}</p>
            </div>
          )}
        </div>

        {/* Success/Error Messages */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-400 text-red-700 p-4 rounded-lg mb-6 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-3" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-100 border-l-4 border-green-400 text-green-700 p-4 rounded-lg mb-6 flex items-center">
            <CheckCircle className="w-5 h-5 mr-3" />
            {success}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Application Form */}
          <div className="lg:col-span-2 space-y-8">
            {/* Cover Letter */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <MessageSquare className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Cover Letter
                </h2>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tell the employer why you're the perfect fit for this role *
                </label>
                <textarea
                  value={applicationData.coverLetter}
                  onChange={(e) =>
                    handleInputChange("coverLetter", e.target.value)
                  }
                  rows={8}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Dear Dr. Wilson,

I am writing to express my interest in the Cardiology Consultation Support position. With my extensive background in cardiology and experience in telemedicine consultations...

• Highlight your relevant experience
• Explain why you're interested in this specific role
• Mention specific skills that match the job requirements
• Show enthusiasm for the opportunity"
                />
                <p className="text-sm text-gray-500 mt-2">
                  {applicationData.coverLetter.length} characters (minimum 200
                  recommended)
                </p>
              </div>
            </div>

            {/* Project Proposal */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Target className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Project Approach
                </h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Describe your approach to this project *
                  </label>
                  <textarea
                    value={applicationData.proposalDescription}
                    onChange={(e) =>
                      handleInputChange("proposalDescription", e.target.value)
                    }
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Outline your methodology and approach:

• How you would approach the consultation process
• Your review methodology for patient charts
• Communication protocols you would establish
• Quality assurance measures
• Timeline and milestone breakdown"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Why are you interested in this specific project?
                  </label>
                  <textarea
                    value={applicationData.whyInterested}
                    onChange={(e) =>
                      handleInputChange("whyInterested", e.target.value)
                    }
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Explain what draws you to this opportunity and how it aligns with your career goals..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relevant Experience
                  </label>
                  <textarea
                    value={applicationData.relevantExperience}
                    onChange={(e) =>
                      handleInputChange("relevantExperience", e.target.value)
                    }
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Describe your most relevant experience for this role..."
                  />
                </div>
              </div>
            </div>

            {/* Budget and Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <DollarSign className="w-6 h-6 text-green-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Proposal Details
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Budget Proposal * ({job.budgetType})
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      value={applicationData.proposedBudget}
                      onChange={(e) =>
                        handleInputChange("proposedBudget", e.target.value)
                      }
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={
                        job.budgetType === "hourly"
                          ? "Hourly rate"
                          : "Total amount"
                      }
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Employer budget: {formatBudget()}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Proposed Timeline *
                  </label>
                  <select
                    value={applicationData.proposedTimeline}
                    onChange={(e) =>
                      handleInputChange("proposedTimeline", e.target.value)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select timeline</option>
                    <option value="1-3 days">1-3 days</option>
                    <option value="1 week">1 week</option>
                    <option value="2 weeks">2 weeks</option>
                    <option value="3-4 weeks">3-4 weeks</option>
                    <option value="1-2 months">1-2 months</option>
                    <option value="2+ months">2+ months</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability Start Date
                  </label>
                  <input
                    type="date"
                    value={applicationData.availabilityStart}
                    onChange={(e) =>
                      handleInputChange("availabilityStart", e.target.value)
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hours per Week Available
                  </label>
                  <input
                    type="number"
                    value={applicationData.hoursPerWeek}
                    onChange={(e) =>
                      handleInputChange("hoursPerWeek", e.target.value)
                    }
                    min="1"
                    max="40"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 10"
                  />
                </div>
              </div>
            </div>

            {/* Portfolio Selection */}
            {user?.experiences && user.experiences.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <Award className="w-6 h-6 text-purple-600" />
                  <h2 className="text-2xl font-bold text-gray-900">
                    Showcase Your Experience
                  </h2>
                </div>

                <p className="text-gray-600 mb-6">
                  Select relevant experiences from your profile to highlight for
                  this application
                </p>

                <div className="space-y-4">
                  {user.experiences.map((experience, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={applicationData.portfolioItems.includes(
                            experience.id
                          )}
                          onChange={(e) => {
                            if (e.target.checked) {
                              addPortfolioItem(experience.id);
                            } else {
                              const itemIndex =
                                applicationData.portfolioItems.indexOf(
                                  experience.id
                                );
                              if (itemIndex > -1) {
                                removePortfolioItem(itemIndex);
                              }
                            }
                          }}
                          className="mt-1 w-4 h-4 text-blue-600 rounded"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">
                            {experience.title}
                          </h4>
                          <p className="text-blue-600 font-medium">
                            {experience.institution}
                          </p>
                          <p className="text-gray-600 text-sm">
                            {experience.location}
                          </p>
                          {experience.description && (
                            <p className="text-gray-700 text-sm mt-2 line-clamp-2">
                              {experience.description}
                            </p>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center space-x-3 mb-6">
                <FileText className="w-6 h-6 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Additional Information
                </h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Questions for the Employer
                </label>
                <textarea
                  value={applicationData.questionsForEmployer}
                  onChange={(e) =>
                    handleInputChange("questionsForEmployer", e.target.value)
                  }
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any questions about the project, expectations, or requirements..."
                />
              </div>
            </div>

            {/* Submit Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Ready to Submit?
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Review your application carefully before submitting. You
                    won't be able to edit it after submission.
                  </p>
                </div>

                <div className="flex space-x-4">
                  <button
                    onClick={saveDraft}
                    disabled={submitting}
                    className="flex items-center space-x-2 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Draft</span>
                  </button>

                  <button
                    onClick={submitApplication}
                    disabled={
                      submitting ||
                      !applicationData.coverLetter.trim() ||
                      !applicationData.proposalDescription.trim() ||
                      !applicationData.proposedBudget
                    }
                    className="flex items-center space-x-2 px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Application</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Job Summary
              </h3>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">{job.title}</h4>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Briefcase className="w-4 h-4" />
                  <span>{job.category}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Star className="w-4 h-4" />
                  <span>{job.specialty}</span>
                </div>
                <div className="flex items-center space-x-2 text-green-600">
                  <DollarSign className="w-4 h-4" />
                  <span>{formatBudget()}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Deadline: {new Date(job.deadline).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="font-medium text-gray-900">
                        {job.employer.name}
                      </p>
                      {job.employer.verified && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {job.employer.title}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Match Score */}
            {matchScore && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Your Match Score
                </h3>

                <div className="text-center">
                  <div
                    className={`text-4xl font-bold mb-2 ${
                      matchScore >= 90
                        ? "text-green-600"
                        : matchScore >= 80
                        ? "text-blue-600"
                        : matchScore >= 70
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {matchScore}%
                  </div>
                  <p className="text-gray-600 text-sm">
                    Based on your skills and experience
                  </p>
                </div>

                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span>Skills match</span>
                    <span>
                      {matchScore >= 80
                        ? "Excellent"
                        : matchScore >= 60
                        ? "Good"
                        : "Fair"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        matchScore >= 90
                          ? "bg-green-500"
                          : matchScore >= 80
                          ? "bg-blue-500"
                          : matchScore >= 70
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${matchScore}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Required Skills */}
            {job.requiredSkills && job.requiredSkills.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Required Skills
                </h3>

                <div className="space-y-2">
                  {job.requiredSkills.map((skill, index) => {
                    const hasSkill = user?.skills?.some(
                      (userSkill) =>
                        userSkill.name
                          .toLowerCase()
                          .includes(skill.toLowerCase()) ||
                        skill
                          .toLowerCase()
                          .includes(userSkill.name.toLowerCase())
                    );

                    return (
                      <div key={index} className="flex items-center space-x-2">
                        {hasSkill ? (
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-gray-300 rounded-full flex-shrink-0" />
                        )}
                        <span
                          className={`text-sm ${
                            hasSkill ? "text-green-700" : "text-gray-600"
                          }`}
                        >
                          {skill}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Application Tips */}
            <div className="bg-blue-50 rounded-xl border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">
                Application Tips
              </h3>

              <div className="space-y-3 text-blue-800 text-sm">
                <div className="flex items-start space-x-2">
                  <TrendingUp className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    Personalize your cover letter to the specific role and
                    employer
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <Target className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    Highlight experience that directly relates to the job
                    requirements
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <Heart className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    Show enthusiasm and explain why you want this specific
                    opportunity
                  </span>
                </div>
                <div className="flex items-start space-x-2">
                  <Eye className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Proofread carefully before submitting</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationSubmission;
