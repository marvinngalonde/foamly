-- Create provider_customer_notes table for provider notes about customers
CREATE TABLE IF NOT EXISTS provider_customer_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider_id, customer_id, created_at)
);

-- Create provider_customer_preferences table for favorites, blocks, etc.
CREATE TABLE IF NOT EXISTS provider_customer_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  is_favorite BOOLEAN DEFAULT false,
  is_blocked BOOLEAN DEFAULT false,
  tags TEXT[], -- Array of custom tags like "vip", "regular", "problematic"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider_id, customer_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_provider_customer_notes_provider_id ON provider_customer_notes(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_customer_notes_customer_id ON provider_customer_notes(customer_id);
CREATE INDEX IF NOT EXISTS idx_provider_customer_preferences_provider_id ON provider_customer_preferences(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_customer_preferences_customer_id ON provider_customer_preferences(customer_id);
CREATE INDEX IF NOT EXISTS idx_provider_customer_preferences_is_favorite ON provider_customer_preferences(is_favorite);
CREATE INDEX IF NOT EXISTS idx_provider_customer_preferences_is_blocked ON provider_customer_preferences(is_blocked);

-- Enable RLS
ALTER TABLE provider_customer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_customer_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for provider_customer_notes
DROP POLICY IF EXISTS "Providers can view own customer notes" ON provider_customer_notes;
CREATE POLICY "Providers can view own customer notes" ON provider_customer_notes FOR SELECT
USING (
  provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Providers can insert own customer notes" ON provider_customer_notes;
CREATE POLICY "Providers can insert own customer notes" ON provider_customer_notes FOR INSERT
WITH CHECK (
  provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Providers can update own customer notes" ON provider_customer_notes;
CREATE POLICY "Providers can update own customer notes" ON provider_customer_notes FOR UPDATE
USING (
  provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Providers can delete own customer notes" ON provider_customer_notes;
CREATE POLICY "Providers can delete own customer notes" ON provider_customer_notes FOR DELETE
USING (
  provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
);

-- RLS Policies for provider_customer_preferences
DROP POLICY IF EXISTS "Providers can view own customer preferences" ON provider_customer_preferences;
CREATE POLICY "Providers can view own customer preferences" ON provider_customer_preferences FOR SELECT
USING (
  provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Providers can insert own customer preferences" ON provider_customer_preferences;
CREATE POLICY "Providers can insert own customer preferences" ON provider_customer_preferences FOR INSERT
WITH CHECK (
  provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Providers can update own customer preferences" ON provider_customer_preferences;
CREATE POLICY "Providers can update own customer preferences" ON provider_customer_preferences FOR UPDATE
USING (
  provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Providers can delete own customer preferences" ON provider_customer_preferences;
CREATE POLICY "Providers can delete own customer preferences" ON provider_customer_preferences FOR DELETE
USING (
  provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_provider_customer_notes_updated_at ON provider_customer_notes;
CREATE TRIGGER update_provider_customer_notes_updated_at
  BEFORE UPDATE ON provider_customer_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_provider_customer_preferences_updated_at ON provider_customer_preferences;
CREATE TRIGGER update_provider_customer_preferences_updated_at
  BEFORE UPDATE ON provider_customer_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
