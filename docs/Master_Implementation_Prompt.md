# 🎯 Doconnect Frontend Implementation - Master Prompt

**Version**: 1.0  
**Purpose**: Complete component implementation guide for new chat sessions  
**Status**: Production-ready

---

## 📋 Context & Instructions

You are implementing a **production-ready React component** for the **Doconnect medical marketplace platform**. This is a MERN-stack application connecting senior doctors (employers) with junior doctors (freelancers) for medical opportunities.

### Your Mission

Implement the attached component file(s) with:

- ✅ Real-time data fetching from backend API
- ✅ Complete API integration (no mock data)
- ✅ Professional medical-themed UI/UX
- ✅ Consistent styling across all pages
- ✅ Proper error handling and loading states
- ✅ Form validation and user feedback
- ✅ Responsive design (mobile-first)
- ✅ Accessibility standards (WCAG 2.1 AA)

---

## 📚 Required Documents

You will receive these documents in this chat:

1. **api_documentation.md** - Complete backend API reference with all endpoints
2. **README.md** - Project overview, tech stack, implementation status
3. **Complete_Frontend_Implementation_Plan.md** - Architecture, patterns, design system
4. **Current Component File(s)** - The React component(s) to be updated

**Read all documentation carefully before implementing.**

---

## 🎨 Design System Requirements

### Color Palette (Medical Professional Theme)

```javascript
// Primary Colors (Medical Blue)
primary-50: #f0f9ff
primary-500: #0ea5e9
primary-600: #0284c7  // Main blue for buttons, links, CTAs
primary-700: #0369a1  // Hover states

// Medical Colors (Green/Teal)
medical-500: #10b981  // Success, verified states
medical-600: #059669  // Medical actions, primary medical buttons
medical-700: #047857  // Hover states

// Trust Colors (Gray)
trust-400: #94a3b8  // Placeholders
trust-500: #64748b  // Secondary text
trust-600: #475569  // Body text
trust-700: #334155  // Headings

// Status Colors
success: #22c55e   // Green - Approvals, completions, verified
warning: #f59e0b   // Orange - Pending, attention needed
error: #ef4444     // Red - Errors, rejections, destructive actions
info: #0ea5e9      // Blue - Information, tips, guidance

// Accent Colors
accent: #d946ef    // Purple - Premium features, special highlights
```

### Typography Scale

```css
/* Headings */
Page Titles:      text-4xl (36px) font-bold text-gray-900
Section Titles:   text-3xl (30px) font-bold text-gray-900
Card Titles:      text-2xl (24px) font-semibold text-gray-900
Subsection:       text-xl (20px) font-semibold text-gray-800
Emphasized:       text-lg (18px) font-medium text-gray-800

/* Body */
Body Text:        text-base (16px) font-normal text-gray-700
Secondary Text:   text-sm (14px) font-normal text-gray-600
Captions/Labels:  text-xs (12px) font-medium text-gray-600
```

### Spacing System

```css
/* Container Padding */
Mobile (default):  px-4 py-8
Tablet (sm):       px-6 py-8
Desktop (lg):      px-8 py-12

/* Component Gaps */
Related items:     gap-4 (16px)
Sections:          gap-6 (24px)
Major sections:    gap-8 (32px)

/* Card Padding */
Standard cards:    p-6 (24px)
Large cards:       p-8 (32px)

/* Vertical Stacks */
Tight spacing:     space-y-4
Normal spacing:    space-y-6
Loose spacing:     space-y-8
```

### Component Style Classes

```css
/* Buttons */
.btn-primary
  bg-primary-600 hover:bg-primary-700 text-white
  shadow-lg hover:shadow-xl
  transform hover:-translate-y-0.5
  transition-all duration-200

.btn-medical
  bg-medical-600 hover:bg-medical-700 text-white
  shadow-medical hover:shadow-medical-lg
  transform hover:-translate-y-0.5
  transition-all duration-200

.btn-secondary
  bg-white text-gray-700 border border-gray-300
  hover:bg-gray-50 hover:border-gray-400
  transition-colors duration-200

.btn-ghost
  bg-transparent text-gray-600
  hover:bg-gray-100 hover:text-gray-900
  transition-colors duration-200

/* Cards */
.card
  bg-white rounded-xl shadow-elevation-2
  border border-gray-100 overflow-hidden

.card-hover
  hover:shadow-elevation-3 hover:-translate-y-1
  hover:border-primary-200
  transition-all duration-300

/* Inputs */
.input
  w-full px-4 py-2
  border-2 border-gray-300 rounded-lg
  focus:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
  transition-all duration-200

/* Badges */
.badge
  inline-flex items-center px-2.5 py-0.5
  rounded-full text-sm font-medium

.badge-success
  bg-success-100 text-success-800

.badge-warning
  bg-warning-100 text-warning-800

.badge-error
  bg-error-100 text-error-800

.badge-verified
  bg-gradient-to-r from-medical-500 to-medical-600
  text-white shadow-sm
```

