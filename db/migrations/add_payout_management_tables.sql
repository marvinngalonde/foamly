-- Create provider_bank_accounts table for storing payout account details
CREATE TABLE IF NOT EXISTS provider_bank_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE UNIQUE,
  account_holder_name VARCHAR(255) NOT NULL,
  bank_name VARCHAR(255),
  account_number_last4 VARCHAR(4), -- Only store last 4 digits for security
  routing_number_last4 VARCHAR(4), -- Only store last 4 digits for security
  account_type VARCHAR(50) CHECK (account_type IN ('checking', 'savings')),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create provider_payouts table for payout requests
CREATE TABLE IF NOT EXISTS provider_payouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'paid', 'rejected', 'cancelled')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  rejection_reason TEXT,
  payment_method VARCHAR(50) DEFAULT 'bank_transfer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_provider_bank_accounts_provider_id ON provider_bank_accounts(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_payouts_provider_id ON provider_payouts(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_payouts_status ON provider_payouts(status);
CREATE INDEX IF NOT EXISTS idx_provider_payouts_requested_at ON provider_payouts(requested_at);

-- Enable RLS
ALTER TABLE provider_bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_payouts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for provider_bank_accounts
DROP POLICY IF EXISTS "Providers can view own bank account" ON provider_bank_accounts;
CREATE POLICY "Providers can view own bank account" ON provider_bank_accounts FOR SELECT
USING (
  provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Providers can insert own bank account" ON provider_bank_accounts;
CREATE POLICY "Providers can insert own bank account" ON provider_bank_accounts FOR INSERT
WITH CHECK (
  provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Providers can update own bank account" ON provider_bank_accounts;
CREATE POLICY "Providers can update own bank account" ON provider_bank_accounts FOR UPDATE
USING (
  provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Providers can delete own bank account" ON provider_bank_accounts;
CREATE POLICY "Providers can delete own bank account" ON provider_bank_accounts FOR DELETE
USING (
  provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
);

-- RLS Policies for provider_payouts
DROP POLICY IF EXISTS "Providers can view own payouts" ON provider_payouts;
CREATE POLICY "Providers can view own payouts" ON provider_payouts FOR SELECT
USING (
  provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Providers can insert own payouts" ON provider_payouts;
CREATE POLICY "Providers can insert own payouts" ON provider_payouts FOR INSERT
WITH CHECK (
  provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Providers can update own payouts" ON provider_payouts;
CREATE POLICY "Providers can update own payouts" ON provider_payouts FOR UPDATE
USING (
  provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_provider_bank_accounts_updated_at ON provider_bank_accounts;
CREATE TRIGGER update_provider_bank_accounts_updated_at
  BEFORE UPDATE ON provider_bank_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_provider_payouts_updated_at ON provider_payouts;
CREATE TRIGGER update_provider_payouts_updated_at
  BEFORE UPDATE ON provider_payouts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment to explain sensitive data handling
COMMENT ON COLUMN provider_bank_accounts.account_number_last4 IS 'Only the last 4 digits of account number are stored for security. Full account number should be handled via secure payment processor.';
COMMENT ON COLUMN provider_bank_accounts.routing_number_last4 IS 'Only the last 4 digits of routing number are stored for security. Full routing number should be handled via secure payment processor.';
