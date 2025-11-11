import { supabase } from '@/lib/supabase';

export interface NotificationPreferences {
  id: string;
  userId: string;
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  bookingReminders: boolean;
  promotions: boolean;
  serviceUpdates: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateNotificationPreferencesInput {
  pushNotifications?: boolean;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  bookingReminders?: boolean;
  promotions?: boolean;
  serviceUpdates?: boolean;
}

// Get notification preferences for a user
export async function getNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();

  // If no preferences exist, create default ones
  if (error && error.code === 'PGRST116') {
    return createNotificationPreferences(userId);
  }

  if (error) throw error;

  return {
    id: data.id,
    userId: data.user_id,
    pushNotifications: data.push_notifications,
    emailNotifications: data.email_notifications,
    smsNotifications: data.sms_notifications,
    bookingReminders: data.booking_reminders,
    promotions: data.promotions,
    serviceUpdates: data.service_updates,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

// Create default notification preferences
export async function createNotificationPreferences(userId: string): Promise<NotificationPreferences> {
  const { data, error } = await supabase
    .from('notification_preferences')
    .insert({
      user_id: userId,
      push_notifications: true,
      email_notifications: true,
      sms_notifications: false,
      booking_reminders: true,
      promotions: false,
      service_updates: true,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    userId: data.user_id,
    pushNotifications: data.push_notifications,
    emailNotifications: data.email_notifications,
    smsNotifications: data.sms_notifications,
    bookingReminders: data.booking_reminders,
    promotions: data.promotions,
    serviceUpdates: data.service_updates,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

// Update notification preferences
export async function updateNotificationPreferences(
  userId: string,
  input: UpdateNotificationPreferencesInput
): Promise<NotificationPreferences> {
  const updateData: Record<string, boolean | string> = {};

  if (input.pushNotifications !== undefined) updateData.push_notifications = input.pushNotifications;
  if (input.emailNotifications !== undefined) updateData.email_notifications = input.emailNotifications;
  if (input.smsNotifications !== undefined) updateData.sms_notifications = input.smsNotifications;
  if (input.bookingReminders !== undefined) updateData.booking_reminders = input.bookingReminders;
  if (input.promotions !== undefined) updateData.promotions = input.promotions;
  if (input.serviceUpdates !== undefined) updateData.service_updates = input.serviceUpdates;

  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('notification_preferences')
    .update(updateData)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    userId: data.user_id,
    pushNotifications: data.push_notifications,
    emailNotifications: data.email_notifications,
    smsNotifications: data.sms_notifications,
    bookingReminders: data.booking_reminders,
    promotions: data.promotions,
    serviceUpdates: data.service_updates,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}
