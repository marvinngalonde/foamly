import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleService } from '@/services/vehicle.service';
import { Vehicle } from '@/types';

// Query keys
export const vehicleKeys = {
  all: ['vehicles'] as const,
  lists: () => [...vehicleKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...vehicleKeys.lists(), { filters }] as const,
  details: () => [...vehicleKeys.all, 'detail'] as const,
  detail: (id: string) => [...vehicleKeys.details(), id] as const,
};

// Fetch all vehicles
export const useVehicles = () => {
  return useQuery({
    queryKey: vehicleKeys.lists(),
    queryFn: vehicleService.getVehicles,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Fetch single vehicle
export const useVehicle = (id: string) => {
  return useQuery({
    queryKey: vehicleKeys.detail(id),
    queryFn: () => vehicleService.getVehicle(id),
    enabled: !!id,
  });
};

// Add vehicle mutation
export const useAddVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vehicleService.addVehicle,
    onSuccess: (newVehicle) => {
      // Update the vehicles list
      queryClient.setQueryData<Vehicle[]>(vehicleKeys.lists(), (old) => {
        return old ? [...old, newVehicle] : [newVehicle];
      });

      // Invalidate to refetch
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
    },
  });
};

// Update vehicle mutation
export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Vehicle> }) =>
      vehicleService.updateVehicle(id, data),
    onSuccess: (updatedVehicle) => {
      // Update the specific vehicle
      queryClient.setQueryData(vehicleKeys.detail(updatedVehicle.id), updatedVehicle);

      // Update in the list
      queryClient.setQueryData<Vehicle[]>(vehicleKeys.lists(), (old) => {
        return old?.map((v) => (v.id === updatedVehicle.id ? updatedVehicle : v));
      });

      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
    },
  });
};

// Delete vehicle mutation with optimistic update
export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vehicleService.deleteVehicle,
    onMutate: async (vehicleId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: vehicleKeys.lists() });

      // Snapshot the previous value
      const previousVehicles = queryClient.getQueryData<Vehicle[]>(vehicleKeys.lists());

      // Optimistically remove from list
      queryClient.setQueryData<Vehicle[]>(vehicleKeys.lists(), (old) =>
        old?.filter((v) => v.id !== vehicleId)
      );

      return { previousVehicles };
    },
    onError: (err, vehicleId, context) => {
      // Rollback on error
      if (context?.previousVehicles) {
        queryClient.setQueryData(vehicleKeys.lists(), context.previousVehicles);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
    },
  });
};

// Set default vehicle mutation
export const useSetDefaultVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vehicleService.setDefaultVehicle,
    onSuccess: (updatedVehicle) => {
      // Update all vehicles to reflect new default
      queryClient.setQueryData<Vehicle[]>(vehicleKeys.lists(), (old) => {
        return old?.map((v) => ({
          ...v,
          isDefault: v.id === updatedVehicle.id,
        }));
      });

      queryClient.invalidateQueries({ queryKey: vehicleKeys.lists() });
    },
  });
};
