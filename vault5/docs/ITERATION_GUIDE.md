# Vault5 Iteration Guide — How to Improve the System Step by Step (2025)

Purpose
- Give a clear, repeatable way to plan and implement changes across the whole product.
- Make edits easy by knowing exactly where to change code, in what order, and how to validate.

Scope
- Frontend (Landing, Auth, Dashboard, Pages, Components)
- Admin (Admin pages, RBAC UI, management tools)
- Backend (Auth, Accounts & Allocations, Lending, Investments, Loans, Reports, Notifications, Compliance)
- Data model (Mongo schemas)
- API & Contracts (endpoints, request/response shapes)
- Infrastructure & CI (builds, security scans, deployment)
- Documents (user-facing docs, legal/policies, operational runbooks)

How to Use this Guide
- Pick a target area (e.g., Dashboard chart, Lending rule).
- Follow the “Area Checklist” below.
- Use the “Change Pattern” to keep work small and safe.
- Validate with “Acceptance Criteria” and “Test Checklist”.
- Update [DOCUMENT_REGISTER.md](./DOCUMENT_REGISTER.md) when docs or policies change.

Change Pattern (Small, Safe, Repeatable)
1) Define the outcome in plain language.
2) Create acceptance criteria (2–5 bullet points of what “done” means).
3) Identify the affected layers (pages/components, API endpoints, schemas).
4) Make changes in small PRs by layer:
   - Data model
   - Backend API
   - Frontend UI
   - Docs
5) Test each layer (unit/integration/manual), then end-to-end.
6) Update docs and register.
7) Deploy with a plan (clear cache if needed) and confirm.

Branch & PR Template (Recommendation)
- Branch: feature/area-short-title or fix/area-short-title
- PR Title: [Area] Short Description
- PR Body:
  - Summary
  - Acceptance Criteria (checklist)
  - Changes by Layer (model, API, UI, docs)
  - Test Evidence (screenshots/logs)
  - Rollback Plan

Acceptance Criteria Template
- The user can …
- The admin can …
- The system updates …
- The UI shows …
- No regressions in …

Test Checklist (Minimum)
- Backend unit test or manual API run
- Frontend interaction (local + screenshot)
- E2E happy path (login → action → result)
- Negative path or rate limit edge case (if applicable)
- Deployment verification (production URL + console/network checks)

Feature Flags & Config
- If risky, put behind a flag (env variable or config constant).
- Default to “off” in production until validated.
- Document flags in README or CONFIG NOTES.

Area Checklists and Edit Map

A) Landing & Marketing
- Typical changes: messaging, sections, CTAs, legal footer.
- Frontend files:
  - Page → frontend/src/pages/Landing.js
  - Global nav/footer → frontend/src/components/NavBar.js and footer blocks in pages
- Checklist:
  - Confirm links (About, Blog, Legal, Terms, Privacy) work and reflect policy docs
  - Avoid exposing admin links publicly
  - Mobile and desktop layouts
  - Lighthouse sanity check (performance/accessibility)
- Acceptance examples:
  - Admin link hidden on public landing
  - Duplication removed; NavBar is single source of truth

B) Authentication (User)
- Typical changes: login/signup flow, 2FA, device trust.
- Frontend files:
  - Pages → frontend/src/pages/Login.js, Signup*.js
  - Modals → frontend/src/components/TwoFactorModal.js, OTP components
  - API → frontend/src/services/api.js
- Backend files:
  - Routes → backend/routes/auth.js
  - Controllers → backend/controllers/authController.js
  - Middleware → backend/middleware/rateLimit.js, backend/middleware/auth.js
- Checklist:
  - Update validation and messages
  - Respect device trust and 2FA paths
  - Rate limits safe and “trust proxy” enabled in production
  - Tokens stored/cleared properly
- Acceptance examples:
  - Valid credentials succeed; invalid rejected
  - 2FA path returns tempToken, verify endpoint returns full token
  - Rate limit headers present without server errors

