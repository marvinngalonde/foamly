import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { Text, TextInput, Button, Chip } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useProviderByUserId } from '@/hooks/useProviders';
import { useProviderBookings } from '@/hooks/useBookings';
import {
  useCustomerNotes,
  useCreateCustomerNote,
  useDeleteCustomerNote,
  useCustomerPreferences,
  useToggleCustomerFavorite,
  useToggleCustomerBlocked,
  useAddCustomerTag,
  useRemoveCustomerTag,
} from '@/hooks/useCustomerManagement';

export default function CustomerDetailsScreen() {
  const router = useRouter();
  const { id: customerId } = useLocalSearchParams();
  const { user } = useAuthStore();

  // Modal states
  const [showAddNote, setShowAddNote] = useState(false);
  const [showAddTag, setShowAddTag] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [newTag, setNewTag] = useState('');

  const { data: provider } = useProviderByUserId(user?.id || '');
  const { data: bookings = [], isLoading: bookingsLoading } = useProviderBookings(provider?.id || '');
  const { data: notes = [], isLoading: notesLoading } = useCustomerNotes(
    provider?.id || '',
    customerId as string
  );
  const { data: preferences, isLoading: preferencesLoading } = useCustomerPreferences(
    provider?.id || '',
    customerId as string
  );

  const createNoteMutation = useCreateCustomerNote();
  const deleteNoteMutation = useDeleteCustomerNote();
  const toggleFavoriteMutation = useToggleCustomerFavorite();
  const toggleBlockedMutation = useToggleCustomerBlocked();
  const addTagMutation = useAddCustomerTag();
  const removeTagMutation = useRemoveCustomerTag();

  // Get customer data from bookings
  const customer = useMemo(() => {
    const customerBookings = bookings.filter((b) => b.customerId === customerId);
    if (customerBookings.length === 0) return null;

    const firstBooking = customerBookings[0];
    return {
      id: customerId as string,
      firstName: firstBooking.customer?.firstName || '',
      lastName: firstBooking.customer?.lastName || '',
      email: firstBooking.customer?.email || '',
      phoneNumber: firstBooking.customer?.phoneNumber || '',
      profileImage: (firstBooking.customer as any)?.profileImage,
      totalBookings: customerBookings.length,
      completedBookings: customerBookings.filter((b) => b.status === 'completed').length,
      pendingBookings: customerBookings.filter((b) => b.status === 'pending').length,
      totalSpent: customerBookings
        .filter((b) => b.status === 'completed')
        .reduce((sum, b) => sum + parseFloat(b.totalPrice), 0),
      lastBooking: new Date(
        Math.max(...customerBookings.map((b) => new Date(b.scheduledDate).getTime()))
      ),
      recentBookings: customerBookings
        .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())
        .slice(0, 5),
    };
  }, [bookings, customerId]);

  const handleAddNote = async () => {
    if (!newNote.trim()) {
      Alert.alert('Error', 'Please enter a note');
      return;
    }

    try {
      await createNoteMutation.mutateAsync({
        providerId: provider!.id,
        customerId: customerId as string,
        note: newNote.trim(),
      });
      Alert.alert('Success', 'Note added');
      setShowAddNote(false);
      setNewNote('');
    } catch (error) {
      Alert.alert('Error', (error as Error).message || 'Failed to add note');
    }
  };

  const handleDeleteNote = (noteId: string) => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteNoteMutation.mutateAsync(noteId);
            Alert.alert('Success', 'Note deleted');
          } catch (error) {
            Alert.alert('Error', (error as Error).message || 'Failed to delete note');
          }
        },
      },
    ]);
  };

  const handleToggleFavorite = async () => {
    try {
      await toggleFavoriteMutation.mutateAsync({
        providerId: provider!.id,
        customerId: customerId as string,
      });
    } catch (error) {
      Alert.alert('Error', (error as Error).message || 'Failed to update favorite status');
    }
  };

  const handleToggleBlocked = async () => {
    const action = preferences?.isBlocked ? 'unblock' : 'block';
    Alert.alert(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Customer`,
      `Are you sure you want to ${action} this customer?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action.charAt(0).toUpperCase() + action.slice(1),
          style: preferences?.isBlocked ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await toggleBlockedMutation.mutateAsync({
                providerId: provider!.id,
                customerId: customerId as string,
              });
              Alert.alert('Success', `Customer ${action}ed`);
            } catch (error) {
              Alert.alert('Error', (error as Error).message || `Failed to ${action} customer`);
            }
          },
        },
      ]
    );
  };

  const handleAddTag = async () => {
    if (!newTag.trim()) {
      Alert.alert('Error', 'Please enter a tag');
      return;
    }

    try {
      await addTagMutation.mutateAsync({
        providerId: provider!.id,
        customerId: customerId as string,
        tag: newTag.trim().toLowerCase(),
      });
      setShowAddTag(false);
      setNewTag('');
    } catch (error) {
      Alert.alert('Error', (error as Error).message || 'Failed to add tag');
    }
  };

  const handleRemoveTag = async (tag: string) => {
    try {
      await removeTagMutation.mutateAsync({
        providerId: provider!.id,
        customerId: customerId as string,
        tag,
      });
    } catch (error) {
      Alert.alert('Error', (error as Error).message || 'Failed to remove tag');
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatDateTime = (date: Date) => {
    return `${formatDate(date)} ${date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })}`;
  };

  if (bookingsLoading || notesLoading || preferencesLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading customer details...</Text>
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="account-alert" size={64} color="#999" />
        <Text style={styles.emptyText}>Customer not found</Text>
        <Button mode="outlined" onPress={() => router.back()} style={{ marginTop: 16 }}>
          Go Back
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customer Details</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Customer Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {customer.profileImage ? (
                <Image source={{ uri: customer.profileImage }} style={styles.avatar} />
              ) : (
                <MaterialCommunityIcons name="account" size={48} color="#3B82F6" />
              )}
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.customerName}>
                {customer.firstName} {customer.lastName}
              </Text>
              <Text style={styles.customerEmail}>{customer.email}</Text>
              {customer.phoneNumber && (
                <Text style={styles.customerPhone}>{customer.phoneNumber}</Text>
              )}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[
                styles.actionButton,
                preferences?.isFavorite && styles.actionButtonActive,
              ]}
              onPress={handleToggleFavorite}
            >
              <MaterialCommunityIcons
                name={preferences?.isFavorite ? 'star' : 'star-outline'}
                size={20}
                color={preferences?.isFavorite ? '#F59E0B' : '#666'}
              />
              <Text
                style={[
                  styles.actionButtonText,
                  preferences?.isFavorite && styles.actionButtonTextActive,
                ]}
              >
                {preferences?.isFavorite ? 'Favorited' : 'Favorite'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                preferences?.isBlocked && styles.actionButtonBlocked,
              ]}
              onPress={handleToggleBlocked}
            >
              <MaterialCommunityIcons
                name={preferences?.isBlocked ? 'account-check' : 'account-cancel'}
                size={20}
                color={preferences?.isBlocked ? '#10B981' : '#EF4444'}
              />
              <Text
                style={[
                  styles.actionButtonText,
                  preferences?.isBlocked && styles.actionButtonTextBlocked,
                ]}
              >
                {preferences?.isBlocked ? 'Unblock' : 'Block'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Tags */}
          <View style={styles.tagsSection}>
            <Text style={styles.sectionLabel}>Tags</Text>
            <View style={styles.tagsContainer}>
              {preferences?.tags && preferences.tags.length > 0 ? (
                preferences.tags.map((tag) => (
                  <Chip
                    key={tag}
                    mode="outlined"
                    onClose={() => handleRemoveTag(tag)}
                    style={styles.tag}
                  >
                    {tag}
                  </Chip>
                ))
              ) : (
                <Text style={styles.noTagsText}>No tags</Text>
              )}
              <Chip
                mode="outlined"
                icon="plus"
                onPress={() => setShowAddTag(true)}
                style={styles.addTagChip}
              >
                Add Tag
              </Chip>
            </View>
          </View>
        </View>

        {/* Stats Card */}
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="calendar-check" size={24} color="#3B82F6" />
            <Text style={styles.statValue}>{customer.completedBookings}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="clock-outline" size={24} color="#FFA500" />
            <Text style={styles.statValue}>{customer.pendingBookings}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <MaterialCommunityIcons name="cash" size={24} color="#10B981" />
            <Text style={styles.statValue}>${customer.totalSpent.toFixed(0)}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
        </View>

        {/* Notes Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddNote(true)}
            >
              <MaterialCommunityIcons name="plus" size={20} color="#FFF" />
              <Text style={styles.addButtonText}>Add Note</Text>
            </TouchableOpacity>
          </View>

          {notes.length === 0 ? (
            <View style={styles.emptySection}>
              <Text style={styles.emptySectionText}>No notes yet</Text>
            </View>
          ) : (
            notes.map((note) => (
              <View key={note.id} style={styles.noteCard}>
                <View style={styles.noteHeader}>
                  <Text style={styles.noteDate}>{formatDateTime(note.createdAt)}</Text>
                  <TouchableOpacity onPress={() => handleDeleteNote(note.id)}>
                    <MaterialCommunityIcons name="delete" size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.noteText}>{note.note}</Text>
              </View>
            ))
          )}
        </View>

        {/* Recent Bookings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Bookings</Text>

          {customer.recentBookings.map((booking) => (
            <View key={booking.id} style={styles.bookingCard}>
              <View style={styles.bookingHeader}>
                <Text style={styles.bookingService}>{booking.service?.name || 'Service'}</Text>
                <View
                  style={[
                    styles.bookingStatus,
                    { backgroundColor: getStatusColor(booking.status) + '20' },
                  ]}
                >
                  <Text
                    style={[styles.bookingStatusText, { color: getStatusColor(booking.status) }]}
                  >
                    {booking.status.replace('_', ' ')}
                  </Text>
                </View>
              </View>
              <View style={styles.bookingDetails}>
                <View style={styles.bookingDetail}>
                  <MaterialCommunityIcons name="calendar" size={14} color="#666" />
                  <Text style={styles.bookingDetailText}>
                    {formatDate(new Date(booking.scheduledDate))}
                  </Text>
                </View>
                <View style={styles.bookingDetail}>
                  <MaterialCommunityIcons name="cash" size={14} color="#666" />
                  <Text style={styles.bookingDetailText}>${parseFloat(booking.totalPrice).toFixed(2)}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Add Note Modal */}
      <Modal visible={showAddNote} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Note</Text>

            <TextInput
              mode="outlined"
              value={newNote}
              onChangeText={setNewNote}
              placeholder="Enter note about this customer..."
              multiline
              numberOfLines={4}
              style={styles.noteInput}
            />

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => {
                  setShowAddNote(false);
                  setNewNote('');
                }}
                style={styles.modalCancelButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleAddNote}
                style={styles.modalSaveButton}
                loading={createNoteMutation.isPending}
              >
                Add Note
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Tag Modal */}
      <Modal visible={showAddTag} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Tag</Text>

            <TextInput
              mode="outlined"
              value={newTag}
              onChangeText={setNewTag}
              placeholder="e.g., vip, regular, preferred"
              style={styles.tagInput}
            />

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => {
                  setShowAddTag(false);
                  setNewTag('');
                }}
                style={styles.modalCancelButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleAddTag}
                style={styles.modalSaveButton}
                loading={addTagMutation.isPending}
              >
                Add Tag
              </Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function getStatusColor(status: string) {
  switch (status) {
    case 'pending':
      return '#FFA500';
    case 'confirmed':
      return '#3B82F6';
    case 'in_progress':
      return '#8B5CF6';
    case 'completed':
      return '#10B981';
    case 'cancelled':
      return '#EF4444';
    default:
      return '#999';
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    fontFamily: 'NunitoSans_400Regular',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'NunitoSans_700Bold',
  },
  content: {
    flex: 1,
  },
  profileCard: {
    margin: 20,
    marginBottom: 12,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
  },
  avatar: {
    width: 80,
    height: 80,
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  customerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
    fontFamily: 'NunitoSans_700Bold',
  },
  customerEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
    fontFamily: 'NunitoSans_400Regular',
  },
  customerPhone: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'NunitoSans_400Regular',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionButtonActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  actionButtonBlocked: {
    backgroundColor: '#D1FAE5',
    borderColor: '#10B981',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  actionButtonTextActive: {
    color: '#F59E0B',
  },
  actionButtonTextBlocked: {
    color: '#10B981',
  },
  tagsSection: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  sectionLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    marginBottom: 8,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#EFF6FF',
  },
  addTagChip: {
    backgroundColor: '#F9FAFB',
  },
  noTagsText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    fontFamily: 'NunitoSans_400Regular',
  },
  statsCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 8,
    fontFamily: 'NunitoSans_700Bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    fontFamily: 'NunitoSans_700Bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 13,
    color: '#FFF',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  emptySection: {
    padding: 20,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    alignItems: 'center',
  },
  emptySectionText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontFamily: 'NunitoSans_400Regular',
  },
  noteCard: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  noteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteDate: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'NunitoSans_400Regular',
  },
  noteText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    fontFamily: 'NunitoSans_400Regular',
  },
  bookingCard: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingService: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    fontFamily: 'NunitoSans_700Bold',
  },
  bookingStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bookingStatusText: {
    fontSize: 11,
    textTransform: 'capitalize',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  bookingDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  bookingDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  bookingDetailText: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'NunitoSans_400Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
    fontFamily: 'NunitoSans_700Bold',
  },
  noteInput: {
    backgroundColor: '#F9FAFB',
    marginBottom: 16,
  },
  tagInput: {
    backgroundColor: '#F9FAFB',
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
  },
  bottomPadding: {
    height: 40,
  },
});
