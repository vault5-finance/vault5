# Vault5 Deployment Guide (Free Tier Friendly)

This guide sets up:
- Backend API on Render (free Web Service).
- Frontend React app on Vercel (free).

Why this split?
- Vercel free tier is excellent for static/frontend hosting and serverless APIs, but long-running Express backends are simpler to host on Render (free dyno) without major code changes.

Prerequisites
- GitHub repository connected (push triggers deploys).
- MongoDB Atlas free cluster (or a reachable MongoDB URI).
- Basic secrets (JWT secret).

Repo layout
- Frontend: vault5/frontend (Create React App)
- Backend: vault5/backend (Express + Mongoose)

1) Backend (Render) — Free Web Service
a. Create service
- Go to https://render.com -> New -> Web Service -> Connect your GitHub repo.
- Root directory: vault5/backend
- Runtime: Node
- Build Command: npm install
- Start Command: npm start

b. Environment variables (Render Settings -> Environment)
Use the following values for this project. Replace placeholders in angle brackets with your real credentials (do not include the brackets).

Required (Backend)
- MONGO_URI = mongodb+srv://<username>:<password>@<cluster>.mongodb.net/vault5?retryWrites=true&w=majority&appName=<appName>
  Example: mongodb+srv://vault5_admin:S3cureP@ss!@cluster0.abcde.mongodb.net/vault5?retryWrites=true&w=majority&appName=vault5-prod

- JWT_SECRET = <any-long-random-secret>
  Generate one (Mac/Linux): openssl rand -base64 48
  Generate one (Node REPL): require('crypto').randomBytes(48).toString('base64')

- NODE_ENV = production

CORS (Backend)
- CORS_ALLOWED_ORIGINS = https://<your-vercel-domain>.vercel.app
  Example after deploying frontend: https://vault5-frontend.vercel.app
  Note: You may temporarily use * during first-time testing, but restrict it to your Vercel domain for production.

Optional (Local dev fallback)
- If you want to use local MongoDB during development: MONGO_URI = mongodb://localhost:27017/vault5
- PORT = 5000 (only if you need to override default)

Frontend (Vercel Project Settings -> Environment Variables)
- REACT_APP_API_URL = https://<your-render-backend>.onrender.com
  Example: https://vault5-backend.onrender.com

c. Disk/Networking
- No persistent disk needed.
- Keep free plan.

d. Deploy
- Click Deploy.
- Note the Render service URL, e.g. https://vault5-backend.onrender.com
- Test: https://vault5-backend.onrender.com/ should return JSON: “Vault5 Backend API is running!”

2) Frontend (Vercel) — Free Static (React) Hosting
a. Prepare frontend env
- Create vault5/frontend/.env (Vercel will manage this online, but for local testing you can use):
  REACT_APP_API_URL=https://vault5-backend.onrender.com

- In repo already: src/services/api.js reads REACT_APP_API_URL, falling back to localhost.

b. Import project
- Go to https://vercel.com -> New Project -> Import from GitHub.
- Root directory: vault5/frontend
- Framework Preset: Create React App
- Build Command: npm run build (auto)
- Output Directory: build (auto)

c. Vercel Environment Variables (Project Settings -> Environment Variables)
- REACT_APP_API_URL = https://vault5-backend.onrender.com
- Scope: Production (and Preview if needed)

d. Deploy
- Deploy once variables are set.
- Note the Vercel domain, e.g. https://vault5-frontend.vercel.app
- Update CORS_ALLOWED_ORIGINS on Render to include this domain, then redeploy backend.

3) Verify Integration
- Open Vercel URL and log in with seeded account or create a new account.
- Confirm API calls use the Render URL by inspecting network requests (should hit https://vault5-backend.onrender.com/api/...).

4) Performance Optimizations Done
- Frontend:
  - React code-splitting with lazy() + Suspense: routes are loaded on demand.
  - Tailwind safelist to keep dynamic admin color classes from being purged (reduces runtime recomputation and avoids FOUC).
- Backend:
  - Compression and Helmet enabled for GZIP and secure headers.
  - Static uploads served with caching hints.
  - CORS narrowed via CORS_ALLOWED_ORIGINS env var.

5) Optional Local Dev
- Backend: cd vault5/backend && npm install && npm run dev (PORT=5000)
- Frontend: cd vault5/frontend && npm install && npm start (proxy is set for localhost)

6) GitHub Workflow
- Push any changes:
  - git add -A
  - git commit -m "Deploy: admin user mgmt, legal pages, perf (lazy+gzip+helmet)"
  - git push
- Render auto-deploys backend.
- Vercel auto-deploys frontend.

7) Troubleshooting
- CORS: If you get CORS errors on Vercel, ensure Render’s CORS_ALLOWED_ORIGINS includes your Vercel URL, and that frontend REACT_APP_API_URL points to Render backend.
- Env propagation: After updating env vars, redeploy the service.
- Slow first load on Render: Free instances may cold-start. Subsequent requests will be faster.
- Tailwind classes not applied for admin sidebar: Already safelisted.

8) Free-tier Notes
- Render free dynos can sleep; first request might be slow (cold start).
- Vercel serves static frontend without cold start. API roundtrips to Render may occasionally cold-start.

9) Security Notes
- Do not commit real secrets. Keep using .env and Render/Vercel variable managers.
- JWT_SECRET should be long and random.
- As you scale, consider dedicated plans or container hosting for the backend and a managed secret store.

Appendix: Minimal Variables Recap
Backend (Render):
- MONGO_URI
- JWT_SECRET
- NODE_ENV=production
- CORS_ALLOWED_ORIGINS=https://your-vercel-domain.vercel.app

Frontend (Vercel):
- REACT_APP_API_URL=https://your-render-backend.onrender.com