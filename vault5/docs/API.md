# Vault5 API Documentation

## Overview

Vault5 provides a comprehensive REST API for financial management, compliance, and administration. This document covers all available endpoints, authentication, and usage examples.

## Base URL
```
Production: https://api.vault5.com
Development: http://localhost:5000
```

## Authentication

### JWT Bearer Token
All API requests require authentication using JWT tokens in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

### Login to get JWT token
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "64f...",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "user"
  },
  "redirect": "/dashboard"
}
```

## Rate Limits

- **Authentication endpoints**: 20 requests per 15 minutes
- **General endpoints**: 100 requests per 15 minutes
- **Admin endpoints**: 200 requests per 15 minutes

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1640995200
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE"
}
```

### Pagination
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

---

# Core API Endpoints

## Authentication

### POST /api/auth/login
Authenticate user and return JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "user"
  },
  "redirect": "/dashboard"
}
```

### POST /api/auth/register/step1
Start multi-step registration.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

### POST /api/auth/register/step2
Complete personal information.

**Request:**
```json
{
  "userId": "temp_user_id",
  "firstName": "John",
  "middleName": "M",
  "lastName": "Doe",
  "dob": "1990-01-01",
  "phone": "+254712345678",
  "city": "Nairobi"
}
```

### GET /api/auth/profile
Get current user profile.

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "name": "John Doe",
    "emails": [...],
    "phones": [...],
    "role": "user",
    "kycLevel": "Tier0",
    "limitationStatus": "none",
    "accounts": [...]
  }
}
```

## Accounts Management

### GET /api/accounts
List user's accounts with balances and targets.

**Query Parameters:**
- `includeBalances`: boolean (default: true)
- `includeTargets`: boolean (default: true)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "account_id",
      "type": "Daily",
      "percentage": 50,
      "balance": 25000,
      "target": 50000,
      "status": "green",
      "isWallet": true,
      "isAutoDistribute": true
    }
  ]
}
```

### POST /api/accounts/income
Add income and allocate to accounts.

**Request:**
```json
{
  "amount": 50000,
  "description": "Monthly Salary",
  "tag": "salary",
  "destination": "auto"  // or "wallet"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Income allocated successfully",
  "data": {
    "transactionId": "tx_id",
    "allocations": [
      {
        "account": "Daily",
        "amount": 25000,
        "balance": 35000
      }
    ]
  }
}
```

### PATCH /api/accounts/:id/flags
Update account flags (wallet/auto-distribute).

**Request:**
```json
{
  "isWallet": true,
  "isAutoDistribute": false
}
```

## Transactions

### GET /api/transactions
List user transactions with pagination.

**Query Parameters:**
- `page`: number (default: 1)
- `limit`: number (default: 20)
- `startDate`: ISO date string
- `endDate`: ISO date string
- `account`: account ID
- `type`: transaction type

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "tx_id",
      "amount": 25000,
      "description": "Salary allocation",
      "type": "income",
      "account": "Daily",
      "date": "2025-01-15T10:00:00Z",
      "status": "completed"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### POST /api/transactions
Create new transaction (subject to compliance gates).

**Request:**
```json
{
  "amount": 5000,
  "description": "Grocery shopping",
  "type": "expense",
  "account": "Daily"
}
```

### GET /api/transactions/summary
Get transaction summary for period.

**Query Parameters:**
- `period`: "week" | "month" | "quarter" | "year" (default: "month")

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "month",
    "income": 150000,
    "expenses": 75000,
    "net": 75000,
    "byAccount": {
      "Daily": { "income": 75000, "expenses": 35000, "net": 40000 },
      "Emergency": { "income": 15000, "expenses": 0, "net": 15000 }
    }
  }
}
```

## Payments

Payments enable users to Add Funds (deposits) and Send Money (payouts) via provider-agnostic endpoints. In development, providers are simulated; in production, M-Pesa Daraja and Airtel Money are used. See [PAYMENTS.md](vault5/docs/PAYMENTS.md) and [MpesaDaraja.md](vault5/docs/MpesaDaraja.md).

