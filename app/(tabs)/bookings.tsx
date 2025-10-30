import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Button, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useCustomerBookings, useCancelBooking } from '@/hooks/useBookings';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function BookingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('active');

  const { data: allBookings = [], isLoading, refetch } = useCustomerBookings(user?.id || '');
  const cancelMutation = useCancelBooking();

  const activeBookings = useMemo(() => {
    return allBookings.filter(b =>
      b.status === 'pending' ||
      b.status === 'confirmed' ||
      b.status === 'in_progress'
    );
  }, [allBookings]);

  const pastBookings = useMemo(() => {
    return allBookings.filter(b =>
      b.status === 'completed' ||
      b.status === 'cancelled'
    );
  }, [allBookings]);

  const bookings = activeTab === 'active' ? activeBookings : pastBookings;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'in_progress':
        return '#3B82F6';
      case 'completed':
        return '#10B981';
      case 'cancelled':
        return '#DC2626';
      default:
        return '#9CA3AF';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'check-circle';
      case 'pending':
        return 'clock';
      case 'in_progress':
        return 'progress-wrench';
      case 'completed':
        return 'check-all';
      case 'cancelled':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const formatStatusText = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    return statusMap[status] || status;
  };

  const handleCancel = (bookingId: string) => {
    cancelMutation.mutate(bookingId, {
      onSuccess: () => {
        refetch();
      },
    });
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 16, color: '#666', fontSize: 16 }}>Loading your bookings...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>My Bookings</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Manage your service appointments
        </Text>
      </View>

      <View style={styles.innerContainer}>
      <View style={styles.tabsContainer}>
        <Chip
          selected={activeTab === 'active'}
          onPress={() => setActiveTab('active')}
          style={[styles.chip, activeTab === 'active' && styles.chipSelected]}
          textStyle={[styles.chipText, activeTab === 'active' && styles.chipTextSelected]}
          selectedColor={activeTab === 'active' ? '#FFFFFF' : '#6B7280'}
        >
          Active ({activeBookings.length})
        </Chip>
        <Chip
          selected={activeTab === 'past'}
          onPress={() => setActiveTab('past')}
          style={[styles.chip, activeTab === 'past' && styles.chipSelected]}
          textStyle={[styles.chipText, activeTab === 'past' && styles.chipTextSelected]}
          selectedColor={activeTab === 'past' ? '#FFFFFF' : '#6B7280'}
        >
          History ({pastBookings.length})
        </Chip>
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 20 }]}
        onRefresh={refetch}
        refreshing={isLoading}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => router.push(`/booking/${item.id}/details`)}
            activeOpacity={0.7}
          >
            {/* Row 1: Service Image, Provider Name, Service Name, Date */}
            <View style={styles.row1}>
              <View style={styles.serviceImageContainer}>
                <MaterialCommunityIcons name="car-wash" size={32} color="#3B82F6" />
              </View>

              <View style={styles.serviceDetails}>
                <Text style={styles.providerName}>
                  {item.provider?.businessName || 'Provider'}
                </Text>
                <Text style={styles.serviceName}>
                  {item.service?.name || 'Service'}
                </Text>
              </View>

              <View style={styles.dateContainer}>
                <MaterialCommunityIcons name="calendar" size={16} color="#6B7280" />
                <Text style={styles.dateText}>
                  {new Date(item.scheduledDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </Text>
              </View>
            </View>

            {/* Row 2: Price, Car, Status Button */}
            <View style={styles.row2}>
              <View style={styles.leftSection}>
                <Text style={styles.priceValue}>
                  ${parseFloat(item.totalPrice).toFixed(2)}
                </Text>

                <View style={styles.vehicleContainer}>
                  <MaterialCommunityIcons name="car" size={16} color="#6B7280" />
                  <Text style={styles.vehicleText} numberOfLines={1}>
                    {item.vehicle ? `${item.vehicle.make} ${item.vehicle.model}` : 'Vehicle'}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.statusButton, { backgroundColor: getStatusColor(item.status) }]}
                onPress={() => router.push(`/booking/${item.id}/details`)}
              >
                <MaterialCommunityIcons
                  name={getStatusIcon(item.status)}
                  size={14}
                  color="#FFF"
                />
                <Text style={styles.statusButtonText}>
                  {formatStatusText(item.status)}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="calendar-blank" size={80} color="#E5E7EB" />
            <Text variant="titleMedium" style={styles.emptyTitle}>
              No {activeTab === 'active' ? 'active' : 'past'} bookings
            </Text>
            <Text variant="bodyMedium" style={styles.emptyText}>
              {activeTab === 'active' 
                ? "You don't have any upcoming appointments"
                : "Your completed and cancelled bookings will appear here"
              }
            </Text>
            {activeTab === 'active' && (
              <Button
                mode="contained"
                buttonColor="#3B82F6"
                onPress={() => router.push('/booking/service-selection')}
                style={styles.bookButton}
                icon="plus"
                contentStyle={styles.bookButtonContent}
              >
                Book a Service
              </Button>
            )}
          </View>
        }
      />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3B82F6',
   
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  innerContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    borderTopRightRadius: 24,
    borderTopLeftRadius: 24,
    marginTop: 14,
    overflow: 'hidden', 
  },

  header: {
    backgroundColor: 'transparent',
    paddingTop: 15,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 4,
    fontFamily: 'NunitoSans_700Bold',
  },
  subtitle: {
    color: '#FFF',
    fontSize: 16,
    opacity: 0.9,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    gap: 12,
  },
  chip: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
  },
  chipSelected: {
    backgroundColor: '#3B82F6',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  chipTextSelected: {
    color: '#FFFFFF',
    fontFamily: 'NunitoSans_700Bold',
  },
  list: {
    padding: 16,
    paddingTop: 8,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#F1F5F9',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  row1: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  serviceImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  serviceDetails: {
    flex: 1,
    justifyContent: 'center',
  },
  providerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    fontFamily: 'NunitoSans_700Bold',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  dateText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  row2: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    marginBottom: 2,
    fontFamily: 'NunitoSans_400Regular',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3B82F6',
    fontFamily: 'NunitoSans_700Bold',
  },
  vehicleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vehicleText: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '600',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  statusButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  statusButtonText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFF',
    fontFamily: 'NunitoSans_700Bold',
  },
  empty: {
    padding: 48,
    alignItems: 'center',
    marginTop: 40,
  },
  emptyTitle: {
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 8,
    fontWeight: '600',
  },
  emptyText: {
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 8,
  },
  bookButton: {
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  bookButtonContent: {
    paddingVertical: 6,
  },
});