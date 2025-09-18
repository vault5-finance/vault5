-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
    description TEXT NOT NULL,
    tag VARCHAR(255) DEFAULT '',
    date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fraud_risk_score DECIMAL(3,2) DEFAULT 0 CHECK (fraud_risk_score >= 0 AND fraud_risk_score <= 1),
    fraud_is_high_risk BOOLEAN DEFAULT false,
    fraud_flags JSONB DEFAULT '[]',
    allocations JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create allocations table for tracking income allocations
CREATE TABLE IF NOT EXISTS allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
    account_id VARCHAR(255) NOT NULL,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    account_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'green' CHECK (status IN ('red', 'green', 'blue')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table for transaction categorization
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('income', 'expense')),
    color VARCHAR(7) DEFAULT '#000000',
    icon VARCHAR(100) DEFAULT 'default',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, name, type)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_fraud_risk ON transactions(fraud_risk_score);
CREATE INDEX IF NOT EXISTS idx_allocations_user_id ON allocations(user_id);
CREATE INDEX IF NOT EXISTS idx_allocations_transaction_id ON allocations(transaction_id);
CREATE INDEX IF NOT EXISTS idx_allocations_account_id ON allocations(account_id);
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_allocations_updated_at BEFORE UPDATE ON allocations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default categories
INSERT INTO categories (user_id, name, type, color, icon, is_default) VALUES
('system', 'Salary', 'income', '#10B981', 'briefcase', true),
('system', 'Freelance', 'income', '#3B82F6', 'laptop', true),
('system', 'Business', 'income', '#8B5CF6', 'building', true),
('system', 'Investment', 'income', '#F59E0B', 'trending-up', true),
('system', 'Other Income', 'income', '#6B7280', 'plus', true),
('system', 'Food & Dining', 'expense', '#EF4444', 'utensils', true),
('system', 'Transportation', 'expense', '#F97316', 'car', true),
('system', 'Shopping', 'expense', '#EC4899', 'shopping-bag', true),
('system', 'Entertainment', 'expense', '#8B5CF6', 'film', true),
('system', 'Bills & Utilities', 'expense', '#06B6D4', 'zap', true),
('system', 'Healthcare', 'expense', '#10B981', 'heart', true),
('system', 'Education', 'expense', '#3B82F6', 'book', true),
('system', 'Other Expense', 'expense', '#6B7280', 'minus', true)
ON CONFLICT (user_id, name, type) DO NOTHING;