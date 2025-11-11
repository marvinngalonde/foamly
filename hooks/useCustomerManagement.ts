import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCustomerNotes,
  createCustomerNote,
  updateCustomerNote,
  deleteCustomerNote,
  getCustomerPreferences,
  getFavoriteCustomers,
  getBlockedCustomers,
  upsertCustomerPreferences,
  toggleCustomerFavorite,
  toggleCustomerBlocked,
  addCustomerTag,
  removeCustomerTag,
  type CreateCustomerNoteInput,
  type UpdateCustomerNoteInput,
  type CreateCustomerPreferencesInput,
} from '@/lib/api/customer-management';

// ============ QUERY KEYS ============

export const customerManagementKeys = {
  all: ['customer-management'] as const,
  notes: () => [...customerManagementKeys.all, 'notes'] as const,
  notesList: (providerId: string, customerId: string) =>
    [...customerManagementKeys.notes(), providerId, customerId] as const,
  preferences: () => [...customerManagementKeys.all, 'preferences'] as const,
  preferencesList: (providerId: string, customerId: string) =>
    [...customerManagementKeys.preferences(), providerId, customerId] as const,
  favorites: (providerId: string) => [...customerManagementKeys.all, 'favorites', providerId] as const,
  blocked: (providerId: string) => [...customerManagementKeys.all, 'blocked', providerId] as const,
};

// ============ CUSTOMER NOTES HOOKS ============

/**
 * Get all notes for a customer
 */
export function useCustomerNotes(providerId: string, customerId: string) {
  return useQuery({
    queryKey: customerManagementKeys.notesList(providerId, customerId),
    queryFn: () => getCustomerNotes(providerId, customerId),
    enabled: !!providerId && !!customerId,
  });
}

/**
 * Create a new customer note
 */
export function useCreateCustomerNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createCustomerNote,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: customerManagementKeys.notesList(data.providerId, data.customerId),
      });
    },
  });
}

/**
 * Update a customer note
 */
export function useUpdateCustomerNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCustomerNoteInput }) =>
      updateCustomerNote(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: customerManagementKeys.notesList(data.providerId, data.customerId),
      });
    },
  });
}

/**
 * Delete a customer note
 */
export function useDeleteCustomerNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCustomerNote,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerManagementKeys.notes() });
    },
  });
}

// ============ CUSTOMER PREFERENCES HOOKS ============

/**
 * Get customer preferences
 */
export function useCustomerPreferences(providerId: string, customerId: string) {
  return useQuery({
    queryKey: customerManagementKeys.preferencesList(providerId, customerId),
    queryFn: () => getCustomerPreferences(providerId, customerId),
    enabled: !!providerId && !!customerId,
  });
}

/**
 * Get all favorite customers
 */
export function useFavoriteCustomers(providerId: string) {
  return useQuery({
    queryKey: customerManagementKeys.favorites(providerId),
    queryFn: () => getFavoriteCustomers(providerId),
    enabled: !!providerId,
  });
}

/**
 * Get all blocked customers
 */
export function useBlockedCustomers(providerId: string) {
  return useQuery({
    queryKey: customerManagementKeys.blocked(providerId),
    queryFn: () => getBlockedCustomers(providerId),
    enabled: !!providerId,
  });
}

/**
 * Upsert customer preferences
 */
export function useUpsertCustomerPreferences() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertCustomerPreferences,
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: customerManagementKeys.preferencesList(data.providerId, data.customerId),
      });
      queryClient.invalidateQueries({
        queryKey: customerManagementKeys.favorites(data.providerId),
      });
      queryClient.invalidateQueries({
        queryKey: customerManagementKeys.blocked(data.providerId),
      });
    },
  });
}

/**
 * Toggle customer favorite status
 */
export function useToggleCustomerFavorite() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ providerId, customerId }: { providerId: string; customerId: string }) =>
      toggleCustomerFavorite(providerId, customerId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: customerManagementKeys.preferencesList(data.providerId, data.customerId),
      });
      queryClient.invalidateQueries({
        queryKey: customerManagementKeys.favorites(data.providerId),
      });
    },
  });
}

/**
 * Toggle customer blocked status
 */
export function useToggleCustomerBlocked() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ providerId, customerId }: { providerId: string; customerId: string }) =>
      toggleCustomerBlocked(providerId, customerId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: customerManagementKeys.preferencesList(data.providerId, data.customerId),
      });
      queryClient.invalidateQueries({
        queryKey: customerManagementKeys.blocked(data.providerId),
      });
    },
  });
}

/**
 * Add a tag to customer
 */
export function useAddCustomerTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      providerId,
      customerId,
      tag,
    }: {
      providerId: string;
      customerId: string;
      tag: string;
    }) => addCustomerTag(providerId, customerId, tag),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: customerManagementKeys.preferencesList(data.providerId, data.customerId),
      });
    },
  });
}

/**
 * Remove a tag from customer
 */
export function useRemoveCustomerTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      providerId,
      customerId,
      tag,
    }: {
      providerId: string;
      customerId: string;
      tag: string;
    }) => removeCustomerTag(providerId, customerId, tag),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: customerManagementKeys.preferencesList(data.providerId, data.customerId),
      });
    },
  });
}