---

## 🏗️ Implementation Requirements

### 1. API Integration (CRITICAL)

**Import the consolidated API:**

```javascript
import {
  authAPI, // Authentication endpoints
  profileAPI, // Profile management
  jobAPI, // Job CRUD operations
  applicationAPI, // Application management
  adminAPI, // Admin operations
  matchingAPI, // Matching & recommendations
  handleApiError, // Error handling utility
  formatters, // Data formatters (budget, dates, etc.)
} from "../api";
```

**Data Fetching with TanStack Query:**

```javascript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// FETCH DATA
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ["resource-name", id, filters],
  queryFn: () => apiName.method(params),
  enabled: Boolean(requiredParam), // Conditional fetching
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  refetchOnWindowFocus: true, // Refetch on focus
});

// MUTATE DATA
const mutation = useMutation({
  mutationFn: (data) => apiName.method(data),
  onSuccess: (response) => {
    toast.success("Success message!");
    queryClient.invalidateQueries(["resource-name"]);
    navigate("/next-page");
  },
  onError: (error) => {
    const errorInfo = handleApiError(error);
    toast.error(errorInfo.message);

    // Display validation errors if present
    if (errorInfo.errors) {
      errorInfo.errors.forEach((err) => toast.error(err.message));
    }
  },
});

// USE MUTATION
const handleSubmit = (formData) => {
  mutation.mutate(formData);
};
```

### 2. Authentication & Permissions

```javascript
import { useAuth } from "../context/AuthContext";

const Component = () => {
  const {
    user, // Current user object
    isAuthenticated, // Boolean
    isJunior, // Boolean helper function
    isSenior, // Boolean helper function
    isAdmin, // Boolean helper function
    hasPermission, // Function(permission: string)
    canAccessRoute, // Function(routeLevel: string)
    loading, // Auth loading state
  } = useAuth();

  // Permission checks
  if (!hasPermission("canAccessActiveFeatures")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600">
            You don't have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  // Role-based rendering
  return (
    <div>
      {isJunior() && <JuniorView />}
      {isSenior() && <SeniorView />}
      {isAdmin() && <AdminView />}
    </div>
  );
};
```

### 3. Form Handling with React Hook Form

```javascript
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

const FormComponent = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm({
    defaultValues: initialData,
    mode: "onBlur", // Validate on blur
  });

  const mutation = useMutation({
    mutationFn: (data) => apiName.create(data),
    onSuccess: () => {
      toast.success("Submitted successfully!");
      reset(); // Clear form
      navigate("/success-page");
    },
    onError: (error) => {
      const errorInfo = handleApiError(error);
      toast.error(errorInfo.message);
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Field Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          {...register("fieldName", {
            required: "This field is required",
            minLength: { value: 3, message: "Minimum 3 characters" },
            maxLength: { value: 100, message: "Maximum 100 characters" },
          })}
          className={`input ${errors.fieldName ? "border-red-300" : ""}`}
          placeholder="Enter value..."
        />
        {errors.fieldName && (
          <p className="text-sm text-red-600 mt-1">
            {errors.fieldName.message}
          </p>
        )}
      </div>

      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="btn-secondary px-6 py-2 rounded-lg"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={mutation.isLoading}
          className="btn-medical px-6 py-2 rounded-lg"
        >
          {mutation.isLoading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  );
};
```

### 4. Loading & Error States (MANDATORY)

