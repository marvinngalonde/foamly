import { supabase } from '@/lib/supabase';

export interface ProviderSettings {
  id: string;
  providerId: string;
  isOpen: boolean;
  openingTime: string;
  closingTime: string;
  newBookingNotifications: boolean;
  cancelNotifications: boolean;
  messageNotifications: boolean;
  reminderNotifications: boolean;
  autoAcceptBookings: boolean;
  bufferTimeBetweenBookings: number;
  maxBookingsPerDay: number;
  createdAt: Date;
  updatedAt: Date;
}

// Get provider settings
export async function getProviderSettings(providerId: string): Promise<ProviderSettings | null> {
  const { data, error } = await supabase
    .from('provider_settings')
    .select('*')
    .eq('provider_id', providerId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No settings found
    throw error;
  }

  return {
    id: data.id,
    providerId: data.provider_id,
    isOpen: data.is_open,
    openingTime: data.opening_time,
    closingTime: data.closing_time,
    newBookingNotifications: data.new_booking_notifications,
    cancelNotifications: data.cancel_notifications,
    messageNotifications: data.message_notifications,
    reminderNotifications: data.reminder_notifications,
    autoAcceptBookings: data.auto_accept_bookings,
    bufferTimeBetweenBookings: data.buffer_time_between_bookings,
    maxBookingsPerDay: data.max_bookings_per_day,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

// Create or update provider settings
export interface UpdateProviderSettingsInput {
  isOpen?: boolean;
  openingTime?: string;
  closingTime?: string;
  newBookingNotifications?: boolean;
  cancelNotifications?: boolean;
  messageNotifications?: boolean;
  reminderNotifications?: boolean;
  autoAcceptBookings?: boolean;
  bufferTimeBetweenBookings?: number;
  maxBookingsPerDay?: number;
}

export async function updateProviderSettings(
  providerId: string,
  input: UpdateProviderSettingsInput
): Promise<ProviderSettings> {
  // Check if settings exist
  const existing = await getProviderSettings(providerId);

  const settingsData: Record<string, any> = {
    provider_id: providerId,
    updated_at: new Date().toISOString(),
  };

  if (input.isOpen !== undefined) settingsData.is_open = input.isOpen;
  if (input.openingTime !== undefined) settingsData.opening_time = input.openingTime;
  if (input.closingTime !== undefined) settingsData.closing_time = input.closingTime;
  if (input.newBookingNotifications !== undefined)
    settingsData.new_booking_notifications = input.newBookingNotifications;
  if (input.cancelNotifications !== undefined)
    settingsData.cancel_notifications = input.cancelNotifications;
  if (input.messageNotifications !== undefined)
    settingsData.message_notifications = input.messageNotifications;
  if (input.reminderNotifications !== undefined)
    settingsData.reminder_notifications = input.reminderNotifications;
  if (input.autoAcceptBookings !== undefined)
    settingsData.auto_accept_bookings = input.autoAcceptBookings;
  if (input.bufferTimeBetweenBookings !== undefined)
    settingsData.buffer_time_between_bookings = input.bufferTimeBetweenBookings;
  if (input.maxBookingsPerDay !== undefined)
    settingsData.max_bookings_per_day = input.maxBookingsPerDay;

  if (existing) {
    // Update existing settings
    const { data, error } = await supabase
      .from('provider_settings')
      .update(settingsData)
      .eq('provider_id', providerId)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      providerId: data.provider_id,
      isOpen: data.is_open,
      openingTime: data.opening_time,
      closingTime: data.closing_time,
      newBookingNotifications: data.new_booking_notifications,
      cancelNotifications: data.cancel_notifications,
      messageNotifications: data.message_notifications,
      reminderNotifications: data.reminder_notifications,
      autoAcceptBookings: data.auto_accept_bookings,
      bufferTimeBetweenBookings: data.buffer_time_between_bookings,
      maxBookingsPerDay: data.max_bookings_per_day,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  } else {
    // Create new settings with defaults
    const { data, error } = await supabase
      .from('provider_settings')
      .insert({
        ...settingsData,
        is_open: settingsData.is_open ?? true,
        opening_time: settingsData.opening_time ?? '08:00',
        closing_time: settingsData.closing_time ?? '18:00',
        new_booking_notifications: settingsData.new_booking_notifications ?? true,
        cancel_notifications: settingsData.cancel_notifications ?? true,
        message_notifications: settingsData.message_notifications ?? true,
        reminder_notifications: settingsData.reminder_notifications ?? true,
        auto_accept_bookings: settingsData.auto_accept_bookings ?? false,
        buffer_time_between_bookings: settingsData.buffer_time_between_bookings ?? 15,
        max_bookings_per_day: settingsData.max_bookings_per_day ?? 20,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      providerId: data.provider_id,
      isOpen: data.is_open,
      openingTime: data.opening_time,
      closingTime: data.closing_time,
      newBookingNotifications: data.new_booking_notifications,
      cancelNotifications: data.cancel_notifications,
      messageNotifications: data.message_notifications,
      reminderNotifications: data.reminder_notifications,
      autoAcceptBookings: data.auto_accept_bookings,
      bufferTimeBetweenBookings: data.buffer_time_between_bookings,
      maxBookingsPerDay: data.max_bookings_per_day,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}
