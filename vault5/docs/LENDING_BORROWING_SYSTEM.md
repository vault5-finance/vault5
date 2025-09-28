# 🚀 Vault5 Lending & Borrowing System - Complete Specification

## 📋 Executive Summary

This document provides a comprehensive specification for Vault5's peer-to-peer lending system, addressing all technical, business, security, and UX requirements. The system enables users to borrow from and lend to each other while maintaining privacy, security, and regulatory compliance.

## 🔹 1. Core System Architecture

### **System Overview**
- **Type**: Peer-to-Peer (P2P) lending with escrow protection
- **Model**: Direct borrower-lender relationships with platform oversight
- **Scope**: Personal loans between trusted contacts
- **Integration**: Built into existing Vault5 accounts and allocation system

### **Key Stakeholders**
1. **Borrowers**: Users seeking short-term liquidity
2. **Lenders**: Users with surplus funds in savings accounts
3. **Platform**: Vault5 acts as escrow agent and risk manager
4. **Regulators**: Must comply with CBK digital lending guidelines

---

## 🔹 2. API Contracts & Technical Implementation

### **Current API Endpoints**

#### `GET /api/loans`
**Purpose**: Retrieve user's loans (both borrowed and lent)

```json
{
  "success": true,
  "data": {
    "borrowed": [
      {
        "id": "loan_123",
        "lenderId": "user_456",
        "lenderName": "John Doe",
        "lenderEmail": "john@example.com",
        "principal": 5000,
        "interestRate": 0.05,
        "totalAmount": 5250,
        "status": "active",
        "createdAt": "2024-01-15T10:30:00Z",
        "dueDate": "2024-02-15T10:30:00Z",
        "remainingAmount": 5250,
        "nextPaymentDate": "2024-01-22T10:30:00Z",
        "nextPaymentAmount": 1050,
        "repaymentSchedule": "weekly",
        "escrowStatus": "funded",
        "borrowerCreditScore": 750,
        "lenderProtectionScore": 0.95
      }
    ],
    "lent": [
      {
        "id": "loan_789",
        "borrowerId": "user_101",
        "borrowerName": "Jane Smith",
        "principal": 3000,
        "interestRate": 0.03,
        "totalAmount": 3090,
        "status": "pending_approval",
        "createdAt": "2024-01-20T14:20:00Z",
        "requestedAmount": 3000,
        "borrowerEligibility": {
          "maxBorrowable": 7500,
          "savingsBalance": 10000,
          "creditScore": 680,
          "dailyBorrowingLimit": 5000,
          "lenderSpecificLimit": 3000
        }
      }
    ],
    "summary": {
      "totalBorrowed": 5250,
      "totalLent": 3090,
      "activeLoans": 2,
      "pendingApprovals": 1,
      "overdueAmount": 0
    }
  }
}
```

#### `POST /api/loans`
**Purpose**: Create a new loan request

**Request Body**:
```json
{
  "lenderEmail": "lender@example.com",
  "lenderPhone": "+254712345678",
  "amount": 3000,
  "interestRate": 0.05,
  "duration": 30,
  "durationUnit": "days",
  "repaymentSchedule": "weekly",
  "purpose": "Emergency medical expense",
  "autoApprove": false
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "loanId": "loan_abc123",
    "status": "pending_approval",
    "maxAllowedAmount": 7500,
    "recommendedAmount": 5000,
    "eligibility": {
      "savingsBalance": 10000,
      "dailyLimit": 5000,
      "lenderLimit": 7500,
      "creditScore": 680,
      "riskFactors": [
        "First time borrower from this lender",
        "Amount exceeds 50% of savings"
      ]
    },
    "lenderInfo": {
      "name": "John Doe",
      "availableBalance": 15000,
      "lendingCapacity": 11250,
      "responseTime": "Usually responds within 2 hours"
    },
    "estimatedRepayment": {
      "weeklyAmount": 1050,
      "totalAmount": 5250,
      "firstPaymentDate": "2024-01-27T10:30:00Z"
    }
  }
}
```

#### `POST /api/loans/:id/approve`
**Purpose**: Lender approves a loan request

