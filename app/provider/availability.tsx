import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
} from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useProviderByUserId } from '@/hooks/useProviders';
import {
  useProviderAvailability,
  useCreateAvailability,
  useUpdateAvailability,
  useDeleteAvailability,
  useSetDefaultAvailability,
  useProviderBlockedTimes,
  useCreateBlockedTime,
  useDeleteBlockedTime,
} from '@/hooks/useSchedule';
import DateTimePicker from '@react-native-community/datetimepicker';

type TabMode = 'availability' | 'blocked';

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AvailabilityManagementScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [tabMode, setTabMode] = useState<TabMode>('availability');

  // Availability state
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [showAddSlot, setShowAddSlot] = useState(false);
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('17:00');

  // Blocked times state
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [blockReason, setBlockReason] = useState('');
  const [blockStartDate, setBlockStartDate] = useState(new Date());
  const [blockEndDate, setBlockEndDate] = useState(new Date());
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const { data: provider, isLoading: providerLoading } = useProviderByUserId(user?.id || '');
  const { data: availability = [], isLoading: availabilityLoading } = useProviderAvailability(
    provider?.id || ''
  );
  const { data: blockedTimes = [], isLoading: blockedTimesLoading } = useProviderBlockedTimes(
    provider?.id || ''
  );

  const createAvailabilityMutation = useCreateAvailability();
  const updateAvailabilityMutation = useUpdateAvailability();
  const deleteAvailabilityMutation = useDeleteAvailability();
  const setDefaultAvailabilityMutation = useSetDefaultAvailability();
  const createBlockedTimeMutation = useCreateBlockedTime();
  const deleteBlockedTimeMutation = useDeleteBlockedTime();

  // Group availability by day
  const availabilityByDay = useMemo(() => {
    const grouped: Record<number, typeof availability> = {};
    for (let i = 0; i < 7; i++) {
      grouped[i] = [];
    }
    availability.forEach((slot) => {
      grouped[slot.dayOfWeek].push(slot);
    });
    return grouped;
  }, [availability]);

  const handleSetDefaultAvailability = () => {
    Alert.alert(
      'Set Default Hours',
      'This will set Monday-Friday 9am-5pm as your default availability. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Set Default',
          onPress: async () => {
            try {
              await setDefaultAvailabilityMutation.mutateAsync(provider!.id);
              Alert.alert('Success', 'Default availability set!');
            } catch (error) {
              Alert.alert('Error', (error as Error).message || 'Failed to set default availability');
            }
          },
        },
      ]
    );
  };

  const handleAddAvailabilitySlot = async () => {
    if (selectedDay === null) {
      Alert.alert('Error', 'Please select a day');
      return;
    }

    if (!newStartTime || !newEndTime) {
      Alert.alert('Error', 'Please enter start and end times');
      return;
    }

    try {
      await createAvailabilityMutation.mutateAsync({
        providerId: provider!.id,
        dayOfWeek: selectedDay,
        isAvailable: true,
        startTime: newStartTime,
        endTime: newEndTime,
      });
      Alert.alert('Success', 'Availability slot added!');
      setShowAddSlot(false);
      setSelectedDay(null);
      setNewStartTime('09:00');
      setNewEndTime('17:00');
    } catch (error) {
      Alert.alert('Error', (error as Error).message || 'Failed to add availability slot');
    }
  };

  const handleToggleAvailability = async (slotId: string, currentStatus: boolean) => {
    try {
      await updateAvailabilityMutation.mutateAsync({
        id: slotId,
        input: { isAvailable: !currentStatus },
      });
    } catch (error) {
      Alert.alert('Error', (error as Error).message || 'Failed to update availability');
    }
  };

  const handleDeleteAvailabilitySlot = (slotId: string, day: string, time: string) => {
    Alert.alert('Delete Slot', `Remove availability for ${day} ${time}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAvailabilityMutation.mutateAsync(slotId);
            Alert.alert('Success', 'Availability slot deleted');
          } catch (error) {
            Alert.alert('Error', (error as Error).message || 'Failed to delete slot');
          }
        },
      },
    ]);
  };

  const handleAddBlockedTime = async () => {
    if (!blockReason.trim()) {
      Alert.alert('Error', 'Please enter a reason');
      return;
    }

    if (blockEndDate <= blockStartDate) {
      Alert.alert('Error', 'End date must be after start date');
      return;
    }

    try {
      await createBlockedTimeMutation.mutateAsync({
        providerId: provider!.id,
        startDate: blockStartDate,
        endDate: blockEndDate,
        reason: blockReason.trim(),
        isRecurring: false,
      });
      Alert.alert('Success', 'Time blocked successfully!');
      setShowAddBlock(false);
      setBlockReason('');
      setBlockStartDate(new Date());
      setBlockEndDate(new Date());
    } catch (error) {
      Alert.alert('Error', (error as Error).message || 'Failed to block time');
    }
  };

  const handleDeleteBlockedTime = (blockId: string, reason: string) => {
    Alert.alert('Remove Block', `Remove blocked time: ${reason}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteBlockedTimeMutation.mutateAsync(blockId);
            Alert.alert('Success', 'Blocked time removed');
          } catch (error) {
            Alert.alert('Error', (error as Error).message || 'Failed to remove block');
          }
        },
      },
    ]);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDateTime = (date: Date) => {
    return `${formatDate(date)} ${formatTime(date)}`;
  };

  if (providerLoading || availabilityLoading || blockedTimesLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading availability...</Text>
      </View>
    );
  }

  if (!provider) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="calendar-alert" size={64} color="#999" />
        <Text style={styles.emptyText}>Provider profile not found</Text>
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
        <Text style={styles.headerTitle}>Availability Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tab Toggle */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, tabMode === 'availability' && styles.tabButtonActive]}
          onPress={() => setTabMode('availability')}
        >
          <Text style={[styles.tabText, tabMode === 'availability' && styles.tabTextActive]}>
            Weekly Hours
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, tabMode === 'blocked' && styles.tabButtonActive]}
          onPress={() => setTabMode('blocked')}
        >
          <Text style={[styles.tabText, tabMode === 'blocked' && styles.tabTextActive]}>
            Blocked Times
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {tabMode === 'availability' ? (
          <>
            {/* Quick Action */}
            {availability.length === 0 && (
              <View style={styles.quickActionCard}>
                <MaterialCommunityIcons name="clock-fast" size={32} color="#3B82F6" />
                <Text style={styles.quickActionTitle}>Set Default Hours</Text>
                <Text style={styles.quickActionText}>
                  Quickly set Monday-Friday 9am-5pm as your working hours
                </Text>
                <Button
                  mode="contained"
                  onPress={handleSetDefaultAvailability}
                  style={styles.defaultButton}
                  loading={setDefaultAvailabilityMutation.isPending}
                >
                  Set Default Hours
                </Button>
              </View>
            )}

            {/* Weekly Availability */}
            {DAYS_OF_WEEK.map((day, index) => {
              const slots = availabilityByDay[index];
              const hasSlots = slots.length > 0;

              return (
                <View key={day} style={styles.dayCard}>
                  <View style={styles.dayHeader}>
                    <View style={styles.dayTitleContainer}>
                      <Text style={styles.dayTitle}>{day}</Text>
                      {hasSlots && (
                        <View style={styles.slotCountBadge}>
                          <Text style={styles.slotCountText}>{slots.length}</Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedDay(index);
                        setShowAddSlot(true);
                      }}
                      style={styles.addSlotButton}
                    >
                      <MaterialCommunityIcons name="plus" size={20} color="#3B82F6" />
                    </TouchableOpacity>
                  </View>

                  {hasSlots ? (
                    slots.map((slot) => (
                      <View
                        key={slot.id}
                        style={[
                          styles.slotItem,
                          !slot.isAvailable && styles.slotItemDisabled,
                        ]}
                      >
                        <View style={styles.slotInfo}>
                          <Text style={styles.slotTime}>
                            {slot.startTime} - {slot.endTime}
                          </Text>
                          {!slot.isAvailable && (
                            <Text style={styles.unavailableText}>(Unavailable)</Text>
                          )}
                        </View>
                        <View style={styles.slotActions}>
                          <TouchableOpacity
                            onPress={() => handleToggleAvailability(slot.id, slot.isAvailable)}
                            style={styles.slotActionButton}
                          >
                            <MaterialCommunityIcons
                              name={slot.isAvailable ? 'eye' : 'eye-off'}
                              size={18}
                              color={slot.isAvailable ? '#10B981' : '#999'}
                            />
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() =>
                              handleDeleteAvailabilitySlot(
                                slot.id,
                                day,
                                `${slot.startTime}-${slot.endTime}`
                              )
                            }
                            style={styles.slotActionButton}
                          >
                            <MaterialCommunityIcons name="delete" size={18} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))
                  ) : (
                    <Text style={styles.noSlotsText}>No availability set</Text>
                  )}
                </View>
              );
            })}
          </>
        ) : (
          <>
            {/* Add Blocked Time Button */}
            <TouchableOpacity
              style={styles.addBlockButton}
              onPress={() => setShowAddBlock(true)}
            >
              <MaterialCommunityIcons name="calendar-remove" size={24} color="#FFF" />
              <Text style={styles.addBlockButtonText}>Block Time Off</Text>
            </TouchableOpacity>

            {/* Blocked Times List */}
            {blockedTimes.length === 0 ? (
              <View style={styles.emptyBlocksContainer}>
                <MaterialCommunityIcons name="calendar-check" size={64} color="#CCC" />
                <Text style={styles.emptyBlocksText}>No blocked times</Text>
                <Text style={styles.emptyBlocksSubtext}>
                  Block time for vacations, breaks, or personal time
                </Text>
              </View>
            ) : (
              blockedTimes.map((block) => (
                <View key={block.id} style={styles.blockCard}>
                  <View style={styles.blockHeader}>
                    <MaterialCommunityIcons name="calendar-remove" size={24} color="#EF4444" />
                    <Text style={styles.blockReason}>{block.reason || 'Time Off'}</Text>
                  </View>
                  <View style={styles.blockDetails}>
                    <View style={styles.blockDetailRow}>
                      <MaterialCommunityIcons name="clock-start" size={16} color="#666" />
                      <Text style={styles.blockDetailText}>{formatDateTime(block.startDate)}</Text>
                    </View>
                    <View style={styles.blockDetailRow}>
                      <MaterialCommunityIcons name="clock-end" size={16} color="#666" />
                      <Text style={styles.blockDetailText}>{formatDateTime(block.endDate)}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteBlockedTime(block.id, block.reason || 'Time Off')}
                    style={styles.removeBlockButton}
                  >
                    <Text style={styles.removeBlockButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Add Availability Slot Modal */}
      <Modal visible={showAddSlot} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Add Availability - {selectedDay !== null ? DAYS_OF_WEEK[selectedDay] : ''}
            </Text>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Start Time (HH:MM)</Text>
              <TextInput
                mode="outlined"
                value={newStartTime}
                onChangeText={setNewStartTime}
                placeholder="09:00"
                style={styles.modalInput}
              />
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>End Time (HH:MM)</Text>
              <TextInput
                mode="outlined"
                value={newEndTime}
                onChangeText={setNewEndTime}
                placeholder="17:00"
                style={styles.modalInput}
              />
            </View>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => {
                  setShowAddSlot(false);
                  setSelectedDay(null);
                }}
                style={styles.modalCancelButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleAddAvailabilitySlot}
                style={styles.modalSaveButton}
                loading={createAvailabilityMutation.isPending}
              >
                Add Slot
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Blocked Time Modal */}
      <Modal visible={showAddBlock} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Block Time Off</Text>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Reason</Text>
              <TextInput
                mode="outlined"
                value={blockReason}
                onChangeText={setBlockReason}
                placeholder="Vacation, Lunch, etc."
                style={styles.modalInput}
              />
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>Start Date & Time</Text>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowStartDatePicker(true)}
              >
                <MaterialCommunityIcons name="calendar" size={20} color="#666" />
                <Text style={styles.dateTimeText}>{formatDateTime(blockStartDate)}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalSection}>
              <Text style={styles.modalLabel}>End Date & Time</Text>
              <TouchableOpacity
                style={styles.dateTimeButton}
                onPress={() => setShowEndDatePicker(true)}
              >
                <MaterialCommunityIcons name="calendar" size={20} color="#666" />
                <Text style={styles.dateTimeText}>{formatDateTime(blockEndDate)}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setShowAddBlock(false)}
                style={styles.modalCancelButton}
              >
                Cancel
              </Button>
              <Button
                mode="contained"
                onPress={handleAddBlockedTime}
                style={styles.modalSaveButton}
                loading={createBlockedTimeMutation.isPending}
              >
                Block Time
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* DateTimePickers */}
      {showStartDatePicker && (
        <DateTimePicker
          value={blockStartDate}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            setShowStartDatePicker(Platform.OS === 'ios');
            if (date) setBlockStartDate(date);
          }}
        />
      )}

      {showEndDatePicker && (
        <DateTimePicker
          value={blockEndDate}
          mode="datetime"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            setShowEndDatePicker(Platform.OS === 'ios');
            if (date) setBlockEndDate(date);
          }}
        />
      )}
    </View>
  );
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  tabTextActive: {
    color: '#FFF',
  },
  content: {
    flex: 1,
  },
  quickActionCard: {
    margin: 20,
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  quickActionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 12,
    fontFamily: 'NunitoSans_700Bold',
  },
  quickActionText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'NunitoSans_400Regular',
  },
  defaultButton: {
    marginTop: 16,
    backgroundColor: '#3B82F6',
  },
  dayCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  dayHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  dayTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    fontFamily: 'NunitoSans_700Bold',
  },
  slotCountBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  slotCountText: {
    fontSize: 12,
    color: '#FFF',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  addSlotButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  slotItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    marginBottom: 8,
  },
  slotItemDisabled: {
    opacity: 0.5,
  },
  slotInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  slotTime: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  unavailableText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'NunitoSans_400Regular',
  },
  slotActions: {
    flexDirection: 'row',
    gap: 8,
  },
  slotActionButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noSlotsText: {
    fontSize: 14,
    color: '#9CA3AF',
    fontStyle: 'italic',
    fontFamily: 'NunitoSans_400Regular',
  },
  addBlockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    margin: 20,
    padding: 16,
    backgroundColor: '#EF4444',
    borderRadius: 12,
  },
  addBlockButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'NunitoSans_700Bold',
  },
  emptyBlocksContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyBlocksText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  emptyBlocksSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    textAlign: 'center',
    fontFamily: 'NunitoSans_400Regular',
  },
  blockCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  blockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  blockReason: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    fontFamily: 'NunitoSans_700Bold',
  },
  blockDetails: {
    gap: 8,
    marginBottom: 12,
  },
  blockDetailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  blockDetailText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'NunitoSans_400Regular',
  },
  removeBlockButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#FEE2E2',
    borderRadius: 6,
  },
  removeBlockButtonText: {
    fontSize: 13,
    color: '#EF4444',
    fontFamily: 'NunitoSans_600SemiBold',
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
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
    fontFamily: 'NunitoSans_700Bold',
  },
  modalSection: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  modalInput: {
    backgroundColor: '#F9FAFB',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  dateTimeText: {
    fontSize: 14,
    color: '#374151',
    fontFamily: 'NunitoSans_400Regular',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
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
