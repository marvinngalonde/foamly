-- Create provider_availability table for weekly recurring hours
CREATE TABLE IF NOT EXISTS provider_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 6 = Saturday
  is_available BOOLEAN DEFAULT true,
  start_time VARCHAR(10) NOT NULL, -- Format: HH:MM (24-hour)
  end_time VARCHAR(10) NOT NULL, -- Format: HH:MM (24-hour)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider_id, day_of_week, start_time)
);

-- Create provider_blocked_times table for specific blocked dates/times
CREATE TABLE IF NOT EXISTS provider_blocked_times (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  reason VARCHAR(255), -- e.g., "Vacation", "Lunch break", "Personal time"
  is_recurring BOOLEAN DEFAULT false, -- For recurring blocks (e.g., lunch every day)
  recurrence_pattern VARCHAR(50), -- e.g., "daily", "weekly", "monthly"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CHECK (end_date > start_date)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_provider_availability_provider_id ON provider_availability(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_availability_day_of_week ON provider_availability(day_of_week);
CREATE INDEX IF NOT EXISTS idx_provider_blocked_times_provider_id ON provider_blocked_times(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_blocked_times_dates ON provider_blocked_times(start_date, end_date);

-- Enable RLS
ALTER TABLE provider_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_blocked_times ENABLE ROW LEVEL SECURITY;

-- RLS Policies for provider_availability
DROP POLICY IF EXISTS "Providers can view own availability" ON provider_availability;
CREATE POLICY "Providers can view own availability" ON provider_availability FOR SELECT
USING (
  provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Providers can insert own availability" ON provider_availability;
CREATE POLICY "Providers can insert own availability" ON provider_availability FOR INSERT
WITH CHECK (
  provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Providers can update own availability" ON provider_availability;
CREATE POLICY "Providers can update own availability" ON provider_availability FOR UPDATE
USING (
  provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Providers can delete own availability" ON provider_availability;
CREATE POLICY "Providers can delete own availability" ON provider_availability FOR DELETE
USING (
  provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
);

-- RLS Policies for provider_blocked_times
DROP POLICY IF EXISTS "Providers can view own blocked times" ON provider_blocked_times;
CREATE POLICY "Providers can view own blocked times" ON provider_blocked_times FOR SELECT
USING (
  provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Providers can insert own blocked times" ON provider_blocked_times;
CREATE POLICY "Providers can insert own blocked times" ON provider_blocked_times FOR INSERT
WITH CHECK (
  provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Providers can update own blocked times" ON provider_blocked_times;
CREATE POLICY "Providers can update own blocked times" ON provider_blocked_times FOR UPDATE
USING (
  provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
);

DROP POLICY IF EXISTS "Providers can delete own blocked times" ON provider_blocked_times;
CREATE POLICY "Providers can delete own blocked times" ON provider_blocked_times FOR DELETE
USING (
  provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
);

-- Triggers for updated_at
DROP TRIGGER IF EXISTS update_provider_availability_updated_at ON provider_availability;
CREATE TRIGGER update_provider_availability_updated_at
  BEFORE UPDATE ON provider_availability
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_provider_blocked_times_updated_at ON provider_blocked_times;
CREATE TRIGGER update_provider_blocked_times_updated_at
  BEFORE UPDATE ON provider_blocked_times
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
