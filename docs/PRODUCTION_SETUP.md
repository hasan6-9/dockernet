# 🔧 Production Environment Setup Guide

## Current Status

I've analyzed your `.env` file and created a production-ready configuration. Here's what you need to do:

---

## 📋 Step 1: Change MongoDB Database Name

You're currently connected to MongoDB. Here's how to change the database name to `dockernet`:

### In Your mongosh Terminal (Already Open)

```bash
# 1. Show current databases
show dbs

# 2. Switch to the new 'dockernet' database (creates it if doesn't exist)
use dockernet

# 3. Verify you're in the right database
db.getName()

# 4. Create a test collection to persist the database
db.test.insertOne({ initialized: true, date: new Date() })

# 5. Verify the database was created
show dbs

# 6. You should now see 'dockernet' in the list
```

### Alternative: Update Connection String (Easier)

Instead of using mongosh, you can simply update your connection string to include the database name:

**Current:**

```
mongodb+srv://hassanmubarak007:tT2Efr4JwrcgcAIE@cluster0.q0pb12f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
```

**Updated (with database name):**

```
mongodb+srv://hassanmubarak007:tT2Efr4JwrcgcAIE@cluster0.q0pb12f.mongodb.net/dockernet?retryWrites=true&w=majority&appName=Cluster0
```

**Notice:** Added `/dockernet` before the `?` - this tells MongoDB to use the `dockernet` database.

---

## 📋 Step 2: Update Your .env Files

### Development (.env) - Keep for Local Testing

Your current `.env` is fine for development. Just update the MongoDB URI:

```env
MONGODB_URI=mongodb+srv://hassanmubarak007:tT2Efr4JwrcgcAIE@cluster0.q0pb12f.mongodb.net/dockernet?retryWrites=true&w=majority&appName=Cluster0
```

### Production (.env.production) - For Railway Deployment

I've created `server/.env.production` with your credentials. **You MUST update these items:**

#### ⚠️ CRITICAL - Must Change Before Deployment:

1. **Stripe Keys** - Get LIVE keys (not test keys):

   ```env
   # Current (TEST keys - won't work in production):
   STRIPE_SECRET_KEY=sk_test_51RqlPQ3NpplonWfF...
   STRIPE_PUBLISHABLE_KEY=pk_test_51RqlPQ3NpplonWfF...

   # Need (LIVE keys):
   STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY
   STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY
   ```

   **How to get LIVE keys:**

   - Go to https://dashboard.stripe.com
   - Toggle "Test mode" OFF (top right)
   - Developers → API keys
   - Copy both keys

2. **Client URL** - Your Hostinger domain:

   ```env
   CLIENT_URL=https://yourdomain.com
   ```

3. **Stripe Webhook Secret** - Create after deploying backend:

   ```env
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_PRODUCTION_SECRET
   ```

4. **Stripe Price IDs** - Create in LIVE mode:
   ```env
   STRIPE_PRICE_BASIC=price_YOUR_LIVE_BASIC_ID
   STRIPE_PRICE_PROFESSIONAL=price_YOUR_LIVE_PROFESSIONAL_ID
   STRIPE_PRICE_ENTERPRISE=price_YOUR_LIVE_ENTERPRISE_ID
   ```

#### ✅ Already Configured (No Changes Needed):

- MongoDB URI ✓ (updated with `dockernet` database)
- Cloudinary credentials ✓
- JWT Secret ✓ (consider generating new one for production)
- Socket.IO settings ✓

---

## 📋 Step 3: Get Stripe Production Keys

### Current Situation:

Your Stripe keys are **TEST** keys (start with `sk_test_` and `pk_test_`). These will NOT work in production.

### What You Need:

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com

2. **Toggle to LIVE Mode**:

   - Top right corner, switch "Test mode" to OFF
   - You'll see "LIVE MODE" indicator

3. **Get API Keys**:

   - Click "Developers" → "API keys"
   - Copy:
     - **Publishable key** (starts with `pk_live_`)
     - **Secret key** (starts with `sk_live_`)

4. **Create Products & Prices in LIVE Mode**:

   - Go to "Products" → "Add Product"
   - Create three products:
     - Basic Plan ($X/month)
     - Professional Plan ($Y/month)
     - Enterprise Plan ($Z/month)
   - Copy the Price IDs (start with `price_`)

5. **Create Webhook** (AFTER deploying backend):
   - Developers → Webhooks → "Add endpoint"
   - URL: `https://your-app.railway.app/api/subscriptions/webhook`
   - Select events:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
   - Copy the "Signing secret" (starts with `whsec_`)

---

## 📋 Step 4: Update Development .env

Update your current `.env` file with the database name:

