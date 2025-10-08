import { supabase } from '@/lib/supabase';
import { db } from '@/lib/db';
import { services } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { ServiceInput, serviceSchema } from '@/lib/validations';

export interface Service {
  id: string;
  providerId: string;
  name: string;
  description: string;
  serviceType: string;
  price: string;
  duration: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  provider?: {
    id: string;
    businessName: string;
    rating: string;
  };
}

// Get all active services
export async function getServices(): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select(`
      *,
      provider_profiles:provider_id (
        id,
        business_name,
        rating
      )
    `)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map((service: any) => ({
    id: service.id,
    providerId: service.provider_id,
    name: service.name,
    description: service.description,
    serviceType: service.service_type,
    price: service.price,
    duration: service.duration,
    isActive: service.is_active,
    createdAt: new Date(service.created_at),
    updatedAt: new Date(service.updated_at),
    provider: service.provider_profiles ? {
      id: service.provider_profiles.id,
      businessName: service.provider_profiles.business_name,
      rating: service.provider_profiles.rating,
    } : undefined,
  }));
}

// Get service by ID
export async function getServiceById(id: string): Promise<Service> {
  const { data, error } = await supabase
    .from('services')
    .select(`
      *,
      provider_profiles:provider_id (
        id,
        business_name,
        rating
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    providerId: data.provider_id,
    name: data.name,
    description: data.description,
    serviceType: data.service_type,
    price: data.price,
    duration: data.duration,
    isActive: data.is_active,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    provider: data.provider_profiles ? {
      id: data.provider_profiles.id,
      businessName: data.provider_profiles.business_name,
      rating: data.provider_profiles.rating,
    } : undefined,
  };
}

// Get services by provider
export async function getServicesByProvider(providerId: string): Promise<Service[]> {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map((service: any) => ({
    id: service.id,
    providerId: service.provider_id,
    name: service.name,
    description: service.description,
    serviceType: service.service_type,
    price: service.price,
    duration: service.duration,
    isActive: service.is_active,
    createdAt: new Date(service.created_at),
    updatedAt: new Date(service.updated_at),
  }));
}

// Create service (provider only)
export async function createService(providerId: string, input: ServiceInput): Promise<Service> {
  const validated = serviceSchema.parse(input);

  const { data, error } = await supabase
    .from('services')
    .insert({
      provider_id: providerId,
      name: validated.name,
      description: validated.description,
      service_type: validated.serviceType,
      price: validated.price.toString(),
      duration: validated.duration,
      is_active: validated.isActive ?? true,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    providerId: data.provider_id,
    name: data.name,
    description: data.description,
    serviceType: data.service_type,
    price: data.price,
    duration: data.duration,
    isActive: data.is_active,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

// Update service
export async function updateService(id: string, input: Partial<ServiceInput>): Promise<Service> {
  const updateData: any = {};

  if (input.name) updateData.name = input.name;
  if (input.description) updateData.description = input.description;
  if (input.serviceType) updateData.service_type = input.serviceType;
  if (input.price) updateData.price = input.price.toString();
  if (input.duration) updateData.duration = input.duration;
  if (input.isActive !== undefined) updateData.is_active = input.isActive;

  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('services')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    providerId: data.provider_id,
    name: data.name,
    description: data.description,
    serviceType: data.service_type,
    price: data.price,
    duration: data.duration,
    isActive: data.is_active,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

// Delete service
export async function deleteService(id: string): Promise<void> {
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
