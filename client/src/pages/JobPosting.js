// JobPosting.js - Enhanced with Auto-save and Field Validation
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { jobAPI, handleApiError } from "../api";
import { ArrowLeft, Save, Send, AlertCircle, X, Plus } from "lucide-react";

const JobPosting = () => {
  const { jobId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user, isSenior } = useAuth();
  const isEditing = Boolean(jobId);

  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    specialty: "",
    subSpecialties: [],
    skills_required: [],
    experience_required: {
      minimum_years: "",
      level: "",
    },
    budget: {
      type: "fixed",
      amount: "",
      currency: "USD",
    },
    timeline: {
      estimated_hours: "",
      deadline: "",
    },
    requirements: {
      location_preference: "remote",
      certifications: [],
      languages: [],
    },
    visibility: "public",
  });

  // Load existing job if editing
  const { data: existingJob, isLoading: loadingJob } = useQuery({
    queryKey: ["job", jobId],
    queryFn: () => jobAPI.getById(jobId),
    enabled: Boolean(jobId),
    onSuccess: (response) => {
      const job = response.data;
      setFormData({
        title: job.title || "",
        category: job.category || "",
        description: job.description || "",
        specialty: job.specialty || "",
        subSpecialties: job.subSpecialties || [],
        skills_required: job.skills_required || [],
        experience_required: job.experience_required || {
          minimum_years: "",
          level: "",
        },
        budget: job.budget || { type: "fixed", amount: "", currency: "USD" },
        timeline: job.timeline || { estimated_hours: "", deadline: "" },
        requirements: job.requirements || {
          location_preference: "remote",
          certifications: [],
          languages: [],
        },
        visibility: job.visibility || "public",
      });
    },
  });

  // Auto-save for edit drafts
  useEffect(() => {
    if (!isEditing) return;

    const timer = setTimeout(() => {
      try {
        localStorage.setItem(`job_draft_${jobId}`, JSON.stringify(formData));
        console.log("Draft auto-saved");
      } catch (err) {
        console.error("Failed to auto-save draft:", err);
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [formData, isEditing, jobId]);

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (data) => jobAPI.create(data),
    onSuccess: () => {
      toast.success("Job posted successfully!");
      queryClient.invalidateQueries(["my-jobs"]);
      setTimeout(() => navigate("/jobs/manage"), 1500);
    },
    onError: (error) => {
      const errorInfo = handleApiError(error);
      toast.error(errorInfo.message);
      if (errorInfo.errors) {
        const fieldErrors = {};
        errorInfo.errors.forEach((err) => {
          fieldErrors[err.field] = err.message;
        });
        setErrors(fieldErrors);
      }
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: (data) => jobAPI.update(jobId, data),
    onSuccess: () => {
      toast.success("Job updated successfully!");
      queryClient.invalidateQueries(["job", jobId]);
      queryClient.invalidateQueries(["my-jobs"]);
      setTimeout(() => navigate("/jobs/manage"), 1500);
    },
    onError: (error) => {
      const errorInfo = handleApiError(error);
      toast.error(errorInfo.message);
      if (errorInfo.errors) {
        const fieldErrors = {};
        errorInfo.errors.forEach((err) => {
          fieldErrors[err.field] = err.message;
        });
        setErrors(fieldErrors);
      }
    },
  });

  // Field validation
  const validateField = (field, value) => {
    const newErrors = { ...errors };

    switch (field) {
      case "title":
        if (!value || value.length < 10) {
          newErrors.title = "Title must be at least 10 characters";
        } else {
          delete newErrors.title;
        }
        break;
      case "description":
        if (!value || value.length < 50) {
          newErrors.description = "Description must be at least 50 characters";
        } else {
          delete newErrors.description;
        }
        break;
      case "category":
        if (!value) {
          newErrors.category = "Category is required";
        } else {
          delete newErrors.category;
        }
        break;
      case "specialty":
        if (!value) {
          newErrors.specialty = "Specialty is required";
        } else {
          delete newErrors.specialty;
        }
        break;
      default:
        break;
    }

    setErrors(newErrors);
  };

  // Handlers
  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleNestedChange = (parent, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [parent]: { ...prev[parent], [field]: value },
    }));
  };

  const addArrayItem = (field, value) => {
    if (value.trim()) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...prev[field], value.trim()],
      }));
    }
  };

  const removeArrayItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title || formData.title.length < 10) {
      newErrors.title = "Title must be at least 10 characters";
    }
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.description || formData.description.length < 50) {
      newErrors.description = "Description must be at least 50 characters";
    }
    if (!formData.specialty) newErrors.specialty = "Specialty is required";
    if (!formData.experience_required.level) {
      newErrors["experience_required.level"] = "Experience level is required";
    }
    if (!formData.experience_required.minimum_years) {
      newErrors["experience_required.minimum_years"] =
        "Minimum years is required";
    }
    if (formData.budget.type !== "negotiable" && !formData.budget.amount) {
      newErrors["budget.amount"] = "Budget amount is required";
    }
    if (!formData.timeline.deadline) {
      newErrors["timeline.deadline"] = "Deadline is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    const submitData = { ...formData, status: "active" };
    if (isEditing) {
      updateMutation.mutate(submitData);
    } else {
      createMutation.mutate(submitData);
    }
  };

  const handleSaveDraft = () => {
    const draftData = { ...formData, status: "draft" };
    if (isEditing) {
      updateMutation.mutate(draftData);
    } else {
      createMutation.mutate(draftData);
    }
  };

  if (!isSenior()) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            Only senior doctors can post jobs
          </p>
          <button
            onClick={() => navigate("/dashboard")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (loadingJob) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading job data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <button
          onClick={() => navigate("/jobs/manage")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Job Management
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? "Edit Job Posting" : "Post New Job"}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing
              ? "Update job details"
              : "Find the right medical professional"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  onBlur={(e) => validateField("title", e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    errors.title ? "border-red-500" : ""
                  }`}
                  placeholder="e.g., Cardiology Consultation Support"
                  maxLength={100}
                />
                {errors.title && (
                  <p className="text-sm text-red-600 mt-1">{errors.title}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {formData.title.length}/100 characters
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleChange("category", e.target.value)}
                    onBlur={(e) => validateField("category", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      errors.category ? "border-red-500" : ""
                    }`}
                  >
                    <option value="">Select Category</option>
                    <option value="consultation">Consultation</option>
                    <option value="research">Research</option>
                    <option value="documentation">Documentation</option>
                    <option value="review">Review</option>
                    <option value="telemedicine">Telemedicine</option>
                  </select>
                  {errors.category && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.category}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Specialty *
                  </label>
                  <input
                    type="text"
                    value={formData.specialty}
                    onChange={(e) => handleChange("specialty", e.target.value)}
                    onBlur={(e) => validateField("specialty", e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      errors.specialty ? "border-red-500" : ""
                    }`}
                    placeholder="e.g., Cardiology"
                  />
                  {errors.specialty && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors.specialty}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  onBlur={(e) => validateField("description", e.target.value)}
                  rows={6}
                  className={`w-full px-3 py-2 border rounded-lg ${
                    errors.description ? "border-red-500" : ""
                  }`}
                  placeholder="Describe the project requirements..."
                  maxLength={2000}
                />
                {errors.description && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.description}
                  </p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/2000 characters (minimum 50)
                </p>
              </div>

              <ArrayInput
                label="Required Skills"
                items={formData.skills_required}
                onAdd={(value) => addArrayItem("skills_required", value)}
                onRemove={(index) => removeArrayItem("skills_required", index)}
                placeholder="Add a skill"
              />
            </div>
          </div>

          {/* Requirements */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Requirements
            </h2>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience Level *
                  </label>
                  <select
                    value={formData.experience_required.level}
                    onChange={(e) =>
                      handleNestedChange(
                        "experience_required",
                        "level",
                        e.target.value
                      )
                    }
                    className={`w-full px-3 py-2 border rounded-lg ${
                      errors["experience_required.level"]
                        ? "border-red-500"
                        : ""
                    }`}
                  >
                    <option value="">Select Level</option>
                    <option value="resident">Resident</option>
                    <option value="junior">Junior (0-3 years)</option>
                    <option value="mid-level">Mid-Level (3-7 years)</option>
                    <option value="senior">Senior (7+ years)</option>
                    <option value="attending">Attending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Years *
                  </label>
                  <input
                    type="number"
                    value={formData.experience_required.minimum_years}
                    onChange={(e) =>
                      handleNestedChange(
                        "experience_required",
                        "minimum_years",
                        e.target.value
                      )
                    }
                    className={`w-full px-3 py-2 border rounded-lg ${
                      errors["experience_required.minimum_years"]
                        ? "border-red-500"
                        : ""
                    }`}
                    min="0"
                    max="50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Preference
                </label>
                <select
                  value={formData.requirements.location_preference}
                  onChange={(e) =>
                    handleNestedChange(
                      "requirements",
                      "location_preference",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  <option value="remote">Remote</option>
                  <option value="onsite">On-site</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </div>
          </div>

          {/* Budget & Timeline */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Budget & Timeline
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget Type *
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {["fixed", "hourly", "negotiable"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => handleNestedChange("budget", "type", type)}
                      className={`p-4 border rounded-lg capitalize ${
                        formData.budget.type === type
                          ? "border-blue-500 bg-blue-50"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {formData.budget.type !== "negotiable" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Budget Amount * ($)
                  </label>
                  <input
                    type="number"
                    value={formData.budget.amount}
                    onChange={(e) =>
                      handleNestedChange("budget", "amount", e.target.value)
                    }
                    className={`w-full px-3 py-2 border rounded-lg ${
                      errors["budget.amount"] ? "border-red-500" : ""
                    }`}
                    min="0"
                    step={formData.budget.type === "hourly" ? "5" : "100"}
                    placeholder={
                      formData.budget.type === "hourly" ? "75" : "2500"
                    }
                  />
                  {errors["budget.amount"] && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors["budget.amount"]}
                    </p>
                  )}
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline *
                  </label>
                  <input
                    type="date"
                    value={formData.timeline.deadline}
                    onChange={(e) =>
                      handleNestedChange("timeline", "deadline", e.target.value)
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      errors["timeline.deadline"] ? "border-red-500" : ""
                    }`}
                  />
                  {errors["timeline.deadline"] && (
                    <p className="text-sm text-red-600 mt-1">
                      {errors["timeline.deadline"]}
                    </p>
                  )}
                </div>

                {formData.budget.type === "hourly" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Hours
                    </label>
                    <input
                      type="number"
                      value={formData.timeline.estimated_hours}
                      onChange={(e) =>
                        handleNestedChange(
                          "timeline",
                          "estimated_hours",
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2 border rounded-lg"
                      min="1"
                      placeholder="40"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="bg-white rounded-lg border p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Visibility Settings
            </h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Who can see this job?
              </label>
              <select
                value={formData.visibility}
                onChange={(e) => handleChange("visibility", e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="public">Public - All users</option>
                <option value="verified_only">Verified doctors only</option>
                <option value="invited_only">Invitation only</option>
              </select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={createMutation.isLoading || updateMutation.isLoading}
              className="px-6 py-3 border rounded-lg hover:bg-gray-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Draft
            </button>
            <button
              type="submit"
              disabled={createMutation.isLoading || updateMutation.isLoading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              {createMutation.isLoading || updateMutation.isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  {isEditing ? "Update Job" : "Post Job"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Helper Component for Array Inputs
const ArrayInput = ({ label, items, onAdd, onRemove, placeholder }) => {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = () => {
    if (inputValue.trim()) {
      onAdd(inputValue);
      setInputValue("");
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="flex flex-wrap gap-2 mb-2">
        {items.map((item, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
          >
            {item}
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="hover:bg-blue-200 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) =>
            e.key === "Enter" && (e.preventDefault(), handleAdd())
          }
          className="flex-1 px-3 py-2 border rounded-lg"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default JobPosting;
