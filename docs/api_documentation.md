# API Documentation for Doconnect

## Table of Contents

- [Overview](#overview)
- [Authentication & Authorization](#authentication--authorization)
- [Complete Endpoint Documentation](#complete-endpoint-documentation)
  - [Authentication Endpoints](#authentication-endpoints)
  - [Profile Management Endpoints](#profile-management-endpoints)
  - [Job Posting Endpoints](#job-posting-endpoints)
  - [Application Endpoints](#application-endpoints)
  - [Admin Endpoints](#admin-endpoints)
  - [Search & Discovery Endpoints](#search--discovery-endpoints)
  - [File Upload Endpoints](#file-upload-endpoints)
- [Database Models & Schemas](#database-models--schemas)
- [Request/Response Patterns](#requestresponse-patterns)
- [Pagination & Filtering](#pagination--filtering)
- [File Upload Specifications](#file-upload-specifications)
- [Validation Rules](#validation-rules)
- [Status Codes & Error Handling](#status-codes--error-handling)
- [Business Logic & Workflows](#business-logic--workflows)
- [Security Considerations](#security-considerations)
- [Testing Examples](#testing-examples)
- [Changelog](#changelog)
- [Migration Guides](#migration-guides)
- [Best Practices for API Consumers](#best-practices-for-api-consumers)
- [Common Integration Patterns](#common-integration-patterns)
- [Troubleshooting Guide](#troubleshooting-guide)
- [FAQ](#faq)

## Overview

Doconnect is a MERN-stack (MongoDB, Express.js, React, Node.js) marketplace platform connecting senior doctors (employers) with junior doctors (freelancers) for medical freelance opportunities, such as consultations, research, documentation, reviews, and telemedicine. It functions similarly to "Upwork for Doctors."

### Platform Architecture Overview

- **Backend**: Node.js with Express.js, using MongoDB (via Mongoose) for data storage.
- **Authentication**: JWT-based, with role-based access control (RBAC) for "senior", "junior", and "admin" roles.
- **File Handling**: Integrated with Cloudinary for image and document uploads (profile photos, verification documents).
- **Middleware**: Authentication (`protect`), role authorization (`authorize`), account status checks (`requireActive`, `requireVerifiedAccount`), and custom job/application middleware (e.g., `canPostJobs`, `canApplyToJobs`).
- **Rate Limiting**: Implemented via `express-rate-limit` with tiers: general (100/15min), auth (10/15min), job posting (20/hour), applications (30/hour).
- **CORS**: Configured for production (`https://your-production-domain.com`) and development (`http://localhost:3000`).
- **Error Handling**: Centralized with custom responses; validation via `express-validator`.

### Base URLs and Environments

- **Development**: `http://localhost:5000/api`
- **Production**: `https://api.doconnect.com/api` (assumed; replace with actual domain)
- **API Versioning Strategy**: Currently unversioned (e.g., `/api/auth/register`). Future versions will use `/api/v1/` prefix for backward compatibility.

### Rate Limiting Policies

- General endpoints: 100 requests per 15 minutes.
- Authentication: 10 requests per 15 minutes.
- Job posting: 20 per hour.
- Applications: 30 per hour.
- Exceeded: Returns 429 with `{ success: false, message: "Too many requests..." }`.

### Common Response Formats

See [Request/Response Patterns](#requestresponse-patterns) for details.

### Error Handling Patterns

- Validation errors: 400/422 with `errors` array.
- Auth errors: 401/403.
- Not found: 404.
- Server errors: 500 (logged to console).

## Authentication & Authorization

Authentication uses JWT tokens issued on login/registration. Tokens are HTTP-only cookies in production (secure: true).

- **JWT Token Requirements**: Include `Authorization: Bearer <token>` in headers for protected routes.
- **Role-Based Access Control**:
  - "senior": Post jobs, manage applications.
  - "junior": Apply to jobs, manage profiles.
  - "admin": Verify users, dashboard access.
- **Token Refresh Mechanisms**: No explicit refresh; re-login on expiration (JWT expire: configurable via env, default 30 days cookie).
- **Session Management**: Stateless (JWT); logout clears client-side token (server responds with success).
- **Password Reset Flows**: Not implemented in provided code (future: email reset token).
- **Account Status**: "pending" allows basic access; "active" required for sensitive ops; "verified" for professional features.

## Complete Endpoint Documentation

All endpoints are under `/api/`. Authentication required unless noted.

### Authentication Endpoints

#### POST /auth/register

- **HTTP Method**: POST
- **Route Path**: /api/auth/register
- **Authentication Required**: No (public)
- **Request Headers**: Content-Type: application/json
- **Request Body Schema**:
  ```json
  {
    "firstName": "string (required, minlength: 2, maxlength: 50)",
    "lastName": "string (required, minlength: 2, maxlength: 50)",
    "email": "string (required, valid email)",
    "phone": "string (required)",
    "password": "string (required, minlength: 6, must include uppercase, lowercase, number)",
    "role": "enum (required, values: ['senior', 'junior', 'admin'])",
    "medicalLicenseNumber": "string (required, minlength: 3, maxlength: 50)",
    "licenseState": "string (required, minlength: 2, maxlength: 50)",
    "primarySpecialty": "string (required, minlength: 2, maxlength: 100)",
    "subspecialties": "array<string> (optional, each minlength: 1, maxlength: 100)",
    "yearsOfExperience": "number (required, min: 0, max: 50)",
    "medicalSchool": {
      "name": "string (required, minlength: 2, maxlength: 200)",
      "graduationYear": "number (required, min: 1950, max: current year)"
    },
    "location": {
      "city": "string (optional, maxlength: 100)",
      "state": "string (optional, maxlength: 100)",
      "country": "string (optional, maxlength: 100)",
      "timezone": "string (optional, maxlength: 50)"
    },
    "languages": "array<object> (optional, each: {language: string (required), proficiency: enum(['basic', 'conversational', 'fluent', 'native'])})",
    "bio": "string (optional, maxlength: 2000)",
    "privacy": "object (optional, fields: showEmail: boolean, showPhone: boolean, searchVisibility: enum(['public', 'connections', 'private']))"
  }
  ```
  - **Validation Rules**: Required fields must be present; lengths/enums checked; custom: experience years, graduation year.
- **Request Query Parameters**: None
- **Success Response** (Status Code: 201):
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "token": "string (JWT token)",
    "data": {
      "id": "string (ObjectId)",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "role": "string",
      "primarySpecialty": "string",
      "yearsOfExperience": "number",
      "location": "object",
      "verificationStatus": "object",
      "accountStatus": "string (pending)",
      "profileCompletion": "object",
      "rating": "object",
      "profilePhoto": "string (optional)"
    }
  }
  ```
- **Error Responses**:
  - 400 (Validation Failed): `{ "success": false, "message": "Validation failed", "errors": [{ "field": "firstName", "message": "First name is required" }] }`
  - 400 (User Exists): `{ "success": false, "message": "User already exists" }`
  - 500 (Server Error): `{ "success": false, "message": "Server error" }`
- **Sample Request (curl)**:
  ```bash
  curl -X POST http://localhost:5000/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "phone": "123-456-7890",
      "password": "SecurePass1",
      "role": "junior",
      "medicalLicenseNumber": "ML12345",
      "licenseState": "CA",
      "primarySpecialty": "Cardiology",
      "yearsOfExperience": 3,
      "medicalSchool": {"name": "Harvard Medical School", "graduationYear": 2020}
    }'
  ```
- **Sample Request (JavaScript/Axios)**:

  ```javascript
  import axios from "axios";

  const data = {
    /* body as above */
  };
  axios
    .post("http://localhost:5000/api/auth/register", data)
    .then((response) => console.log(response.data))
    .catch((error) => console.error(error.response.data));
  ```

- **Sample Response**:
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY2ZjQyZGEyZjY0ZGYzMDAwMDAwMDAwMSIsImlhdCI6MTcyNzI3NjY3NCwiZXhwIjoxNzI3ODgxNDc0fQ.abc123",
    "data": {
      "id": "66f42da2f64df30000000001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "junior",
      "primarySpecialty": "Cardiology",
      "yearsOfExperience": 3,
      "location": {},
      "verificationStatus": { "overall": "pending" },
      "accountStatus": "pending",
      "profileCompletion": { "percentage": 60 },
      "rating": { "average": 0, "count": 0 },
      "profilePhoto": ""
    }
  }
  ```
- **Notes**: Creates user with default "pending" status; hashes password using bcrypt; generates JWT; updates profile completion percentage. Side effect: May send verification email (not in code). Related: /auth/login.

#### POST /auth/login

- **HTTP Method**: POST
- **Route Path**: /api/auth/login
- **Authentication Required**: No (public)
- **Request Headers**: Content-Type: application/json
- **Request Body Schema**:
  ```json
  {
    "email": "string (required, valid email)",
    "password": "string (required)"
  }
  ```
  - **Validation Rules**: Email normalized; password exists.
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "string (JWT token)",
    "data": {
      /* same as register data */
    }
  }
  ```
- **Error Responses**:
  - 400 (Validation Failed): `{ "success": false, "message": "Validation failed", "errors": [{ "field": "email", "message": "Please enter a valid email" }] }`
  - 401 (Invalid Credentials): `{ "success": false, "message": "Invalid email or password" }`
  - 401 (Account Locked): `{ "success": false, "message": "Account locked due to too many failed attempts" }`
  - 401 (Account Not Accessible): `{ "success": false, "message": "User account has been deactivated or suspended" }`
- **Sample Request (curl)**:
  ```bash
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{
      "email": "john.doe@example.com",
      "password": "SecurePass1"
    }'
  ```
- **Sample Request (JavaScript/Axios)**:
  ```javascript
  axios
    .post("http://localhost:5000/api/auth/login", {
      email: "john.doe@example.com",
      password: "SecurePass1",
    })
    .then((response) => console.log(response.data.token));
  ```
- **Sample Response**:
  ```json
  {
    "success": true,
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "data": {
      "id": "66f42da2f64df30000000001"
      // ... user fields
    }
  }
  ```
- **Notes**: Verifies password; increments failed attempts (lock after 5 for 30min); updates last login. Business logic: Only "active" or "pending" accounts can login. Related: /auth/me for user details after login.

#### GET /auth/logout

- **HTTP Method**: GET
- **Route Path**: /api/auth/logout
- **Authentication Required**: No (optional token for lastActive update)
- **Request Headers**: Authorization: Bearer <token> (optional)
- **Request Body Schema**: None
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "message": "User logged out successfully"
  }
  ```
- **Error Responses**:
  - 500 (Server Error): `{ "success": false, "message": "Server error" }` (rare)
- **Sample Request (curl)**:
  ```bash
  curl -X GET http://localhost:5000/api/auth/logout \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  ```
- **Sample Request (JavaScript/Axios)**:
  ```javascript
  axios.get("http://localhost:5000/api/auth/logout", {
    headers: { Authorization: `Bearer ${token}` },
  });
  ```
- **Sample Response**:
  ```json
  {
    "success": true,
    "message": "User logged out successfully"
  }
  ```
- **Notes**: If authenticated, updates user.lastActive. Client should clear local token. No server-side session invalidation (stateless JWT). Related: Use after sensitive operations.

#### GET /auth/me

- **HTTP Method**: GET
- **Route Path**: /api/auth/me
- **Authentication Required**: Yes (any role, pending/active)
- **Request Headers**: Authorization: Bearer <token>
- **Request Body Schema**: None
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "data": {
      "id": "string",
      "firstName": "string",
      "lastName": "string",
      "email": "string",
      "role": "string"
      // ... all non-sensitive user fields
    }
  }
  ```
- **Error Responses**:
  - 401 (Unauthorized): `{ "success": false, "message": "Not authorized to access this route" }`
  - 401 (Account Not Accessible): `{ "success": false, "message": "User account has been deactivated or suspended" }`
  - 404 (User Not Found): `{ "success": false, "message": "No user found with this token" }`
- **Sample Request (curl)**:
  ```bash
  curl -X GET http://localhost:5000/api/auth/me \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  ```
- **Sample Request (JavaScript/Axios)**:
  ```javascript
  axios
    .get("http://localhost:5000/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
    .then((response) => console.log(response.data.data));
  ```
- **Sample Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "66f42da2f64df30000000001",
      "firstName": "John"
      // ... full user without password
    }
  }
  ```
- **Notes**: Uses protect and checkAccountStatus middleware; excludes password. Business logic: Attaches accountStatusInfo to req for controllers (not in response). Related: Call after login to get user data.

#### PUT /auth/updatedetails

- **HTTP Method**: PUT
- **Route Path**: /api/auth/updatedetails
- **Authentication Required**: Yes (any role, pending allowed)
- **Request Headers**: Authorization: Bearer <token>, Content-Type: application/json
- **Request Body Schema**: Partial user fields, e.g.:
  ```json
  {
    "firstName": "string (minlength: 2, maxlength: 50)",
    "email": "string (valid email)",
    "phone": "string"
    // ... other updatable fields like bio, location
  }
  ```
  - **Validation Rules**: Optional fields; lengths/enums as in register.
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "message": "Details updated successfully",
    "token": "string (new JWT)",
    "data": {
      /* updated user */
    }
  }
  ```
- **Error Responses**:
  - 400 (Validation): `{ "success": false, "message": "Validation failed", "errors": [...] }`
  - 500 (Server): `{ "success": false, "message": "Server error" }`
- **Sample Request (curl)**:
  ```bash
  curl -X PUT http://localhost:5000/api/auth/updatedetails \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
    -H "Content-Type: application/json" \
    -d '{
      "firstName": "Jonathan",
      "bio": "Updated bio text"
    }'
  ```
- **Sample Request (JavaScript/Axios)**:
  ```javascript
  axios.put(
    "http://localhost:5000/api/auth/updatedetails",
    { firstName: "Jonathan" },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  ```
- **Sample Response**:
  ```json
  {
    "success": true,
    "message": "Details updated successfully",
    "token": "new.token.here",
    "data": {
      "id": "66f42da2f64df30000000001",
      "firstName": "Jonathan"
      // ...
    }
  }
  ```
- **Notes**: Re-issues JWT if email changed; updates profile completion. Side effect: May trigger re-verification if critical fields changed. Related: /profile/basic for more profile updates.

#### PUT /auth/updatepassword

- **HTTP Method**: PUT
- **Route Path**: /api/auth/updatepassword
- **Authentication Required**: Yes (active account only)
- **Request Headers**: Authorization: Bearer <token>, Content-Type: application/json
- **Request Body Schema**:
  ```json
  {
    "currentPassword": "string (required)",
    "newPassword": "string (required, minlength: 6, complex)"
  }
  ```
  - **Validation Rules**: Fields required; newPassword matches complexity.
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "message": "Password updated successfully",
    "token": "string (new JWT)",
    "data": {
      /* user */
    }
  }
  ```
- **Error Responses**:
  - 400 (Missing Fields): `{ "success": false, "message": "Current password and new password are required" }`
  - 401 (Incorrect Current): `{ "success": false, "message": "Current password is incorrect" }`
  - 403 (Not Active): `{ "success": false, "message": "Active account status required..." }`
  - 500 (Server): `{ "success": false, "message": "Server error" }`
- **Sample Request (curl)**:
  ```bash
  curl -X PUT http://localhost:5000/api/auth/updatepassword \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
    -H "Content-Type: application/json" \
    -d '{
      "currentPassword": "SecurePass1",
      "newPassword": "NewSecurePass2"
    }'
  ```
- **Sample Request (JavaScript/Axios)**:
  ```javascript
  axios.put(
    "http://localhost:5000/api/auth/updatepassword",
    { currentPassword: "old", newPassword: "new" },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  ```
- **Sample Response**:
  ```json
  {
    "success": true,
    "message": "Password updated successfully",
    "token": "new.token",
    "data": {
      "id": "66f42da2f64df30000000001"
      // ...
    }
  }
  ```
- **Notes**: Uses requireActive middleware; hashes new password. Side effect: Resets failed attempts. Related: Call when user wants to change password.

### Profile Management Endpoints

#### GET /profile/me

- **HTTP Method**: GET
- **Route Path**: /api/profile/me
- **Authentication Required**: Yes (pending/active)
- **Request Headers**: Authorization: Bearer <token>
- **Request Body Schema**: None
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "data": {
      /* full user profile with populated reviews */
    }
  }
  ```
- **Error Responses**:
  - 401 (Unauthorized): `{ "success": false, "message": "Not authorized..." }`
  - 404 (Not Found): `{ "success": false, "message": "Profile not found" }`
  - 500 (Server): `{ "success": false, "message": "Server error while fetching profile" }`
- **Sample Request (curl)**:
  ```bash
  curl -X GET http://localhost:5000/api/profile/me \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  ```
- **Sample Request (JavaScript/Axios)**:
  ```javascript
  axios.get("http://localhost:5000/api/profile/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  ```
- **Sample Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "66f42da2f64df30000000001",
      "reviews": [
        /* populated */
      ]
      // ...
    }
  }
  ```
- **Notes**: Populates reviews with reviewer info. Business logic: Logs for analytics. Related: /profile/analytics.

#### GET /profile/:identifier

- **HTTP Method**: GET
- **Route Path**: /api/profile/:identifier (slug or ObjectId)
- **Authentication Required**: No (public view; full if owner)
- **Request Headers**: Authorization: Bearer <token> (optional for full view)
- **Request Body Schema**: None
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "data": {
      /* public or full profile */
    }
  }
  ```
- **Error Responses**:
  - 404 (Not Found): `{ "success": false, "message": "Profile not found" }`
  - 500 (Server): `{ "success": false, "message": "Server error" }`
- **Sample Request (curl)**:
  ```bash
  curl -X GET http://localhost:5000/api/profile/john-doe-slug \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  ```
- **Sample Request (JavaScript/Axios)**:
  ```javascript
  axios.get("http://localhost:5000/api/profile/66f42da2f64df30000000001");
  ```
- **Sample Response**:
  ```json
  {
    "success": true,
    "data": {
      "firstName": "John"
      // public fields; private if owner
    }
  }
  ```
- **Notes**: Looks up by slug or ID; tracks view in analytics if not owner. Filters sensitive fields (e.g., email) if not owner. Related: /profile/search for multiple.

#### PUT /profile/basic

- **HTTP Method**: PUT
- **Route Path**: /api/profile/basic
- **Authentication Required**: Yes (pending allowed)
- **Request Headers**: Authorization: Bearer <token>, Content-Type: application/json
- **Request Body Schema**:
  ```json
  {
    "firstName": "string (optional, 2-50)",
    "lastName": "string (optional, 2-50)",
    "bio": "string (optional, max 2000)",
    "location": {
      "city": "string (optional, max 100)",
      "state": "string (optional, max 100)",
      "country": "string (optional, max 100)",
      "timezone": "string (optional, max 50)"
    },
    "languages": "array<{language: string, proficiency: enum}> (optional)",
    "subspecialties": "array<string (1-100)> (optional)"
  }
  ```
  - **Validation Rules**: Optional; trim/escape; lengths/enums.
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "data": {
      /* updated profile */
    }
  }
  ```
- **Error Responses**:
  - 400 (Validation): `{ "success": false, "message": "Validation error", "errors": [...] }`
  - 500 (Server): `{ "success": false, "message": "Server error" }`
- **Sample Request (curl)**:
  ```bash
  curl -X PUT http://localhost:5000/api/profile/basic \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
    -H "Content-Type: application/json" \
    -d '{
      "bio": "Experienced cardiologist",
      "location": {"city": "Los Angeles"}
    }'
  ```
- **Sample Request (JavaScript/Axios)**:
  ```javascript
  axios.put(
    "http://localhost:5000/api/profile/basic",
    { bio: "New bio" },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  ```
- **Sample Response**:
  ```json
  {
    "success": true,
    "data": {
      "bio": "Experienced cardiologist"
      // ...
    }
  }
  ```
- **Notes**: Updates profile completion. Side effect: May affect search index. Related: /profile/me to verify.

#### POST /profile/photo

- **HTTP Method**: POST
- **Route Path**: /api/profile/photo
- **Authentication Required**: Yes (pending allowed)
- **Request Headers**: Authorization: Bearer <token>, Content-Type: multipart/form-data
- **Request Body Schema**: Form-data: profilePhoto (file, image/\*, max 10MB)
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "data": {
      "profilePhoto": "https://res.cloudinary.com/.../profile.jpg"
    }
  }
  ```
- **Error Responses**:
  - 400 (Invalid File): `{ "success": false, "message": "Profile photo must be an image file" }`
  - 500 (Upload Failed): `{ "success": false, "message": "Error uploading photo" }`
- **Sample Request (curl)**:
  ```bash
  curl -X POST http://localhost:5000/api/profile/photo \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
    -F "profilePhoto=@/path/to/photo.jpg"
  ```
- **Sample Request (JavaScript/Axios)**:
  ```javascript
  const formData = new FormData();
  formData.append("profilePhoto", file);
  axios.post("/api/profile/photo", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  ```
- **Sample Response**:
  ```json
  {
    "success": true,
    "data": {
      "profilePhoto": "https://res.cloudinary.com/doconnect/image/upload/v1727276674/profile_66f42da2f64df30000000001.jpg"
    }
  }
  ```
- **Notes**: Uploads to Cloudinary; optimizes (e.g., resize). Side effect: Updates profile completion. Related: See file specs.

#### POST /profile/documents

- **HTTP Method**: POST
- **Route Path**: /api/profile/documents
- **Authentication Required**: Yes (pending allowed)
- **Request Headers**: Authorization: Bearer <token>, Content-Type: multipart/form-data
- **Request Body Schema**: Form-data: documents (array files, image/\* or application/pdf, max 5, 10MB each), types (array<string> e.g., ['medical_license'])
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "data": {
      "documents": [
        {
          "type": "medical_license",
          "url": "https://res.cloudinary.com/.../doc.pdf",
          "uploadedAt": "date",
          "verified": false
        }
      ]
    }
  }
  ```
- **Error Responses**:
  - 400 (Invalid File): `{ "success": false, "message": "Documents must be image or PDF files" }`
  - 500 (Upload): `{ "success": false, "message": "Error uploading documents" }`
- **Sample Request (curl)**:
  ```bash
  curl -X POST http://localhost:5000/api/profile/documents \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
    -F "documents=@/path/to/license.pdf" \
    -F "types=medical_license"
  ```
- **Sample Request (JavaScript/Axios)**:
  ```javascript
  const formData = new FormData();
  formData.append("documents", file1);
  formData.append("types", "medical_license");
  axios.post("/api/profile/documents", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
      Authorization: `Bearer ${token}`,
    },
  });
  ```
- **Sample Response**:
  ```json
  {
    "success": true,
    "data": {
      "documents": [
        /* array as above */
      ]
    }
  }
  ```
- **Notes**: Multiple files; sets verification to pending. Side effect: Triggers admin notification (not in code). Related: /admin/verification.

#### DELETE /profile/documents/:docId

- **HTTP Method**: DELETE
- **Route Path**: /api/profile/documents/:docId
- **Authentication Required**: Yes (pending allowed)
- **Request Headers**: Authorization: Bearer <token>
- **Request Body Schema**: None
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "message": "Document deleted successfully"
  }
  ```
- **Error Responses**:
  - 400 (Invalid ID): `{ "success": false, "message": "Invalid document ID" }`
  - 404 (Not Found): `{ "success": false, "message": "Document not found" }`
  - 500 (Server): `{ "success": false, "message": "Server error" }`
- **Sample Request (curl)**:
  ```bash
  curl -X DELETE http://localhost:5000/api/profile/documents/66f42da2f64df30000000002 \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  ```
- **Sample Request (JavaScript/Axios)**:
  ```javascript
  axios.delete(`/api/profile/documents/${docId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  ```
- **Sample Response**:
  ```json
  {
    "success": true,
    "message": "Document deleted successfully"
  }
  ```
- **Notes**: Deletes from Cloudinary and user array. Side effect: May change verification status to pending.

#### POST /profile/experience

- **HTTP Method**: POST
- **Route Path**: /api/profile/experience
- **Authentication Required**: Yes (active)
- **Request Headers**: Authorization: Bearer <token>, Content-Type: application/json
- **Request Body Schema**:
  ```json
  {
    "title": "string (required, trim)",
    "institution": "string (required, trim)",
    "location": "string (required, trim)",
    "startDate": "date (required)",
    "endDate": "date (optional)",
    "current": "boolean (default false)",
    "description": "string (optional, maxlength: 1000, trim)",
    "type": "enum (required, values: ['residency', 'fellowship', 'employment', 'education'])"
  }
  ```
  - **Validation Rules**: Required fields; dates valid; type enum.
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "data": {
      /* updated experiences array */
    }
  }
  ```
- **Error Responses**:
  - 400 (Validation): `{ "success": false, "message": "Validation error", "errors": [...] }`
  - 403 (Not Active): `{ "success": false, "message": "Active account required" }`
  - 500 (Server): `{ "success": false, "message": "Server error" }`
- **Sample Request (curl)**:
  ```bash
  curl -X POST http://localhost:5000/api/profile/experience \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Resident Physician",
      "institution": "General Hospital",
      "location": "Los Angeles",
      "startDate": "2018-06-01",
      "endDate": "2021-06-01",
      "type": "residency"
    }'
  ```
- **Sample Request (JavaScript/Axios)**:
  ```javascript
  axios.post(
    "/api/profile/experience",
    { title: "Resident" /* ... */ },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  ```
- **Sample Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "title": "Resident Physician"
        // ...
      }
    ]
  }
  ```
- **Notes**: Adds to experiences; recalculates yearsOfExperience and profile completion. Related: /profile/experience/:id for update.

#### PUT /profile/experience/:experienceId

- **HTTP Method**: PUT
- **Route Path**: /api/profile/experience/:experienceId
- **Authentication Required**: Yes (active)
- **Request Headers**: Authorization: Bearer <token>, Content-Type: application/json
- **Request Body Schema**: Partial experience fields (as in POST)
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "data": {
      /* updated experiences */
    }
  }
  ```
- **Error Responses**:
  - 400 (Invalid ID): `{ "success": false, "message": "Invalid experience ID" }`
  - 404 (Not Found): `{ "success": false, "message": "Experience not found" }`
  - 400 (Validation): `{ "success": false, "errors": [...] }`
- **Sample Request (curl)**:
  ```bash
  curl -X PUT http://localhost:5000/api/profile/experience/66f42da2f64df30000000003 \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
    -H "Content-Type: application/json" \
    -d '{
      "endDate": "2022-06-01"
    }'
  ```
- **Sample Request (JavaScript/Axios)**:
  ```javascript
  axios.put(
    `/api/profile/experience/${expId}`,
    { endDate: "2022-06-01" },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  ```
- **Sample Response**:
  ```json
  {
    "success": true,
    "data": [
      /* updated array */
    ]
  }
  ```
- **Notes**: Updates specific experience; recalculates totals.

#### DELETE /profile/experience/:experienceId

- **HTTP Method**: DELETE
- **Route Path**: /api/profile/experience/:experienceId
- **Authentication Required**: Yes (active)
- **Request Headers**: Authorization: Bearer <token>
- **Request Body Schema**: None
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "message": "Experience deleted successfully"
  }
  ```
- **Error Responses**: 400 (Invalid ID), 404, 500
- **Sample Request (curl)**:
  ```bash
  curl -X DELETE http://localhost:5000/api/profile/experience/66f42da2f64df30000000003 \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  ```
- **Sample Request (JavaScript/Axios)**:
  ```javascript
  axios.delete(`/api/profile/experience/${expId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  ```
- **Sample Response**:
  ```json
  {
    "success": true,
    "message": "Experience deleted successfully"
  }
  ```
- **Notes**: Removes from array; recalculates experience.

#### PUT /profile/skills

- **HTTP Method**: PUT
- **Route Path**: /api/profile/skills
- **Authentication Required**: Yes (active)
- **Request Headers**: Authorization: Bearer <token>, Content-Type: application/json
- **Request Body Schema**:
  ```json
  {
    "skills": "array<object> (each: {name: string (required, trim), category: enum(['clinical', 'research', 'administrative', 'technical', 'other'], default 'clinical'), proficiencyLevel: enum(['beginner', 'intermediate', 'advanced', 'expert'], default 'intermediate'), yearsOfExperience: number (0-50), verified: boolean (default false)})"
  }
  ```
  - **Validation Rules**: Array; each field rules as above.
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "data": {
      /* updated skills */
    }
  }
  ```
- **Error Responses**: 400, 403, 500
- **Sample Request (curl)**:
  ```bash
  curl -X PUT http://localhost:5000/api/profile/skills \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
    -H "Content-Type: application/json" \
    -d '{
      "skills": [
        {"name": "ECG Interpretation", "category": "clinical", "proficiencyLevel": "expert", "yearsOfExperience": 5}
      ]
    }'
  ```
- **Sample Request (JavaScript/Axios)**:
  ```javascript
  axios.put(
    "/api/profile/skills",
    {
      skills: [
        /* objects */
      ],
    },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  ```
- **Sample Response**:
  ```json
  {
    "success": true,
    "data": [
      /* skills array */
    ]
  }
  ```
- **Notes**: Replaces entire skills array; updates completion.

#### POST /profile/certifications

- **HTTP Method**: POST
- **Route Path**: /api/profile/certifications
- **Authentication Required**: Yes (active)
- **Request Headers**: Authorization: Bearer <token>, Content-Type: application/json
- **Request Body Schema**:
  ```json
  {
    "name": "string (required, trim)",
    "issuingOrganization": "string (required, trim)",
    "issueDate": "date (required)",
    "expirationDate": "date (optional)",
    "credentialId": "string (optional, trim)",
    "credentialUrl": "string (optional, trim)",
    "verified": "boolean (default false)"
  }
  ```
  - **Validation Rules**: Required fields; dates valid.
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "data": {
      /* updated certifications */
    }
  }
  ```
- **Error Responses**: 400, 403, 500
- **Sample Request (curl)**:
  ```bash
  curl -X POST http://localhost:5000/api/profile/certifications \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Board Certified Cardiologist",
      "issuingOrganization": "American Board of Internal Medicine",
      "issueDate": "2022-01-01"
    }'
  ```
- **Sample Request (JavaScript/Axios)**: Similar to experience.
- **Sample Response**:
  ```json
  {
    "success": true,
    "data": [
      /* array */
    ]
  }
  ```
- **Notes**: Adds to array; may trigger verification.

#### PUT /profile/certifications/:certificationId

- **HTTP Method**: PUT
- **Route Path**: /api/profile/certifications/:certificationId
- **Authentication Required**: Yes (active)
- **Request Headers**: Authorization: Bearer <token>, Content-Type: application/json
- **Request Body Schema**: Partial certification fields
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "data": {
      /* updated */
    }
  }
  ```
- **Error Responses**: 400 (Invalid ID), 404, 400 (Validation)
- **Sample Request (curl)**: PUT with ID, partial body.
- **Sample Request (JavaScript/Axios)**: Similar.
- **Sample Response**: Updated array.
- **Notes**: Updates specific; checks ID MongoId.

#### DELETE /profile/certifications/:certificationId

- **HTTP Method**: DELETE
- **Route Path**: /api/profile/certifications/:certificationId
- **Authentication Required**: Yes (active)
- **Request Headers**: Authorization: Bearer <token>
- **Request Body Schema**: None
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "message": "Certification deleted successfully"
  }
  ```
- **Error Responses**: 400, 404, 500
- **Sample Request (curl)**: DELETE with ID.
- **Sample Request (JavaScript/Axios)**: Similar.
- **Sample Response**: Message.
- **Notes**: Removes; updates completion.

#### PUT /profile/availability

- **HTTP Method**: PUT
- **Route Path**: /api/profile/availability
- **Authentication Required**: Yes (active)
- **Request Headers**: Authorization: Bearer <token>, Content-Type: application/json
- **Request Body Schema**:
  ```json
  {
    "weeklyHours": "number (optional, min: 0, max: 168)",
    "preferredTimes": "array<string> (optional)",
    "availabilityStatus": "enum (optional, values: ['available', 'busy', 'vacation'])"
  }
  ```
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "data": {
      /* updated availability */
    }
  }
  ```
- **Error Responses**: 400, 403, 500
- **Sample Request (curl)**:
  ```bash
  curl -X PUT http://localhost:5000/api/profile/availability \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
    -H "Content-Type: application/json" \
    -d '{
      "weeklyHours": 40,
      "availabilityStatus": "available"
    }'
  ```
- **Sample Request (JavaScript/Axios)**: PUT with body.
- **Sample Response**: Updated object.
- **Notes**: Updates scheduling info.

#### PUT /profile/privacy

- **HTTP Method**: PUT
- **Route Path**: /api/profile/privacy
- **Authentication Required**: Yes (active)
- **Request Headers**: Authorization: Bearer <token>, Content-Type: application/json
- **Request Body Schema**:
  ```json
  {
    "showEmail": "boolean (optional)",
    "showPhone": "boolean (optional)",
    "searchVisibility": "enum (optional, values: ['public', 'connections', 'private'])"
  }
  ```
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "data": {
      /* updated privacy */
    }
  }
  ```
- **Error Responses**: 400, 403, 500
- **Sample Request (curl)**: PUT with body.
- **Sample Request (JavaScript/Axios)**: Similar.
- **Sample Response**: Updated object.
- **Notes**: Affects public view.

#### GET /profile/search

- **HTTP Method**: GET
- **Route Path**: /api/profile/search
- **Authentication Required**: No (public)
- **Request Headers**: None
- **Request Body Schema**: None
- **Request Query Parameters**:
  - q: string (search term, optional)
  - primarySpecialty: string (filter, optional)
  - experience: number (min years, optional)
  - rating: number (min average, optional)
  - location: string (city/state, optional)
  - verified: boolean (true for verified, optional)
  - sortBy: enum (rating|experience|recent, optional, default relevance)
  - page: number (min 1, optional, default 1)
  - limit: number (1-20, optional, default 20)
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "data": [
      /* array of profiles, filtered fields */
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "pages": 3
    }
  }
  ```
- **Error Responses**: 500 (Server)
- **Sample Request (curl)**:
  ```bash
  curl -X GET "http://localhost:5000/api/profile/search?q=cardiology&experience=5&verified=true&sortBy=rating&page=1&limit=10"
  ```
- **Sample Request (JavaScript/Axios)**:
  ```javascript
  axios.get("/api/profile/search", {
    params: { q: "cardiology", verified: true },
  });
  ```
- **Sample Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "66f...",
        "firstName": "John"
        // ...
      }
    ],
    "pagination": {
      /* ... */
    }
  }
  ```
- **Notes**: Uses Mongoose text search; populates reviews. Business logic: Only active accounts; respects privacy visibility.

#### GET /profile/analytics

- **HTTP Method**: GET
- **Route Path**: /api/profile/analytics
- **Authentication Required**: Yes (verified)
- **Request Headers**: Authorization: Bearer <token>
- **Request Body Schema**: None
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "data": {
      "profileViews": [
        /* array */
      ],
      "recentViews": 5,
      "profileCompletion": { "percentage": 85 },
      "rating": { "average": 4.5 },
      "trend": { "viewsGrowth": "up" }
    }
  }
  ```
- **Error Responses**: 403 (Not Verified), 404, 500
- **Sample Request (curl)**:
  ```bash
  curl -X GET http://localhost:5000/api/profile/analytics \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  ```
- **Sample Request (JavaScript/Axios)**: GET with headers.
- **Sample Response**: As above.
- **Notes**: Calculates last 30 days; requires verified account.

### Job Posting Endpoints

#### POST /jobs/create

- **HTTP Method**: POST
- **Route Path**: /api/jobs/create
- **Authentication Required**: Yes (senior, active, canPostJobs, checkJobPostingLimit)
- **Request Headers**: Authorization: Bearer <token>, Content-Type: application/json
- **Request Body Schema**:
  ```json
  {
    "title": "string (required, minlength: 10, maxlength: 100, trim, matches /^[a-zA-Z0-9s-.,:;]+$/)",
    "description": "string (required, minlength: 50, maxlength: 2000, trim)",
    "category": "enum (required, values: ['consultation', 'research', 'documentation', 'review', 'telemedicine'])",
    "specialty": "string (required, trim, minlength: 2, maxlength: 100)",
    "subSpecialties": "array<string> (optional, each trim)",
    "skills_required": "array<string> (optional, each trim, minlength: 2, maxlength: 100)",
    "experience_required": {
      "minimum_years": "number (required, min: 0, max: 50)",
      "level": "enum (required, values: ['resident', 'junior', 'mid-level', 'senior', 'attending'])"
    },
    "budget": {
      "type": "enum (required, values: ['fixed', 'hourly', 'negotiable'])",
      "amount": "number (required if not negotiable, min: 0, max: 1000000)",
      "currency": "enum (default 'USD', values: ['USD', 'EUR', 'GBP', 'CAD', 'AUD'])",
      "negotiable": "boolean (default false)"
    },
    "timeline": {
      "estimated_hours": "number (optional, min: 1)",
      "deadline": "date (required)"
    }
    // ... additional fields like requirements, analytics defaults
  }
  ```
  - **Validation Rules**: As in validateJobCreation; custom for conditional fields.
- **Request Query Parameters**: None
- **Success Response** (Status Code: 201):
  ```json
  {
    "success": true,
    "message": "Job created successfully",
    "data": {
      "id": "string",
      "title": "string",
      "posted_by": {
        "firstName": "string",
        "lastName": "string",
        "profilePhoto": "string"
      }
      // ... full job
    }
  }
  ```
- **Error Responses**:
  - 400 (Validation): `{ "success": false, "message": "Validation failed", "errors": [...] }`
  - 403 (Role): `{ "success": false, "message": "Only senior doctors can post jobs" }`
  - 403 (Limit): `{ "success": false, "message": "Job posting limit exceeded" }`
  - 500 (Server): `{ "success": false, "message": "Server error while creating job" }`
- **Sample Request (curl)**:
  ```bash
  curl -X POST http://localhost:5000/api/jobs/create \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Cardiology Research Assistant",
      "description": "Assist with research on heart diseases...",
      "category": "research",
      "specialty": "Cardiology",
      "experience_required": {"minimum_years": 2, "level": "junior"},
      "budget": {"type": "hourly", "amount": 50, "currency": "USD"},
      "timeline": {"deadline": "2025-12-31"}
    }'
  ```
- **Sample Request (JavaScript/Axios)**:
  ```javascript
  axios.post(
    "/api/jobs/create",
    { title: "Job Title" /* ... */ },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  ```
- **Sample Response**:
  ```json
  {
    "success": true,
    "message": "Job created successfully",
    "data": {
      "id": "66f42da2f64df30000000004",
      "title": "Cardiology Research Assistant",
      "posted_by": { "firstName": "Senior", "lastName": "Doc" }
      // ...
    }
  }
  ```
- **Notes**: Sets posted_by to user.id; populates in response; updates user job stats. Side effect: New job status "draft". Related: /jobs/:id/update to activate.

#### GET /jobs/browse

- **HTTP Method**: GET
- **Route Path**: /api/jobs/browse
- **Authentication Required**: No (public)
- **Request Headers**: None
- **Request Body Schema**: None
- **Request Query Parameters**:
  - category: enum (optional)
  - specialty: string (optional)
  - experience_level: enum (optional)
  - budget_min: number (optional)
  - budget_max: number (optional)
  - remote_only: boolean (optional)
  - deadline_days: number (optional)
  - sortBy: enum (budget_high|budget_low|deadline|recent, optional)
  - page: number (default 1)
  - limit: number (default 20)
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "data": [
      /* array of jobs, populated posted_by */
    ],
    "pagination": {
      /* ... */
    }
  }
  ```
- **Error Responses**: 500
- **Sample Request (curl)**:
  ```bash
  curl -X GET "http://localhost:5000/api/jobs/browse?category=research&sortBy=recent&page=1&limit=10"
  ```
- **Sample Request (JavaScript/Axios)**:
  ```javascript
  axios.get("/api/jobs/browse", { params: { category: "research" } });
  ```
- **Sample Response**:
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "66f...",
        "title": "Research Job"
        // ...
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 20, "pages": 2 }
  }
  ```
- **Notes**: Filters active jobs; paginated/sorted. Related: /jobs/search for text search.

#### GET /jobs/search

- **HTTP Method**: GET
- **Route Path**: /api/jobs/search
- **Authentication Required**: No
- **Request Headers**: None
- **Request Body Schema**: None
- **Request Query Parameters**: searchTerm (string, optional), plus filters as in browse, sortBy.
- **Success Response** (Status Code: 200): Similar to browse.
- **Error Responses**: 500
- **Sample Request (curl)**:
  ```bash
  curl -X GET "http://localhost:5000/api/jobs/search?searchTerm=cardiology&budget_min=50"
  ```
- **Sample Request (JavaScript/Axios)**: Similar.
- **Sample Response**: Job array with pagination.
- **Notes**: Uses $text search; scores if searchTerm.

#### GET /jobs/:id

- **HTTP Method**: GET
- **Route Path**: /api/jobs/:id
- **Authentication Required**: No (public, with visibility check)
- **Request Headers**: Authorization: Bearer <token> (optional for owner fields)
- **Request Body Schema**: None
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "data": {
      /* job with populated posted_by; full if owner */
    }
  }
  ```
- **Error Responses**: 404, 500
- **Sample Request (curl)**:
  ```bash
  curl -X GET http://localhost:5000/api/jobs/66f42da2f64df30000000004
  ```
- **Sample Request (JavaScript/Axios)**: GET with ID.
- **Sample Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "66f...",
      "title": "Job Title"
      // ...
    }
  }
  ```
- **Notes**: Increments views_count asynchronously. Filters analytics if not owner.

#### PUT /jobs/:id/update

- **HTTP Method**: PUT
- **Route Path**: /api/jobs/:id/update
- **Authentication Required**: Yes (owner, active, canManageJob)
- **Request Headers**: Authorization: Bearer <token>, Content-Type: application/json
- **Request Body Schema**: Partial job fields (as in create)
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "message": "Job updated successfully",
    "data": {
      /* updated job */
    }
  }
  ```
- **Error Responses**: 400 (Validation/Transition), 403, 404, 500
- **Sample Request (curl)**:
  ```bash
  curl -X PUT http://localhost:5000/api/jobs/66f42da2f64df30000000004/update \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
    -H "Content-Type: application/json" \
    -d '{
      "description": "Updated description"
    }'
  ```
- **Sample Request (JavaScript/Axios)**: PUT with body.
- **Sample Response**: Updated job.
- **Notes**: Validates status transition. Side effect: Updates analytics if applicable.

#### DELETE /jobs/:id

- **HTTP Method**: DELETE
- **Route Path**: /api/jobs/:id
- **Authentication Required**: Yes (owner, canManageJob)
- **Request Headers**: Authorization: Bearer <token>
- **Request Body Schema**: None
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "message": "Job deleted successfully"
  }
  ```
