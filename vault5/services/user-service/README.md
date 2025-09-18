# User Service

A microservice for managing user authentication, profiles, and account settings in the Vault5 financial platform.

## Features

- **User Authentication**: JWT-based authentication with refresh tokens
- **User Management**: Registration, login, profile management
- **Account Management**: User account settings and preferences
- **Security**: Password hashing, rate limiting, input validation
- **Monitoring**: Prometheus metrics and structured logging
- **Event Publishing**: Integration with event-driven architecture
- **Database**: PostgreSQL with connection pooling
- **Caching**: Redis for session management and token blacklisting

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Accounts
- `GET /api/accounts` - Get user accounts
- `GET /api/accounts/summary` - Get account summary
- `PUT /api/accounts/percentage` - Update account percentage
- `PUT /api/accounts/target` - Update account target
- `PUT /api/accounts/bulk-percentages` - Bulk update percentages
- `POST /api/accounts/reset-defaults` - Reset to default percentages

### Settings
- `GET /api/settings` - Get user settings
- `PUT /api/settings` - Update user settings
- `PUT /api/settings/notifications` - Update notification settings
- `PUT /api/settings/lending-rules` - Update lending rules
- `PUT /api/settings/linked-accounts` - Update linked accounts

### Health & Monitoring
- `GET /health` - Health check
- `GET /metrics` - Prometheus metrics

## Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 15+
- Redis 7+

### Installation

1. Clone the repository
2. Navigate to the service directory:
   ```bash
   cd vault5/services/user-service
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

5. Run database migrations:
   ```bash
   npm run migrate
   ```

6. Seed the database:
   ```bash
   node seed.js
   ```

7. Start the service:
   ```bash
   npm start
   ```

### Docker Setup

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or run in background
docker-compose up -d
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `POSTGRES_URI` | PostgreSQL connection string | Required |
| `REDIS_URI` | Redis connection string | `redis://localhost:6379` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `30d` |
| `LOG_LEVEL` | Logging level | `info` |

## Database Schema

### Users Table
- `id` (UUID, Primary Key)
- `name` (VARCHAR)
- `email` (VARCHAR, Unique)
- `password_hash` (VARCHAR)
- `role` (VARCHAR)
- `avatar` (VARCHAR)
- `dob` (DATE)
- `phone` (VARCHAR)
- `city` (VARCHAR)
- `preferences` (JSONB)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

### Accounts Table
- `id` (UUID, Primary Key)
- `user_id` (UUID, Foreign Key)
- `type` (VARCHAR)
- `percentage` (DECIMAL)
- `balance` (DECIMAL)
- `target` (DECIMAL)
- `status` (VARCHAR)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

## Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Monitoring

### Health Checks
The service provides health check endpoints:
- `/health` - Overall service health
- `/metrics` - Prometheus metrics

### Logging
Structured logging with Winston includes:
- Request/response logging
- Error tracking
- Performance metrics
- Correlation IDs

## Security Features

- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Express rate limiter
- **Input Validation**: express-validator
- **CORS**: Configured CORS policies
- **Helmet**: Security headers
- **JWT Blacklisting**: Token revocation in Redis

## Event Publishing

The service publishes events for:
- User registration
- User login/logout
- Profile updates
- Password changes
- Account modifications
- Security events

## Development

### Project Structure
```
user-service/
├── controllers/     # Route handlers
├── middleware/      # Express middleware
├── models/         # Database models
├── routes/         # API routes
├── services/       # External service clients
├── migrations/     # Database migrations
├── tests/          # Test files
├── Dockerfile      # Docker configuration
├── docker-compose.yml
├── server.js       # Application entry point
└── package.json
```

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run migrate` - Run database migrations

## Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure all tests pass

## License

This project is part of the Vault5 platform.