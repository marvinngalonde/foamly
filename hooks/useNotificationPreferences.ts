import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  NotificationPreferences,
  UpdateNotificationPreferencesInput,
} from '@/lib/api/notification-preferences';

// Query keys
export const notificationPreferencesKeys = {
  all: ['notificationPreferences'] as const,
  byUser: (userId: string) => [...notificationPreferencesKeys.all, userId] as const,
};

// Get notification preferences for a user
export function useNotificationPreferences(userId: string) {
  return useQuery({
    queryKey: notificationPreferencesKeys.byUser(userId),
    queryFn: () => getNotificationPreferences(userId),
    enabled: !!userId,
  });
}

// Update notification preferences mutation
export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: UpdateNotificationPreferencesInput }) =>
      updateNotificationPreferences(userId, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: notificationPreferencesKeys.byUser(data.userId) });
    },
  });
}
