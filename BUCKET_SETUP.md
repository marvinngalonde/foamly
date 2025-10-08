# Supabase Storage Bucket Setup

## Issue: Images Not Displaying (Grey Blank Areas)

If images are uploading successfully but not displaying, the bucket might not be configured as public.

## Fix: Make Bucket Public

### Option 1: Via Supabase Dashboard

1. Go to **Supabase Dashboard** > **Storage**
2. Click on the `foamy` bucket
3. Click on **Settings** (gear icon)
4. Toggle **"Public bucket"** to ON
5. Save changes

### Option 2: Via SQL

Run this in your Supabase SQL Editor:

```sql
-- Make the foamy bucket public
UPDATE storage.buckets
SET public = true
WHERE id = 'foamy';
```

## Verify Setup

After making the bucket public, verify:

1. **Bucket is Public**: Storage > foamy > Settings > Public bucket = ON
2. **RLS Policies**: Storage > foamy > Policies > Should have the policies from `setup_storage_policies.sql`
3. **Test URL**: Try accessing an image URL directly in browser - it should load

## Bucket Structure

```
foamy/
├── profile_pics/
│   └── profile_{userId}_{timestamp}.jpg
└── vehicles/
    └── vehicle_{vehicleId}_{timestamp}.jpg
```

## Testing

After fixing:
1. Upload a new profile picture
2. Check if it displays immediately
3. Refresh the app
4. Check home screen and profile page

## Common Issues

### Grey/Blank Images
- **Cause**: Bucket not public OR RLS blocking reads
- **Fix**: Make bucket public + add SELECT policy for public role

### Upload Succeeds but No Display
- **Cause**: URL format incorrect OR bucket not accessible
- **Fix**: Check publicUrl format in storage.ts

### Permission Denied on Upload
- **Cause**: Missing RLS INSERT policy
- **Fix**: Run setup_storage_policies.sql
