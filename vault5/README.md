# Vault5 - Financial Freedom Platform

Vault5 is a fullstack personal finance application designed to evolve into a comprehensive neo-bank. It features automated income allocation across 6 core accounts (Fun 50%, Charity 30%, Daily 20%, with Emergency/Long-Term), goal tracking, lending/borrowing with rule-based engines, investments, loans, reports/analytics with PDF/Excel exports, settings, notifications, and educational content via Blog and About Us pages.

## Features
- **Authentication**: Secure user registration/login with JWT, profile management including avatar upload.
- **Allocation Engine**: Auto-split income with compliance tracking, debt/surplus logs, and status indicators (red/green/yellow).
- **Goals & Discipline**: CRUD for goals with progress tracking; debt/surplus ledgers for non-compliance.
- **Lending/Borrowing**: Safe lending rule engine (e.g., Fun 50%, Charity 30%, Daily 20% caps); emergency approvals; status updates (pending/repaid/overdue/written-off); ledger history.
- **Investments & Loans**: CRUD for investments with growth tracking; loans with auto-repayments and due scheduling.
- **Reports & Analytics**: Dashboard (net worth, health score, allocation pie chart); cash flow reports with exports.
- **Settings & Notifications**: Customizable thresholds/rules; real-time notifications with bell icon dropdown in NavBar.
- **Public Pages**: Landing, Blog (educational posts with "Read More" toggles), About Us (vision/mission/values).
- **Mobile-First Design**: Responsive UI with TailwindCSS; smooth navigation via React Router.

## Tech Stack
- **Backend**: Node.js, Express, MongoDB (Atlas), Mongoose, JWT, bcryptjs, Multer (uploads), PDFKit/ExcelJS (exports), CORS.
- **Frontend**: React, React Router, TailwindCSS, Chart.js (react-chartjs-2), Axios (with interceptors for auth).
- **Database**: MongoDB Atlas (connection via MONGO_URI in .env).
- **Deployment**: Local dev; scalable to cloud (e.g., Vercel/Heroku for FE, Render for BE).

## Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account (free tier) for database.
- Git for cloning (if needed).

### Backend Setup
1. Navigate to `vault5/backend`:
   ```
   cd vault5/backend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Create `.env` from `.env.example` and configure:
   ```
   MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/vault5?retryWrites=true&w=majority
   JWT_SECRET=your_jwt_secret_here (use a strong secret)
   PORT=5000
   NODE_ENV=development
   ```
   - Note: Percent-encode special characters in MONGO_URI password (e.g., `@` -> `%40`, `*` -> `%2A`).
4. Seed default user (optional, for testing):
   ```
   node seed.js
   ```
   - Creates user: Email `bnyaliti@gmail.com`, Password `Admin`; with 6 default accounts.
5. Run server:
   ```
   npm run dev
   ```
   - Server runs on `http://localhost:5000`.
   - APIs: `/api/auth`, `/api/accounts`, `/api/goals`, `/api/lending`, `/api/loans`, `/api/investments`, `/api/reports`, `/api/settings`, `/api/notifications`.
   - Uploads served at `/uploads` (avatars).

### Frontend Setup
1. Navigate to `vault5/frontend`:
   ```
   cd vault5/frontend
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Configure API base (optional, defaults to `http://localhost:5000` via `REACT_APP_API_URL` in `.env` if needed).
4. Run dev server:
   ```
   npm start
   ```
   - App runs on `http://localhost:3000` (or 3001 if port occupied).
   - Proxy configured for backend calls (handles CORS).

### Testing the App
1. **Login/Register**:
   - Visit `http://localhost:3000`.
   - Use default: Email `bnyaliti@gmail.com`, Password `Admin` (redirects to Dashboard).
   - Or register new user (includes optional avatar upload; dob/phone/city required).
2. **Navigation**:
   - NavBar: Dashboard, Reports, Lending, Loans, Investments, Blog, About, Settings, Profile, Notifications (bell icon dropdown), Logout.
   - Public: Landing, Login, Register.
3. **Core Flows**:
   - **Dashboard**: View net worth, health score, allocation pie chart.
   - **Reports**: Select period (weekly/monthly/yearly); view cash flow; download PDF/Excel.
   - **Lending**: Create requests (non-emergency/emergency); update status; view history/ledger.
   - **Loans**: Create loans; make repayments; view progress/due dates.
   - **Investments**: Add/update/delete; track growth/maturity.
   - **Settings**: Update linked accounts, thresholds, lending rules.
   - **Profile**: Edit name/email; update avatar URL.
   - **Notifications**: Auto-fetch latest 5; mark as read via backend.
   - **Blog/About**: Static educational content aligned with neo-bank vision.
4. **API Testing**: Use Postman/Insomnia with Bearer token for protected routes.

### Default Data
- After seeding: User has 6 accounts (Fun, Charity, Daily, Emergency, Long-Term, Investments) with 0 balances.
- Add income via Dashboard/Accounts to test allocation.

### Troubleshooting
- **MongoDB Connection**: Ensure MONGO_URI is correct; whitelist IP 0.0.0.0/0 in Atlas.
- **CORS/Proxy Errors**: Backend must run on 5000; frontend proxy forwards to `/api/*`.
- **JWT Errors**: Use valid token; dev fallback in middleware.
- **Uploads**: Avatars saved to `backend/uploads/`; served statically.
- **ESLint**: Fixed in code; run `npm run lint` if issues.
- **Port Conflicts**: Frontend: `PORT=3001 npm start`; Backend: change PORT in .env.

### Future Roadmap
See [ROADMAP.md](ROADMAP.md) for Phase 3+ evolution to neo-bank (wallet, custody, credit, pooling, chamas, insurance, global payments).

### Contributing
- Fork, branch, PR.
- Follow ESLint/Prettier standards.
- Test thoroughly.

### License
MIT - Open source for financial freedom.