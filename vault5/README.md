# Vault5 — Financial Freedom Platform

[![Status](https://img.shields.io/badge/status-active-brightgreen.svg)](https://vault5.example.com)
[![Stack](https://img.shields.io/badge/stack-Node%20%7C%20Express%20%7C%20MongoDB%20%7C%20React%20%7C%20Tailwind-blue)](#)
[![License](https://img.shields.io/badge/license-MIT-black)](#)
[![Security](https://img.shields.io/badge/security-helmet%20%7C%20rate--limit%20%7C%20audit%20logs-orange)](#)

Vault5 is a full‑stack system that acts as a personal bank + financial coach + discipline enforcer. It automates allocations into 6 accounts, tracks goals & loans, enforces lending rules, implements PayPal‑style account limitations with reserves and payouts, and prepares for SaaS rollout.

Mission: help users get to financial freedom with a rules‑driven, accountable, and transparent experience.

---

## Highlights

- Six‑vault allocation engine (Daily, Emergency, Investment/Wealth, Long‑Term, Fun, Charity)
- Wallet vs Auto‑Distribute income routing
- Goals, Loans, Investments modules
- Lending rules and ledgers
- Reports & analytics (dashboard, cashflow, audit logs)
- Compliance & limitations (temporary_30, temporary_180, permanent), 180‑day reserve logic and payout to verified bank
- Geo/IP/Device gates, tiered caps, velocity rules, loan eligibility gating
- Admin consoles, audit logs, legal center, policy updates

---

## Architecture (Monolith-first, Microservices-aware)

```mermaid
flowchart LR
  subgraph Client [Frontend (React + Tailwind)]
    A[Dashboard] --> B[Reports]
    A --> C[Compliance Center]
    A --> D[Lending/Loans/Investments]
    A --> E[Settings/Profile]
  end

  subgraph Server [Backend (Node + Express + MongoDB)]
    R1[/Routes: auth, accounts, transactions, reports, loans, lending, investments, compliance, admin/]
    C1[Controllers & Middleware]
    M1[(MongoDB)]
    R1 --> C1
    C1 --> M1
  end

  subgraph Admin [Admin Consoles]
    AC[Admin Index] --> ACC[Accounts Admin]
    AC --> CMP[Compliance Admin]
    AC --> FIN[Finance Admin]
    AC --> SYS[System Admin]
  end

  Client <--> Server
  Admin <--> Server
```

---

## Screenshots (placeholders)

- Dashboard: allocations, recent transactions, quick actions
- Compliance Center: limitation banner, reserve details, KYC, payout wizard
- Admin Compliance: audit logs, impose/lift limitations, KYC queue, payouts

_Add your screenshots to `/frontend/public/` and link them here._

---

## Tech Stack

- Backend: Node.js, Express, Mongoose, JWT, bcrypt, helmet, compression
- Frontend: React, TailwindCSS, React Router, Chart.js, Axios
- Database: MongoDB
- Exports: pdfkit (PDF), exceljs (Excel)
- Tooling: audit logger, feature flags (incremental), rate‑limit middleware (extensible)

---

## Project Structure

```
vault5/
  backend/
    controllers/
    middleware/
    models/
    routes/
    server.js
    seed.js
  frontend/
    src/
      pages/
      components/
      services/
      App.js
    public/
  docs/
    (add policies, limits, kyc, risk, admin-handbook, api)
```

Key files:
- Backend server bootstrap: [server.js](backend/server.js)
- Reports controller (dashboard payload): [reportsController.js](backend/controllers/reportsController.js)
- Accounts controller (allocation engine, wallet vs auto): [accountsController.js](backend/controllers/accountsController.js)
- Compliance middleware gates (geo/ip/device/limits/caps/velocity/loans): [compliance.js](backend/middleware/compliance.js)
- Compliance routes (user-facing): [compliance.js](backend/routes/compliance.js)
- Admin compliance routes (audit/KYC/limitations/payouts): [adminCompliance.js](backend/routes/adminCompliance.js)
- Compliance models (limitations, reserves, payouts, tiers, risk): [Compliance.js](backend/models/Compliance.js)
- Frontend Compliance Center page: [ComplianceCenter.js](frontend/src/pages/ComplianceCenter.js)
- Navigation with Compliance Banner: [NavBar.js](frontend/src/components/NavBar.js)
- Dashboard page (wallet totals, add income destination): [Dashboard.js](frontend/src/pages/Dashboard.js)

---

## Core Features

1) Authentication & User Management
- JWT auth, user profiles, roles (user, content_admin, support_admin, account_admin, compliance_admin, finance_admin, system_admin, super_admin)
- RBAC & audit logging for critical actions
- File: [User.js](backend/models/User.js)

2) Six-Vault Accounts & Allocation Engine
- Default: Daily(50%), Emergency(10%), Investment(20%), Long‑Term(10%), Fun(5%), Charity(5)
- Customizable percentages, status colors: red (shortfall), green (on target), blue (surplus)
- Wallet vs Auto‑Distribute income routing; tagged income bypasses allocation
- Files: [Account.js](backend/models/Account.js), [accountsController.js](backend/controllers/accountsController.js)

3) Goals & Discipline
- Set goals per account; progress bars and notifications
- Shortfall debt ledgers and surplus tracking (extensible in reports)

4) Income Tagging
- Tagged entries logged into reports but bypass distribution

5) Lending & Borrowing (Mini-bank logic)
- Requests by family/friends; emergency vs non‑emergency
- Pull funds suggestions (50% Fun, 30% Charity, 20% Daily) with guardrails
- Caps for non‑repay lendings per period; lending ledger (outstanding/repaid/written‑off)

6) Reports & Analytics
- Dashboard health score, allocation compliance, lending metrics
- Cashflow reports, missed deposits, debt/surplus histories, PDF/Excel exports
- Files: [reportsController.js](backend/controllers/reportsController.js)

7) Investments Module
- CRUD for assets (T‑Bills/MMFs/stocks/rentals/custom), returns & timelines (extensible)

8) Loans Module
- Track principal/repayments/frequency; auto‑deduction; remaining balance & progress
- Loan eligibility gating (Tier2 + ≥90 days + cooldown + on‑time% placeholder)
- Files: [loans.js](backend/routes/loans.js)

