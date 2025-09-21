# 🚀 Vault5 Deployment Guide (Free Tier Friendly)

**Vault5 v2.0** - Personal Bank + Financial Coach + Discipline Enforcer

This guide covers deployment of the complete Vault5 platform with:
- **Transactional wallet** (PayPal/M-Pesa style)
- **5-account allocation system** (Daily, Emergency, Investment, Long-Term, Fun)
- **Account rules engine** (transfers, payouts, penalties, locks)
- **Adaptive spend control** (throttle/emergency modes)
- **P2P transfers** and **external payouts**
- **Statements & exports** (PDF/Excel)

---

## 🏗️ Architecture Overview

**Frontend:** React SPA (Vercel/Netlify)
**Backend:** Express.js API (Render/Railway/Heroku)
**Database:** MongoDB Atlas (free tier)
**File Storage:** Cloudinary (free tier) or AWS S3

**Why this split?**
- Vercel/Netlify: Perfect for static React apps, fast global CDN
- Render/Railway: Better for long-running Express backends with WebSockets
- MongoDB Atlas: Global, scalable, free tier with 512MB storage

---

## 📋 Prerequisites

- **GitHub repository** connected (auto-deploys on push)
- **MongoDB Atlas** free cluster (512MB storage)
- **Email service** (Gmail/SMTP or SendGrid free tier)
- **Payment providers** (M-Pesa/Airtel/Bank simulation in dev)

---

## 🚀 Option 1: Vercel + Render (Recommended)

### Backend (Render) - Free Web Service

