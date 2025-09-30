# Vault5 Pay

## Concept

Vault5 Pay is a wallet-first payment system that enables users to make online purchases and manage subscriptions using their Vault5 wallet balance, with automatic fallback to linked cards when wallet funds are insufficient.

## Unique Value Proposition

Unlike traditional payment processors, Vault5 Pay:
- Prioritizes wallet spending to encourage financial discipline
- Automatically falls back to cards without user intervention
- Tracks all payments in financial allocation system
- Provides merchant-like features for future expansion

## Checkout Flow

### 1. Wallet-First Payment
```javascript
// Check wallet balance first
const walletBalance = await api.get('/api/wallet/balance');
if (walletBalance >= amount) {
  // Pay from wallet
  const result = await debitWallet(amount, 'Purchase: ' + merchantName);
} else {
  // Fallback to card
  const defaultCard = await getDefaultCard();
  const result = await chargeCard(amount, defaultCard.id);
}
```

### 2. Eligibility Checks
- KYC level verification
- Transaction limits based on account tier
- Fraud detection scoring
- Geo and device validation

### 3. Risk Assessment
- Amount-based risk scoring
- Merchant reputation checks
- User behavior analysis
- Velocity limits enforcement

## Subscription Integration

### Automatic Billing
- Wallet debited first for recurring payments
- Card fallback for failed wallet payments
- Retry logic with exponential backoff
- Notifications for all billing events

### Lifecycle Management
- Create, pause, resume, cancel subscriptions
- Billing history tracking
- Failed payment handling
- Merchant notifications

## Refunds

### Wallet Refunds
- Instant credit to wallet balance
- Automatic allocation to appropriate accounts
- Transaction reversal tracking

### Card Refunds
- Processed through Stripe
- 3-5 business days for card refunds
- Notification system for refund status

## Merchant Integration (Future)

### SDK
```javascript
// Merchant integration
const vault5Pay = new Vault5Pay({
  merchantId: 'merchant_123',
  apiKey: 'sk_live_...'
});

// Create payment intent
const intent = await vault5Pay.createPaymentIntent({
  amount: 10000,
  currency: 'KES',
  description: 'Product purchase',
  walletFirst: true
});

// Handle payment
const result = await vault5Pay.confirmPayment(intent.id, {
  paymentMethod: 'wallet'
});
```

### Webhooks
- Payment success/failure notifications
- Subscription lifecycle events
- Refund processing updates
- Dispute handling

## Security Features

### Fraud Prevention
- Device fingerprinting
- IP geolocation checks
- Transaction velocity monitoring
- Amount threshold alerts

### Compliance
- PCI DSS SAQ-A for card processing
- AML/KYC integration
- Transaction monitoring
- Audit logging

## Roadmap

### Phase 1 (Current)
- Wallet-first payments
- Card fallback
- Basic subscription management
- Refund processing

### Phase 2 (Next)
- Merchant onboarding portal
- Advanced fraud detection
- Multi-currency support
- BNPL integration

### Phase 3 (Future)
- P2P payments
- Cross-border transfers
- Crypto integration
- Advanced analytics

## API Reference

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md#subscriptions) for subscription endpoints.

## Testing

### Test Scenarios
1. Wallet sufficient → Wallet payment
2. Wallet insufficient → Card fallback
3. Both insufficient → Payment declined
4. Subscription billing cycles
5. Failed payment retries

### Mock Data
```javascript
// Test wallet balance
const testWallet = {
  balance: 50000,
  available: 45000
};

// Test card
const testCard = {
  id: 'pm_test_visa',
  brand: 'visa',
  last4: '4242'
};
```

## Support

For integration questions:
- Email: developers@vault5.com
- Docs: docs.vault5.com/vault5-pay
- Status: status.vault5.com