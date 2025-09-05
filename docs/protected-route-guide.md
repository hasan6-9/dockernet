## 🧪 Testing

### Test User Profiles

```javascript
const testUserProfiles = {
  // New user - just registered
  newUser: {
    accountStatus: "pending",
    isVerified: false,
    verificationStatus: { overall: "pending" },
    subscriptionStatus: "inactive",
    role: "user",
  },

  // Active user - basic verification complete
  activeUser: {
    accountStatus: "active",
    isVerified: true,
    verificationStatus: { overall: "pending" },
    subscriptionStatus: "inactive",
    role: "user",
  },

  // Professional user - fully verified
  professionalUser: {
    accountStatus: "active",
    isVerified: true,
    verificationStatus: { overall: "verified" },
    subscriptionStatus: "inactive",
    role: "user",
  },

  // Premium user - paid subscriber
  premiumUser: {
    accountStatus: "active",
    isVerified: true,
    verificationStatus: { overall: "verified" },
    subscriptionStatus: "active",
    role: "user",
  },

  // Admin user - system administrator
  adminUser: {
    accountStatus: "active",
    isVerified: true,
    verificationStatus: { overall: "verified" },
    subscriptionStatus: "active",
    role: "admin",
  },

  // Suspended user - account restricted
  suspendedUser: {
    accountStatus: "suspended",
    isVerified: true,
    verificationStatus: { overall: "verified" },
    subscriptionStatus: "active",
    role: "user",
  },
};
```

### Test Scenarios

```jsx
// Test protection levels with different user types
function ProtectionLevelTests() {
  return (
    <div className="test-suite">
      <h2>🧪 Protection Level Testing</h2>

      {/* Level 1: Should work for all authenticated users */}
      <TestCase
        title="Basic Protection (Level 1)"
        expectedBehavior="Allow: pending, active, professional, premium, admin"
      >
        <ProtectedRoute>
          <div>✅ Basic protected content</div>
        </ProtectedRoute>
      </TestCase>

      {/* Level 2: Should block pending users */}
      <TestCase
        title="Active Account Required (Level 2)"
        expectedBehavior="Block: pending | Allow: active, professional, premium, admin"
      >
        <ProtectedRoute requireActive={true}>
          <div>✅ Active users only</div>
        </ProtectedRoute>
      </TestCase>

      {/* Level 3: Should block unverified emails */}
      <TestCase
        title="Email Verification Required (Level 3)"
        expectedBehavior="Block: unverified emails | Allow: verified users"
      >
        <ProtectedRoute requireVerified={true}>
          <div>✅ Email verified users only</div>
        </ProtectedRoute>
      </TestCase>

      {/* Level 4: Should block non-professionals */}
      <TestCase
        title="Professional Verification Required (Level 4)"
        expectedBehavior="Block: non-professionals | Allow: professional, premium, admin"
      >
        <ProtectedRoute requireVerifiedAccount={true}>
          <div>✅ Professional users only</div>
        </ProtectedRoute>
      </TestCase>

      {/* Level 5: Should block free users */}
      <TestCase
        title="Subscription Required (Level 5)"
        expectedBehavior="Block: free users | Allow: premium, admin"
      >
        <ProtectedRoute requireSubscription={true}>
          <div>✅ Premium subscribers only</div>
        </ProtectedRoute>
      </TestCase>

      {/* Level 6: Should block non-admin users */}
      <TestCase
        title="Admin Access Required (Level 6)"
        expectedBehavior="Block: all users | Allow: admin only"
      >
        <ProtectedRoute requireAdmin={true}>
          <div>✅ Admin users only</div>
        </ProtectedRoute>
      </TestCase>

      {/* Combined requirements */}
      <TestCase
        title="Multiple Requirements"
        expectedBehavior="Require: active + professional + subscription"
      >
        <ProtectedRoute
          requireActive={true}
          requireVerifiedAccount={true}
          requireSubscription={true}
        >
          <div>✅ Premium professional features</div>
        </ProtectedRoute>
      </TestCase>
    </div>
  );
}
```

### Automated Testing

