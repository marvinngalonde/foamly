import { supabase } from '@/lib/supabase';
import { CreateBookingInput, UpdateBookingStatusInput, createBookingSchema } from '@/lib/validations';
import { notifyProviderNewBooking, notifyCustomerBookingConfirmed, notifyBookingStatusChange } from './notifications';

export interface Booking {
  id: string;
  customerId: string;
  providerId: string;
  serviceId: string;
  vehicleId: string;
  scheduledDate: Date;
  location: string;
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
  totalPrice: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  service?: {
    id: string;
    name: string;
    description: string;
    duration: string;
  };
  provider?: {
    id: string;
    businessName: string;
    rating: string;
  };
  vehicle?: {
    id: string;
    make: string;
    model: string;
    year: string;
  };
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
  };
}

// Get bookings for customer
export async function getCustomerBookings(customerId: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      services:service_id (
        id,
        name,
        description,
        duration
      ),
      provider_profiles:provider_id (
        id,
        business_name,
        rating
      ),
      vehicles:vehicle_id (
        id,
        make,
        model,
        year
      )
    `)
    .eq('customer_id', customerId)
    .order('scheduled_date', { ascending: false });

  if (error) throw error;

  return data.map((booking: any) => ({
    id: booking.id,
    customerId: booking.customer_id,
    providerId: booking.provider_id,
    serviceId: booking.service_id,
    vehicleId: booking.vehicle_id,
    scheduledDate: new Date(booking.scheduled_date),
    location: booking.location,
    status: booking.status,
    totalPrice: booking.total_price,
    notes: booking.notes,
    createdAt: new Date(booking.created_at),
    updatedAt: new Date(booking.updated_at),
    service: booking.services ? {
      id: booking.services.id,
      name: booking.services.name,
      description: booking.services.description,
      duration: booking.services.duration,
    } : undefined,
    provider: booking.provider_profiles ? {
      id: booking.provider_profiles.id,
      businessName: booking.provider_profiles.business_name,
      rating: booking.provider_profiles.rating,
    } : undefined,
    vehicle: booking.vehicles ? {
      id: booking.vehicles.id,
      make: booking.vehicles.make,
      model: booking.vehicles.model,
      year: booking.vehicles.year,
    } : undefined,
  }));
}

// Get bookings for provider
export async function getProviderBookings(providerId: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      services:service_id (
        id,
        name,
        description,
        duration
      ),
      vehicles:vehicle_id (
        id,
        make,
        model,
        year
      ),
      users:customer_id (
        id,
        first_name,
        last_name,
        phone_number
      )
    `)
    .eq('provider_id', providerId)
    .order('scheduled_date', { ascending: false });

  if (error) throw error;

  return data.map((booking: any) => ({
    id: booking.id,
    customerId: booking.customer_id,
    providerId: booking.provider_id,
    serviceId: booking.service_id,
    vehicleId: booking.vehicle_id,
    scheduledDate: new Date(booking.scheduled_date),
    location: booking.location,
    status: booking.status,
    totalPrice: booking.total_price,
    notes: booking.notes,
    createdAt: new Date(booking.created_at),
    updatedAt: new Date(booking.updated_at),
    service: booking.services ? {
      id: booking.services.id,
      name: booking.services.name,
      description: booking.services.description,
      duration: booking.services.duration,
    } : undefined,
    vehicle: booking.vehicles ? {
      id: booking.vehicles.id,
      make: booking.vehicles.make,
      model: booking.vehicles.model,
      year: booking.vehicles.year,
    } : undefined,
    customer: booking.users ? {
      id: booking.users.id,
      firstName: booking.users.first_name,
      lastName: booking.users.last_name,
      phoneNumber: booking.users.phone_number,
    } : undefined,
  }));
}

