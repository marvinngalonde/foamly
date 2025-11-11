import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProviderSettings,
  updateProviderSettings,
  type UpdateProviderSettingsInput,
} from '@/lib/api/provider-settings';

// Query keys
export const providerSettingsKeys = {
  all: ['provider-settings'] as const,
  byProvider: (providerId: string) => [...providerSettingsKeys.all, providerId] as const,
};

// Get provider settings
export function useProviderSettings(providerId: string) {
  return useQuery({
    queryKey: providerSettingsKeys.byProvider(providerId),
    queryFn: () => getProviderSettings(providerId),
    enabled: !!providerId,
  });
}

// Update provider settings
export function useUpdateProviderSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ providerId, input }: { providerId: string; input: UpdateProviderSettingsInput }) =>
      updateProviderSettings(providerId, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: providerSettingsKeys.byProvider(data.providerId) });
    },
  });
}