```javascript
// Jest tests for ProtectedRoute component
describe("ProtectedRoute Protection Levels", () => {
  test("Level 1: Basic auth allows pending and active users", () => {
    // Test with pending user
    const { getByText } = render(
      <AuthProvider
        value={{ user: testUserProfiles.newUser, isAuthenticated: true }}
      >
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>
      </AuthProvider>
    );
    expect(getByText("Protected Content")).toBeInTheDocument();
  });

  test("Level 2: Active requirement blocks pending users", () => {
    const { getByText } = render(
      <AuthProvider
        value={{ user: testUserProfiles.newUser, isAuthenticated: true }}
      >
        <ProtectedRoute requireActive={true}>
          <div>Active Content</div>
        </ProtectedRoute>
      </AuthProvider>
    );
    expect(getByText("Account Verification Required")).toBeInTheDocument();
  });

  test("Level 4: Professional verification blocks basic users", () => {
    const { getByText } = render(
      <AuthProvider
        value={{ user: testUserProfiles.activeUser, isAuthenticated: true }}
      >
        <ProtectedRoute requireVerifiedAccount={true}>
          <div>Professional Content</div>
        </ProtectedRoute>
      </AuthProvider>
    );
    expect(getByText("Professional Verification Required")).toBeInTheDocument();
  });

  test("Level 6: Admin access blocks regular users", () => {
    const { getByText } = render(
      <AuthProvider
        value={{
          user: testUserProfiles.professionalUser,
          isAuthenticated: true,
        }}
      >
        <ProtectedRoute requireAdmin={true}>
          <div>Admin Panel</div>
        </ProtectedRoute>
      </AuthProvider>
    );
    expect(getByText("Administrator Access Required")).toBeInTheDocument();
  });

  test("Combined requirements work correctly", () => {
    const { getByText } = render(
      <AuthProvider
        value={{ user: testUserProfiles.premiumUser, isAuthenticated: true }}
      >
        <ProtectedRoute
          requireActive={true}
          requireVerifiedAccount={true}
          requireSubscription={true}
        >
          <div>Premium Professional Content</div>
        </ProtectedRoute>
      </AuthProvider>
    );
    expect(getByText("Premium Professional Content")).toBeInTheDocument();
  });
});
```

### Performance Testing

````javascript
// Performance benchmarks for protection checks
const performanceTests = {

  // Test route protection overhead
  measureProtectionOverhead: () => {
    const start = performance.now();

    // Render 100 protected routes
    for (let i = 0; i < 100; i++) {
      render(
        <ProtectedRoute requireActive={true}>
          <TestComponent />
        </ProtectedRoute>
      );
    }

    const end = performance.now();
    console.log(`Protection overhead: ${end - start}ms`);
  },

  // Test memory usage with multiple protection levels
  measureMemoryUsage: () => {
    const before = performance.memory?.usedJSHeapSize || 0;

    // Create multiple protected routes with different levels
    const routes = Array.from({ length: 50 }, (_, i) => (
      <ProtectedRoute
        key={i}
        requireActive={i % 2 === 0}
        requireVerified={i % 3 === 0}
        requireSubscription={i % 5 === 0}
      >
        <div>Content {i}</div>
      </ProtectedRoute>
    ));

    render(<div>{routes}</div>);

    const after = performance.memory?.usedJSHeapSize || 0;
    console.log(`Memory usage: ${after - before} bytes`);
  }
};
```# Enhanced ProtectedRoute Component

## 🛡️ Multi-Level Route Protection System

**Version:** 2.0
**Author:** Development Team
**Last Updated:** August 26, 2025

---

## 📋 Table of Contents

- [Overview](#overview)
- [Protection Levels](#protection-levels)
- [Route Implementation](#route-implementation)
- [Usage Examples](#usage-examples)
- [Error Handling](#error-handling)
- [Testing](#testing)
- [Migration Guide](#migration-guide)
- [Best Practices](#best-practices)

---

## 🎯 Overview

The enhanced `ProtectedRoute` component provides a comprehensive multi-level protection system that mirrors the backend middleware architecture. It offers granular access control with intelligent user feedback, progressive feature unlocking, and seamless user experience.

### Key Features

- ✅ **7-Level Protection System** - From basic auth to admin-only access
- ✅ **Smart Error Handling** - Context-aware error messages and redirects
- ✅ **Progressive Disclosure** - Guide users through verification steps
- ✅ **Account Status Management** - Handle pending, active, suspended states
- ✅ **Professional Verification** - Support for credential-based access
- ✅ **Subscription Gating** - Premium feature protection
- ✅ **Admin Controls** - Secure administrative access

## 🔒 Protection Levels

<table>
<thead>
<tr>
<th align="center">Level</th>
<th>Protection Type</th>
<th>Access Requirements</th>
<th>Use Cases</th>
</tr>
</thead>
<tbody>
<tr>
<td align="center"><strong>1</strong></td>
<td>Basic Authentication</td>
<td>Valid JWT token</td>
<td>Profile access, document upload</td>
</tr>
<tr>
<td align="center"><strong>2</strong></td>
<td>Active Account</td>
<td><code>accountStatus: "active"</code></td>
<td>Sensitive operations, settings</td>
</tr>
<tr>
<td align="center"><strong>3</strong></td>
<td>Email Verification</td>
<td><code>isVerified: true</code></td>
<td>Notification settings, communication</td>
</tr>
<tr>
<td align="center"><strong>4</strong></td>
<td>Professional Verification</td>
<td><code>verificationStatus.overall: "verified"</code></td>
<td>Job marketplace, professional features</td>
</tr>
<tr>
<td align="center"><strong>5</strong></td>
<td>Subscription</td>
<td><code>subscriptionStatus: "active"</code></td>
<td>Premium features, advanced tools</td>
</tr>
<tr>
<td align="center"><strong>6</strong></td>
<td>Administrator</td>
<td><code>role: "admin"</code></td>
<td>System administration, user management</td>
</tr>
</tbody>
</table>

### Implementation Examples

#### Level 1: Basic Authentication (Default)
```jsx
<ProtectedRoute>
  <MyProfileComponent />
