# 🚀 Backend Deployment Guide - Railway.app (Recommended)

## Why Railway?

- ✅ Easiest deployment process
- ✅ Free $5 credit monthly (enough for small apps)
- ✅ Automatic deployments from GitHub
- ✅ Built-in environment variable management
- ✅ Free SSL certificates
- ✅ Easy scaling

## Prerequisites

- GitHub account
- Railway account (sign up at https://railway.app)
- Your DockerNet code pushed to GitHub

---

## Step 1: Prepare Your Repository

### 1.1 Push Code to GitHub

```bash
cd d:\dockernet
git init
git add .
git commit -m "Initial commit - ready for deployment"
git branch -M main
git remote add origin https://github.com/yourusername/dockernet.git
git push -u origin main
```

### 1.2 Create `.gitignore` (if not exists)

Make sure these are in your `.gitignore`:

```
node_modules/
.env
.env.local
.env.production
*.log
build/
dist/
uploads/
```

---

## Step 2: Set Up Railway Project

### 2.1 Create New Project

1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo"
4. Authorize Railway to access your GitHub
5. Select your `dockernet` repository

### 2.2 Configure Service

1. Railway will detect your Node.js app
2. Click on the service
3. Go to "Settings"
4. Set **Root Directory**: `server`
5. Set **Start Command**: `npm start`

---

## Step 3: Configure Environment Variables

### 3.1 Add Variables in Railway

1. Click on your service
2. Go to "Variables" tab
3. Click "New Variable"
4. Add each variable from `.env.production.example`:

**Required Variables:**

```
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=generate_with_openssl_rand_base64_64
CLIENT_URL=https://yourdomain.com
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3.2 Generate JWT Secret

```bash
# Run this in your terminal to generate a secure secret
openssl rand -base64 64
```

Copy the output and use it as `JWT_SECRET`

---

## Step 4: Set Up MongoDB Atlas

### 4.1 Create Free Cluster

1. Go to https://cloud.mongodb.com
2. Sign up / Log in
3. Click "Build a Database"
4. Choose "FREE" tier (M0)
5. Select a cloud provider and region (closest to your users)
6. Click "Create Cluster"

### 4.2 Create Database User

1. Click "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `dockernet-admin`
5. Generate a secure password (save it!)
6. Set role: "Read and write to any database"
7. Click "Add User"

### 4.3 Configure Network Access

1. Click "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
   - This is safe because you have username/password protection
4. Click "Confirm"

### 4.4 Get Connection String

1. Click "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password
6. Replace `myFirstDatabase` with `dockernet`

Example:

```
mongodb+srv://dockernet-admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/dockernet?retryWrites=true&w=majority
```

---

## Step 5: Configure Cloudinary

### 5.1 Create Account

1. Go to https://cloudinary.com
2. Sign up for free account
3. Verify your email

### 5.2 Get Credentials

1. Go to Dashboard
2. Find your credentials:
   - Cloud Name
   - API Key
   - API Secret
3. Add these to Railway environment variables

### 5.3 Create Upload Preset (Optional but Recommended)

1. Go to Settings → Upload
2. Scroll to "Upload presets"
3. Click "Add upload preset"
4. Name: `dockernet-profiles`
5. Signing Mode: "Signed"
6. Folder: `dockernet/profiles`
7. Save

---

## Step 6: Configure Stripe

### 6.1 Get Production Keys

1. Go to https://dashboard.stripe.com
2. Toggle "Test mode" OFF (top right)
3. Go to Developers → API keys
4. Copy:
   - Publishable key (pk*live*...)
   - Secret key (sk*live*...)

### 6.2 Set Up Webhook

1. Go to Developers → Webhooks
2. Click "Add endpoint"
3. Endpoint URL: `https://your-railway-url.railway.app/api/subscriptions/webhook`
   - You'll get this URL after Railway deploys
4. Select events to listen to:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
5. Click "Add endpoint"
6. Copy the "Signing secret" (whsec\_...)
7. Add to Railway as `STRIPE_WEBHOOK_SECRET`

---

## Step 7: Deploy!

### 7.1 Trigger Deployment

1. Railway automatically deploys when you push to GitHub
2. Or click "Deploy" in Railway dashboard
3. Watch the build logs

### 7.2 Get Your Backend URL

1. Go to "Settings" in Railway
2. Scroll to "Domains"
3. Click "Generate Domain"
4. You'll get: `your-app.railway.app`
5. **Save this URL** - you'll need it for frontend!

### 7.3 Test Your API

```bash
# Test health endpoint
curl https://your-app.railway.app/api/health

# Should return:
{
  "message": "Dockernet API is running!",
  "timestamp": "...",
  "environment": "production",
  "version": "1.0.0"
}
```

---

## Step 8: Update Stripe Webhook URL

1. Go back to Stripe Dashboard → Webhooks
2. Edit your webhook endpoint
3. Update URL to: `https://your-app.railway.app/api/subscriptions/webhook`
4. Save

---

## Step 9: Configure Custom Domain (Optional)

### 9.1 Add Subdomain for API

1. In Railway, go to Settings → Domains
2. Click "Custom Domain"
3. Enter: `api.yourdomain.com`
4. Railway will give you a CNAME record

### 9.2 Configure in Hostinger

1. Log in to Hostinger
2. Go to your domain's DNS settings
3. Add CNAME record:
   - Type: CNAME
   - Name: api
   - Target: (Railway's CNAME target)
   - TTL: 3600

### 9.3 Wait for DNS Propagation

- Can take 5 minutes to 48 hours
- Usually works within 15-30 minutes
- Test with: `nslookup api.yourdomain.com`

---

## Step 10: Enable Monitoring

### 10.1 Railway Metrics

1. Click on your service
2. Go to "Metrics" tab
3. Monitor:
   - CPU usage
   - Memory usage
   - Network traffic
   - Request count

### 10.2 Set Up Alerts (Optional)

1. Go to Project Settings
2. Configure notifications
3. Add email or Slack webhook

---

## Troubleshooting

### Build Fails

```bash
# Check logs in Railway dashboard
# Common issues:
# 1. Missing dependencies - run npm install locally first
# 2. Wrong Node version - add engines in package.json
# 3. Environment variables missing
```

### Database Connection Fails

```bash
# Check:
# 1. MongoDB Atlas IP whitelist (should be 0.0.0.0/0)
# 2. Correct username/password in connection string
# 3. Database name is correct
# 4. Connection string format is correct
```

### API Returns 502/503

```bash
# Check:
# 1. Service is running in Railway dashboard
# 2. PORT environment variable is set
# 3. Check logs for errors
```

---

## Maintenance

### Update Code

```bash
# Just push to GitHub
git add .
git commit -m "Update feature"
git push

# Railway auto-deploys!
```

### View Logs

1. Click on service in Railway
2. Go to "Deployments"
3. Click on latest deployment
4. View real-time logs

### Rollback

1. Go to "Deployments"
2. Find previous working deployment
3. Click "..." → "Redeploy"

---

## Cost Management

### Free Tier Limits

- $5 credit per month
- Enough for:
  - Small to medium traffic
  - ~100,000 requests/month
  - Always-on service

### Upgrade When Needed

- Hobby Plan: $5/month
- Pro Plan: $20/month
- Scales automatically

---

## Next Steps

✅ Backend deployed on Railway
✅ MongoDB Atlas configured
✅ Cloudinary set up
✅ Stripe configured

**Next:** Deploy frontend to Hostinger using the backend URL you just got!

Your backend URL: `https://your-app.railway.app`
Use this in your frontend `.env.production` file!