C) Dashboard & Core Pages (User)
- Typical changes: widgets, charts, add funds, transactions list.
- Frontend files:
  - Pages → frontend/src/pages/Dashboard.js, AccountsCenter.js, Transactions.js, Reports.js
  - Components → charts, modals, progress bars
- Backend files:
  - Reports → backend/routes/reports.js (+ controllers)
  - Transactions → backend/routes/transactions.js (+ controllers)
  - Accounts → backend/routes/accounts.js (+ controllers)
- Checklist:
  - Update cards/charts and ensure API contracts match
  - Pagination/filters work
  - Export functions (PDF/Excel) if applicable
- Acceptance examples:
  - Chart renders valid series
  - Transaction list updates after add funds
  - Export downloads correct file

D) Accounts & Allocation Engine
- Typical changes: percentages, goal targets, compliance colors (red/green/blue).
- Backend files:
  - Allocation logic → controllers/services under backend (transactions/allocations)
  - Models → backend/models/Account.js, Transaction.js
- Frontend files:
  - Settings/Accounts → frontend/src/pages/Settings.js, AccountsCenter.js
- Checklist:
  - New percentages saved and applied on next income entry
  - Compliance computed: target, shortfall (red), surplus (blue)
  - Goal progress bars update
- Acceptance examples:
  - Income allocation matches defined percentages
  - Shortfall ledger increases only when missed
  - Surplus tracked and displayed

E) Lending (Mini-Bank Rules)
- Typical changes: rule parameters, source-of-funds mix, limits per period, ledger UI.
- Backend files:
  - Routes → backend/routes/lending.js (+ controllers)
  - Models → backend/models/Lending.js
- Frontend files:
  - Page → frontend/src/pages/Lending.js
  - Modal → frontend/src/components/ContactBasedLendingModal.js
- Checklist:
  - Safe source mix (e.g., Fun/Charity/Daily) respected by default
  - Caps enforced for non-repay events per period
  - Ledger shows outstanding vs gifts; repayments recorded
- Acceptance examples:
  - Over-limit request suggests safe maximum
  - History filters (month/quarter/year) work

F) Investments & Loans
- Typical changes: CRUD, growth display, repayment schedule, auto-deduct from designated account.
- Backend files:
  - Investments → backend/routes/investments.js (+ models/controllers)
  - Loans → backend/routes/loans.js (+ models/controllers)
- Frontend files:
  - Investments → frontend/src/pages/Investments.js
  - Loans → frontend/src/pages/Loans.js
- Checklist:
  - CRUD validation
  - Calculations correct (growth/interest/repayments)
  - UI progress aligns with backend numbers
- Acceptance examples:
  - Create+Update+Delete flows work
  - Loan repayment reduces balance as expected

G) Admin
- Typical changes: dashboards, user management, compliance panels, content pages.
- Frontend files:
  - Admin pages → frontend/src/pages/Admin*.js
  - Admin nav → frontend/src/components/AdminSidebar.js
- Backend files:
  - Admin routes → backend/routes (admin*, compliance, finance, content, system)
- Checklist:
  - RBAC: admins only; users redirected away
  - Bulk actions safe with confirmations
  - Audit logs for sensitive changes
- Acceptance examples:
  - Non-admin blocked from admin routes
  - Admin panel loads users and updates roles safely

H) Notifications & Compliance
- Backend → backend/routes/notifications.js, compliance routes/middleware
- Frontend → frontend/src/pages/Notifications.js; compliance banners in NavBar
- Checklist:
  - Notification fetch limited/paginated
  - Compliance 451 handling: consider returning 200 with status payload for UI
- Acceptance examples:
  - Banner reflects limitation types (temporary_30/180, permanent)
  - “Request Payout” CTA appears when eligible

