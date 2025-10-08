import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserById, updateUser, updateUserProfilePicture, User, UpdateUserInput } from '@/lib/api/users';
import { useAuthStore } from '@/stores/authStore';

// Query keys
export const userKeys = {
  all: ['users'] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// Get user by ID
export function useUser(id: string) {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: () => getUserById(id),
    enabled: !!id,
  });
}

// Update user mutation
export function useUpdateUser() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateUserInput }) =>
      updateUser(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(data.id) });
      // Update auth store with new user data
      setUser(data as any);
    },
  });
}

// Update profile picture mutation
export function useUpdateProfilePicture() {
  const queryClient = useQueryClient();
  const { setUser } = useAuthStore();

  return useMutation({
    mutationFn: ({ id, url }: { id: string; url: string }) =>
      updateUserProfilePicture(id, url),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(data.id) });
      // Update auth store with new user data
      setUser(data as any);
    },
  });
}