**Request Body**:
```json
{
  "password": "user_password",
  "twoFactorCode": "123456"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "loanId": "loan_abc123",
    "status": "approved",
    "escrowTxId": "escrow_789",
    "disbursementTxId": "tx_101",
    "nextSteps": [
      "Funds moved to escrow",
      "Borrower notified of approval",
      "First repayment scheduled for 2024-01-27"
    ],
    "securityInfo": {
      "escrowProtected": true,
      "autoDeductionEnabled": true,
      "lenderProtectionScore": 0.95
    }
  }
}
```

#### `POST /api/loans/:id/repay`
**Purpose**: Manual loan repayment

**Request Body**:
```json
{
  "amount": 1050,
  "paymentMethod": "wallet",
  "autoPay": false
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "transactionId": "repay_456",
    "remainingBalance": 4200,
    "nextPaymentDate": "2024-02-03T10:30:00Z",
    "nextPaymentAmount": 1050,
    "creditScoreImpact": "+5 points",
    "rewards": {
      "bonusPoints": 50,
      "increasedLimit": 1000
    }
  }
}
```

---

## 🔹 3. Authentication & Security

### **Authentication Method**
- **Primary**: JWT tokens stored in localStorage with refresh token rotation
- **Secondary**: Device fingerprinting and trust scoring
- **Two-Factor**: Required for loan approvals and large disbursements (>KES 10,000)

### **Role Separation**
```javascript
// User roles in Vault5
const USER_ROLES = {
  BORROWER: 'borrower',      // Can request loans
  LENDER: 'lender',         // Can approve and fund loans
  VERIFIED: 'verified',     // Enhanced KYC completed
  ADMIN: 'admin'           // Platform oversight
};

// Dynamic role assignment based on activity
user.roles = ['borrower', 'lender', 'verified'];
```

### **Security Measures**
1. **Privacy Protection**: Lenders see only borrowing eligibility, not exact balances
2. **Escrow Security**: All funds held in protected accounts until repayment
3. **Fraud Detection**: AI-powered risk scoring and suspicious activity flagging
4. **Audit Trail**: Complete transaction history with blockchain-style immutability

---

## 🔹 4. Lending Mechanics & Business Rules

### **75% Rule Implementation**
```javascript
// Backend validation logic
const validateLoanAmount = (borrower, lender, requestedAmount) => {
  const borrowerMax = borrower.savingsBalance * 0.75;
  const lenderMax = lender.availableBalance * 0.75;
  const systemMax = Math.min(borrowerMax, lenderMax);

  return {
    approved: requestedAmount <= systemMax,
    maxAllowed: systemMax,
    borrowerLimit: borrowerMax,
    lenderLimit: lenderMax,
    riskScore: calculateRiskScore(borrower, lender)
  };
};
```

### **Credit Scoring System**
```javascript
const calculateCreditScore = (user) => {
  let score = 500; // Base score

  // Payment history (40% weight)
  score += user.repaymentHistory.onTime * 200;
  score -= user.repaymentHistory.late * 50;
  score -= user.repaymentHistory.defaulted * 100;

  // Account balance (20% weight)
  score += Math.min(user.totalBalance / 10000, 100);

  // Borrowing frequency (15% weight)
  score += user.loansCount * 10;

  // Account age (15% weight)
  score += Math.min(user.accountAgeInDays / 30, 50);

  // Social trust (10% weight)
  score += user.mutualConnections * 5;

  return Math.min(Math.max(score, 300), 850);
};
```

### **One-Loan-Per-Person Rules**
```javascript
const validateBorrowingEligibility = (borrower, lender) => {
  // Check daily borrowing limit
  const today = new Date().toDateString();
  const todayLoans = borrower.loans.filter(loan =>
    loan.createdAt.toDateString() === today
  );

  if (todayLoans.length >= borrower.dailyLimit) {
    return { eligible: false, reason: "Daily borrowing limit reached" };
  }

  // Check lender-specific borrowing
  const existingLoan = borrower.loans.find(loan =>
    loan.lenderId === lender.id && loan.status === 'active'
  );

  if (existingLoan) {
    return { eligible: false, reason: "Outstanding loan with this lender" };
  }

  return { eligible: true };
};
```

---

## 🔹 5. Escrow & Auto-Deduction System

### **Escrow Architecture**
```javascript
// Escrow account model
{
  id: "escrow_123",
  loanId: "loan_456",
  lenderId: "user_789",
  borrowerId: "user_101",
  amount: 5000,
  status: "funded", // funded, disbursed, repaid, defaulted
  createdAt: "2024-01-15T10:30:00Z",
  disbursementDate: "2024-01-15T10:35:00Z",
  autoDeductionEnabled: true,
  protectionScore: 0.95,
  riskMitigation: {
    partialRepayment: true,
    gracePeriodDays: 3,
    maxLateFees: 500
  }
}
```

