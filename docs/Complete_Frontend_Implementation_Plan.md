# 🎯 Doconnect Frontend - Complete Implementation Plan

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Status**: Complete and Ready for Implementation

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Implementation Strategy](#implementation-strategy)
4. [Phase 1: Foundation](#phase-1-foundation-complete)
5. [Phase 2: Core Pages](#phase-2-core-pages)
6. [Phase 3: UI Components](#phase-3-ui-components)
7. [Component Architecture](#component-architecture)
8. [Design System Guidelines](#design-system-guidelines)
9. [API Integration Patterns](#api-integration-patterns)
10. [Testing Strategy](#testing-strategy)
11. [Deployment Guide](#deployment-guide)
12. [Troubleshooting](#troubleshooting)
13. [Success Metrics](#success-metrics)

---

## Executive Summary

### Project Overview

**Doconnect** is a MERN-stack medical marketplace platform connecting senior doctors (employers) with junior doctors (freelancers) for medical opportunities. Think "Upwork for Doctors."

### Current Status

✅ **Foundation Complete**

- Consolidated API service layer (`api/index.js`)
- Enhanced AuthContext with permissions system
- Memory-based token management (Claude.ai compatible)
- Professional design system in Tailwind config
- All routes configured in App.js

⏳ **Next Phase: Page Implementation**

- 14 pages to update with real API integration
- Remove all mock data
- Implement consistent UI/UX
- Add proper error handling

### Implementation Approach

**Progressive Enhancement Strategy**: Update pages one at a time in new chat sessions to avoid token limits.

**Timeline**: 26 working days (5-6 weeks at normal pace)

---

## Current State Analysis

### ✅ Strengths

**1. Excellent Foundation**

- Modern tech stack (React 19, TanStack Query, React Hook Form)
- Professional Tailwind design system
- Comprehensive routing structure
- All dependencies installed

**2. Well-Structured API Layer**

- Complete backend API documented
- All endpoints mapped
- Proper interceptors
- Error handling utilities

**3. Strong Authentication**

- Multi-level permission system
- Role-based access control
- Verification status tracking
- Profile completion monitoring

**4. Professional Design System**

- Medical-themed color palette
- Custom Tailwind components
- Glass morphism effects
- Responsive utilities

### ⚠️ Areas Needing Work

**1. Mock Data**

- Pages currently use hardcoded data
- Need real-time API integration

**2. Incomplete Features**

- Some pages partially implemented
- Missing error/loading states
- Inconsistent styling

**3. API Integration Gaps**

- Need to replace all data fetching with TanStack Query
- Add proper mutations for all actions

---

## Implementation Strategy

### Progressive Enhancement

**Core Principle**: One page at a time, tested and committed.

**Workflow Per Page**:

1. Start fresh Claude chat (avoid token limits)
2. Attach documentation (API docs, README, Implementation Plan, Master Prompt)
3. Attach page file(s)
4. Receive production-ready implementation
5. Test locally
6. Commit changes
7. Move to next page

### Benefits of This Approach

✅ **No Token Limits** - Fresh context each time  
✅ **Consistent Quality** - Same standards applied  
✅ **Incremental Progress** - Working features at each step  
✅ **Easy Testing** - One feature at a time  
✅ **Risk Mitigation** - Catch issues early

---

## Phase 1: Foundation (COMPLETE ✅)

### Deliverables

#### 1. Consolidated API Service (`api/index.js`)

**Features**:

- All endpoints organized by domain (auth, profile, jobs, applications, admin, matching)
- Memory-based token management (no localStorage)
- Request/response interceptors
- Error handling utilities
- File upload with progress tracking
- Data formatters and validators

**Example Usage**:

```javascript
import { authAPI, jobAPI, profileAPI, applicationAPI } from "../api";

// Authentication
const result = await authAPI.login(credentials);
const user = await authAPI.getMe();

// Jobs
const jobs = await jobAPI.browse({ category: "research" });
const job = await jobAPI.getById(jobId);

// Applications
const app = await applicationAPI.submit(applicationData);
```

#### 2. Enhanced AuthContext (`context/AuthContext.js`)

**Features**:

- Complete user state management
- Multi-level permissions (basic, active, professional, premium, admin)
- Verification status tracking
- Profile completion monitoring
- Role helpers (isJunior, isSenior, isAdmin)
- Permission checking (hasPermission, canAccessRoute)

**Example Usage**:

```javascript
import { useAuth } from "../context/AuthContext";

const Component = () => {
  const {
    user,
    isAuthenticated,
    isJunior,
    isSenior,
    hasPermission,
    login,
    logout,
  } = useAuth();

  if (!hasPermission("canAccessActiveFeatures")) {
    return <AccessDenied />;
  }

  return (
    <>
      {isJunior() && <JuniorView />}
      {isSenior() && <SeniorView />}
    </>
  );
};
```

#### 3. Token Management

**Key Changes**:

- No localStorage (Claude.ai compatible)
- Memory-based storage with API client integration
- Automatic token attachment to requests
- Unauthorized handler for expired tokens

---

## Phase 2: Core Pages

### Week 1: Authentication & Dashboard

#### Day 1-2: Login & Register Pages

**Login.js Implementation**:

```javascript
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    const result = await login(data);
    if (result.success) {
      toast.success("Login successful!");
      navigate("/dashboard");
    } else {
      toast.error(result.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        type="email"
        {...register("email", { required: "Email is required" })}
        className="input w-full"
      />
      {errors.email && <p className="text-red-600">{errors.email.message}</p>}

      <input
        type="password"
        {...register("password", { required: "Password is required" })}
        className="input w-full"
      />
      {errors.password && (
        <p className="text-red-600">{errors.password.message}</p>
      )}

      <button type="submit" disabled={loading} className="btn-medical w-full">
        {loading ? "Logging in..." : "Login"}
      </button>
    </form>
  );
};
```

**Register.js Implementation**:

- Multi-step registration form
- Role selection (senior/junior)
- Medical credential collection
- Validation at each step
- Profile completion tracking

**Testing Checklist**:

- [ ] Login with valid credentials → Dashboard
- [ ] Login with invalid credentials → Error message
- [ ] Form validation works
- [ ] Registration completes successfully
- [ ] Role selection works
- [ ] Redirects properly after registration

---

#### Day 3-4: Dashboard Page

**Role-Specific Dashboards**:

**Junior Doctor Dashboard**:

```javascript
const JuniorDashboard = () => {
  const { data: applications } = useQuery({
    queryKey: ["my-applications"],
    queryFn: () => applicationAPI.getMyApplications({ limit: 5 }),
  });

  const { data: recommendations } = useQuery({
    queryKey: ["job-recommendations"],
    queryFn: () => jobAPI.getRecommendations({ limit: 5 }),
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DashboardCard title="My Applications">
        {applications?.data?.data?.map((app) => (
          <ApplicationCard key={app.id} application={app} />
        ))}
      </DashboardCard>

      <DashboardCard title="Recommended Jobs">
        {recommendations?.data?.data?.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </DashboardCard>
    </div>
  );
};
```

**Senior Doctor Dashboard**:

```javascript
const SeniorDashboard = () => {
  const { data: myJobs } = useQuery({
    queryKey: ["my-jobs"],
    queryFn: () => jobAPI.getMyJobs({ limit: 5 }),
  });

  const { data: applications } = useQuery({
    queryKey: ["received-applications"],
    queryFn: () => applicationAPI.getReceived({ limit: 5 }),
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <DashboardCard title="My Job Postings">
        {myJobs?.data?.data?.map((job) => (
          <JobCard key={job.id} job={job} isOwner />
        ))}
      </DashboardCard>

      <DashboardCard title="Recent Applications">
        {applications?.data?.data?.map((app) => (
          <ApplicationCard key={app.id} application={app} isEmployer />
        ))}
      </DashboardCard>
    </div>
  );
};
```

**Testing Checklist**:

- [ ] Junior dashboard shows applications and recommendations
- [ ] Senior dashboard shows jobs and received applications
- [ ] Admin dashboard shows platform statistics
- [ ] Loading states work
- [ ] Error handling works
- [ ] Navigation links work

---

### Week 2: Profile Management

#### Day 5-7: Enhanced Profile Page

**Profile Sections**:

1. **Profile Photo Upload**

```javascript
const ProfilePhotoSection = () => {
  const { uploadProfilePhoto } = useAuth();
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: (file) => uploadProfilePhoto(file, setProgress),
    onSuccess: () => {
      toast.success("Photo uploaded!");
      refetch();
    },
  });

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => mutation.mutate(e.target.files[0])}
      />
      {progress > 0 && <ProgressBar value={progress} />}
    </div>
  );
};
```

2. **Basic Information**
3. **Experience Timeline**
4. **Skills & Certifications**
5. **Documents Upload**
6. **Privacy Settings**

**Testing Checklist**:

- [ ] Load existing profile data
- [ ] Upload profile photo
- [ ] Update basic information
- [ ] Add/edit/delete experience
- [ ] Update skills
- [ ] Upload documents
- [ ] Profile completion updates

---

### Week 3: Job System

#### Day 8-10: Job Posting & Management

**JobPosting.js - Multi-Step Wizard**:

```javascript
const JobPosting = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});

  const mutation = useMutation({
    mutationFn: (data) => jobAPI.create(data),
    onSuccess: () => {
      toast.success("Job posted!");
      navigate("/jobs/manage");
    },
  });

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <StepsIndicator currentStep={step} totalSteps={4} />

      {/* Step Content */}
      {step === 1 && <BasicInfoStep data={formData} onChange={setFormData} />}
      {step === 2 && (
        <RequirementsStep data={formData} onChange={setFormData} />
      )}
      {step === 3 && (
        <BudgetTimelineStep data={formData} onChange={setFormData} />
      )}
      {step === 4 && (
        <ReviewSubmitStep data={formData} onSubmit={mutation.mutate} />
      )}

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        {step > 1 && (
          <button onClick={() => setStep(step - 1)} className="btn-secondary">
            Previous
          </button>
        )}
        {step < 4 ? (
          <button
            onClick={() => setStep(step + 1)}
            className="btn-primary ml-auto"
          >
            Next
          </button>
        ) : (
          <button
            onClick={() => mutation.mutate(formData)}
            className="btn-medical ml-auto"
          >
            Publish Job
          </button>
        )}
      </div>
    </div>
  );
};
```

**JobManagement.js - Senior Dashboard**:

```javascript
const JobManagement = () => {
  const [filters, setFilters] = useState({ status: "all", page: 1 });

  const { data: jobs, refetch } = useQuery({
    queryKey: ["my-jobs", filters],
    queryFn: () => jobAPI.getMyJobs(filters),
  });

  return (
    <div>
      <div className="flex justify-between mb-8">
        <h1 className="text-3xl font-bold">My Job Postings</h1>
        <button onClick={() => navigate("/jobs/post")} className="btn-medical">
          + Post New Job
        </button>
      </div>

      <JobFilters filters={filters} onChange={setFilters} />

      <div className="grid gap-6">
        {jobs?.data?.data?.map((job) => (
          <JobManagementCard
            key={job.id}
            job={job}
            onEdit={() => navigate(`/jobs/${job.id}/edit`)}
            onPause={() => jobAPI.pause(job.id).then(refetch)}
            onViewApplications={() => navigate(`/applications?jobId=${job.id}`)}
          />
        ))}
      </div>
    </div>
  );
};
```

**Testing Checklist**:

- [ ] Create new job (all 4 steps)
- [ ] Edit existing job
- [ ] Pause/activate job
- [ ] View applications for job
- [ ] Filter jobs by status
- [ ] Delete job

---

#### Day 11-12: Job Browse & Details

**JobBrowse.js - Public Discovery**:

```javascript
const JobBrowse = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({});

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["jobs-browse", searchTerm, filters],
    queryFn: () =>
      searchTerm
        ? jobAPI.search({ searchTerm, ...filters })
        : jobAPI.browse(filters),
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Filters Sidebar */}
      <div className="lg:col-span-1">
        <FiltersPanel filters={filters} onChange={setFilters} />
      </div>

      {/* Jobs Grid */}
      <div className="lg:col-span-3">
        <SearchBar value={searchTerm} onChange={setSearchTerm} />

        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid gap-6">
            {jobs?.data?.data?.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

        <Pagination
          page={filters.page}
          totalPages={jobs?.data?.pagination?.pages}
          onChange={(page) => setFilters({ ...filters, page })}
        />
      </div>
    </div>
  );
};
```

**JobDetails.js - Individual View**:

```javascript
const JobDetails = () => {
  const { jobId } = useParams();
  const { user, isJunior } = useAuth();

  const { data: job, isLoading } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => jobAPI.getById(jobId),
  });

  // Track view
  useEffect(() => {
    jobAPI.trackView(jobId);
  }, [jobId]);

  const isOwner = job?.data?.posted_by?._id === user?.id;

  return (
    <div className="max-w-5xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        <h1 className="text-3xl font-bold mb-4">{job?.data?.title}</h1>

        <div className="flex items-center gap-4 text-gray-600 mb-6">
          <span>{job?.data?.category}</span>
          <span>•</span>
          <span>{job?.data?.specialty}</span>
          <span>•</span>
          <span>{formatters.budget(job?.data)}</span>
        </div>

        {isJunior() && !isOwner && (
          <button
            onClick={() => navigate(`/jobs/${jobId}/apply`)}
            className="btn-medical"
          >
            Apply Now
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-xl font-bold mb-4">Description</h2>
        <p className="whitespace-pre-wrap">{job?.data?.description}</p>
      </div>
    </div>
  );
};
```

**Testing Checklist**:

- [ ] Browse all jobs
- [ ] Search by keyword
- [ ] Filter by category, specialty, experience
- [ ] View job details
- [ ] Apply button shows for juniors
- [ ] Edit button shows for owner
- [ ] Track views works

---

### Week 4: Applications

#### Day 13-15: Application System

**ApplicationSubmission.js**:

```javascript
const ApplicationSubmission = () => {
  const { jobId } = useParams();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const { data: job } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => jobAPI.getById(jobId),
  });

  const mutation = useMutation({
    mutationFn: (data) =>
      applicationAPI.submit({
        job_id: jobId,
        proposal: {
          cover_letter: data.coverLetter,
          approach: data.approach,
          timeline_days: data.timelineDays,
          proposed_budget: data.proposedBudget,
        },
      }),
    onSuccess: () => {
      toast.success("Application submitted!");
      navigate("/applications");
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
      <textarea
        {...register("coverLetter", {
          required: "Cover letter required",
          minLength: { value: 100, message: "Min 100 characters" },
        })}
        className="input w-full"
        rows={6}
      />
      {errors.coverLetter && (
        <ErrorText>{errors.coverLetter.message}</ErrorText>
      )}

      <textarea
        {...register("approach", {
          required: "Approach required",
          minLength: { value: 50, message: "Min 50 characters" },
        })}
        className="input w-full"
        rows={8}
      />

      <input
        type="number"
        {...register("proposedBudget", { required: true, min: 0 })}
        className="input w-full"
      />

      <button
        type="submit"
        disabled={mutation.isLoading}
        className="btn-medical"
      >
        {mutation.isLoading ? "Submitting..." : "Submit Application"}
      </button>
    </form>
  );
};
```

**ApplicationTracking.js - Dual View**:

```javascript
const ApplicationTracking = () => {
  const { isJunior } = useAuth();
  const [filters, setFilters] = useState({ status: "all", page: 1 });

  const { data: applications, refetch } = useQuery({
    queryKey: ["applications", filters, isJunior()],
    queryFn: () =>
      isJunior()
        ? applicationAPI.getMyApplications(filters)
        : applicationAPI.getReceived(filters),
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">
        {isJunior() ? "My Applications" : "Applications Received"}
      </h1>

      <ApplicationFilters filters={filters} onChange={setFilters} />

      <div className="space-y-6">
        {applications?.data?.data?.map((app) => (
          <ApplicationCard
            key={app.id}
            application={app}
            isJunior={isJunior()}
            onStatusUpdate={(status) =>
              applicationAPI.updateStatus(app.id, status).then(refetch)
            }
          />
        ))}
      </div>
    </div>
  );
};
```

**Testing Checklist**:

- [ ] Submit application
- [ ] View my applications (junior)
- [ ] View received applications (senior)
- [ ] Update application status
- [ ] Send messages
- [ ] Withdraw application
- [ ] Filter by status

---

### Week 5: Admin & Polish

#### Day 16-17: Doctor Search

**DoctorSearch.js**:

```javascript
const DoctorSearch = () => {
  const [filters, setFilters] = useState({
    q: "",
    specialty: "",
    verified: false,
  });

  const { data: doctors, isLoading } = useQuery({
    queryKey: ["doctor-search", filters],
    queryFn: () => profileAPI.search(filters),
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <FiltersPanel filters={filters} onChange={setFilters} />

      <div className="lg:col-span-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {doctors?.data?.data?.map((doctor) => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              onClick={() => navigate(`/profile/${doctor.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
```

**Testing Checklist**:

- [ ] Search doctors
- [ ] Filter by specialty
- [ ] Filter verified only
- [ ] View doctor profile
- [ ] Pagination works

---

#### Day 18-21: Admin Dashboard

**AdminDashboard.js**:

```javascript
const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const { data: stats } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminAPI.getDashboard(),
  });

  const { data: pending, refetch } = useQuery({
    queryKey: ["admin-pending"],
    queryFn: () => adminAPI.getPendingVerifications(),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ userId, type, data }) =>
      adminAPI.verifyIdentity(userId, data),
    onSuccess: () => {
      toast.success("Verified!");
      refetch();
    },
  });

  return (
    <div>
      <Tabs active={activeTab} onChange={setActiveTab}>
        <Tab value="dashboard">Dashboard</Tab>
        <Tab value="verifications">
          Verifications
          {pending?.data?.pagination?.total > 0 && (
            <Badge>{pending.data.pagination.total}</Badge>
          )}
        </Tab>
      </Tabs>

      {activeTab === "dashboard" && <DashboardView stats={stats} />}

      {activeTab === "verifications" && (
        <VerificationsView pending={pending} onVerify={verifyMutation.mutate} />
      )}
    </div>
  );
};
```

**Testing Checklist**:

- [ ] View platform statistics
- [ ] See pending verifications
- [ ] Verify user documents
- [ ] Bulk approve
- [ ] Analytics work

---

## Phase 3: UI Components

### Reusable Component Library

Create these in `client/src/components/ui/`:

#### Button Component

```javascript
export const Button = ({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  onClick,
  type = "button",
}) => {
  const variants = {
    primary: "bg-primary-600 hover:bg-primary-700 text-white shadow-lg",
    medical: "bg-medical-600 hover:bg-medical-700 text-white shadow-medical",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50",
    ghost: "bg-transparent text-gray-600 hover:bg-gray-100",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 ${
        variants[variant]
      } ${sizes[size]} ${
        disabled || loading ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      {loading && <Spinner className="mr-2" />}
      {children}
    </button>
  );
};
```

#### Input Component

```javascript
export const Input = ({
  label,
  name,
  type = "text",
  error,
  register,
  validation = {},
  ...props
}) => (
  <div className="space-y-1">
    {label && (
      <label className="block text-sm font-medium text-gray-700">
        {label}
        {validation.required && <span className="text-red-500 ml-1">*</span>}
      </label>
    )}
    <input
      type={type}
      className={`input w-full ${error ? "border-red-300" : ""}`}
      {...(register ? register(name, validation) : {})}
      {...props}
    />
    {error && <p className="text-sm text-red-600">{error.message}</p>}
  </div>
);
```

#### Card Component

```javascript
export const Card = ({ title, children, actions, className = "" }) => (
  <div
    className={`bg-white rounded-xl shadow-elevation-2 overflow-hidden ${className}`}
  >
    {title && (
      <div className="px-6 py-4 border-b border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
    )}
    <div className="p-6">{children}</div>
    {actions && (
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
        {actions}
      </div>
    )}
  </div>
);
```

#### Modal Component

```javascript
export const Modal = ({ isOpen, onClose, title, children, size = "md" }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-2xl",
    lg: "max-w-4xl",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />
        <div
          className={`relative bg-white rounded-xl shadow-xl ${sizes[size]} w-full`}
        >
          <div className="px-6 py-4 border-b flex items-center justify-between">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};
```

#### Loading Spinner

```javascript
export const LoadingSpinner = ({ size = "md", message }) => {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div
        className={`animate-spin rounded-full border-t-4 border-primary-600 border-opacity-50 ${sizes[size]}`}
      />
      {message && <p className="mt-4 text-gray-600">{message}</p>}
    </div>
  );
};
```

---

## Component Architecture

### Standard Component Structure

Every component should follow this pattern:

```javascript
// ============================================================================
// IMPORTS
// ============================================================================
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { apiName } from "../api";

// ============================================================================
// MAIN COMPONENT
// ============================================================================
const ComponentName = () => {
  // --------------------------------------------------------------------------
  // HOOKS & STATE
  // --------------------------------------------------------------------------
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isJunior, isSenior } = useAuth();
  const [localState, setLocalState] = useState(initialValue);

  // --------------------------------------------------------------------------
  // DATA FETCHING
  // --------------------------------------------------------------------------
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["resource", id],
    queryFn: () => apiName.get(id),
  });

  // --------------------------------------------------------------------------
  // MUTATIONS
  // --------------------------------------------------------------------------
  const mutation = useMutation({
    mutationFn: (data) => apiName.create(data),
    onSuccess: () => {
      toast.success("Success!");
      navigate("/success-page");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Error occurred");
    },
  });

  // --------------------------------------------------------------------------
  // EVENT HANDLERS
  // --------------------------------------------------------------------------
  const handleAction = () => {
    // Handler logic
  };

  // --------------------------------------------------------------------------
  // EFFECTS
  // --------------------------------------------------------------------------
  useEffect(() => {
    // Side effects
  }, [dependencies]);

  // --------------------------------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------------------------------
  if (isLoading) {
    return <LoadingSpinner message="Loading..." />;
  }

  // --------------------------------------------------------------------------
  // ERROR STATE
  // --------------------------------------------------------------------------
  if (error) {
    return <ErrorDisplay error={error} onRetry={refetch} />;
  }

  // --------------------------------------------------------------------------
  // EMPTY STATE
  // --------------------------------------------------------------------------
  if (!data?.data || data.data.length === 0) {
    return <EmptyState title="No Data" description="No items found" />;
  }

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Component content */}
    </div>
  );
};

export default ComponentName;
```

---

## Design System Guidelines

### Color Palette

**Primary Colors (Medical Blue)**

```css
primary-50: #f0f9ff
primary-500: #0ea5e9 (Main blue)
primary-600: #0284c7 (Buttons, links)
primary-700: #0369a1 (Hover states)
```

**Medical Colors (Green/Teal)**

```css
medical-500: #10b981 (Success, verified)
medical-600: #059669 (Medical actions)
medical-700: #047857 (Hover states)
```

**Trust Colors (Gray)**

```css
trust-400: #94a3b8 (Placeholders)
trust-500: #64748b (Secondary text)
trust-600: #475569 (Body text)
trust-700: #334155 (Headings)
```

**Status Colors**

```css
success: #22c55e (Green)
warning: #f59e0b (Orange)
error: #ef4444 (Red)
info: #0ea5e9 (Blue)
```

### Typography Scale

```css
/* Page Titles */
.text-4xl {
  font-size: 2.25rem;
  font-weight: 700;
}

/* Section Titles */
.text-3xl {
  font-size: 1.875rem;
  font-weight: 700;
}

/* Card Titles */
.text-2xl {
  font-size: 1.5rem;
  font-weight: 600;
}

/* Subsection Titles */
.text-xl {
  font-size: 1.25rem;
  font-weight: 600;
}

/* Body Text */
.text-base {
  font-size: 1rem;
  font-weight: 400;
}

/* Secondary Text */
.text-sm {
  font-size: 0.875rem;
  font-weight: 400;
}

/* Labels/Captions */
.text-xs {
  font-size: 0.75rem;
  font-weight: 500;
}
```

### Spacing System

```css
/* Container Padding */
Mobile: px-4 py-8
Tablet: px-6 py-8
Desktop: px-8 py-12

/* Component Gaps */
gap-4: 1rem (16px) - Related items
gap-6: 1.5rem (24px) - Sections
gap-8: 2rem (32px) - Major sections

/* Card Padding */
p-6: 1.5rem (24px) - Standard cards
p-8: 2rem (32px) - Large cards
```

### Component Styles

**Buttons**

```css
.btn-primary: bg-primary-600 hover:bg-primary-700 text-white shadow-lg
.btn-medical: bg-medical-600 hover:bg-medical-700 text-white shadow-medical
.btn-secondary: bg-white text-gray-700 border border-gray-300
.btn-ghost: bg-transparent text-gray-600 hover:bg-gray-100
```

**Cards**

```css
.card: bg-white rounded-xl shadow-elevation-2 border border-gray-100
.card-hover: hover:shadow-elevation-3 hover:-translate-y-1
```

**Inputs**

```css
.input: border-2 border-gray-300 focus:border-primary-500 rounded-lg px-4 py-2
```

**Badges**

```css
.badge: inline-flex items-center px-2.5 py-0.5 rounded-full text-sm
.badge-success: bg-success-100 text-success-800
.badge-verified: bg-gradient-to-r from-medical-500 to-medical-600 text-white
```

### Responsive Design

**Breakpoints**

```css
sm: 640px (Tablet)
md: 768px (Tablet landscape)
lg: 1024px (Desktop)
xl: 1280px (Large desktop)
```

**Mobile-First Examples**

```jsx
{/* Single column mobile, grid on desktop */}
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

{/* Stack on mobile, side-by-side on desktop */}
<div className="flex flex-col lg:flex-row gap-6">

{/* Full width mobile, contained desktop */}
<div className="w-full lg:max-w-7xl lg:mx-auto">
```

---

## API Integration Patterns

### Data Fetching with TanStack Query

**Basic Query**

```javascript
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ["resource-name", id],
  queryFn: () => apiName.method(params),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

**Conditional Query**

```javascript
const { data } = useQuery({
  queryKey: ["resource", userId],
  queryFn: () => apiName.get(userId),
  enabled: Boolean(userId), // Only fetch if userId exists
});
```

**Query with Filters**

```javascript
const [filters, setFilters] = useState({ status: "all", page: 1 });

const { data } = useQuery({
  queryKey: ["resources", filters],
  queryFn: () => apiName.getAll(filters),
  keepPreviousData: true, // Smooth pagination
});
```

### Mutations

**Basic Mutation**

```javascript
const mutation = useMutation({
  mutationFn: (data) => apiName.create(data),
  onSuccess: (response) => {
    toast.success("Created successfully!");
    queryClient.invalidateQueries(["resource-list"]);
    navigate("/success-page");
  },
  onError: (error) => {
    const errorInfo = handleApiError(error);
    toast.error(errorInfo.message);
    if (errorInfo.errors) {
      errorInfo.errors.forEach((err) => toast.error(err.message));
    }
  },
});

// Usage
mutation.mutate(formData);
```

**Optimistic Update**

```javascript
const mutation = useMutation({
  mutationFn: (data) => apiName.update(id, data),
  onMutate: async (newData) => {
    await queryClient.cancelQueries(["resource", id]);
    const previous = queryClient.getQueryData(["resource", id]);
    queryClient.setQueryData(["resource", id], newData);
    return { previous };
  },
  onError: (err, newData, context) => {
    queryClient.setQueryData(["resource", id], context.previous);
  },
  onSettled: () => {
    queryClient.invalidateQueries(["resource", id]);
  },
});
```

### Form Handling

**React Hook Form Pattern**

```javascript
const {
  register,
  handleSubmit,
  formState: { errors },
  watch,
  reset,
} = useForm({
  defaultValues: initialData,
  mode: "onBlur",
});

const mutation = useMutation({
  mutationFn: (data) => apiName.create(data),
  onSuccess: () => {
    toast.success("Submitted!");
    reset();
    navigate("/success");
  },
});

const onSubmit = (data) => {
  mutation.mutate(data);
};

return (
  <form onSubmit={handleSubmit(onSubmit)}>
    <input
      {...register("fieldName", {
        required: "This field is required",
        minLength: { value: 3, message: "Min 3 characters" },
        maxLength: { value: 100, message: "Max 100 characters" },
      })}
      className={`input ${errors.fieldName ? "border-red-300" : ""}`}
    />
    {errors.fieldName && (
      <p className="text-sm text-red-600">{errors.fieldName.message}</p>
    )}

    <button type="submit" disabled={mutation.isLoading}>
      {mutation.isLoading ? "Submitting..." : "Submit"}
    </button>
  </form>
);
```

### File Upload

```javascript
const [progress, setProgress] = useState(0);

const uploadMutation = useMutation({
  mutationFn: (file) => profileAPI.uploadPhoto(file, setProgress),
  onSuccess: () => {
    toast.success("Uploaded!");
    setProgress(0);
    refetch();
  },
  onError: () => {
    toast.error("Upload failed");
    setProgress(0);
  },
});

const handleFileSelect = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Validate
  if (!file.type.startsWith("image/")) {
    toast.error("Please select an image");
    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    toast.error("Max 5MB");
    return;
  }

  uploadMutation.mutate(file);
};

return (
  <div>
    <input type="file" onChange={handleFileSelect} accept="image/*" />
    {progress > 0 && (
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-primary-600 h-2 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </div>
    )}
  </div>
);
```

---

## Testing Strategy

### Manual Testing Checklist

**For Each Page:**

```markdown
## Functional Testing

- [ ] Page loads without errors
- [ ] All API calls work correctly
- [ ] Loading states display properly
- [ ] Error states display with retry option
- [ ] Empty states display when no data
- [ ] Forms validate correctly
- [ ] Submit actions work
- [ ] Navigation links work
- [ ] Success messages show
- [ ] Error messages show

## Visual Testing

- [ ] Layout matches design
- [ ] Colors are correct
- [ ] Typography is consistent
- [ ] Spacing is appropriate
- [ ] Icons display correctly
- [ ] Images load properly

## Responsive Testing

- [ ] Mobile (375px) looks good
- [ ] Tablet (768px) looks good
- [ ] Desktop (1024px+) looks good
- [ ] No horizontal scroll
- [ ] Touch targets are 44x44px minimum

## Interaction Testing

- [ ] Buttons have hover states
- [ ] Inputs have focus states
- [ ] Cards lift on hover
- [ ] Modals open/close properly
- [ ] Dropdowns work correctly
- [ ] Tooltips show on hover

## Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Tab order is logical
- [ ] Focus indicators visible
- [ ] Alt text on images
- [ ] Color contrast sufficient
- [ ] Screen reader friendly
```

### User Flow Testing

**Authentication Flow**

```markdown
1. Visit login page
2. Enter invalid credentials → See error
3. Enter valid credentials → Redirect to dashboard
4. Logout → Redirect to login
5. Visit protected page → Redirect to login
6. Register new account → Redirect to dashboard
```

**Job Application Flow (Junior)**

```markdown
1. Login as junior doctor
2. Browse jobs → See list
3. Search for "cardiology" → See filtered results
4. Click job → See details
5. Click "Apply" → See application form
6. Fill form → Submit
7. See success message → Redirect to applications
8. View in "My Applications" → See new application
```

**Job Management Flow (Senior)**

```markdown
1. Login as senior doctor
2. Click "Post Job" → See form
3. Fill multi-step form → Submit
4. See in "My Jobs" → Job appears
5. View applications → See applicants
6. Review application → Accept
7. Send message → Message sent
8. Close job → Status updated
```

---

## Deployment Guide

### Pre-Deployment Checklist

```bash
## Environment Variables
✅ REACT_APP_API_URL configured
✅ All API keys set
✅ Feature flags configured

## Code Quality
✅ No console.log statements
✅ No console.error in production
✅ No TODO/FIXME comments
✅ All PropTypes defined

## Build & Test
✅ npm run build (no errors)
✅ Test production build locally
✅ Bundle size < 500KB gzipped
✅ Lighthouse score > 90

## Security
✅ No API keys in code
✅ Routes properly protected
✅ XSS prevention verified
✅ CORS configured

## Performance
✅ Images optimized
✅ Code splitting implemented
✅ Lazy loading for routes
✅ Service worker configured

## Accessibility
✅ Alt text on images
✅ Keyboard navigation
✅ Screen reader compatible
✅ Color contrast WCAG AA
```

### Build Process

```bash
# 1. Install dependencies
npm install

# 2. Build production bundle
npm run build

# 3. Test locally
npm install -g serve
serve -s build -p 3000

# 4. Check bundle size
ls -lh build/static/js/*.js

# 5. Run Lighthouse
# Open Chrome DevTools → Lighthouse → Run
```

### Deployment Options

**Option A: Vercel**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configure environment variables in Vercel dashboard
```

**Option B: Netlify**

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Configure environment variables in Netlify dashboard
```

**Option C: AWS S3 + CloudFront**

```bash
# Build
npm run build

# Sync to S3
aws s3 sync build/ s3://your-bucket --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_ID \
  --paths "/*"
```

### Post-Deployment Testing

```bash
# 1. Check homepage loads
curl -I https://yourdomain.com
# Expect: 200 OK

# 2. Test API calls
# Open DevTools → Network
# Navigate around site
# Verify API calls succeed

# 3. Test authentication
# Login → Dashboard → Logout

# 4. Test critical flows
# Register → Profile → Job → Application

# 5. Check error tracking
# Verify Sentry is receiving errors (if configured)
```

---

## Troubleshooting

### Common Issues

**Issue: API Calls Failing**

```
Symptoms: Network errors, 404s, CORS errors
Checks:
  - Backend running? curl http://localhost:5000/api/health
  - API URL correct? echo $REACT_APP_API_URL
  - Token being sent? Check Network tab → Headers
  - CORS configured? Check backend CORS settings
```

**Issue: White Screen**

```
Symptoms: Blank page, no content
Checks:
  - Console errors? Open DevTools → Console
  - JavaScript errors? Check for import errors
  - Service worker issues? Unregister in DevTools → Application
  - Build errors? Check npm run build output
```

**Issue: Forms Not Submitting**

```
Symptoms: Submit button doesn't work
Checks:
  - Validation errors? Check form state
  - Network request sent? Check Network tab
  - Mutation configured? Verify useMutation setup
  - Error handling? Check onError callback
```

**Issue: Images Not Loading**

```
Symptoms: Broken image icons
Checks:
  - URLs correct? Check src attribute
  - Cloudinary configured? Verify credentials
  - CORS headers? Check response headers
  - File uploaded? Verify in Cloudinary dashboard
```

**Issue: Slow Performance**

```
Symptoms: Slow page loads, laggy interactions
Checks:
  - Bundle size? npm run build && ls -lh build/static/js/
  - Too many API calls? Check Network tab
  - Large images? Optimize with Cloudinary
  - Re-renders? Use React DevTools Profiler
```

### Debug Commands

```bash
# Check environment variables
echo $REACT_APP_API_URL

# Test API endpoint
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"

# Check bundle size
npm run build
ls -lh build/static/js/*.js

# Analyze bundle
npm install -g webpack-bundle-analyzer
webpack-bundle-analyzer build/static/js/*.js

# Check for updates
npm outdated

# Clear cache
rm -rf node_modules package-lock.json
npm install
```

---

## Success Metrics

### Technical Metrics

| Metric              | Target  | Critical Threshold |
| ------------------- | ------- | ------------------ |
| Page Load Time      | < 3s    | < 5s               |
| API Response        | < 500ms | < 1s               |
| Lighthouse Score    | > 90    | > 80               |
| Error Rate          | < 0.5%  | < 2%               |
| Bundle Size         | < 500KB | < 1MB              |
| Time to Interactive | < 3.5s  | < 5s               |

### User Experience Metrics

| Metric                  | Target  | Measurement        |
| ----------------------- | ------- | ------------------ |
| Registration Completion | > 70%   | Users who complete |
| Profile Completion      | > 80%   | Verified profiles  |
| Job Application Rate    | > 60%   | Juniors who apply  |
| Response Time           | < 24h   | Senior response    |
| User Satisfaction       | > 4.5/5 | Ratings            |

### Business Metrics

| Metric                 | Target | KPI                    |
| ---------------------- | ------ | ---------------------- |
| Monthly Active Users   | Track  | Growth rate            |
| Jobs Posted            | Track  | Senior engagement      |
| Applications Submitted | Track  | Junior engagement      |
| Successful Matches     | Track  | Platform effectiveness |
| User Retention         | > 60%  | 30-day retention       |

---

## Implementation Progress Tracker

### Phase 1: Foundation ✅ COMPLETE

- [x] Consolidated API service (`api/index.js`)
- [x] Enhanced AuthContext (`context/AuthContext.js`)
- [x] Memory-based token management
- [x] Error handling utilities
- [x] File upload helpers

### Phase 2: Core Pages ⏳ IN PROGRESS

- [ ] Login.js - Authentication
- [ ] Register.js - User onboarding
- [ ] Dashboard.js - Role-specific views
- [ ] EnhancedProfile.js - Complete profile
- [ ] JobPosting.js - Multi-step job creation
- [ ] JobManagement.js - Job dashboard
- [ ] JobBrowse.js - Public discovery
- [ ] JobDetails.js - Individual job view
- [ ] ApplicationSubmission.js - Apply for jobs
- [ ] ApplicationTracking.js - Track applications
- [ ] DoctorSearch.js - Find doctors
- [ ] AdminDashboard.js - Admin panel

### Phase 3: UI Components ⏳ PENDING

- [ ] Button component
- [ ] Input component
- [ ] Card component
- [ ] Modal component
- [ ] LoadingSpinner component
- [ ] ErrorDisplay component
- [ ] EmptyState component
- [ ] Badge component
- [ ] Pagination component
- [ ] FileUpload component

### Phase 4: Testing ⏳ PENDING

- [ ] Manual testing all pages
- [ ] Cross-browser testing
- [ ] Mobile responsive testing
- [ ] Accessibility testing
- [ ] Performance testing
- [ ] User flow testing

### Phase 5: Deployment ⏳ PENDING

- [ ] Environment configuration
- [ ] Production build
- [ ] Security audit
- [ ] Deploy to staging
- [ ] QA testing
- [ ] Deploy to production
- [ ] Monitoring setup

---

## Quick Reference

### API Imports

```javascript
import {
  authAPI,
  profileAPI,
  jobAPI,
  applicationAPI,
  adminAPI,
  matchingAPI,
  handleApiError,
  formatters,
} from "../api";
```

### Common Hooks

```javascript
import { useAuth } from "../context/AuthContext";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
```

### Design Classes

```css
/* Buttons */
btn-primary, btn-medical, btn-secondary, btn-ghost

/* Cards */
card, card-hover, rounded-xl, shadow-elevation-2

/* Inputs */
input, border-2, focus:border-primary-500

/* Badges */
badge, badge-success, badge-verified

/* Layout */
max-w-7xl, mx-auto, px-4 sm:px-6 lg:px-8, py-8

/* Grid */
grid grid-cols-1 lg:grid-cols-3 gap-6
```

---

## Key Principles

1. **Consistency** - Use same patterns across all pages
2. **Clarity** - Clear naming, good comments, proper structure
3. **Performance** - Lazy loading, code splitting, optimization
4. **Security** - Proper auth, validation, sanitization
5. **Accessibility** - Keyboard nav, screen readers, contrast
6. **Testing** - Manual testing for all features
7. **Documentation** - Comments, README updates

---

## Final Checklist

### Before Marking Complete

**Functionality**
✅ All 14 pages implemented  
✅ All pages use real API data  
✅ No mock data anywhere  
✅ All user flows work  
✅ Authentication works  
✅ Forms validate  
✅ File uploads work

**Quality**
✅ Loading states everywhere  
✅ Error states handled  
✅ Toast notifications work  
✅ Responsive design  
✅ No console errors  
✅ Consistent styling  
✅ Professional UI/UX

**Performance**
✅ Pages load quickly  
✅ API calls optimized  
✅ Images optimized  
✅ Bundle size reasonable

**Testing**
✅ Manual testing complete  
✅ All flows tested  
✅ Cross-browser tested  
✅ Mobile tested  
✅ Edge cases handled

---

**END OF COMPLETE FRONTEND IMPLEMENTATION PLAN**

This document provides everything needed to implement the Doconnect frontend systematically and professionally. Follow the patterns, use the master prompt for each page, and test thoroughly at each step.

**Document Status**: Complete and Ready  
**Version**: 1.0  
**Last Updated**: January 2025
