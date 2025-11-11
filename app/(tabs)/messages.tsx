import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { useChatRooms } from '@/hooks/useChat';
import { UserRole } from '@/types';

export default function MessagesScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const isProvider = user?.role === UserRole.PROVIDER;

  const { data: chatRooms = [], isLoading } = useChatRooms(user?.id || '', isProvider);

  const formatTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffMs = now.getTime() - messageDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return messageDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getOtherUserName = (room: typeof chatRooms[0]) => {
    if (isProvider) {
      return `${room.customer?.firstName} ${room.customer?.lastName}`;
    }
    return room.provider?.businessName || 'Provider';
  };

  const getOtherUserImage = (room: typeof chatRooms[0]) => {
    if (isProvider) {
      return room.customer?.profilePicture;
    }
    return room.provider?.profilePicture;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          data={chatRooms}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.chatCard}
              onPress={() => router.push(`/chat/${item.id}` as any)}
            >
              <View style={styles.avatarContainer}>
                {getOtherUserImage(item) ? (
                  <Image source={{ uri: getOtherUserImage(item) }} style={styles.avatar} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <MaterialCommunityIcons
                      name={isProvider ? 'account' : 'store'}
                      size={28}
                      color="#3B82F6"
                    />
                  </View>
                )}
                {item.unreadCount! > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadBadgeText}>
                      {item.unreadCount! > 9 ? '9+' : item.unreadCount}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.chatContent}>
                <View style={styles.chatHeader}>
                  <Text style={styles.chatName}>{getOtherUserName(item)}</Text>
                  {item.lastMessage && (
                    <Text style={styles.chatTime}>
                      {formatTime(item.lastMessage.createdAt)}
                    </Text>
                  )}
                </View>

                {item.booking?.service && (
                  <Text style={styles.serviceName}>{item.booking.service.name}</Text>
                )}

                {item.lastMessage ? (
                  <Text
                    style={[
                      styles.lastMessage,
                      item.unreadCount! > 0 && styles.lastMessageUnread,
                    ]}
                    numberOfLines={1}
                  >
                    {item.lastMessage.senderId === user?.id && 'You: '}
                    {item.lastMessage.message}
                  </Text>
                ) : (
                  <Text style={styles.noMessages}>No messages yet</Text>
                )}
              </View>

              <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="message-outline" size={64} color="#E5E7EB" />
              <Text style={styles.emptyTitle}>No conversations</Text>
              <Text style={styles.emptyText}>
                {isProvider
                  ? 'Your customer conversations will appear here'
                  : 'Start a booking to chat with providers'}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3B82F6',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'NunitoSans_700Bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  list: {
    backgroundColor: '#FFF',
    flexGrow: 1,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFF',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadBadgeText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'NunitoSans_700Bold',
  },
  chatContent: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'NunitoSans_700Bold',
  },
  chatTime: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'NunitoSans_400Regular',
  },
  serviceName: {
    fontSize: 13,
    color: '#3B82F6',
    marginBottom: 4,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  lastMessage: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'NunitoSans_400Regular',
  },
  lastMessageUnread: {
    fontFamily: 'NunitoSans_600SemiBold',
    color: '#333',
  },
  noMessages: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    fontFamily: 'NunitoSans_400Regular',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    backgroundColor: '#FFF',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    fontFamily: 'NunitoSans_700Bold',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
    fontFamily: 'NunitoSans_400Regular',
  },
});
