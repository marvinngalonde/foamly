import { supabase } from '@/lib/supabase';
import { UpdateProviderProfileInput } from '@/lib/validations';

export interface Provider {
  id: string;
  userId: string;
  businessName: string;
  bio?: string;
  serviceArea: string;
  address?: string;
  rating: string;
  totalReviews: string;
  verified: boolean;
  profilePicture?: string;
  gallery?: string[];
  createdAt: Date;
  updatedAt: Date;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    profilePicture?: string;
  };
}

// Get all providers
export async function getProviders(): Promise<Provider[]> {
  const { data, error } = await supabase
    .from('provider_profiles')
    .select(`
      *,
      users:user_id (
        id,
        email,
        first_name,
        last_name,
        phone_number,
        profile_picture
      )
    `)
    .order('rating', { ascending: false });

  if (error) throw error;

  return data.map((provider: any) => ({
    id: provider.id,
    userId: provider.user_id,
    businessName: provider.business_name,
    bio: provider.bio,
    serviceArea: provider.service_area,
    address: provider.address,
    rating: provider.rating,
    totalReviews: provider.total_reviews,
    verified: provider.verified,
    profilePicture: provider.profile_picture,
    gallery: provider.gallery,
    createdAt: new Date(provider.created_at),
    updatedAt: new Date(provider.updated_at),
    user: provider.users ? {
      id: provider.users.id,
      email: provider.users.email,
      firstName: provider.users.first_name,
      lastName: provider.users.last_name,
      phoneNumber: provider.users.phone_number,
      profilePicture: provider.users.profile_picture,
    } : undefined,
  }));
}

// Get provider by ID
export async function getProviderById(id: string): Promise<Provider> {
  const { data, error } = await supabase
    .from('provider_profiles')
    .select(`
      *,
      users:user_id (
        id,
        email,
        first_name,
        last_name,
        phone_number,
        profile_picture
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    userId: data.user_id,
    businessName: data.business_name,
    bio: data.bio,
    serviceArea: data.service_area,
    address: data.address,
    rating: data.rating,
    totalReviews: data.total_reviews,
    verified: data.verified,
    profilePicture: data.profile_picture,
    gallery: data.gallery,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    user: data.users ? {
      id: data.users.id,
      email: data.users.email,
      firstName: data.users.first_name,
      lastName: data.users.last_name,
      phoneNumber: data.users.phone_number,
      profilePicture: data.users.profile_picture,
    } : undefined,
  };
}

// Get provider by user ID
export async function getProviderByUserId(userId: string): Promise<Provider | null> {
  const { data, error } = await supabase
    .from('provider_profiles')
    .select(`
      *,
      users:user_id (
        id,
        email,
        first_name,
        last_name,
        phone_number,
        profile_picture
      )
    `)
    .eq('user_id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows returned
    throw error;
  }

  return {
    id: data.id,
    userId: data.user_id,
    businessName: data.business_name,
    bio: data.bio,
    serviceArea: data.service_area,
    address: data.address,
    rating: data.rating,
    totalReviews: data.total_reviews,
    verified: data.verified,
    profilePicture: data.profile_picture,
    gallery: data.gallery,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    user: data.users ? {
      id: data.users.id,
      email: data.users.email,
      firstName: data.users.first_name,
      lastName: data.users.last_name,
      phoneNumber: data.users.phone_number,
      profilePicture: data.users.profile_picture,
    } : undefined,
  };
}

// Update provider profile
export async function updateProviderProfile(id: string, input: UpdateProviderProfileInput): Promise<Provider> {
  const updateData: any = {};

  if (input.businessName) updateData.business_name = input.businessName;
  if (input.bio !== undefined) updateData.bio = input.bio;
  if (input.serviceArea) updateData.service_area = input.serviceArea;
  if (input.address !== undefined) updateData.address = input.address;
  if (input.profilePicture !== undefined) updateData.profile_picture = input.profilePicture;
  if (input.gallery !== undefined) updateData.gallery = input.gallery;

  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('provider_profiles')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    userId: data.user_id,
    businessName: data.business_name,
    bio: data.bio,
    serviceArea: data.service_area,
    address: data.address,
    rating: data.rating,
    totalReviews: data.total_reviews,
    verified: data.verified,
    profilePicture: data.profile_picture,
    gallery: data.gallery,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

// Search providers by service area
export async function searchProviders(serviceArea: string): Promise<Provider[]> {
  const { data, error } = await supabase
    .from('provider_profiles')
    .select(`
      *,
      users:user_id (
        id,
        email,
        first_name,
        last_name,
        phone_number,
        profile_picture
      )
    `)
    .ilike('service_area', `%${serviceArea}%`)
    .order('rating', { ascending: false });

  if (error) throw error;

  return data.map((provider: any) => ({
    id: provider.id,
    userId: provider.user_id,
    businessName: provider.business_name,
    bio: provider.bio,
    serviceArea: provider.service_area,
    address: provider.address,
    rating: provider.rating,
    totalReviews: provider.total_reviews,
    verified: provider.verified,
    profilePicture: provider.profile_picture,
    gallery: provider.gallery,
    createdAt: new Date(provider.created_at),
    updatedAt: new Date(provider.updated_at),
    user: provider.users ? {
      id: provider.users.id,
      email: provider.users.email,
      firstName: provider.users.first_name,
      lastName: provider.users.last_name,
      phoneNumber: provider.users.phone_number,
      profilePicture: provider.users.profile_picture,
    } : undefined,
  }));
}
