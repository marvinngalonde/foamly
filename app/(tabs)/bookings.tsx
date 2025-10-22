import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Card, Button, SegmentedButtons, Chip } from 'react-native-paper';
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
        <SegmentedButtons
          value={activeTab}
          onValueChange={setActiveTab}
          buttons={[
            {
              value: 'active',
              label: `Active (${activeBookings.length})`,
              style: styles.tabButton,
            },
            {
              value: 'past',
              label: `History (${pastBookings.length})`,
              style: styles.tabButton,
            },
          ]}
          style={styles.tabs}
          theme={{ 
            colors: { 
              secondaryContainer: '#3B82F6', 
              onSecondaryContainer: '#FFFFFF',
              primary: '#3B82F6'
            } 
          }}
        />
      </View>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 20 }]}
        onRefresh={refetch}
        refreshing={isLoading}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Card style={styles.card} elevation={3}>
            <Card.Content style={styles.cardContent}>
              <View style={styles.cardHeader}>
                <View style={styles.serviceInfo}>
                  <Text variant="titleMedium" style={styles.serviceName}>
                    {item.service?.name || 'Service'}
                  </Text>
                  <View style={styles.statusContainer}>
                    <MaterialCommunityIcons 
                      name={getStatusIcon(item.status)} 
                      size={14} 
                      color={getStatusColor(item.status)} 
                    />
                    <Chip
                      compact
                      mode="flat"
                      textStyle={{ 
                        color: getStatusColor(item.status), 
                        fontWeight: '600',
                        fontSize: 12,
                        marginLeft: 4
                      }}
                      style={{ 
                        backgroundColor: `${getStatusColor(item.status)}15`,
                        height: 28,
                        marginLeft: 6
                      }}
                    >
                      {formatStatusText(item.status)}
                    </Chip>
                  </View>
                </View>
                <Text variant="titleLarge" style={styles.price}>
                  ${parseFloat(item.totalPrice).toFixed(2)}
                </Text>
              </View>

              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="calendar" size={18} color="#6B7280" />
                  <Text variant="bodyMedium" style={styles.detailText}>
                    {new Date(item.scheduledDate).toLocaleDateString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>

                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="map-marker" size={18} color="#6B7280" />
                  <Text variant="bodySmall" style={styles.detailText}>
                    {item.location}
                  </Text>
                </View>

                {item.provider && (
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="store" size={18} color="#6B7280" />
                    <Text variant="bodySmall" style={styles.detailText}>
                      {item.provider.businessName}
                    </Text>
                  </View>
                )}

                {item.vehicle && (
                  <View style={styles.detailRow}>
                    <MaterialCommunityIcons name="car" size={18} color="#6B7280" />
                    <Text variant="bodySmall" style={styles.detailText}>
                      {item.vehicle.year} {item.vehicle.make} {item.vehicle.model}
                    </Text>
                  </View>
                )}
              </View>
            </Card.Content>
            
            <Card.Actions style={styles.cardActions}>
              <Button
                mode="outlined"
                style={styles.detailsButton}
                labelStyle={styles.detailsButtonLabel}
                onPress={() => router.push(`/booking/${item.id}/details`)}
                icon="information"
              >
                Details
              </Button>
              {(item.status === 'confirmed' || item.status === 'pending') && (
                <Button 
                  mode="contained"
                  style={styles.cancelButton}
                  labelStyle={styles.cancelButtonLabel}
                  onPress={() => handleCancel(item.id)}
                  icon="close"
                  buttonColor="#FEF2F2"
                  textColor="#DC2626"
                >
                  Cancel
                </Button>
              )}
            </Card.Actions>
          </Card>
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
    marginTop: 44,
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
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 8,
  },
  tabs: {
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
  },
  tabButton: {
    borderRadius: 8,
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
  },
  cardContent: {
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  serviceInfo: {
    flex: 1,
    marginRight: 12,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 24,
    marginBottom: 4,
  },
  price: {
    color: '#3B82F6',
    fontWeight: '700',
    fontSize: 20,
  },
  detailsContainer: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    marginLeft: 12,
    color: '#6B7280',
    flex: 1,
    fontSize: 14,
  },
  cardActions: {
    padding: 16,
    paddingTop: 8,
    justifyContent: 'flex-end',
    gap: 12,
  },
  detailsButton: {
    borderColor: '#3B82F6',
    borderRadius: 8,
    flex: 1,
  },
  detailsButtonLabel: {
    color: '#3B82F6',
    fontWeight: '600',
    fontSize: 14,
  },
  cancelButton: {
    borderRadius: 8,
    flex: 1,
    borderWidth: 0,
  },
  cancelButtonLabel: {
    fontWeight: '600',
    fontSize: 14,
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