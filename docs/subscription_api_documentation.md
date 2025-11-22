# Doconnect Subscription API Documentation

Complete guide to the Stripe-powered subscription management system for Doconnect.

---

## Table of Contents

1. [Overview](#overview)
2. [Authentication](#authentication)
3. [Subscription Plans](#subscription-plans)
4. [API Endpoints](#api-endpoints)
5. [Webhook Events](#webhook-events)
6. [Error Handling](#error-handling)
7. [Subscription Lifecycle](#subscription-lifecycle)
8. [Frontend Integration](#frontend-integration)
9. [Rate Limiting](#rate-limiting)
10. [FAQ](#faq)

---

## Overview

The Doconnect Subscription API provides a complete billing and subscription management system powered by Stripe. It handles subscription creation, management, upgrades/downgrades, payment processing, and feature access control.

### Base URL

- **Development**: `http://localhost:5000/api/subscriptions`
- **Production**: `https://api.doconnect.com/api/subscriptions`

### Key Features

- Four-tier subscription model (Free, Basic, Professional, Enterprise)
- Feature-based access control
- Usage tracking and limits
- Real-time webhook synchronization
- Trial periods for new subscribers
- Payment failure recovery with automatic retries
- Admin management tools

---

## Authentication

All protected endpoints require JWT token in the Authorization header:

```http
Authorization: Bearer <jwt_token>
```

Tokens are obtained through authentication endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`

### Token Requirements

- Must be valid JWT format
- Must not be expired
- User account must have status: `active` or `pending`
- For admin endpoints, user must have role: `admin`

---

## Subscription Plans

### Free Tier

**Price:** $0/month | **Billing:** N/A | **Trial:** N/A

**Features:**

- Unlimited Applications: ❌
- Advanced Search: ❌
- Featured Job Postings: ❌
- Direct Messaging: ❌
- Advanced Analytics: ❌
- Priority Support: ❌
- Custom Branding: ❌
- API Access: ❌
- Bulk Operations: ❌
- Scheduled Posting: ❌

**Usage Limits:**

- Job Applications: 5/month
- Profile Views: 50/month
- Job Postings: 3/month
- Message Threads: 10/month
- Bulk Operations: 0/month

---

### Basic Plan

**Price:** $19/month | **Billing:** Monthly auto-renew | **Trial:** 7 days (first time)

**Features:**

- Unlimited Applications: ✅
- Advanced Search: ✅
- Featured Job Postings: ❌
- Direct Messaging: ✅
- Advanced Analytics: ❌
- Priority Support: ❌
- Custom Branding: ❌
- API Access: ❌
- Bulk Operations: ❌
- Scheduled Posting: ❌

**Usage Limits:**

- Job Applications: Unlimited
- Profile Views: 500/month
- Job Postings: 20/month
- Message Threads: 50/month
- Bulk Operations: 5/month

---

### Professional Plan

**Price:** $39/month | **Billing:** Monthly auto-renew | **Trial:** 7 days (first time)

**Features:**

- Unlimited Applications: ✅
- Advanced Search: ✅
- Featured Job Postings: ✅
- Direct Messaging: ✅
- Advanced Analytics: ✅
- Priority Support: ✅
- Custom Branding: ❌
- API Access: ❌
- Bulk Operations: ✅
- Scheduled Posting: ✅

**Usage Limits:**

- Job Applications: Unlimited
- Profile Views: Unlimited
- Job Postings: 50/month
- Message Threads: 200/month
- Bulk Operations: 50/month

---

### Enterprise Plan

**Price:** $99/month | **Billing:** Monthly auto-renew | **Trial:** Custom (contact sales)

**Features:**

- All features: ✅
- Dedicated account manager
- Custom integrations
- SLA support

**Usage Limits:**

- All features: Unlimited

---

## API Endpoints

### Public Endpoints

#### GET /plans

Get all available subscription plans.

**Request:**

```bash
curl http://localhost:5000/api/subscriptions/plans
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "free",
      "name": "Free Tier",
      "price": 0,
      "currency": "usd",
      "interval": "month",
      "description": "Basic access to Doconnect platform",
      "features": {
        /* ... */
      },
      "usage": {
        /* ... */
      }
    }
  ]
}
```

**cURL Example:**

```bash
curl -X GET http://localhost:5000/api/subscriptions/plans
```

**JavaScript/Axios:**

```javascript
const response = await axios.get("/api/subscriptions/plans");
console.log(response.data.data);
```

---

#### POST /webhook

Handle Stripe webhook events (signature verified).

**Required Headers:**

```http
Content-Type: application/json
Stripe-Signature: <signature>
```

**Webhook Events Handled:**

- `customer.subscription.created` - New subscription created
- `customer.subscription.updated` - Subscription updated
- `customer.subscription.deleted` - Subscription canceled
- `invoice.payment_succeeded` - Payment successful
- `invoice.payment_failed` - Payment failed
- `customer.updated` - Customer info updated
- `charge.refunded` - Refund processed

**Notes:**

- Webhook must be configured in Stripe Dashboard
- Signature verification is MANDATORY for security
- Events are processed asynchronously
- Failed events will be retried by Stripe

---

### Protected Endpoints (Require Authentication)

#### GET /current

Get current user's subscription details.

**Request:**

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/subscriptions/current
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "id": "subscription_id",
    "userId": "user_id",
    "planId": "professional",
    "planName": "Professional Plan",
    "planPrice": 3900,
    "status": "active",
    "isActive": true,
    "currentPeriodStart": "2024-01-01T00:00:00Z",
    "currentPeriodEnd": "2024-02-01T00:00:00Z",
    "daysUntilRenewal": 15,
    "paymentMethod": {
      "brand": "visa",
      "last4": "4242",
      "expMonth": 12,
      "expYear": 2025
    },
    "features": {
      /* ... */
    },
    "usage": {
      /* ... */
    }
  }
}
```

**Error (404):**

```json
{
  "success": false,
  "message": "No subscription found"
}
```

**cURL:**

```bash
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:5000/api/subscriptions/current
```

**JavaScript:**

```javascript
const response = await axios.get("/api/subscriptions/current", {
  headers: { Authorization: `Bearer ${token}` },
});
console.log(response.data.data);
```

---

#### POST /create-checkout-session

Create a Stripe checkout session for purchasing a subscription.

**Request:**

```bash
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"planId": "professional", "billingCycle": "monthly"}' \
  http://localhost:5000/api/subscriptions/create-checkout-session
```

**Request Body:**

```json
{
  "planId": "basic|professional|enterprise",
  "billingCycle": "monthly|annually"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "sessionId": "cs_test_ABC123...",
    "url": "https://checkout.stripe.com/pay/cs_test_ABC123...",
    "planId": "professional",
    "planName": "Professional Plan",
    "amount": 3900,
    "billingCycle": "monthly"
  }
}
```

**Error Responses:**

400 - Invalid Plan:

```json
{
  "success": false,
  "message": "Invalid plan selected",
  "validPlans": ["free", "basic", "professional", "enterprise"]
}
```

400 - Already Has Plan:

```json
{
  "success": false,
  "message": "You already have this plan active"
}
```

**cURL:**

```bash
curl -X POST -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"planId":"professional"}' \
  http://localhost:5000/api/subscriptions/create-checkout-session
```

**JavaScript:**

```javascript
const response = await axios.post(
  "/api/subscriptions/create-checkout-session",
  { planId: "professional" },
  { headers: { Authorization: `Bearer ${token}` } }
);
window.location.href = response.data.data.url;
```

**Notes:**

- Free plan cannot be purchased
- 7-day trial included for first purchase
- Returns Stripe checkout URL for redirect
- Supports upgrade/downgrade from existing subscription

---

#### POST /cancel

Cancel the current subscription.

**Request:**

```bash
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"reason":"Too expensive","feedback":"Would use if cheaper"}' \
  http://localhost:5000/api/subscriptions/cancel
```

**Request Body:**

```json
{
  "reason": "string (optional)",
  "feedback": "string (optional, max 1000 chars)"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Subscription cancelled successfully",
  "data": {
    "planId": "professional",
    "status": "canceled",
    "canceledAt": "2024-01-15T10:30:00Z"
  }
}
```

**Error (404):**

```json
{
  "success": false,
  "message": "No active subscription found"
}
```

**Notes:**

- Cancellation is effective immediately
- User reverts to Free tier
- No refunds for partial months
- Can reactivate later

---

#### POST /reactivate

Reactivate a canceled subscription.

**Request:**

```bash
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"planId":"professional"}' \
  http://localhost:5000/api/subscriptions/reactivate
```

**Request Body:**

```json
{
  "planId": "basic|professional|enterprise (optional)"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Reactivation checkout session created",
  "data": {
    "sessionId": "cs_test_GHI789...",
    "url": "https://checkout.stripe.com/pay/cs_test_GHI789..."
  }
}
```

**Error (404):**

```json
{
  "success": false,
  "message": "No subscription found"
}
```

---

#### POST /update-payment-method

Update the payment method (card) for subscription.

**Request:**

```bash
curl -X POST -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/subscriptions/update-payment-method
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "clientSecret": "seti_1234567890...",
    "publishableKey": "pk_test_ABC123..."
  }
}
```

**Error (404):**

```json
{
  "success": false,
  "message": "No active subscription found"
}
```

**Notes:**

- Returns setup intent for Stripe Elements
- Card is not charged, only stored
- Can be done anytime during active subscription

---

#### GET /invoices

Get payment history and invoices.

**Request:**

```bash
curl -H "Authorization: Bearer <token>" \
  "http://localhost:5000/api/subscriptions/invoices?page=1&limit=10"
```

**Query Parameters:**

```
page: integer (default: 1)
limit: integer (1-100, default: 10)
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": [
    {
      "id": "in_ABC123",
      "amount": 3900,
      "currency": "usd",
      "status": "paid",
      "date": "2024-01-01T00:00:00Z",
      "periodStart": "2024-01-01T00:00:00Z",
      "periodEnd": "2024-02-01T00:00:00Z",
      "paidAt": "2024-01-01T08:30:00Z",
      "invoiceUrl": "https://invoice.stripe.com/...",
      "receiptUrl": "receipt-001",
      "description": "Professional Plan subscription"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 2,
    "pages": 1
  }
}
```

---

#### POST /upgrade

Upgrade to a higher tier plan.

**Request:**

```bash
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"targetPlanId":"enterprise"}' \
  http://localhost:5000/api/subscriptions/upgrade
```

**Request Body:**

```json
{
  "targetPlanId": "basic|professional|enterprise"
}
```

**Response (200 OK) - For Existing Paid:**

```json
{
  "success": true,
  "message": "Plan upgraded successfully",
  "data": {
    "fromPlan": "professional",
    "toPlan": "enterprise",
    "newPrice": 9900,
    "billingCycle": "monthly"
  }
}
```

**Response (200 OK) - For Free:**

```json
{
  "success": true,
  "data": {
    "sessionId": "cs_test_GHI789...",
    "url": "https://checkout.stripe.com/pay/..."
  }
}
```

**Error (400):**

```json
{
  "success": false,
  "message": "This is not an upgrade or plan is not available",
  "currentPlan": "enterprise",
  "targetPlan": "professional"
}
```

**Notes:**

- Can only upgrade to higher tier
- Prorated charges applied mid-cycle
- Immediate effect for paid subscriptions
- Redirects to checkout for free→paid upgrades

---

#### POST /downgrade

Downgrade to a lower tier plan.

**Request:**

```bash
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"targetPlanId":"basic"}' \
  http://localhost:5000/api/subscriptions/downgrade
```

**Request Body:**

```json
{
  "targetPlanId": "free|basic|professional"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Plan downgrade scheduled",
  "data": {
    "fromPlan": "professional",
    "toPlan": "basic",
    "effectiveDate": "2024-02-01T00:00:00Z",
    "message": "New plan will take effect at your next billing cycle"
  }
}
```

**Notes:**

- Only available for paid subscriptions
- Takes effect at next billing cycle
- No refund for partial month
- Usage limits reduced at renewal

---

#### POST /track-usage

Track usage of limited resources.

**Request:**

```bash
curl -X POST -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"usageType":"jobApplications","amount":1}' \
  http://localhost:5000/api/subscriptions/track-usage
```

**Request Body:**

```json
{
  "usageType": "jobApplications|profileViews|jobPostings|messageThreads|bulkOperations",
  "amount": 1
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Usage tracked",
  "data": {
    "usageType": "jobApplications",
    "used": 5,
    "limit": 20,
    "remaining": 15
  }
}
```

**Error (429) - Limit Reached:**

```json
{
  "success": false,
  "message": "jobApplications limit reached",
  "limit": 5,
  "used": 5,
  "upgrade": "Upgrade your plan for higher limits"
}
```

**Notes:**

- Typically called internally by backend
- Prevents usage beyond limits
- Returns 429 when limit reached
- Limits reset monthly or per billing cycle

---

#### GET /feature/:featureName

Check if user has access to a specific feature.

**Request:**

```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:5000/api/subscriptions/feature/advancedAnalytics
```

**Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "feature": "advancedAnalytics",
    "hasAccess": true,
    "plan": "professional",
    "planStatus": "active"
  }
}
```

**Error (403):**

```json
{
  "success": false,
  "message": "Feature not available in your plan",
  "feature": "customBranding",
  "currentPlan": "professional",
  "requiredPlan": "enterprise"
}
```

**Available Features:**

- `unlimitedApplications`
- `advancedSearch`
- `featuredJobPostings`
- `directMessaging`
- `advancedAnalytics`
- `prioritySupport`
- `customBranding`
- `apiAccess`
- `bulkOperations`
- `scheduledPosting`

---

### Admin Endpoints

#### POST /admin/sync

Sync subscription with Stripe (admin only).

**Request:**

```bash
curl -X POST -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"userId":"user_id_here"}' \
  http://localhost:5000/api/subscriptions/admin/sync
```

**Request Body:**

```json
{
  "userId": "mongodb_user_id"
}
```

**Response (200 OK):**

```json
{
  "success": true,
  "message": "Subscription synced successfully",
  "data": {
    "userId": "user_id",
    "planId": "professional",
    "status": "active",
    "lastSyncedWithStripe": "2024-01-15T10:30:00Z"
  }
}
```

**Error (404):**

```json
{
  "success": false,
  "message": "Subscription not found"
}
```

---

## Webhook Events

### customer.subscription.created

Fired when a new subscription is created.

```json
{
  "type": "customer.subscription.created",
  "data": {
    "object": {
      "id": "sub_1234567890",
      "customer": "cus_ABC123",
      "status": "active",
      "current_period_start": 1694822400,
      "current_period_end": 1697500800,
      "trial_start": 1694822400,
      "trial_end": 1695427200,
      "metadata": {
        "userId": "user_id",
        "planId": "professional"
      }
    }
  }
}
```

**Server Actions:**

- Create Subscription record in database
- Set plan, status, billing dates
- Update user subscription reference
- Send confirmation email

---

### customer.subscription.updated

Fired when subscription is modified.

```json
{
  "type": "customer.subscription.updated",
  "data": {
    "object": {
      "id": "sub_1234567890",
      "status": "active",
      "current_period_start": 1697500800,
      "current_period_end": 1700179200,
      "cancel_at_period_end": false
    }
  }
}
```

**Server Actions:**

- Update subscription status and dates
- Record plan changes
- Update user permissions
- Send update notification

---

### customer.subscription.deleted

Fired when subscription is canceled.

```json
{
  "type": "customer.subscription.deleted",
  "data": {
    "object": {
      "id": "sub_1234567890",
      "status": "canceled",
      "canceled_at": 1694908800,
      "ended_at": 1694908800
    }
  }
}
```

**Server Actions:**

- Mark subscription as canceled
- Revert user to free tier
- Update permissions
- Send cancellation confirmation

---

### invoice.payment_succeeded

Fired when payment is successful.

```json
{
  "type": "invoice.payment_succeeded",
  "data": {
    "object": {
      "id": "in_ABC123",
      "customer": "cus_ABC123",
      "subscription": "sub_1234567890",
      "amount_paid": 3900,
      "status": "paid",
      "paid_at": 1694822400
    }
  }
}
```

**Server Actions:**

- Update invoice status to paid
- Record payment date
- Reset failure counts
- Send receipt email

---

### invoice.payment_failed

Fired when payment fails.

```json
{
  "type": "invoice.payment_failed",
  "data": {
    "object": {
      "id": "in_DEF456",
      "customer": "cus_ABC123",
      "subscription": "sub_1234567890",
      "amount_due": 3900,
      "status": "open",
      "next_payment_attempt": 1694909400,
      "last_finalization_error": {
        "message": "Your card was declined"
      }
    }
  }
}
```

**Server Actions:**

- Update subscription status to past_due
- Increment failure counter
- Store failure reason
- Send payment failure notification

---

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "message": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {}
}
```

### Common Error Codes

| Code                     | HTTP | Description                |
| ------------------------ | ---- | -------------------------- |
| `INVALID_PLAN`           | 400  | Plan ID not recognized     |
| `PLAN_CONFLICT`          | 400  | User already has this plan |
| `SUBSCRIPTION_NOT_FOUND` | 404  | No subscription record     |
| `FEATURE_DENIED`         | 403  | Feature not in plan        |
| `USAGE_LIMIT_EXCEEDED`   | 429  | Usage limit reached        |
| `STRIPE_ERROR`           | 500  | Stripe API error           |
| `WEBHOOK_INVALID`        | 400  | Invalid webhook signature  |

### Error Handling Example

```javascript
try {
  const response = await axios.post(
    "/api/subscriptions/upgrade",
    {
      targetPlanId: "professional",
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
} catch (error) {
  const { status, data } = error.response;

  switch (status) {
    case 400:
      console.error("Validation error:", data.message);
      break;
    case 403:
      console.error("Access denied:", data.message);
      break;
    case 429:
      console.error("Limit reached:", data.data.limit);
      break;
    case 500:
      console.error("Server error - contact support");
      break;
  }
}
```

---

## Subscription Lifecycle

### State Flow

```
FREE → TRIALING → ACTIVE ↔ PAST_DUE → CANCELED → REACTIVATED
                     ↓
                  [Upgrade/Downgrade]
                     ↓
                  NEW PLAN ACTIVE
```

### New Subscription Flow

1. User clicks "Upgrade" button
2. Backend creates checkout session
3. Frontend redirects to Stripe Checkout
4. User enters payment info
5. Stripe processes payment
6. Webhook: `customer.subscription.created`
7. Backend creates Subscription record
8. Trial period begins (7 days)
9. Frontend redirects to success page

### Failed Payment Recovery

1. Invoice due
2. Stripe processes payment
3. Payment fails
4. Webhook: `invoice.payment_failed`
5. Subscription status → `past_due`
6. User gets email with retry details
7. Stripe retries payment automatically
8. If succeeds: `invoice.payment_succeeded` → status `active`
9. If fails 3 times: subscription auto-canceled

---

## Frontend Integration

### Display Current Subscription

```javascript
import axios from "axios";

async function getSubscription(token) {
  const response = await axios.get("/api/subscriptions/current", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.data;
}
```

### Create Checkout Session

```javascript
async function startCheckout(planId, token) {
  const response = await axios.post(
    "/api/subscriptions/create-checkout-session",
    { planId },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  window.location.href = response.data.data.url;
}
```

### Check Feature Access

```javascript
async function hasFeature(featureName, token) {
  const response = await axios.get(
    `/api/subscriptions/feature/${featureName}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.data.hasAccess;
}
```

### Cancel Subscription

```javascript
async function cancelSubscription(reason, token) {
  const response = await axios.post(
    "/api/subscriptions/cancel",
    { reason },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data.data;
}
```

---

## Rate Limiting

Different plans have different API rate limits:

| Plan         | Requests/Hour | Burst |
| ------------ | ------------- | ----- |
| Free         | 100           | 10    |
| Basic        | 500           | 50    |
| Professional | 2000          | 200   |
| Enterprise   | 10000         | 1000  |

Rate limit headers in responses:

```http
X-RateLimit-Limit: 500
X-RateLimit-Remaining: 487
X-RateLimit-Reset: 1694827200
```

---

## FAQ

### How do trial periods work?

First-time subscribers automatically get a 7-day free trial when they purchase a paid plan. During the trial, users have full access to paid features with no charge. After 7 days, the first charge occurs.

### What happens if a payment fails?

When payment fails, the subscription enters `past_due` status. Stripe retries payment up to 4 times over 4 days. If all retries fail, the subscription is canceled and the user reverts to the free tier.

### Can I downgrade mid-month?

Yes, downgrades take effect at your next billing cycle. You'll receive a credit for the remaining days at the higher rate.

### Is there a setup fee?

No, there are no setup or hidden fees. You only pay the monthly subscription price.

### How do I update my payment method?

Go to Subscription Settings → Payment Method → Update Card, then follow the Stripe payment form.

### Can I reactivate after canceling?

Yes, you can reactivate anytime by going to Subscription Settings → Reactivate and following checkout.

### When does my usage reset?

Usage limits reset on your billing date (when your subscription renews). For monthly subscriptions, that's every 30 days from subscription start.

### How long does it take for a charge to appear?

Payment processing typically takes 1-3 business days to appear on your statement.

### What payment methods do you accept?

We accept all major credit and debit cards: Visa, Mastercard, American Express, and Discover via Stripe.

### Who should I contact for billing issues?

Contact our support team at support@doconnect.com or use the in-app support chat.

---

## Security

### Webhook Signature Verification

All webhooks from Stripe include a signature. Always verify this signature before processing:

```javascript
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const sig = req.headers["stripe-signature"];

let event = stripe.webhooks.constructEvent(
  req.body,
  sig,
  process.env.STRIPE_WEBHOOK_SECRET
);
```

### Best Practices

- Always verify webhook signatures
- Handle duplicate events
- Use event IDs to prevent duplicate processing
- Log all webhooks for audit trails
- Return 200 immediately, process asynchronously
- Implement retry logic for failed webhook processing

---

## Support

For API support, integration questions, or technical issues:

- **Email**: api-support@doconnect.com
- **Status Page**: status.doconnect.com
- **Documentation**: docs.doconnect.com
- **Status Check**: `GET /api/health`

---

**Last Updated:** January 2024 | **Version:** 1.0
