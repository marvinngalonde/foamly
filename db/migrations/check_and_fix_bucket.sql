-- Check and fix Supabase storage bucket setup for profile pictures

-- 1. Check if bucket exists and its public status
SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'foamy';

-- 2. Make the bucket public (THIS IS THE KEY FIX FOR GREY IMAGES)
UPDATE storage.buckets
SET public = true
WHERE id = 'foamy';

-- 3. Verify the bucket is now public
SELECT id, name, public
FROM storage.buckets
WHERE id = 'foamy';

-- 4. Check existing RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage';

-- 5. Ensure public read access policy exists
DO $$
BEGIN
  -- Drop existing policy if it exists
  DROP POLICY IF EXISTS "Public read access to images" ON storage.objects;

  -- Create new policy for public read access
  CREATE POLICY "Public read access to images"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'foamy');

EXCEPTION
  WHEN duplicate_object THEN
    NULL;  -- Policy already exists, skip
END $$;

-- 6. Verify policies are in place
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage'
  AND bucket_id = 'foamy';
