# Vault5 API Documentation

## REST API Reference for Developers

**Version:** 1.0.0
**Base URL:** `https://api.vault5.com/v1`
**Date:** September 2025

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