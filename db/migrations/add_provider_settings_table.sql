-- Create provider_settings table
CREATE TABLE IF NOT EXISTS provider_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE UNIQUE,
  is_open BOOLEAN DEFAULT true,
  opening_time VARCHAR(10) DEFAULT '08:00',
  closing_time VARCHAR(10) DEFAULT '18:00',
  new_booking_notifications BOOLEAN DEFAULT true,
  cancel_notifications BOOLEAN DEFAULT true,
  message_notifications BOOLEAN DEFAULT true,
  reminder_notifications BOOLEAN DEFAULT true,
  auto_accept_bookings BOOLEAN DEFAULT false,
  buffer_time_between_bookings INTEGER DEFAULT 15,
  max_bookings_per_day INTEGER DEFAULT 20,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_provider_settings_provider_id ON provider_settings(provider_id);

-- Enable RLS
ALTER TABLE provider_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Providers can manage their own settings
DROP POLICY IF EXISTS "Providers can view own settings" ON provider_settings;
CREATE POLICY "Providers can view own settings" ON provider_settings FOR SELECT
USING (
  provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Providers can update own settings" ON provider_settings;
CREATE POLICY "Providers can update own settings" ON provider_settings FOR UPDATE
USING (
  provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Providers can insert own settings" ON provider_settings;
CREATE POLICY "Providers can insert own settings" ON provider_settings FOR INSERT
WITH CHECK (
  provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_provider_settings_updated_at ON provider_settings;
CREATE TRIGGER update_provider_settings_updated_at
  BEFORE UPDATE ON provider_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