- **Error Responses**: 403 (Has Applications): `{ "success": false, "message": "Cannot delete job with applications" }`, 404, 500
- **Sample Request (curl)**:
  ```bash
  curl -X DELETE http://localhost:5000/api/jobs/66f42da2f64df30000000004 \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  ```
- **Sample Request (JavaScript/Axios)**: DELETE with ID.
- **Sample Response**: Message.
- **Notes**: Checks no applications; updates user stats.

#### GET /jobs/my-jobs

- **HTTP Method**: GET
- **Route Path**: /api/jobs/my-jobs
- **Authentication Required**: Yes (senior, canPostJobs)
- **Request Headers**: Authorization: Bearer <token>
- **Request Body Schema**: None
- **Request Query Parameters**: status (enum, optional), sortBy (enum, optional), page, limit
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "data": [
      /* jobs */
    ],
    "pagination": {
      /* ... */
    }
  }
  ```
- **Error Responses**: 403, 500
- **Sample Request (curl)**:
  ```bash
  curl -X GET "http://localhost:5000/api/jobs/my-jobs?status=active&sortBy=createdAt&page=1&limit=10" \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  ```
- **Sample Request (JavaScript/Axios)**: GET with params.
- **Sample Response**: Paginated jobs.
- **Notes**: Filters by posted_by = user.id.

#### PUT /jobs/:id/pause

- **HTTP Method**: PUT
- **Route Path**: /api/jobs/:id/pause
- **Authentication Required**: Yes (owner)
- **Request Headers**: Authorization: Bearer <token>
- **Request Body Schema**: None
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "message": "Job paused successfully",
    "data": { "status": "paused" }
  }
  ```