9) Settings & Accounts Management
- Adjust allocation %, Link accounts (M‑Pesa, Equity, KCB…), Notifications & lending rules
- Wallet vs Auto‑Distribute preferences in Settings
- File: [Settings.js](frontend/src/pages/Settings.js)

10) Notifications System
- Alerts for missed deposits, surpluses, goals, lendings, loans

11) Public-Facing Features
- Landing, blog/articles, legal center, policy updates, SaaS signup flow

12) Mobile-First Design
- Tailwind responsive layouts; optimized charts

---

## Compliance & Limitations (PayPal-style)

Capabilities
- Limitation types: temporary_30, temporary_180 (reserve), permanent
- Reserve holds at limitation impose; payout to verified bank after 180 days
- Geo allowlist (KE), IP denylist (CIDR), basic device checks (cookies, non‑headless)
- Tiered caps by KYC Tier0/1/2 (daily/monthly), velocity counters
- Outgoing money movement blocked under limitation; incoming income allowed
- Loan gating: Tier2 + ≥90 days + 30‑day cooldown + on‑time rate (placeholder)

Key endpoints
- User
  - GET /api/compliance/status
  - POST /api/compliance/kyc
  - GET /api/compliance/kyc
  - POST /api/compliance/payouts
- Admin (Compliance)
  - GET /api/admin/compliance/audit-logs (+ .csv)
  - GET /api/admin/compliance/kyc, PATCH /api/admin/compliance/kyc/:id (approve/reject/more_info)
  - GET /api/admin/compliance/limitations, POST /api/admin/compliance/limitations, PATCH /limitations/:id/lift
  - GET /api/admin/compliance/payouts, PATCH /api/admin/compliance/payouts/:id

Core files:
- Gates: [compliance.js](backend/middleware/compliance.js)
- Admin routes: [adminCompliance.js](backend/routes/adminCompliance.js)
- Models: [Compliance.js](backend/models/Compliance.js)

Frontend UX
- Global compliance banner in NavBar
- Compliance Center page: KYC wizard, reserve table, payout wizard
- Routes wired: [App.js](frontend/src/App.js)

---

## Getting Started

Prerequisites
- Node 18+
- MongoDB 6+
- Yarn or npm

Setup
1) Install dependencies
```
cd vault5/backend && npm install
cd ../frontend && npm install
```

2) Configure environment
- Copy backend/.env.example to backend/.env and set:
  - MONGO_URI, JWT_SECRET, CORS_ALLOWED_ORIGINS, etc.

3) Seed initial data (admins, default tiers/policies, wallet backfill)
```
cd vault5/backend
node seed.js
```

4) Run dev servers
- Backend:
```
cd vault5/backend
npm run dev
```
- Frontend:
```
cd vault5/frontend
npm start
```

5) Login and explore
- Visit http://localhost:3000
- Create account or use seeded admin (see seed script), then explore Dashboard → Compliance.

---

## API Map (Selected)

- Accounts: GET /api/accounts, POST /api/accounts/income
- Transactions: GET/POST/PUT/DELETE /api/transactions
- Reports: GET /api/reports/dashboard, GET /api/reports/cashflow
- Loans: GET/POST /api/loans, POST /api/loans/:id/repay
- Lending: GET/POST /api/lending (extensible)
- Compliance (user): see above
- Compliance (admin): see above

Source indices:
- Routes index: [routes/index.js](backend/routes/index.js)
- Server mount: [server.js](backend/server.js)

---

## Security & Compliance

- JWT auth, role‑based admin access
- Helmet, CORS, compression
- Audit logs for admin actions
- Geo/IP/Device gates, tiered caps & velocity (extensible)
- Reserve & payout flows designed for regulatory hold windows

---

## Roadmap (High-level)

- Phase B: Admin consoles (KYC queue, limitations console, policies editors), payout console
- Phase C: User UX polish (limitation banner, wizards), mobile touch-ups
- Phase D: Analytics dashboards (KYC SLAs, caps/velocity hits, eligibility rates)
- Phase E: Documentation set (Policies, Limits, KYC, Risk, Admin Handbook, API)
- Phase F: Tests (unit/integration/e2e), performance profiling, feature flags

See: [ROADMAP.md](ROADMAP.md)

---

## Contributing

- Conventional commits (feat:, fix:, docs:, refactor:, chore:)
- Branching model: feature/*, hotfix/*
- PRs require passing lints/tests and short demo steps

---

## License

MIT © Vault5