// Get booking by ID
export async function getBookingById(id: string): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      services:service_id (
        id,
        name,
        description,
        duration
      ),
      provider_profiles:provider_id (
        id,
        business_name,
        rating
      ),
      vehicles:vehicle_id (
        id,
        make,
        model,
        year
      )
    `)
    .eq('id', id)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    customerId: data.customer_id,
    providerId: data.provider_id,
    serviceId: data.service_id,
    vehicleId: data.vehicle_id,
    scheduledDate: new Date(data.scheduled_date),
    location: data.location,
    status: data.status,
    totalPrice: data.total_price,
    notes: data.notes,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    service: data.services ? {
      id: data.services.id,
      name: data.services.name,
      description: data.services.description,
      duration: data.services.duration,
    } : undefined,
    provider: data.provider_profiles ? {
      id: data.provider_profiles.id,
      businessName: data.provider_profiles.business_name,
      rating: data.provider_profiles.rating,
    } : undefined,
    vehicle: data.vehicles ? {
      id: data.vehicles.id,
      make: data.vehicles.make,
      model: data.vehicles.model,
      year: data.vehicles.year,
    } : undefined,
  };
}

// Create booking
export async function createBooking(customerId: string, input: CreateBookingInput): Promise<Booking> {
  const validated = createBookingSchema.parse(input);

  const { data, error} = await supabase
    .from('bookings')
    .insert({
      customer_id: customerId,
      provider_id: validated.providerId,
      service_id: validated.serviceId,
      vehicle_id: validated.vehicleId,
      scheduled_date: validated.scheduledDate,
      scheduled_time: validated.scheduledTime,
      location: validated.location,
      latitude: validated.latitude,
      longitude: validated.longitude,
      total_price: validated.totalPrice.toString(),
      estimated_duration: validated.estimatedDuration || 60,
      notes: validated.notes,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;

  // Send notification to provider
  try {
    // Get customer name
    const { data: customer } = await supabase
      .from('users')
      .select('first_name, last_name')
      .eq('id', customerId)
      .single();

    if (customer) {
      const customerName = `${customer.first_name} ${customer.last_name}`;
      await notifyProviderNewBooking(validated.providerId, data.id, customerName);
    }
  } catch (notifError) {
    // Don't fail the booking if notification fails
    console.error('Failed to send notification:', notifError);
  }

  return {
    id: data.id,
    customerId: data.customer_id,
    providerId: data.provider_id,
    serviceId: data.service_id,
    vehicleId: data.vehicle_id,
    scheduledDate: new Date(data.scheduled_date),
    location: data.location,
    status: data.status,
    totalPrice: data.total_price,
    notes: data.notes,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

// Update booking status
export async function updateBookingStatus(id: string, status: UpdateBookingStatusInput['status']): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .update({
      status,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Send notification to customer about status change
  try {
    // Get provider and customer info
    const { data: provider } = await supabase
      .from('provider_profiles')
      .select('business_name')
      .eq('id', data.provider_id)
      .single();

    if (provider) {
      if (status === 'confirmed') {
        await notifyCustomerBookingConfirmed(
          data.customer_id,
          data.id,
          provider.business_name,
          data.scheduled_date
        );
      } else {
        await notifyBookingStatusChange(
          data.customer_id,
          data.id,
          status,
          provider.business_name
        );
      }
    }
  } catch (notifError) {
    // Don't fail the status update if notification fails
    console.error('Failed to send notification:', notifError);
  }

  return {
    id: data.id,
    customerId: data.customer_id,
    providerId: data.provider_id,
    serviceId: data.service_id,
    vehicleId: data.vehicle_id,
    scheduledDate: new Date(data.scheduled_date),
    location: data.location,
    status: data.status,
    totalPrice: data.total_price,
    notes: data.notes,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

// Cancel booking
export async function cancelBooking(id: string): Promise<Booking> {
  return updateBookingStatus(id, 'cancelled');
}

// Delete booking
export async function deleteBooking(id: string): Promise<void> {
  const { error } = await supabase
    .from('bookings')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