```javascript
const Component = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["data"],
    queryFn: () => apiName.getData(),
  });

  // LOADING STATE (Required)
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-primary-600 border-opacity-50" />
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    );
  }

  // ERROR STATE (Required)
  if (error) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start">
            <svg
              className="h-6 w-6 text-red-600 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">
                Error Loading Data
              </h3>
              <p className="text-red-700 mb-4">
                {error.response?.data?.message || "An error occurred"}
              </p>
              <button onClick={() => refetch()} className="btn-secondary">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // EMPTY STATE (Required)
  if (!data?.data || data.data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-4">
          <svg
            className="h-8 w-8 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Data Found
        </h3>
        <p className="text-gray-600 mb-6">
          There are no items to display at this time.
        </p>
        <button onClick={() => navigate("/create")} className="btn-medical">
          Create New
        </button>
      </div>
    );
  }

  // ACTUAL CONTENT
  return <div>{/* Render actual data */}</div>;
};
```

### 5. File Upload Pattern

```javascript
import { useState } from "react";

const FileUploadComponent = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const { refetch } = useQuery({ queryKey: ["profile"] });

  const uploadMutation = useMutation({
    mutationFn: (file) =>
      profileAPI.uploadPhoto(file, (progress) => {
        setUploadProgress(progress);
      }),
    onSuccess: () => {
      toast.success("File uploaded successfully!");
      setUploadProgress(0);
      setSelectedFile(null);
      refetch();
    },
    onError: (error) => {
      toast.error("Upload failed");
      setUploadProgress(0);
    },
  });

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  return (
    <div className="space-y-4">
      {/* Drag & Drop Zone */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-primary-500 transition-colors">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <div className="text-gray-600">
            <svg
              className="mx-auto h-12 w-12 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            {selectedFile ? (
              <p className="text-sm font-medium">{selectedFile.name}</p>
            ) : (
              <>
                <p className="text-sm font-medium">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</p>
              </>
            )}
          </div>
        </label>
      </div>

      {/* Progress Bar */}
      {uploadProgress > 0 && (
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      {/* Upload Button */}
      {selectedFile && (
        <button
          onClick={handleUpload}
          disabled={uploadMutation.isLoading}
          className="btn-medical w-full"
        >
          {uploadMutation.isLoading ? "Uploading..." : "Upload File"}
        </button>
      )}
    </div>
  );
};
```

### 6. Responsive Design (REQUIRED)

```javascript
// ALWAYS use mobile-first approach
<div className="
  // Mobile (default - < 640px)
  px-4 py-6
  grid grid-cols-1 gap-4

  // Tablet (≥ 640px)
  sm:px-6 sm:py-8
  sm:grid-cols-2 sm:gap-6

  // Desktop (≥ 1024px)
  lg:px-8 lg:py-12
  lg:grid-cols-3 lg:gap-8

  // Container max-width
  max-w-7xl mx-auto
">
  {/* Content */}
</div>

// Navigation: Hamburger on mobile, full nav on desktop
<nav className="flex items-center justify-between">
  {/* Logo */}
  <div className="flex items-center">
    <Logo />
  </div>

  {/* Desktop Navigation - Hidden on mobile */}
  <div className="hidden lg:flex items-center space-x-8">
    <NavLink to="/dashboard">Dashboard</NavLink>
    <NavLink to="/profile">Profile</NavLink>
    <NavLink to="/jobs">Jobs</NavLink>
  </div>

  {/* Mobile Menu Button - Hidden on desktop */}
  <button className="lg:hidden" onClick={() => setMobileMenuOpen(true)}>
    <svg className="h-6 w-6">...</svg>
  </button>
</nav>
```

### 7. Pagination Pattern

