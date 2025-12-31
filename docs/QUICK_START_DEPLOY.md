# 🚀 Quick Start Deployment Guide

## TL;DR - Deploy in 30 Minutes

This is the fastest path to get DockerNet deployed to production.

---

## What You'll Deploy

- **Frontend**: Hostinger (your domain)
- **Backend**: Railway.app (free tier)
- **Database**: MongoDB Atlas (free tier)
- **Files**: Cloudinary (free tier)
- **Payments**: Stripe

**Total Cost**: $0/month to start (free tiers)

---

## Step 1: Set Up Services (15 minutes)

### MongoDB Atlas

1. Go to https://cloud.mongodb.com → Sign up
2. Create free cluster (M0)
3. Create database user: `dockernet` / `[strong-password]`
4. Network Access → Allow 0.0.0.0/0
5. Get connection string → Save it

### Cloudinary

1. Go to https://cloudinary.com → Sign up
2. Dashboard → Copy: Cloud Name, API Key, API Secret
3. Save these

### Stripe

1. Go to https://dashboard.stripe.com → Sign up
2. Toggle "Test mode" OFF
3. Developers → API keys → Copy both keys
4. Save for later (we'll add webhook after backend is deployed)

---

## Step 2: Deploy Backend to Railway (10 minutes)

### Push Code to GitHub

```bash
cd d:\dockernet
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/dockernet.git
git push -u origin main
```

### Deploy on Railway

1. Go to https://railway.app → Sign up with GitHub
2. "New Project" → "Deploy from GitHub repo"
3. Select your `dockernet` repository
4. Click on the service → Settings:
   - Root Directory: `server`
   - Start Command: `npm start`

### Add Environment Variables

Click "Variables" tab, add these:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=[your-mongodb-atlas-connection-string]
JWT_SECRET=[run: openssl rand -base64 64]
CLIENT_URL=https://yourdomain.com
STRIPE_SECRET_KEY=[your-stripe-secret-key]
STRIPE_PUBLISHABLE_KEY=[your-stripe-publishable-key]
CLOUDINARY_CLOUD_NAME=[your-cloud-name]
CLOUDINARY_API_KEY=[your-api-key]
CLOUDINARY_API_SECRET=[your-api-secret]
```

**Generate JWT Secret:**

```bash
openssl rand -base64 64
```

### Get Backend URL

1. Settings → Domains → "Generate Domain"
2. Copy the URL: `your-app.railway.app`
3. **Save this!** You need it for frontend

### Test Backend

```bash
curl https://your-app.railway.app/api/health
# Should return: {"message": "Dockernet API is running!", ...}
```

---

## Step 3: Configure Stripe Webhook (2 minutes)

1. Stripe Dashboard → Developers → Webhooks
2. "Add endpoint"
3. URL: `https://your-app.railway.app/api/subscriptions/webhook`
4. Select events:
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
   - invoice.payment_succeeded
   - invoice.payment_failed
5. Copy "Signing secret" (whsec\_...)
6. Add to Railway variables: `STRIPE_WEBHOOK_SECRET=[secret]`

---

## Step 4: Build & Deploy Frontend (5 minutes)

### Create Production Environment

Create `d:\dockernet\client\.env.production`:

```env
REACT_APP_API_URL=https://your-app.railway.app
REACT_APP_STRIPE_PUBLISHABLE_KEY=[your-stripe-publishable-key]
```

### Build

```bash
cd d:\dockernet\client
npm install
npm run build
```

### Upload to Hostinger

1. Log in to Hostinger
2. File Manager → `public_html/`
3. Delete existing files
4. Upload ALL files from `d:\dockernet\client\build\`:
   - index.html
   - .htaccess
   - static/ folder
   - All other files

**OR use FTP:**

1. FileZilla → Connect to Hostinger
2. Upload `build/` contents to `/public_html/`

### Enable SSL

1. Hostinger → Security → SSL
2. Install free SSL certificate
3. Wait 5-10 minutes

---

## Step 5: Test Everything (3 minutes)

### Test Website

1. Visit `https://yourdomain.com`
2. Register a new account
3. Log in
4. Upload profile photo
5. Create a job (if senior) or browse jobs (if junior)

### Test Payments (Use Test Mode First!)

1. Temporarily switch Stripe to test mode
2. Use test card: `4242 4242 4242 4242`
3. Verify subscription works
4. Switch back to live mode

---

## Troubleshooting

### Frontend shows blank page

- Check browser console for errors
- Verify `.env.production` has correct backend URL
- Rebuild: `npm run build`

### API calls fail (CORS error)

- Check `CLIENT_URL` in Railway matches your domain exactly
- Include `https://` in the URL
- Redeploy backend after changing

### Routes show 404

- Verify `.htaccess` is uploaded
- Contact Hostinger to enable mod_rewrite

### Database connection fails

- Check MongoDB Atlas IP whitelist (0.0.0.0/0)
- Verify connection string has correct password
- Check database name is `dockernet`

---

## You're Live! 🎉

Your app is now deployed:

- **Frontend**: https://yourdomain.com
- **Backend**: https://your-app.railway.app
- **Database**: MongoDB Atlas
- **Files**: Cloudinary
- **Payments**: Stripe

---

## Next Steps

1. **Monitor**: Watch Railway logs for errors
2. **Test**: Thoroughly test all features
3. **Secure**: Review security checklist
4. **Optimize**: Set up Cloudflare CDN (optional)
5. **Backup**: Ensure MongoDB backups are enabled

---

## Need More Details?

- **Backend Deployment**: See `DEPLOY_BACKEND_RAILWAY.md`
- **Frontend Deployment**: See `DEPLOY_FRONTEND_HOSTINGER.md`
- **Full Checklist**: See `DEPLOYMENT_CHECKLIST.md`

---

## Support

**Issues?**

1. Check the detailed guides in `/docs`
2. Review Railway logs
3. Check browser console
4. Verify all environment variables

**Still stuck?**

- Railway: https://railway.app/help
- Hostinger: https://support.hostinger.com
- MongoDB: https://support.mongodb.com
