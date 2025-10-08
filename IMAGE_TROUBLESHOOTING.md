# Profile Pictures Not Displaying - Troubleshooting Guide

## The Issue
Images show as grey blank areas instead of displaying the uploaded profile pictures.

## Root Cause
**The Supabase storage bucket is NOT set to public**, which means images cannot be accessed even though they're uploaded successfully.

## Quick Fix (DO THIS FIRST)

### Step 1: Make Bucket Public via Supabase Dashboard

1. Go to https://dybichwjtjbtppkjpgkf.supabase.co
2. Log in to your Supabase dashboard
3. Navigate to **Storage** in the left sidebar
4. Click on the **foamy** bucket
5. Click the **Settings** (gear icon) at the top right
6. Find the **"Public bucket"** toggle
7. **Turn it ON** (it should be blue/enabled)
8. Click **Save**

### Step 2: Run SQL Fix (Alternative to Step 1)

If you prefer SQL, run this in **Supabase SQL Editor**:

```sql
UPDATE storage.buckets
SET public = true
WHERE id = 'foamy';
```

You can also run the comprehensive check script:
- Open Supabase Dashboard > SQL Editor
- Copy and paste the contents of `db/migrations/check_and_fix_bucket.sql`
- Run it
- Check the output to verify bucket is now public

## Verification Steps

### 1. Verify Bucket is Public
```sql
SELECT id, name, public FROM storage.buckets WHERE id = 'foamy';
```
Expected result: `public` column should be `true`

### 2. Test Image URL Directly
After making bucket public, test an image URL in your browser:
```
https://dybichwjtjbtppkjpgkf.supabase.co/storage/v1/object/public/foamy/profile_pics/[some-file].jpg
```

If the bucket is public, the image should load. If not, you'll get an error.

### 3. Check RLS Policies
```sql
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage';
```

You should see a policy like "Public read access to images" with SELECT permission for public role.

## Testing After Fix

1. **Upload a new profile picture** via the app
2. **Check the app immediately** - image should display (no grey area)
3. **Refresh/reload the app** - image should still display
4. **Check these pages**:
   - Home screen (profile icon in header)
   - Profile page (main profile picture)
   - Provider dashboard (if you're a provider)
   - Customers page (customer profile pics)

## Common Issues & Solutions

### Issue 1: Still seeing grey boxes after making bucket public
**Solution**:
- Clear app cache and reload
- Re-upload the image
- Check the image URL format in browser

### Issue 2: Upload succeeds but image doesn't show
**Solution**:
- Verify bucket is truly public (check SQL query above)
- Check browser console for CORS errors
- Verify the URL in the database is correct format

### Issue 3: "Permission denied" when uploading
**Solution**:
- Run `db/migrations/setup_storage_policies.sql` to create proper RLS policies
- Make sure you're logged in when uploading

## Technical Details

### Current Setup
- **Supabase URL**: https://dybichwjtjbtppkjpgkf.supabase.co
- **Bucket Name**: foamy
- **Storage Structure**:
  ```
  foamy/
  ├── profile_pics/      (user and provider profile pictures)
  └── vehicles/          (vehicle photos)
  ```

### How Image URLs Work

1. **Upload**: App uploads to `foamy/profile_pics/profile_{userId}_{timestamp}.jpg`
2. **Get URL**: App calls `supabase.storage.from('foamy').getPublicUrl(path)`
3. **Store in DB**: URL saved to `users.profile_picture` or `provider_profiles.profile_picture`
4. **Display**: React Native `<Image source={{ uri: url }} />` component loads the image

### Why Grey Boxes Appear

When bucket is private:
- Upload works (RLS INSERT policy allows it)
- URL is generated correctly
- But when `<Image>` tries to load it, **access is denied** (401/403 error)
- React Native shows grey placeholder for failed image loads

When bucket is public:
- Upload works
- URL is generated correctly
- `<Image>` successfully loads the image ✅
- User sees their profile picture!

## Files Related to Images

- `lib/storage.ts` - Upload utilities
- `lib/api/users.ts` - User profile picture updates
- `lib/api/providers.ts` - Provider profile picture updates
- `stores/authStore.ts` - User data with profileImage field
- `app/(tabs)/index.tsx` - Home screen displays profile pictures
- `app/(tabs)/profile.tsx` - Profile page with upload
- `app/provider/profile.tsx` - Provider profile with upload
- `app/provider/customers.tsx` - Customer list with profile pics

## Next Steps After Fixing

1. ✅ Make bucket public
2. ✅ Verify it works by uploading a new image
3. Consider future enhancements:
   - Image compression before upload
   - Multiple image formats (PNG, WebP)
   - Image gallery for providers
   - Vehicle photos
   - Service photos
