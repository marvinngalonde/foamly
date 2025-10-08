import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCustomerBookings,
  getProviderBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  cancelBooking,
  deleteBooking,
  Booking,
} from '@/lib/api/bookings';
import { CreateBookingInput, UpdateBookingStatusInput } from '@/lib/validations';

// Query keys
export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  customer: (customerId: string) => [...bookingKeys.lists(), 'customer', customerId] as const,
  provider: (providerId: string) => [...bookingKeys.lists(), 'provider', providerId] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
};

// Get customer bookings
export function useCustomerBookings(customerId: string) {
  return useQuery({
    queryKey: bookingKeys.customer(customerId),
    queryFn: () => getCustomerBookings(customerId),
    enabled: !!customerId,
  });
}

// Get provider bookings
export function useProviderBookings(providerId: string) {
  return useQuery({
    queryKey: bookingKeys.provider(providerId),
    queryFn: () => getProviderBookings(providerId),
    enabled: !!providerId,
  });
}

// Get booking by ID
export function useBooking(id: string) {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => getBookingById(id),
    enabled: !!id,
  });
}

// Create booking mutation
export function useCreateBooking(customerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateBookingInput) => createBooking(customerId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.customer(customerId) });
    },
  });
}

// Update booking status mutation
export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: UpdateBookingStatusInput['status'] }) =>
      updateBookingStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: bookingKeys.customer(data.customerId) });
      queryClient.invalidateQueries({ queryKey: bookingKeys.provider(data.providerId) });
    },
  });
}

// Cancel booking mutation
export function useCancelBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelBooking,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: bookingKeys.customer(data.customerId) });
      queryClient.invalidateQueries({ queryKey: bookingKeys.provider(data.providerId) });
    },
  });
}

// Delete booking mutation
export function useDeleteBooking(customerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.customer(customerId) });
    },
  });
}
