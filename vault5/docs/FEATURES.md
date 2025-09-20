# Vault5 Features Overview

Purpose
- Vault5 is a personal bank, financial coach, and discipline enforcer.
- Helps users track income/expenses, enforce allocation rules, grow wealth, and get to financial freedom.

Feature Map
- Authentication and RBAC
- Accounts and Allocation Engine
- Goals and Discipline
- Lending and Borrowing
- Loans
- Investments
- Transactions
- Reports and Analytics
- Notifications
- Settings and Integrations
- Payments and Wallets
- Public Site and Education
- Compliance and Risk
- Mobile-first UI

Authentication and RBAC
- User registration and login with JWT.
- Roles: user, content_admin, support_admin, account_admin, compliance_admin, finance_admin, system_admin, super_admin.
- Profile with name, avatar, preferences, financial goals.
- Files: [auth.js](vault5/backend/routes/auth.js), [authController.js](vault5/backend/controllers/authController.js), [rbac.js](vault5/backend/middleware/rbac.js), [Login.js](vault5/frontend/src/pages/Login.js), [Register.js](vault5/frontend/src/pages/Register.js)

Accounts and Allocation Engine
- Six default accounts: Daily 50%, Emergency 10%, Investment 20%, Long-Term 10%, Fun 5%, Charity 5%.
- Customizable percentages per user.
- On income, auto-split into accounts; track compliance and status colors (red shortfall, green on target, blue surplus).
- Files: [accounts.js](vault5/backend/routes/accounts.js), [accountsController.js](vault5/backend/controllers/accountsController.js), [Account.js](vault5/backend/models/Account.js), [Transactions.js](vault5/frontend/src/pages/Transactions.js)

Goals and Discipline
- Set target per account and visualize progress.
- Debt ledger for missed required deposits; surplus tracking.
- Notifications when ahead or behind schedule.
- Files: [goals.js](vault5/backend/routes/goals.js), [goalsController.js](vault5/backend/controllers/goalsController.js), [Goal.js](vault5/backend/models/Goal.js)

Lending and Borrowing
- Record lending to family and friends; classify emergency vs non-emergency.
- Rule engine suggests safe lending sources: Fun 50%, Charity 30%, Daily 20%.
- Caps non-repayable lendings per period; ledger for outstanding or written-off.
- Files: [lending.js](vault5/backend/routes/lending.js), [lendingController.js](vault5/backend/controllers/lendingController.js), [Lending.js](vault5/backend/models/Lending.js), [Lending.js](vault5/frontend/src/pages/Lending.js)

Loans
- Track personal and business loans with principal, repayments, frequency.
- Auto-deduct repayments from chosen account; show remaining balance.
- Files: [loans.js](vault5/backend/routes/loans.js), [loansController.js](vault5/backend/controllers/loansController.js), [Loan.js](vault5/backend/models/Loan.js), [Loans.js](vault5/frontend/src/pages/Loans.js)

Investments
- CRUD for T-Bills, MMFs, stocks, rentals, custom investments.
- Show growth and returns.
- Files: [investments.js](vault5/backend/routes/investments.js), [investmentsController.js](vault5/backend/controllers/investmentsController.js), [Investment.js](vault5/backend/models/Investment.js), [Investments.js](vault5/frontend/src/pages/Investments.js)

Transactions
- Record income and expenses; tagging for special incomes that bypass allocation.
- Compliance gates on creation: geo, IP, device, limitation outgoing, caps, velocity.
- Files: [transactions.js](vault5/backend/routes/transactions.js), [transactionsController.js](vault5/backend/controllers/transactionsController.js), [Transaction.js](vault5/backend/models/Transaction.js)

Reports and Analytics
- Dashboard net worth, allocation compliance, financial health score.
- Weekly, monthly, yearly cash flow; missed deposits, shortfalls, surplus, lending history.
- Export to PDF and Excel.
- Files: [reports.js](vault5/backend/routes/reports.js), [reportsController.js](vault5/backend/controllers/reportsController.js), [Reports.js](vault5/frontend/src/pages/Reports.js)

Notifications
- Alerts for missed deposits, surpluses, goal achievements, outstanding lending debts, upcoming loan repayments.
- Files: [notifications.js](vault5/backend/routes/notifications.js), [notificationsController.js](vault5/backend/controllers/notificationsController.js), [Notification.js](vault5/backend/models/Notification.js)

Settings and Integrations
- Adjust allocations; manage linked accounts; configure notifications and lending rules.
- Files: [settings.js](vault5/backend/routes/settings.js), [settingsController.js](vault5/backend/controllers/settingsController.js), [Settings.js](vault5/frontend/src/pages/Settings.js)

Payments and Wallets
- Two primary actions: Add Funds and Send Money.
- Add Funds opens a modal to select target account, provider, phone number, and amount.
- Providers: M-Pesa STK Push, Airtel Money, Bank transfer; supports simulation in development.
- After confirmation, payment state transitions and on success the allocation engine runs.
- Send Money moves funds out; blocked by limitation, caps, and velocity gates when applicable.
- Files: [Dashboard.js](vault5/frontend/src/pages/Dashboard.js), [Banking.js](vault5/frontend/src/pages/Banking.js), [transactions.js](vault5/backend/routes/transactions.js)
- Planned backend endpoints: deposits initiate, confirm, webhook callbacks, status.
- See: [PAYMENTS.md](vault5/docs/PAYMENTS.md)

Public Site and Education
- Landing, blog/articles, legal pages, about/contact.
- Files: [Landing.js](vault5/frontend/src/pages/Landing.js), [Blog.js](vault5/frontend/src/pages/Blog.js), [Legal.js](vault5/frontend/src/pages/Legal.js)

Compliance and Risk
- Geo allowlist, IP denylist, device rules, limitation lifecycle, KYC tiers, velocity and caps, audit logging.
- Admin consoles for compliance policies and audits.
- Files: [adminCompliance.js](vault5/backend/routes/adminCompliance.js), [compliance.js](vault5/backend/routes/compliance.js), [complianceController.js](vault5/backend/controllers/complianceController.js), [AdminCompliance.js](vault5/frontend/src/pages/AdminCompliance.js)

Mobile-first UI
- TailwindCSS responsive design; charts and progress bars optimized for mobile.
- Files: [tailwind.config.js](vault5/frontend/tailwind.config.js), [Dashboard.js](vault5/frontend/src/pages/Dashboard.js)

Admin
- Admin dashboards for system, finance, content, support, compliance, and user accounts.
- Files: [AdminDashboard.js](vault5/frontend/src/pages/AdminDashboard.js), [admin.js](vault5/backend/routes/admin.js), [adminController.js](vault5/backend/controllers/adminController.js)

Documentation Index
- Features: [FEATURES.md](vault5/docs/FEATURES.md)
- Payments: [PAYMENTS.md](vault5/docs/PAYMENTS.md)
- Daraja setup: [MpesaDaraja.md](vault5/docs/MpesaDaraja.md)
- API reference: [API.md](vault5/docs/API.md)
- Microservices roadmap: [microservices-migration-plan.md](vault5/microservices-migration-plan.md)
- Deployment: [DEPLOYMENT.md](vault5/DEPLOYMENT.md)

Status Legend
- Implemented: available in current app.
- Planned: defined and scheduled.
- Simulated: developer-mode flows without live providers.

Notes
- This document is private and intended for internal planning and execution.
- Do not share or publish without authorization.