</ProtectedRoute>
````

#### Level 2: Active Account Required

```jsx
<ProtectedRoute requireActive={true}>
  <AdvancedProfileSettings />
</ProtectedRoute>
```

#### Level 3: Email Verification Required

```jsx
<ProtectedRoute requireVerified={true}>
  <NotificationSettings />
</ProtectedRoute>
```

#### Level 4: Professional Verification Required

```jsx
<ProtectedRoute requireVerifiedAccount={true}>
  <JobMarketplace />
</ProtectedRoute>
```

#### Level 5: Subscription Required

```jsx
<ProtectedRoute requireSubscription={true}>
  <PremiumAnalytics />
</ProtectedRoute>
```

#### Level 6: Admin Only

```jsx
<ProtectedRoute requireAdmin={true}>
  <AdminDashboard />
</ProtectedRoute>
```

## ⚡ Route Implementation

### App.js Configuration

```jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Routes>
        {/* 🌐 Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile/:id" element={<PublicProfile />} />

        {/* 🔐 Level 1: Basic Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile/edit"
          element={
            <ProtectedRoute>
              <EditBasicProfile />
            </ProtectedRoute>
          }
        />

        {/* 🏃‍♂️ Level 2: Active Account Routes */}
        <Route
          path="/profile/skills"
          element={
            <ProtectedRoute requireActive={true}>
              <SkillsManager />
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings/password"
          element={
            <ProtectedRoute requireActive={true}>
              <ChangePassword />
            </ProtectedRoute>
          }
        />

        {/* ✉️ Level 3: Email Verified Routes */}
        <Route
          path="/notifications/settings"
          element={
            <ProtectedRoute requireVerified={true}>
              <NotificationSettings />
            </ProtectedRoute>
          }
        />

        {/* 👔 Level 4: Professional Verified Routes */}
        <Route
          path="/jobs"
          element={
            <ProtectedRoute requireVerifiedAccount={true}>
              <JobsMarketplace />
            </ProtectedRoute>
          }
        />

        <Route
          path="/analytics"
          element={
            <ProtectedRoute requireVerifiedAccount={true}>
              <ProfileAnalytics />
            </ProtectedRoute>
          }
        />

        {/* 💎 Level 5: Subscription Routes */}
        <Route
          path="/premium/jobs"
          element={
            <ProtectedRoute requireSubscription={true}>
              <PremiumJobs />
            </ProtectedRoute>
          }
        />

        {/* 👑 Level 6: Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute requireAdmin={true}>
              <AdminRoutes />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
```

### Combined Requirements

For features requiring multiple protection levels:

