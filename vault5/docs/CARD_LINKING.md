# Card Linking Documentation

## Overview

Vault5 supports linking credit and debit cards via Stripe for secure payment processing. Cards are tokenized and never stored in plain text on our servers.

## Supported Providers

- **Stripe**: Primary provider for Visa, Mastercard, American Express, Discover, Diners Club, JCB, UnionPay
- **Future**: PayPal, bank transfers (planned)

## Security Features

### Tokenization
- Cards are tokenized using Stripe's PCI DSS compliant infrastructure
- We never store PAN (Primary Account Number), CVV, or full card details
- Only last 4 digits, brand, and expiry are stored for user reference

### PCI DSS Compliance
- SAQ-A compliant (self-assessment questionnaire for merchants with no electronic card storage)
- No card data stored on Vault5 servers
- All sensitive operations handled by Stripe

### Device & Velocity Checks
- Device fingerprinting for fraud prevention
- Velocity limits on linking attempts
- Geo-blocking for high-risk regions

## Flow

### 1. Setup Intent Creation
```javascript
// Frontend requests setup intent
const response = await api.post('/api/payment-methods/stripe/setup-intent');
const { clientSecret } = response.data;
```

### 2. Card Collection
```javascript
// Use Stripe Elements to collect card
const stripe = loadStripe(publishableKey);
const elements = stripe.elements();
const cardElement = elements.create('card');
cardElement.mount('#card-element');

// Confirm setup
const result = await stripe.confirmCardSetup(clientSecret, {
  payment_method: { card: cardElement }
});
```

### 3. Link Card
```javascript
// Send payment method ID to backend
await api.post('/api/payment-methods/cards/link', {
  paymentMethodId: result.setupIntent.payment_method
});
```

## Error Handling

### Common Errors
- `card_declined`: Card was declined by issuer
- `expired_card`: Card has expired
- `incorrect_cvc`: CVC is incorrect
- `processing_error`: Temporary processing error

### Rate Limiting
- 5 linking attempts per hour per user
- 10 attempts per day per user
- Exponential backoff on failures

## Supported Card Types

| Brand | Supported | Notes |
|-------|-----------|-------|
| Visa | ✅ | All variants |
| Mastercard | ✅ | Debit and credit |
| American Express | ✅ | Including Amex variants |
| Discover | ✅ | US only |
| Diners Club | ✅ | International |
| JCB | ✅ | Japan Credit Bureau |
| UnionPay | ✅ | China UnionPay |

## Testing

### Test Cards
Use these cards for testing in development:

| Number | Brand | Result |
|--------|-------|--------|
| 4242424242424242 | Visa | Success |
| 4000000000000002 | Visa | Declined |
| 5555555555554444 | Mastercard | Success |
| 378282246310005 | Amex | Success |

## API Reference

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md#payment-methods) for complete endpoint details.

## Troubleshooting

### Card Not Linking
1. Verify card details are correct
2. Check if card supports online payments
3. Ensure sufficient funds for verification hold
4. Contact card issuer if blocked

### Security Concerns
- Cards are PCI DSS compliant
- No card data stored locally
- All transactions logged for audit
- 2FA required for high-value operations

## Future Enhancements

- Apple Pay / Google Pay integration
- Network tokenization for enhanced security
- Virtual cards for subscriptions
- BNPL (Buy Now Pay Later) options