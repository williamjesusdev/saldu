-- V002: Create Auth Schema with Multi-Tenant RLS Support
-- Subscriptions table (Tenants)
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  plan VARCHAR (50) NOT NULL DEFAULT 'FREE',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  subscription_id UUID NOT NULL REFERENCES subscriptions (id),
  email VARCHAR (255) NOT NULL UNIQUE,
  password_hash VARCHAR (255) NOT NULL,
  name VARCHAR (255) NOT NULL,
  role VARCHAR (50) NOT NULL DEFAULT 'USER',
  consent_given_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE,
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- Access requests (Waiting list)
CREATE TABLE IF NOT EXISTS access_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  email VARCHAR (255) NOT NULL,
  name VARCHAR (255) NOT NULL,
  status VARCHAR (50) NOT NULL DEFAULT 'PENDING',
  rejection_reason VARCHAR (255),
  reviewed_by UUID REFERENCES users (id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP WITH TIME ZONE
);

-- Invite tokens
CREATE TABLE IF NOT EXISTS invite_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  token VARCHAR (255) NOT NULL UNIQUE,
  email VARCHAR (255),
  created_by UUID NOT NULL REFERENCES users (id),
  used_by UUID REFERENCES users (id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
  used_at TIMESTAMP WITH TIME ZONE
);

-- Password reset tokens
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid (),
  token VARCHAR (255) NOT NULL UNIQUE,
  user_id UUID NOT NULL REFERENCES users (id),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Revoked tokens
CREATE TABLE revoked_tokens (
    id UUID PRIMARY KEY,
    token VARCHAR(1024) NOT NULL UNIQUE,
    revoked_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Row-Level Security (RLS) on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY users_subscription_isolation ON users USING (
  subscription_id = NULLIF(current_setting('app.subscription_id', true), '')::uuid
  OR current_setting('app.subscription_id', true) = 'BYPASS'
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_access_requests_status ON access_requests(status);
CREATE INDEX IF NOT EXISTS idx_invite_tokens_token ON invite_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
