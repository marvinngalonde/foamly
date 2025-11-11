import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getPaymentMethods,
  createPaymentMethod,
  setDefaultPaymentMethod,
  deletePaymentMethod,
  PaymentMethodCard,
  CreatePaymentMethodInput,
} from '@/lib/api/payment-methods';

// Query keys
export const paymentMethodKeys = {
  all: ['paymentMethods'] as const,
  byUser: (userId: string) => [...paymentMethodKeys.all, userId] as const,
};

// Get all payment methods for a user
export function usePaymentMethods(userId: string) {
  return useQuery({
    queryKey: paymentMethodKeys.byUser(userId),
    queryFn: () => getPaymentMethods(userId),
    enabled: !!userId,
  });
}

// Create payment method mutation
export function useCreatePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreatePaymentMethodInput) => createPaymentMethod(input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: paymentMethodKeys.byUser(data.userId) });
    },
  });
}

// Set default payment method mutation
export function useSetDefaultPaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, paymentMethodId }: { userId: string; paymentMethodId: string }) =>
      setDefaultPaymentMethod(userId, paymentMethodId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: paymentMethodKeys.byUser(variables.userId) });
    },
  });
}

// Delete payment method mutation
export function useDeletePaymentMethod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ paymentMethodId, userId }: { paymentMethodId: string; userId: string }) =>
      deletePaymentMethod(paymentMethodId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: paymentMethodKeys.byUser(variables.userId) });
    },
  });
}
