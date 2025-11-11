import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProviders,
  getProviderById,
  getProviderByUserId,
  createProvider,
  updateProviderProfile,
  searchProviders,
  Provider,
  CreateProviderInput,
} from '@/lib/api/providers';
import { UpdateProviderProfileInput } from '@/lib/validations';

// Query keys
export const providerKeys = {
  all: ['providers'] as const,
  lists: () => [...providerKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...providerKeys.lists(), filters] as const,
  details: () => [...providerKeys.all, 'detail'] as const,
  detail: (id: string) => [...providerKeys.details(), id] as const,
  byUser: (userId: string) => [...providerKeys.all, 'user', userId] as const,
  search: (query: string) => [...providerKeys.all, 'search', query] as const,
};

// Get all providers
export function useProviders() {
  return useQuery({
    queryKey: providerKeys.lists(),
    queryFn: getProviders,
  });
}

// Get provider by ID
export function useProvider(id: string) {
  return useQuery({
    queryKey: providerKeys.detail(id),
    queryFn: () => getProviderById(id),
    enabled: !!id,
  });
}

// Get provider by user ID
export function useProviderByUserId(userId: string) {
  return useQuery({
    queryKey: providerKeys.byUser(userId),
    queryFn: () => getProviderByUserId(userId),
    enabled: !!userId,
  });
}

// Search providers
export function useSearchProviders(serviceArea: string) {
  return useQuery({
    queryKey: providerKeys.search(serviceArea),
    queryFn: () => searchProviders(serviceArea),
    enabled: !!serviceArea && serviceArea.length >= 2,
  });
}

// Create provider mutation
export function useCreateProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProviderInput) => createProvider(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: providerKeys.byUser(data.userId) });
      queryClient.invalidateQueries({ queryKey: providerKeys.lists() });
    },
  });
}

// Update provider profile mutation
export function useUpdateProviderProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProviderProfileInput }) =>
      updateProviderProfile(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: providerKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: providerKeys.byUser(data.userId) });
      queryClient.invalidateQueries({ queryKey: providerKeys.lists() });
    },
  });
}
