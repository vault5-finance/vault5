# Transaction Service

The Transaction Service is a microservice responsible for managing financial transactions, income allocation, fraud detection, and transaction categorization in the Vault5 financial platform.

## Features

- **Transaction Management**: CRUD operations for income and expense transactions
- **Income Allocation Engine**: Automatic splitting of income across user accounts
- **Fraud Detection**: Basic fraud scoring and risk assessment
- **Transaction Categories**: Custom categorization system
- **Event Publishing**: Publishes transaction events for system integration
- **Service Communication**: HTTP client for inter-service communication
- **Monitoring & Logging**: Structured logging with correlation IDs
- **Health Checks**: Comprehensive health monitoring

## API Endpoints

### Transactions
- `GET /api/transactions` - Get user transactions
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction
- `GET /api/transactions/summary` - Get transaction summary
- `GET /api/transactions/high-risk` - Get high-risk transactions

### Allocations
- `GET /api/allocations` - Get user allocations
- `GET /api/allocations/transaction/:transactionId` - Get allocations for transaction
- `PUT /api/allocations/:id/status` - Update allocation status
- `GET /api/allocations/summary` - Get allocation summary
- `POST /api/allocations/trigger` - Manually trigger allocation

### Categories
- `GET /api/categories` - Get user categories
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category
- `GET /api/categories/stats` - Get category statistics
- `GET /api/categories/default` - Get default categories

### System
- `GET /health` - Health check
- `GET /metrics` - Prometheus metrics

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Service port | `3002` |
| `NODE_ENV` | Environment | `development` |
| `LOG_LEVEL` | Logging level | `info` |
| `POSTGRES_URI` | PostgreSQL connection string | Required |
| `REDIS_URI` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | JWT signing secret | Required |
| `USER_SERVICE_URI` | User service URL | `http://localhost:3001` |
| `EVENT_BUS_URI` | Event bus URL | `http://localhost:4000` |
| `SERVICE_TOKEN` | Inter-service auth token | Optional |
| `FRAUD_DETECTION_ENABLED` | Enable fraud detection | `true` |
| `ALLOCATION_ENGINE_ENABLED` | Enable allocation engine | `true` |

## Database Schema

### Transactions Table
- `id` (UUID, Primary Key)
- `user_id` (VARCHAR)
- `amount` (DECIMAL)
- `type` (income/expense)
- `description` (TEXT)
- `tag` (VARCHAR)
- `date` (TIMESTAMP)
- `fraud_risk_score` (DECIMAL)
- `fraud_is_high_risk` (BOOLEAN)
- `fraud_flags` (JSONB)
- `allocations` (JSONB)
- `created_at`, `updated_at` (TIMESTAMP)

### Allocations Table
- `id` (UUID, Primary Key)
- `user_id` (VARCHAR)
- `transaction_id` (UUID, Foreign Key)
- `account_id` (VARCHAR)
- `amount` (DECIMAL)
- `account_type` (VARCHAR)
- `status` (red/green/blue)
- `created_at`, `updated_at` (TIMESTAMP)

### Categories Table
- `id` (UUID, Primary Key)
- `user_id` (VARCHAR)
- `name` (VARCHAR)
- `type` (income/expense)
- `color` (VARCHAR)
- `icon` (VARCHAR)
- `is_default` (BOOLEAN)
- `created_at`, `updated_at` (TIMESTAMP)

## Running the Service

### Local Development
```bash
npm install
npm run dev
```

### Docker
```bash
docker-compose up -d
```

### Production
```bash
npm run migrate
npm start
```

## Testing

```bash
npm test
```

## Health Checks

The service includes comprehensive health checks that verify:
- Database connectivity
- Redis connectivity
- Service responsiveness

## Monitoring

- **Prometheus Metrics**: Available at `/metrics`
- **Structured Logging**: Winston-based logging with correlation IDs
- **Event Publishing**: All significant actions publish events

## Security

- JWT token validation
- Input validation and sanitization
- Rate limiting
- Non-root container execution
- Service-to-service authentication

## Events Published

- `transaction.created`
- `transaction.updated`
- `transaction.deleted`
- `income.allocated`
- `fraud.detected`
- `transaction.high_risk`
- `account.balance_updated`
- `category.created`
- `category.updated`
- `service.health_check`