```jsx
// Expert consultation requiring multiple verifications
<Route path="/expert-consultation" element={
  <ProtectedRoute
    requireActive={true}
    requireVerifiedAccount={true}
    requireSubscription={true}
  >
    <ExpertConsultation />
  </ProtectedRoute>
} />

// Medical consultation with custom redirect
<Route path="/medical-consult" element={
  <ProtectedRoute
    requireActive={true}
    requireVerifiedAccount={true}
    requireSubscription={true}
    redirectTo="/medical-verification"
  >
    <MedicalConsultation />
  </ProtectedRoute>
} />
```

## 🚨 Error Handling

### Error Message Matrix

<table>
<thead>
<tr>
<th>User Status</th>
<th>Error Message</th>
<th>Visual Indicator</th>
<th>Primary Action</th>
</tr>
</thead>
<tbody>
<tr>
<td><code>suspended</code></td>
<td>"Account Suspended"</td>
<td>🚫 Red warning</td>
<td>Contact Support</td>
</tr>
<tr>
<td><code>inactive</code></td>
<td>"Account Deactivated"</td>
<td>🚫 Red warning</td>
<td>Contact Support</td>
</tr>
<tr>
<td><code>pending</code> + requireActive</td>
<td>"Account Verification Required"</td>
<td>⏳ Yellow pending</td>
<td>Complete Profile</td>
</tr>
<tr>
<td>Not email verified</td>
<td>"Email Verification Required"</td>
<td>✉️ Blue info</td>
<td>Verify Email</td>
</tr>
<tr>
<td>Not professionally verified</td>
<td>"Professional Verification Required"</td>
<td>👔 Purple pro</td>
<td>Start Verification</td>
</tr>
<tr>
<td>No active subscription</td>
<td>"Premium Subscription Required"</td>
<td>💎 Green upgrade</td>
<td>Upgrade Plan</td>
</tr>
<tr>
<td>Not admin</td>
<td>"Administrator Access Required"</td>
<td>👑 Red restricted</td>
<td>Contact Admin</td>
</tr>
</tbody>
</table>

### Error Screen Components

Each protection level shows a contextual error screen with:

- **Visual Icon**: Immediately communicates the issue type
- **Clear Headline**: Explains what's required
- **Descriptive Text**: Details the requirement and benefits
- **Primary Action**: Button or link to resolve the issue
- **Secondary Info**: Additional context or help options

### Error Response Examples

```jsx
// Account suspended error
<div className="error-screen suspended">
  <div className="error-icon">🚫</div>
  <h2>Account Suspended</h2>
  <p>Your account has been suspended. Please contact support.</p>
  <button onClick={contactSupport}>Contact Support</button>
</div>

// Professional verification required
<div className="error-screen professional-required">
  <div className="error-icon">👔</div>
  <h2>Professional Verification Required</h2>
  <p>This feature requires professional account verification.</p>
  <button onClick={startVerification}>Start Verification</button>
  <small>Includes identity confirmation and credential review</small>
</div>

// Premium subscription required
<div className="error-screen subscription-required">
  <div className="error-icon">💎</div>
  <h2>Premium Subscription Required</h2>
  <p>Unlock advanced features with a premium subscription.</p>
  <button onClick={upgradeToPremium}>Upgrade to Premium</button>
</div>
```

## 💡 Usage Examples

### Progressive Feature Unlocking

Create components that adapt to user verification status:

```jsx
function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="dashboard">
      <h1>Welcome, {user.name}</h1>

      {/* ✅ Always visible for authenticated users */}
      <BasicStatsWidget />

      {/* 🏃‍♂️ Active users only */}
      {user.accountStatus === "active" && (
        <section>
          <h2>Advanced Tools</h2>
          <AdvancedFeatures />
        </section>
      )}

      {/* 👔 Verified professionals only */}
      {user.verificationStatus?.overall === "verified" && (
        <section>
          <h2>Professional Dashboard</h2>
          <ProfessionalTools />
          <JobRecommendations />
        </section>
      )}

      {/* 💎 Subscribers only */}
      {user.subscriptionStatus === "active" && (
        <section>
          <h2>Premium Content</h2>
          <PremiumAnalytics />
          <AdvancedReports />
        </section>
      )}
    </div>
  );
}
```

### Profile Completion Guide

Help users understand what they need to unlock features:

