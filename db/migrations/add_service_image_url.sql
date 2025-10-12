-- Add image_url field to services table
-- Run this in your Supabase SQL Editor

-- Add image_url column if it doesn't exist
ALTER TABLE services
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add comment for documentation
COMMENT ON COLUMN services.image_url IS 'URL of the service image displayed in the app';