Security and Compliance
- Deposits allow income even under limitations via [limitationGateOutgoing](vault5/backend/middleware/compliance.js:140).
- Amount and frequency checks enforced via [capsGate](vault5/backend/middleware/compliance.js:178) and [velocityGate](vault5/backend/middleware/compliance.js:229).
- Provider credentials are environment variables. Never commit secrets.

Data Model
- On success, deposit triggers allocation via [transactionsController.createTransaction()](vault5/backend/controllers/transactionsController.js:1) with type: income and source: deposit. The PaymentIntent model (to be introduced) tracks status, provider, and references.

### POST /api/payments/deposits/initiate
Start a deposit (Add Funds) via provider (mpesa, airtel, bank). Returns a PaymentIntent and an initial state (pending or awaiting_user).

Request:
```json
{
  "provider": "mpesa",           // "mpesa" | "airtel" | "bank"
  "amount": 2500,                 // > 0
  "currency": "KES",              // default KES
  "targetAccount": "Daily",       // one of user's configured accounts or "wallet"
  "phone": "2547XXXXXXXX"         // required for mpesa/airtel
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "pi_64f...",
    "status": "awaiting_user",    // or "pending" depending on provider
    "provider": "mpesa",
    "providerRef": "CheckoutRequestID-or-sim-ref",
    "amount": 2500,
    "currency": "KES",
    "targetAccount": "Daily"
  },
  "message": "Deposit initiated. Follow on-screen instructions."
}
```

Notes:
- Simulated providers return awaiting_user and auto-complete after a delay unless manually confirmed.

### POST /api/payments/deposits/confirm
Development-only endpoint to force-confirm a simulated deposit when no public callback is available (e.g., local testing without ngrok).

Request:
```json
{
  "id": "pi_64f..."               // or { "providerRef": "..." }
}
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "pi_64f...",
    "status": "success"
  },
  "message": "Deposit confirmed"
}
```

### POST /api/payments/providers/mpesa/callback
Provider callback for M-Pesa STK Push result. In sandbox/production, Safaricom calls this URL to deliver the final status.

Request (example shape, actual fields depend on Daraja):
```json
{
  "Body": {
    "stkCallback": {
      "MerchantRequestID": "29115-34620561-1",
      "CheckoutRequestID": "ws_CO_191220191020363925",
      "ResultCode": 0,
      "ResultDesc": "The service request is processed successfully.",
      "CallbackMetadata": {
        "Item": [
          { "Name": "Amount", "Value": 2500 },
          { "Name": "MpesaReceiptNumber", "Value": "NLJ7RT61SV" },
          { "Name": "TransactionDate", "Value": 20191219102115 },
          { "Name": "PhoneNumber", "Value": 2547XXXXXXXX }
        ]
      }
    }
  }
}
```

Response:
```json
{ "success": true }
```

### POST /api/payments/providers/airtel/callback
Provider callback for Airtel Money. Shape varies by Airtel API; stored in providerMeta for auditing.

Response:
```json
{ "success": true }
```

### GET /api/payments/transactions/:id/status
Get current status of a PaymentIntent.

Response:
```json
{
  "success": true,
  "data": {
    "id": "pi_64f...",
    "status": "awaiting_user",  // "pending" | "success" | "failed" | "canceled" | "expired"
    "provider": "mpesa",
    "providerRef": "CheckoutRequestID",
    "amount": 2500,
    "currency": "KES"
  }
}
```

### GET /api/payments/recent
List the most recent payment intents for the authenticated user.

Query Parameters:
- page: number (default: 1)
- limit: number (default: 20)
- type: "deposit" | "payout" (optional)
- provider: "mpesa" | "airtel" | "bank" (optional)
- status: "pending" | "awaiting_user" | "success" | "failed" | "canceled" | "expired" (optional)

