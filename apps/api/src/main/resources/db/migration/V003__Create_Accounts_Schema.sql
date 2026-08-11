-- V003: Create Accounts Schema

CREATE TABLE IF NOT EXISTS accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id),
    name VARCHAR(100) NOT NULL,
    institution VARCHAR(50) NOT NULL DEFAULT 'OTHER',
    type VARCHAR(20) NOT NULL,
    initial_balance NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    credit_limit NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    ignore_in_totals BOOLEAN NOT NULL DEFAULT false,
    investment_account BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Row-Level Security (RLS) on accounts table
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY account_isolation_policy ON accounts USING (
  subscription_id = NULLIF(current_setting('app.subscription_id', true), '')::uuid
  OR current_setting('app.subscription_id', true) = 'BYPASS'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_accounts_subscription ON accounts(subscription_id);

-- Prevent hard deletes trigger function
CREATE OR REPLACE FUNCTION prevent_accounts_hard_delete()
RETURNS TRIGGER AS $$
BEGIN
    RAISE EXCEPTION 'Hard deletes are not allowed on this table. Use soft deletes (deleted_at).';
END;
$$ LANGUAGE plpgsql;

-- Trigger to prevent hard deletes on accounts table
CREATE TRIGGER trg_prevent_accounts_hard_delete
BEFORE DELETE ON accounts
FOR EACH ROW EXECUTE FUNCTION prevent_accounts_hard_delete();