- **Error Responses**: 400 (Invalid Transition), 403, 404, 500
- **Sample Request (curl)**:
  ```bash
  curl -X PUT http://localhost:5000/api/jobs/66f42da2f64df30000000004/pause \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  ```
- **Sample Request (JavaScript/Axios)**: PUT without body.
- **Sample Response**: Updated status.
- **Notes**: From active to paused; validates transition.

#### PUT /jobs/:id/activate

- **HTTP Method**: PUT
- **Route Path**: /api/jobs/:id/activate
- **Authentication Required**: Yes (owner)
- **Request Headers**: Authorization: Bearer <token>
- **Request Body Schema**: None
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "message": "Job activated successfully",
    "data": { "status": "active" }
  }
  ```
- **Error Responses**: 400, 403, 404, 500
- **Sample Request (curl)**: PUT to /activate.
- **Sample Request (JavaScript/Axios)**: Similar.
- **Sample Response**: Updated.
- **Notes**: From draft/paused to active.

#### GET /jobs/categories

- **HTTP Method**: GET
- **Route Path**: /api/jobs/categories
- **Authentication Required**: No
- **Request Headers**: None
- **Request Body Schema**: None
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "data": [
      "consultation",
      "research",
      "documentation",
      "review",
      "telemedicine"
    ]
  }
  ```