```jsx
function ProfileCompletionGuide() {
  const { user } = useAuth();

  const verificationSteps = [
    {
      id: "basic",
      title: "Complete Basic Profile",
      description: "Add your name, photo, and basic information",
      completed: user.basicProfile?.completed,
      required: true,
      unlocks: "Full dashboard access",
    },
    {
      id: "email",
      title: "Verify Email Address",
      description: "Confirm your email to enable notifications",
      completed: user.isVerified,
      required: true,
      unlocks: "Communication features",
      action: () => resendVerificationEmail(),
    },
    {
      id: "professional",
      title: "Professional Verification",
      description: "Verify your credentials and identity",
      completed: user.verificationStatus?.overall === "verified",
      required: false,
      unlocks: "Job marketplace, client interactions",
      action: () => navigateTo("/verification/professional"),
    },
    {
      id: "subscription",
      title: "Premium Subscription",
      description: "Unlock advanced features and analytics",
      completed: user.subscriptionStatus === "active",
      required: false,
      unlocks: "Premium tools, advanced analytics",
      action: () => navigateTo("/subscription/upgrade"),
    },
  ];

  return (
    <div className="completion-guide">
      <h2>🎯 Complete Your Profile</h2>
      <p>Unlock more features by completing these steps:</p>

      {verificationSteps.map((step) => (
        <div
          key={step.id}
          className={`step ${step.completed ? "completed" : "pending"}`}
        >
          <div className="step-header">
            <div className="step-status">
              {step.completed ? "✅" : step.required ? "⏳" : "💎"}
            </div>
            <h3>{step.title}</h3>
            {step.required && !step.completed && (
              <span className="required-badge">Required</span>
            )}
          </div>

          <p className="step-description">{step.description}</p>
          <p className="step-benefit">🔓 Unlocks: {step.unlocks}</p>

          {!step.completed && step.action && (
            <button onClick={step.action} className="btn-primary">
              {step.required ? "Complete Now" : "Upgrade"}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
```

### Conditional Component Rendering

```jsx
// Smart navigation based on user permissions
function NavigationMenu() {
  const { user } = useAuth();

  const menuItems = [
    {
      path: "/dashboard",
      label: "Dashboard",
      icon: "🏠",
      level: "basic",
    },
    {
      path: "/profile/skills",
      label: "Skills",
      icon: "🛠️",
      level: "active",
      requireActive: true,
    },
    {
      path: "/jobs",
      label: "Jobs",
      icon: "💼",
      level: "professional",
      requireVerifiedAccount: true,
    },
    {
      path: "/premium-analytics",
      label: "Analytics Pro",
      icon: "📊",
      level: "premium",
      requireSubscription: true,
      badge: "PRO",
    },
    {
      path: "/admin",
      label: "Administration",
      icon: "👑",
      level: "admin",
      requireAdmin: true,
    },
  ];

  const canAccessMenuItem = (item) => {
    if (item.requireAdmin) return user.role === "admin";
    if (item.requireSubscription) return user.subscriptionStatus === "active";
    if (item.requireVerifiedAccount)
      return user.verificationStatus?.overall === "verified";
    if (item.requireActive) return user.accountStatus === "active";
    return true; // Basic access
  };

  return (
    <nav className="sidebar">
      {menuItems.map((item) => {
        const canAccess = canAccessMenuItem(item);

        return (
          <div key={item.path} className="menu-item-wrapper">
            {canAccess ? (
              <Link to={item.path} className="menu-item">
                <span className="icon">{item.icon}</span>
                <span className="label">{item.label}</span>
                {item.badge && <span className="badge">{item.badge}</span>}
              </Link>
            ) : (
              <div className="menu-item disabled" title="Upgrade required">
                <span className="icon">{item.icon}</span>
                <span className="label">{item.label}</span>
                <span className="lock">🔒</span>
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
```

## Testing Different Protection Levels

### Test User States

```javascript
// Mock different user states for testing
const testUsers = {
  pending: {
    accountStatus: "pending",
    isVerified: false,
    verificationStatus: { overall: "pending" },
    subscriptionStatus: "inactive",
    role: "user",
  },
  active: {
    accountStatus: "active",
    isVerified: true,
    verificationStatus: { overall: "verified" },
    subscriptionStatus: "inactive",
    role: "user",
  },
  premium: {
    accountStatus: "active",
    isVerified: true,
    verificationStatus: { overall: "verified" },
    subscriptionStatus: "active",
    role: "user",
  },
  admin: {
    accountStatus: "active",
    isVerified: true,
    verificationStatus: { overall: "verified" },
    subscriptionStatus: "active",
    role: "admin",
  },
};
```

