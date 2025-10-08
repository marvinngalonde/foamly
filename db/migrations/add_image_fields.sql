-- Add image_url to vehicles table
ALTER TABLE vehicles ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add image_url to services table
ALTER TABLE services ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add profile_picture to provider_profiles table
ALTER TABLE provider_profiles ADD COLUMN IF NOT EXISTS profile_picture TEXT;
