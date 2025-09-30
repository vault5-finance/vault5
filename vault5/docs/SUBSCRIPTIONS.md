# Subscriptions Management

## Data Model

### Subscription Schema
```javascript
{
  user: ObjectId, // User reference
  merchantName: String, // e.g., "Netflix"
  merchantUrl: String, // Optional merchant website
  amount: Number, // Amount in currency
  currency: String, // Default: 'KES'
  interval: String, // 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
  nextBillingDate: Date, // Next charge date
  status: String, // 'active', 'paused', 'canceled', 'expired', 'failed'
  paymentSource: String, // 'wallet' or 'card'
  paymentMethodId: ObjectId, // Reference to PaymentMethod if card
  history: [{ // Billing history
    date: Date,
    amount: Number,
    status: String, // 'success', 'failed', 'pending'
    transactionId: String,
    error: String
  }],
  retryCount: Number, // Current retry attempts
  maxRetries: Number, // Default: 3
  lastRetryDate: Date,
  description: String, // Optional notes
  tags: [String], // Categorization tags
  canceledAt: Date, // Cancellation timestamp
  cancelReason: String
}
```

## Lifecycle

### States
- **Active**: Normal billing state
- **Paused**: Temporarily suspended, can be resumed
- **Canceled**: Permanently ended, no more billing
- **Expired**: End date reached
- **Failed**: Max retries exceeded, requires intervention

### Transitions
```
Created → Active
Active → Paused (user action)
Paused → Active (user action)
Active → Canceled (user action)
Active → Failed (billing failures)
Failed → Active (user intervention)
Any → Expired (end date)
```

## Billing Engine

### Scheduling
- Cron job runs daily to check due subscriptions
- Processes subscriptions where `nextBillingDate <= now`
- Updates `nextBillingDate` after successful billing

### Payment Priority
1. **Wallet First**: Attempt wallet debit
2. **Card Fallback**: If wallet insufficient, charge default card
3. **Failure Handling**: Retry logic with notifications

### Retry Logic
- Max 3 retries per billing cycle
- Exponential backoff: 1 day, 3 days, 7 days
- Notifications sent for each retry attempt
- Final failure marks subscription as 'failed'

## Notifications

### Events
- **subscription_created**: New subscription added
- **subscription_canceled**: User canceled subscription
- **subscription_charged**: Successful billing
- **subscription_charge_failed**: Billing attempt failed
- **subscription_resumed**: Paused subscription reactivated

### Templates
```javascript
// Success notification
{
  title: "Subscription Charged",
  message: `Charged ${currency} ${amount} for ${merchantName}`,
  type: "subscription"
}

// Failure notification
{
  title: "Subscription Charge Failed",
  message: `Failed to charge subscription for ${merchantName}: ${error}`,
  type: "subscription"
}
```

## API Endpoints

### CRUD Operations
- `POST /api/subscriptions` - Create
- `GET /api/subscriptions` - List with pagination
- `GET /api/subscriptions/:id` - Get details
- `PATCH /api/subscriptions/:id/cancel` - Cancel
- `PATCH /api/subscriptions/:id/resume` - Resume
- `POST /api/subscriptions/:id/charge-now` - Manual charge

### Validation
- Amount must be positive
- Interval must be valid enum
- Payment source validation
- Card existence check for card payments

## Security

### Access Control
- Users can only manage their own subscriptions
- Admin override capabilities for support
- Audit logging for all changes

### Fraud Prevention
- Rate limiting on subscription creation
- Amount caps based on user tier
- Duplicate merchant prevention

## Analytics

### Metrics
- Total active subscriptions per user
- Monthly spending by category
- Failure rates and retry success
- Payment method distribution

### Reporting
```javascript
// Subscription analytics
{
  totalSubscriptions: 15,
  activeSubscriptions: 12,
  monthlySpend: 45000,
  failureRate: 0.05,
  paymentMethodBreakdown: {
    wallet: 8,
    card: 4
  }
}
```

## Testing

### Test Scenarios
1. **Happy Path**: Wallet sufficient, successful billing
2. **Fallback**: Wallet insufficient, card charges
3. **Retry Logic**: Failed payments with retries
4. **Cancellation**: User cancels mid-cycle
5. **Resume**: Paused subscription reactivation

### Mock Data
```javascript
const testSubscription = {
  merchantName: "Test Service",
  amount: 1000,
  interval: "monthly",
  paymentSource: "wallet",
  nextBillingDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
};
```

## Integration

### Frontend
```javascript
// Create subscription
const subscription = await api.post('/api/subscriptions', {
  merchantName: "Netflix",
  amount: 1500,
  interval: "monthly",
  paymentSource: "wallet"
});

// List subscriptions
const { data: subscriptions } = await api.get('/api/subscriptions');
```

### Scheduler
```bash
# Run daily billing
node backend/scripts/process-subscriptions.js

# Or via cron
0 9 * * * /usr/bin/node /path/to/process-subscriptions.js
```

## Future Enhancements

- **Smart Scheduling**: AI-based optimal billing dates
- **Bulk Operations**: Cancel multiple subscriptions
- **Merchant Integration**: Direct merchant API connections
- **Advanced Analytics**: Spending insights and recommendations
- **Multi-Currency**: Support for international subscriptions