Response:
```json
{
  "success": true,
  "data": [
    {
      "id": "pi_64f...",
      "type": "deposit",
      "provider": "mpesa",
      "status": "success",
      "amount": 2500,
      "currency": "KES",
      "targetAccount": "Daily",
      "createdAt": "2025-01-01T10:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

Frontend Integration Notes
- UI exposes two primary actions on Dashboard: Add Funds and Send Money.
- Add Funds opens a modal that:
  1) Selects target account
  2) Selects provider (mpesa, airtel, bank)
  3) Captures phone and amount
  4) Confirms summary
  5) Waits for status (awaiting_user → success/failed)
- On success, the UI refreshes allocations and shows a breakdown.

See also:
- [PAYMENTS.md](vault5/docs/PAYMENTS.md)
- [MpesaDaraja.md](vault5/docs/MpesaDaraja.md)
## Reports & Analytics

### GET /api/reports/dashboard
Get dashboard data including wallet balance, allocations, and health metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "walletBalance": 45000,
    "totalBalance": 285000,
    "allocations": [
      {
        "account": "Daily",
        "percentage": 50,
        "balance": 45000,
        "target": 50000,
        "status": "green"
      }
    ],
    "recentTransactions": [...],
    "complianceStatus": {
      "limitationStatus": "none",
      "kycLevel": "Tier0",
      "payoutEligible": false
    },
    "healthScore": 85
  }
}
```

### GET /api/reports/cashflow
Get cashflow report with projections.

**Query Parameters:**
- `period`: "month" | "quarter" | "year" (default: "month")
- `includeProjections`: boolean (default: true)

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "month",
    "actual": {
      "income": 150000,
      "expenses": 75000,
      "savings": 75000
    },
    "projected": {
      "income": 165000,
      "expenses": 82500,
      "savings": 82500
    },
    "trends": {
      "incomeGrowth": 10,
      "expenseGrowth": 10,
      "savingsRate": 50
    }
  }
}
```

## Loans Management

### GET /api/loans
List user loans.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "loan_id",
      "amount": 100000,
      "remaining": 75000,
      "interestRate": 12,
      "term": 12,
      "monthlyPayment": 9167,
      "nextPayment": "2025-02-01",
      "status": "active"
    }
  ]
}
```

### POST /api/loans
Create new loan (subject to eligibility gates).

**Request:**
```json
{
  "amount": 100000,
  "description": "Car purchase",
  "term": 12,
  "interestRate": 12
}
```

### POST /api/loans/:id/repay
Make loan repayment.

**Request:**
```json
{
  "amount": 9167,
  "account": "Daily"
}
```

## Lending