```bash
# In d:\dockernet\server\.env
# Change this line:
MONGODB_URI=mongodb+srv://hassanmubarak007:tT2Efr4JwrcgcAIE@cluster0.q0pb12f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0

# To this (added /dockernet):
MONGODB_URI=mongodb+srv://hassanmubarak007:tT2Efr4JwrcgcAIE@cluster0.q0pb12f.mongodb.net/dockernet?retryWrites=true&w=majority&appName=Cluster0
```

---

## 📋 Step 5: Railway Environment Variables

When deploying to Railway, add these environment variables:

### Required Variables:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://hassanmubarak007:tT2Efr4JwrcgcAIE@cluster0.q0pb12f.mongodb.net/dockernet?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=gPG3/3aefMyS3TEpG+VE0ioQdxmXtlRRU+j2c/cyb5s=
CLIENT_URL=https://yourdomain.com
STRIPE_SECRET_KEY=sk_live_YOUR_LIVE_KEY
STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_LIVE_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET
CLOUDINARY_CLOUD_NAME=dge6itdcy
CLOUDINARY_API_KEY=411594876244892
CLOUDINARY_API_SECRET=FR7tWMUxHNuiLjYbkaIJurQbStM
```

### Optional Variables:

```env
STRIPE_PRICE_BASIC=price_YOUR_BASIC_ID
STRIPE_PRICE_PROFESSIONAL=price_YOUR_PROFESSIONAL_ID
STRIPE_PRICE_ENTERPRISE=price_YOUR_ENTERPRISE_ID
STRIPE_ENABLE_TAX=false
SOCKET_MAX_CONNECTIONS=1000
SOCKET_PING_TIMEOUT=60000
SOCKET_PING_INTERVAL=25000
```

---

## 🔒 Security Recommendations

### 1. Generate New JWT Secret for Production

```bash
# Run this command to generate a strong secret:
openssl rand -base64 64

# Use the output as your JWT_SECRET in production
```

### 2. Email Configuration (Optional but Recommended)

For Gmail:

1. Enable 2-factor authentication
2. Generate app-specific password
3. Update in Railway:
   ```env
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_specific_password
   ```

### 3. Redis (Optional - for Scaling)

If you expect high traffic, set up Redis:

- **Redis Cloud**: https://redis.com/try-free/
- **Upstash**: https://upstash.com/

Add to Railway:

```env
REDIS_URL=redis://default:password@host:port
```

---

## ✅ Pre-Deployment Checklist

Before deploying to Railway:

- [ ] MongoDB database name changed to `dockernet`
- [ ] Development `.env` updated with database name
- [ ] Production `.env.production` created
- [ ] Stripe LIVE keys obtained
- [ ] Stripe products/prices created in LIVE mode
- [ ] CLIENT_URL updated to your domain
- [ ] Cloudinary credentials verified
- [ ] (Optional) New JWT secret generated
- [ ] (Optional) Email configured
- [ ] (Optional) Redis configured

After deploying backend to Railway:

- [ ] Stripe webhook created with Railway URL
- [ ] Webhook secret added to Railway environment
- [ ] Backend health endpoint tested
- [ ] Database connection verified

---

## 🚀 Quick Commands Reference

### MongoDB Commands (in mongosh):

```bash
# Show all databases
show dbs

# Switch to dockernet database
use dockernet

# Check current database
db.getName()

# Show collections in current database
show collections

# Count documents in a collection
db.users.countDocuments()

# Find all users
db.users.find().pretty()

# Exit mongosh
exit
```

### Test Your Setup Locally:

```bash
# 1. Update .env with database name
# 2. Restart your server
cd d:\dockernet\server
npm start

# 3. Test in another terminal
curl http://localhost:5000/api/health

# Should return:
# {"message": "Dockernet API is running!", ...}
```

---

## 📝 Summary

### What I've Done:

1. ✅ Created `.env.production` with your credentials
2. ✅ Updated MongoDB URI to use `dockernet` database
3. ✅ Identified what needs to be changed for production
4. ✅ Provided mongosh commands to create database

### What You Need to Do:

1. **Update Development .env**:

   - Add `/dockernet` to MongoDB URI

2. **Get Stripe LIVE Keys**:

   - Switch to LIVE mode in Stripe Dashboard
   - Copy LIVE API keys
   - Create products/prices in LIVE mode

3. **Update Production Config**:

   - Replace Stripe test keys with LIVE keys
   - Update CLIENT_URL to your domain
   - (Optional) Generate new JWT secret

4. **Deploy**:
   - Follow the Quick Start Guide
   - Add environment variables to Railway
   - Create Stripe webhook after deployment

---

## 🆘 Need Help?

- **MongoDB Issues**: Check connection string format
- **Stripe Issues**: Ensure you're in LIVE mode
- **Deployment Issues**: See `QUICK_START_DEPLOY.md`

**Next Step**: Update your development `.env` and test locally before deploying!