```javascript
const PaginatedList = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const { data, isLoading } = useQuery({
    queryKey: ["items", page, limit],
    queryFn: () => apiName.getItems({ page, limit }),
    keepPreviousData: true, // Smooth pagination
  });

  const totalPages = data?.data?.pagination?.pages || 1;

  return (
    <>
      {/* List Content */}
      <div className="grid gap-6">
        {data?.data?.data?.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between mt-8">
        <p className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </p>

        <div className="flex gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {/* Page Numbers */}
          <div className="flex gap-2">
            {[...Array(totalPages)].map((_, i) => {
              const pageNum = i + 1;
              // Show first, last, and pages around current
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= page - 2 && pageNum <= page + 2)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`px-4 py-2 rounded-lg ${
                      page === pageNum
                        ? "bg-primary-600 text-white"
                        : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              }
              // Show ellipsis
              if (pageNum === page - 3 || pageNum === page + 3) {
                return (
                  <span key={pageNum} className="px-2">
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};
```

### 8. Search & Filter Pattern

```javascript
const SearchableList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    specialty: "",
    status: "all",
    sortBy: "recent",
  });

  // Debounce search term
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data, isLoading } = useQuery({
    queryKey: ["items", debouncedSearch, filters],
    queryFn: () =>
      apiName.search({
        q: debouncedSearch,
        ...filters,
      }),
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Filters Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-xl shadow-elevation-2 p-6 sticky top-24">
          <h3 className="text-lg font-semibold mb-4">Filters</h3>

          <div className="space-y-4">
            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <select
                value={filters.category}
                onChange={(e) =>
                  setFilters({ ...filters, category: e.target.value })
                }
                className="input w-full"
              >
                <option value="">All Categories</option>
                <option value="consultation">Consultation</option>
                <option value="research">Research</option>
                <option value="documentation">Documentation</option>
              </select>
            </div>

            {/* Clear Filters */}
            <button
              onClick={() =>
                setFilters({
                  category: "",
                  specialty: "",
                  status: "all",
                  sortBy: "recent",
                })
              }
              className="btn-ghost w-full"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="lg:col-span-3">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              className="input w-full pl-12"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Results List */}
        {isLoading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid gap-6">
            {data?.data?.data?.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
```

---

## 🎯 Component Structure Template

**EVERY component MUST follow this structure:**

```javascript
// ============================================================================
// IMPORTS
// ============================================================================
import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { user, isJunior, isSenior, isAdmin } = useAuth();

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
      queryClient.invalidateQueries(["resource"]);
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
    return <LoadingSpinner message="Loading data..." />;
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
    return (
      <EmptyState
        title="No Data Found"
        description="There are no items to display."
        action={
          <button onClick={() => navigate("/create")} className="btn-medical">
            Create New
          </button>
        }
      />
    );
  }

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Page Title</h1>
        <p className="text-gray-600">Page description</p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Content here */}
      </div>
    </div>
  );
};

// ============================================================================
// SUB-COMPONENTS (if needed)
// ============================================================================
const SubComponent = ({ prop }) => {
  return <div>{/* Sub-component content */}</div>;
};

// ============================================================================
// EXPORT
// ============================================================================
export default ComponentName;
```

---

## ✅ Quality Checklist

Before providing implementation, ensure ALL items are checked:

### API Integration

- [ ] All data fetching uses TanStack Query
- [ ] All mutations use useMutation with proper callbacks
- [ ] Loading states implemented everywhere
- [ ] Error states implemented with retry option
- [ ] Empty states implemented with helpful messaging
- [ ] Query keys are descriptive and consistent
- [ ] Data invalidation after mutations
- [ ] Proper error handling with handleApiError utility

### Authentication & Authorization

- [ ] useAuth hook imported and used
- [ ] Role-based rendering implemented where needed
- [ ] Permission checks in place for sensitive operations
- [ ] Proper redirects for unauthorized access
- [ ] User state checked before rendering

### Forms

- [ ] React Hook Form used for all forms
- [ ] All required fields have validation rules
- [ ] Error messages displayed for each field
- [ ] Submit button disabled during submission
- [ ] Success/error toast notifications
- [ ] Form reset after successful submission
- [ ] Loading indicator on submit button

### UI/UX

- [ ] Consistent color scheme (medical theme)
- [ ] Proper spacing (gap-4, gap-6, gap-8)
- [ ] Responsive design (mobile-first)
- [ ] Loading spinners for async operations
- [ ] Toast notifications for user feedback
- [ ] Hover states on interactive elements
- [ ] Focus states for accessibility
- [ ] Disabled states clearly indicated
- [ ] Empty states with helpful messages

### Code Quality

- [ ] Clean, readable code
- [ ] Descriptive variable/function names
- [ ] Comments for complex logic
- [ ] No console.logs (except for debugging)
- [ ] Proper error handling
- [ ] No hardcoded values (use constants)
- [ ] DRY principle followed
- [ ] Component structure template followed

### Performance

- [ ] No unnecessary re-renders
- [ ] Debounced search inputs
- [ ] Proper React keys for lists
- [ ] Conditional queries (enabled prop)
- [ ] keepPreviousData for pagination

### Accessibility

- [ ] Semantic HTML elements
- [ ] Proper ARIA labels where needed
- [ ] Keyboard navigation support
- [ ] Alt text for images
- [ ] Proper color contrast
- [ ] Focus indicators visible

---

## 🚀 Deliverables

Provide the following in your response:

### 1. Complete Component Code

- Fully functional React component
- All imports included
- All API integrations working
- All states handled (loading, error, empty, success)
- Proper comments explaining key logic

### 2. Summary of Changes

```markdown
## Summary of Changes

