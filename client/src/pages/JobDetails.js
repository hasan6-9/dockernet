// ============================================================================
// IMPORTS
// ============================================================================
import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { jobAPI, profileAPI, handleApiError, formatters } from "../api";
import {
  ArrowLeft,
  Star,
  MapPin,
  Clock,
  DollarSign,
  Calendar,
  Users,
  Eye,
  Share2,
  Bookmark,
  BookmarkCheck,
  CheckCircle,
  AlertTriangle,
  Briefcase,
  Target,
  Award,
  MessageSquare,
  Flag,
  ArrowRight,
  Heart,
  Building,
  Globe,
  FileText,
  Shield,
  TrendingUp,
  X,
} from "lucide-react";

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const JobDetails = () => {
  // --------------------------------------------------------------------------
  // HOOKS & STATE
  // --------------------------------------------------------------------------
  const { jobId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isAuthenticated, isJunior, isSenior, hasPermission } =
    useAuth();

  const [showShareModal, setShowShareModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // --------------------------------------------------------------------------
  // DATA FETCHING
  // --------------------------------------------------------------------------
  const {
    data: jobData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => jobAPI.getById(jobId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });

  const job = jobData?.data;

  // Fetch similar jobs if authenticated
  const { data: similarJobsData } = useQuery({
    queryKey: ["similar-jobs", job?.specialty, jobId],
    queryFn: () =>
      jobAPI.browse({
        specialty: job?.specialty,
        limit: 3,
      }),
    enabled: Boolean(job?.specialty),
    staleTime: 5 * 60 * 1000,
  });

  const similarJobs = similarJobsData?.data?.data?.filter(
    (j) => j._id !== jobId
  );

  // Calculate match score if authenticated and junior
  const { data: matchData } = useQuery({
    queryKey: ["match-score", jobId],
    queryFn: () => jobAPI.calculateMatch(jobId),
    enabled: isAuthenticated && isJunior(),
    staleTime: 10 * 60 * 1000,
  });

  const matchScore = matchData?.data?.matchScore;

  // --------------------------------------------------------------------------
  // MUTATIONS
  // --------------------------------------------------------------------------

  // Track job view
  const trackViewMutation = useMutation({
    mutationFn: () => jobAPI.trackView(jobId),
    onError: (error) => {
      console.error("Failed to track view:", error);
    },
  });

  // Save/bookmark job
  const saveJobMutation = useMutation({
    mutationFn: () => profileAPI.saveJob(jobId),
    onSuccess: () => {
      setIsSaved(!isSaved);
      toast.success(isSaved ? "Job unsaved" : "Job saved!");
      queryClient.invalidateQueries(["saved-jobs"]);
    },
    onError: (error) => {
      const errorInfo = handleApiError(error);
      toast.error(errorInfo.message);
    },
  });

  // --------------------------------------------------------------------------
  // EFFECTS
  // --------------------------------------------------------------------------

  // Track view when component mounts
  useEffect(() => {
    if (job && isAuthenticated) {
      // Don't track own jobs
      if (job.posted_by?._id !== user?.id) {
        trackViewMutation.mutate();
      }
    }
  }, [job, isAuthenticated]);

  // Check if job is already saved
  useEffect(() => {
    if (isAuthenticated && job) {
      // This would typically come from user's saved jobs
      // For now, we'll manage it with local state
      const savedJobs = JSON.parse(sessionStorage.getItem("savedJobs") || "[]");
      setIsSaved(savedJobs.includes(jobId));
    }
  }, [isAuthenticated, job, jobId]);

  // --------------------------------------------------------------------------
  // EVENT HANDLERS
  // --------------------------------------------------------------------------

  const toggleSaveJob = () => {
    if (!isAuthenticated) {
      toast.error("Please login to save jobs");
      navigate("/login");
      return;
    }

    // Update session storage
    const savedJobs = JSON.parse(sessionStorage.getItem("savedJobs") || "[]");
    if (isSaved) {
      const updated = savedJobs.filter((id) => id !== jobId);
      sessionStorage.setItem("savedJobs", JSON.stringify(updated));
    } else {
      savedJobs.push(jobId);
      sessionStorage.setItem("savedJobs", JSON.stringify(savedJobs));
    }

    saveJobMutation.mutate();
  };

  const shareJob = async (method) => {
    const url = window.location.href;
    const text = `Check out this medical opportunity: ${job.title}`;

    try {
      switch (method) {
        case "copy":
          await navigator.clipboard.writeText(url);
          toast.success("Link copied to clipboard!");
          break;
        case "email":
          window.location.href = `mailto:?subject=${encodeURIComponent(
            job.title
          )}&body=${encodeURIComponent(text + "\n\n" + url)}`;
          break;
        case "linkedin":
          window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
              url
            )}`,
            "_blank"
          );
          break;
        default:
          break;
      }
      setShowShareModal(false);
    } catch (err) {
      toast.error("Failed to share");
    }
  };

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      toast.error("Please login to apply for jobs");
      navigate("/login", { state: { from: `/jobs/${jobId}` } });
      return;
    }

    if (!isJunior()) {
      toast.error("Only junior doctors can apply for jobs");
      return;
    }

    navigate(`/jobs/${jobId}/apply`);
  };

  const handleContactEmployer = () => {
    if (!isAuthenticated) {
      toast.error("Please login to contact employers");
      navigate("/login");
      return;
    }

    // Navigate to messaging or open contact modal
    toast.info("Messaging feature coming soon!");
  };

  const handleReportJob = () => {
    if (!isAuthenticated) {
      toast.error("Please login to report jobs");
      navigate("/login");
      return;
    }

    toast.info("Report feature coming soon!");
  };

  // --------------------------------------------------------------------------
  // HELPER FUNCTIONS
  // --------------------------------------------------------------------------

  const getMatchScoreColor = (score) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 80) return "text-blue-600 bg-blue-100";
    if (score >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-orange-600 bg-orange-100";
  };

  const getMatchScoreLabel = (score) => {
    if (score >= 90) return "Excellent Match";
    if (score >= 80) return "Great Match";
    if (score >= 70) return "Good Match";
    return "Fair Match";
  };

  const getDaysRemaining = (deadline) => {
    const days = Math.ceil(
      (new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24)
    );
    return days > 0 ? days : 0;
  };

  const isOwner = job?.posted_by?._id === user?.id;
  const canApply = isAuthenticated && isJunior() && !isOwner;
  const canEdit = isAuthenticated && isOwner;

  // --------------------------------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back button skeleton */}
          <div className="mb-6">
            <div className="bg-gray-200 h-10 w-32 rounded animate-pulse"></div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main content skeleton */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="animate-pulse space-y-4">
                  <div className="bg-gray-200 h-8 rounded w-3/4"></div>
                  <div className="flex space-x-4">
                    <div className="bg-gray-200 h-6 rounded w-24"></div>
                    <div className="bg-gray-200 h-6 rounded w-24"></div>
                    <div className="bg-gray-200 h-6 rounded w-24"></div>
                  </div>
                  <div className="bg-gray-200 h-32 rounded"></div>
                  <div className="flex justify-between">
                    <div className="bg-gray-200 h-6 rounded w-32"></div>
                    <div className="bg-gray-200 h-6 rounded w-32"></div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <div className="animate-pulse space-y-4">
                  <div className="bg-gray-200 h-6 rounded w-48"></div>
                  <div className="space-y-2">
                    <div className="bg-gray-200 h-4 rounded"></div>
                    <div className="bg-gray-200 h-4 rounded"></div>
                    <div className="bg-gray-200 h-4 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar skeleton */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="animate-pulse space-y-4">
                  <div className="bg-gray-200 h-12 rounded"></div>
                  <div className="bg-gray-200 h-12 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // ERROR STATE
  // --------------------------------------------------------------------------
  if (error) {
    const errorInfo = handleApiError(error);

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Error Loading Job
              </h3>
              <p className="text-gray-600 mb-6">{errorInfo.message}</p>
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => refetch()}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate("/jobs")}
                  className="bg-white text-gray-700 border border-gray-300 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Browse Jobs
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // EMPTY STATE
  // --------------------------------------------------------------------------
  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
              <Briefcase className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Job Not Found
            </h3>
            <p className="text-gray-600 mb-6">
              The job you're looking for doesn't exist or has been removed.
            </p>
            <button
              onClick={() => navigate("/jobs")}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Browse All Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Jobs</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleSaveJob}
              disabled={saveJobMutation.isLoading}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4 text-primary-600" />
              ) : (
                <Bookmark className="w-4 h-4 text-gray-400" />
              )}
              <span className="text-sm font-medium">
                {isSaved ? "Saved" : "Save Job"}
              </span>
            </button>

            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span className="text-sm font-medium">Share</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
              {job.featured && (
                <div className="flex items-center space-x-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="text-yellow-700 font-medium text-sm">
                    Featured Job
                  </span>
                </div>
              )}

              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                    {job.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center space-x-2">
                      <Briefcase className="w-4 h-4" />
                      <span>{job.category}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4" />
                      <span>{job.specialty}</span>
                    </div>
                    {job.requirements?.location_preference && (
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span className="capitalize">
                          {job.requirements.location_preference}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatters.timeline(job.timeline)}</span>
                    </div>
                  </div>

                  {job.subSpecialties && job.subSpecialties.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.subSpecialties.map((subspecialty, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium"
                        >
                          {subspecialty}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="lg:text-right lg:ml-8 mt-4 lg:mt-0">
                  <div className="text-2xl lg:text-3xl font-bold text-medical-600 mb-1">
                    {formatters.budget(job)}
                  </div>
                  <p className="text-gray-500 text-sm capitalize mb-2">
                    {job.budget.type} payment
                  </p>
                  {matchScore && (
                    <div
                      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getMatchScoreColor(
                        matchScore
                      )}`}
                    >
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {matchScore}% match
                    </div>
                  )}
                </div>
              </div>

              {/* Job Stats */}
              <div className="flex flex-wrap items-center justify-between py-4 border-t border-gray-100 gap-4">
                <div className="flex flex-wrap items-center gap-4 lg:gap-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{job.applications_count || 0} applications</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>{job.views_count || 0} views</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Posted {formatters.date(job.createdAt, "short")}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-red-600 font-medium">
                    Deadline: {formatters.date(job.timeline.deadline, "short")}
                  </p>
                  <p className="text-xs text-gray-500">
                    {getDaysRemaining(job.timeline.deadline)} days remaining
                  </p>
                </div>
              </div>

              {/* Action Buttons for Owner */}
              {canEdit && (
                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => navigate(`/jobs/${jobId}/edit`)}
                    className="btn-secondary px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    Edit Job
                  </button>
                  <button
                    onClick={() => navigate(`/applications?jobId=${jobId}`)}
                    className="btn-primary px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    View Applications ({job.applications_count || 0})
                  </button>
                  {job.status === "active" && (
                    <button
                      onClick={() => {
                        /* Pause job */
                      }}
                      className="btn-ghost px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      Pause Job
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">
                Job Description
              </h2>
              <div className="prose max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {job.description}
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
              <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">
                Requirements
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Award className="w-5 h-5 mr-2 text-primary-600" />
                    Experience Level
                  </h3>
                  <p className="text-gray-700">
                    {formatters.experienceLevel(job.experience_required.level)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Minimum {job.experience_required.minimum_years} years
                  </p>
                </div>

                {job.requirements?.location_preference && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Globe className="w-5 h-5 mr-2 text-primary-600" />
                      Work Arrangement
                    </h3>
                    <p className="text-gray-700 capitalize">
                      {job.requirements.location_preference}
                    </p>
                  </div>
                )}

                {job.timeline?.estimated_hours && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-primary-600" />
                      Estimated Hours
                    </h3>
                    <p className="text-gray-700">
                      {job.timeline.estimated_hours} hours
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                    Deadline
                  </h3>
                  <p className="text-gray-700">
                    {formatters.date(job.timeline.deadline)}
                  </p>
                </div>
              </div>

              {/* Required Skills */}
              {job.skills_required && job.skills_required.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills_required.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-medical-100 text-medical-800 px-3 py-2 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Requirements */}
              {job.requirements?.other && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Additional Requirements
                  </h3>
                  <p className="text-gray-700 whitespace-pre-line">
                    {job.requirements.other}
                  </p>
                </div>
              )}
            </div>

            {/* Similar Jobs */}
            {similarJobs && similarJobs.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">
                  Similar Opportunities
                </h2>
                <div className="space-y-4">
                  {similarJobs.slice(0, 3).map((similarJob) => (
                    <Link
                      key={similarJob._id}
                      to={`/jobs/${similarJob._id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary-300 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 hover:text-primary-600 mb-2">
                            {similarJob.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <Target className="w-4 h-4 mr-1" />
                              {similarJob.specialty}
                            </span>
                            <span className="flex items-center">
                              <Building className="w-4 h-4 mr-1" />
                              {similarJob.posted_by?.firstName}{" "}
                              {similarJob.posted_by?.lastName}
                            </span>
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-semibold text-medical-600">
                            {formatters.budget(similarJob)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                <div className="mt-6">
                  <Link
                    to={`/jobs?specialty=${job.specialty}`}
                    className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center"
                  >
                    <span>View more {job.specialty} jobs</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              {canApply ? (
                <div className="space-y-4">
                  <button
                    onClick={handleApplyClick}
                    className="w-full bg-medical-600 text-white py-4 px-6 rounded-lg hover:bg-medical-700 transition-colors font-medium text-lg flex items-center justify-center space-x-2"
                  >
                    <span>Apply for this Job</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>

                  {matchScore && (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-1">
                        Your match score
                      </p>
                      <div
                        className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${getMatchScoreColor(
                          matchScore
                        )}`}
                      >
                        {matchScore}% - {getMatchScoreLabel(matchScore)}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleContactEmployer}
                    className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center space-x-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Contact Employer</span>
                  </button>
                </div>
              ) : isOwner ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                    <p className="text-blue-800 font-medium">
                      This is your job posting
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(`/applications?jobId=${jobId}`)}
                    className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    View Applications ({job.applications_count || 0})
                  </button>
                  <button
                    onClick={() => navigate(`/jobs/${jobId}/edit`)}
                    className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Edit Job Posting
                  </button>
                </div>
              ) : !isAuthenticated ? (
                <div className="space-y-4">
                  <button
                    onClick={() =>
                      navigate("/login", { state: { from: `/jobs/${jobId}` } })
                    }
                    className="w-full bg-medical-600 text-white py-4 px-6 rounded-lg hover:bg-medical-700 transition-colors font-medium text-lg"
                  >
                    Login to Apply
                  </button>
                  <p className="text-center text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Sign up
                    </Link>
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                  <p className="text-yellow-800 font-medium mb-2">
                    Senior doctors cannot apply for jobs
                  </p>
                  <p className="text-sm text-yellow-700">
                    Switch to a junior account or{" "}
                    <Link
                      to="/jobs/create"
                      className="underline hover:text-yellow-900"
                    >
                      post your own job
                    </Link>
                  </p>
                </div>
              )}
            </div>

            {/* Employer Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                About the Employer
              </h3>

              <div className="flex items-start space-x-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center flex-shrink-0">
                  {job.posted_by?.profilePhoto ? (
                    <img
                      src={job.posted_by.profilePhoto}
                      alt={`${job.posted_by.firstName} ${job.posted_by.lastName}`}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-primary-600">
                      {job.posted_by?.firstName?.[0]}
                      {job.posted_by?.lastName?.[0]}
                    </span>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-semibold text-gray-900">
                      {job.posted_by?.firstName} {job.posted_by?.lastName}
                    </h4>
                    {job.posted_by?.verificationStatus?.overall ===
                      "verified" && (
                      <CheckCircle className="w-5 h-5 text-medical-500" />
                    )}
                  </div>
                  <p className="text-sm text-primary-600 font-medium mb-1">
                    {job.posted_by?.primarySpecialty}
                  </p>
                  {job.posted_by?.location?.city && (
                    <p className="text-sm text-gray-600 flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      {job.posted_by.location.city}
                      {job.posted_by.location.state &&
                        `, ${job.posted_by.location.state}`}
                    </p>
                  )}
                </div>
              </div>

              {job.posted_by?.bio && (
                <p className="text-gray-700 text-sm mb-4 leading-relaxed line-clamp-3">
                  {job.posted_by.bio}
                </p>
              )}

              <div className="space-y-3 text-sm border-t border-gray-100 pt-4">
                {job.posted_by?.rating?.average > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Rating:</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="font-medium">
                        {job.posted_by.rating.average.toFixed(1)}
                      </span>
                      <span className="text-gray-500">
                        ({job.posted_by.rating.count} reviews)
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Experience:</span>
                  <span className="font-medium">
                    {job.posted_by?.yearsOfExperience || 0} years
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Member since:</span>
                  <span className="font-medium">
                    {formatters.date(job.posted_by?.createdAt, "short")}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link
                  to={`/profile/${job.posted_by?._id}`}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center justify-center space-x-1 hover:underline"
                >
                  <span>View Full Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Job Details Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Job Details
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    Budget:
                  </span>
                  <span className="font-semibold text-medical-600">
                    {formatters.budget(job)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <Award className="w-4 h-4 mr-1" />
                    Experience:
                  </span>
                  <span className="font-medium">
                    {formatters.experienceLevel(job.experience_required.level)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    Timeline:
                  </span>
                  <span className="font-medium">
                    {formatters.timeline(job.timeline)}
                  </span>
                </div>

                {job.requirements?.location_preference && (
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 flex items-center">
                      <MapPin className="w-4 h-4 mr-1" />
                      Location:
                    </span>
                    <span className="font-medium capitalize">
                      {job.requirements.location_preference}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    Applications:
                  </span>
                  <span className="font-medium">
                    {job.applications_count || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <Target className="w-4 h-4 mr-1" />
                    Status:
                  </span>
                  <span
                    className={`font-medium capitalize ${
                      job.status === "active"
                        ? "text-medical-600"
                        : "text-gray-600"
                    }`}
                  >
                    {job.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Posted:
                  </span>
                  <span className="font-medium">
                    {formatters.date(job.createdAt, "short")}
                  </span>
                </div>
              </div>
            </div>

            {/* Report Job */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <button
                onClick={handleReportJob}
                className="w-full text-left text-red-600 hover:text-red-800 transition-colors text-sm flex items-center space-x-2 font-medium"
              >
                <Flag className="w-4 h-4" />
                <span>Report this job</span>
              </button>
              <p className="text-xs text-gray-500 mt-2">
                Report inappropriate or fraudulent content
              </p>
            </div>
          </div>
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Share this job
                </h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => shareJob("copy")}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary-300 transition-all flex items-center space-x-3"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <FileText className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Copy Link</p>
                    <p className="text-sm text-gray-600">
                      Copy job URL to clipboard
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => shareJob("email")}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary-300 transition-all flex items-center space-x-3"
                >
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Share via Email</p>
                    <p className="text-sm text-gray-600">Send job via email</p>
                  </div>
                </button>

                <button
                  onClick={() => shareJob("linkedin")}
                  className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-primary-300 transition-all flex items-center space-x-3"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Globe className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Share on LinkedIn
                    </p>
                    <p className="text-sm text-gray-600">
                      Post to your network
                    </p>
                  </div>
                </button>
              </div>

              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 text-center">
                  Help others discover this opportunity
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// EXPORT
// ============================================================================
export default JobDetails;