- **Error Responses**: 500
- **Sample Request (curl)**:
  ```bash
  curl -X GET http://localhost:5000/api/jobs/categories
  ```
- **Sample Request (JavaScript/Axios)**: GET.
- **Sample Response**: Array.
- **Notes**: Static from enum.

#### GET /jobs/trending

- **HTTP Method**: GET
- **Route Path**: /api/jobs/trending
- **Authentication Required**: No
- **Request Headers**: None
- **Request Body Schema**: None
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "data": [
      /* trending jobs, e.g., high views/applications */
    ]
  }
  ```
- **Error Responses**: 500
- **Sample Request (curl)**: GET.
- **Sample Request (JavaScript/Axios)**: Similar.
- **Sample Response**: Job array.
- **Notes**: Based on views/applications; limited to active.

#### GET /jobs/statistics

- **HTTP Method**: GET
- **Route Path**: /api/jobs/statistics
- **Authentication Required**: No
- **Request Headers**: None
- **Request Body Schema**: None
- **Request Query Parameters**: period (enum: week|month|quarter|year|all, optional), category (enum, optional)
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "data": { "totalJobs": 100, "activeJobs": 50 /* ... */ }
  }
  ```
- **Error Responses**: 400 (Invalid Query), 500
- **Sample Request (curl)**:
  ```bash
  curl -X GET "http://localhost:5000/api/jobs/statistics?period=month&category=research"
  ```
