import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserSettings,
  updateUserSettings,
  UserSettings,
  UpdateUserSettingsInput,
} from '@/lib/api/user-settings';

// Query keys
export const userSettingsKeys = {
  all: ['userSettings'] as const,
  byUser: (userId: string) => [...userSettingsKeys.all, userId] as const,
};

// Get user settings
export function useUserSettings(userId: string) {
  return useQuery({
    queryKey: userSettingsKeys.byUser(userId),
    queryFn: () => getUserSettings(userId),
    enabled: !!userId,
  });
}

// Update user settings mutation
export function useUpdateUserSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, input }: { userId: string; input: UpdateUserSettingsInput }) =>
      updateUserSettings(userId, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userSettingsKeys.byUser(data.userId) });
    },
  });
}
