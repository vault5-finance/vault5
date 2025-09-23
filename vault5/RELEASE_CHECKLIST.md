# Vault5 v2.0 Release Checklist

## Pre-Release Verification

### Environment Configuration
- [ ] Verify `NODE_ENV=production` disables all dev-mode bypasses
- [ ] Confirm `geoGate()` enforces geo restrictions in production
- [ ] Confirm `deviceGate()` requires cookies and blocks headless browsers in production
- [ ] Verify RBAC does not allow `account_admin` elevated permissions in production
- [ ] Check that `verifyPhone()` requires strict OTP validation in production
- [ ] Ensure optional dependencies (pdfkit, exceljs, plaid) fail gracefully when missing

### Security Gates
- [ ] Test rate limiting on auth routes (login, register, password reset)
- [ ] Verify input validation on all user inputs
- [ ] Confirm JWT tokens expire correctly (30d default)
- [ ] Test password hashing strength (bcrypt salt rounds >= 10)
- [ ] Verify HTTPS enforcement in production

### Database & Data Integrity
- [ ] Run seed script successfully
- [ ] Verify default account creation (6 accounts with correct percentages)
- [ ] Test allocation engine with various income amounts
- [ ] Confirm compliance fields initialize correctly
- [ ] Validate user registration flow (multi-step)

### API Endpoints
- [ ] Test all CRUD operations for core entities (accounts, transactions, goals, lending, loans, investments)
- [ ] Verify export functionality (PDF/Excel) with sample data
- [ ] Test notification system triggers
- [ ] Confirm lending rule engine calculations
- [ ] Validate phone number normalization

### Frontend
- [ ] Test responsive design on mobile/tablet/desktop
- [ ] Verify Chart.js charts render correctly
- [ ] Test lazy loading and error recovery
- [ ] Confirm API retry/backoff works
- [ ] Validate form validations

### Performance
- [ ] Check bundle size and lazy loading
- [ ] Test with large datasets (1000+ transactions)
- [ ] Verify database query performance
- [ ] Confirm memory usage under load

### Documentation
- [ ] Update README with complete setup instructions
- [ ] Document all environment variables
- [ ] Include API documentation for core endpoints
- [ ] Add troubleshooting guide
- [ ] Document dev-mode behaviors

## Deployment Steps

1. **Environment Setup**
   - Set production environment variables
   - Configure MongoDB production instance
   - Set up SSL certificates
   - Configure reverse proxy (nginx)

2. **Database Migration**
   - Run seed script on production DB
   - Verify data integrity
   - Backup existing data if upgrading

3. **Application Deployment**
   - Build frontend for production
   - Deploy backend with PM2 or similar
   - Configure log rotation
   - Set up monitoring (health checks)

4. **Post-Deployment Testing**
   - Test user registration and login
   - Verify core functionality (allocation, lending, reports)
   - Check email/SMS integrations
   - Test payment flows if enabled

5. **Monitoring Setup**
   - Configure error tracking (Sentry)
   - Set up performance monitoring
   - Enable audit logging
   - Configure alerts for critical issues

## Rollback Plan

- Keep previous version deployed in parallel
- Have database backup ready
- Document rollback steps
- Test rollback procedure

## Go-Live Checklist

- [ ] All pre-release verifications completed
- [ ] Production environment configured
- [ ] Database seeded and verified
- [ ] Application deployed successfully
- [ ] Basic functionality tested
- [ ] Monitoring and alerts configured
- [ ] Support team notified
- [ ] User communication prepared

## Phase 2 Preparation

- [ ] Monetization hooks documented (not implemented)
- [ ] AI features placeholders ready
- [ ] API integrations planned
- [ ] Scalability considerations noted
- [ ] Multi-currency support planned