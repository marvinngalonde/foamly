import { supabase } from '@/lib/supabase';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  data: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Get user notifications
export async function getUserNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) throw error;

  return data.map((notif: any) => ({
    id: notif.id,
    userId: notif.user_id,
    type: notif.type,
    title: notif.title,
    message: notif.message,
    data: notif.data || {},
    isRead: notif.is_read,
    createdAt: new Date(notif.created_at),
    updatedAt: new Date(notif.updated_at),
  }));
}

// Get unread count
export async function getUnreadCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;

  return count || 0;
}

// Mark notification as read
export async function markNotificationAsRead(id: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw error;
}

// Mark all notifications as read
export async function markAllAsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
}

// Delete notification
export async function deleteNotification(id: string): Promise<void> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Create notification (server-side, called when events happen)
export async function createNotification(input: {
  userId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
}): Promise<Notification> {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      data: input.data || {},
      is_read: false,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    userId: data.user_id,
    type: data.type,
    title: data.title,
    message: data.message,
    data: data.data || {},
    isRead: data.is_read,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

// Helper function to send booking notification to provider
export async function notifyProviderNewBooking(
  providerId: string,
  bookingId: string,
  customerName: string
): Promise<void> {
  // Get provider's user_id
  const { data: provider, error: providerError } = await supabase
    .from('provider_profiles')
    .select('user_id')
    .eq('id', providerId)
    .single();

  if (providerError || !provider) return;

  await createNotification({
    userId: provider.user_id,
    type: 'BOOKING_REQUEST',
    title: 'New Booking Request',
    message: `${customerName} has requested a booking. Tap to review.`,
    data: { bookingId },
  });
}

// Helper function to send booking confirmation to customer
export async function notifyCustomerBookingConfirmed(
  customerId: string,
  bookingId: string,
  providerName: string,
  scheduledDate: string
): Promise<void> {
  await createNotification({
    userId: customerId,
    type: 'BOOKING_CONFIRMED',
    title: 'Booking Confirmed!',
    message: `${providerName} has confirmed your booking for ${new Date(scheduledDate).toLocaleDateString()}.`,
    data: { bookingId },
  });
}

// Helper function to send booking status update
export async function notifyBookingStatusChange(
  customerId: string,
  bookingId: string,
  status: string,
  providerName: string
): Promise<void> {
  const statusMessages: Record<string, { title: string; message: string }> = {
    in_progress: {
      title: 'Service Started',
      message: `${providerName} has started working on your vehicle.`,
    },
    completed: {
      title: 'Service Completed',
      message: `${providerName} has completed your service. Please leave a review!`,
    },
    cancelled: {
      title: 'Booking Cancelled',
      message: `Your booking with ${providerName} has been cancelled.`,
    },
  };

  const statusInfo = statusMessages[status];
  if (statusInfo) {
    await createNotification({
      userId: customerId,
      type: `BOOKING_${status.toUpperCase()}`,
      title: statusInfo.title,
      message: statusInfo.message,
      data: { bookingId },
    });
  }
}
