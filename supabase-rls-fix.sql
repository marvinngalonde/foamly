-- First, disable RLS temporarily to allow the function to work
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE provider_profiles DISABLE ROW LEVEL SECURITY;

-- Alternative: Keep RLS enabled but create a more permissive policy
-- Drop existing policies
DROP POLICY IF EXISTS "Users can insert their own profile" ON users;
DROP POLICY IF EXISTS "Anyone can create a user profile" ON users;

-- Create a policy that allows authenticated users to insert
CREATE POLICY "Authenticated users can create profile"
ON users
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Update provider_profiles policy
DROP POLICY IF EXISTS "Authenticated users can create provider profile" ON provider_profiles;
DROP POLICY IF EXISTS "Anyone can create a provider profile" ON provider_profiles;

CREATE POLICY "Authenticated users can create provider profile"
ON provider_profiles
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Re-enable RLS if you disabled it
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;
