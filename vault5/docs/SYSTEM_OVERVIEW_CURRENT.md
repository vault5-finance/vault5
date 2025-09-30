# Vault5 System Overview (Current State)

## Mission

Vault5 is a fullstack financial freedom platform that helps users track, manage, and optimize their finances through smart allocation, disciplined spending, and automated financial workflows.

## Core Architecture

### Tech Stack
- **Frontend**: React 18, TailwindCSS, React Router
- **Backend**: Node.js, Express, MongoDB, JWT authentication
- **Payments**: Stripe integration for card tokenization
- **Infrastructure**: Docker, Kubernetes-ready

### Key Components
- User management with role-based access
- Financial account allocation system
- P2P lending with escrow protection
- Card linking and payment processing
- Subscription management
- Notification system
- Audit logging and compliance

## Working Features

### 1. User Management
- Registration with email/phone verification
- JWT-based authentication
- Profile management
- Role-based permissions (user, admin levels)
- Trusted device management

### 2. Financial Accounts & Allocation
- Six account types: Daily (50%), Emergency (10%), Investment (20%), Long-Term Goals (10%), Fun (5%), Charity (5%)
- Income auto-allocation based on percentages
- Manual transfers between accounts
- Account balance tracking
- Compliance monitoring (shortfall/surplus tracking)

### 3. P2P Lending v2
- Privacy-first loan requests
- Escrow-based fund protection
- Flexible repayment schedules
- Auto-deduction for repayments
- Lender capacity calculation (Fun/Charity/Daily sources)
- 2FA and re-auth for approvals
- Comprehensive audit trail

### 4. Card Linking & Payments
- Stripe-powered card tokenization
- PCI DSS SAQ-A compliant
- Support for Visa, Mastercard, Amex, etc.
- Device fingerprinting and velocity checks
- Default card management

### 5. Vault5 Pay (Wallet-First Payments)
- Wallet balance prioritized for payments
- Automatic card fallback
- Subscription billing automation
- Refund processing
- Transaction history

### 6. Subscription Management
- Create recurring subscriptions
- Wallet or card payment sources
- Automatic billing with retry logic
- Pause/resume/cancel functionality
- Billing history and notifications

### 7. Notifications System
- Real-time notifications for:
  - Loan approvals/repayments
  - Card linking/removal
  - Subscription events
  - Account compliance alerts
- Email and in-app notifications

### 8. Reports & Analytics
- Monthly/quarterly/yearly reports
- Cashflow analysis
- Lending analytics
- Export to PDF/Excel

### 9. Admin Panel
- User management
- System monitoring
- Compliance oversight
- Content management
- Audit log access

## Data Models

### Core Entities
- **User**: Profile, preferences, permissions
- **Account**: Financial allocation buckets
- **Transaction**: All financial movements
- **P2PLoan**: Peer-to-peer lending records
- **Escrow**: Fund protection for loans
- **PaymentMethod**: Tokenized card storage
- **Subscription**: Recurring billing
- **Notification**: User communications

### Relationships
- Users have multiple Accounts
- Accounts contain Transactions
- Users participate in P2P Loans
- Loans protected by Escrow
- Users link PaymentMethods
- Users create Subscriptions
- All actions generate Notifications

## Security & Compliance

### Authentication
- JWT tokens with refresh mechanism
- Password hashing with bcrypt
- 2FA support
- Session management

### Authorization
- Role-based access control
- Route-level permissions
- Admin override capabilities

### Data Protection
- PCI DSS compliance for payments
- Encryption at rest and in transit
- Audit logging for all sensitive operations
- GDPR-compliant data handling

### Fraud Prevention
- Device fingerprinting
- Velocity limits
- Geo-blocking
- Transaction monitoring

## API Structure

### RESTful Endpoints
- `/api/auth/*` - Authentication
- `/api/accounts/*` - Financial accounts
- `/api/transactions/*` - Money movements
- `/api/p2p-loans/*` - Peer lending
- `/api/payment-methods/*` - Card management
- `/api/subscriptions/*` - Recurring payments
- `/api/notifications/*` - Communications
- `/api/admin/*` - Administrative functions

### Response Format
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message",
  "pagination": { ... } // For list endpoints
}
```

## Frontend Architecture

### Component Structure
- **Pages**: Route-level components
- **Components**: Reusable UI elements
- **Contexts**: Global state management
- **Services**: API communication
- **Utils**: Helper functions

### Key Pages
- Dashboard: Overview and quick actions
- Accounts: Allocation management
- P2P Loans: Lending marketplace
- Payments & Cards: Payment method management
- Subscriptions: Recurring payment management
- Reports: Analytics and exports

## Deployment & Operations

### Environment Configuration
- Development, staging, production environments
- Environment-specific secrets management
- Docker containerization
- Database migrations

### Monitoring
- Error tracking and logging
- Performance monitoring
- Database health checks
- API rate limiting

### Backup & Recovery
- Database backups
- Log retention
- Disaster recovery procedures

## Current Limitations

### Known Issues
- Mobile app in development
- Some features require manual intervention
- Limited international currency support
- Advanced fraud detection in progress

### Performance Considerations
- Database query optimization needed for large datasets
- Caching strategy implementation pending
- CDN integration for static assets

## Development Workflow

### Code Quality
- ESLint configuration
- Pre-commit hooks
- Automated testing (unit, integration)
- Code review process

### Deployment Pipeline
- Git-based version control
- Automated testing on PR
- Staging environment validation
- Production deployment with rollback

## Future Roadmap

See [FEATURE_SUGGESTIONS.md](FEATURE_SUGGESTIONS.md) for planned enhancements including:
- Merchant onboarding
- Advanced analytics
- Multi-currency support
- Mobile app completion
- Enterprise features

## Support & Documentation

- **API Docs**: [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- **User Guide**: [USER_GUIDE.md](USER_GUIDE.md)
- **Security**: [SECURITY.md](SECURITY.md)
- **PCI Compliance**: [PCI_DSS_Compliance.md](PCI_DSS_Compliance.md)

---

*This overview reflects the system as of September 2025. For the latest changes, check the changelog.*