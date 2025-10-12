import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Text, Card, Button, SegmentedButtons, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useCustomerBookings, useCancelBooking } from '@/hooks/useBookings';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function BookingsScreen() {
  const router = useRouter();
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
        <Text style={{ marginTop: 16, color: '#666' }}>Loading bookings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall" style={styles.title}>My Bookings</Text>
      </View>

      <SegmentedButtons
        value={activeTab}
        onValueChange={setActiveTab}
        buttons={[
          {
            value: 'active',
            label: `Active (${activeBookings.length})`,
          },
          {
            value: 'past',
            label: `Past (${pastBookings.length})`,
          },
        ]}
        style={styles.tabs}
        theme={{ colors: { secondaryContainer: '#3B82F6', onSecondaryContainer: '#FFFFFF' } }}
      />

      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        onRefresh={refetch}
        refreshing={isLoading}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.cardHeader}>
                <Text variant="titleMedium">
                  {item.service?.name || 'Service'}
                </Text>
                <Chip
                  mode="flat"
                  textStyle={{ color: getStatusColor(item.status), fontWeight: 'bold' }}
                  style={{ backgroundColor: `${getStatusColor(item.status)}20` }}
                >
                  {item.status.toUpperCase()}
                </Chip>
              </View>

              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="calendar" size={16} color="#666" />
                <Text variant="bodyMedium" style={styles.detailText}>
                  {new Date(item.scheduledDate).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
                <Text variant="bodySmall" style={styles.detailText}>
                  {item.location}
                </Text>
              </View>

              {item.provider && (
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="store" size={16} color="#666" />
                  <Text variant="bodySmall" style={styles.detailText}>
                    {item.provider.businessName}
                  </Text>
                </View>
              )}

              {item.vehicle && (
                <View style={styles.detailRow}>
                  <MaterialCommunityIcons name="car" size={16} color="#666" />
                  <Text variant="bodySmall" style={styles.detailText}>
                    {item.vehicle.year} {item.vehicle.make} {item.vehicle.model}
                  </Text>
                </View>
              )}

              <Text variant="titleMedium" style={styles.price}>
                ${parseFloat(item.totalPrice).toFixed(2)}
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button
                mode="contained"
                buttonColor="#3B82F6"
                onPress={() => router.push(`/booking/${item.id}/details`)}
              >
                View Details
              </Button>
              {(item.status === 'confirmed' || item.status === 'pending') && (
                <Button onPress={() => handleCancel(item.id)} textColor="#DC2626">
                  Cancel
                </Button>
              )}
            </Card.Actions>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialCommunityIcons name="calendar-blank" size={64} color="#D1D5DB" />
            <Text variant="bodyLarge" style={{ marginTop: 16 }}>No bookings found</Text>
            {activeTab === 'active' && (
              <Button
                mode="contained"
                buttonColor="#3B82F6"
                onPress={() => router.push('/booking/service-selection')}
                style={styles.bookButton}
              >
                Book a Service
              </Button>
            )}
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
     backgroundColor: '#3B82F6',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
    fontFamily: 'NunitoSans_700Bold',
  },
  tabs: {
    margin: 16,
  },
  list: {
    padding: 16,
  },
  card: {
    elevation: 2,
    marginBottom: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  detailText: {
    marginLeft: 8,
    color: '#666',
    flex: 1,
  },
  price: {
    marginTop: 12,
    color: '#3B82F6',
    fontWeight: 'bold',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  bookButton: {
    borderRadius: 8,
    marginTop: 16,
  },
});
