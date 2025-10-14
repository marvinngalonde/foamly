-- Add image_url column to vehicles table
ALTER TABLE vehicles
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add RLS policies for vehicles folder in storage
INSERT INTO storage.policies (name, definition, bucket_id, operation)
VALUES (
  'Users can upload vehicle images',
  '(bucket_id = ''foamy'' AND (storage.foldername(name))[1] = ''vehicles'')',
  'foamy',
  'INSERT'
) ON CONFLICT DO NOTHING;

INSERT INTO storage.policies (name, definition, bucket_id, operation)
VALUES (
  'Anyone can view vehicle images',
  '(bucket_id = ''foamy'' AND (storage.foldername(name))[1] = ''vehicles'')',
  'foamy',
  'SELECT'
) ON CONFLICT DO NOTHING;

INSERT INTO storage.policies (name, definition, bucket_id, operation)
VALUES (
  'Users can update their vehicle images',
  '(bucket_id = ''foamy'' AND (storage.foldername(name))[1] = ''vehicles'')',
  'foamy',
  'UPDATE'
) ON CONFLICT DO NOTHING;

INSERT INTO storage.policies (name, definition, bucket_id, operation)
VALUES (
  'Users can delete their vehicle images',
  '(bucket_id = ''foamy'' AND (storage.foldername(name))[1] = ''vehicles'')',
  'foamy',
  'DELETE'
) ON CONFLICT DO NOTHING;