- Integrated [X] API endpoints
- Implemented real-time data fetching with TanStack Query
- Added loading/error/empty states
- Implemented form validation with React Hook Form
- Added responsive design for mobile/tablet/desktop
- Implemented [specific features]
```

### 3. API Endpoints Used

```markdown
## API Endpoints Used

- GET /api/endpoint - Description of what it does
- POST /api/endpoint - Description of what it does
- PUT /api/endpoint - Description of what it does
```

### 4. Testing Checklist

```markdown
## Testing Checklist

- [ ] Page loads without errors
- [ ] API calls work correctly
- [ ] Loading states display
- [ ] Error states display with retry
- [ ] Forms validate properly
- [ ] Submit actions work
- [ ] Navigation works
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Responsive on desktop
```

### 5. Implementation Notes

```markdown
## Implementation Notes

- Any assumptions made
- Dependencies on other components
- Known limitations
- Future improvements needed
```

---

## 📝 Example Output Format

Structure your response like this:

```markdown
# Updated Component: [ComponentName].js

## Summary of Changes

- Integrated jobAPI.getById for fetching job details
- Implemented applicationAPI.submit for job applications
- Added loading spinner during data fetch
- Added error display with retry button
- Implemented form validation for application submission
- Added responsive layout for mobile/tablet/desktop
- Added role-based rendering (Apply button only for juniors)

## Component Code

[Full component code here with comments]

## API Endpoints Used

- GET /api/jobs/:id - Fetch individual job details
- POST /api/jobs/:id/view - Track job views
- POST /api/applications/submit - Submit job application

## Testing Checklist

- [ ] Job details load correctly
- [ ] Loading spinner shows while fetching
- [ ] Error message shows on API failure
- [ ] Apply button shows for junior doctors only
- [ ] Application form validates all fields
- [ ] Success toast shows after submission
- [ ] Redirects to applications page after success
- [ ] Responsive on mobile (375px)
- [ ] Responsive on tablet (768px)
- [ ] Responsive on desktop (1024px+)

## Implementation Notes

