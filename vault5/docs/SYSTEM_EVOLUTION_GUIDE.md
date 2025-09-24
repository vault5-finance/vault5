# Vault5 System Evolution Guide — What It Is, What Changed, What Will Change (2025)

Purpose
- Keep everyone aligned as Vault5 grows from a simple tracker into a personal bank + coach + discipline enforcer.
- Capture the current state, recent changes, planned changes, and decisions.
- Provide a step-by-step way to update the system without losing context.

How to Use This Guide
- Before any change, update the “Current State Snapshot” and “Planned Changes” sections.
- After each change, record in “Recent Changes Log” and update the “Decision Log”.
- When deprecating or pivoting, record it in “Deprecations & Removals”.

A. Current State Snapshot

1) Product Scope (now)
- Personal discipline system with auto-allocation across six vaults
- Goals & progress tracking; compliance colors (red/green/blue)
- Lending (rules, ledgers, caps), Loans, Investments
- Reports & analytics (dashboard; PDF/Excel)
- Notifications (missed deposits, surplus, goals, loans, lending)
- Public-facing landing + content pages
- Admin portal with role-based areas (super, finance, compliance, support, content, system)

2) Architecture (high-level)
- Frontend: React + TailwindCSS + React Router; Axios API client
- Backend: Node.js + Express + Mongoose (MongoDB)
- Security: JWT auth, 2FA with device trust, rate limiting, CORS whitelisting
- CI: GitHub Actions (tests + ZAP baseline); artifact reports
- Deployment: Frontend on Vercel; Backend on Render (Node)

3) Environments
- Development: localhost:3000 (frontend), localhost:5000 (backend)
- Production: Frontend (Vercel), Backend (Render). Frontend points to Render API via REACT_APP_API_URL.

B. Recent Changes Log (representative)
- Landing/Nav
  - Removed duplicate header from Landing; NavBar is the single source of truth
  - Removed public “Admin” link from NavBar
- Backend & Dev Experience
  - CORS enhanced to support wildcards and diagnostics
  - Added cross-platform port guard to auto-free :5000 before dev start
  - ZAP CI fixed: valid image, rules file, no issue writing; scans against https://vault5.vercel.app with -I
- Docs & Policies
  - Added PRODUCT_OVERVIEW (plain language), DOCUMENT_REGISTER, SECURITY, LEGAL-NOTES
  - Added legal templates: Terms, Privacy, Cookies, Acceptable Use, KYC/AML
  - Governance templates: Ownership & Equity Framework, Reinvestment Policy
  - Iteration and Evolution guides for step-by-step improvements

C. Planned Changes (near-term)
- Backend (Render operational hardening)
  - trust proxy: app.set('trust proxy', 1) to fix X-Forwarded-For / rate limit key generation
  - Optional: return 200 with compliance payload (instead of 451) to simplify UI
- Admin Finance Utility
  - Admin-only endpoint to credit income to a user by email, honoring allocation rules (for cases like Collins)
- Deployment consistency
  - Ensure Vercel REACT_APP_API_URL points to Render API URL
  - Ensure Render env CORS_ALLOWED_ORIGINS includes production frontend (vault5.vercel.app and variants)
- Documentation & Process
  - Define Engineering Handbook, Coding Standards, Contributing, and Secure SDLC (templates listed in Document Register)

D. Deprecations & Removals (log decisions)
- Public exposure of admin entry on landing is removed (security posture)
- Embedded landing headers are removed (single NavBar source of truth)

E. Decision Log (Architecture/Policy)
- ZAP Baseline Strategy
  - Use zaproxy/zap-stable; target production URL with -I for passive scan; no issue writing
- CORS Strategy
  - Wildcards and regex matching, with dev diagnostics; production origins defined in env
- Compliance UX Decision
  - If 451 complicates UI, prefer 200 + payload (“limited”, countdownMs, reserveReleaseAt) so UI can render clear states without try/catch flows
- Admin Portal Exposure
  - Hide admin login route behind feature flag; never expose in public nav

F. Area-by-Area Change Guide (edit surface map)

1) Frontend (Landing, Auth, Dashboard, Admin UI)
- Landing: pages/Landing.js; NavBar in components/NavBar.js
- Auth: pages/Login.js + TwoFactorModal.js; services/api.js for base URL and headers
- Dashboard & Pages: pages/Dashboard.js, AccountsCenter.js, Transactions.js, Reports.js
- Admin: pages/Admin*.js; components/AdminSidebar.js
- Practice:
  - Define outcome and acceptance criteria
  - Edit small; test locally; take screenshots
  - Update docs/User Guide if user-facing behavior changes

2) Backend (API, Middleware, Models)
- Routes: backend/routes/*.js
- Controllers/Services: backend/controllers/* or feature services
- Middleware: backend/middleware/* (rateLimit, auth, compliance gates)
- Models: backend/models/*.js
- Practice:
  - Add validation and error messages
  - Include rate limit & auth checks
  - Consider flags (dev vs prod) where appropriate

3) Data & Schema Changes
- Update Mongoose models; add migrations/checks if needed
- Version response shapes; add fallback for old clients where possible

4) CI/CD & Deployments
- Update workflow files in .github/workflows
- Keep zap-baseline.conf current
- Vercel: update REACT_APP_API_URL and clear build cache when endpoints change
- Render: update env and redeploy with cache cleared

5) Documents & Policies
- Update PRODUCT_OVERVIEW for major UX shifts
- Update DOCUMENT_REGISTER with Created/Draft/Planned status
- Commit legal templates but only publish after counsel review

G. Update Process (step-by-step)
1) Start a small RFC in the PR description (1–2 paragraphs)
2) Add acceptance criteria (bulleted)
3) Identify impacted layers (UI, API, model, docs)
4) Implement in small steps:
   - schema → API → UI → docs
5) Validate with local + CI + production checks
6) Record in Recent Changes and Decision Log
7) Update Document Register

H. Operational Notes from Production (Render log)
- trust proxy error for rate limiting
  - Symptom: ERR_ERL_UNEXPECTED_X_FORWARDED_FOR in express-rate-limit
  - Fix: app.set('trust proxy', 1) in server.js (ideally in production)
- Multiple 451 responses (compliance)
  - Ensure frontend gracefully handles or switch backend to return 200 with limitation payload
- Port Binding on Render
  - Render uses dynamic PORT (e.g., 10000). Ensure server listens on process.env.PORT

I. Templates

Acceptance Criteria (example)
- User can view compliance banner with countdown and reserve date
- API returns limitation status in a payload (no 451) and UI updates without error
- Admin route is not visible on public pages
- CI passes ZAP baseline with WARN only

PR Body Template
- Summary
- Acceptance Criteria
- Changes by Layer
- Tests & Evidence
- Rollback Plan

J. Where to Find Things
- Frontend entry → frontend/src/App.js
- API client → frontend/src/services/api.js
- NavBar → frontend/src/components/NavBar.js
- Backend app → backend/server.js
- Routes → backend/routes/*
- Middleware → backend/middleware/*
- Models → backend/models/*
- Docs → docs/*
- Document Register → docs/DOCUMENT_REGISTER.md

K. Ownership
- The founder is the primary owner of product direction and accepts/rejects plans.
- Maintain this guide alongside DOCUMENT_REGISTER so the team never loses context.
