import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useProviderByUserId } from '@/hooks/useProviders';
import { useProviderBookings, useUpdateBookingStatus } from '@/hooks/useBookings';

type ViewMode = 'day' | 'week' | 'month';

export default function ProviderScheduleScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

  const { data: provider, isLoading: providerLoading } = useProviderByUserId(user?.id || '');
  const { data: bookings = [], isLoading: bookingsLoading, refetch } = useProviderBookings(provider?.id || '');
  const updateBookingStatusMutation = useUpdateBookingStatus();

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleAcceptBooking = (bookingId: string, customerName: string) => {
    Alert.alert(
      'Accept Booking',
      `Confirm this booking for ${customerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Accept',
          onPress: () => {
            updateBookingStatusMutation.mutate(
              { id: bookingId, status: 'confirmed' },
              {
                onSuccess: () => {
                  Alert.alert('Success', 'Booking accepted!');
                  refetch();
                },
                onError: (error) => {
                  Alert.alert('Error', (error as Error).message || 'Failed to accept booking');
                },
              }
            );
          },
        },
      ]
    );
  };

  const handleDeclineBooking = (bookingId: string, customerName: string) => {
    Alert.alert(
      'Decline Booking',
      `Are you sure you want to decline this booking from ${customerName}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Decline',
          style: 'destructive',
          onPress: () => {
            updateBookingStatusMutation.mutate(
              { id: bookingId, status: 'cancelled' },
              {
                onSuccess: () => {
                  Alert.alert('Declined', 'Booking has been declined');
                  refetch();
                },
                onError: (error) => {
                  Alert.alert('Error', (error as Error).message || 'Failed to decline booking');
                },
              }
            );
          },
        },
      ]
    );
  };

  // Filter bookings by selected date
  const dayBookings = useMemo(() => {
    const selectedDateStr = selectedDate.toDateString();
    return bookings
      .filter(booking => {
        const bookingDate = new Date(booking.scheduledDate);
        return bookingDate.toDateString() === selectedDateStr;
      })
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime());
  }, [bookings, selectedDate]);

  // Get week dates
  const weekDates = useMemo(() => {
    const dates: Date[] = [];
    const start = new Date(selectedDate);
    start.setDate(start.getDate() - start.getDay()); // Start from Sunday

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [selectedDate]);

  // Count bookings per day for week view
  const weekBookingCounts = useMemo(() => {
    return weekDates.map(date => {
      const dateStr = date.toDateString();
      return bookings.filter(booking =>
        new Date(booking.scheduledDate).toDateString() === dateStr
      ).length;
    });
  }, [bookings, weekDates]);

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(selectedDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'confirmed': return '#3B82F6';
      case 'in_progress': return '#8B5CF6';
      case 'completed': return '#10B981';
      case 'cancelled': return '#EF4444';
      default: return '#999';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'clock-outline';
      case 'confirmed': return 'check-circle';
      case 'in_progress': return 'progress-clock';
      case 'completed': return 'check-all';
      case 'cancelled': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  if (providerLoading || bookingsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading schedule...</Text>
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
        <Text style={styles.headerTitle}>Schedule</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => setSelectedDate(new Date())} style={styles.todayButtonContainer}>
            <Text style={styles.todayButton}>Today</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push('/provider/availability')} style={styles.settingsButton}>
            <MaterialCommunityIcons name="cog" size={24} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </View>

      {/* View Mode Toggle */}
      <View style={styles.viewModeContainer}>
        {(['day', 'week', 'month'] as ViewMode[]).map(mode => (
          <TouchableOpacity
            key={mode}
            style={[styles.viewModeButton, viewMode === mode && styles.viewModeButtonActive]}
            onPress={() => setViewMode(mode)}
          >
            <Text style={[styles.viewModeText, viewMode === mode && styles.viewModeTextActive]}>
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Date Navigation */}
      <View style={styles.dateNav}>
        <TouchableOpacity onPress={() => changeDate(-1)} style={styles.navButton}>
          <MaterialCommunityIcons name="chevron-left" size={24} color="#3B82F6" />
        </TouchableOpacity>

        <View style={styles.dateTitleContainer}>
          <Text style={styles.dateTitle}>{formatDate(selectedDate)}</Text>
          {isToday(selectedDate) && (
            <View style={styles.todayBadge}>
              <Text style={styles.todayBadgeText}>Today</Text>
            </View>
          )}
        </View>

        <TouchableOpacity onPress={() => changeDate(1)} style={styles.navButton}>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Week View */}
      {viewMode === 'week' && (
        <View style={styles.weekContainer}>
          {weekDates.map((date, index) => {
            const isSelected = date.toDateString() === selectedDate.toDateString();
            const isTodayDate = isToday(date);
            const bookingCount = weekBookingCounts[index];

            return (
              <TouchableOpacity
                key={date.toISOString()}
                style={[
                  styles.weekDayCard,
                  isSelected && styles.weekDayCardSelected,
                  isTodayDate && styles.weekDayCardToday
                ]}
                onPress={() => setSelectedDate(date)}
              >
                <Text style={[styles.weekDayName, isSelected && styles.weekDayNameSelected]}>
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </Text>
                <Text style={[styles.weekDayDate, isSelected && styles.weekDayDateSelected]}>
                  {date.getDate()}
                </Text>
                {bookingCount > 0 && (
                  <View style={[styles.weekDayDot, isSelected && styles.weekDayDotSelected]}>
                    <Text style={[styles.weekDayCount, isSelected && styles.weekDayCountSelected]}>
                      {bookingCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      {/* Appointments List */}
      <ScrollView
        style={styles.appointmentsList}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.appointmentsHeader}>
          <Text style={styles.appointmentsTitle}>
            {dayBookings.length} {dayBookings.length === 1 ? 'Appointment' : 'Appointments'}
          </Text>
        </View>

        {dayBookings.length === 0 ? (
          <View style={styles.emptyDay}>
            <MaterialCommunityIcons name="calendar-blank" size={48} color="#CCC" />
            <Text style={styles.emptyDayText}>No appointments scheduled</Text>
            <Text style={styles.emptyDaySubtext}>Enjoy your free time!</Text>
          </View>
        ) : (
          dayBookings.map((booking) => (
            <TouchableOpacity
              key={booking.id}
              style={styles.appointmentCard}
              onPress={() => router.push(`/provider/bookings/${booking.id}`)}
            >
              {/* Time Indicator */}
              <View style={styles.timeIndicator}>
                <View style={[styles.timeIndicatorDot, { backgroundColor: getStatusColor(booking.status) }]} />
                <View style={styles.timeIndicatorLine} />
              </View>

              {/* Appointment Content */}
              <View style={styles.appointmentContent}>
                <View style={styles.appointmentHeader}>
                  <Text style={styles.appointmentTime}>{formatTime(booking.scheduledDate)}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(booking.status)}20` }]}>
                    <MaterialCommunityIcons
                      name={getStatusIcon(booking.status) as any}
                      size={12}
                      color={getStatusColor(booking.status)}
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(booking.status) }]}>
                      {booking.status.replace('_', ' ')}
                    </Text>
                  </View>
                </View>

                <Text style={styles.serviceName}>{booking.service?.name || 'Service'}</Text>

                <View style={styles.appointmentMeta}>
                  <View style={styles.metaItem}>
                    <MaterialCommunityIcons name="account" size={14} color="#666" />
                    <Text style={styles.metaText}>
                      {booking.customer?.firstName} {booking.customer?.lastName}
                    </Text>
                  </View>
                  <View style={styles.metaItem}>
                    <MaterialCommunityIcons name="car" size={14} color="#666" />
                    <Text style={styles.metaText}>
                      {booking.vehicle?.make} {booking.vehicle?.model}
                    </Text>
                  </View>
                </View>

                {booking.location && (
                  <View style={styles.locationContainer}>
                    <MaterialCommunityIcons name="map-marker" size={14} color="#3B82F6" />
                    <Text style={styles.locationText} numberOfLines={1}>
                      {booking.location.address}
                    </Text>
                  </View>
                )}

                <View style={styles.appointmentFooter}>
                  <Text style={styles.priceText}>${parseFloat(booking.totalPrice).toFixed(2)}</Text>
                  {booking.status === 'pending' && (
                    <View style={styles.quickActions}>
                      <TouchableOpacity
                        style={styles.acceptButton}
                        onPress={() => handleAcceptBooking(
                          booking.id,
                          `${booking.customer?.firstName} ${booking.customer?.lastName}`
                        )}
                      >
                        <Text style={styles.acceptButtonText}>Accept</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.declineButton}
                        onPress={() => handleDeclineBooking(
                          booking.id,
                          `${booking.customer?.firstName} ${booking.customer?.lastName}`
                        )}
                      >
                        <MaterialCommunityIcons name="close" size={16} color="#EF4444" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  todayButtonContainer: {
    paddingVertical: 4,
  },
  todayButton: {
    fontSize: 14,
    color: '#3B82F6',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  viewModeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  viewModeButtonActive: {
    backgroundColor: '#3B82F6',
  },
  viewModeText: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  viewModeTextActive: {
    color: '#FFF',
  },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#F8F9FA',
  },
  navButton: {
    padding: 4,
  },
  dateTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'NunitoSans_700Bold',
  },
  todayBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  todayBadgeText: {
    fontSize: 10,
    color: '#FFF',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  weekContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  weekDayCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
  },
  weekDayCardSelected: {
    backgroundColor: '#3B82F6',
  },
  weekDayCardToday: {
    borderWidth: 2,
    borderColor: '#FFA500',
  },
  weekDayName: {
    fontSize: 11,
    color: '#666',
    fontFamily: 'NunitoSans_400Regular',
    marginBottom: 4,
  },
  weekDayNameSelected: {
    color: '#FFF',
  },
  weekDayDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'NunitoSans_700Bold',
    marginBottom: 4,
  },
  weekDayDateSelected: {
    color: '#FFF',
  },
  weekDayDot: {
    minWidth: 20,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  weekDayDotSelected: {
    backgroundColor: '#FFF',
  },
  weekDayCount: {
    fontSize: 10,
    color: '#FFF',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  weekDayCountSelected: {
    color: '#3B82F6',
  },
  appointmentsList: {
    flex: 1,
  },
  appointmentsHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  appointmentsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'NunitoSans_700Bold',
  },
  emptyDay: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  emptyDayText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  emptyDaySubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
  appointmentCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  timeIndicator: {
    alignItems: 'center',
    marginRight: 12,
  },
  timeIndicatorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  timeIndicatorLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
  },
  appointmentContent: {
    flex: 1,
  },
  appointmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appointmentTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'NunitoSans_700Bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontFamily: 'NunitoSans_600SemiBold',
    textTransform: 'capitalize',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'NunitoSans_700Bold',
  },
  appointmentMeta: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'NunitoSans_400Regular',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  locationText: {
    flex: 1,
    fontSize: 12,
    color: '#3B82F6',
    fontFamily: 'NunitoSans_400Regular',
  },
  appointmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    fontFamily: 'NunitoSans_700Bold',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  acceptButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  acceptButtonText: {
    fontSize: 12,
    color: '#FFF',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  declineButton: {
    backgroundColor: '#FEE2E2',
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomPadding: {
    height: 20,
  },
});
