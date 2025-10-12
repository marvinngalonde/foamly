-- Add gallery and address fields to provider_profiles table
-- Run this in your Supabase SQL Editor

-- Add address column if it doesn't exist
ALTER TABLE provider_profiles
ADD COLUMN IF NOT EXISTS address TEXT;

-- Add gallery column if it doesn't exist (stores array of image URLs)
ALTER TABLE provider_profiles
ADD COLUMN IF NOT EXISTS gallery TEXT[];

-- Add comment for documentation
COMMENT ON COLUMN provider_profiles.address IS 'Business address of the provider';
COMMENT ON COLUMN provider_profiles.gallery IS 'Array of gallery image URLs showcasing provider work';
