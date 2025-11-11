import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTeamMembers,
  getTeamMember,
  inviteTeamMember,
  updateTeamMember,
  deleteTeamMember,
  resendInvitation,
  activateTeamMember,
  type InviteTeamMemberInput,
  type UpdateTeamMemberInput,
} from '@/lib/api/teams';

// Query keys
export const teamKeys = {
  all: ['teams'] as const,
  lists: () => [...teamKeys.all, 'list'] as const,
  list: (providerId: string) => [...teamKeys.lists(), providerId] as const,
  details: () => [...teamKeys.all, 'detail'] as const,
  detail: (id: string) => [...teamKeys.details(), id] as const,
};

// Get team members for a provider
export function useTeamMembers(providerId: string) {
  return useQuery({
    queryKey: teamKeys.list(providerId),
    queryFn: () => getTeamMembers(providerId),
    enabled: !!providerId,
  });
}

// Get single team member
export function useTeamMember(id: string) {
  return useQuery({
    queryKey: teamKeys.detail(id),
    queryFn: () => getTeamMember(id),
    enabled: !!id,
  });
}

// Invite team member
export function useInviteTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inviteTeamMember,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.list(data.providerId) });
    },
  });
}

// Update team member
export function useUpdateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTeamMemberInput }) =>
      updateTeamMember(id, input),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.list(data.providerId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(data.id) });
    },
  });
}

// Delete team member
export function useDeleteTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTeamMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
}

// Resend invitation
export function useResendInvitation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resendInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
}

// Activate team member
export function useActivateTeamMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activateTeamMember,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.list(data.providerId) });
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(data.id) });
    },
  });
}
