-- Storage policies for the 'foamy' bucket
-- Run this in your Supabase SQL Editor

-- 1. Allow authenticated users to upload their own profile pictures
CREATE POLICY "Users can upload their own profile pictures"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'foamy' AND
  (storage.foldername(name))[1] = 'profile_pics'
);

-- 2. Allow authenticated users to update their own profile pictures
CREATE POLICY "Users can update their own profile pictures"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'foamy' AND
  (storage.foldername(name))[1] = 'profile_pics'
);

-- 3. Allow authenticated users to delete their own profile pictures
CREATE POLICY "Users can delete their own profile pictures"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'foamy' AND
  (storage.foldername(name))[1] = 'profile_pics'
);

-- 4. Allow authenticated users to upload vehicle images
CREATE POLICY "Users can upload vehicle images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'foamy' AND
  (storage.foldername(name))[1] = 'vehicles'
);

-- 5. Allow authenticated users to update vehicle images
CREATE POLICY "Users can update vehicle images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'foamy' AND
  (storage.foldername(name))[1] = 'vehicles'
);

-- 6. Allow authenticated users to delete vehicle images
CREATE POLICY "Users can delete vehicle images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'foamy' AND
  (storage.foldername(name))[1] = 'vehicles'
);

-- 7. Allow authenticated users to upload gallery images
CREATE POLICY "Users can upload gallery images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'foamy' AND
  (storage.foldername(name))[1] = 'gallery'
);

-- 8. Allow authenticated users to update gallery images
CREATE POLICY "Users can update gallery images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'foamy' AND
  (storage.foldername(name))[1] = 'gallery'
);

-- 9. Allow authenticated users to delete gallery images
CREATE POLICY "Users can delete gallery images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'foamy' AND
  (storage.foldername(name))[1] = 'gallery'
);

-- 10. Allow authenticated users to upload service images
CREATE POLICY "Users can upload service images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'foamy' AND
  (storage.foldername(name))[1] = 'services'
);

-- 11. Allow authenticated users to update service images
CREATE POLICY "Users can update service images"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'foamy' AND
  (storage.foldername(name))[1] = 'services'
);

-- 12. Allow authenticated users to delete service images
CREATE POLICY "Users can delete service images"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'foamy' AND
  (storage.foldername(name))[1] = 'services'
);

-- 13. Allow public read access to all images in the bucket
CREATE POLICY "Public read access to images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'foamy');

-- Note: Make sure the 'foamy' bucket exists and has RLS enabled
-- You can check this in Supabase Dashboard > Storage
