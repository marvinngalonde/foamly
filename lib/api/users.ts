import { supabase } from '@/lib/supabase';

export interface User {
  id: string;
  authId: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: string;
  profilePicture?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  profilePicture?: string;
}

// Get user by ID
export async function getUserById(id: string): Promise<User> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    authId: data.auth_id,
    email: data.email,
    firstName: data.first_name,
    lastName: data.last_name,
    phoneNumber: data.phone_number,
    role: data.role,
    profileImage: data.profile_picture,
    emailVerified: false,
    phoneVerified: false,
    biometricEnabled: false,
    twoFactorEnabled: false,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  } as User;
}

// Update user profile
export async function updateUser(id: string, input: UpdateUserInput): Promise<User> {
  const updateData: any = {};

  if (input.firstName) updateData.first_name = input.firstName;
  if (input.lastName) updateData.last_name = input.lastName;
  if (input.phoneNumber) updateData.phone_number = input.phoneNumber;
  if (input.profilePicture !== undefined) updateData.profile_picture = input.profilePicture;

  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    authId: data.auth_id,
    email: data.email,
    firstName: data.first_name,
    lastName: data.last_name,
    phoneNumber: data.phone_number,
    role: data.role,
    profileImage: data.profile_picture,
    emailVerified: false,
    phoneVerified: false,
    biometricEnabled: false,
    twoFactorEnabled: false,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  } as User;
}

// Update user profile picture
export async function updateUserProfilePicture(id: string, profilePictureUrl: string): Promise<User> {
  return updateUser(id, { profilePicture: profilePictureUrl });
}