I) Infrastructure & CI
- GitHub Actions → .github/workflows/*
- ZAP/DAST config → zap-baseline.conf
- Render/Vercel envs
- Checklist:
  - ZAP image and flags correct; rules file present
  - Vercel REACT_APP_API_URL points to Render backend
  - Render trust proxy configured
- Acceptance examples:
  - CI passes, ZAP warns only
  - Production frontend calls production backend (Network tab confirms)

J) Documents
- When changing product, legal, or policy, update:
  - Product overview → docs/PRODUCT_OVERVIEW.md
  - Document register → docs/DOCUMENT_REGISTER.md
  - Legal templates as needed
  - Project/Docs README quick links

Step-by-Step Example: Adjust Lending Caps
1) Define: Limit non-repayable lendings to 2 per month.
2) Accept: a) UI shows current count; b) Requests beyond cap suggest safe maximum; c) Ledger updated; d) Tests pass.
3) Backend: Update lending controller/rules, add tests.
4) Frontend: Show cap/remaining; enforce in modal; display messages.
5) Docs: Update FEATURES.md and USER_GUIDE.md (lending section).
6) Deploy: Clear frontend cache in Vercel; confirm behavior in production.

Step-by-Step Example: Add Funds Flow Improvement
1) Define: Add “Add Funds” shortcuts for preset amounts.
2) Accept: a) Presets visible; b) Income allocation applies; c) Compliance updates; d) Dashboard refreshes.
3) Backend: No changes if using existing income endpoint.
4) Frontend: Update AddFunds modal and Dashboard refresh logic.
5) Docs: Update product overview (optional) and user guide.
6) Deploy: Validate end-to-end.

Common Pitfalls
- Changing response shapes without frontend updates (update service types and selectors).
- Adding rate limits without “trust proxy” in production (Render needs app.set('trust proxy', 1)).
- 451 compliance responses: UI must handle; consider returning 200 with payload for smoother UX.

Where to Ask Questions in Code
- Backend middleware and routes index → backend/middleware and backend/routes
- Models → backend/models/*.js
- Frontend services → frontend/src/services/api.js
- Frontend pages/components → frontend/src/pages/* and frontend/src/components/*

Keep this Guide Current
- If you change a process or add an area, update this guide.
- When updating docs, also update [DOCUMENT_REGISTER.md](./DOCUMENT_REGISTER.md).
---

# Loans MVP Implementation Plan — P2P Lending v2

Scope
- Deliver privacy-first one-to-one P2P loans with eligibility checks, escrow-based approvals, flexible schedules, auto-deductions, and immutable audit trails.
- Align with APIs added in [API_DOCUMENTATION.md](vault5/docs/API_DOCUMENTATION.md) and architecture in [SYSTEM_DESIGN_DOCUMENT.md](vault5/docs/SYSTEM_DESIGN_DOCUMENT.md).

A. Backend implementation blueprint

1) Data models (Mongo/Mongoose)
- Loan model (new)
  - Fields: borrowerId, lenderId, principal, interestRate, currency, status, totalAmount, remainingAmount, nextPaymentDate, nextPaymentAmount, repaymentSchedule[], autoDeduct, accountDeductionId, purpose, notes, protectionScore, riskFlags[], borrowerCreditScoreAtRequest, lenderLimitAtApproval, borrowerLimitAtApproval, escrowId, escrowStatus, coolingOffExpiry, auditTrailRef, createdAt, updatedAt.
  - Indexes: borrowerId+status, lenderId+status, nextPaymentDate, createdAt.
- Escrow model (new)
  - loanId, amountHeld, holdStatus, holderAccount, disbursementTxId, refundTxId, createdAt, releasedAt, protectionDetails.
  - Indexes: loanId, holdStatus.
- Eligibility snapshots (optional collection) to cache last computed pair eligibility keyed by borrowerId+lenderKey with TTL.

2) Services and middleware
- EligibilityEngine service
  - Input: borrowerId, target contact or user lookup, amount?
  - Output: { maxBorrowableForThisPair, suggestedAmount, protectionScore, requiredVerification[], responseTimeHint }
  - Enforce privacy: never query or return raw balances; rely on server-side computed caps only.
- EscrowService
  - placeHold(lenderId, amount) -> { escrowId, journalEntryId }
  - disburse(escrowId, borrowerId) -> { disbursementTxId }
  - refund(escrowId) -> { refundTxId }
  - All money moves must create atomic journal entries in ledger.
- Idempotency middleware
  - Read Idempotency-Key from header for POST create, approve, repay, reschedule, writeoff. Store request hash and result keyed by userId+route+idempotencyKey for 24h.
- Re-auth and 2FA guard
  - Password verification on approvals; 2FA if amount ≥ configured threshold (ENV: LOANS_2FA_THRESHOLD).
- KYC and policy guard
  - Validate KYC tier against requested principal; enforce 75 percent rule, daily borrow limit, one-loan-per-lender, cooling-off rules.

3) Routes (loans module)
- Loans routes (new file): [backend/routes/loans.js](vault5/backend/routes/loans.js)
  - GET /api/loans → list borrowed[], lent[], summary
  - POST /api/loans → create request
  - GET /api/loans/:id → get details (role-aware redaction)
  - POST /api/loans/:id/approve → lender approval (password + 2FA)
  - POST /api/loans/:id/decline → lender decline
  - POST /api/loans/:id/repay → borrower repayment
  - POST /api/loans/:id/reschedule → propose new schedule (approval flow)
  - POST /api/loans/:id/writeoff → admin/lender special mode
  - POST /api/lending/eligibility-check → privacy-safe eligibility
- Controllers: [backend/controllers/loansController.js](vault5/backend/controllers/loansController.js)
  - Implement handlers per route; all POST routes wrapped by idempotency middleware.
- Middleware
  - [backend/middleware/idempotency.js](vault5/backend/middleware/idempotency.js)
  - [backend/middleware/reAuth2FA.js](vault5/backend/middleware/reAuth2FA.js)
  - [backend/middleware/policyGuard.js](vault5/backend/middleware/policyGuard.js)

4) Ledger and audit
- Reuse journal functions in [audit.js](vault5/backend/utils/audit.js) or extend to support types: loan_hold, loan_disburse, loan_repay, loan_refund, loan_writeoff.
- All money movement is atomic: DB transaction boundary includes loan update + ledger entry + escrow doc update.

5) Scheduler worker
- File: [backend/scripts/loans-auto-deduct.js](vault5/backend/scripts/loans-auto-deduct.js)
- Runs every hour (or cron at 06:00): query due loans (status active, nextPaymentDate ≤ now, autoDeduct true).
- Attempt debit from borrower account (Daily by default or configured account). Use idempotency key loanId+dueDate.
- If success: create repayment ledger entries; credit lender; update schedule; compute nextPayment.
- If fail: schedule retries (e.g., 3 attempts over 72h) with exponential backoff; mark overdue if threshold exceeded; notify borrower and lender.

6) Notifications (templates and triggers)
- Types:
  - LOAN_REQUESTED, LOAN_APPROVED, LOAN_DECLINED, LOAN_DISBURSED, REPAYMENT_DUE, REPAYMENT_SUCCESS, AUTO_DEDUCTION_FAILED, LOAN_REPAID, LOAN_DEFAULTED
- Trigger points:
  - Request creation, approval/decline, disbursement done, 3 days before due, after deduction success/failure, when repaid/defaulted.
- Channel selection via preferences; in-app always, email/sms optional.

7) Security and privacy
- Never include any counterparty balance in payloads. Instead, include { maxAllowed, lenderSpecificLimit } as numeric caps.
- Masked contacts for counterparty fields.
- 2FA enforcement tied to LOANS_2FA_THRESHOLD; configurable per environment.
- Rate-limit approvals and repayments endpoints.

8) Configuration (ENV)
- LOANS_2FA_THRESHOLD (e.g., 10000 KES)
- LOANS_DAILY_LIMIT (default 1)
- LOANS_COOLING_HOURS (48)
- LOANS_MAX_RETRY (3)
- LOANS_RETRY_BACKOFF (e.g., 12h)
- IDEMPOTENCY_TTL_HOURS (24)

B. Frontend implementation blueprint

1) Pages and components
- Loans & Lending page: [frontend/src/pages/Loans.js](vault5/frontend/src/pages/Loans.js) & [frontend/src/pages/Lending.js](vault5/frontend/src/pages/Lending.js)
  - Tabs Borrow/Lend/All; summary cards; list cards; filters; skeletons.
- LoanRequestWizard: multi-step modal
  - Step 1: contact entry/selector
  - Step 2: eligibility skeleton + summary (maxBorrowable, recommended, risk factors)
  - Step 3: amount + schedule; show repayment preview and fees
  - Step 4: confirm and submit (cooling-off copy)
- LenderApprovalModal
  - Redacted profile, eligibility summary, password + 2FA, options for immediate or scheduled disbursement.
- LoanDetail view with repayment calendar and history; MakeRepaymentModal.
- Reusable chips/pills: EligibilityBadge, ProtectionScore, EscrowStatus pill, FeeBreakdown.

2) State and API integration
- Services: [frontend/src/services/api.js](vault5/frontend/src/services/api.js)
  - Implement methods: loans.list, loans.create, loans.get, loans.approve, loans.decline, loans.repay, loans.reschedule, loans.writeoff, lending.eligibilityCheck.
  - Always pass Idempotency-Key header for POST calls (UUIDv4).
- UX policies
  - Do not render raw balances; only use server-provided caps.
  - Mask contact strings in UI where counterparty is displayed.

3) Accessibility and mobile
- Components use ARIA labels and keyboard flow
- Mobile-first layouts; drawer modals; bottom CTA visibility
- Motion reduces for prefers-reduced-motion

C. Testing strategy

1) Unit/Integration (backend)
- Eligibility engine (caps and one-loan-per-lender)
- Idempotency middleware (replay returns same response)
- Approval 2FA paths and failures
- Escrow hold then disburse atomicity
- Repayment update of schedule and nextPayment calculation
- Overdue and default transitions

2) E2E happy path
- Borrower requests → lender approves → escrow hold → immediate disbursal → repayments succeed → loan repaid
- Negative path: approval fails due to insufficient funds; ensure clean rollback and notification

3) Load and reliability
- Auto-deduction worker handles batch of N loans efficiently; retry backoff is respected

D. Rollout plan
- Enable feature flag for Loans v2 in staging
- Seed QA users (borrower, lender) and demo contacts; provide fixed OTP for test 2FA
- Daily reconciliation of ledger vs. escrow totals
- Post-release SLOs: approval_to_hold_latency ≤ 2s p95, auto_deduction_success_rate ≥ 95 percent

E. Work breakdown structure (WBS)

Backend
- Models: Loan, Escrow
- Middleware: idempotency, reAuth2FA, policyGuard
- Services: EligibilityEngine, EscrowService, Ledger
- Routes/Controllers: loans CRUD+actions, eligibility-check
- Worker: loans-auto-deduct
- Notifications: templates, triggers, tests

Frontend
- Pages: Loans, Lending
- Modals: LoanRequestWizard, LenderApprovalModal, MakeRepaymentModal
- Components: LoanCard, RepaymentCalendar, badges/pills, FeeBreakdown
- Services: loans, eligibility
- QA: storybook entries, unit tests for wizard state and modal validation

Acceptance criteria (MVP)
- All endpoints deployed and documented
- UX flows for request, approve, repay are functional on mobile and desktop
- Privacy rules validated in payloads and UI
- Audit/ledger entries recorded for all money moves