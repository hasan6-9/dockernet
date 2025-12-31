# 🌐 Frontend Deployment Guide - Hostinger

## Overview

This guide will help you deploy your React frontend to Hostinger and connect it to your backend API.

---

## Prerequisites

✅ Backend deployed (Railway, Render, or VPS)
✅ Backend URL ready (e.g., `https://your-app.railway.app`)
✅ Hostinger account with domain
✅ Domain configured in Hostinger

---

## Step 1: Configure Production Environment

### 1.1 Create Production Environment File

```bash
cd d:\dockernet\client
```

Create `.env.production` file:

```env
REACT_APP_API_URL=https://your-backend-url.railway.app
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_production_key
REACT_APP_NAME=DocConnect
REACT_APP_VERSION=1.0.0
```

**Important:** Replace `your-backend-url.railway.app` with your actual backend URL!

---

## Step 2: Update API Configuration

### 2.1 Check if API file uses environment variables

Open `client/src/api/index.js` and ensure it uses `process.env.REACT_APP_API_URL`:

```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
```

If it's hardcoded, update it to use the environment variable.

---

## Step 3: Build Production Bundle

### 3.1 Install Dependencies (if needed)

```bash
cd d:\dockernet\client
npm install
```

### 3.2 Build for Production

```bash
npm run build
```

This will:

- Create optimized production build
- Minify JavaScript and CSS
- Generate static files in `build/` folder
- Process environment variables

**Expected output:**

```
Creating an optimized production build...
Compiled successfully.

File sizes after gzip:

  XX.XX kB  build/static/js/main.xxxxx.js
  XX.XX kB  build/static/css/main.xxxxx.css

The build folder is ready to be deployed.
```

### 3.3 Verify Build

```bash
# Check build folder exists
dir build

# Should contain:
# - index.html
# - static/ (folder with JS, CSS, media)
# - asset-manifest.json
# - manifest.json
# - robots.txt
```

---

## Step 4: Configure React Router for Hostinger

### 4.1 Create `.htaccess` File

Create `client/public/.htaccess`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Don't rewrite files or directories
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d

  # Rewrite everything else to index.html
  RewriteRule . /index.html [L]
</IfModule>

# Enable GZIP compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Browser caching
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType text/javascript "access plus 1 month"
  ExpiresByType application/pdf "access plus 1 month"
  ExpiresByType text/html "access plus 0 seconds"
</IfModule>

# Security headers
<IfModule mod_headers.c>
  Header set X-Content-Type-Options "nosniff"
  Header set X-Frame-Options "SAMEORIGIN"
  Header set X-XSS-Protection "1; mode=block"
</IfModule>
```

### 4.2 Rebuild to Include .htaccess

```bash
npm run build
```

The `.htaccess` file will now be in `build/` folder.

---

## Step 5: Deploy to Hostinger

### Method 1: File Manager (Easiest)

#### 5.1 Access Hostinger File Manager

1. Log in to Hostinger
2. Go to "Hosting" → Your hosting plan
3. Click "File Manager"

#### 5.2 Navigate to Public Directory

1. Go to `public_html/` folder
   - This is your website's root directory
   - Files here are accessible at `yourdomain.com`

#### 5.3 Clear Existing Files (if any)

1. Select all files in `public_html/`
2. Delete them (backup first if needed!)

#### 5.4 Upload Build Files

1. Click "Upload Files"
2. Navigate to `d:\dockernet\client\build\`
3. Select ALL files and folders:
   - `index.html`
   - `asset-manifest.json`
   - `manifest.json`
   - `robots.txt`
   - `.htaccess`
   - `static/` folder (entire folder)
   - `favicon.ico`
4. Upload

**Alternative: Upload as ZIP**

1. Compress `build/` folder contents to `build.zip`
2. Upload `build.zip` to `public_html/`
3. Right-click → Extract
4. Move files from extracted folder to `public_html/`
5. Delete the zip and empty folder

---

### Method 2: FTP (Recommended for Faster Upload)

#### 5.1 Get FTP Credentials

1. In Hostinger panel, go to "Files" → "FTP Accounts"
2. Note your FTP credentials:
   - Host: `ftp.yourdomain.com`
   - Username: Usually your domain or email
   - Password: Your FTP password
   - Port: 21

#### 5.2 Use FTP Client (FileZilla)

1. Download FileZilla: https://filezilla-project.org/
2. Install and open FileZilla
3. Connect:
   - Host: `ftp.yourdomain.com`
   - Username: (from Hostinger)
   - Password: (from Hostinger)
   - Port: 21
4. Click "Quickconnect"

#### 5.3 Upload Files

1. Left side: Navigate to `d:\dockernet\client\build\`
2. Right side: Navigate to `/public_html/`
3. Select all files in build folder
4. Drag to right side (public_html)
5. Wait for upload to complete

---

## Step 6: Configure Domain & SSL

### 6.1 Verify Domain Points to Hosting

1. In Hostinger, go to "Domains"
2. Click on your domain
3. Check DNS settings:
   - A record should point to Hostinger's IP
   - If using subdomain, add CNAME record

### 6.2 Enable SSL (HTTPS)

1. Go to "Security" → "SSL"
2. Select your domain
3. Click "Install SSL"
4. Choose "Free SSL" (Let's Encrypt)
5. Wait 5-10 minutes for activation

### 6.3 Force HTTPS

Add to `.htaccess` (at the top):

```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
```

Update build and re-upload.

---

## Step 7: Test Your Deployment

### 7.1 Basic Tests

1. Visit `https://yourdomain.com`

   - Should load homepage
   - Check browser console for errors

