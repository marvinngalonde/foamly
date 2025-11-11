-- Add missing fields to provider_profiles table
ALTER TABLE provider_profiles
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS service_radius INTEGER DEFAULT 5000,
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS gallery JSONB DEFAULT '[]'::jsonb;

-- Add missing fields to bookings table
ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS latitude DECIMAL(10, 8),
ADD COLUMN IF NOT EXISTS longitude DECIMAL(11, 8),
ADD COLUMN IF NOT EXISTS scheduled_time TIME,
ADD COLUMN IF NOT EXISTS estimated_duration INTEGER DEFAULT 60,
ADD COLUMN IF NOT EXISTS actual_start_time TIMESTAMP,
ADD COLUMN IF NOT EXISTS actual_end_time TIMESTAMP,
ADD COLUMN IF NOT EXISTS before_images JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS after_images JSONB DEFAULT '[]'::jsonb;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_provider_profiles_user_id ON provider_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_provider_profiles_is_active ON provider_profiles(is_active);
CREATE INDEX IF NOT EXISTS idx_provider_profiles_location ON provider_profiles(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_bookings_provider_id ON bookings(provider_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_date ON bookings(scheduled_date);

-- Update existing provider_profiles to have default values
UPDATE provider_profiles
SET is_active = true
WHERE is_active IS NULL;

UPDATE provider_profiles
SET service_radius = 5000
WHERE service_radius IS NULL;

UPDATE provider_profiles
SET gallery = '[]'::jsonb
WHERE gallery IS NULL;