- **Sample Request (JavaScript/Axios)**: GET with params.
- **Sample Response**: Stats object.
- **Notes**: Aggregates from DB.

#### POST /jobs/:id/view

- **HTTP Method**: POST
- **Route Path**: /api/jobs/:id/view
- **Authentication Required**: No
- **Request Headers**: None
- **Request Body Schema**: None
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "message": "View tracked"
  }
  ```
- **Error Responses**: 400 (Invalid ID), 404, 500
- **Sample Request (curl)**:
  ```bash
  curl -X POST http://localhost:5000/api/jobs/66f42da2f64df30000000004/view
  ```
- **Sample Request (JavaScript/Axios)**: POST.
- **Sample Response**: Message.
- **Notes**: Increments views; for analytics.

#### GET /jobs/recommendations

- **HTTP Method**: GET
- **Route Path**: /api/jobs/recommendations
- **Authentication Required**: Yes (junior, canApplyToJobs)
- **Request Headers**: Authorization: Bearer <token>
- **Request Body Schema**: None
- **Request Query Parameters**: limit (default 10), minScore (default 50)
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "data": [
      {
        "id": "string",
        "matchScore": 85,
        "matchLevel": "high"
        // ... job
      }
    ]
  }
  ```
- **Error Responses**: 403, 500
- **Sample Request (curl)**:
  ```bash
  curl -X GET "http://localhost:5000/api/jobs/recommendations?limit=5&minScore=70" \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  ```
- **Sample Request (JavaScript/Axios)**: GET with params.
- **Sample Response**: Scored jobs.
- **Notes**: Calculates for active jobs, skips applied; uses match algorithm.

#### GET /jobs/:id/applications

- **HTTP Method**: GET
- **Route Path**: /api/jobs/:id/applications
- **Authentication Required**: Yes (owner)
- **Request Headers**: Authorization: Bearer <token>
- **Request Body Schema**: None
- **Request Query Parameters**: status (optional), sortBy (enum, optional), page, limit
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "data": [
      /* applications, populated applicant */
    ],
    "pagination": {
      /* ... */
    }
  }
  ```
- **Error Responses**: 403, 404, 500
- **Sample Request (curl)**:
  ```bash
  curl -X GET "http://localhost:5000/api/jobs/66f42da2f64df30000000004/applications?status=submitted&sortBy=match_score" \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  ```
- **Sample Request (JavaScript/Axios)**: GET with params.
- **Sample Response**: Paginated applications.
- **Notes**: Populates applicant info.

#### GET /jobs/:id/analytics

- **HTTP Method**: GET
- **Route Path**: /api/jobs/:id/analytics
- **Authentication Required**: Yes (owner)
- **Request Headers**: Authorization: Bearer <token>
- **Request Body Schema**: None
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "data": {
      "basic": { "views": 100, "applications": 20, "conversionRate": "20.00" },
      "applications": {
        "total": 20,
        "byStatus": { "submitted": 10 },
        "matchScoreDistribution": [
          /* buckets */
        ]
      },
      "budget": {
        "jobBudget": 5000,
        "averageProposal": 4500,
        "proposalRange": { "min": 3000, "max": 6000 }
      },
      "timeline": { "daysActive": 15, "daysRemaining": 10, "isExpired": false }
    }
  }
  ```
- **Error Responses**: 403, 404, 500
- **Sample Request (curl)**:
  ```bash
  curl -X GET http://localhost:5000/api/jobs/66f42da2f64df30000000004/analytics \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  ```
- **Sample Request (JavaScript/Axios)**: GET.
- **Sample Response**: Analytics object.
- **Notes**: Aggregates from applications.

### Application Endpoints

#### POST /applications/submit

- **HTTP Method**: POST
- **Route Path**: /api/applications/submit
- **Authentication Required**: Yes (junior, active, canApplyToJobs, canApplyToSpecificJob, checkApplicationLimit)
- **Request Headers**: Authorization: Bearer <token>, Content-Type: application/json
- **Request Body Schema**:
  ```json
  {
    "job_id": "string (ObjectId, required)",
    "proposal": {
      "cover_letter": "string (required, minlength: 100, maxlength: 1000, trim)",
      "approach": "string (required, minlength: 50, maxlength: 1500, trim)",
      "timeline_days": "number (required, min: 1)",
      "proposed_budget": "number (required, min: 0)"
    },
    "applicant_notes": "string (optional, maxlength: 1000)",
    "source": "enum (optional, values: ['search', 'recommendation', 'invitation'], default 'search')"
  }
  ```
  - **Validation Rules**: As in validateApplication; conditional required for non-draft.
- **Request Query Parameters**: None
- **Success Response** (Status Code: 201):
  ```json
  {
    "success": true,
    "data": {
      /* application, populated job/applicant */
    }
  }
  ```
- **Error Responses**:
  - 400 (Validation): `{ "success": false, "errors": [...] }`
  - 403 (Role/Eligibility): `{ "success": false, "message": "Only junior doctors can apply" }` or reasons array
  - 400 (Already Applied): `{ "success": false, "message": "You have already applied" }`
  - 400 (Job Not Active): `{ "success": false, "message": "Job is not accepting applications" }`
  - 500 (Server): `{ "success": false, "message": "Server error" }`
- **Sample Request (curl)**:
  ```bash
  curl -X POST http://localhost:5000/api/applications/submit \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
    -H "Content-Type: application/json" \
    -d '{
      "job_id": "66f42da2f64df30000000004",
      "proposal": {"cover_letter": "My cover letter...", "approach": "My approach...", "timeline_days": 30, "proposed_budget": 4000}
    }'
  ```
- **Sample Request (JavaScript/Axios)**: POST with body.
- **Sample Response**:
  ```json
  {
    "success": true,
    "data": {
      "id": "66f42da2f64df30000000005",
      "status": "submitted",
      "match_score": 85
      // ...
    }
  }
  ```
