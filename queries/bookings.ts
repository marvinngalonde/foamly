import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingService } from '@/services/booking.service';
import { Booking, BookingStatus, BookingPricing } from '@/types';

// Query keys
export const bookingKeys = {
  all: ['bookings'] as const,
  lists: () => [...bookingKeys.all, 'list'] as const,
  active: () => [...bookingKeys.lists(), 'active'] as const,
  past: () => [...bookingKeys.lists(), 'past'] as const,
  details: () => [...bookingKeys.all, 'detail'] as const,
  detail: (id: string) => [...bookingKeys.details(), id] as const,
};

// Fetch active bookings
export const useActiveBookings = () => {
  return useQuery({
    queryKey: bookingKeys.active(),
    queryFn: bookingService.getActiveBookings,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds for real-time updates
    staleTime: 15 * 1000, // 15 seconds
  });
};

// Fetch past bookings
export const usePastBookings = () => {
  return useQuery({
    queryKey: bookingKeys.past(),
    queryFn: bookingService.getPastBookings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Fetch single booking
export const useBooking = (id: string) => {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => bookingService.getBooking(id),
    enabled: !!id,
    refetchInterval: 30 * 1000, // Real-time updates for active booking
  });
};

// Create booking mutation
export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingService.createBooking,
    onSuccess: (newBooking) => {
      // Add to active bookings
      queryClient.setQueryData<Booking[]>(bookingKeys.active(), (old) => {
        return old ? [newBooking, ...old] : [newBooking];
      });

      queryClient.invalidateQueries({ queryKey: bookingKeys.active() });
    },
  });
};

// Update booking status
export const useUpdateBookingStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ bookingId, status }: { bookingId: string; status: BookingStatus }) =>
      bookingService.updateStatus(bookingId, status),
    onMutate: async ({ bookingId, status }) => {
      // Cancel queries
      await queryClient.cancelQueries({ queryKey: bookingKeys.detail(bookingId) });

      // Snapshot
      const previousBooking = queryClient.getQueryData<Booking>(bookingKeys.detail(bookingId));

      // Optimistically update
      queryClient.setQueryData<Booking>(bookingKeys.detail(bookingId), (old) => {
        return old ? { ...old, status } : old;
      });

      return { previousBooking };
    },
    onError: (err, variables, context) => {
      // Rollback
      if (context?.previousBooking) {
        queryClient.setQueryData(bookingKeys.detail(variables.bookingId), context.previousBooking);
      }
    },
    onSuccess: (updatedBooking) => {
      // Update in lists
      queryClient.setQueryData<Booking[]>(bookingKeys.active(), (old) => {
        return old?.map((b) => (b.id === updatedBooking.id ? updatedBooking : b));
      });

      queryClient.invalidateQueries({ queryKey: bookingKeys.detail(updatedBooking.id) });
    },
  });
};

// Cancel booking
export const useCancelBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingService.cancelBooking,
    onSuccess: (cancelledBooking) => {
      // Remove from active
      queryClient.setQueryData<Booking[]>(bookingKeys.active(), (old) => {
        return old?.filter((b) => b.id !== cancelledBooking.id);
      });

      // Add to past
      queryClient.setQueryData<Booking[]>(bookingKeys.past(), (old) => {
        return old ? [cancelledBooking, ...old] : [cancelledBooking];
      });

      queryClient.invalidateQueries({ queryKey: bookingKeys.active() });
      queryClient.invalidateQueries({ queryKey: bookingKeys.past() });
    },
  });
};

// Calculate pricing
export const useCalculatePricing = () => {
  return useMutation({
    mutationFn: (params: { serviceId: string; addOnIds: string[]; vehicleType: string }) =>
      bookingService.calculatePricing(params),
  });
};

// Track provider location
export const useTrackProvider = (bookingId: string, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['provider-tracking', bookingId],
    queryFn: () => bookingService.trackProvider(bookingId),
    enabled: enabled && !!bookingId,
    refetchInterval: 10 * 1000, // Update every 10 seconds
    staleTime: 5 * 1000,
  });
};
