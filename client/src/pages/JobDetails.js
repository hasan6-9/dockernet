import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams, Link, useNavigate } from "react-router-dom";
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

const JobDetails = () => {
  const { jobId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [showShareModal, setShowShareModal] = useState(false);

  // Sample job data - would come from API
  const sampleJob = {
    id: jobId,
    title: "Cardiology Consultation Support",
    category: "Consultation",
    specialty: "Cardiology",
    subspecialties: ["Interventional Cardiology", "Heart Failure"],
    description: `We are seeking an experienced cardiologist to provide consultation support for complex cardiac cases. This remote position involves reviewing patient charts, providing second opinions, and collaborating with our medical team.

Key Responsibilities:
• Review patient charts and diagnostic results
• Provide expert second opinions on treatment plans
• Participate in virtual case discussions
• Recommend diagnostic tests and treatment protocols
• Collaborate with multidisciplinary medical teams

Ideal Candidate:
• Board-certified in Cardiology
• Minimum 5 years of clinical experience
• Experience with remote consultations
• Strong communication and documentation skills
• Available for urgent consultations when needed

This is an excellent opportunity for cardiologists looking to expand their practice through telemedicine while maintaining flexibility in their schedule.`,
    budget: 2500,
    budgetType: "fixed",
    experienceLevel: "senior",
    timeline: "medium",
    location: "remote",
    deadline: "2024-02-15",
    postedDate: "2024-01-15",
    lastUpdated: "2024-01-18",
    applications: 12,
    views: 189,
    status: "active",
    featured: true,
    employer: {
      id: "emp1",
      name: "Dr. Sarah Wilson",
      title: "Cardiothoracic Surgeon",
      company: "Heart & Vascular Institute",
      location: "Los Angeles, CA",
      rating: 4.9,
      reviewCount: 47,
      verified: true,
      memberSince: "2022-03-15",
      completedProjects: 23,
      bio: "Experienced cardiothoracic surgeon with over 15 years of practice. Leading innovative cardiac procedures and research.",
      profilePhoto: null,
    },
    requiredSkills: [
      "Cardiac Catheterization",
      "Echocardiography",
      "Clinical Assessment",
      "Remote Consultation",
      "Medical Documentation",
    ],
    preferredCertifications: [
      "Board Certification in Cardiology",
      "Advanced Cardiac Life Support (ACLS)",
      "Interventional Cardiology Certification",
    ],
    languageRequirements: ["English"],
    equipmentProvided: true,
    timezonePreference: "EST",
    responseTimeExpected: "within-day",
    matchScore: isAuthenticated ? 92 : null,
    applicationDeadline: "2024-02-10",
    urgencyLevel: "medium",
    projectDuration: "2-4 weeks",
    workload: "10-15 hours per week",
  };

  const sampleSimilarJobs = [
    {
      id: "2",
      title: "Emergency Cardiology Consultation",
      specialty: "Cardiology",
      budget: 150,
      budgetType: "hourly",
      employer: "City General Hospital",
      matchScore: 88,
    },
    {
      id: "3",
      title: "Cardiac Surgery Case Review",
      specialty: "Cardiology",
      budget: 3500,
      budgetType: "fixed",
      employer: "Dr. Michael Chen",
      matchScore: 85,
    },
    {
      id: "4",
      title: "Pediatric Cardiology Support",
      specialty: "Cardiology",
      budget: 200,
      budgetType: "hourly",
      employer: "Children's Heart Center",
      matchScore: 79,
    },
  ];

  // Load job data
  useEffect(() => {
    loadJobDetails();
  }, [jobId]);

  const loadJobDetails = async () => {
    try {
      setLoading(true);
      // API call would be here
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setJob(sampleJob);
      setSimilarJobs(sampleSimilarJobs);
    } catch (err) {
      setError("Failed to load job details");
    } finally {
      setLoading(false);
    }
  };

  // Toggle save job
  const toggleSaveJob = () => {
    setIsSaved(!isSaved);
  };

  // Share job
  const shareJob = async (method) => {
    const url = window.location.href;
    const text = `Check out this medical opportunity: ${job.title}`;

    switch (method) {
      case "copy":
        await navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
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
          )}`
        );
        break;
      default:
        break;
    }
    setShowShareModal(false);
  };

  // Format budget display
  const formatBudget = () => {
    const { budget, budgetType } = job;
    if (budgetType === "hourly") {
      return `${budget}/hour`;
    } else if (budgetType === "milestone") {
      return `${budget.toLocaleString()} milestone`;
    }
    return `${budget.toLocaleString()} fixed`;
  };

  // Get experience level display
  const getExperienceLevelDisplay = (level) => {
    const levels = {
      entry: "Entry Level (0-2 years)",
      mid: "Mid Level (3-5 years)",
      senior: "Senior Level (5+ years)",
      expert: "Expert Level (10+ years)",
    };
    return levels[level] || level;
  };

  // Get timeline display
  const getTimelineDisplay = (timeline) => {
    const timelineMap = {
      urgent: "Urgent (24 hours)",
      short: "Short-term (1-7 days)",
      medium: "Medium-term (1-4 weeks)",
      long: "Long-term (1+ months)",
      ongoing: "Ongoing",
    };
    return timelineMap[timeline] || timeline;
  };

  // Get match score color
  const getMatchScoreColor = (score) => {
    if (score >= 90) return "text-green-600 bg-green-100";
    if (score >= 80) return "text-blue-600 bg-blue-100";
    if (score >= 70) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto p-6">
          <div className="animate-pulse">
            <div className="bg-gray-200 h-8 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="space-y-4">
                <div className="bg-gray-200 h-8 rounded w-3/4"></div>
                <div className="bg-gray-200 h-4 rounded w-1/2"></div>
                <div className="bg-gray-200 h-20 rounded"></div>
                <div className="bg-gray-200 h-4 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto p-6">
          <div className="bg-red-100 border-l-4 border-red-400 text-red-700 p-4 rounded-lg">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 mr-3" />
              {error}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto p-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Job Not Found
            </h3>
            <p className="text-gray-600 mb-6">
              The job you're looking for doesn't exist or has been removed.
            </p>
            <Link
              to="/jobs"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Browse All Jobs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        {/* Back Navigation */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Jobs</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleSaveJob}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4 text-blue-600" />
              ) : (
                <Bookmark className="w-4 h-4 text-gray-400" />
              )}
              <span>{isSaved ? "Saved" : "Save Job"}</span>
            </button>

            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Job Header */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              {job.featured && (
                <div className="flex items-center space-x-2 mb-4">
                  <Star className="w-5 h-5 text-yellow-500 fill-current" />
                  <span className="text-yellow-700 font-medium">
                    Featured Job
                  </span>
                </div>
              )}

              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    {job.title}
                  </h1>
                  <div className="flex items-center space-x-6 text-gray-600 mb-4">
                    <div className="flex items-center space-x-2">
                      <Briefcase className="w-5 h-5" />
                      <span>{job.category}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Star className="w-5 h-5" />
                      <span>{job.specialty}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5" />
                      <span className="capitalize">{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5" />
                      <span>{getTimelineDisplay(job.timeline)}</span>
                    </div>
                  </div>

                  {job.subspecialties && job.subspecialties.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {job.subspecialties.map((subspecialty, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          {subspecialty}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="text-right ml-8">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {formatBudget()}
                  </div>
                  <p className="text-gray-500 text-sm capitalize">
                    {job.budgetType} payment
                  </p>
                  {isAuthenticated && job.matchScore && (
                    <div
                      className={`mt-3 px-4 py-2 rounded-full text-sm font-medium ${getMatchScoreColor(
                        job.matchScore
                      )}`}
                    >
                      {job.matchScore}% match
                    </div>
                  )}
                </div>
              </div>

              {/* Job Stats */}
              <div className="flex items-center justify-between py-4 border-t border-gray-100">
                <div className="flex items-center space-x-6 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{job.applications} applications</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>{job.views} views</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Posted {new Date(job.postedDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-sm text-red-600 font-medium">
                    Deadline: {new Date(job.deadline).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.ceil(
                      (new Date(job.deadline) - new Date()) /
                        (1000 * 60 * 60 * 24)
                    )}{" "}
                    days remaining
                  </p>
                </div>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Job Description
              </h2>
              <div className="prose max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {job.description}
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Requirements
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Experience Level
                  </h3>
                  <p className="text-gray-700">
                    {getExperienceLevelDisplay(job.experienceLevel)}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Work Arrangement
                  </h3>
                  <p className="text-gray-700 capitalize">{job.location}</p>
                </div>

                {job.projectDuration && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Project Duration
                    </h3>
                    <p className="text-gray-700">{job.projectDuration}</p>
                  </div>
                )}

                {job.workload && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Expected Workload
                    </h3>
                    <p className="text-gray-700">{job.workload}</p>
                  </div>
                )}
              </div>

              {/* Required Skills */}
              {job.requiredSkills && job.requiredSkills.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3">
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {job.requiredSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-green-100 text-green-800 px-3 py-2 rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Preferred Certifications */}
              {job.preferredCertifications &&
                job.preferredCertifications.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Preferred Certifications
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {job.preferredCertifications.map((cert, index) => (
                        <span
                          key={index}
                          className="bg-purple-100 text-purple-800 px-3 py-2 rounded-full text-sm font-medium"
                        >
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* Additional Requirements */}
              <div className="grid md:grid-cols-2 gap-6">
                {job.languageRequirements &&
                  job.languageRequirements.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">
                        Languages
                      </h3>
                      <p className="text-gray-700">
                        {job.languageRequirements.join(", ")}
                      </p>
                    </div>
                  )}

                {job.timezonePreference && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Timezone Preference
                    </h3>
                    <p className="text-gray-700">{job.timezonePreference}</p>
                  </div>
                )}

                {job.responseTimeExpected && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">
                      Response Time
                    </h3>
                    <p className="text-gray-700 capitalize">
                      {job.responseTimeExpected.replace("-", " ")}
                    </p>
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">
                    Equipment
                  </h3>
                  <p className="text-gray-700">
                    {job.equipmentProvided
                      ? "Provided by employer"
                      : "Bring your own equipment"}
                  </p>
                </div>
              </div>
            </div>

            {/* Similar Jobs */}
            {similarJobs.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Similar Opportunities
                </h2>
                <div className="space-y-4">
                  {similarJobs.map((similarJob) => (
                    <Link
                      key={similarJob.id}
                      to={`/jobs/${similarJob.id}`}
                      className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 hover:text-blue-600">
                            {similarJob.title}
                          </h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                            <span>{similarJob.specialty}</span>
                            <span>{similarJob.employer}</span>
                            {isAuthenticated && similarJob.matchScore && (
                              <span className="text-blue-600">
                                {similarJob.matchScore}% match
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">
                            ${similarJob.budget.toLocaleString()}
                            {similarJob.budgetType === "hourly" && "/hr"}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              {isAuthenticated ? (
                <div className="space-y-4">
                  <Link
                    to={`/jobs/${job.id}/apply`}
                    className="block w-full bg-blue-600 text-white text-center py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg flex items-center justify-center space-x-2"
                  >
                    <span>Apply for this Job</span>
                    <ArrowRight className="w-5 h-5" />
                  </Link>

                  <div className="text-center text-sm text-gray-500">
                    Application deadline:{" "}
                    {new Date(job.applicationDeadline).toLocaleDateString()}
                  </div>

                  <button className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center space-x-2">
                    <MessageSquare className="w-4 h-4" />
                    <span>Contact Employer</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Link
                    to="/login"
                    className="block w-full bg-blue-600 text-white text-center py-4 px-6 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
                  >
                    Login to Apply
                  </Link>
                  <p className="text-center text-sm text-gray-500">
                    Don't have an account?{" "}
                    <Link
                      to="/register"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Sign up
                    </Link>{" "}
                    to apply for jobs
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
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                  {job.employer.profilePhoto ? (
                    <img
                      src={job.employer.profilePhoto}
                      alt={job.employer.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <Users className="w-8 h-8 text-gray-600" />
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h4 className="font-medium text-gray-900">
                      {job.employer.name}
                    </h4>
                    {job.employer.verified && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                  </div>
                  <p className="text-sm text-blue-600 mb-1">
                    {job.employer.title}
                  </p>
                  {job.employer.company && (
                    <p className="text-sm text-gray-600 mb-1">
                      {job.employer.company}
                    </p>
                  )}
                  <p className="text-sm text-gray-500">
                    {job.employer.location}
                  </p>
                </div>
              </div>

              {job.employer.bio && (
                <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                  {job.employer.bio}
                </p>
              )}

              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Rating:</span>
                  <div className="flex items-center space-x-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="font-medium">{job.employer.rating}</span>
                    <span className="text-gray-500">
                      ({job.employer.reviewCount} reviews)
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Member since:</span>
                  <span className="font-medium">
                    {new Date(job.employer.memberSince).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Completed projects:</span>
                  <span className="font-medium">
                    {job.employer.completedProjects}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <Link
                  to={`/profile/${job.employer.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center space-x-1"
                >
                  <span>View Full Profile</span>
                  <ArrowRight className="w-3 h-3" />
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
                  <span className="text-gray-600">Budget:</span>
                  <span className="font-medium text-green-600">
                    {formatBudget()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Experience:</span>
                  <span className="font-medium">
                    {getExperienceLevelDisplay(job.experienceLevel)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Timeline:</span>
                  <span className="font-medium">
                    {getTimelineDisplay(job.timeline)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Location:</span>
                  <span className="font-medium capitalize">{job.location}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Applications:</span>
                  <span className="font-medium">{job.applications}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-green-600 capitalize">
                    {job.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Report Job */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <button className="w-full text-left text-red-600 hover:text-red-800 transition-colors text-sm flex items-center space-x-2">
                <Flag className="w-4 h-4" />
                <span>Report this job</span>
              </button>
            </div>
          </div>
        </div>

        {/* Share Modal */}
        {showShareModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Share this job
                </h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => shareJob("copy")}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Copy Link
                </button>
                <button
                  onClick={() => shareJob("email")}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Share via Email
                </button>
                <button
                  onClick={() => shareJob("linkedin")}
                  className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Share on LinkedIn
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobDetails;