### GET /api/lending
List lending transactions.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "lend_id",
      "amount": 10000,
      "recipient": "Family member",
      "purpose": "Medical emergency",
      "expectedReturn": "2025-03-01",
      "status": "outstanding"
    }
  ]
}
```

### POST /api/lending
Record lending transaction.

**Request:**
```json
{
  "amount": 10000,
  "recipient": "John Doe",
  "purpose": "Emergency",
  "expectedReturn": "2025-03-01"
}
```

---

# Compliance API

## User Compliance

### GET /api/compliance/status
Get user's compliance status.

**Response:**
```json
{
  "success": true,
  "data": {
    "limitationStatus": "none",
    "limitationReason": "",
    "limitationExpiresAt": null,
    "reserveReleaseAt": null,
    "kycLevel": "Tier0",
    "payoutEligible": false,
    "reserves": [],
    "serverTime": "2025-01-15T10:00:00Z"
  }
}
```

### POST /api/compliance/kyc
Submit KYC request.

**Request:**
```json
{
  "levelRequested": "Tier1",
  "documents": [
    {
      "type": "nat_id",
      "url": "/uploads/kyc/nat_id.jpg"
    }
  ]
}
```

### GET /api/compliance/kyc
List user's KYC requests.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "kyc_id",
      "levelRequested": "Tier1",
      "status": "pending",
      "documents": [...],
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

### POST /api/compliance/payouts
Request payout after reserve period.

**Request:**
```json
{
  "amount": 50000,
  "destination": {
    "bankName": "KCB Bank",
    "accountName": "John Doe",
    "accountNumber": "1234567890",
    "bankCode": "01"
  }
}
```

## Admin Compliance

### GET /api/admin/compliance/audit-logs
Get audit logs (JSON).

**Query Parameters:**
- `page`: number
- `limit`: number
- `action`: string
- `user`: user ID
- `startDate`: ISO date
- `endDate`: ISO date

### GET /api/admin/compliance/audit-logs.csv
Export audit logs as CSV.

### GET /api/admin/compliance/kyc
Get KYC review queue.

**Query Parameters:**
- `status`: "pending" | "approved" | "rejected" | "more_info"

### PATCH /api/admin/compliance/kyc/:id
Review KYC request.

**Request:**
```json
{
  "action": "approve",  // or "reject" or "more_info"
  "notes": "Documents verified"
}
```

### GET /api/admin/compliance/limitations
List account limitations.

**Query Parameters:**
- `status`: "active" | "lifted" | "expired"

### POST /api/admin/compliance/limitations
Impose limitation.

**Request:**
```json
{
  "userId": "user_id",
  "type": "temporary_180",
  "reason": "Suspicious activity detected"
}
```

### PATCH /api/admin/compliance/limitations/:id/lift
Lift limitation.

### GET /api/admin/compliance/payouts
List pending payouts.

### PATCH /api/admin/compliance/payouts/:id
Process payout.

**Request:**
```json
{
  "action": "approve",  // or "reject" or "paid"
  "rejectionReason": "Invalid bank details"
}
```

## Policy Management

### GET /api/admin/compliance/policies/geo
Get geo allowlist policy.

**Response:**
```json
{
  "success": true,
  "data": {
    "mode": "allowlist",
    "countries": ["KE"],
    "updatedBy": "admin_id",
    "updatedAt": "2025-01-15T10:00:00Z"
  }
}
```

### PATCH /api/admin/compliance/policies/geo
Update geo policy.

**Request:**
```json
{
  "mode": "allowlist",
  "countries": ["KE", "US", "GB"]
}
```

### GET /api/admin/compliance/policies/ip
Get IP denylist.

### PATCH /api/admin/compliance/policies/ip
Update IP denylist.

**Request:**
```json
{
  "cidrs": ["1.2.3.0/24", "5.6.7.8/32"],
  "reason": "Suspicious activity"
}
```

### GET /api/admin/compliance/policies/device
Get device rules.

### PATCH /api/admin/compliance/policies/device
Update device rules.

**Request:**
```json
{
  "requireCookies": true,
  "forbidHeadless": true,
  "minSignals": 1
}
```

### GET /api/admin/compliance/policies/tiers
Get limit tiers.

### PATCH /api/admin/compliance/policies/tiers/:name
Update tier limits.

**Request:**
```json
{
  "dailyLimit": 10000,
  "monthlyLimit": 25000,
  "maxHoldBalance": 0,
  "minAccountAgeDays": 0
}
```

---

# Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Invalid request data |
| `AUTHENTICATION_ERROR` | Invalid or missing credentials |
| `AUTHORIZATION_ERROR` | Insufficient permissions |
| `NOT_FOUND` | Resource not found |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `COMPLIANCE_BLOCKED` | Action blocked by compliance rules |
| `ACCOUNT_LIMITED` | Account under limitation |
| `INSUFFICIENT_FUNDS` | Insufficient balance |
| `INVALID_AMOUNT` | Invalid transaction amount |

---

# Webhooks (Future)

Vault5 supports webhooks for real-time notifications:

```json
{
  "event": "transaction.created",
  "data": {
    "transactionId": "tx_id",
    "amount": 5000,
    "account": "Daily"
  },
  "timestamp": "2025-01-15T10:00:00Z"
}
```

Supported events:
- `transaction.created`
- `transaction.updated`
- `loan.repayment`
- `limitation.imposed`
- `limitation.lifted`
- `kyc.status_changed`
- `payout.processed`

---

# SDKs & Libraries

## JavaScript SDK (Planned)

```javascript
import { Vault5 } from 'vault5-sdk';

const client = new Vault5({
  apiKey: 'your_api_key',
  baseURL: 'https://api.vault5.com'
});

// Get account balance
const accounts = await client.accounts.list();

// Create transaction
const transaction = await client.transactions.create({
  amount: 5000,
  description: 'Coffee',
  account: 'Daily'
});
```

---

# Changelog

## v2.0.0 (Current)
- Complete compliance system with limitations and reserves
- Policy management for geo, IP, device rules
- Enhanced admin consoles
- Wallet vs auto-distribute allocation
- Multi-step registration flow

## v1.0.0
- Basic account management
- Transaction tracking
- Simple reporting
- User authentication

---

For additional support or questions, contact: support@vault5.com