### Test Scenarios

```jsx
// Test component for different protection levels
function ProtectionTest() {
  return (
    <div>
      {/* Should work for pending users */}
      <ProtectedRoute>
        <div>Basic protected content</div>
      </ProtectedRoute>

      {/* Should block pending users */}
      <ProtectedRoute requireActive={true}>
        <div>Active users only</div>
      </ProtectedRoute>

      {/* Should block unverified users */}
      <ProtectedRoute requireVerified={true}>
        <div>Verified email required</div>
      </ProtectedRoute>

      {/* Should block non-professional users */}
      <ProtectedRoute requireVerifiedAccount={true}>
        <div>Professional verification required</div>
      </ProtectedRoute>

      {/* Should block free users */}
      <ProtectedRoute requireSubscription={true}>
        <div>Premium subscription required</div>
      </ProtectedRoute>

      {/* Should block non-admin users */}
      <ProtectedRoute requireAdmin={true}>
        <div>Admin only</div>
      </ProtectedRoute>
    </div>
  );
}
```

## Migration from Old ProtectedRoute

### Before (Old System)

```jsx
<ProtectedRoute roles={['admin']}>
  <AdminPanel />
</ProtectedRoute>

<ProtectedRoute requireVerified={true}>
  <VerifiedFeature />
</ProtectedRoute>
```

### After (New System)

```jsx
<ProtectedRoute requireAdmin={true}>
  <AdminPanel />
</ProtectedRoute>

<ProtectedRoute requireVerified={true}>
  <VerifiedFeature />
</ProtectedRoute>
```

## ⭐ Best Practices

### 1. Choose the Right Protection Level

```jsx
// ❌ Avoid: Over-protecting basic features
<ProtectedRoute requireSubscription={true}>
  <BasicProfile />
</ProtectedRoute>

// ✅ Better: Use appropriate level
<ProtectedRoute>
  <BasicProfile />
</ProtectedRoute>

// ❌ Avoid: Under-protecting sensitive features
<ProtectedRoute>
  <PaymentSettings />
</ProtectedRoute>

// ✅ Better: Require active account for sensitive operations
<ProtectedRoute requireActive={true}>
  <PaymentSettings />
</ProtectedRoute>
```

### 2. Provide Clear User Guidance

```jsx
// ✅ Good: Progressive disclosure with clear benefits
function FeatureCard({ title, description, level, unlocked }) {
  if (unlocked) {
    return (
      <div className="feature-card unlocked">
        <h3>{title}</h3>
        <p>{description}</p>
        <Link to="/feature">Access Now</Link>
      </div>
    );
  }

  return (
    <div className="feature-card locked">
      <h3>{title} 🔒</h3>
      <p>{description}</p>
      <div className="unlock-info">
        <span>Requires: {level}</span>
        <button onClick={startUpgrade}>Unlock</button>
      </div>
    </div>
  );
}
```

### 3. Handle Edge Cases Gracefully

```jsx
// ✅ Good: Account status monitoring
function useAccountStatusMonitoring() {
  const { user } = useAuth();
  const [statusChanged, setStatusChanged] = useState(false);

  useEffect(() => {
    // Monitor for account status changes during session
    const checkStatusChange = () => {
      const currentStatus = user?.accountStatus;
      const lastKnownStatus = localStorage.getItem("lastAccountStatus");

      if (lastKnownStatus && lastKnownStatus !== currentStatus) {
        setStatusChanged(true);
        // Show notification about status change
        showNotification(`Account status changed to: ${currentStatus}`);
      }

      localStorage.setItem("lastAccountStatus", currentStatus);
    };

    checkStatusChange();
  }, [user?.accountStatus]);

  return statusChanged;
}
```

### 4. Optimize Performance

