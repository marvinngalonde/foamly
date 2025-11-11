-- Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id UUID NOT NULL REFERENCES provider_profiles(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role VARCHAR(50) NOT NULL CHECK (role IN ('team_member', 'manager')),
  status VARCHAR(50) NOT NULL DEFAULT 'invited' CHECK (status IN ('invited', 'active', 'inactive')),
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE,
  last_active_at TIMESTAMP WITH TIME ZONE,
  permissions JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(provider_id, email)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_team_members_provider_id ON team_members(provider_id);
CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);

-- Enable RLS
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Providers can view their team members
DROP POLICY IF EXISTS "Providers can view own team" ON team_members;
CREATE POLICY "Providers can view own team" ON team_members FOR SELECT
USING (
  provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
);

-- RLS Policy: Providers can insert team members
DROP POLICY IF EXISTS "Providers can add team members" ON team_members;
CREATE POLICY "Providers can add team members" ON team_members FOR INSERT
WITH CHECK (
  provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
);

-- RLS Policy: Providers can update their team members
DROP POLICY IF EXISTS "Providers can update team members" ON team_members;
CREATE POLICY "Providers can update team members" ON team_members FOR UPDATE
USING (
  provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
);

-- RLS Policy: Providers can delete their team members
DROP POLICY IF EXISTS "Providers can delete team members" ON team_members;
CREATE POLICY "Providers can delete team members" ON team_members FOR DELETE
USING (
  provider_id IN (SELECT id FROM provider_profiles WHERE user_id = auth.uid())
);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS update_team_members_updated_at ON team_members;
CREATE TRIGGER update_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