### **Auto-Deduction Logic**
```javascript
// Cron job runs daily at 6 AM
const processAutoDeductions = async () => {
  const overdueLoans = await Loan.find({
    status: 'active',
    nextPaymentDate: { $lte: new Date() },
    autoDeductionEnabled: true
  });

  for (const loan of overdueLoans) {
    try {
      // Attempt deduction from borrower's Daily account
      const deduction = await deductFromAccount(
        loan.borrowerId,
        loan.nextPaymentAmount,
        'loan_repayment',
        `Auto repayment for loan ${loan.id}`
      );

      if (deduction.success) {
        // Transfer to lender
        await transferToLender(loan.lenderId, loan.nextPaymentAmount);

        // Update loan record
        await updateLoanProgress(loan.id, deduction.amount);

        // Send notifications
        await sendRepaymentNotifications(loan, 'success');
      } else {
        // Handle failed deduction
        await handleFailedDeduction(loan, deduction.reason);
      }
    } catch (error) {
      await logError('auto_deduction_failed', error);
    }
  }
};
```

---

## 🔹 6. Notification System

### **Multi-Channel Notifications**
```javascript
const NotificationChannels = {
  IN_APP: 'in_app',
  EMAIL: 'email',
  SMS: 'sms',
  PUSH: 'push',
  WHATSAPP: 'whatsapp'
};

const sendLoanNotification = async (type, recipient, data) => {
  const channels = await getUserNotificationPreferences(recipient.id);

  const notifications = [];

  if (channels.includes('in_app')) {
    notifications.push(createInAppNotification(type, data));
  }

  if (channels.includes('email')) {
    notifications.push(sendEmail(recipient.email, type, data));
  }

  if (channels.includes('sms') && data.urgent) {
    notifications.push(sendSMS(recipient.phone, type, data));
  }

  return Promise.all(notifications);
};
```

### **Notification Types**
```javascript
const NOTIFICATION_TYPES = {
  LOAN_REQUESTED: {
    title: "Loan Request Received",
    message: "{borrowerName} requested KES {amount}",
    urgent: false,
    channels: ['in_app', 'email']
  },
  LOAN_APPROVED: {
    title: "Loan Approved!",
    message: "KES {amount} disbursed to your account",
    urgent: true,
    channels: ['in_app', 'sms']
  },
  REPAYMENT_DUE: {
    title: "Repayment Due Soon",
    message: "KES {amount} due on {date}",
    urgent: true,
    channels: ['in_app', 'email']
  },
  AUTO_DEDUCTION_FAILED: {
    title: "Payment Failed",
    message: "Unable to process automatic repayment",
    urgent: true,
    channels: ['in_app', 'sms', 'email']
  }
};
```

---

## 🔹 7. Advanced Features & Future Enhancements

### **Smart Credit Scoring**
```javascript
const SmartCreditModel = {
  // Machine learning features
  features: [
    'repayment_history_score',
    'account_balance_stability',
    'transaction_frequency',
    'savings_rate',
    'social_trust_score',
    'device_trust_score',
    'time_based_risk'
  ],

  // Dynamic limit calculation
  calculateDynamicLimit: (user) => {
    const baseLimit = user.savingsBalance * 0.75;
    const creditMultiplier = user.creditScore / 700;
    const behaviorBonus = calculateBehaviorBonus(user);

    return baseLimit * creditMultiplier * behaviorBonus;
  }
};
```

### **Risk Management**
```javascript
const RiskMitigation = {
  // Pre-approval risk assessment
  assessRisk: (borrower, lender, amount) => {
    return {
      riskScore: calculateCompositeRisk(borrower, lender),
      protectionMechanisms: [
        'escrow_protection',
        'partial_repayment_insurance',
        'platform_reserve_fund'
      ],
      recommendedActions: [
        'require_additional_verification',
        'suggest_smaller_amount',
        'recommend_shorter_duration'
      ]
    };
  },

  // Real-time monitoring
  monitorActiveLoans: () => {
    // Check for early warning signs
    // Trigger protective actions
    // Update risk scores dynamically
  }
};
```

