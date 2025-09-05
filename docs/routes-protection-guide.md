# Routes Protection Guide

## Overview

This guide outlines the authentication and authorization middleware system for protecting different API routes based on user account status and roles.

## Authentication Middleware Types

### Core Middleware Functions

| Middleware               | Purpose                            | Access Level                  |
| ------------------------ | ---------------------------------- | ----------------------------- |
| `protect`                | Basic JWT authentication           | pending + active users        |
| `requireActive`          | Requires active account status     | active users only             |
| `requireVerified`        | Requires email verification        | verified users only           |
| `requireVerifiedAccount` | Requires professional verification | professionally verified users |
| `requireSubscription`    | Requires active subscription       | subscribers only              |
| `requireAdmin`           | Requires admin role                | admin users only              |
| `checkAccountStatus`     | Adds status info to request        | all authenticated users       |

### Account Status Flow

```
Registration → pending → active → (optional) verified professional
     ↓           ↓         ↓              ↓
   Basic     Basic +   Full Access   Professional
   Access   Documents              +   Features
```

## Route Protection Levels

### Level 1: Public Routes

**Access:** Anyone (no authentication required)

```javascript
// Public routes
router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/profile/:identifier", getPublicProfile);
router.get("/profile/search", searchProfiles);
```

### Level 2: Basic Protected Routes

**Access:** All authenticated users (pending + active)  
**Use Case:** Profile completion, document uploads, basic information

```javascript
// Basic authentication only
router.get("/auth/me", protect, getMe);
router.put("/profile/basic", protect, updateBasicProfile);
router.post("/profile/documents", protect, uploadDocuments);
router.post("/profile/photo", protect, uploadProfilePhoto);
```

### Level 3: Active Account Routes

**Access:** Active users only  
**Use Case:** Sensitive operations, full profile management

```javascript
// Requires active account status
router.put("/auth/updatepassword", protect, requireActive, updatePassword);
router.post("/profile/experience", protect, requireActive, addExperience);
router.put("/profile/skills", protect, requireActive, updateSkills);
router.put("/profile/privacy", protect, requireActive, updatePrivacy);
```

### Level 4: Professional Verified Routes

**Access:** Professionally verified users only  
**Use Case:** Job marketplace, client interactions, professional features

```javascript
// Requires professional verification
router.get("/jobs", protect, requireVerifiedAccount, getJobs);
router.get("/profile/analytics", protect, requireVerifiedAccount, getAnalytics);
router.post("/applications", protect, requireVerifiedAccount, applyToJob);
```

### Level 5: Subscription Routes

**Access:** Active subscribers only  
**Use Case:** Premium features

```javascript
// Requires active subscription
router.get("/premium-jobs", protect, requireSubscription, getPremiumJobs);
router.get(
  "/advanced-analytics",
  protect,
  requireSubscription,
  getAdvancedAnalytics
);
```

### Level 6: Admin Routes

**Access:** Admin users only  
**Use Case:** System administration

```javascript
// Requires admin role
router.get("/admin/users", protect, requireAdmin, getAllUsers);
router.put("/admin/verify/:userId", protect, requireAdmin, verifyUser);
```

## Account Status Reference

### Status Types

| Status      | Description                          | Route Access           |
| ----------- | ------------------------------------ | ---------------------- |
| `pending`   | New registration, needs verification | Basic routes only      |
| `active`    | Verified and active account          | All non-premium routes |
| `inactive`  | Temporarily disabled                 | No protected routes    |
| `suspended` | Banned/restricted by admin           | No protected routes    |

### Verification Status Types

| Verification             | Description                     | Required For          |
| ------------------------ | ------------------------------- | --------------------- |
| Email verified           | `isVerified: true`              | Some basic features   |
| Identity verified        | Professional identity confirmed | Job marketplace       |
| Medical license verified | Medical credentials confirmed   | Medical consultations |
| Background check passed  | Background screening complete   | High-trust roles      |

## Route Implementation Examples

### Authentication Routes (`routes/auth.js`)

```javascript
const { protect, requireActive } = require("../middleware/auth");

// Public routes
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);

// Basic protected routes (pending + active users)
router.get("/me", protect, getMe);
router.put("/updatedetails", protect, updateDetails);

// Sensitive routes (active users only)
router.put("/updatepassword", protect, requireActive, updatePassword);
```

### Profile Routes (`routes/profile.js`)

