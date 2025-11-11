import { supabase } from '@/lib/supabase';

// ============ AVAILABILITY TYPES ============

export interface ProviderAvailability {
  id: string;
  providerId: string;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  isAvailable: boolean;
  startTime: string; // HH:MM format
  endTime: string; // HH:MM format
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAvailabilityInput {
  providerId: string;
  dayOfWeek: number;
  isAvailable: boolean;
  startTime: string;
  endTime: string;
}

export interface UpdateAvailabilityInput {
  isAvailable?: boolean;
  startTime?: string;
  endTime?: string;
}

// ============ BLOCKED TIMES TYPES ============

export interface ProviderBlockedTime {
  id: string;
  providerId: string;
  startDate: Date;
  endDate: Date;
  reason?: string;
  isRecurring: boolean;
  recurrencePattern?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBlockedTimeInput {
  providerId: string;
  startDate: Date;
  endDate: Date;
  reason?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
}

export interface UpdateBlockedTimeInput {
  startDate?: Date;
  endDate?: Date;
  reason?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
}

// ============ AVAILABILITY CRUD OPERATIONS ============

/**
 * Get all availability slots for a provider
 */
export async function getProviderAvailability(providerId: string): Promise<ProviderAvailability[]> {
  const { data, error } = await supabase
    .from('provider_availability')
    .select('*')
    .eq('provider_id', providerId)
    .order('day_of_week', { ascending: true })
    .order('start_time', { ascending: true });

  if (error) throw error;

  return data.map(slot => ({
    id: slot.id,
    providerId: slot.provider_id,
    dayOfWeek: slot.day_of_week,
    isAvailable: slot.is_available,
    startTime: slot.start_time,
    endTime: slot.end_time,
    createdAt: new Date(slot.created_at),
    updatedAt: new Date(slot.updated_at),
  }));
}

/**
 * Get availability for a specific day of week
 */
export async function getAvailabilityByDay(
  providerId: string,
  dayOfWeek: number
): Promise<ProviderAvailability[]> {
  const { data, error } = await supabase
    .from('provider_availability')
    .select('*')
    .eq('provider_id', providerId)
    .eq('day_of_week', dayOfWeek)
    .order('start_time', { ascending: true });

  if (error) throw error;

  return data.map(slot => ({
    id: slot.id,
    providerId: slot.provider_id,
    dayOfWeek: slot.day_of_week,
    isAvailable: slot.is_available,
    startTime: slot.start_time,
    endTime: slot.end_time,
    createdAt: new Date(slot.created_at),
    updatedAt: new Date(slot.updated_at),
  }));
}

/**
 * Create a new availability slot
 */
export async function createAvailability(
  input: CreateAvailabilityInput
): Promise<ProviderAvailability> {
  const { data, error } = await supabase
    .from('provider_availability')
    .insert({
      provider_id: input.providerId,
      day_of_week: input.dayOfWeek,
      is_available: input.isAvailable,
      start_time: input.startTime,
      end_time: input.endTime,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    providerId: data.provider_id,
    dayOfWeek: data.day_of_week,
    isAvailable: data.is_available,
    startTime: data.start_time,
    endTime: data.end_time,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * Update an availability slot
 */
export async function updateAvailability(
  id: string,
  input: UpdateAvailabilityInput
): Promise<ProviderAvailability> {
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.isAvailable !== undefined) updateData.is_available = input.isAvailable;
  if (input.startTime !== undefined) updateData.start_time = input.startTime;
  if (input.endTime !== undefined) updateData.end_time = input.endTime;

  const { data, error } = await supabase
    .from('provider_availability')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    providerId: data.provider_id,
    dayOfWeek: data.day_of_week,
    isAvailable: data.is_available,
    startTime: data.start_time,
    endTime: data.end_time,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * Delete an availability slot
 */
export async function deleteAvailability(id: string): Promise<void> {
  const { error } = await supabase
    .from('provider_availability')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

/**
 * Set default availability for a provider (Mon-Fri 9am-5pm)
 */
export async function setDefaultAvailability(providerId: string): Promise<ProviderAvailability[]> {
  const defaultSlots = [
    { dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }, // Monday
    { dayOfWeek: 2, startTime: '09:00', endTime: '17:00' }, // Tuesday
    { dayOfWeek: 3, startTime: '09:00', endTime: '17:00' }, // Wednesday
    { dayOfWeek: 4, startTime: '09:00', endTime: '17:00' }, // Thursday
    { dayOfWeek: 5, startTime: '09:00', endTime: '17:00' }, // Friday
  ];

  const { data, error } = await supabase
    .from('provider_availability')
    .insert(
      defaultSlots.map(slot => ({
        provider_id: providerId,
        day_of_week: slot.dayOfWeek,
        is_available: true,
        start_time: slot.startTime,
        end_time: slot.endTime,
      }))
    )
    .select();

  if (error) throw error;

  return data.map(slot => ({
    id: slot.id,
    providerId: slot.provider_id,
    dayOfWeek: slot.day_of_week,
    isAvailable: slot.is_available,
    startTime: slot.start_time,
    endTime: slot.end_time,
    createdAt: new Date(slot.created_at),
    updatedAt: new Date(slot.updated_at),
  }));
}

// ============ BLOCKED TIMES CRUD OPERATIONS ============

/**
 * Get all blocked times for a provider
 */
export async function getProviderBlockedTimes(providerId: string): Promise<ProviderBlockedTime[]> {
  const { data, error } = await supabase
    .from('provider_blocked_times')
    .select('*')
    .eq('provider_id', providerId)
    .order('start_date', { ascending: true });

  if (error) throw error;

  return data.map(block => ({
    id: block.id,
    providerId: block.provider_id,
    startDate: new Date(block.start_date),
    endDate: new Date(block.end_date),
    reason: block.reason,
    isRecurring: block.is_recurring,
    recurrencePattern: block.recurrence_pattern,
    createdAt: new Date(block.created_at),
    updatedAt: new Date(block.updated_at),
  }));
}

/**
 * Get blocked times within a date range
 */
export async function getBlockedTimesInRange(
  providerId: string,
  startDate: Date,
  endDate: Date
): Promise<ProviderBlockedTime[]> {
  const { data, error } = await supabase
    .from('provider_blocked_times')
    .select('*')
    .eq('provider_id', providerId)
    .gte('start_date', startDate.toISOString())
    .lte('end_date', endDate.toISOString())
    .order('start_date', { ascending: true });

  if (error) throw error;

  return data.map(block => ({
    id: block.id,
    providerId: block.provider_id,
    startDate: new Date(block.start_date),
    endDate: new Date(block.end_date),
    reason: block.reason,
    isRecurring: block.is_recurring,
    recurrencePattern: block.recurrence_pattern,
    createdAt: new Date(block.created_at),
    updatedAt: new Date(block.updated_at),
  }));
}

/**
 * Create a new blocked time
 */
export async function createBlockedTime(
  input: CreateBlockedTimeInput
): Promise<ProviderBlockedTime> {
  const { data, error } = await supabase
    .from('provider_blocked_times')
    .insert({
      provider_id: input.providerId,
      start_date: input.startDate.toISOString(),
      end_date: input.endDate.toISOString(),
      reason: input.reason,
      is_recurring: input.isRecurring || false,
      recurrence_pattern: input.recurrencePattern,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    providerId: data.provider_id,
    startDate: new Date(data.start_date),
    endDate: new Date(data.end_date),
    reason: data.reason,
    isRecurring: data.is_recurring,
    recurrencePattern: data.recurrence_pattern,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * Update a blocked time
 */
export async function updateBlockedTime(
  id: string,
  input: UpdateBlockedTimeInput
): Promise<ProviderBlockedTime> {
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.startDate !== undefined) updateData.start_date = input.startDate.toISOString();
  if (input.endDate !== undefined) updateData.end_date = input.endDate.toISOString();
  if (input.reason !== undefined) updateData.reason = input.reason;
  if (input.isRecurring !== undefined) updateData.is_recurring = input.isRecurring;
  if (input.recurrencePattern !== undefined) updateData.recurrence_pattern = input.recurrencePattern;

  const { data, error } = await supabase
    .from('provider_blocked_times')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    providerId: data.provider_id,
    startDate: new Date(data.start_date),
    endDate: new Date(data.end_date),
    reason: data.reason,
    isRecurring: data.is_recurring,
    recurrencePattern: data.recurrence_pattern,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * Delete a blocked time
 */
export async function deleteBlockedTime(id: string): Promise<void> {
  const { error } = await supabase
    .from('provider_blocked_times')
    .delete()
    .eq('id', id);

  if (error) throw error;
}