- Assumes user is authenticated (uses useAuth hook)
- Requires profileAPI for fetching applicant match score
- Form validation matches backend requirements
- Toast notifications require react-hot-toast configured in App.js
```

---

## 🎓 Additional Guidelines

### DO ✅

**Always:**

- Use TanStack Query for ALL data fetching
- Use React Hook Form for ALL forms
- Implement proper error handling
- Add loading states everywhere
- Use toast notifications for feedback
- Follow the component structure template
- Use consistent naming conventions
- Add comments for complex logic
- Make it mobile responsive
- Follow the design system colors and spacing
- Check permissions before rendering sensitive content
- Invalidate queries after mutations
- Use debounce for search inputs
- Implement empty states with helpful actions

### DON'T ❌

**Never:**

- Use mock/hardcoded data
- Use localStorage (not supported in Claude.ai artifacts)
- Forget loading/error states
- Skip form validation
- Use inline styles (use Tailwind classes)
- Ignore responsive design
- Leave console.logs in production code
- Hardcode API URLs (use from api/index.js)
- Use window.location.href (use navigate from react-router)
- Forget to handle edge cases
- Skip accessibility considerations
- Use any/unknown TypeScript types (if using TypeScript)

---

## 🔥 Common Patterns Reference

### Pattern 1: Basic Page with Data Fetching

```javascript
const PageName = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["data"],
    queryFn: () => apiName.getData(),
  });

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay error={error} />;
  if (!data?.data) return <EmptyState />;

  return <div>{/* Render data */}</div>;
};
```

### Pattern 2: Form with Mutation

```javascript
const FormPage = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: (data) => apiName.create(data),
    onSuccess: () => {
      toast.success("Created!");
      navigate("/success");
    },
  });

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
      {/* Form fields */}
    </form>
  );
};
```

### Pattern 3: List with Pagination

```javascript
const ListPage = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["items", page],
    queryFn: () => apiName.getAll({ page }),
    keepPreviousData: true,
  });

  return (
    <>
      <div className="grid gap-6">
        {data?.data?.data?.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
      <Pagination
        page={page}
        total={data?.data?.pagination?.pages}
        onChange={setPage}
      />
    </>
  );
};
```

### Pattern 4: Search with Filters

```javascript
const SearchPage = () => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({});

  const { data, isLoading } = useQuery({
    queryKey: ["search", search, filters],
    queryFn: () => apiName.search({ q: search, ...filters }),
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      <FiltersSidebar filters={filters} onChange={setFilters} />
      <SearchResults data={data} isLoading={isLoading} />
    </div>
  );
};
```

### Pattern 5: Detail View with Actions

```javascript
const DetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["item", id],
    queryFn: () => apiName.getById(id),
  });

  const deleteMutation = useMutation({
    mutationFn: () => apiName.delete(id),
    onSuccess: () => {
      toast.success("Deleted!");
      queryClient.invalidateQueries(["items"]);
      navigate("/items");
    },
  });

  if (isLoading) return <LoadingSpinner />;

  return (
    <div>
      <ItemDetails item={data?.data} />
      <button onClick={() => deleteMutation.mutate()}>Delete</button>
    </div>
  );
};
```

---

## 🐛 Debugging Checklist

If something doesn't work, check:

**API Issues:**

- [ ] Backend is running
- [ ] API URL is correct in environment variables
- [ ] Token is being sent in headers (check Network tab)
- [ ] Endpoint exists and is documented
- [ ] Request payload matches API expectations
- [ ] CORS is configured correctly

**React Query Issues:**

- [ ] QueryClientProvider wraps the app
- [ ] Query keys are correct and consistent
- [ ] queryFn returns a promise
- [ ] Error handling is implemented
- [ ] Stale time is appropriate

**Form Issues:**

- [ ] React Hook Form is configured correctly
- [ ] Validation rules are correct
- [ ] Error messages are displayed
- [ ] onSubmit handler is wired up correctly
- [ ] Mutation is called with correct data

**UI Issues:**

- [ ] Tailwind CSS is configured and running
- [ ] Class names are spelled correctly
- [ ] Responsive classes are applied
- [ ] Components are imported correctly
- [ ] Props are passed correctly

---

## 🎯 Final Reminders

**Your implementation should be:**

1. **Production-ready** - No placeholders or TODOs
2. **Complete** - All features fully implemented
3. **Tested** - You've mentally verified all flows work
4. **Consistent** - Follows all patterns and guidelines
5. **Professional** - Clean code, proper comments, good UX

**Remember:**

- This code will be used in production
- Quality and completeness are critical
- Follow ALL guidelines above
- Include ALL required states (loading, error, empty)
- Make it mobile-responsive
- Add proper error handling
- Use toast notifications for feedback

---

## 🚀 Ready to Implement!

You now have complete context for implementing a production-ready component:

✅ **Design System** - Colors, typography, spacing  
✅ **API Integration** - TanStack Query patterns  
✅ **Authentication** - useAuth hook usage  
✅ **Forms** - React Hook Form patterns  
✅ **Error Handling** - Loading, error, empty states  
✅ **Responsive Design** - Mobile-first approach  
✅ **Component Structure** - Standard template  
✅ **Quality Checklist** - All requirements  
✅ **Common Patterns** - Reference implementations

**Now implement the attached component(s) following ALL guidelines above.**

Provide complete, working code with:

- Real API integration
- Proper error handling
- Loading states
- Form validation
- Responsive design
- Professional UI/UX
- Helpful comments

**Let's build something great! 🎨**

---

**END OF MASTER IMPLEMENTATION PROMPT**

Version: 1.0  
Status: Complete and Ready for Use  
Last Updated: January 2025