### **Privacy-First Design**
```javascript
const PrivacyController = {
  // Zero-knowledge balance verification
  verifyEligibility: async (borrowerId, lenderId, amount) => {
    // Cryptographic proof that borrower can repay
    // Without revealing exact balance
    const proof = await generateZeroKnowledgeProof(borrowerId, amount);
    return await verifyProof(proof, lenderId);
  },

  // Anonymous lending pools
  createAnonymousPool: (lenders, totalAmount) => {
    // Pool funds without revealing individual contributions
    // Distribute risk across multiple lenders
    return createBlindedPool(lenders, totalAmount);
  }
};
```

---

## 🔹 8. UI/UX Implementation Strategy

### **Unified Loans & Lending Page**
```jsx
const LoansLendingPage = () => {
  const [activeTab, setActiveTab] = useState('borrow');
  const [loans, setLoans] = useState({ borrowed: [], lent: [] });

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* EMI-branded header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Loans & <span style={{ color: 'var(--emi-blue)' }}>Lending</span>
        </h1>
        <p className="text-gray-600">
          Borrow from friends or lend your surplus savings
        </p>
      </div>

      {/* Tab navigation */}
      <div className="flex space-x-1 mb-8">
        <button
          onClick={() => setActiveTab('borrow')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'borrow'
              ? 'bg-gradient-primary text-white'
              : 'text-gray-600 hover:text-emi-blue'
          }`}
        >
          Borrow Money
        </button>
        <button
          onClick={() => setActiveTab('lend')}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            activeTab === 'lend'
              ? 'bg-gradient-success text-white'
              : 'text-gray-600 hover:text-emi-blue'
          }`}
        >
          My Lending
        </button>
      </div>

      {/* Dynamic content based on tab */}
      {activeTab === 'borrow' ? <BorrowingView /> : <LendingView />}
    </div>
  );
};
```

### **Borrowing Interface**
```jsx
const BorrowingView = () => {
  const [step, setStep] = useState('select_lender');
  const [lenderContact, setLenderContact] = useState('');
  const [amount, setAmount] = useState('');
  const [eligibility, setEligibility] = useState(null);

  const handleContactSubmit = async (contact) => {
    const eligibilityCheck = await checkBorrowingEligibility(contact);
    setEligibility(eligibilityCheck);
    setStep('amount_selection');
  };

  return (
    <div className="space-y-6">
      {step === 'select_lender' && (
        <ContactSelector onSubmit={handleContactSubmit} />
      )}

      {step === 'amount_selection' && (
        <AmountSelector
          eligibility={eligibility}
          onAmountSelect={(amt) => setAmount(amt)}
          onNext={() => setStep('confirm_loan')}
        />
      )}

      {step === 'confirm_loan' && (
        <LoanConfirmation
          amount={amount}
          lender={lenderContact}
          onSubmit={submitLoanRequest}
        />
      )}
    </div>
  );
};
```

### **Lending Interface**
```jsx
const LendingView = () => {
  const [loans, setLoans] = useState([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLendingData();
  }, []);

  const pendingLoans = loans.filter(loan => loan.status === 'pending_approval');
  const activeLoans = loans.filter(loan => loan.status === 'active');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Pending approvals */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Pending Approvals ({pendingLoans.length})
        </h2>
        {pendingLoans.map(loan => (
          <LoanApprovalCard
            key={loan.id}
            loan={loan}
            onApprove={approveLoan}
            onDecline={declineLoan}
          />
        ))}
      </div>

      {/* Active loans */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Active Loans ({activeLoans.length})
        </h2>
        {activeLoans.map(loan => (
          <ActiveLoanCard
            key={loan.id}
            loan={loan}
            onViewDetails={viewLoanDetails}
          />
        ))}
      </div>
    </div>
  );
};
```

---

## 🔹 9. Compliance & Regulatory Framework

### **CBK Compliance Features**
```javascript
const CBKCompliance = {
  // Digital lending guidelines
  maxInterestRate: 0.14, // 14% per annum
  maxLoanDuration: 365, // days
  requiredDisclosures: [
    'total_cost_of_credit',
    'annual_percentage_rate',
    'late_payment_penalties',
    'default_consequences'
  ],

  // Mandatory reporting
  reportToCRB: (userId, status) => {
    // Report defaults to Credit Reference Bureau
    return reportToExternalBureau(userId, status);
  },

  // Consumer protection
  coolingOffPeriod: 48, // hours to cancel loan
  transparentPricing: true,
  fairCollectionPractices: true
};
```