- **Notes**: Calculates match_score; updates job/applications counts. Side effect: Logs submission.

#### GET /applications/my-apps

- **HTTP Method**: GET
- **Route Path**: /api/applications/my-apps
- **Authentication Required**: Yes (junior, canApplyToJobs)
- **Request Headers**: Authorization: Bearer <token>
- **Request Body Schema**: None
- **Request Query Parameters**: status (enum, optional), sortBy (enum, optional), page, limit
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "data": [
      /* applications, populated job */
    ],
    "pagination": {
      /* ... */
    }
  }
  ```
- **Error Responses**: 403, 500
- **Sample Request (curl)**:
  ```bash
  curl -X GET "http://localhost:5000/api/applications/my-apps?status=submitted&sortBy=createdAt" \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  ```
- **Sample Request (JavaScript/Axios)**: GET with params.
- **Sample Response**: Paginated.
- **Notes**: Filters by applicant_id = user.id.

#### GET /applications/received

- **HTTP Method**: GET
- **Route Path**: /api/applications/received
- **Authentication Required**: Yes (senior, canPostJobs)
- **Request Headers**: Authorization: Bearer <token>
- **Request Body Schema**: None
- **Request Query Parameters**: jobId (optional), status, sortBy, page, limit
- **Success Response** (Status Code: 200): Similar to my-apps.
- **Error Responses**: 403, 500
- **Sample Request (curl)**: GET with params.
- **Sample Request (JavaScript/Axios)**: Similar.
- **Sample Response**: Paginated received.
- **Notes**: For employer's jobs.

#### GET /applications/:id

- **HTTP Method**: GET
- **Route Path**: /api/applications/:id
- **Authentication Required**: Yes (applicant or owner, canManageApplication)
- **Request Headers**: Authorization: Bearer <token>
- **Request Body Schema**: None
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "data": {
      /* application, view filtered by role */
    }
  }
  ```
- **Error Responses**: 403, 404, 500
- **Sample Request (curl)**:
  ```bash
  curl -X GET http://localhost:5000/api/applications/66f42da2f64df30000000005 \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  ```
- **Sample Request (JavaScript/Axios)**: GET with ID.
- **Sample Response**: Filtered application.
- **Notes**: Uses getEmployerView or getApplicantView.

#### PUT /applications/:id/status

- **HTTP Method**: PUT
- **Route Path**: /api/applications/:id/status
- **Authentication Required**: Yes (owner, validateApplicationStatusTransition)
- **Request Headers**: Authorization: Bearer <token>, Content-Type: application/json
- **Request Body Schema**:
  ```json
  {
    "status": "enum (required, valid transition)"
  }
  ```
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "message": "Status updated",
    "data": { "status": "under_review" }
  }
  ```
- **Error Responses**: 400 (Invalid Transition), 403, 404, 500
- **Sample Request (curl)**:
  ```bash
  curl -X PUT http://localhost:5000/api/applications/66f42da2f64df30000000005/status \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
    -H "Content-Type: application/json" \
    -d '{
      "status": "under_review"
    }'
  ```
- **Sample Request (JavaScript/Axios)**: PUT with body.
- **Sample Response**: Updated.
- **Notes**: Logs change in communication_log.

#### PUT /applications/:id/withdraw

- **HTTP Method**: PUT
- **Route Path**: /api/applications/:id/withdraw
- **Authentication Required**: Yes (applicant)
- **Request Headers**: Authorization: Bearer <token>
- **Request Body Schema**: None
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "message": "Application withdrawn"
  }
  ```
- **Error Responses**: 403, 404, 500
- **Sample Request (curl)**: PUT without body.
- **Sample Request (JavaScript/Axios)**: Similar.
- **Sample Response**: Message.
- **Notes**: Sets status "withdrawn"; logs.

#### POST /applications/:id/message

- **HTTP Method**: POST
- **Route Path**: /api/applications/:id/message
- **Authentication Required**: Yes (applicant/owner)
- **Request Headers**: Authorization: Bearer <token>, Content-Type: application/json
- **Request Body Schema**:
  ```json
  {
    "content": "string (required, trim, maxlength: 1000)"
  }
  ```
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "data": {
      "communication_log": [
        /* updated */
      ]
    }
  }
  ```
- **Error Responses**: 400, 403, 404, 500
- **Sample Request (curl)**:
  ```bash
  curl -X POST http://localhost:5000/api/applications/66f42da2f64df30000000005/message \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
    -H "Content-Type: application/json" \
    -d '{
      "content": "Hello, let's discuss..."
    }'
  ```
- **Sample Request (JavaScript/Axios)**: POST with body.
- **Sample Response**: Updated log.
- **Notes**: Adds to communication_log with from (employer/applicant).

#### POST /applications/:id/interview

- **HTTP Method**: POST
- **Route Path**: /api/applications/:id/interview
- **Authentication Required**: Yes (owner)
- **Request Headers**: Authorization: Bearer <token>, Content-Type: application/json
- **Request Body Schema**:
  ```json
  {
    "date": "date (required)",
    "type": "enum (required, values: ['video', 'phone', 'in-person'])",
    "details": "string (optional, maxlength: 500)"
  }
  ```
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "message": "Interview scheduled"
  }
  ```
- **Error Responses**: 400, 403, 404, 500
- **Sample Request (curl)**: POST with body.
- **Sample Request (JavaScript/Axios)**: Similar.
- **Sample Response**: Message.
- **Notes**: Sets status "interview_scheduled"; logs.

#### PUT /applications/:id/accept

- **HTTP Method**: PUT
- **Route Path**: /api/applications/:id/accept
- **Authentication Required**: Yes (owner)
- **Request Headers**: Authorization: Bearer <token>, Content-Type: application/json
- **Request Body Schema**:
  ```json
  {
    "contractDetails": "object (optional, e.g., milestones)"
  }
  ```
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "message": "Application accepted"
  }
  ```
- **Error Responses**: 400, 403, 404, 500
- **Sample Request (curl)**: PUT with optional body.
- **Sample Request (JavaScript/Axios)**: Similar.
- **Sample Response**: Message.
- **Notes**: Sets "accepted"; rejects others for job; logs.

#### PUT /applications/:id/reject

- **HTTP Method**: PUT
- **Route Path**: /api/applications/:id/reject
- **Authentication Required**: Yes (owner)
- **Request Headers**: Authorization: Bearer <token>, Content-Type: application/json
- **Request Body Schema**:
  ```json
  {
    "reason": "string (optional, maxlength: 500)"
  }
  ```
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "message": "Application rejected"
  }
  ```
- **Error Responses**: 400, 403, 404, 500
- **Sample Request (curl)**: PUT with body.
- **Sample Request (JavaScript/Axios)**: Similar.
- **Sample Response**: Message.
- **Notes**: Sets "rejected"; logs reason.

#### POST /applications/:id/rate

- **HTTP Method**: POST
- **Route Path**: /api/applications/:id/rate
- **Authentication Required**: Yes (applicant/owner, completed status)
- **Request Headers**: Authorization: Bearer <token>, Content-Type: application/json
- **Request Body Schema**:
  ```json
  {
    "rating": "number (required, min: 1, max: 5)",
    "review": "string (optional)"
  }
  ```
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "message": "Rating submitted successfully",
    "data": {
      "feedback": {
        /* updated */
      }
    }
  }
  ```
- **Error Responses**: 400 (Invalid Rating/Alrea dy Rated/Not Completed), 403, 404, 500
- **Sample Request (curl)**: POST with body.
- **Sample Request (JavaScript/Axios)**: Similar.
- **Sample Response**: Updated feedback.
- **Notes**: Updates user reviews/rating; one per role.

#### POST /applications/bulk/withdraw

- **HTTP Method**: POST
- **Route Path**: /api/applications/bulk/withdraw
- **Authentication Required**: Yes (junior, active, verified)
- **Request Headers**: Authorization: Bearer <token>, Content-Type: application/json
- **Request Body Schema**:
  ```json
  {
    "applicationIds": "array<string (ObjectId)> (required, min 1)"
  }
  ```
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "message": "Applications withdrawn successfully",
    "data": { "withdrawnCount": 3 }
  }
  ```
- **Error Responses**: 400 (Validation), 403, 500
- **Sample Request (curl)**: POST with body.
- **Sample Request (JavaScript/Axios)**: Similar.
- **Sample Response**: Count.
- **Notes**: Bulk operation; logs each.

### Admin Endpoints

#### GET /admin/dashboard

- **HTTP Method**: GET
- **Route Path**: /api/admin/dashboard
- **Authentication Required**: Yes (admin)
- **Request Headers**: Authorization: Bearer <token>
- **Request Body Schema**: None
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "data": {
      "totalUsers": 100,
      "pendingVerifications": 20 /* ... platform stats */
    }
  }
  ```
- **Error Responses**: 403, 500
- **Sample Request (curl)**: GET with token.
- **Sample Request (JavaScript/Axios)**: Similar.
- **Sample Response**: Stats.
- **Notes**: Aggregates users/jobs/applications.

#### GET /admin/verification/stats

- **HTTP Method**: GET
- **Route Path**: /api/admin/verification/stats
- **Authentication Required**: Yes (admin)
- **Request Headers**: Authorization: Bearer <token>
- **Request Body Schema**: None
- **Request Query Parameters**: timeframe (enum: 7d|30d|90d|all, optional)
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "data": { "totalPending": 15, "verifiedThisPeriod": 10 /* ... */ }
  }
  ```
- **Error Responses**: 400 (Invalid Timeframe), 403, 500
- **Sample Request (curl)**:
  ```bash
  curl -X GET "http://localhost:5000/api/admin/verification/stats?timeframe=30d" \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  ```
- **Sample Request (JavaScript/Axios)**: GET with params.
- **Sample Response**: Stats.
- **Notes**: Aggregates verifications.

#### GET /admin/verification/pending

- **HTTP Method**: GET
- **Route Path**: /api/admin/verification/pending
- **Authentication Required**: Yes (admin)
- **Request Headers**: Authorization: Bearer <token>
- **Request Body Schema**: None
- **Request Query Parameters**: type (enum: all|identity|medical_license|background_check, optional), page, limit
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "data": [
      /* profiles with select fields, populated documents */
    ],
    "pagination": {
      /* ... */
    }
  }
  ```
- **Error Responses**: 400 (Invalid Type), 403, 500
- **Sample Request (curl)**:
  ```bash
  curl -X GET "http://localhost:5000/api/admin/verification/pending?type=medical_license&page=1&limit=10" \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  ```
- **Sample Request (JavaScript/Axios)**: GET with params.
- **Sample Response**: Paginated profiles.
- **Notes**: Filters pending; sorts recent.

#### GET /admin/verification/profile/:userId

- **HTTP Method**: GET
- **Route Path**: /api/admin/verification/profile/:userId
- **Authentication Required**: Yes (admin)
- **Request Headers**: Authorization: Bearer <token>
- **Request Body Schema**: None
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "data": {
      "profile": {
        /* full profile minus password */
      },
      "verificationHistory": [],
      "riskFactors": [
        /* calculated */
      ],
      "recommendations": [
        /* generated */
      ]
    }
  }
  ```
