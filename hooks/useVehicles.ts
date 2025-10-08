import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserVehicles,
  getVehicleById,
  createVehicle,
  updateVehicle,
  setDefaultVehicle,
  deleteVehicle,
  Vehicle,
} from '@/lib/api/vehicles';
import { VehicleInput } from '@/lib/validations';

// Query keys
export const vehicleKeys = {
  all: ['vehicles'] as const,
  lists: () => [...vehicleKeys.all, 'list'] as const,
  list: (userId: string) => [...vehicleKeys.lists(), userId] as const,
  details: () => [...vehicleKeys.all, 'detail'] as const,
  detail: (id: string) => [...vehicleKeys.details(), id] as const,
};

// Get user vehicles
export function useUserVehicles(userId: string) {
  return useQuery({
    queryKey: vehicleKeys.list(userId),
    queryFn: () => getUserVehicles(userId),
    enabled: !!userId,
  });
}

// Get vehicle by ID
export function useVehicle(id: string) {
  return useQuery({
    queryKey: vehicleKeys.detail(id),
    queryFn: () => getVehicleById(id),
    enabled: !!id,
  });
}

// Create vehicle mutation
export function useCreateVehicle(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: VehicleInput) => createVehicle(userId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.list(userId) });
    },
  });
}

// Update vehicle mutation
export function useUpdateVehicle(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<VehicleInput> }) =>
      updateVehicle(id, userId, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.list(userId) });
      queryClient.invalidateQueries({ queryKey: vehicleKeys.detail(data.id) });
    },
  });
}

// Set default vehicle mutation
export function useSetDefaultVehicle(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => setDefaultVehicle(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.list(userId) });
    },
  });
}

// Delete vehicle mutation
export function useDeleteVehicle(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteVehicle(id, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehicleKeys.list(userId) });
    },
  });
}