1. **Create Render Service**
   - Go to [render.com](https://render.com) → New → Web Service
   - Connect your GitHub repo
   - **Root directory:** `vault5/backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

2. **Environment Variables** (Render Dashboard → Environment)
   ```bash
   # Required - Database
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/vault5?retryWrites=true&w=majority

   # Required - Security
   JWT_SECRET=your-super-long-random-secret-here
   NODE_ENV=production

   # Required - CORS
   CORS_ALLOWED_ORIGINS=https://your-frontend-domain.vercel.app

   # Required - Email (for notifications)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password

   # Optional - Features (enable/disable)
   ENABLE_ADAPTIVE_SPEND=true
   ENABLE_ACCOUNT_RULES=true
   ENABLE_LENDING=true

   # Optional - Limits & Thresholds
   DAILY_TRANSFER_LIMIT=50000
   MONTHLY_EMERGENCY_PAYOUTS=2
   LONG_TERM_LOCK_DAYS=90

   # Optional - External Services
   CLOUDINARY_URL=cloudinary://api_key:api_secret@cloud_name
   ```

3. **Deploy & Test**
   - Click **Deploy**
   - Note your Render URL: `https://vault5-backend.onrender.com`
   - Test: Visit URL → should return "Vault5 Backend API is running!"

### Frontend (Vercel) - Free Static Hosting

1. **Import Project**
   - Go to [vercel.com](https://vercel.com) → New Project → Import GitHub
   - **Root directory:** `vault5/frontend`
   - **Framework:** Create React App
   - **Build Settings:** Auto-detected

2. **Environment Variables** (Vercel Dashboard → Settings → Environment Variables)
   ```bash
   REACT_APP_API_URL=https://vault5-backend.onrender.com
   REACT_APP_ENV=production
   ```

3. **Deploy**
   - Deploy automatically
   - Note your Vercel domain: `https://vault5-frontend.vercel.app`
   - Update Render's `CORS_ALLOWED_ORIGINS` to include this domain

---

## 🚀 Option 2: Netlify + Railway

### Backend (Railway) - Free Tier

1. **Create Railway Project**
   - Go to [railway.app](https://railway.app) → New Project → GitHub
   - **Root directory:** `vault5/backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

2. **Environment Variables** (Railway Dashboard → Variables)
   ```bash
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/vault5
   JWT_SECRET=your-super-long-random-secret-here
   NODE_ENV=production
   CORS_ALLOWED_ORIGINS=https://your-frontend-domain.netlify.app
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

### Frontend (Netlify) - Free Tier

1. **Import Project**
   - Go to [netlify.com](https://netlify.com) → New site from Git → GitHub
   - **Base directory:** `vault5/frontend`
   - **Build command:** `npm run build`
   - **Publish directory:** `build`

2. **Environment Variables** (Netlify Dashboard → Site settings → Environment variables)
   ```bash
   REACT_APP_API_URL=https://your-railway-backend.up.railway.app
   ```

---

## 🚀 Option 3: Heroku + Netlify (Alternative)

### Backend (Heroku) - Free Dynos

1. **Create Heroku App**
   ```bash
   # Install Heroku CLI first
   heroku create vault5-backend
   heroku buildpacks:add heroku/nodejs
   ```

2. **Deploy**
   ```bash
   git subtree push --prefix vault5/backend heroku main
   ```

3. **Config Variables** (Heroku Dashboard → Settings → Config Vars)
   ```bash
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/vault5
   JWT_SECRET=your-super-long-random-secret-here
   NODE_ENV=production
   CORS_ALLOWED_ORIGINS=https://your-frontend-domain.netlify.app
   ```

### Frontend (Netlify) - Same as Option 2

---

## 🚀 Option 4: Firebase + Railway (Full Google Stack)

### Backend (Railway) - Same as Option 2

### Frontend (Firebase Hosting) - Free Tier

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. **Initialize & Deploy**
   ```bash
   cd vault5/frontend
   firebase init hosting
   # Choose build directory, no SPA redirect
   npm run build
   firebase deploy
   ```

---

## 🚀 Option 5: AWS Free Tier (S3 + EC2/Elastic Beanstalk)

### Backend (Elastic Beanstalk) - 12 Months Free

1. **Create EB Application**
   - AWS Console → Elastic Beanstalk → Create Application
   - Platform: Node.js
   - Upload `vault5/backend` as ZIP

2. **Environment Variables** (EB Console → Configuration → Software)
   ```bash
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/vault5
   JWT_SECRET=your-super-long-random-secret-here
   NODE_ENV=production
   ```

### Frontend (S3 + CloudFront) - 12 Months Free

1. **Build and Upload**
   ```bash
   cd vault5/frontend
   npm run build
   aws s3 sync build/ s3://your-bucket-name
   ```

2. **Enable Static Hosting**
   - S3 Console → Properties → Static website hosting
   - Index document: `index.html`

---

## 🔧 Post-Deployment Setup

### 1. Database Migration
After first deploy, run migration to set up 5-account system:
```bash
# Backend will auto-run migration on startup if MIGRATE_FIVE_ACCOUNTS=true
# Set this in your deployment platform's environment variables
```

### 2. Test Key Endpoints
```bash
# Health check
curl https://your-backend.com/

# Auth test
curl -X POST https://your-backend.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Accounts test
curl https://your-backend.com/api/accounts \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Enable Features
Set these environment variables to enable new features:
```bash
ENABLE_ADAPTIVE_SPEND=true
ENABLE_ACCOUNT_RULES=true
ENABLE_LENDING=true
ENABLE_TRANSFERS=true
ENABLE_PAYOUTS=true
```

---

## 📊 Performance Optimizations

### Frontend Optimizations
- ✅ React lazy loading + Suspense
- ✅ Tailwind CSS purging
- ✅ Image optimization
- ✅ Code splitting

### Backend Optimizations
- ✅ Compression middleware
- ✅ Helmet security headers
- ✅ CORS optimization
- ✅ Database connection pooling
- ✅ Response caching

---

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `CORS_ALLOWED_ORIGINS` includes your frontend domain
   - Redeploy backend after updating CORS

2. **Database Connection Failed**
   - Verify MongoDB Atlas IP whitelist (0.0.0.0/0 for all)
   - Check network access in Atlas dashboard
   - Test connection: `mongosh "your-mongo-uri"`

3. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies in package.json
   - Check build logs in deployment dashboard

4. **Memory Issues (Free Tier)**
   - Render/Railway free tier has memory limits
   - Consider upgrading if you hit limits frequently
   - Monitor usage in dashboard

5. **Cold Start Delays**
   - Free tier services sleep when inactive
   - First request after sleep may take 10-30 seconds
   - Consider pinging service every 5 minutes to keep warm

---

## 🔒 Security Checklist

- [ ] JWT_SECRET is long and random (48+ characters)
- [ ] MongoDB Atlas has strong password
- [ ] CORS restricted to your domains only
- [ ] Environment variables not committed to Git
- [ ] HTTPS enforced (automatic on most platforms)
- [ ] Database IP whitelist configured
- [ ] SMTP credentials use app passwords (not main password)

---

## 📈 Monitoring & Analytics

### Free Monitoring Options

1. **Railway/Netlify Dashboard**
   - Built-in analytics and logs
   - Performance metrics
   - Error tracking

2. **MongoDB Atlas**
   - Database performance
   - Query analytics
   - Real-time metrics

3. **External Services**
   - Sentry (free tier) for error tracking
   - Google Analytics for user behavior

---

## 🚀 Scaling Beyond Free Tier

When ready to scale:

1. **Database:** MongoDB Atlas paid clusters
2. **Backend:** Railway/Heroku paid dynos or AWS ECS
3. **Frontend:** Vercel/Netlify Pro plans
4. **CDN:** CloudFlare for global acceleration
5. **Monitoring:** DataDog/New Relic

---

## 📞 Support

- **GitHub Issues:** For deployment problems
- **Discord:** Community support
- **Documentation:** Check updated docs in `/vault5/docs/`

---

## 🎯 Quick Start Commands

```bash
# 1. Set up MongoDB Atlas (free)
# Visit mongodb.com/atlas → Create free cluster

# 2. Deploy Backend (choose one)
# Render: render.com → New Web Service
# Railway: railway.app → New Project
# Heroku: heroku create vault5-backend

# 3. Deploy Frontend (choose one)
# Vercel: vercel.com → New Project
# Netlify: netlify.com → New site from Git

# 4. Set environment variables (see sections above)

# 5. Test deployment
curl https://your-backend.com/
```

**Happy deploying! 🚀**