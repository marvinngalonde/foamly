import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProviderBankAccount,
  upsertBankAccount,
  getProviderPayouts,
  getPayout,
  createPayoutRequest,
  cancelPayoutRequest,
  type CreateBankAccountInput,
  type CreatePayoutInput,
} from '@/lib/api/payouts';

// ============ QUERY KEYS ============

export const payoutKeys = {
  all: ['payouts'] as const,
  bankAccounts: () => [...payoutKeys.all, 'bank-accounts'] as const,
  bankAccount: (providerId: string) => [...payoutKeys.bankAccounts(), providerId] as const,
  payouts: () => [...payoutKeys.all, 'payouts'] as const,
  payoutsList: (providerId: string) => [...payoutKeys.payouts(), providerId] as const,
  payout: (id: string) => [...payoutKeys.payouts(), id] as const,
};

// ============ BANK ACCOUNT HOOKS ============

/**
 * Get provider's bank account
 */
export function useProviderBankAccount(providerId: string) {
  return useQuery({
    queryKey: payoutKeys.bankAccount(providerId),
    queryFn: () => getProviderBankAccount(providerId),
    enabled: !!providerId,
  });
}

/**
 * Upsert provider bank account
 */
export function useUpsertBankAccount() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertBankAccount,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: payoutKeys.bankAccount(data.providerId) });
    },
  });
}

// ============ PAYOUT HOOKS ============

/**
 * Get all payouts for a provider
 */
export function useProviderPayouts(providerId: string) {
  return useQuery({
    queryKey: payoutKeys.payoutsList(providerId),
    queryFn: () => getProviderPayouts(providerId),
    enabled: !!providerId,
  });
}

/**
 * Get a single payout
 */
export function usePayout(id: string) {
  return useQuery({
    queryKey: payoutKeys.payout(id),
    queryFn: () => getPayout(id),
    enabled: !!id,
  });
}

/**
 * Create a payout request
 */
export function useCreatePayoutRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPayoutRequest,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: payoutKeys.payoutsList(data.providerId) });
    },
  });
}

/**
 * Cancel a payout request
 */
export function useCancelPayoutRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelPayoutRequest,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: payoutKeys.payoutsList(data.providerId) });
      queryClient.invalidateQueries({ queryKey: payoutKeys.payout(data.id) });
    },
  });
}
