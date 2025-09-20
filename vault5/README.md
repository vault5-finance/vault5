# Vault5 — Financial Freedom Platform

[![Status](https://img.shields.io/badge/status-active-brightgreen.svg)](https://vault5.example.com)
[![Version](https://img.shields.io/badge/version-2.0.0--compliance-blue.svg)](#)
[![Stack](https://img.shields.io/badge/stack-Node%20%7C%20Express%20%7C%20MongoDB%20%7C%20React%20%7C%20Tailwind-blue)](#)
[![License](https://img.shields.io/badge/license-MIT-black)](#)
[![Security](https://img.shields.io/badge/security-helmet%20%7C%20rate--limit%20%7C%20audit%20logs-orange)](#)
[![Node](https://img.shields.io/badge/node-18+-green.svg)](#)
[![MongoDB](https://img.shields.io/badge/mongodb-6+-green.svg)](#)

> **Personal Bank + Financial Coach + Discipline Enforcer**

Vault5 is a comprehensive full-stack financial freedom platform that automates income allocation into 6 strategic accounts, enforces financial discipline through smart rules, implements PayPal-style account limitations with reserve holds and payout workflows, and prepares for SaaS rollout with multi-tenant capabilities.

**Mission**: Help users achieve financial freedom through rules-driven, accountable, and transparent money management.

## 🚀 Quick Start

```bash
# Clone and setup
git clone <repository-url>
cd vault5

# Backend setup
cd backend
npm install
cp .env.example .env  # Configure MONGO_URI, JWT_SECRET
npm run seed          # Seed admins and default policies
npm run dev          # Start on http://localhost:5000

# Frontend setup (new terminal)
cd ../frontend
npm install
npm start            # Start on http://localhost:3000
```

**Login Credentials** (from seed):
- Admin: `admin@vault5.com` / `Adminvault5`
- Super Admin: `bnyaliti@gmail.com` / `Admin`

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

## 📋 API Reference

### Core Endpoints

| Module | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| **Auth** | POST | `/api/auth/login` | User login with JWT |
| | POST | `/api/auth/register/step1-4` | Multi-step registration |
| | GET | `/api/auth/profile` | Get user profile |
| **Accounts** | GET | `/api/accounts` | List user accounts |
| | POST | `/api/accounts/income` | Add income (wallet/auto-distribute) |
| | PATCH | `/api/accounts/:id/flags` | Set wallet/auto-distribute flags |
| **Transactions** | GET | `/api/transactions` | List transactions |
| | POST | `/api/transactions` | Create transaction (with gates) |
| | GET | `/api/transactions/summary` | Transaction summary |
| **Reports** | GET | `/api/reports/dashboard` | Dashboard data |
| | GET | `/api/reports/cashflow` | Cashflow reports |
| **Loans** | GET | `/api/loans` | List loans |
| | POST | `/api/loans` | Create loan (eligibility gated) |
| | POST | `/api/loans/:id/repay` | Make repayment |
| **Lending** | GET | `/api/lending` | Lending history |
| | POST | `/api/lending` | Record lending transaction |

### Compliance Endpoints

#### User-Facing
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/compliance/status` | Get limitation status, reserves, payout eligibility |
| POST | `/api/compliance/kyc` | Submit KYC request with documents |
| GET | `/api/compliance/kyc` | List user's KYC requests |
| POST | `/api/compliance/payouts` | Request payout (after 180 days) |

#### Admin (Compliance Role Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/compliance/audit-logs` | Audit logs (JSON) |
| GET | `/api/admin/compliance/audit-logs.csv` | Audit logs (CSV export) |
| GET | `/api/admin/compliance/kyc` | KYC review queue |
| PATCH | `/api/admin/compliance/kyc/:id` | Approve/reject/more_info KYC |
| GET | `/api/admin/compliance/limitations` | List limitations |
| POST | `/api/admin/compliance/limitations` | Impose limitation + reserve |
| PATCH | `/api/admin/compliance/limitations/:id/lift` | Lift limitation |
| GET | `/api/admin/compliance/payouts` | Pending payouts |
| PATCH | `/api/admin/compliance/payouts/:id` | Approve/reject/pay payout |

#### Policy Management (Compliance Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/compliance/policies/geo` | Get geo allowlist |
| PATCH | `/api/admin/compliance/policies/geo` | Update geo policy |
| GET | `/api/admin/compliance/policies/ip` | Get IP denylist |
| PATCH | `/api/admin/compliance/policies/ip` | Update IP denylist |
| GET | `/api/admin/compliance/policies/device` | Get device rules |
| PATCH | `/api/admin/compliance/policies/device` | Update device rules |
| GET | `/api/admin/compliance/policies/tiers` | Get limit tiers |
| PATCH | `/api/admin/compliance/policies/tiers/:name` | Update tier limits |

### Request/Response Examples

**Add Income with Destination:**
```json
POST /api/accounts/income
{
  "amount": 50000,
  "description": "Salary",
  "tag": "salary",
  "destination": "auto"  // or "wallet"
}
```

**Impose Limitation:**
```json
POST /api/admin/compliance/limitations
{
  "userId": "64f...",
  "type": "temporary_180",
  "reason": "Suspicious activity"
}
```

**Update Geo Policy:**
```json
PATCH /api/admin/compliance/policies/geo
{
  "mode": "allowlist",
  "countries": ["KE", "US", "GB"]
}
```

### Authentication
- **Bearer Token**: `Authorization: Bearer <jwt_token>`
- **Admin Roles**: `super_admin`, `compliance_admin`, `finance_admin`, etc.
- **Rate Limits**: Auth endpoints: 20/15min, General: 100/15min

Source files:
- Routes index: [`routes/index.js`](backend/routes/index.js)
- Server mount: [`server.js`](backend/server.js)

---

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
# Database
MONGO_URI=mongodb://localhost:27017/vault5
# or for Atlas: mongodb+srv://user:pass@cluster.mongodb.net/vault5

# Authentication
JWT_SECRET=your_super_secure_jwt_secret_key_here
AUTH_REQUIRE_EMAIL_VERIFICATION=false  # Set to true in production

# Server
PORT=5000
NODE_ENV=development

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://vault5.com

# AWS (optional for secrets)
AWS_REGION=us-east-1
AWS_SECRETS_NAME=vault5/dev

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

#### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development
```

### Database Setup

1. **Local MongoDB**:
   ```bash
   brew install mongodb-community  # macOS
   # or download from mongodb.com for Windows/Linux
   mongod --dbpath /path/to/data
   ```

2. **MongoDB Atlas** (recommended for production):
   - Create cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
   - Get connection string and update `MONGO_URI`

3. **Seed Data**:
   ```bash
   cd backend
   node seed.js  # Creates admin users and default policies
   ```

## 🔒 Security & Compliance

### Security Features
- **Authentication**: JWT with bcrypt password hashing
- **Authorization**: Role-based access control (8 admin roles)
- **Rate Limiting**: Auth (20/15min), General (100/15min)
- **Security Headers**: Helmet, CORS, compression
- **Audit Logging**: All admin actions logged with IP/user-agent

### Compliance Gates
- **Geo Filtering**: Allowlist countries (default: KE)
- **IP Denylist**: CIDR-based blocking
- **Device Checks**: Cookie requirements, headless browser detection
- **Tiered Limits**: Daily/monthly caps by KYC level
- **Velocity Controls**: Transaction frequency monitoring
- **Loan Eligibility**: Tier2 + 90-day tenure + cooldown requirements

### Account Limitations (PayPal-style)
- **Types**: temporary_30, temporary_180, permanent
- **Reserve Logic**: 180-day holds on temp_180/permanent
- **Payout Flow**: Verified bank accounts only after hold period
- **Audit Trail**: Full history of limitation actions

### Data Protection
- **PII Handling**: Encrypted storage, minimal retention
- **Export Controls**: User data export/deletion capabilities
- **Regulatory Ready**: Designed for financial compliance frameworks

---

## 🗺️ Development Roadmap

### ✅ Completed (v2.0-compliance)
- **Phase A**: Data models and migrations (all compliance models implemented)
- **Phase B**: Backend middleware and enforcement (all gates working)
- **Core Features**: 6-vault allocation, wallet/auto-distribute, goals, loans, lending rules
- **Compliance System**: PayPal-style limitations, reserves, payouts, KYC workflow
- **Admin Consoles**: KYC queue, limitations management, audit logs, payout approvals
- **Policy Management**: Geo/IP/device rules, tier limits, all admin endpoints

### 🚧 In Progress
- **Phase C**: Frontend UX polish (limitation banners, wizards, mobile optimization)
- **Phase F**: Documentation (this README, API docs, policies handbook)

### 📋 Upcoming Phases
- **Phase D**: Analytics dashboards (KYC turnaround, caps/velocity metrics, eligibility rates)
- **Phase E**: Testing suite (unit, integration, e2e scenarios)
- **Phase F**: Performance profiling, feature flags for rollout
- **Phase G**: Multi-tenant SaaS features, API integrations
- **Phase H**: Mobile app development, advanced AI insights

### 🎯 Key Milestones
- **v2.1**: Complete user UX flows and mobile optimization
- **v2.2**: Analytics dashboards and reporting enhancements
- **v2.5**: Production deployment with feature flags
- **v3.0**: Multi-tenant SaaS with subscription management

See detailed roadmap: [`ROADMAP.md`](ROADMAP.md)

---

## Contributing

- Conventional commits (feat:, fix:, docs:, refactor:, chore:)
- Branching model: feature/*, hotfix/*
- PRs require passing lints/tests and short demo steps

---

## License

MIT © Vault5