```jsx
// ✅ Good: Memoize protection checks
const MemoizedProtectedRoute = React.memo(
  ProtectedRoute,
  (prevProps, nextProps) => {
    // Only re-render if protection requirements change
    return (
      prevProps.requireActive === nextProps.requireActive &&
      prevProps.requireVerified === nextProps.requireVerified &&
      prevProps.requireVerifiedAccount === nextProps.requireVerifiedAccount &&
      prevProps.requireSubscription === nextProps.requireSubscription &&
      prevProps.requireAdmin === nextProps.requireAdmin
    );
  }
);

// ✅ Good: Cache user permission checks
function useUserPermissions() {
  const { user } = useAuth();

  return useMemo(
    () => ({
      canAccessBasic: Boolean(user),
      canAccessActive: user?.accountStatus === "active",
      canAccessVerified: user?.isVerified,
      canAccessProfessional: user?.verificationStatus?.overall === "verified",
      canAccessPremium: user?.subscriptionStatus === "active",
      canAccessAdmin: user?.role === "admin",
    }),
    [
      user?.accountStatus,
      user?.isVerified,
      user?.verificationStatus?.overall,
      user?.subscriptionStatus,
      user?.role,
    ]
  );
}
```

### 5. Accessibility Considerations

```jsx
// ✅ Good: Accessible error messages
function AccessDeniedScreen({ level, message, action }) {
  const headingRef = useRef(null);

  useEffect(() => {
    // Focus heading for screen readers
    if (headingRef.current) {
      headingRef.current.focus();
    }
  }, []);

  return (
    <div
      className="access-denied"
      role="main"
      aria-labelledby="access-denied-heading"
    >
      <h1
        id="access-denied-heading"
        ref={headingRef}
        tabIndex={-1}
        className="sr-focus"
      >
        {message}
      </h1>

      <p aria-describedby="access-instructions">
        You need {level} access to view this content.
      </p>

      <div id="access-instructions">
        {action && (
          <button
            onClick={action}
            className="btn-primary"
            aria-describedby="action-description"
          >
            Upgrade Access
          </button>
        )}
      </div>
    </div>
  );
}
```

### 6. Security Best Practices

```jsx
// ✅ Good: Never expose sensitive data in error messages
function SecureProtectedRoute({ children, ...protectionProps }) {
  const protectionResult = useProtectionCheck(protectionProps);

  if (protectionResult.denied) {
    // Log security event (server-side)
    logSecurityEvent({
      type: "access_denied",
      level: protectionResult.level,
      userId: protectionResult.userId,
      timestamp: Date.now(),
    });

    // Return generic error (don't expose system details)
    return <AccessDeniedScreen level={protectionResult.level} />;
  }

  return children;
}

// ✅ Good: Validate permissions on both client and server
function useServerValidatedPermissions() {
  const { user } = useAuth();
  const [serverValidated, setServerValidated] = useState(false);

  useEffect(() => {
    // Always validate critical permissions server-side
    validatePermissionsOnServer(user?.id)
      .then(setServerValidated)
      .catch(() => setServerValidated(false));
  }, [user?.id]);

  return serverValidated;
}
```

### 7. Error Recovery Strategies

```jsx
// ✅ Good: Provide multiple recovery paths
function ErrorRecoveryOptions({ errorType, user }) {
  const recoveryOptions = {
    "account-pending": [
      { action: completeProfile, label: "Complete Profile" },
      { action: contactSupport, label: "Need Help?" },
    ],
    "email-unverified": [
      { action: resendEmail, label: "Resend Email" },
      { action: changeEmail, label: "Change Email" },
      { action: contactSupport, label: "Contact Support" },
    ],
    "subscription-required": [
      { action: viewPricing, label: "View Pricing" },
      { action: startTrial, label: "Start Free Trial" },
      { action: contactSales, label: "Contact Sales" },
    ],
  };

  return (
    <div className="recovery-options">
      <h3>What would you like to do?</h3>
      {recoveryOptions[errorType]?.map((option, index) => (
        <button key={index} onClick={option.action} className="recovery-option">
          {option.label}
        </button>
      ))}
    </div>
  );
}
```

---

## 📞 Support & Resources

### Documentation Links

- [Authentication Context](./auth-context.md)
- [Backend Middleware Guide](./routes-protection-guide.md)
- [User Verification Process](./verification-guide.md)

### Common Issues

- **Route not protecting**: Check user object structure in AuthContext
- **Infinite redirects**: Verify redirect paths don't create loops
- **Performance issues**: Use React.memo for frequently rendered routes

### Getting Help

- 📧 **Email**: dev-support@yourapp.com
- 💬 **Slack**: #frontend-architecture
- 📝 **Issues**: GitHub Issues in main repository

---

_This documentation is maintained by the Frontend Architecture Team. Last updated: August 26, 2025_
