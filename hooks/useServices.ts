import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getServices,
  getServiceById,
  getServicesByProvider,
  createService,
  updateService,
  deleteService,
  Service,
} from '@/lib/api/services';
import { ServiceInput } from '@/lib/validations';

// Query keys
export const serviceKeys = {
  all: ['services'] as const,
  lists: () => [...serviceKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) => [...serviceKeys.lists(), filters] as const,
  details: () => [...serviceKeys.all, 'detail'] as const,
  detail: (id: string) => [...serviceKeys.details(), id] as const,
  provider: (providerId: string) => [...serviceKeys.all, 'provider', providerId] as const,
};

// Get all services
export function useServices() {
  return useQuery({
    queryKey: serviceKeys.lists(),
    queryFn: getServices,
  });
}

// Get service by ID
export function useService(id: string) {
  return useQuery({
    queryKey: serviceKeys.detail(id),
    queryFn: () => getServiceById(id),
    enabled: !!id,
  });
}

// Get services by provider
export function useProviderServices(providerId: string) {
  return useQuery({
    queryKey: serviceKeys.provider(providerId),
    queryFn: () => getServicesByProvider(providerId),
    enabled: !!providerId,
  });
}

// Create service mutation
export function useCreateService(providerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: ServiceInput) => createService(providerId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: serviceKeys.provider(providerId) });
    },
  });
}

// Update service mutation
export function useUpdateService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<ServiceInput> }) =>
      updateService(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: serviceKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: serviceKeys.provider(data.providerId) });
    },
  });
}

// Delete service mutation
export function useDeleteService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.all });
    },
  });
}
