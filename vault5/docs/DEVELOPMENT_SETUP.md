# Vault5 Development Setup Guide

## Overview

This guide provides step-by-step instructions for setting up a Vault5 development environment. Whether you're a new developer joining the team or setting up the project locally, this guide will get you up and running quickly.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Project Structure](#project-structure)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [Database Setup](#database-setup)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **Operating System**: Windows 10/11, macOS 10.15+, or Linux (Ubuntu 18.04+)
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher (comes with Node.js)
- **MongoDB**: Version 5.0 or higher
- **Git**: Version 2.25.0 or higher

### Hardware Requirements

- **RAM**: Minimum 8GB, recommended 16GB
- **Storage**: Minimum 10GB free space
- **Internet**: Stable internet connection for package downloads

### Development Tools

- **Code Editor**: VS Code (recommended) with extensions:
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint
  - MongoDB for VS Code
- **Terminal**: Command prompt, PowerShell, or bash
- **Postman**: For API testing
- **MongoDB Compass**: For database management

## Environment Setup

### 1. Install Node.js and npm

**Windows/macOS:**
- Download from [nodejs.org](https://nodejs.org/)
- Run the installer
- Verify installation:
```bash
node --version
npm --version
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Install MongoDB

**Windows:**
- Download from [mongodb.com](https://www.mongodb.com/try/download/community)
- Run the MSI installer
- Start MongoDB service from Services panel

**macOS (using Homebrew):**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb/brew/mongodb-community
```

**Linux (Ubuntu):**
```bash
sudo apt-get install gnupg
wget -qO - https://www.mongodb.org/static/pgp/server-5.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/5.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-5.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
```

### 3. Install Git

**Windows/macOS:**
- Download from [git-scm.com](https://git-scm.com/)
- Run the installer

**Linux:**
```bash
sudo apt-get install git
```

### 4. Install VS Code

- Download from [code.visualstudio.com](https://code.visualstudio.com/)
- Install recommended extensions

## Project Structure

```
vault5/
├── backend/                 # Node.js/Express backend
│   ├── controllers/         # Route controllers
│   ├── middleware/          # Express middleware
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── services/           # Business logic services
│   ├── utils/              # Utility functions
│   ├── scripts/            # Database scripts
│   └── server.js           # Main server file
├── frontend/               # React frontend
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── styles/         # CSS and styling
│   │   └── utils/          # Frontend utilities
│   └── package.json
├── docs/                   # Documentation
├── infrastructure/         # Docker and deployment configs
└── README.md
```

## Backend Setup

### 1. Clone and Navigate

```bash
git clone <repository-url>
cd vault5/backend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` with your local configuration:

```env
# Database
MONGO_URI=mongodb://localhost:27017/vault5

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
OTP_ACCEPT_ANY=true  # Allow any OTP in development

# Email (optional - use console logging for development)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Frontend
FRONTEND_URL=http://localhost:3000

# Environment
NODE_ENV=development

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

### 4. Seed Database (Optional)

```bash
npm run seed
```

This creates a test admin user:
- Email: `admin@vault5.com`
- Password: `Admin123!`

### 5. Start Backend Server

```bash
npm run dev
```

The server will start on `http://localhost:5000`

## Frontend Setup

### 1. Navigate to Frontend Directory

```bash
cd ../frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create `.env` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENVIRONMENT=development
```

### 4. Start Development Server

```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## Database Setup

### MongoDB Configuration

1. **Start MongoDB Service:**
   ```bash
   # Windows (as Administrator)
   net start MongoDB

   # macOS
   brew services start mongodb/brew/mongodb-community

   # Linux
   sudo systemctl start mongod
   ```

2. **Verify Connection:**
   ```bash
   mongo  # or mongosh
   ```

3. **Create Database:**
   ```javascript
   use vault5
   db.createCollection("users")
   ```

### Database Seeding

Run the seed script to populate initial data:

```bash
cd backend
npm run seed
```

This creates:
- Admin user account
- Sample user accounts
- Basic configuration data

## Development Workflow

### Code Style and Linting

The project uses ESLint and Prettier for code consistency:

```bash
# Run linting
npm run lint

# Fix linting issues automatically
npm run lint:fix

# Format code
npm run format
```

### Git Workflow

1. **Create Feature Branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes:**
   - Follow the established code patterns
   - Write tests for new features
   - Update documentation as needed

3. **Commit Changes:**
   ```bash
   git add .
   git commit -m "feat: add new feature description"
   ```

4. **Push and Create PR:**
   ```bash
   git push origin feature/your-feature-name
   ```

### API Development

1. **Create New Endpoint:**
   - Add route in `routes/` directory
   - Create controller in `controllers/` directory
   - Add validation middleware if needed
   - Update API documentation

2. **Database Models:**
   - Define schemas in `models/` directory
   - Add validation and indexes
   - Create relationships between models

### Frontend Development

1. **Component Creation:**
   - Use functional components with hooks
   - Follow EMI design system
   - Implement proper TypeScript types (if applicable)
   - Add accessibility features

2. **State Management:**
   - Use React Context for global state
   - Implement proper error boundaries
   - Handle loading states appropriately

## Testing

### Backend Testing

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Frontend Testing

```bash
cd frontend

# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage

# Run e2e tests (if configured)
npm run test:e2e
```

### Manual Testing

1. **API Testing with Postman:**
   - Import the API documentation collection
   - Test authentication endpoints
   - Verify CRUD operations

2. **UI Testing:**
   - Test all user flows
   - Verify responsive design
   - Check accessibility compliance

## Troubleshooting

### Common Issues

#### Backend Won't Start

**Error:** `EADDRINUSE: address already in use`

**Solution:**
```bash
# Find process using port 5000
lsof -ti:5000 | xargs kill -9

# Or change port in server.js
const PORT = process.env.PORT || 5001;
```

#### MongoDB Connection Failed

**Error:** `MongoServerError: Authentication failed`

**Solution:**
- Check MONGO_URI in `.env` file
- Ensure MongoDB service is running
- Verify database credentials

#### Frontend Build Errors

**Error:** `Module not found`

**Solution:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

#### CORS Errors

**Error:** `CORS policy` blocked

**Solution:**
- Check CORS_ALLOWED_ORIGINS in backend `.env`
- Ensure frontend is running on allowed port
- Add your domain to CORS settings

### Development Tips

1. **Use Environment-Specific Configurations:**
   - Keep development and production configs separate
   - Use `.env.local` for local overrides

2. **Debugging:**
   - Use `console.log()` strategically
   - Enable React DevTools
   - Use browser network tab for API debugging

3. **Performance:**
   - Use React DevTools Profiler
   - Monitor bundle size with `npm run build`
   - Optimize images and assets

4. **Security:**
   - Never commit secrets to version control
   - Use environment variables for sensitive data
   - Enable 2FA for admin accounts

### Getting Help

1. **Documentation:**
   - Check this setup guide first
   - Review API documentation
   - Read component library docs

2. **Team Resources:**
   - Check internal wiki for team-specific processes
   - Ask in team communication channels
   - Schedule pair programming sessions

3. **Issue Reporting:**
   - Use GitHub issues for bugs
   - Include reproduction steps
   - Attach relevant logs and screenshots

## Next Steps

Once your development environment is set up:

1. **Explore the Codebase:**
   - Read the README.md for project overview
   - Review the API documentation
   - Understand the EMI design system

2. **Start Contributing:**
   - Pick an issue from the backlog
   - Follow the development workflow
   - Write tests for your changes

3. **Learn the Architecture:**
   - Study the system design documents
   - Understand the microservices approach
   - Review the deployment configurations

---

*Development Setup Guide v1.0 - Complete setup instructions for Vault5 development*