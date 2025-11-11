import { supabase } from '@/lib/supabase';

export interface UserSettings {
  id: string;
  userId: string;
  biometricEnabled: boolean;
  twoFactorEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserSettingsInput {
  biometricEnabled?: boolean;
  twoFactorEnabled?: boolean;
}

// Get user settings
export async function getUserSettings(userId: string): Promise<UserSettings> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  // If no settings exist, create default ones
  if (error && error.code === 'PGRST116') {
    return createUserSettings(userId);
  }

  if (error) throw error;

  return {
    id: data.id,
    userId: data.user_id,
    biometricEnabled: data.biometric_enabled,
    twoFactorEnabled: data.two_factor_enabled,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

// Create default user settings
export async function createUserSettings(userId: string): Promise<UserSettings> {
  const { data, error } = await supabase
    .from('user_settings')
    .insert({
      user_id: userId,
      biometric_enabled: false,
      two_factor_enabled: false,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    userId: data.user_id,
    biometricEnabled: data.biometric_enabled,
    twoFactorEnabled: data.two_factor_enabled,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

// Update user settings
export async function updateUserSettings(
  userId: string,
  input: UpdateUserSettingsInput
): Promise<UserSettings> {
  const updateData: Record<string, boolean | string> = {};

  if (input.biometricEnabled !== undefined) updateData.biometric_enabled = input.biometricEnabled;
  if (input.twoFactorEnabled !== undefined) updateData.two_factor_enabled = input.twoFactorEnabled;

  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('user_settings')
    .update(updateData)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    userId: data.user_id,
    biometricEnabled: data.biometric_enabled,
    twoFactorEnabled: data.two_factor_enabled,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}
