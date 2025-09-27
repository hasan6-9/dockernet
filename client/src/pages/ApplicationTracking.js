import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MessageSquare,
  Star,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Filter,
  Search,
  MoreVertical,
  ArrowRight,
  Briefcase,
  AlertCircle,
  RefreshCw,
  Download,
  Edit,
  Trash2,
  Send,
  User,
  Building,
  MapPin,
  Target,
  Plus,
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  Award,
  BookOpen,
  Grid,
  List,
  SortAsc,
  SortDesc,
  X,
  Check,
  UserCheck,
  MessageCircle,
  ExternalLink,
} from "lucide-react";

const ApplicationTracking = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // State management
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState(
    user?.role === "senior" ? "received" : "submitted"
  );
  const [selectedApplications, setSelectedApplications] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    status: "all",
    dateRange: "30d",
    specialty: "",
    sortBy: "newest",
    search: "",
  });

  // Sample applications data - would come from API
  const [sampleApplications] = useState([
    {
      id: "1",
      jobId: "job1",
      applicantId: "user1",
      employerId: "emp1",
      status: "pending",
      job: {
        id: "job1",
        title: "Cardiology Consultation Support",
        specialty: "Cardiology",
        category: "Consultation",
        budget: 2500,
        budgetType: "fixed",
        deadline: "2024-02-15",
        employer: {
          name: "Dr. Sarah Wilson",
          title: "Cardiothoracic Surgeon",
          verified: true,
          rating: 4.9,
          company: "UCLA Medical Center",
          location: "Los Angeles, CA",
        },
      },
      applicant: {
        id: "user1",
        name: "Dr. Michael Chen",
        title: "Cardiologist",
        specialty: "Cardiology",
        experience: 8,
        rating: 4.7,
        verified: true,
        location: "San Francisco, CA",
        email: "mchen@email.com",
        phone: "+1 (555) 123-4567",
        skills: [
          "Cardiac Catheterization",
          "Echocardiography",
          "Clinical Assessment",
        ],
      },
      coverLetter:
        "Dear Dr. Wilson, I am very interested in this cardiology consultation opportunity. With over 8 years of experience in interventional cardiology, I have developed expertise in complex cardiac procedures and patient management. My background includes extensive work with cardiac catheterization and advanced imaging techniques...",
      proposalDescription:
        "I would approach this consultation by first conducting a thorough review of the patient charts and medical history. My methodology includes systematic assessment of diagnostic imaging, laboratory results, and clinical presentation. I would provide detailed recommendations with evidence-based treatment options...",
      proposedBudget: 2300,
      proposedTimeline: "2-3 weeks",
      hoursPerWeek: 15,
      availabilityStart: "2024-01-25",
      submittedAt: "2024-01-20T10:30:00Z",
      lastUpdated: "2024-01-21T14:15:00Z",
      matchScore: 94,
      messages: [
        {
          id: "m1",
          senderId: "emp1",
          senderName: "Dr. Sarah Wilson",
          message:
            "Thank you for your application. I have a few questions about your experience with complex cardiac cases.",
          timestamp: "2024-01-21T14:15:00Z",
        },
        {
          id: "m2",
          senderId: "user1",
          senderName: "Dr. Michael Chen",
          message:
            "I would be happy to discuss my experience. I have handled over 500 complex cardiac cases in the past 3 years.",
          timestamp: "2024-01-21T16:30:00Z",
        },
      ],
      documents: ["CV_Chen.pdf", "Cardiology_Certification.pdf"],
    },
    {
      id: "2",
      jobId: "job2",
      applicantId: "user2",
      employerId: "emp2",
      status: "accepted",
      job: {
        id: "job2",
        title: "Emergency Medicine Chart Review",
        specialty: "Emergency Medicine",
        category: "Chart Review",
        budget: 75,
        budgetType: "hourly",
        deadline: "2024-02-20",
        employer: {
          name: "Metropolitan Hospital",
          title: "Healthcare Institution",
          verified: true,
          rating: 4.6,
          company: "Metro Health System",
          location: "Chicago, IL",
        },
      },
      applicant: {
        id: "user2",
        name: "Dr. Lisa Rodriguez",
        title: "Emergency Medicine Physician",
        specialty: "Emergency Medicine",
        experience: 5,
        rating: 4.8,
        verified: true,
        location: "Chicago, IL",
        email: "lrodriguez@email.com",
        phone: "+1 (555) 987-6543",
        skills: ["Emergency Medicine", "Trauma Care", "Critical Care"],
      },
      coverLetter:
        "With my emergency medicine background and 5 years of clinical experience, I am well-equipped to provide thorough chart reviews for your quality assurance program...",
      proposalDescription:
        "My approach to chart review focuses on systematic evaluation of clinical decision-making, treatment protocols, and patient outcomes...",
      proposedBudget: 70,
      proposedTimeline: "1-2 weeks",
      hoursPerWeek: 20,
      availabilityStart: "2024-01-22",
      submittedAt: "2024-01-18T09:15:00Z",
      lastUpdated: "2024-01-22T11:00:00Z",
      matchScore: 88,
      messages: [
        {
          id: "m3",
          senderId: "emp2",
          senderName: "Metro Hospital HR",
          message:
            "Congratulations! We would like to move forward with your application. Please review the attached contract.",
          timestamp: "2024-01-22T11:00:00Z",
        },
      ],
      documents: ["CV_Rodriguez.pdf", "EM_Board_Cert.pdf"],
      acceptedAt: "2024-01-22T11:00:00Z",
    },
    {
      id: "3",
      jobId: "job3",
      applicantId: "user3",
      employerId: "emp3",
      status: "rejected",
      job: {
        id: "job3",
        title: "Pediatric Telemedicine Consultations",
        specialty: "Pediatrics",
        category: "Consultation",
        budget: 120,
        budgetType: "hourly",
        deadline: "2024-02-25",
        employer: {
          name: "TeleCare Solutions",
          title: "Telemedicine Company",
          verified: true,
          rating: 4.5,
          company: "TeleCare Inc.",
          location: "Remote",
        },
      },
      applicant: {
        id: "user3",
        name: "Dr. James Thompson",
        title: "Pediatrician",
        specialty: "Pediatrics",
        experience: 12,
        rating: 4.9,
        verified: true,
        location: "Denver, CO",
        email: "jthompson@email.com",
        phone: "+1 (555) 456-7890",
        skills: ["Pediatric Medicine", "Telemedicine", "Child Development"],
      },
      coverLetter:
        "I have extensive pediatric experience and am passionate about telemedicine consultations...",
      proposalDescription:
        "My telemedicine approach emphasizes building rapport with young patients and their families through virtual platforms...",
      proposedBudget: 125,
      proposedTimeline: "3-4 weeks",
      hoursPerWeek: 10,
      availabilityStart: "2024-02-01",
      submittedAt: "2024-01-15T14:20:00Z",
      lastUpdated: "2024-01-19T16:45:00Z",
      matchScore: 76,
      messages: [
        {
          id: "m4",
          senderId: "emp3",
          senderName: "TeleCare HR",
          message:
            "Thank you for your interest. We have decided to move forward with another candidate whose schedule better aligns with our immediate needs.",
          timestamp: "2024-01-19T16:45:00Z",
        },
      ],
      documents: ["CV_Thompson.pdf", "Pediatrics_Cert.pdf"],
      rejectionReason:
        "Position filled by another candidate with better schedule alignment",
      rejectedAt: "2024-01-19T16:45:00Z",
    },
    {
      id: "4",
      jobId: "job4",
      applicantId: "user4",
      employerId: "emp4",
      status: "interviewing",
      job: {
        id: "job4",
        title: "Medical Research Data Analysis",
        specialty: "Internal Medicine",
        category: "Research Support",
        budget: 5000,
        budgetType: "milestone",
        deadline: "2024-03-01",
        employer: {
          name: "Dr. Robert Kim",
          title: "Research Director",
          verified: true,
          rating: 4.8,
          company: "Boston Research Institute",
          location: "Boston, MA",
        },
      },
      applicant: {
        id: "user4",
        name: "Dr. Amanda Foster",
        title: "Internal Medicine Physician",
        specialty: "Internal Medicine",
        experience: 10,
        rating: 4.6,
        verified: true,
        location: "Boston, MA",
        email: "afoster@email.com",
        phone: "+1 (555) 321-0987",
        skills: ["Clinical Research", "Data Analysis", "Statistical Methods"],
      },
      coverLetter:
        "My research background in internal medicine and expertise in statistical analysis make me an ideal candidate...",
      proposalDescription:
        "I would approach this research project using advanced statistical methods and evidence-based analysis techniques...",
      proposedBudget: 4800,
      proposedTimeline: "4-6 weeks",
      hoursPerWeek: 25,
      availabilityStart: "2024-01-30",
      submittedAt: "2024-01-16T11:45:00Z",
      lastUpdated: "2024-01-23T10:30:00Z",
      matchScore: 91,
      messages: [
        {
          id: "m5",
          senderId: "emp4",
          senderName: "Dr. Robert Kim",
          message:
            "Your application is impressive. I would like to schedule a video interview to discuss the project details.",
          timestamp: "2024-01-23T10:30:00Z",
        },
      ],
      documents: ["CV_Foster.pdf", "Research_Portfolio.pdf"],
      interviewScheduled: true,
      interviewDate: "2024-01-25T15:00:00Z",
    },
  ]);

  // Load applications on component mount
  useEffect(() => {
    loadApplications();
  }, [viewMode, filters]);

  const loadApplications = async () => {
    try {
      setLoading(true);
      // API call would be here
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Filter applications based on user role
      let filteredApps = [...sampleApplications];

      if (user?.role === "junior") {
        // Show applications submitted by this user
        filteredApps = filteredApps.filter(
          (app) => app.applicantId === user.id
        );
      } else if (user?.role === "senior") {
        // Show applications received for this user's job postings
        filteredApps = filteredApps.filter((app) => app.employerId === user.id);
      }

      setApplications(filteredApps);
    } catch (err) {
      setError("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  // Filter applications based on current filters
  const filteredApplications = applications.filter((app) => {
    const matchesStatus =
      filters.status === "all" || app.status === filters.status;
    const matchesSpecialty =
      !filters.specialty || app.job.specialty === filters.specialty;
    const matchesSearch =
      !filters.search ||
      app.job.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      app.applicant.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      app.job.employer.name
        .toLowerCase()
        .includes(filters.search.toLowerCase());

    return matchesStatus && matchesSpecialty && matchesSearch;
  });

  // Sort applications
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    switch (filters.sortBy) {
      case "newest":
        return new Date(b.submittedAt) - new Date(a.submittedAt);
      case "oldest":
        return new Date(a.submittedAt) - new Date(b.submittedAt);
      case "match":
        return (b.matchScore || 0) - (a.matchScore || 0);
      case "budget":
        return b.proposedBudget - a.proposedBudget;
      case "deadline":
        return new Date(a.job.deadline) - new Date(b.job.deadline);
      default:
        return 0;
    }
  });

  // Handle application actions
  const handleApplicationAction = async (applicationId, action, note = "") => {
    try {
      setLoading(true);
      // API call would be here
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setApplications((prevApps) =>
        prevApps.map((app) =>
          app.id === applicationId
            ? { ...app, status: action, lastUpdated: new Date().toISOString() }
            : app
        )
      );

      setSuccess(`Application ${action} successfully!`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(`Failed to ${action} application`);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action) => {
    try {
      setLoading(true);
      // API call would be here
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setApplications((prevApps) =>
        prevApps.map((app) =>
          selectedApplications.includes(app.id)
            ? { ...app, status: action, lastUpdated: new Date().toISOString() }
            : app
        )
      );

      setSelectedApplications([]);
      setShowBulkActions(false);
      setSuccess(
        `${selectedApplications.length} applications ${action} successfully!`
      );
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(`Failed to ${action} selected applications`);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Send message
  const handleSendMessage = async (applicationId, message) => {
    try {
      setLoading(true);
      // API call would be here
      await new Promise((resolve) => setTimeout(resolve, 500));

      setApplications((prevApps) =>
        prevApps.map((app) =>
          app.id === applicationId
            ? {
                ...app,
                messages: [
                  ...app.messages,
                  {
                    id: Date.now().toString(),
                    senderId: user.id,
                    senderName: `${user.firstName} ${user.lastName}`,
                    message,
                    timestamp: new Date().toISOString(),
                  },
                ],
              }
            : app
        )
      );

      setShowMessageModal(false);
      setSuccess("Message sent successfully!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError("Failed to send message");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Get status styling
  const getStatusStyle = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      reviewed: "bg-blue-100 text-blue-800 border-blue-200",
      interviewing: "bg-purple-100 text-purple-800 border-purple-200",
      accepted: "bg-green-100 text-green-800 border-green-200",
      rejected: "bg-red-100 text-red-800 border-red-200",
      withdrawn: "bg-gray-100 text-gray-800 border-gray-200",
    };
    return styles[status] || styles.pending;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: Clock,
      reviewed: Eye,
      interviewing: Users,
      accepted: CheckCircle,
      rejected: XCircle,
      withdrawn: XCircle,
    };
    const Icon = icons[status] || Clock;
    return <Icon className="w-4 h-4" />;
  };

  // Calculate stats
  const calculateStats = () => {
    const totalApps = applications.length;
    const pendingApps = applications.filter(
      (app) => app.status === "pending"
    ).length;
    const acceptedApps = applications.filter(
      (app) => app.status === "accepted"
    ).length;
    const rejectedApps = applications.filter(
      (app) => app.status === "rejected"
    ).length;
    const interviewingApps = applications.filter(
      (app) => app.status === "interviewing"
    ).length;
    const successRate =
      totalApps > 0
        ? Math.round(((acceptedApps + interviewingApps) / totalApps) * 100)
        : 0;

    return {
      totalApps,
      pendingApps,
      acceptedApps,
      rejectedApps,
      interviewingApps,
      successRate,
    };
  };

  const stats = calculateStats();

  // Stats cards component
  const StatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">
              Total Applications
            </p>
            <p className="text-2xl font-bold text-gray-900">
              {stats.totalApps}
            </p>
          </div>
          <FileText className="w-8 h-8 text-blue-600" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">
              {stats.pendingApps}
            </p>
          </div>
          <Clock className="w-8 h-8 text-yellow-600" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">Accepted</p>
            <p className="text-2xl font-bold text-green-600">
              {stats.acceptedApps}
            </p>
          </div>
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">
              Interviewing
            </p>
            <p className="text-2xl font-bold text-purple-600">
              {stats.interviewingApps}
            </p>
          </div>
          <Users className="w-8 h-8 text-purple-600" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">
              Success Rate
            </p>
            <p className="text-2xl font-bold text-blue-600">
              {stats.successRate}%
            </p>
          </div>
          <TrendingUp className="w-8 h-8 text-blue-600" />
        </div>
      </div>
    </div>
  );

  // Bulk actions component
  const BulkActionsBar = () =>
    showBulkActions &&
    selectedApplications.length > 0 && (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-blue-900">
              {selectedApplications.length} application
              {selectedApplications.length > 1 ? "s" : ""} selected
            </span>
          </div>
          <div className="flex space-x-2">
            {user?.role === "senior" && (
              <>
                <button
                  onClick={() => handleBulkAction("accepted")}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  Accept All
                </button>
                <button
                  onClick={() => handleBulkAction("rejected")}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  Reject All
                </button>
              </>
            )}
            <button
              onClick={() => {
                setSelectedApplications([]);
                setShowBulkActions(false);
              }}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.role === "senior"
                ? "Application Management"
                : "My Applications"}
            </h1>
            <p className="text-gray-600 mt-2">
              {user?.role === "senior"
                ? "Review and manage applications for your job postings"
                : "Track your job applications and their progress"}
            </p>
          </div>

          <div className="flex space-x-4">
            {user?.role === "senior" ? (
              <Link
                to="/jobs/create"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-sm"
              >
                <Plus className="w-5 h-5" />
                <span>Post New Job</span>
              </Link>
            ) : (
              <Link
                to="/jobs"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-sm"
              >
                <Search className="w-5 h-5" />
                <span>Browse Jobs</span>
              </Link>
            )}

            {user?.role === "senior" && applications.length > 0 && (
              <button
                onClick={() => setShowBulkActions(!showBulkActions)}
                className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
              >
                <UserCheck className="w-5 h-5" />
                <span>Bulk Actions</span>
              </button>
            )}
          </div>
        </div>

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

        {/* Stats Cards */}
        <StatsCards />

        {/* Bulk Actions Bar */}
        <BulkActionsBar />

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative flex-1 lg:w-96">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search applications..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Status Filter Tabs */}
              <div className="flex space-x-2">
                {[
                  { value: "all", label: "All" },
                  { value: "pending", label: "Pending" },
                  { value: "interviewing", label: "Interviewing" },
                  { value: "accepted", label: "Accepted" },
                  { value: "rejected", label: "Rejected" },
                ].map((status) => (
                  <button
                    key={status.value}
                    onClick={() =>
                      setFilters((prev) => ({ ...prev, status: status.value }))
                    }
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      filters.status === status.value
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>More Filters</span>
                {showFilters ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={loadApplications}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                <span>Refresh</span>
              </button>

              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t border-gray-200 pt-6 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialty
                  </label>
                  <select
                    value={filters.specialty}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        specialty: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All Specialties</option>
                    <option value="Cardiology">Cardiology</option>
                    <option value="Emergency Medicine">
                      Emergency Medicine
                    </option>
                    <option value="Pediatrics">Pediatrics</option>
                    <option value="Internal Medicine">Internal Medicine</option>
                    <option value="Surgery">Surgery</option>
                    <option value="Radiology">Radiology</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date Range
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        dateRange: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="all">All time</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        sortBy: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="newest">Most Recent</option>
                    <option value="oldest">Oldest First</option>
                    <option value="match">Best Match</option>
                    <option value="budget">Budget (High to Low)</option>
                    <option value="deadline">Deadline Soon</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end mt-4">
                <button
                  onClick={() => {
                    setFilters({
                      status: "all",
                      dateRange: "30d",
                      specialty: "",
                      sortBy: "newest",
                      search: "",
                    });
                  }}
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center space-x-1"
                >
                  <X className="w-4 h-4" />
                  <span>Clear all filters</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Applications List */}
        <div className="space-y-6">
          {loading ? (
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 animate-pulse"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-4/5"></div>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                    <div className="flex space-x-2">
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                      <div className="h-8 bg-gray-200 rounded w-24"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : sortedApplications.length > 0 ? (
            sortedApplications.map((application) => (
              <ApplicationCard key={application.id} application={application} />
            ))
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                No Applications Found
              </h3>
              <p className="text-gray-600 mb-6">
                {user?.role === "senior"
                  ? "No applications have been received for your job postings yet."
                  : "You haven't submitted any applications yet."}
              </p>
              {user?.role === "junior" && (
                <Link
                  to="/jobs"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                >
                  <Search className="w-5 h-5" />
                  <span>Browse Jobs</span>
                </Link>
              )}
              {user?.role === "senior" && (
                <Link
                  to="/jobs/create"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Post a Job</span>
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Application Detail Modal */}
        {showApplicationModal && selectedApplication && (
          <ApplicationDetailModal
            application={selectedApplication}
            onClose={() => {
              setShowApplicationModal(false);
              setSelectedApplication(null);
            }}
            onAction={handleApplicationAction}
            userRole={user?.role}
          />
        )}

        {/* Message Modal */}
        {showMessageModal && selectedApplication && (
          <MessageModal
            application={selectedApplication}
            onClose={() => {
              setShowMessageModal(false);
              setSelectedApplication(null);
            }}
            onSendMessage={handleSendMessage}
            currentUser={user}
          />
        )}
      </div>
    </div>
  );

  // Application Card Component
  function ApplicationCard({ application }) {
    const [showDropdown, setShowDropdown] = useState(false);

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 hover:shadow-lg transition-shadow">
        {/* Application Header */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              {user?.role === "senior" && (
                <input
                  type="checkbox"
                  checked={selectedApplications.includes(application.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedApplications((prev) => [
                        ...prev,
                        application.id,
                      ]);
                    } else {
                      setSelectedApplications((prev) =>
                        prev.filter((id) => id !== application.id)
                      );
                    }
                  }}
                  className="w-4 h-4 text-blue-600 rounded"
                />
              )}
              <Link
                to={`/jobs/${application.job.id}`}
                className="text-xl font-semibold text-gray-900 hover:text-blue-600 transition-colors"
              >
                {application.job.title}
              </Link>
              {application.matchScore && (
                <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                  {application.matchScore}% match
                </span>
              )}
            </div>

            <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
              <span className="flex items-center space-x-1">
                <Star className="w-4 h-4" />
                <span>{application.job.specialty}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Briefcase className="w-4 h-4" />
                <span>{application.job.category}</span>
              </span>
              <span className="flex items-center space-x-1">
                <DollarSign className="w-4 h-4" />
                <span>
                  ${application.proposedBudget.toLocaleString()}
                  {application.job.budgetType === "hourly" && "/hr"}
                </span>
              </span>
              <span className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>
                  Applied{" "}
                  {new Date(application.submittedAt).toLocaleDateString()}
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusStyle(
                application.status
              )}`}
            >
              {getStatusIcon(application.status)}
              <span className="capitalize">{application.status}</span>
            </span>

            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-gray-500" />
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                  <button
                    onClick={() => {
                      setSelectedApplication(application);
                      setShowApplicationModal(true);
                      setShowDropdown(false);
                    }}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 w-full text-left first:rounded-t-lg"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedApplication(application);
                      setShowMessageModal(true);
                      setShowDropdown(false);
                    }}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 w-full text-left"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Send Message</span>
                  </button>

                  {user?.role === "senior" &&
                    application.status === "pending" && (
                      <>
                        <div className="border-t border-gray-100"></div>
                        <button
                          onClick={() => {
                            handleApplicationAction(application.id, "accepted");
                            setShowDropdown(false);
                          }}
                          className="flex items-center space-x-3 px-4 py-3 text-green-600 hover:bg-green-50 w-full text-left"
                        >
                          <CheckCircle className="w-4 h-4" />
                          <span>Accept Application</span>
                        </button>
                        <button
                          onClick={() => {
                            handleApplicationAction(application.id, "rejected");
                            setShowDropdown(false);
                          }}
                          className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 w-full text-left"
                        >
                          <XCircle className="w-4 h-4" />
                          <span>Reject Application</span>
                        </button>
                      </>
                    )}

                  {user?.role === "junior" &&
                    application.status === "pending" && (
                      <>
                        <div className="border-t border-gray-100"></div>
                        <button
                          onClick={() => {
                            handleApplicationAction(
                              application.id,
                              "withdrawn"
                            );
                            setShowDropdown(false);
                          }}
                          className="flex items-center space-x-3 px-4 py-3 text-red-600 hover:bg-red-50 w-full text-left last:rounded-b-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Withdraw Application</span>
                        </button>
                      </>
                    )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Applicant/Employer Info */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {user?.role === "senior"
                ? application.applicant.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                : application.job.employer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
            </div>
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="font-semibold text-gray-900">
                  {user?.role === "senior"
                    ? application.applicant.name
                    : application.job.employer.name}
                </h4>
                {(user?.role === "senior"
                  ? application.applicant.verified
                  : application.job.employer.verified) && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
              </div>
              <p className="text-sm text-gray-600">
                {user?.role === "senior"
                  ? application.applicant.title
                  : application.job.employer.title}
              </p>
              <div className="flex items-center space-x-3 text-xs text-gray-500 mt-1">
                {user?.role === "senior" &&
                  application.applicant.experience && (
                    <span>
                      {application.applicant.experience} years experience
                    </span>
                  )}
                <div className="flex items-center space-x-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span>
                    {user?.role === "senior"
                      ? application.applicant.rating
                      : application.job.employer.rating}
                  </span>
                </div>
                <span>{application.messages?.length || 0} messages</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-500 mb-1">
              Last updated:{" "}
              {new Date(application.lastUpdated).toLocaleDateString()}
            </div>
            <div className="text-xs text-gray-400">
              Timeline: {application.proposedTimeline}
            </div>
          </div>
        </div>

        {/* Cover Letter Preview */}
        <div className="mb-6">
          <p className="text-gray-700 text-sm line-clamp-3">
            {application.coverLetter}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-100">
          <div className="flex space-x-3">
            <button
              onClick={() => {
                setSelectedApplication(application);
                setShowApplicationModal(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <Eye className="w-4 h-4" />
              <span>View Details</span>
            </button>

            <button
              onClick={() => {
                setSelectedApplication(application);
                setShowMessageModal(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Message</span>
            </button>
          </div>

          {user?.role === "senior" && application.status === "pending" && (
            <div className="flex space-x-2">
              <button
                onClick={() =>
                  handleApplicationAction(application.id, "accepted")
                }
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                <Check className="w-4 h-4" />
                <span>Accept</span>
              </button>
              <button
                onClick={() =>
                  handleApplicationAction(application.id, "rejected")
                }
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                <X className="w-4 h-4" />
                <span>Reject</span>
              </button>
            </div>
          )}
        </div>

        {/* Special Status Indicators */}
        {application.status === "interviewing" && application.interviewDate && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center space-x-3 text-blue-800">
              <Calendar className="w-5 h-5" />
              <div>
                <p className="font-medium">Interview Scheduled</p>
                <p className="text-sm">
                  {new Date(application.interviewDate).toLocaleDateString()} at{" "}
                  {new Date(application.interviewDate).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          </div>
        )}

        {application.status === "accepted" && application.acceptedAt && (
          <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center space-x-3 text-green-800">
              <CheckCircle className="w-5 h-5" />
              <div>
                <p className="font-medium">Application Accepted</p>
                <p className="text-sm">
                  Accepted on{" "}
                  {new Date(application.acceptedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        )}

        {application.status === "rejected" && application.rejectionReason && (
          <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start space-x-3 text-red-800">
              <XCircle className="w-5 h-5 mt-0.5" />
              <div>
                <p className="font-medium">Application Rejected</p>
                <p className="text-sm">{application.rejectionReason}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Application Detail Modal Component
  function ApplicationDetailModal({
    application,
    onClose,
    onAction,
    userRole,
  }) {
    const [activeTab, setActiveTab] = useState("details");

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {application.job.title}
              </h2>
              <p className="text-gray-600 mt-1">
                Application from {application.applicant.name}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span
                className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium border ${getStatusStyle(
                  application.status
                )}`}
              >
                {getStatusIcon(application.status)}
                <span className="capitalize">{application.status}</span>
              </span>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            {[
              { id: "details", label: "Application Details" },
              {
                id: "messages",
                label: `Messages (${application.messages?.length || 0})`,
              },
              { id: "profile", label: "Applicant Profile" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
            {activeTab === "details" && (
              <div className="space-y-6">
                {/* Application Overview */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Proposal Details
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Proposed Budget
                        </span>
                        <p className="text-lg font-semibold text-gray-900">
                          ${application.proposedBudget.toLocaleString()}
                          {application.job.budgetType === "hourly" && "/hour"}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Timeline
                        </span>
                        <p className="text-gray-900">
                          {application.proposedTimeline}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Hours per Week
                        </span>
                        <p className="text-gray-900">
                          {application.hoursPerWeek} hours
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Availability Start
                        </span>
                        <p className="text-gray-900">
                          {new Date(
                            application.availabilityStart
                          ).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Application Info
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Submitted
                        </span>
                        <p className="text-gray-900">
                          {new Date(
                            application.submittedAt
                          ).toLocaleDateString()}{" "}
                          at{" "}
                          {new Date(
                            application.submittedAt
                          ).toLocaleTimeString()}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">
                          Match Score
                        </span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${application.matchScore}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-blue-600">
                            {application.matchScore}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cover Letter */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Cover Letter
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {application.coverLetter}
                    </p>
                  </div>
                </div>

                {/* Project Approach */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Project Approach
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-6">
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                      {application.proposalDescription}
                    </p>
                  </div>
                </div>

                {/* Documents */}
                {application.documents && application.documents.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Attached Documents
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {application.documents.map((doc, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <FileText className="w-8 h-8 text-blue-600" />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{doc}</p>
                            <p className="text-sm text-gray-500">
                              PDF Document
                            </p>
                          </div>
                          <button className="text-blue-600 hover:text-blue-800">
                            <Download className="w-5 h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === "messages" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Message Thread
                  </h3>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    Send Message
                  </button>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {application.messages?.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.senderId === user?.id
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
                          message.senderId === user?.id
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium">
                            {message.senderName}
                          </span>
                          <span className="text-xs opacity-75">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </span>
                        </div>
                        <p className="text-sm">{message.message}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {(!application.messages ||
                  application.messages.length === 0) && (
                  <div className="text-center py-8">
                    <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No messages yet</p>
                    <p className="text-sm text-gray-400">
                      Start a conversation with the applicant
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "profile" && (
              <div className="space-y-6">
                {/* Applicant Header */}
                <div className="flex items-center space-x-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {application.applicant.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {application.applicant.name}
                      </h3>
                      {application.applicant.verified && (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                      )}
                    </div>
                    <p className="text-lg text-blue-600 font-semibold mb-1">
                      {application.applicant.title}
                    </p>
                    <div className="flex items-center space-x-4 text-gray-600">
                      <span className="flex items-center space-x-1">
                        <MapPin className="w-4 h-4" />
                        <span>{application.applicant.location}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Briefcase className="w-4 h-4" />
                        <span>
                          {application.applicant.experience} years experience
                        </span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>{application.applicant.rating}</span>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      Contact Information
                    </h4>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">
                          {application.applicant.email}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-700">
                          {application.applicant.phone}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      Specialization
                    </h4>
                    <div className="space-y-2">
                      <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                        {application.applicant.specialty}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">
                    Skills & Expertise
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {application.applicant.skills?.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* View Full Profile Button */}
                <div className="pt-4 border-t border-gray-200">
                  <Link
                    to={`/profile/${application.applicant.id}`}
                    className="inline-flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ExternalLink className="w-5 h-5" />
                    <span>View Full Profile</span>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Modal Actions */}
          {userRole === "senior" && application.status === "pending" && (
            <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  onAction(application.id, "rejected");
                  onClose();
                }}
                className="px-6 py-3 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors font-medium"
              >
                Reject Application
              </button>
              <button
                onClick={() => {
                  onAction(application.id, "accepted");
                  onClose();
                }}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Accept Application
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Message Modal Component
  function MessageModal({ application, onClose, onSendMessage, currentUser }) {
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);

    const handleSend = async () => {
      if (!message.trim()) return;

      setSending(true);
      await onSendMessage(application.id, message);
      setMessage("");
      setSending(false);
      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Send Message</h2>
              <p className="text-gray-600 mt-1">
                To:{" "}
                {currentUser?.role === "senior"
                  ? application.applicant.name
                  : application.job.employer.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Previous Messages */}
          <div className="p-6 max-h-60 overflow-y-auto border-b border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Previous Messages
            </h3>
            <div className="space-y-3">
              {application.messages?.slice(-3).map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg text-sm ${
                    msg.senderId === currentUser?.id
                      ? "bg-blue-50 text-blue-900 ml-8"
                      : "bg-gray-100 text-gray-900 mr-8"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{msg.senderName}</span>
                    <span className="text-xs opacity-75">
                      {new Date(msg.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p>{msg.message}</p>
                </div>
              ))}
              {(!application.messages || application.messages.length === 0) && (
                <p className="text-gray-500 text-sm">No previous messages</p>
              )}
            </div>
          </div>

          {/* Message Composer */}
          <div className="p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={6}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Type your message here..."
            />
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                {message.length} characters
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || sending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {sending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};

export default ApplicationTracking;
