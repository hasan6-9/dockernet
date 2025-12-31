# 🚀 Quick Deployment Without Stripe

## Deploy DockerNet in 20 Minutes (No Stripe Required)

All features will work except subscription payments. You can add Stripe later!

---

## Step 1: MongoDB - Use Existing Connection (2 min)

Your MongoDB is already set up! Just update the database name:

### In your mongosh terminal (already open):

```bash
use dockernet
db.test.insertOne({ initialized: true })
```

**Done!** Your database is ready.

---

## Step 2: Push to GitHub (3 min)

```bash
cd d:\dockernet

# Initialize git (if not already done)
git init
git add .
git commit -m "Ready for production deployment"

# Create GitHub repo and push
git remote add origin https://github.com/yourusername/dockernet.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy Backend to Railway (10 min)

### 3.1 Sign Up & Connect

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your `dockernet` repository

### 3.2 Configure Service

1. Click on the service
2. Settings:
   - **Root Directory**: `server`
   - **Start Command**: `npm start`

### 3.3 Add Environment Variables

Click "Variables" tab, add these (copy from below):

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://hassanmubarak007:tT2Efr4JwrcgcAIE@cluster0.q0pb12f.mongodb.net/doconnect?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=fZG8Z6Qxh658kDt0llMNmxzn0x3uNajcePte4bnsqxLwSJi2TO1nA2v+/fkfALZKa9CKggKuFRO29zpkynCatg==
CLIENT_URL=https://doconnect.life
CLOUDINARY_CLOUD_NAME=dge6itdcy
CLOUDINARY_API_KEY=411594876244892
CLOUDINARY_API_SECRET=FR7tWMUxHNuiLjYbkaIJurQbStM
```

**Note:** Replace `yourdomain.com` with your actual Hostinger domain!

### 3.4 Get Backend URL

1. Settings → Domains → "Generate Domain"
2. Copy URL: `your-app.railway.app`
3. **Save this!** You need it for frontend

### 3.5 Test Backend

```bash
curl https://your-app.railway.app/api/health
```

Should return: `{"message": "Dockernet API is running!", ...}`

---

## Step 4: Build Frontend (3 min)

### 4.1 Create Production Environment

Create `d:\dockernet\client\.env.production`:

```env
REACT_APP_API_URL=https://your-app.railway.app
```

**Replace** `your-app.railway.app` with your actual Railway URL!

### 4.2 Build

```bash
cd d:\dockernet\client
npm install
npm run build
```

Wait for build to complete (~2-3 minutes).

---

## Step 5: Deploy to Hostinger (5 min)

### Option A: File Manager (Easier)

1. Log in to Hostinger
2. File Manager → `public_html/`
3. Delete all existing files
4. Upload ALL files from `d:\dockernet\client\build\`
5. Done!

### Option B: FTP (Faster)

1. Get FTP credentials from Hostinger
2. Use FileZilla
3. Upload `build/` contents to `/public_html/`

### Enable SSL

1. Hostinger → Security → SSL
2. Install free SSL certificate
3. Wait 5-10 minutes

---

## Step 6: Test Everything (2 min)

1. Visit `https://yourdomain.com`
2. Register a new account
3. Log in
4. Upload profile photo
5. Create/browse jobs

**All features work except payments!**

---

## What Works Without Stripe

✅ User registration & login
✅ Profile management
✅ Photo & document uploads
✅ Job posting & browsing
✅ Job applications
✅ Messaging
✅ Notifications
✅ Admin dashboard
✅ All core features

❌ Subscription payments (can add later)

---

## Troubleshooting

### Blank page

- Check browser console
- Verify `.env.production` has correct Railway URL
- Rebuild: `npm run build`

### CORS errors

- Verify `CLIENT_URL` in Railway matches your domain
- Include `https://` in URL
- Redeploy backend

### 404 on routes

- Verify `.htaccess` is in `build/` folder
- Re-upload to Hostinger

---

## Adding Stripe Later

When you're ready:

1. Get Stripe keys
2. Add to Railway environment variables:
   ```env
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```
3. Add to frontend `.env.production`:
   ```env
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_...
   ```
4. Rebuild frontend
5. Redeploy

---

## You're Live! 🎉

Your app is deployed without Stripe:

- **Frontend**: https://yourdomain.com
- **Backend**: https://your-app.railway.app
- **Database**: MongoDB Atlas
- **Files**: Cloudinary

**Cost**: $0-5/month (all free tiers!)

---

## Next Steps

1. Test all features thoroughly
2. Set up monitoring (optional)
3. Add Stripe when ready (optional)
4. Announce to users!

**Need help?** Check the detailed guides in `/docs` folder.
