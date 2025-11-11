import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Text, Searchbar } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useProviderByUserId } from '@/hooks/useProviders';
import { useProviderBookings } from '@/hooks/useBookings';

export default function ProviderCustomersScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: provider } = useProviderByUserId(user?.id || '');
  const { data: bookings = [], isLoading } = useProviderBookings(provider?.id || '');

  // Get unique customers from bookings
  const customers = useMemo(() => {
    const customerMap = new Map();

    bookings.forEach(booking => {
      if (booking.customer && booking.customerId) {
        if (!customerMap.has(booking.customerId)) {
          const customerBookings = bookings.filter(b => b.customerId === booking.customerId);
          customerMap.set(booking.customerId, {
            id: booking.customerId,
            firstName: booking.customer.firstName,
            lastName: booking.customer.lastName,
            email: booking.customer.email,
            phoneNumber: booking.customer.phoneNumber,
            profileImage: (booking.customer as any).profileImage,
            totalBookings: customerBookings.length,
            completedBookings: customerBookings.filter(b => b.status === 'completed').length,
            totalSpent: customerBookings
              .filter(b => b.status === 'completed')
              .reduce((sum, b) => sum + parseFloat(b.totalPrice), 0),
            lastBooking: new Date(Math.max(...customerBookings.map(b => new Date(b.scheduledDate).getTime()))),
          });
        }
      }
    });

    return Array.from(customerMap.values()).sort((a, b) => b.lastBooking - a.lastBooking);
  }, [bookings]);

  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return customers;

    const query = searchQuery.toLowerCase();
    return customers.filter(customer =>
      `${customer.firstName} ${customer.lastName}`.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query)
    );
  }, [customers, searchQuery]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Customers</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search customers..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{customers.length}</Text>
          <Text style={styles.statLabel}>Total Customers</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {customers.filter(c => c.lastBooking > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
          </Text>
          <Text style={styles.statLabel}>Active (30d)</Text>
        </View>
      </View>

      {/* Customer List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          data={filteredCustomers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.customerCard}
              onPress={() => router.push(`/customer/${item.id}/details` as any)}
            >
              <View style={styles.customerAvatar}>
                {item.profileImage ? (
                  <Image source={{ uri: item.profileImage }} style={styles.avatarImage} />
                ) : (
                  <MaterialCommunityIcons name="account" size={32} color="#3B82F6" />
                )}
              </View>

              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>
                  {item.firstName} {item.lastName}
                </Text>
                <Text style={styles.customerEmail}>{item.email}</Text>

                <View style={styles.customerStats}>
                  <View style={styles.statItem}>
                    <MaterialCommunityIcons name="calendar-check" size={14} color="#666" />
                    <Text style={styles.statItemText}>{item.completedBookings} completed</Text>
                  </View>
                  <View style={styles.statItem}>
                    <MaterialCommunityIcons name="cash" size={14} color="#666" />
                    <Text style={styles.statItemText}>${item.totalSpent.toFixed(2)}</Text>
                  </View>
                </View>
              </View>

              <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="account-search" size={64} color="#CCC" />
              <Text style={styles.emptyText}>
                {searchQuery ? 'No customers found' : 'No customers yet'}
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFF',
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
  placeholder: {
    width: 32,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFF',
  },
  searchBar: {
    elevation: 0,
    backgroundColor: '#F8F9FA',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'NunitoSans_700Bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 20,
  },
  customerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  customerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: 56,
    height: 56,
  },
  customerInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'NunitoSans_700Bold',
  },
  customerEmail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'NunitoSans_400Regular',
  },
  customerStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statItemText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'NunitoSans_400Regular',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
    fontFamily: 'NunitoSans_400Regular',
  },
});
