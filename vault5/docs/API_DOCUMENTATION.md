# Vault5 API Documentation

## REST API Reference for Developers

**Version:** 1.0.0
**Base URL:** `https://api.vault5.com/v1`
**Date:** September 2024

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
**GET** `/reports/monthly?year=2024&month=1`

### Export Report
**POST** `/reports/export`
```json
{
  "reportType": "monthly",
  "format": "pdf",
  "period": {"year": 2024, "month": 1}
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

## Support

- **Email:** developers@vault5.com
- **Docs:** docs.vault5.com
- **Status:** status.vault5.com

---

*For complete documentation, visit [docs.vault5.com](https://docs.vault5.com)*