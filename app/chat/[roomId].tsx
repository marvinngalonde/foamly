import {
  View,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useChatMessages, useSendMessage, useMarkMessagesAsRead, useChatRooms } from '@/hooks/useChat';
import { UserRole } from '@/types';
import { subscribeToChatRoom, type ChatMessage } from '@/lib/api/chat';

export default function ChatRoomScreen() {
  const router = useRouter();
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const { user } = useAuthStore();
  const isProvider = user?.role === UserRole.PROVIDER;

  const [messageText, setMessageText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const { data: chatRooms = [] } = useChatRooms(user?.id || '', isProvider);
  const currentRoom = chatRooms.find(room => room.id === roomId);

  const { data: messages = [], isLoading, refetch } = useChatMessages(roomId || '');
  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkMessagesAsRead();

  // Mark messages as read when entering the chat
  useEffect(() => {
    if (roomId && user?.id) {
      markAsReadMutation.mutate({ chatRoomId: roomId, userId: user.id });
    }
  }, [roomId, user?.id]);

  // Subscribe to real-time messages
  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = subscribeToChatRoom(roomId, (newMessage: ChatMessage) => {
      // Refetch messages to include the new one
      refetch();
      // Mark as read if not sent by current user
      if (newMessage.senderId !== user?.id) {
        markAsReadMutation.mutate({ chatRoomId: roomId, userId: user!.id });
      }
    });

    return () => {
      unsubscribe();
    };
  }, [roomId, user?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length]);

  const handleSend = async () => {
    if (!messageText.trim() || !roomId || !user) return;

    const message = messageText.trim();
    setMessageText('');

    try {
      await sendMessageMutation.mutateAsync({
        chatRoomId: roomId,
        senderId: user.id,
        senderRole: isProvider ? 'provider' : 'customer',
        message,
      });

      // Scroll to bottom after sending
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore message text on error
      setMessageText(message);
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getOtherUserName = () => {
    if (!currentRoom) return '';
    if (isProvider) {
      return `${currentRoom.customer?.firstName} ${currentRoom.customer?.lastName}`;
    }
    return currentRoom.provider?.businessName || 'Provider';
  };

  const getOtherUserImage = () => {
    if (!currentRoom) return undefined;
    if (isProvider) {
      return currentRoom.customer?.profilePicture;
    }
    return currentRoom.provider?.profilePicture;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          {getOtherUserImage() ? (
            <Image source={{ uri: getOtherUserImage() }} style={styles.headerAvatar} />
          ) : (
            <View style={styles.headerAvatarPlaceholder}>
              <MaterialCommunityIcons
                name={isProvider ? 'account' : 'store'}
                size={20}
                color="#3B82F6"
              />
            </View>
          )}
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>{getOtherUserName()}</Text>
            {currentRoom?.booking?.service && (
              <Text style={styles.headerSubtitle}>{currentRoom.booking.service.name}</Text>
            )}
          </View>
        </View>

        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#3B82F6" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            renderItem={({ item }) => {
              const isMyMessage = item.senderId === user?.id;

              return (
                <View
                  style={[
                    styles.messageContainer,
                    isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer,
                  ]}
                >
                  {!isMyMessage && (
                    <View style={styles.messageSenderAvatar}>
                      {getOtherUserImage() ? (
                        <Image source={{ uri: getOtherUserImage() }} style={styles.senderAvatar} />
                      ) : (
                        <MaterialCommunityIcons
                          name={isProvider ? 'account' : 'store'}
                          size={16}
                          color="#3B82F6"
                        />
                      )}
                    </View>
                  )}

                  <View
                    style={[
                      styles.messageBubble,
                      isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        isMyMessage ? styles.myMessageText : styles.otherMessageText,
                      ]}
                    >
                      {item.message}
                    </Text>
                    <Text
                      style={[
                        styles.messageTime,
                        isMyMessage ? styles.myMessageTime : styles.otherMessageTime,
                      ]}
                    >
                      {formatTime(item.createdAt)}
                    </Text>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="message-text-outline" size={64} color="#E5E7EB" />
                <Text style={styles.emptyTitle}>Start the conversation</Text>
                <Text style={styles.emptyText}>Send a message to get started</Text>
              </View>
            }
          />
        )}

        {/* Message Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type a message..."
              placeholderTextColor="#9CA3AF"
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!messageText.trim() || sendMessageMutation.isPending}
            >
              {sendMessageMutation.isPending ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <MaterialCommunityIcons name="send" size={20} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3B82F6',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginLeft: 12,
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  headerAvatarPlaceholder: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'NunitoSans_700Bold',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#E0F2FE',
    fontFamily: 'NunitoSans_400Regular',
  },
  placeholder: {
    width: 32,
  },
  keyboardAvoid: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  myMessageContainer: {
    justifyContent: 'flex-end',
  },
  otherMessageContainer: {
    justifyContent: 'flex-start',
  },
  messageSenderAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  senderAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  messageBubble: {
    maxWidth: '75%',
    padding: 12,
    borderRadius: 16,
  },
  myMessageBubble: {
    backgroundColor: '#3B82F6',
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: '#F3F4F6',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
    fontFamily: 'NunitoSans_400Regular',
    marginBottom: 4,
  },
  myMessageText: {
    color: '#FFF',
  },
  otherMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 11,
    fontFamily: 'NunitoSans_400Regular',
  },
  myMessageTime: {
    color: '#E0F2FE',
    textAlign: 'right',
  },
  otherMessageTime: {
    color: '#9CA3AF',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    fontFamily: 'NunitoSans_700Bold',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontFamily: 'NunitoSans_400Regular',
  },
  inputContainer: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    fontFamily: 'NunitoSans_400Regular',
    color: '#333',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
});
