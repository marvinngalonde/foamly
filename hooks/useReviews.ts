import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProviderReviews,
  getCustomerReviews,
  getReviewByBookingId,
  createReview,
  updateReview,
  deleteReview,
  Review,
} from '@/lib/api/reviews';
import { CreateReviewInput } from '@/lib/validations';

// Query keys
export const reviewKeys = {
  all: ['reviews'] as const,
  lists: () => [...reviewKeys.all, 'list'] as const,
  provider: (providerId: string) => [...reviewKeys.lists(), 'provider', providerId] as const,
  customer: (customerId: string) => [...reviewKeys.lists(), 'customer', customerId] as const,
  booking: (bookingId: string) => [...reviewKeys.all, 'booking', bookingId] as const,
};

// Get provider reviews
export function useProviderReviews(providerId: string) {
  return useQuery({
    queryKey: reviewKeys.provider(providerId),
    queryFn: () => getProviderReviews(providerId),
    enabled: !!providerId,
  });
}

// Get customer reviews
export function useCustomerReviews(customerId: string) {
  return useQuery({
    queryKey: reviewKeys.customer(customerId),
    queryFn: () => getCustomerReviews(customerId),
    enabled: !!customerId,
  });
}

// Get review by booking ID
export function useReviewByBooking(bookingId: string) {
  return useQuery({
    queryKey: reviewKeys.booking(bookingId),
    queryFn: () => getReviewByBookingId(bookingId),
    enabled: !!bookingId,
  });
}

// Create review mutation
export function useCreateReview(customerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateReviewInput) => createReview(customerId, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.provider(data.providerId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.customer(customerId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.booking(data.bookingId) });
      // Also invalidate provider data to update rating
      queryClient.invalidateQueries({ queryKey: ['providers', 'detail', data.providerId] });
    },
  });
}

// Update review mutation
export function useUpdateReview(customerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<CreateReviewInput> }) =>
      updateReview(id, customerId, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.provider(data.providerId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.customer(customerId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.booking(data.bookingId) });
      // Also invalidate provider data to update rating
      queryClient.invalidateQueries({ queryKey: ['providers', 'detail', data.providerId] });
    },
  });
}

// Delete review mutation
export function useDeleteReview(customerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteReview(id, customerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.customer(customerId) });
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
    },
  });
}