### **KYC Requirements**
```javascript
const KYCRequirements = {
  // Tiered KYC based on loan amount
  tiers: {
    BASIC: {
      maxLoan: 5000,
      requirements: ['phone_verification']
    },
    STANDARD: {
      maxLoan: 50000,
      requirements: ['phone_verification', 'id_document', 'address_proof']
    },
    ENHANCED: {
      maxLoan: 500000,
      requirements: ['phone_verification', 'id_document', 'address_proof', 'income_proof', 'bank_statement']
    }
  },

  // Verification methods
  verificationMethods: {
    phone: 'sms_otp',
    id: 'document_upload_ai_verification',
    address: 'utility_bill_verification',
    income: 'bank_statement_analysis'
  }
};
```

---

## 🔹 10. Advanced Analytics & Insights

### **Dashboard Widgets**
```jsx
const LendingDashboard = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Borrowing capacity */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Borrowing Power</h3>
          <BanknotesIcon className="h-6 w-6 text-emi-blue" />
        </div>
        <p className="text-2xl font-bold text-emi-blue mb-2">
          KES <CountUp end={borrowingLimit} />
        </p>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-primary h-2 rounded-full transition-all duration-500"
            style={{ width: `${(currentBorrowed / borrowingLimit) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Credit score */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">VaultScore</h3>
          <StarIcon className="h-6 w-6 text-emi-teal" />
        </div>
        <p className="text-2xl font-bold text-emi-teal mb-2">
          <CountUp end={creditScore} />
        </p>
        <p className="text-sm text-gray-600">
          {getScoreInterpretation(creditScore)}
        </p>
      </div>

      {/* Active loans */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Active Loans</h3>
          <ClockIcon className="h-6 w-6 text-emi-green" />
        </div>
        <p className="text-2xl font-bold text-emi-green mb-2">
          <CountUp end={activeLoansCount} />
        </p>
        <p className="text-sm text-gray-600">
          KES {totalOutstanding.toLocaleString()} outstanding
        </p>
      </div>

      {/* Next repayment */}
      <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Next Payment</h3>
          <CalendarIcon className="h-6 w-6 text-orange-500" />
        </div>
        <p className="text-2xl font-bold text-orange-600 mb-2">
          KES <CountUp end={nextPaymentAmount} />
        </p>
        <p className="text-sm text-gray-600">
          Due {formatDate(nextPaymentDate)}
        </p>
      </div>
    </div>
  );
};
```

---

## 🔹 11. Implementation Roadmap

### **Phase 1: Core P2P Lending (MVP)**
- [x] Basic loan request/approval flow
- [x] Escrow account management
- [x] Simple credit scoring
- [x] Basic notification system
- [x] EMI-branded UI components

### **Phase 2: Enhanced Features (Current)**
- [ ] Advanced credit scoring algorithm
- [ ] Multi-channel notifications
- [ ] Loan performance analytics
- [ ] Enhanced privacy controls
- [ ] Mobile money integration

### **Phase 3: Advanced Features (Future)**
- [ ] Group lending (chamas)
- [ ] Institutional lending partnerships
- [ ] Advanced risk management
- [ ] Loan securitization
- [ ] International lending

### **Phase 4: Ecosystem Expansion**
- [ ] DeFi integration
- [ ] Cross-platform APIs
- [ ] Advanced analytics platform
- [ ] Regulatory compliance automation
- [ ] Global expansion

---

## 🔹 12. Success Metrics & KPIs

### **Business Metrics**
- **Loan Volume**: Total loans disbursed per month
- **Repayment Rate**: Percentage of loans repaid on time
- **User Engagement**: Active borrowers/lenders ratio
- **Platform Revenue**: Interest income and fees

### **Risk Metrics**
- **Default Rate**: Percentage of loans defaulted
- **Recovery Rate**: Amount recovered from defaults
- **Risk Score Accuracy**: Correlation between scores and actual performance

### **User Experience Metrics**
- **Approval Time**: Average time from request to approval
- **User Satisfaction**: NPS scores for lending experience
- **Feature Adoption**: Percentage of users participating in lending

---

## 📚 Related Documentation

- **[API Documentation](API_DOCUMENTATION.md)**: Complete API reference
- **[Security Guidelines](SECURITY.md)**: Security and compliance requirements
- **[Design System](REACT_DESIGN_SYSTEM.md)**: UI/UX patterns and components
- **[Feature Roadmap](FEATURES.md)**: Planned enhancements and timeline
- **[Business Plan](BUSINESS_PLAN.md)**: Revenue model and growth strategy

---

## 🎯 Conclusion

This comprehensive lending system transforms Vault5 from a personal finance tracker into a full-featured financial ecosystem. The implementation balances innovation with security, user experience with regulatory compliance, and growth potential with risk management.

The system is designed to scale from individual P2P loans to institutional lending partnerships while maintaining the core values of financial inclusion, privacy protection, and user empowerment.
---

# Loans v2 Addendum — P2P Lending Blueprint (MVP Scope)

This addendum formalizes Vault5’s one-to-one P2P lending model with privacy-preserving eligibility checks, escrow-based approvals, flexible repayments, auto-deductions, and complete auditability. It aligns with the product blueprint provided and extends the existing lending logic with a dedicated Loans module.

1. Principles and goals
- One-to-one P2P loans only
- Flexible schedules: one-off or installments; support partial prepayments
- Privacy-first: return only eligibility summaries; never expose counterparty balances
- Vault5 acts as escrow and risk manager; fee revenue captured via origination and repayment fees
- Fast UX: clear warnings, reversible until approval; receipts and notifications at all stages

2. User journeys (summary)
- Borrower
  - Request Loan → pick contact (email/phone) → eligibility summary → amount + schedule → submit
  - System enforces 75% rule, daily/cooldown limits, and one-loan-per-lender
  - After lender approval and escrow hold, disbursement occurs (immediate or scheduled)
  - Repayments processed per schedule; auto-deduct attempts first; retries on failure
- Lender
  - Receives request → sees redacted eligibility → approve with password (+ 2FA over threshold) or decline
  - Approval places funds on escrow hold; repayment credits flow to lender

3. UX: key pages and components
- Lending page
  - Header and CTAs: Request from Contact, Request by Email/Phone
  - Summary cards: Borrowing Power, VaultScore, Active Requests, Pending Approvals, Next Payment
  - Tabs: Borrow, Lend, All
  - List cards: borrower/lender, masked contact, amount, status, due date, protection score
  - Empty states and skeletons; framer-motion transitions
- Request Loan wizard (borrower)
  - Step 1: Contact selection (save contact opt-in)
  - Step 2: Eligibility fetch with skeleton; return maxBorrowable, recommendedAmount, riskNotes
  - Step 3: Amount + schedule (one-off or installments; frequency; first payment; auto-deduct); preview totalRepayable and fees
  - Step 4: Confirm + cooling-off note; submit request
- Lender approval modal
  - Redacted profile and eligibility; no raw balances
  - Approve (immediate disbursement or scheduled), or Decline
  - Security: password; 2FA if over threshold
- Loans page
  - Combined borrower/lender view; progress bars, next due, status badges
  - Expand to see schedule, history, audit trail, make repayment
  - Repayment calendar with manual payment entry

4. API contracts (behavioral summary)
- GET /api/loans
  - Returns { borrowed[], lent[], summary }, each loan includes: id, role, counterpartyId, counterpartyMaskedContact, principal, interestRate, totalAmount, status, createdAt, nextPaymentDate, nextPaymentAmount, remainingAmount, repaymentSchedule, escrowStatus, protectionScore, metadata, loanRestrictions, and privacy-safe maxAllowed or lenderSpecificLimit. No counterpartyExactBalance.
- POST /api/loans
  - Body: { contact, amount, schedule, purpose, autoApprove? }
  - Validates 75% rule, daily limits, one-loan-per-lender, KYC tier; returns loanId, status: pending_approval, eligibilitySummary, estimatedRepayment
- GET /api/loans/:id
  - Full detail for borrower/lender; schedule entries and history; redacted fields enforced
- POST /api/loans/:id/approve
  - Body: { password, twoFactorCode?, disburseImmediately?, disburseAt? }
  - Verifies credentials, 2FA threshold; places escrow hold; optional immediate disbursement
  - Response: escrowTxId, disbursementTxId?, next steps
- POST /api/loans/:id/decline
  - Marks declined and notifies borrower
- POST /api/loans/:id/repay
  - Body: { amount, paymentMethod, autoPay? } → returns updated remainingAmount, nextPaymentDate, creditScoreDelta, rewards
- POST /api/loans/:id/reschedule
  - Proposes new schedule; lender approval required
- POST /api/loans/:id/writeoff
  - Admin/lender special flow; audited
- POST /api/lending/eligibility-check
  - Body: { targetContact } → returns maxBorrowableForThisPair, suggestedAmount, lenderResponseTimeHint, lenderProtectionScore, requiredVerification. Strictly privacy-preserving.

Idempotency:
- All create/approve/repay endpoints accept Idempotency-Key header; repeated calls must be safe.

5. Data model (descriptive)
- Loan
  - id, createdAt, createdBy (borrowerId), lenderId, borrowerId
  - principal, interestRate, totalAmount, currency
  - status: pending_approval | approved | funded | active | overdue | repaid | defaulted | written_off
  - repaymentSchedule: [{ dueDate, amount, paid, paidDate, method, transactionId }]
  - remainingAmount, nextPaymentDate, nextPaymentAmount
  - escrowId, escrowStatus
  - autoDeduct, accountDeductionId
  - purpose, notes, attachments
  - protectionScore, riskFlags[], borrowerCreditScoreAtRequest
  - lenderLimitAtApproval, borrowerLimitAtApproval (snapshots)
  - auditTrail ref, coolingOffExpiry
- Escrow
  - id, loanId, amountHeld, holdStatus: held | released | refunded, holderAccount, disbursementTxId, refundTxId, createdAt, releasedAt, protectionDetails
- Notification
  - id, userId, loanId, type, channels, sentAt, readAt, payload
- User financial profile snapshot
  - userId, savingsBalanceSnapshot, availableBalanceSnapshot, vaultScore, kycTier, dailyBorrowCount, loanHistory

6. Privacy and verification
- Never expose raw balances
- Mask contact (john•••@example.com, +2547•••5678)
- Require password and 2FA (configurable threshold) on approvals
- Encrypt PII at rest; TLS in transit
- Immutable audit trail; signed ledger entries

7. Escrow and money flow
- Approval → escrow hold → disbursement (immediate or scheduled)
- Repayments: autoDeduct attempts on due dates (idempotent); retries with backoff; notifications on success/failure
- Default: after grace period and retries; trigger recovery workflow and notifications

8. Business rules and fees
- 75% rule: systemMax = min(borrower.savings * 0.75, lender.available * 0.75)
- Daily borrow limit: default 1; adaptive based on history
- One-loan-per-lender until prior loan is repaid/written_off
- Fees: origination fee (borrower), per-repayment platform fee (from interest or split), late fee (capped)
- Cooling off: borrower can cancel pending request within 48h before lender approval

9. Notifications and copy (examples)
- Borrower: Request sent, Approved, Repayment due, Auto deduction failed, Repaid
- Lender: Request received with eligibility Y, Funds reserved, Repayment credited
- Always link to Loans page and detail view

10. Edge cases
- Concurrent approvals: re-check hold availability at approval time; fail safely
- Duplicate repayments: Idempotency-Key protects from double processing
- Partial payments: support; update remaining schedule; re-amortize if selected
- Cross-timezone: store UTC; present localized

11. KPIs and monitoring
- Business: volume, approval time, repayment rate, platform fees
- Risk: flagged loans, time to default, days overdue
- Ops: auto-deduction success, retries, failed holds, API error rate
- UX: conversion rate, post-failure churn

12. MVP acceptance criteria
- Eligibility engine privacy preserved
- Escrow hold + disburse atomic
- Approvals require password + 2FA (over threshold)
- Auto-deduction worker with retry and notifications
- Responsive UI and accessible components
- Basic analytics and monitoring in place

References
- Detailed API: See Loans v2 Endpoints appended in [API_DOCUMENTATION.md](API_DOCUMENTATION.md)
- Architecture sequences: See Loans v2 Module in [SYSTEM_DESIGN_DOCUMENT.md](SYSTEM_DESIGN_DOCUMENT.md)
- Implementation plan: See “Loans MVP Implementation Plan” appended in [ITERATION_GUIDE.md](ITERATION_GUIDE.md)
- UI component spec: See “Loans & Lending UI Components” appended in [REACT_DESIGN_SYSTEM.md](REACT_DESIGN_SYSTEM.md)