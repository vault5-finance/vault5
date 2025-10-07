# Vault5 API Documentation

## REST API Reference for Developers

**Version:** 2.1.0 - Enhanced Overdue Reminder System & Grace Period Management
**Base URL:** `https://api.vault5.com/v1`
**Date:** October 2025
**Brand Identity:** EMI (Enhanced Microfinance Interface)

---

## Authentication

All API requests require JWT authentication:

```
Authorization: Bearer <your_jwt_token>
```

### Login
**POST** `/auth/login`
```json
{
  "identifier": "user@example.com",
  "password": "password123"
}
```

### Register
**POST** `/auth/register`
```json
{
  "primaryEmail": "user@example.com",
  "primaryPhone": "+254700000000",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

---

## Users

### Get Profile
**GET** `/users/profile`

### Update Profile
**PUT** `/users/profile`
```json
{
  "firstName": "John",
  "lastName": "Doe Updated"
}
```

### Change Password
**POST** `/users/change-password`
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

---

## Accounts

### List Accounts
**GET** `/accounts`

### Transfer Between Accounts
**POST** `/accounts/transfer`
```json
{
  "fromAccountId": "daily_account_id",
  "toAccountId": "emergency_account_id",
  "amount": 10000,
  "description": "Transfer description",
  "pin": "1234"
}
```

---

## Transactions

### List Transactions
**GET** `/transactions`

### Create Transaction
**POST** `/transactions`
```json
{
  "type": "income",
  "amount": 50000,
  "description": "Monthly salary",
  "category": "salary",
  "toAccountId": "account_id"
}
```

### Get Transaction
**GET** `/transactions/{id}`

### Update Transaction
**PUT** `/transactions/{id}`
```json
{
  "description": "Updated description"
}
```

### Delete Transaction
**DELETE** `/transactions/{id}`

---

## Transfers

### Send Money (P2P)
**POST** `/transfers/send`
```json
{
  "amount": 5000,
  "description": "Payment description",
  "recipient": {
    "identifier": "recipient@example.com"
  },
  "fromAccountId": "account_id",
  "pin": "1234"
}
```

### External Transfer
**POST** `/transfers/external`
```json
{
  "amount": 10000,
  "description": "External payment",
  "transferType": "bank",
  "recipient": {
    "bankName": "KCB Bank",
    "accountNumber": "12345678901"
  },
  "fromAccountId": "account_id",
  "pin": "1234"
}
```

### Get Transfer History
**GET** `/transfers`

---

## Reports

### Monthly Report
**GET** `/reports/monthly?year=2025&month=1`

### Export Report
**POST** `/reports/export`
```json
{
  "reportType": "monthly",
  "format": "pdf",
  "period": {"year": 2025, "month": 1}
}
```

## Loans v2 P2P Module

Privacy-first one-to-one loans with escrow, flexible schedules, auto-deductions, and full auditability. These endpoints are distinct from simple Lending records and power the borrower↔lender loan flow.

Headers
- Authorization: Bearer &lt;jwt&gt;
- Idempotency-Key: UUIDv4 (required for POST create, approve, repay, reschedule, writeoff)

### List Loans
GET `/api/loans`
Response:
```json
{
  "success": true,
  "data": {
    "borrowed": [
      {
        "id": "loan_123",
        "role": "borrower",
        "counterpartyId": "user_456",
        "counterpartyMaskedContact": "john•••@example.com",
        "principal": 5000,
        "interestRate": 0.05,
        "totalAmount": 5250,
        "status": "active",
        "createdAt": "2025-09-20T10:00:00Z",
        "nextPaymentDate": "2025-10-01T00:00:00Z",
        "nextPaymentAmount": 1050,
        "remainingAmount": 4200,
        "repaymentSchedule": [
          { "dueDate": "2025-10-01", "amount": 1050, "paid": false }
        ],
        "escrowStatus": "disbursed",
        "protectionScore": 0.92,
        "metadata": { "purpose": "Emergency medical" },
        "loanRestrictions": {
          "oneLoanPerPerson": true,
          "dailyBorrowLimitHit": false
        },
        "maxAllowed": 7500
      }
    ],
    "lent": [],
    "summary": {
      "activeLoans": 1,
      "pendingApprovals": 0,
      "overdueAmount": 0
    }
  }
}
```

Notes:
- Privacy: never return counterpartyExactBalance. Use `maxAllowed` or `lenderSpecificLimit`.

### Create Loan Request
POST `/api/loans`
Body:
```json
{
  "contact": { "email": "lender@example.com" },
  "amount": 3000,
  "schedule": {
    "type": "installments",
    "frequency": "weekly",
    "installments": 5,
    "firstPaymentDate": "2025-10-05",
    "autoDeduct": true
  },
  "purpose": "Laptop repair",
  "autoApprove": false
}
```
Response:
```json
{
  "success": true,
  "data": {
    "loanId": "loan_abc123",
    "status": "pending_approval",
    "eligibilitySummary": {
      "maxBorrowable": 7500,
      "borrowerLimit": 8000,
      "lenderLimit": 7500,
      "borrowerCreditScore": 680,
      "riskFactors": ["first_time_with_lender"]
    },
    "estimatedRepayment": {
      "installmentAmount": 1050,
      "totalAmount": 5250,
      "firstPaymentDate": "2025-10-05"
    }
  }
}
```
Validation:
- 75% rule (min of borrower.savings*0.75, lender.available*0.75)
- Daily borrow limit and one-loan-per-lender
- KYC tier gating

### Get Loan Detail
GET `/api/loans/:id`
Response includes full repayment schedule, history, escrow state, and privacy-safe fields when viewed by counterparty.

### Approve Loan (Lender)
POST `/api/loans/:id/approve`
Headers: Idempotency-Key
Body:
```json
{
  "password": "user_password",
  "twoFactorCode": "123456",
  "disburseImmediately": true,
  "disburseAt": null
}
```
Response:
```json
{
  "success": true,
  "data": {
    "loanId": "loan_abc123",
    "status": "approved",
    "escrowTxId": "escrow_789",
    "disbursementTxId": "tx_101",
    "nextSteps": [
      "Funds held in escrow",
      "Disbursement executed",
      "First repayment scheduled 2025-10-05"
    ],
    "securityInfo": {
      "escrowProtected": true,
      "twoFactorRequired": true,
      "lenderProtectionScore": 0.95
    }
  }
}
```
Security:
- Re-auth with password; 2FA required if amount exceeds threshold

### Decline Loan (Lender)
POST `/api/loans/:id/decline`
Response: `{ "success": true, "data": { "status": "declined" } }`

### Repay Loan (Borrower)
POST `/api/loans/:id/repay`
Headers: Idempotency-Key
Body:
```json
{
  "amount": 1050,
  "paymentMethod": "wallet",
  "autoPay": false
}
```
Response:
```json
{
  "success": true,
  "data": {
    "transactionId": "repay_456",
    "remainingAmount": 3150,
    "nextPaymentDate": "2025-10-12",
    "nextPaymentAmount": 1050,
    "creditScoreDelta": 5,
    "rewards": { "bonusPoints": 50 }
  }
}
```

### Reschedule Request
POST `/api/loans/:id/reschedule`
Headers: Idempotency-Key
Body:
```json
{
  "proposedSchedule": {
    "type": "installments",
    "frequency": "biweekly",
    "installments": 3,
    "firstPaymentDate": "2025-10-10"
  },
  "reason": "salary date changed"
}
```
Response: lender must approve; returns pending change request details.

### Write-off (Admin or Lender special mode)
POST `/api/loans/:id/writeoff`
Headers: Idempotency-Key
Body:
```json
{
  "reason": "hardship",
  "evidenceUrl": null
}
```
Response: audited status change to `written_off`.

### Eligibility Check (Privacy-Preserving)
POST `/api/lending/eligibility-check`
Body:
```json
{
  "targetContact": { "phone": "+2547XXXXXXX" }
}
```
Response:
```json
{
  "eligibility": {
    "maxBorrowableForThisPair": 7200,
    "suggestedAmount": 5000,
    "lenderResponseTimeHint": "usually within 2 hours",
    "lenderProtectionScore": 0.9,
    "requiredVerification": ["password", "2fa_if_over_threshold"]
  }
}
```
Notes:
- Never reveals balances; values are derived aggregates

### Errors and Enforcement
- 400: Validation errors (limit exceeded, schedule invalid, missing fields)
- 401/403: Auth or KYC gating
- 409: Concurrency (existing active loan with lender)
- 422: Business rule violation (daily limit, cooling-off)
- 429: Rate limit
- 500: Server error

Lending-specific error examples:
```json
{ "code": "LIMIT_EXCEEDED", "message": "Requested amount exceeds 75 percent cap" }
```

---

## Lending Intelligence

### Calculate Safe Lending Amount
**POST** `/api/lending/calculate-safe-amount`

Calculate the maximum safe lending amount based on account balances and lending policies.

**Request Body:**
```json
{
  "requestedAmount": 50000,
  "approvedEmergency": false
}
```

**Response:**
```json
{
  "safeAmount": 45000,
  "recommendedAmount": 45000,
  "sourceBreakdown": {
    "Fun": 25000,
    "Charity": 15000,
    "Daily": 5000
  },
  "policy": {
    "monthlyCap": 3,
    "capsUsed": 1,
    "nextAllowedDate": "2025-10-01T00:00:00.000Z",
    "coolOffDays": 0,
    "coolOffEndsAt": null,
    "last90NonRepayables": 1
  }
}
```

**Policy Fields:**
- `monthlyCap`: Maximum non-repayable lendings allowed per month
- `capsUsed`: Number of non-repayable lendings used this month
- `coolOffDays`: Days to wait before next non-repayable lending
- `last90NonRepayables`: Count of non-repayable lendings in last 90 days

**Error Responses:**
- `400 Bad Request`: When requestedAmount is missing or invalid
- `400 Bad Request`: When requestedAmount exceeds safe lending capacity

### Get Borrower Trust Score
**GET** `/api/lending/score?contact={phone}&name={borrowerName}`

Get a trust score (0-100) for a borrower based on their lending history.

**Query Parameters:**
- `contact` (optional): Borrower's phone number
- `name` (optional): Borrower's name
- At least one parameter must be provided

**Response:**
```json
{
  "score": 85,
  "factors": {
    "total": 12,
    "repaid": 10,
    "overdue": 1,
    "writtenOff": 1,
    "avgAmount": 15000,
    "monthsActive": 8,
    "repaymentRate": 0.83
  }
}
```

**Score Calculation Factors:**
- Repayment rate (60% weight): `repaid / total`
- History length (20% weight): `monthsActive / 12` (capped at 1)
- Activity level (10% weight): `total / 10` (capped at 1)
- Overdue penalty (40% weight): `overdue / total`

### Create Lending
**POST** `/api/lending`

Create a new lending record with enhanced policy enforcement.

**Request Body:**
```json
{
  "borrowerName": "John Doe",
  "borrowerContact": "+254700000000",
  "amount": 25000,
  "type": "non-emergency",
  "expectedReturnDate": "2025-10-15",
  "notes": "Personal loan for business startup",
  "repayable": true
}
```

**Response:** `201 Created`
```json
{
  "_id": "lending_id",
  "user": "user_id",
  "borrowerName": "John Doe",
  "borrowerContact": "+254700000000",
  "amount": 25000,
  "type": "non-emergency",
  "repayable": true,
  "status": "pending",
  "expectedReturnDate": "2025-10-15T00:00:00.000Z",
  "notes": "Personal loan for business startup",
  "sourceAccounts": [
    {
      "account": "account_id",
      "amount": 25000
    }
  ],
  "createdAt": "2025-09-27T19:39:34.885Z"
}
```

**Enhanced Error Responses:**
- `400 Bad Request`: "Exceeded non-repayable lending cap for this month"
  ```json
  {
    "message": "Exceeded non-repayable lending cap for this month",
    "capsUsed": 3,
    "monthlyCap": 3,
    "nextAllowedDate": "2025-10-01T00:00:00.000Z"
  }
  ```
- `429 Too Many Requests`: "Cool-off period in effect for non-repayable lending"
  ```json
  {
    "message": "Cool-off period in effect for non-repayable lending",
    "last90NonRepayables": 3,
    "coolOffDays": 60,
    "coolOffEndsAt": "2025-11-26T19:39:34.885Z"
  }
  ```
- `400 Bad Request`: "Requested amount exceeds safe lending capacity"
  ```json
  {
    "message": "Requested amount exceeds safe lending capacity",
    "recommendedAmount": 30000,
    "sourceBreakdown": {
      "Fun": 15000,
      "Charity": 9000,
      "Daily": 6000
    }
  }
  ```

**Policy Enforcement:**
- Monthly caps for non-repayable lendings (default: 3 per month)
- Cool-off periods based on recent non-repayable activity:
  - 2+ non-repayables in 90 days: 30-day cool-off
  - 3+ non-repayables in 90 days: 60-day cool-off
- Safe lending limits based on account types:
  - Fun accounts: 50% of balance
  - Charity accounts: 30% of balance
  - Daily accounts: 20% of balance
  - Emergency/LongTerm: 10% of balance (with approval)

### Get Lending Analytics
**GET** `/api/lending/analytics?period={period}`

Get lending analytics and statistics for a specified period.

**Query Parameters:**
- `period` (optional): Time period for analytics
  - `month` (default): Current month
  - `quarter`: Current quarter
  - `year`: Current year

**Response:**
```json
{
  "period": "month",
  "startDate": "2025-09-01T00:00:00.000Z",
  "totalLendings": 15,
  "totalAmountLent": 350000,
  "repaidCount": 12,
  "outstandingCount": 2,
  "writtenOffCount": 1,
  "repaymentRate": "80.00"
}
```

**Period Options:**
- `month`: Analytics for current calendar month
- `quarter`: Analytics for current quarter (Jan-Mar, Apr-Jun, Jul-Sep, Oct-Dec)
- `year`: Analytics for current calendar year

### List Lendings
**GET** `/api/lending`

Get all lending records for the authenticated user.

**Response:**
```json
[
  {
    "_id": "lending_id",
    "borrowerName": "John Doe",
    "borrowerContact": "+254700000000",
    "amount": 25000,
    "type": "non-emergency",
    "repayable": true,
    "status": "pending",
    "expectedReturnDate": "2025-10-15T00:00:00.000Z",
    "createdAt": "2025-09-27T19:39:34.885Z"
  }
]
```

### Update Lending Status
**PUT** `/api/lending/{id}/status`

Update the status of a lending record.

**Request Body:**
```json
{
  "status": "repaid",
  "actualReturnDate": "2025-10-10"
}
```

**Status Options:**
- `pending`: Awaiting repayment
- `repaid`: Successfully repaid
- `overdue`: Past expected return date
- `written_off`: Loan written off as loss

### Get Lending Ledger
**GET** `/api/lending/ledger`

Get outstanding lendings and total outstanding amount.

**Response:**
```json
{
  "lendings": [
    {
      "_id": "lending_id",
      "borrowerName": "John Doe",
      "amount": 25000,
      "expectedReturnDate": "2025-10-15T00:00:00.000Z",
      "status": "pending"
    }
  ],
  "totalOutstanding": 25000
}
```

---

## Enhanced Overdue Reminder System

The Vault5 overdue reminder system provides intelligent, multi-channel communication with escalating reminders, grace period management, and comprehensive analytics.

### Key Features

- **Escalating Reminders**: 4-tier system (1st, 2nd, 3rd, final) with increasing urgency
- **Multi-Channel Support**: Email, SMS, push notifications, WhatsApp
- **Time-Zone Awareness**: Respects user preferred contact hours
- **Business Rules Engine**: Grace periods with intelligent adjustments
- **Complete Analytics**: Delivery tracking, response rates, effectiveness metrics

### Grace Period Management

#### Get Grace Period Settings
**GET** `/api/grace-period/settings`

Get user's current grace period and reminder preferences.

**Response:**
```json
{
  "success": true,
  "settings": {
    "enabled": true,
    "channels": {
      "email": true,
      "sms": false,
      "push": true,
      "whatsapp": false
    },
    "gracePeriods": {
      "emergency": 1,
      "nonEmergency": 3
    },
    "escalationSchedule": {
      "firstReminder": 1,
      "secondReminder": 7,
      "thirdReminder": 14,
      "finalReminder": 30
    },
    "preferredContactTimes": {
      "startHour": 9,
      "endHour": 18,
      "timezone": "Africa/Nairobi"
    },
    "templates": {
      "preferredTone": "professional"
    }
  }
}
```

#### Update Grace Period Settings
**PUT** `/api/grace-period/settings`

Update user's grace period and reminder preferences.

**Request Body:**
```json
{
  "enabled": true,
  "channels": {
    "email": true,
    "sms": true,
    "push": true,
    "whatsapp": false
  },
  "gracePeriods": {
    "emergency": 2,
    "nonEmergency": 5
  },
  "escalationSchedule": {
    "firstReminder": 1,
    "secondReminder": 7,
    "thirdReminder": 14,
    "finalReminder": 30
  },
  "preferredContactTimes": {
    "startHour": 8,
    "endHour": 20,
    "timezone": "Africa/Nairobi"
  }
}
```

#### Get Grace Period Explanation
**GET** `/api/grace-period/explanation/{lendingId}`

Get detailed explanation of how grace period was calculated for a specific lending.

**Response:**
```json
{
  "success": true,
  "explanation": {
    "baseGracePeriod": 3,
    "effectiveGracePeriod": 5,
    "totalAdjustment": 2,
    "adjustments": [
      {
        "type": "loyalty_bonus",
        "description": "Extended grace period for loyal user",
        "adjustment": 2
      }
    ]
  }
}
```

#### Get Default Configurations
**GET** `/api/grace-period/defaults`

Get default grace period configurations and business rules.

**Query Parameters:**
- `userTier`: User tier (basic, premium, enterprise)
- `lendingType`: Lending type (emergency, non-emergency)

### Enhanced Scheduler

#### Process Overdue Reminders
**POST** `/api/scheduler/process-overdue-reminders`

Manually trigger overdue reminder processing (admin/system use).

**Response:**
```json
{
  "success": true,
  "results": {
    "processed": 0,
    "remindersSent": {
      "first": 2,
      "second": 1,
      "third": 0,
      "final": 0,
      "collection": 0,
      "legal": 0
    },
    "errors": []
  }
}
```

#### Get Overdue Summary
**GET** `/api/scheduler/overdue-summary`

Get summary of user's overdue lendings with reminder status.

**Response:**
```json
{
  "success": true,
  "summary": {
    "totalCount": 3,
    "totalAmount": 75000,
    "lendings": [
      {
        "id": "lending_id",
        "borrowerName": "John Doe",
        "borrowerContact": "+254700000000",
        "amount": 25000,
        "expectedReturnDate": "2025-09-15T00:00:00.000Z",
        "daysOverdue": 22,
        "lastReminderSent": "2025-09-20T10:00:00.000Z",
        "reminderTier": "second"
      }
    ]
  }
}
```

#### Process User Overdue Reminders
**POST** `/api/scheduler/process-user-overdue`

Process overdue reminders for current user only (for testing).

**Response:**
```json
{
  "success": true,
  "message": "User overdue reminders processed successfully",
  "results": {
    "processed": 2,
    "remindersSent": {
      "first": 1,
      "second": 1,
      "third": 0,
      "final": 0,
      "collection": 0,
      "legal": 0
    },
    "errors": []
  }
}
```

### Reminder Analytics

#### Get Reminder Effectiveness
**GET** `/api/notifications/reminder-effectiveness`

Get analytics on reminder effectiveness over time.

**Query Parameters:**
- `userId`: Specific user ID (admin only)
- `days`: Number of days to analyze (default: 30)

**Response:**
```json
{
  "success": true,
  "effectiveness": [
    {
      "tier": "first",
      "total": 15,
      "effective": 12,
      "effectivenessRate": 80.0
    },
    {
      "tier": "second",
      "total": 8,
      "effective": 6,
      "effectivenessRate": 75.0
    }
  ]
}
```

### Enhanced Notification Types

The system now supports specialized overdue reminder notification types:

- `lending_overdue_first`: First reminder (1 day overdue)
- `lending_overdue_second`: Second reminder (7 days overdue)
- `lending_overdue_third`: Third reminder (14 days overdue)
- `lending_overdue_final`: Final reminder (30 days overdue)
- `lending_overdue_collection`: Collections escalation
- `lending_overdue_legal`: Legal notice

### Reminder History Tracking

All reminder communications are tracked with detailed metadata:

```json
{
  "_id": "reminder_id",
  "user": "user_id",
  "lending": "lending_id",
  "tier": "first",
  "daysOverdue": 3,
  "template": "friendly",
  "status": "sent",
  "providerResponse": [
    {
      "channel": "email",
      "success": true,
      "messageId": "email_123"
    }
  ],
  "createdAt": "2025-09-15T10:00:00.000Z"
}
```

### Business Rules Engine

The grace period calculation considers multiple factors:

**Automatic Adjustments:**
- **Loyalty Bonus**: +2 days for users with 10+ successful lendings
- **Seasonal Adjustments**: ±1-3 days based on month (holidays, tax season)
- **Weekend Extension**: +1 day if due date falls on weekend
- **Amount-Based**: Small amounts get +1 day, large amounts get -1 to -2 days
- **Risk Factors**: High-risk borrowers get 50% reduction

**User Preferences:**
- Custom grace periods per lending type
- Preferred communication channels
- Contact time restrictions
- Escalation schedule customization

---

## Payment Methods

### Get Stripe Config
**GET** `/api/payment-methods/stripe/config`

Get Stripe publishable key for frontend integration.

**Response:**
```json
{
  "publishableKey": "pk_test_..."
}
```

### Create Setup Intent
**POST** `/api/payment-methods/stripe/setup-intent`

Create a Stripe SetupIntent for card collection.

**Response:**
```json
{
  "clientSecret": "seti_...",
  "setupIntentId": "seti_..."
}
```

### Link Card
**POST** `/api/payment-methods/cards/link`

Link a card after successful SetupIntent confirmation.

**Request Body:**
```json
{
  "paymentMethodId": "pm_..."
}
```

**Response:**
```json
{
  "data": {
    "_id": "card_id",
    "brand": "visa",
    "last4": "4242",
    "expMonth": 12,
    "expYear": 2026,
    "isDefault": false
  }
}
```

### List Cards
**GET** `/api/payment-methods/cards`

List all linked payment methods.

**Response:**
```json
{
  "data": [
    {
      "_id": "card_id",
      "brand": "visa",
      "last4": "4242",
      "expMonth": 12,
      "expYear": 2026,
      "isDefault": true
    }
  ]
}
```

### Set Default Card
**PATCH** `/api/payment-methods/cards/{id}/default`

Set a card as the default payment method.

**Response:**
```json
{
  "message": "Default card updated"
}
```

### Remove Card
**DELETE** `/api/payment-methods/cards/{id}`

Remove a linked card.

**Response:**
```json
{
  "message": "Card removed"
}
```

---

## Subscriptions

### Create Subscription
**POST** `/api/subscriptions`

Create a new subscription.

**Request Body:**
```json
{
  "merchantName": "Netflix",
  "merchantUrl": "https://netflix.com",
  "amount": 1500,
  "currency": "KES",
  "interval": "monthly",
  "paymentSource": "wallet",
  "paymentMethodId": "card_id", // if paymentSource is 'card'
  "description": "Monthly subscription"
}
```

**Response:**
```json
{
  "data": {
    "_id": "sub_id",
    "merchantName": "Netflix",
    "amount": 1500,
    "interval": "monthly",
    "status": "active",
    "nextBillingDate": "2025-10-01T00:00:00.000Z"
  }
}
```

### List Subscriptions
**GET** `/api/subscriptions`

List all subscriptions with optional status filter.

**Query Parameters:**
- `status`: Filter by status (active, paused, canceled, etc.)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response:**
```json
{
  "data": [
    {
      "_id": "sub_id",
      "merchantName": "Netflix",
      "amount": 1500,
      "interval": "monthly",
      "status": "active",
      "nextBillingDate": "2025-10-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 5,
    "pages": 1
  }
}
```

### Get Subscription
**GET** `/api/subscriptions/{id}`

Get details of a specific subscription.

**Response:**
```json
{
  "data": {
    "_id": "sub_id",
    "merchantName": "Netflix",
    "amount": 1500,
    "interval": "monthly",
    "status": "active",
    "nextBillingDate": "2025-10-01T00:00:00.000Z",
    "history": [
      {
        "date": "2025-09-01T00:00:00.000Z",
        "amount": 1500,
        "status": "success",
        "transactionId": "tx_123"
      }
    ]
  }
}
```

### Cancel Subscription
**PATCH** `/api/subscriptions/{id}/cancel`

Cancel a subscription.

**Request Body:**
```json
{
  "reason": "No longer needed"
}
```

**Response:**
```json
{
  "message": "Subscription canceled"
}
```

### Resume Subscription
**PATCH** `/api/subscriptions/{id}/resume`

Resume a paused subscription.

**Response:**
```json
{
  "message": "Subscription resumed"
}
```

### Charge Subscription Now
**POST** `/api/subscriptions/{id}/charge-now`

Manually charge a subscription (for testing).

**Response:**
```json
{
  "success": true,
  "message": "Subscription charged successfully",
  "data": {
    "transactionId": "tx_123"
  }
}
```

---

## Admin (Admin Only)

### Get Users
**GET** `/admin/users`

### KYC Queue
**GET** `/admin/kyc/queue`

### Approve KYC
**POST** `/admin/kyc/{userId}/approve`
```json
{
  "kycLevel": "tier_2",
  "approvedDocuments": ["passport"],
  "notes": "Approved"
}
```

### Reject KYC
**POST** `/admin/kyc/{userId}/reject`
```json
{
  "reason": "Poor document quality",
  "notes": "Please resubmit"
}
```

---

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 429 | Rate Limited |
| 500 | Server Error |

### Lending-Specific Error Codes

| Code | Description | Context |
|------|-------------|---------|
| 400 | "Exceeded non-repayable lending cap for this month" | Monthly cap enforcement |
| 400 | "Requested amount exceeds safe lending capacity" | Safe lending limit exceeded |
| 400 | "Cool-off period in effect for non-repayable lending" | Cool-off period enforcement |
| 400 | "requestedAmount is required and must be a number" | Invalid calculation input |
| 400 | "requestedAmount must be >= 0" | Negative amount requested |
| 400 | "Provide contact or name query parameter" | Missing borrower score parameters |
| 400 | "Valid amount is required" | Missing or invalid lending amount |

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data"
  }
}
```

---

## Rate Limits

| Endpoint | Requests | Window |
|----------|----------|--------|
| Auth | 5 | 15 minutes |
| Transactions | 100 | 1 minute |
| Transfers | 50 | 1 minute |
| Reports | 20 | 1 minute |

---

## SDK Examples

### JavaScript
```javascript
const client = new Vault5({ apiKey: 'your_key' });

const transaction = await client.transactions.create({
  type: 'income',
  amount: 50000,
  description: 'Salary',
  toAccountId: 'account_id'
});
```

### Python
```python
client = Vault5(api_key='your_key')
transaction = client.transactions.create(
    type='income',
    amount=50000,
    description='Salary',
    to_account_id='account_id'
)
```

---

## Lending Policy Enforcement

### Safe Lending Algorithm
The lending system uses a sophisticated algorithm to determine safe lending amounts:

**Account-Based Limits:**
- **Fun Accounts**: 50% of current balance
- **Charity Accounts**: 30% of current balance
- **Daily Accounts**: 20% of current balance
- **Emergency/LongTerm**: 10% of balance (requires approval)

**Source Priority:** Fun → Charity → Daily → Emergency/LongTerm

### Non-Repayable Lending Policies
**Monthly Caps:**
- Default limit: 3 non-repayable lendings per month
- Configurable per user via preferences
- Resets on the 1st of each month

**Cool-Off Periods:**
- 2+ non-repayables in 90 days: 30-day cool-off
- 3+ non-repayables in 90 days: 60-day cool-off
- Prevents lending fatigue and promotes responsible lending

### Borrower Trust Scoring
The system calculates trust scores based on lending history:

**Score Components:**
- **Repayment Rate (60%)**: Historical repayment performance
- **History Length (20%)**: Duration of lending relationship
- **Activity Level (10%)**: Volume of lending interactions
- **Overdue Penalty (40%)**: Deduction for overdue loans

**Score Ranges:**
- 80-100: Excellent repayment history
- 60-79: Good repayment history
- 40-59: Fair repayment history
- 0-39: Poor repayment history

### Risk Management Features
- **Pre-lending Validation**: All requests validated against policies
- **Source Account Tracking**: Funds deducted from appropriate accounts
- **Automatic Notifications**: Users notified of outstanding debts
- **Status Tracking**: Comprehensive lending lifecycle management

---

## Frontend Integration Notes

### Safe Amount Calculation Integration
```javascript
// Before creating a lending request
const safeAmount = await api.post('/api/lending/calculate-safe-amount', {
  requestedAmount: 50000,
  approvedEmergency: false
});

// Use the recommended amount for the lending request
const lendingRequest = {
  borrowerName: "John Doe",
  borrowerContact: "+254700000000",
  amount: Math.min(requestedAmount, safeAmount.recommendedAmount),
  // ... other fields
};
```

### Policy Enforcement Handling
```javascript
try {
  const lending = await api.post('/api/lending', lendingRequest);
} catch (error) {
  if (error.response?.status === 400) {
    const { message, capsUsed, monthlyCap, nextAllowedDate } = error.response.data;

    if (message.includes('Exceeded non-repayable lending cap')) {
      // Show monthly cap exceeded message
      showError(`Monthly cap exceeded: ${capsUsed}/${monthlyCap}. Next allowed: ${nextAllowedDate}`);
    } else if (message.includes('exceeds safe lending capacity')) {
      // Show safe lending limit message
      const { recommendedAmount, sourceBreakdown } = error.response.data;
      showError(`Amount exceeds safe limit. Maximum recommended: ${recommendedAmount}`);
    }
  } else if (error.response?.status === 429) {
    // Handle cool-off period
    const { coolOffDays, coolOffEndsAt } = error.response.data;
    showError(`Cool-off period active until ${new Date(coolOffEndsAt).toLocaleDateString()}`);
  }
}
```

### Borrower Score Integration
```javascript
// Get borrower score before lending
const score = await api.get('/api/lending/score', {
  params: { contact: '+254700000000' }
});

// Use score for lending decisions
if (score.data.score >= 70) {
  // High trust borrower - can proceed with higher amounts
  maxAmount = calculateMaxAmount(score.data.factors);
} else {
  // Lower trust borrower - apply stricter limits
  maxAmount = calculateConservativeAmount(score.data.factors);
}
```

### Analytics Dashboard Integration
```javascript
// Get lending analytics for dashboard
const analytics = await api.get('/api/lending/analytics', {
  params: { period: 'month' }
});

// Display key metrics
displayMetrics({
  totalLent: analytics.data.totalAmountLent,
  repaymentRate: analytics.data.repaymentRate,
  outstandingCount: analytics.data.outstandingCount
});
```

### Real-time Policy Updates
- Subscribe to lending policy changes via webhooks
- Cache policy data locally to reduce API calls
- Handle policy violations gracefully with user-friendly messages
- Provide clear guidance on when users can retry failed requests

---

## Support

- **Email:** developers@vault5.com
- **Docs:** docs.vault5.com
- **Status:** status.vault5.com

---

*For complete documentation, visit [docs.vault5.com](https://docs.vault5.com)*