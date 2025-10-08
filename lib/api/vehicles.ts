import { supabase } from '@/lib/supabase';
import { VehicleInput, vehicleSchema } from '@/lib/validations';

export interface Vehicle {
  id: string;
  userId: string;
  make: string;
  model: string;
  year: string;
  color?: string;
  licensePlate?: string;
  vehicleType: 'sedan' | 'suv' | 'truck' | 'van' | 'sports';
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Get all vehicles for a user
export async function getUserVehicles(userId: string): Promise<Vehicle[]> {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map((vehicle: any) => ({
    id: vehicle.id,
    userId: vehicle.user_id,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    color: vehicle.color,
    licensePlate: vehicle.license_plate,
    vehicleType: vehicle.vehicle_type,
    isDefault: vehicle.is_default,
    createdAt: new Date(vehicle.created_at),
    updatedAt: new Date(vehicle.updated_at),
  }));
}

// Get vehicle by ID
export async function getVehicleById(id: string): Promise<Vehicle> {
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    userId: data.user_id,
    make: data.make,
    model: data.model,
    year: data.year,
    color: data.color,
    licensePlate: data.license_plate,
    vehicleType: data.vehicle_type,
    isDefault: data.is_default,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

// Create vehicle
export async function createVehicle(userId: string, input: VehicleInput): Promise<Vehicle> {
  const validated = vehicleSchema.parse(input);

  // If this is set as default, unset all other defaults first
  if (validated.isDefault) {
    await supabase
      .from('vehicles')
      .update({ is_default: false })
      .eq('user_id', userId);
  }

  const { data, error } = await supabase
    .from('vehicles')
    .insert({
      user_id: userId,
      make: validated.make,
      model: validated.model,
      year: validated.year,
      color: validated.color,
      license_plate: validated.licensePlate,
      vehicle_type: validated.vehicleType,
      is_default: validated.isDefault ?? false,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    userId: data.user_id,
    make: data.make,
    model: data.model,
    year: data.year,
    color: data.color,
    licensePlate: data.license_plate,
    vehicleType: data.vehicle_type,
    isDefault: data.is_default,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

// Update vehicle
export async function updateVehicle(id: string, userId: string, input: Partial<VehicleInput>): Promise<Vehicle> {
  const updateData: any = {};

  if (input.make) updateData.make = input.make;
  if (input.model) updateData.model = input.model;
  if (input.year) updateData.year = input.year;
  if (input.color !== undefined) updateData.color = input.color;
  if (input.licensePlate !== undefined) updateData.license_plate = input.licensePlate;
  if (input.vehicleType) updateData.vehicle_type = input.vehicleType;
  if (input.isDefault !== undefined) {
    updateData.is_default = input.isDefault;

    // If setting as default, unset all other defaults first
    if (input.isDefault) {
      await supabase
        .from('vehicles')
        .update({ is_default: false })
        .eq('user_id', userId);
    }
  }

  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('vehicles')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    userId: data.user_id,
    make: data.make,
    model: data.model,
    year: data.year,
    color: data.color,
    licensePlate: data.license_plate,
    vehicleType: data.vehicle_type,
    isDefault: data.is_default,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

// Set vehicle as default
export async function setDefaultVehicle(id: string, userId: string): Promise<Vehicle> {
  // Unset all defaults first
  await supabase
    .from('vehicles')
    .update({ is_default: false })
    .eq('user_id', userId);

  // Set this one as default
  const { data, error } = await supabase
    .from('vehicles')
    .update({ is_default: true, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    userId: data.user_id,
    make: data.make,
    model: data.model,
    year: data.year,
    color: data.color,
    licensePlate: data.license_plate,
    vehicleType: data.vehicle_type,
    isDefault: data.is_default,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

// Delete vehicle
export async function deleteVehicle(id: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('vehicles')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw error;
}
