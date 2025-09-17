-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    avatar VARCHAR(500),
    dob DATE,
    phone VARCHAR(50),
    city VARCHAR(100),
    address TEXT,
    terms_accepted BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    kyc_completed BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    registration_step INTEGER DEFAULT 0 CHECK (registration_step >= 0 AND registration_step <= 4),
    preferences JSONB DEFAULT '{
        "notifications": true,
        "currency": "KES",
        "linked_accounts": [],
        "notification_thresholds": {
            "shortfall": 1000,
            "goal_progress": 90,
            "loan_due_days": 3
        },
        "lending_rules": {
            "non_repay_cap": 3,
            "safe_percent": 50
        }
    }',
    reset_password_token VARCHAR(500),
    reset_password_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create accounts table
CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('Daily', 'Emergency', 'Investment', 'LongTerm', 'Fun', 'Charity')),
    percentage DECIMAL(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
    balance DECIMAL(15,2) DEFAULT 0,
    target DECIMAL(15,2) DEFAULT 0,
    status VARCHAR(50) DEFAULT 'green' CHECK (status IN ('red', 'green', 'blue')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_type ON accounts(type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at BEFORE UPDATE ON accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();