```javascript
const {
  protect,
  requireActive,
  requireVerifiedAccount,
} = require("../middleware/auth");

// Public routes
router.get("/search", searchProfiles);
router.get("/:identifier", getPublicProfile);

// Basic protected routes (pending + active)
router.get("/me", protect, getMyProfile);
router.put("/basic", protect, updateBasicProfile);
router.post("/documents", protect, uploadDocuments);

// Active account routes
router.post("/experience", protect, requireActive, addExperience);
router.put("/skills", protect, requireActive, updateSkills);

// Professional routes
router.get("/analytics", protect, requireVerifiedAccount, getAnalytics);
```

### Admin Routes (`routes/admin.js`)

```javascript
const { protect, requireAdmin } = require("../middleware/auth");

// All admin routes require authentication and admin role
router.use(protect);
router.use(requireAdmin);

router.get("/dashboard", getAdminDashboard);
router.get("/users", getAllUsers);
router.put("/verify/:userId", verifyUser);
```

## Combined Middleware Usage

### Multiple Requirements Example

```javascript
// Route requiring multiple conditions
router.post(
  "/expert-consultation",
  protect, // Must be authenticated
  requireActive, // Must have active account
  requireVerifiedAccount, // Must be professionally verified
  requireSubscription, // Must have paid subscription
  createConsultation
);
```

### Conditional Logic Example

```javascript
// Using checkAccountStatus for conditional responses
router.get(
  "/dashboard",
  protect,
  checkAccountStatus, // Adds req.accountStatusInfo
  (req, res) => {
    const { isPending, isActive } = req.accountStatusInfo;

    if (isPending) {
      return res.json({
        message: "Complete your profile to unlock more features",
        completionStatus: "25%",
      });
    }

    if (isActive) {
      return res.json({
        message: "Welcome to your full dashboard",
        allFeatures: true,
      });
    }
  }
);
```

## Error Responses

### Authentication Errors (401)

```json
{
  "success": false,
  "message": "Not authorized to access this route"
}
```

### Authorization Errors (403)

```json
{
  "success": false,
  "message": "Active account status required for this operation"
}
```

```json
{
  "success": false,
  "message": "Professional verification required for this feature"
}
```

## Testing Routes

### Test Flow for New User

```bash
# 1. Register new user
POST /api/auth/register
# Response: user with status "pending"

# 2. Login
POST /api/auth/login
# Response: JWT token

# 3. Access basic routes (should work)
GET /api/auth/me
PUT /api/profile/basic

# 4. Try active-only routes (should fail)
PUT /api/profile/skills
# Expected: 403 "Active account status required"

# 5. Try professional routes (should fail)
GET /api/profile/analytics
# Expected: 403 "Professional verification required"
```

### Testing Different Account Statuses

```javascript
// Test with different account statuses
const testUsers = {
  pending: "Bearer eyJ...", // status: "pending"
  active: "Bearer eyJ...",  // status: "active"
  admin: "Bearer eyJ..."    // role: "admin"
};

// Test basic route (should work for pending + active)
curl -H "Authorization: ${testUsers.pending}" /api/auth/me

// Test active route (should fail for pending)
curl -H "Authorization: ${testUsers.pending}" /api/profile/skills

// Test admin route (should fail for non-admin)
curl -H "Authorization: ${testUsers.active}" /api/admin/users
```

## Best Practices

### 1. Logical Route Grouping

- Group routes by protection level
- Apply middleware in order of restrictiveness
- Use `router.use()` for route-level middleware

### 2. Clear Error Messages

- Provide specific error messages for each protection level
- Guide users on what they need to do to gain access
- Don't reveal sensitive system information

### 3. Graceful Degradation

- Allow pending users to complete necessary onboarding
- Provide clear feedback about account status
- Show progress indicators for verification process

### 4. Security Considerations

- Always validate JWT tokens first
- Check account status before role-based permissions
- Log security-related events for monitoring
- Use HTTPS in production

## Migration Guide

### Updating Existing Routes

1. **Replace auth middleware import:**

   ```javascript
   // Old
   const { protect, authorize } = require("../middleware/auth");

   // New
   const {
     protect,
     requireActive,
     requireVerifiedAccount,
     requireAdmin,
   } = require("../middleware/auth");
   ```

2. **Update route protection:**

   ```javascript
   // Old - blocks pending users
   router.put("/profile", protect, updateProfile);

   // New - allows pending users for basic updates
   router.put("/profile/basic", protect, updateBasicProfile);
   router.put(
     "/profile/advanced",
     protect,
     requireActive,
     updateAdvancedProfile
   );
   ```

3. **Test thoroughly:**
   - Test with pending account status
   - Test with active account status
   - Test error responses
   - Verify admin routes still work

This guide ensures consistent and secure route protection throughout your application while providing a smooth user experience for the account verification process.
