import { supabase } from '@/lib/supabase';
import { UpdateProviderProfileInput } from '@/lib/validations';

// Helper function to map database provider to Provider interface
function mapProviderData(provider: any): Provider {
  return {
    id: provider.id,
    userId: provider.user_id,
    businessName: provider.business_name,
    bio: provider.bio,
    serviceArea: provider.service_area,
    address: provider.address,
    latitude: provider.latitude ? parseFloat(provider.latitude) : undefined,
    longitude: provider.longitude ? parseFloat(provider.longitude) : undefined,
    serviceRadius: provider.service_radius ? parseInt(provider.service_radius) : 5000,
    phoneNumber: provider.phone_number,
    isActive: provider.is_active ?? true,
    rating: provider.rating,
    totalReviews: provider.total_reviews,
    verified: provider.verified,
    profilePicture: provider.profile_picture,
    gallery: provider.gallery || [],
    location: provider.latitude && provider.longitude ? {
      latitude: parseFloat(provider.latitude),
      longitude: parseFloat(provider.longitude),
    } : undefined,
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
  };
}

export interface Provider {
  id: string;
  userId: string;
  businessName: string;
  bio?: string;
  serviceArea: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  serviceRadius?: number;
  phoneNumber?: string;
  isActive: boolean;
  rating: string;
  totalReviews: string;
  verified: boolean;
  profilePicture?: string;
  gallery?: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
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

  return data.map(mapProviderData);
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

  return mapProviderData(data);
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

  return mapProviderData(data);
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

// Create provider profile
export interface CreateProviderInput {
  userId: string;
  businessName: string;
  bio: string;
  serviceArea: string;
  address: string;
  latitude?: number;
  longitude?: number;
  serviceRadius?: number;
  profilePicture?: string;
  phoneNumber?: string;
  isActive?: boolean;
  verified?: boolean;
}

export async function createProvider(input: CreateProviderInput): Promise<Provider> {
  const { data, error } = await supabase
    .from('provider_profiles')
    .insert({
      user_id: input.userId,
      business_name: input.businessName,
      bio: input.bio,
      service_area: input.serviceArea,
      address: input.address,
      latitude: input.latitude,
      longitude: input.longitude,
      service_radius: input.serviceRadius || 5000,
      profile_picture: input.profilePicture,
      phone_number: input.phoneNumber,
      is_active: input.isActive ?? true,
      verified: input.verified ?? false,
      rating: '0',
      total_reviews: '0',
    })
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
    gallery: data.gallery || [],
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

  return data.map(mapProviderData);
}