- **Error Responses**: 400 (Invalid ID), 404, 500
- **Sample Request (curl)**:
  ```bash
  curl -X GET http://localhost:5000/api/admin/verification/profile/66f42da2f64df30000000001 \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  ```
- **Sample Request (JavaScript/Axios)**: GET with ID.
- **Sample Response**: Detailed data.
- **Notes**: Populates documents/reviews; calculates risks/recommendations.

#### PUT /admin/verification/identity/:userId

- **HTTP Method**: PUT
- **Route Path**: /api/admin/verification/identity/:userId
- **Authentication Required**: Yes (admin)
- **Request Headers**: Authorization: Bearer <token>, Content-Type: application/json
- **Request Body Schema**:
  ```json
  {
    "status": "enum (required, values: ['pending', 'verified', 'rejected'])",
    "notes": "string (optional, maxlength: 1000, trim)",
    "documentIds": "array<string (ObjectId)> (optional)"
  }
  ```
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "message": "Identity verification updated"
  }
  ```
- **Error Responses**: 400, 403, 404, 500
- **Sample Request (curl)**: PUT with body.
- **Sample Request (JavaScript/Axios)**: Similar.
- **Sample Response**: Message.
- **Notes**: Updates verificationStatus.identity; checks overall.

#### PUT /admin/verification/medical-license/:userId

- **HTTP Method**: PUT
- **Route Path**: /api/admin/verification/medical-license/:userId
- **Authentication Required**: Yes (admin)
- **Request Headers**: Authorization: Bearer <token>, Content-Type: application/json
- **Request Body Schema**: Similar to identity, plus "licenseVerified": boolean (optional)
- **Success Response** (Status Code: 200): Message.
- **Error Responses**: 400, 403, 404, 500
- **Sample Request (curl)**: PUT.
- **Sample Request (JavaScript/Axios)**: Similar.
- **Sample Response**: Message.
- **Notes**: Updates medical_license.

#### PUT /admin/verification/background-check/:userId

- **HTTP Method**: PUT
- **Route Path**: /api/admin/verification/background-check/:userId
- **Authentication Required**: Yes (admin)
- **Request Headers**: Authorization: Bearer <token>, Content-Type: application/json
- **Request Body Schema**: Similar, plus "backgroundCheckPassed": boolean (optional)
- **Success Response** (Status Code: 200): Message.
- **Error Responses**: 400, 403, 404, 500
- **Sample Request (curl)**: PUT.
- **Sample Request (JavaScript/Axios)**: Similar.
- **Sample Response**: Message.
- **Notes**: Updates background_check.

#### PUT /admin/verification/bulk

- **HTTP Method**: PUT
- **Route Path**: /api/admin/verification/bulk
- **Authentication Required**: Yes (admin)
- **Request Headers**: Authorization: Bearer <token>, Content-Type: application/json
- **Request Body Schema**:
  ```json
  {
    "userIds": "array<string (ObjectId)> (required, min 1)",
    "verificationType": "enum (required, values: ['identity', 'medical_license', 'background_check'])",
    "status": "enum (required, values: ['pending', 'verified', 'rejected'])",
    "notes": "string (optional, maxlength: 1000)"
  }
  ```
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "message": "Bulk verification completed",
    "data": { "updatedCount": 5 }
  }
  ```
- **Error Responses**: 400, 403, 500
- **Sample Request (curl)**: PUT with body.
- **Sample Request (JavaScript/Axios)**: Similar.
- **Sample Response**: Count.
- **Notes**: Updates multiple; checks IDs.

### Search & Discovery Endpoints

#### POST /matching/calculate/:jobId

- **HTTP Method**: POST
- **Route Path**: /api/matching/calculate/:jobId
- **Authentication Required**: Yes (junior)
- **Request Headers**: Authorization: Bearer <token>
- **Request Body Schema**: None
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "data": {
      "jobId": "string",
      "userId": "string",
      "matchScore": 85,
      "matchLevel": "high",
      "breakdown": { "specialty": { "score": 40, "details": "..." } /* ... */ }
    }
  }
  ```
- **Error Responses**: 403, 404, 500
- **Sample Request (curl)**:
  ```bash
  curl -X POST http://localhost:5000/api/matching/calculate/66f42da2f64df30000000004 \
    -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  ```
- **Sample Request (JavaScript/Axios)**: POST.
- **Sample Response**: Score details.
- **Notes**: Uses calculateMatchScore method.

#### GET /matching/recommendations

- **HTTP Method**: GET
- **Route Path**: /api/matching/recommendations
- **Authentication Required**: Yes (junior)
- **Request Headers**: Authorization: Bearer <token>
- **Request Body Schema**: None
- **Request Query Parameters**: limit (default 10), minScore (default 50)
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "data": [
      /* jobs with matchScore, matchLevel */
    ]
  }
  ```
- **Error Responses**: 403, 500
- **Sample Request (curl)**: GET with params.
- **Sample Request (JavaScript/Axios)**: Similar.
- **Sample Response**: Scored list.
- **Notes**: For active jobs not applied.

#### GET /matching/candidates/:jobId

- **HTTP Method**: GET
- **Route Path**: /api/matching/candidates/:jobId
- **Authentication Required**: Yes (senior, owner)
- **Request Headers**: Authorization: Bearer <token>
- **Request Body Schema**: None
- **Request Query Parameters**: limit, minScore
- **Success Response** (Status Code: 200): Candidates with scores.
- **Error Responses**: 403, 404, 500
- **Sample Request (curl)**: GET with ID, params.
- **Sample Request (JavaScript/Axios)**: Similar.
- **Sample Response**: Scored users.
- **Notes**: Recommends juniors.

#### GET /matching/analytics/:jobId

