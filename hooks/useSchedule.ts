import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProviderAvailability,
  getAvailabilityByDay,
  createAvailability,
  updateAvailability,
  deleteAvailability,
  setDefaultAvailability,
  getProviderBlockedTimes,
  getBlockedTimesInRange,
  createBlockedTime,
  updateBlockedTime,
  deleteBlockedTime,
  type CreateAvailabilityInput,
  type UpdateAvailabilityInput,
  type CreateBlockedTimeInput,
  type UpdateBlockedTimeInput,
} from '@/lib/api/schedule';

// ============ QUERY KEYS ============

export const scheduleKeys = {
  all: ['schedule'] as const,
  availability: () => [...scheduleKeys.all, 'availability'] as const,
  availabilityList: (providerId: string) => [...scheduleKeys.availability(), providerId] as const,
  availabilityByDay: (providerId: string, dayOfWeek: number) =>
    [...scheduleKeys.availability(), providerId, dayOfWeek] as const,
  blockedTimes: () => [...scheduleKeys.all, 'blocked-times'] as const,
  blockedTimesList: (providerId: string) => [...scheduleKeys.blockedTimes(), providerId] as const,
  blockedTimesRange: (providerId: string, startDate: Date, endDate: Date) =>
    [...scheduleKeys.blockedTimes(), providerId, startDate.toISOString(), endDate.toISOString()] as const,
};

// ============ AVAILABILITY HOOKS ============

/**
 * Get all availability slots for a provider
 */
export function useProviderAvailability(providerId: string) {
  return useQuery({
    queryKey: scheduleKeys.availabilityList(providerId),
    queryFn: () => getProviderAvailability(providerId),
    enabled: !!providerId,
  });
}

/**
 * Get availability for a specific day of week
 */
export function useAvailabilityByDay(providerId: string, dayOfWeek: number) {
  return useQuery({
    queryKey: scheduleKeys.availabilityByDay(providerId, dayOfWeek),
    queryFn: () => getAvailabilityByDay(providerId, dayOfWeek),
    enabled: !!providerId && dayOfWeek >= 0 && dayOfWeek <= 6,
  });
}

/**
 * Create a new availability slot
 */
export function useCreateAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAvailability,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.availabilityList(data.providerId) });
      queryClient.invalidateQueries({
        queryKey: scheduleKeys.availabilityByDay(data.providerId, data.dayOfWeek),
      });
    },
  });
}

/**
 * Update an availability slot
 */
export function useUpdateAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateAvailabilityInput }) =>
      updateAvailability(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.availabilityList(data.providerId) });
      queryClient.invalidateQueries({
        queryKey: scheduleKeys.availabilityByDay(data.providerId, data.dayOfWeek),
      });
    },
  });
}

/**
 * Delete an availability slot
 */
export function useDeleteAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAvailability,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.availability() });
    },
  });
}

/**
 * Set default availability (Mon-Fri 9am-5pm)
 */
export function useSetDefaultAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setDefaultAvailability,
    onSuccess: (data) => {
      if (data.length > 0) {
        queryClient.invalidateQueries({ queryKey: scheduleKeys.availabilityList(data[0].providerId) });
      }
    },
  });
}

// ============ BLOCKED TIMES HOOKS ============

/**
 * Get all blocked times for a provider
 */
export function useProviderBlockedTimes(providerId: string) {
  return useQuery({
    queryKey: scheduleKeys.blockedTimesList(providerId),
    queryFn: () => getProviderBlockedTimes(providerId),
    enabled: !!providerId,
  });
}

/**
 * Get blocked times within a date range
 */
export function useBlockedTimesInRange(
  providerId: string,
  startDate: Date,
  endDate: Date,
  enabled = true
) {
  return useQuery({
    queryKey: scheduleKeys.blockedTimesRange(providerId, startDate, endDate),
    queryFn: () => getBlockedTimesInRange(providerId, startDate, endDate),
    enabled: !!providerId && enabled,
  });
}

/**
 * Create a new blocked time
 */
export function useCreateBlockedTime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBlockedTime,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.blockedTimesList(data.providerId) });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.blockedTimes() });
    },
  });
}

/**
 * Update a blocked time
 */
export function useUpdateBlockedTime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateBlockedTimeInput }) =>
      updateBlockedTime(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.blockedTimesList(data.providerId) });
      queryClient.invalidateQueries({ queryKey: scheduleKeys.blockedTimes() });
    },
  });
}

/**
 * Delete a blocked time
 */
export function useDeleteBlockedTime() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBlockedTime,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.blockedTimes() });
    },
  });
}
