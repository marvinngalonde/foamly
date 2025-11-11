import { supabase } from '@/lib/supabase';

export interface ChatRoom {
  id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: ChatMessage;
  unreadCount?: number;
  provider?: {
    businessName: string;
    profilePicture?: string;
  };
  customer?: {
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  booking?: {
    scheduledDate: Date;
    service?: {
      name: string;
    };
  };
}

export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderRole: 'customer' | 'provider';
  message: string;
  images?: string[];
  isRead: boolean;
  createdAt: Date;
  sender?: {
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
}

// Get all chat rooms for a user
export async function getUserChatRooms(userId: string, isProvider: boolean): Promise<ChatRoom[]> {
  const query = supabase
    .from('chat_rooms')
    .select(`
      *,
      provider_profiles!chat_rooms_provider_id_fkey (
        business_name,
        profile_picture,
        user_id
      ),
      users!chat_rooms_customer_id_fkey (
        id,
        first_name,
        last_name,
        profile_picture
      ),
      bookings!chat_rooms_booking_id_fkey (
        scheduled_date,
        services!bookings_service_id_fkey (
          name
        )
      )
    `)
    .order('updated_at', { ascending: false });

  if (isProvider) {
    // For providers, match via provider_profiles.user_id
    const { data: providerData } = await supabase
      .from('provider_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!providerData) {
      return [];
    }

    query.eq('provider_id', providerData.id);
  } else {
    // For customers, match customer_id directly
    query.eq('customer_id', userId);
  }

  const { data, error } = await query;

  if (error) throw error;

  // For each chat room, get the last message and unread count
  const roomsWithMessages = await Promise.all(
    data.map(async (room) => {
      // Get last message
      const { data: lastMessageData } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('chat_room_id', room.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Get unread count
      const { count: unreadCount } = await supabase
        .from('chat_messages')
        .select('*', { count: 'exact', head: true })
        .eq('chat_room_id', room.id)
        .eq('is_read', false)
        .neq('sender_id', userId);

      return {
        id: room.id,
        bookingId: room.booking_id,
        customerId: room.customer_id,
        providerId: room.provider_id,
        isActive: room.is_active,
        createdAt: new Date(room.created_at),
        updatedAt: new Date(room.updated_at),
        lastMessage: lastMessageData ? {
          id: lastMessageData.id,
          chatRoomId: lastMessageData.chat_room_id,
          senderId: lastMessageData.sender_id,
          senderRole: lastMessageData.sender_role,
          message: lastMessageData.message,
          images: lastMessageData.images || [],
          isRead: lastMessageData.is_read,
          createdAt: new Date(lastMessageData.created_at),
        } : undefined,
        unreadCount: unreadCount || 0,
        provider: room.provider_profiles ? {
          businessName: room.provider_profiles.business_name,
          profilePicture: room.provider_profiles.profile_picture,
        } : undefined,
        customer: room.users ? {
          firstName: room.users.first_name,
          lastName: room.users.last_name,
          profilePicture: room.users.profile_picture,
        } : undefined,
        booking: room.bookings ? {
          scheduledDate: new Date(room.bookings.scheduled_date),
          service: room.bookings.services ? {
            name: room.bookings.services.name,
          } : undefined,
        } : undefined,
      };
    })
  );

  return roomsWithMessages;
}

// Get or create chat room for a booking
export async function getOrCreateChatRoom(bookingId: string): Promise<ChatRoom> {
  // First, get the booking to find customer and provider
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('customer_id, provider_id')
    .eq('id', bookingId)
    .single();

  if (bookingError) throw bookingError;

  // Check if chat room exists
  const { data: existingRoom, error: existingError } = await supabase
    .from('chat_rooms')
    .select('*')
    .eq('booking_id', bookingId)
    .single();

  if (existingRoom) {
    // Return existing room
    const rooms = await getUserChatRooms(booking.customer_id, false);
    const room = rooms.find(r => r.id === existingRoom.id);
    if (room) return room;
  }

  // Create new chat room
  const { data: newRoom, error: createError } = await supabase
    .from('chat_rooms')
    .insert({
      booking_id: bookingId,
      customer_id: booking.customer_id,
      provider_id: booking.provider_id,
      is_active: true,
    })
    .select()
    .single();

  if (createError) throw createError;

  return {
    id: newRoom.id,
    bookingId: newRoom.booking_id,
    customerId: newRoom.customer_id,
    providerId: newRoom.provider_id,
    isActive: newRoom.is_active,
    createdAt: new Date(newRoom.created_at),
    updatedAt: new Date(newRoom.updated_at),
  };
}

// Get messages for a chat room
export async function getChatMessages(chatRoomId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select(`
      *,
      users!chat_messages_sender_id_fkey (
        first_name,
        last_name,
        profile_picture
      )
    `)
    .eq('chat_room_id', chatRoomId)
    .order('created_at', { ascending: true });

  if (error) throw error;

  return data.map(msg => ({
    id: msg.id,
    chatRoomId: msg.chat_room_id,
    senderId: msg.sender_id,
    senderRole: msg.sender_role,
    message: msg.message,
    images: msg.images || [],
    isRead: msg.is_read,
    createdAt: new Date(msg.created_at),
    sender: msg.users ? {
      firstName: msg.users.first_name,
      lastName: msg.users.last_name,
      profilePicture: msg.users.profile_picture,
    } : undefined,
  }));
}

// Send a message
export interface SendMessageInput {
  chatRoomId: string;
  senderId: string;
  senderRole: 'customer' | 'provider';
  message: string;
  images?: string[];
}

export async function sendMessage(input: SendMessageInput): Promise<ChatMessage> {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      chat_room_id: input.chatRoomId,
      sender_id: input.senderId,
      sender_role: input.senderRole,
      message: input.message,
      images: input.images || [],
      is_read: false,
    })
    .select()
    .single();

  if (error) throw error;

  // Update chat room updated_at timestamp
  await supabase
    .from('chat_rooms')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', input.chatRoomId);

  return {
    id: data.id,
    chatRoomId: data.chat_room_id,
    senderId: data.sender_id,
    senderRole: data.sender_role,
    message: data.message,
    images: data.images || [],
    isRead: data.is_read,
    createdAt: new Date(data.created_at),
  };
}

// Mark messages as read
export async function markMessagesAsRead(chatRoomId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('chat_messages')
    .update({ is_read: true })
    .eq('chat_room_id', chatRoomId)
    .neq('sender_id', userId)
    .eq('is_read', false);

  if (error) throw error;
}

// Subscribe to new messages in a chat room (for real-time updates)
export function subscribeToChatRoom(chatRoomId: string, callback: (message: ChatMessage) => void) {
  const subscription = supabase
    .channel(`chat_room:${chatRoomId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `chat_room_id=eq.${chatRoomId}`,
      },
      async (payload) => {
        // Fetch the complete message with sender info
        const { data } = await supabase
          .from('chat_messages')
          .select(`
            *,
            users!chat_messages_sender_id_fkey (
              first_name,
              last_name,
              profile_picture
            )
          `)
          .eq('id', payload.new.id)
          .single();

        if (data) {
          callback({
            id: data.id,
            chatRoomId: data.chat_room_id,
            senderId: data.sender_id,
            senderRole: data.sender_role,
            message: data.message,
            images: data.images || [],
            isRead: data.is_read,
            createdAt: new Date(data.created_at),
            sender: data.users ? {
              firstName: data.users.first_name,
              lastName: data.users.last_name,
              profilePicture: data.users.profile_picture,
            } : undefined,
          });
        }
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}