- **HTTP Method**: GET
- **Route Path**: /api/matching/analytics/:jobId
- **Authentication Required**: Yes (owner)
- **Request Headers**: Authorization: Bearer <token>
- **Request Body Schema**: None
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "data": {
      /* match stats, e.g., average score */
    }
  }
  ```
- **Error Responses**: 403, 404, 500
- **Sample Request (curl)**: GET with ID.
- **Sample Request (JavaScript/Axios)**: Similar.
- **Sample Response**: Analytics.
- **Notes**: From applications.

#### POST /matching/bulk

- **HTTP Method**: POST
- **Route Path**: /api/matching/bulk
- **Authentication Required**: Yes (junior, canPerformBulkOperations)
- **Request Headers**: Authorization: Bearer <token>, Content-Type: application/json
- **Request Body Schema**:
  ```json
  {
    "jobIds": "array<string (ObjectId)> (required, max 20)"
  }
  ```
- **Request Query Parameters**: None
- **Success Response** (Status Code: 200):
  ```json
  {
    "success": true,
    "data": [
      /* array of {jobId, matchScore, ...} */
    ]
  }
  ```
- **Error Responses**: 400, 403, 500
- **Sample Request (curl)**: POST with body.
- **Sample Request (JavaScript/Axios)**: Similar.
- **Sample Response**: Bulk scores.
- **Notes**: Premium feature.

### File Upload Endpoints

See /profile/photo and /profile/documents for details; no separate routes.

## Database Models & Schemas

### User Model (User.js)

- **Collection**: users
- **Fields**:
  - \_id: ObjectId
  - firstName: String (required, min: 2, max: 50, trim)
  - lastName: String (required, min: 2, max: 50, trim)
  - email: String (required, unique, lowercase)
  - phone: String (required, trim)
  - password: String (required, select: false)
  - role: String (required, enum: ['senior', 'junior', 'admin'])
  - accountStatus: String (default: 'pending', enum: ['pending', 'active', 'inactive', 'suspended'])
  - verificationStatus: {
    overall: String (default: 'pending', enum: ['pending', 'verified', 'rejected']),
    identity: String (default: 'pending', enum),
    medical_license: String (default: 'pending', enum),
    background_check: String (default: 'pending', enum)
    }
  - medicalLicenseNumber: String (required, min: 3, max: 50, trim)
  - licenseState: String (required, min: 2, max: 50, trim)
  - primarySpecialty: String (required, min: 2, max: 100, trim)
  - subspecialties: [String (trim)]
  - yearsOfExperience: Number (default: 0, min: 0, max: 50)
  - medicalSchool: { name: String (required, min: 2, max: 200, trim), graduationYear: Number (required, min: 1950, max: current) }
  - location: { city: String (max: 100, trim), state: String (max: 100, trim), country: String (max: 100, trim), timezone: String (max: 50, trim) }
  - languages: [{ language: String (required), proficiency: String (enum: ['basic', 'conversational', 'fluent', 'native']) }]
  - bio: String (max: 2000, trim)
  - profilePhoto: String (url)
  - documents: [{ type: String (enum: ['identification', 'medical_license', 'certification', 'other']), url: String, uploadedAt: Date (default now), verified: Boolean (default false) }]
  - experiences: [ExperienceSchema]
  - certifications: [CertificationSchema]
  - skills: [SkillSchema]
  - reviews: [ReviewSchema]
  - rating: { average: Number (default 0), count: Number (default 0) }
  - availability: { weeklyHours: Number (min: 0, max: 168), preferredTimes: [String], status: String (enum: ['available', 'busy', 'vacation'], default 'available') }
  - privacy: { showEmail: Boolean (default false), showPhone: Boolean (default false), searchVisibility: String (enum: ['public', 'connections', 'private'], default 'public') }
  - analytics: { profileViews: [{ viewedAt: Date, viewerId: ObjectId (ref User) }], views: { thisMonth: Number } /_ ... _/ }
  - profileCompletion: { percentage: Number (default 0), missingSections: [String] }
  - loginAttempts: Number (default 0)
  - lockUntil: Date
  - lastActive: Date
  - createdAt: Date
  - updatedAt: Date
- **Sub-Schemas**:
  - ExperienceSchema: { title: String (required), institution: String (required), location: String (required), startDate: Date (required), endDate: Date, current: Boolean (default false), description: String (max: 1000), type: String (enum, required), timestamps: true }
  - CertificationSchema: { name: String (required), issuingOrganization: String (required), issueDate: Date (required), expirationDate: Date, credentialId: String, credentialUrl: String, verified: Boolean (default false), timestamps: true }
  - SkillSchema: { name: String (required), category: String (enum, default 'clinical'), proficiencyLevel: String (enum, default 'intermediate'), yearsOfExperience: Number (min: 0, max: 50), verified: Boolean (default false) }
  - ReviewSchema: { reviewer: ObjectId (ref User, required), project: ObjectId (ref Project), rating: Number (min: 1, max: 5, required), title: String (max: 100, required), comment: String (required), categories: { communication: Number, expertise: Number, reliability: Number, professionalism: Number }, verified: Boolean (default false), timestamps: true }
- **Indexes**: { email: 1 (unique) }, { $text: { firstName: 1, lastName: 1, bio: 1, primarySpecialty: 1, subspecialties: 1 } }, { createdAt: -1 }
- **Virtuals**: fullName (first + last), displayName, isVerified (verificationStatus.overall === 'verified')
- **Methods**: matchPassword (bcrypt compare), getSignedJwtToken (jwt sign), canApplyToJob (checks eligibility), updateRating, updateJobStatistics, etc.
- **Statics**: findVerified (verified active users), searchDoctors (with filters/sort)
- **Relationships**: Self-ref in reviews/analytics.viewerId; ref to Project (future); one-to-many with Job (posted_by), Application (applicant_id)
- **Example Document**:
  ```json
  {
    "_id": "66f42da2f64df30000000001",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "junior",
    "accountStatus": "active",
    "verificationStatus": { "overall": "verified" },
    "yearsOfExperience": 5,
    "experiences": [
      /* ... */
    ],
    "createdAt": "2025-09-30T00:00:00.000Z"
  }
  ```

### Job Model (Job.js)

- **Collection**: jobs
- **Fields**:
  - \_id: ObjectId
  - title: String (required, min: 10, max: 100, trim)
  - description: String (required, min: 50, max: 2000, trim)
  - category: String (required, enum: ['consultation', 'research', 'documentation', 'review', 'telemedicine'])
  - specialty: String (required, trim)
  - subSpecialties: [String (trim)]
  - skills_required: [String (trim)]
  - experience_required: { minimum_years: Number (required, min: 0, max: 50), level: String (required, enum: ['resident', 'junior', 'mid-level', 'senior', 'attending']) }
  - budget: { type: String (required, enum: ['fixed', 'hourly', 'negotiable']), amount: Number (conditional, min: 0), currency: String (default 'USD', enum), negotiable: Boolean (default false) }
  - timeline: { estimated_hours: Number (min: 1), deadline: Date (required) }
  - requirements: { location_preference: String (enum: ['remote', 'onsite', 'hybrid']), other: String }
  - posted_by: ObjectId (ref User, required)
  - status: String (default 'draft', enum: ['draft', 'active', 'paused', 'closed', 'completed'])
  - applications_count: Number (default 0)
  - views_count: Number (default 0)
  - featured: Boolean (default false)
  - analytics: { average_proposal_amount: Number, proposal_range: { min: Number, max: Number } }
  - createdAt: Date
  - updatedAt: Date
- **Indexes**: { $text: { title: 1, description: 1, specialty: 1 } }, { posted_by: 1 }, { status: 1 }, { 'timeline.deadline': 1 }
- **Virtuals**: isExpired (deadline < now), timeRemaining (days to deadline)
- **Methods**: updateApplicationsCount ($inc), updateAnalytics (from applications)
- **Statics**: findActive (active and not expired), searchJobs (with filters/sort/text)
- **Relationships**: Ref to User (posted_by); one-to-many with Application (job_id)
- **Example Document**:
  ```json
  {
    "_id": "66f42da2f64df30000000004",
    "title": "Cardiology Consultation",
    "category": "consultation",
    "posted_by": "66f42da2f64df30000000001",
    "status": "active",
    "createdAt": "2025-09-30T00:00:00.000Z"
  }
  ```

### Application Model (Application.js)

- **Collection**: applications
- **Fields**:
  - \_id: ObjectId
  - job_id: ObjectId (ref Job, required)
  - applicant_id: ObjectId (ref User, required)
  - status: String (default 'draft', enum: ['draft', 'submitted', 'under_review', 'shortlisted', 'interview_scheduled', 'accepted', 'rejected', 'withdrawn', 'completed'])
  - proposal: { cover_letter: String (conditional, min: 100, max: 1000), approach: String (conditional, min: 50, max: 1500), timeline_days: Number (conditional, min: 1), proposed_budget: Number (conditional, min: 0) }
  - match_score: Number (default 0, min: 0, max: 100)
  - applicant_notes: String (max: 1000, trim)
  - employer_notes: String (max: 1000, trim)
  - communication_log: [CommunicationLogSchema]
  - milestones: [MilestoneSchema]
  - feedback: { employer_rating: Number (1-5), employer_review: String, applicant_rating: Number (1-5), applicant_review: String }
  - source: String (enum: ['search', 'recommendation', 'invitation'], default 'search')
  - prioritized: Boolean (default false)
  - createdAt: Date
  - updatedAt: Date
- **Sub-Schemas**:
  - CommunicationLogSchema: { date: Date (default now), type: String (enum: ['message', 'interview', 'status_change', 'system'], required), content: String (required, max: 1000, trim), from: String (enum: ['employer', 'applicant', 'system'], required) }
  - MilestoneSchema: { description: String (required, max: 500, trim), due_date: Date (required), amount: Number (required, min: 0), status: String (default 'pending', enum: ['pending', 'in_progress', 'completed', 'overdue']), completed_date: Date, notes: String (max: 1000, trim) }
- **Indexes**: { job_id: 1 }, { applicant_id: 1 }, { status: 1 }
- **Methods**: calculateMatchScore (algorithm), addCommunication, canModify, getEmployerView (delete applicant_notes/payment), getApplicantView (delete employer_notes)
- **Statics**: findByJob (with populate/sort/paginate), findByUser (similar)
- **Relationships**: Ref to Job, User; embedded logs/milestones
- **Example Document**:
  ```json
  {
    "_id": "66f42da2f64df30000000005",
    "job_id": "66f42da2f64df30000000004",
    "applicant_id": "66f42da2f64df30000000001",
    "status": "submitted",
    "match_score": 85,
    "communication_log": [
      /* ... */
    ],
    "createdAt": "2025-09-30T00:00:00.000Z"
  }
  ```

## Request/Response Patterns

- **Success**:
  ```json
  {
    "success": true,
    "message": "string (optional)",
    "data": { /* object or array */ },
    "pagination": { "page": int, "limit": int, "total": int, "pages": int } // if applicable
  }
  ```
- **Error**:
  ```json
  {
    "success": false,
    "message": "string",
    "errors": [{ "field": "string", "message": "string" }], // if validation
    "code": "string (optional)"
  }
  ```

## Pagination & Filtering

- **Parameters**:
  - page: int (default 1, min 1)
  - limit: int (default 20, min 1, max 100)
  - sortBy: enum (varies by endpoint, e.g., createdAt:-1 for desc)
- **Sorting**: e.g., sortBy=match_score (desc)
- **Filtering**: e.g., status=active (exact), specialty=regex/i
- **Search**: q or searchTerm for $text
- **Example**: ?page=2&limit=10&sortBy=deadline&specialty=cardiology

## File Upload Specifications

- **Allowed Types**: profilePhoto: image/_; documents: image/_, application/pdf
- **Max Size**: 10MB/file; maxCount: photo 1, documents 5
- **Method**: multipart/form-data, fields via multer
- **Cloudinary**: Upload stream; options for folder/optimization
- **Validation**: File filter rejects invalid; errors 400
- **Response**: URL in data; secure https

## Validation Rules

- express-validator for body/query/param
- e.g., body('title').trim().isLength({min:10,max:100}).matches(/^[a-zA-Z0-9\s\-\.\,\:\;]+$/)
- Errors: array of {value, msg, param, location}
- Custom: conditional (e.g., budget.amount if type != negotiable), ownership middleware
- Messages: Specific, e.g., "Title must be between 10 and 100 characters"

## Status Codes & Error Handling

- 200: OK (get/update)
- 201: Created (post)
- 400: Bad Request/validation
- 401: Unauthorized/token
- 403: Forbidden/role/status/limit
- 404: Not Found
- 422: Validation (some use)
- 429: Rate Limit
- 500: Internal (logged)

## Business Logic & Workflows

- **Job Application Workflow**: Draft → Submitted → Under Review → Shortlisted → Interview Scheduled → Accepted/Rejected → Completed/Withdrawn. Valid transitions enforced; logs changes.
- **User Verification Workflow**: Upload docs → Pending → Admin verify/reject (individual/bulk) → Verified (overall if all). Risk/recommendations calculated.
- **Payment Processing Flow**: Not implemented (milestones in application, but no integration).
- **Notification Triggers**: Status changes, messages (future; not in code).
- **Status Transition Rules**: Defined in middleware (validTransitions objects).
- **Match Algorithm**: Weighted: specialty 40%, experience 25%, skills 20%, etc.; string similarity for partial.

## Security Considerations

- **CORS**: Allowed origins/credentials true.
- **Rate Limiting**: IP-based tiers.
- **Input Sanitization**: trim/escape in validators; no raw queries.
- **No SQL Injection**: Mongoose safe queries.
- **XSS**: JSON responses; no HTML.
- **File Upload**: Type/size filter; Cloudinary scans.
- **Token**: Signed with secret; expire in cookie; no refresh.

## Testing Examples

- **Postman Collection**: Import this JSON: (example collection with chains: register, login, create job, apply, verify).
- **Curl Flow**:
  1. Register junior/senior.
  2. Login senior, create job.
  3. Login junior, submit application.
  4. Senior accept.
  5. Admin verify.
- **Error Scenario**: Invalid status transition: 400 with allowedTransitions.

## Changelog

- v1.0 (2025-09-30): Initial release with auth, profile, jobs, applications, admin, matching.

## Migration Guides

- To v2: Use /api/v2/; map deprecated fields.

## Best Practices for API Consumers

- Handle tokens securely (localStorage not recommended; use httpOnly if cookies).
- Paginate large lists.
- Validate local data before POST/PUT.
- Retry 429 with exponential backoff.
- Use async error handling.

## Common Integration Patterns

- Auth: Login → Store token in state → Intercept requests with headers.
- Job Flow: Browse/search → Details → Submit if junior.
- Profile: Get me → Update → Re-get to confirm.
- Admin: Dashboard → Pending → Verify.

## Troubleshooting Guide

- 401: Token expired/missing; re-login.
- 403: Check role/status/verification.
- 400: See errors for field issues.
- Rate Limit: Wait/reduce requests.
- 500: Report with logs.

## FAQ

- Q: How to get verified? A: Upload docs in /profile/documents; wait for admin.
- Q: Application limits? A: 5/day base, 15 verified.
- Q: Token expire? A: Configurable; re-login.
- Q: Payments? A: Milestones defined, but no gateway.