2. Test routing:

   - `https://yourdomain.com/login`
   - `https://yourdomain.com/register`
   - `https://yourdomain.com/dashboard`
   - All should load (not 404)

3. Test API connection:
   - Try to register/login
   - Check if it connects to backend
   - Open browser DevTools → Network tab
   - Should see requests to your backend URL

### 7.2 Check for Common Issues

**Issue: Blank page**

- Check browser console for errors
- Verify `.env.production` has correct API URL
- Rebuild and re-upload

**Issue: 404 on routes**

- Verify `.htaccess` is uploaded
- Check if mod_rewrite is enabled (contact Hostinger support)

**Issue: API calls fail**

- Check CORS settings in backend
- Verify `CLIENT_URL` in backend .env matches your domain
- Check if backend is running

**Issue: Mixed content errors**

- Ensure backend URL uses HTTPS
- Check all resource URLs use HTTPS

---

## Step 8: Performance Optimization

### 8.1 Enable Caching

Already configured in `.htaccess` above!

### 8.2 Use Cloudflare (Optional but Recommended)

1. Sign up at https://cloudflare.com
2. Add your domain
3. Update nameservers in Hostinger to Cloudflare's
4. Benefits:
   - Free CDN
   - DDoS protection
   - Better caching
   - Analytics

### 8.3 Optimize Images

- Use WebP format
- Compress images before upload
- Use Cloudinary for dynamic images

---

## Step 9: Set Up Continuous Deployment (Optional)

### 9.1 Create Deploy Script

Create `client/deploy.sh`:

```bash
#!/bin/bash

echo "🚀 Starting deployment..."

# Build
echo "📦 Building production bundle..."
npm run build

# Upload via FTP (requires lftp)
echo "📤 Uploading to Hostinger..."
lftp -c "
set ftp:ssl-allow no;
open -u username,password ftp.yourdomain.com;
mirror -R build/ /public_html/ --delete --verbose;
bye
"

echo "✅ Deployment complete!"
```

Make executable:

```bash
chmod +x deploy.sh
```

### 9.2 Deploy with One Command

```bash
./deploy.sh
```

---

## Step 10: Monitoring & Maintenance

### 10.1 Set Up Google Analytics (Optional)

1. Create GA4 property
2. Get tracking ID
3. Add to `.env.production`:
   ```
   REACT_APP_GA_TRACKING_ID=G-XXXXXXXXXX
   ```
4. Implement in `src/index.js`

### 10.2 Monitor Errors

- Use browser console
- Set up Sentry for error tracking
- Check Hostinger access logs

### 10.3 Regular Updates

```bash
# When you make changes:
cd d:\dockernet\client
npm run build
# Upload new build/ contents to Hostinger
```

---

## Troubleshooting Guide

### Build Errors

```bash
# Clear cache and rebuild
rm -rf node_modules
rm package-lock.json
npm install
npm run build
```

### Upload Issues

- Check FTP credentials
- Verify file permissions (755 for folders, 644 for files)
- Try File Manager if FTP fails

### Runtime Errors

- Check browser console
- Verify API URL in .env.production
- Test API directly: `curl https://your-backend-url/api/health`
- Check CORS settings in backend

### SSL Issues

- Wait 10-15 minutes after installation
- Clear browser cache
- Check SSL status in Hostinger panel

---

## Deployment Checklist

Before going live:

- [ ] `.env.production` configured with correct backend URL
- [ ] Production build created (`npm run build`)
- [ ] `.htaccess` file included in build
- [ ] All files uploaded to `public_html/`
- [ ] SSL certificate installed and active
- [ ] Domain resolves correctly
- [ ] All routes work (no 404s)
- [ ] API connection works
- [ ] Login/Register functional
- [ ] File uploads work
- [ ] Stripe payments work (test mode first!)
- [ ] Mobile responsive
- [ ] Browser console has no errors

---

## Quick Reference

### Rebuild and Deploy

```bash
cd d:\dockernet\client
npm run build
# Upload build/ contents to public_html/
```

### Update Environment Variables

```bash
# Edit .env.production
# Rebuild
npm run build
# Re-upload
```

### Rollback

- Keep previous build folder as backup
- Upload old build if issues occur

---

## Support

### Hostinger Support

- Live chat: Available 24/7
- Email: support@hostinger.com
- Knowledge base: https://support.hostinger.com

### Common Hostinger Settings

- PHP version: Not needed (static React app)
- Node.js: Not needed on Hostinger (only for backend)
- Database: Not needed on Hostinger (backend handles this)

---

## Next Steps

✅ Frontend deployed to Hostinger
✅ Connected to backend API
✅ SSL enabled
✅ Domain configured

**You're live! 🎉**

Test everything thoroughly before announcing to users!
