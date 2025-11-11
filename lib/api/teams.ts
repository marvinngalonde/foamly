import { supabase } from '@/lib/supabase';

export interface TeamMember {
  id: string;
  providerId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'team_member' | 'manager';
  status: 'invited' | 'active' | 'inactive';
  invitedBy?: string;
  invitedAt: Date;
  joinedAt?: Date;
  lastActiveAt?: Date;
  permissions: Record<string, boolean>;
  createdAt: Date;
  updatedAt: Date;
}

// Get all team members for a provider
export async function getTeamMembers(providerId: string): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map(member => ({
    id: member.id,
    providerId: member.provider_id,
    email: member.email,
    firstName: member.first_name,
    lastName: member.last_name,
    role: member.role as 'team_member' | 'manager',
    status: member.status as 'invited' | 'active' | 'inactive',
    invitedBy: member.invited_by,
    invitedAt: new Date(member.invited_at),
    joinedAt: member.joined_at ? new Date(member.joined_at) : undefined,
    lastActiveAt: member.last_active_at ? new Date(member.last_active_at) : undefined,
    permissions: member.permissions || {},
    createdAt: new Date(member.created_at),
    updatedAt: new Date(member.updated_at),
  }));
}

// Get single team member
export async function getTeamMember(id: string): Promise<TeamMember> {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    providerId: data.provider_id,
    email: data.email,
    firstName: data.first_name,
    lastName: data.last_name,
    role: data.role as 'team_member' | 'manager',
    status: data.status as 'invited' | 'active' | 'inactive',
    invitedBy: data.invited_by,
    invitedAt: new Date(data.invited_at),
    joinedAt: data.joined_at ? new Date(data.joined_at) : undefined,
    lastActiveAt: data.last_active_at ? new Date(data.last_active_at) : undefined,
    permissions: data.permissions || {},
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

// Invite a team member
export interface InviteTeamMemberInput {
  providerId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: 'team_member' | 'manager';
  invitedBy: string;
}

export async function inviteTeamMember(input: InviteTeamMemberInput): Promise<TeamMember> {
  // Check if email already exists for this provider
  const { data: existing } = await supabase
    .from('team_members')
    .select('id')
    .eq('provider_id', input.providerId)
    .eq('email', input.email)
    .single();

  if (existing) {
    throw new Error('This email is already invited to your team');
  }

  const { data, error } = await supabase
    .from('team_members')
    .insert({
      provider_id: input.providerId,
      email: input.email.toLowerCase(),
      first_name: input.firstName,
      last_name: input.lastName,
      role: input.role,
      status: 'invited',
      invited_by: input.invitedBy,
      permissions: {},
    })
    .select()
    .single();

  if (error) throw error;

  // TODO: Send invitation email to the team member
  // This would be implemented with an email service like SendGrid or AWS SES

  return {
    id: data.id,
    providerId: data.provider_id,
    email: data.email,
    firstName: data.first_name,
    lastName: data.last_name,
    role: data.role as 'team_member' | 'manager',
    status: data.status as 'invited' | 'active' | 'inactive',
    invitedBy: data.invited_by,
    invitedAt: new Date(data.invited_at),
    joinedAt: data.joined_at ? new Date(data.joined_at) : undefined,
    lastActiveAt: data.last_active_at ? new Date(data.last_active_at) : undefined,
    permissions: data.permissions || {},
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

// Update team member
export interface UpdateTeamMemberInput {
  firstName?: string;
  lastName?: string;
  role?: 'team_member' | 'manager';
  status?: 'invited' | 'active' | 'inactive';
  permissions?: Record<string, boolean>;
}

export async function updateTeamMember(
  id: string,
  input: UpdateTeamMemberInput
): Promise<TeamMember> {
  const updateData: Record<string, any> = {
    updated_at: new Date().toISOString(),
  };

  if (input.firstName !== undefined) updateData.first_name = input.firstName;
  if (input.lastName !== undefined) updateData.last_name = input.lastName;
  if (input.role !== undefined) updateData.role = input.role;
  if (input.status !== undefined) updateData.status = input.status;
  if (input.permissions !== undefined) updateData.permissions = input.permissions;

  const { data, error } = await supabase
    .from('team_members')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    providerId: data.provider_id,
    email: data.email,
    firstName: data.first_name,
    lastName: data.last_name,
    role: data.role as 'team_member' | 'manager',
    status: data.status as 'invited' | 'active' | 'inactive',
    invitedBy: data.invited_by,
    invitedAt: new Date(data.invited_at),
    joinedAt: data.joined_at ? new Date(data.joined_at) : undefined,
    lastActiveAt: data.last_active_at ? new Date(data.last_active_at) : undefined,
    permissions: data.permissions || {},
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

// Delete team member (remove from team)
export async function deleteTeamMember(id: string): Promise<void> {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Resend invitation
export async function resendInvitation(id: string): Promise<void> {
  const member = await getTeamMember(id);

  if (member.status !== 'invited') {
    throw new Error('Can only resend invitations to members with invited status');
  }

  // Update invited_at timestamp
  const { error } = await supabase
    .from('team_members')
    .update({ invited_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;

  // TODO: Send invitation email again
}

// Activate team member (when they accept invitation)
export async function activateTeamMember(id: string): Promise<TeamMember> {
  const { data, error } = await supabase
    .from('team_members')
    .update({
      status: 'active',
      joined_at: new Date().toISOString(),
      last_active_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    providerId: data.provider_id,
    email: data.email,
    firstName: data.first_name,
    lastName: data.last_name,
    role: data.role as 'team_member' | 'manager',
    status: data.status as 'invited' | 'active' | 'inactive',
    invitedBy: data.invited_by,
    invitedAt: new Date(data.invited_at),
    joinedAt: data.joined_at ? new Date(data.joined_at) : undefined,
    lastActiveAt: data.last_active_at ? new Date(data.last_active_at) : undefined,
    permissions: data.permissions || {},
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}
