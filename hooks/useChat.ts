import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getUserChatRooms,
  getOrCreateChatRoom,
  getChatMessages,
  sendMessage,
  markMessagesAsRead,
  type SendMessageInput,
} from '@/lib/api/chat';

// Query keys
export const chatKeys = {
  all: ['chat'] as const,
  rooms: (userId: string, isProvider: boolean) => [...chatKeys.all, 'rooms', userId, isProvider] as const,
  room: (roomId: string) => [...chatKeys.all, 'room', roomId] as const,
  messages: (roomId: string) => [...chatKeys.all, 'messages', roomId] as const,
};

// Get user's chat rooms
export function useChatRooms(userId: string, isProvider: boolean) {
  return useQuery({
    queryKey: chatKeys.rooms(userId, isProvider),
    queryFn: () => getUserChatRooms(userId, isProvider),
    enabled: !!userId,
  });
}

// Get or create chat room for a booking
export function useGetOrCreateChatRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: getOrCreateChatRoom,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
  });
}

// Get messages for a chat room
export function useChatMessages(chatRoomId: string) {
  return useQuery({
    queryKey: chatKeys.messages(chatRoomId),
    queryFn: () => getChatMessages(chatRoomId),
    enabled: !!chatRoomId,
    refetchInterval: 3000, // Poll every 3 seconds for new messages
  });
}

// Send a message
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (data) => {
      // Invalidate messages query to show new message
      queryClient.invalidateQueries({ queryKey: chatKeys.messages(data.chatRoomId) });
      // Invalidate rooms query to update last message
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
  });
}

// Mark messages as read
export function useMarkMessagesAsRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ chatRoomId, userId }: { chatRoomId: string; userId: string }) =>
      markMessagesAsRead(chatRoomId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatKeys.all });
    },
  });
}
