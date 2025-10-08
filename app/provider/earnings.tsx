import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useProviderByUserId } from '@/hooks/useProviders';
import { useProviderBookings } from '@/hooks/useBookings';

export default function ProviderEarningsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const { data: provider } = useProviderByUserId(user?.id || '');
  const { data: bookings = [], isLoading } = useProviderBookings(provider?.id || '');

  // Calculate earnings metrics
  const earnings = useMemo(() => {
    const completedBookings = bookings.filter(b => b.status === 'completed');
    const pendingBookings = bookings.filter(b => b.status === 'confirmed' || b.status === 'in_progress');

    const totalRevenue = completedBookings.reduce((sum, b) => sum + parseFloat(b.totalPrice), 0);
    const pendingRevenue = pendingBookings.reduce((sum, b) => sum + parseFloat(b.totalPrice), 0);

    // Calculate revenue by month (last 6 months)
    const now = new Date();
    const monthlyRevenue = Array.from({ length: 6 }, (_, i) => {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthBookings = completedBookings.filter(b => {
        const bookingDate = new Date(b.scheduledDate);
        return bookingDate.getMonth() === month.getMonth() &&
               bookingDate.getFullYear() === month.getFullYear();
      });

      return {
        month: month.toLocaleString('default', { month: 'short' }),
        revenue: monthBookings.reduce((sum, b) => sum + parseFloat(b.totalPrice), 0),
        bookings: monthBookings.length,
      };
    }).reverse();

    // Recent transactions
    const recentTransactions = completedBookings
      .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())
      .slice(0, 10)
      .map(booking => ({
        id: booking.id,
        date: new Date(booking.scheduledDate),
        customerName: booking.customer
          ? `${booking.customer.firstName} ${booking.customer.lastName}`
          : 'Unknown Customer',
        service: (booking.service as any)?.name || 'Service',
        amount: parseFloat(booking.totalPrice),
      }));

    return {
      totalRevenue,
      pendingRevenue,
      completedCount: completedBookings.length,
      pendingCount: pendingBookings.length,
      monthlyRevenue,
      recentTransactions,
    };
  }, [bookings]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/provider-dashboard')} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Earnings</Text>
        <View style={styles.placeholder} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <ScrollView style={styles.scrollContent}>
          {/* Total Revenue Card */}
          <View style={styles.totalRevenueCard}>
            <MaterialCommunityIcons name="cash-multiple" size={48} color="#10B981" />
            <Text style={styles.totalRevenueLabel}>Total Revenue</Text>
            <Text style={styles.totalRevenueAmount}>${earnings.totalRevenue.toFixed(2)}</Text>
            <Text style={styles.totalRevenueSubtext}>
              From {earnings.completedCount} completed bookings
            </Text>
          </View>

          {/* Stats Grid */}
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="clock-outline" size={32} color="#F59E0B" />
              <Text style={styles.statValue}>${earnings.pendingRevenue.toFixed(2)}</Text>
              <Text style={styles.statLabel}>Pending</Text>
              <Text style={styles.statSubtext}>{earnings.pendingCount} bookings</Text>
            </View>

            <View style={styles.statCard}>
              <MaterialCommunityIcons name="calendar-month" size={32} color="#3B82F6" />
              <Text style={styles.statValue}>
                ${earnings.monthlyRevenue[earnings.monthlyRevenue.length - 1]?.revenue.toFixed(2) || '0.00'}
              </Text>
              <Text style={styles.statLabel}>This Month</Text>
              <Text style={styles.statSubtext}>
                {earnings.monthlyRevenue[earnings.monthlyRevenue.length - 1]?.bookings || 0} bookings
              </Text>
            </View>
          </View>

          {/* Monthly Revenue Chart */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Monthly Revenue</Text>
            <View style={styles.chartContainer}>
              {earnings.monthlyRevenue.map((month, index) => {
                const maxRevenue = Math.max(...earnings.monthlyRevenue.map(m => m.revenue), 1);
                const heightPercent = (month.revenue / maxRevenue) * 100;

                return (
                  <View key={index} style={styles.chartBar}>
                    <View style={styles.barContainer}>
                      <View style={[styles.bar, { height: `${heightPercent}%` }]} />
                    </View>
                    <Text style={styles.chartLabel}>{month.month}</Text>
                    <Text style={styles.chartValue}>${month.revenue.toFixed(0)}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Recent Transactions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            {earnings.recentTransactions.length > 0 ? (
              earnings.recentTransactions.map((transaction) => (
                <View key={transaction.id} style={styles.transactionCard}>
                  <View style={styles.transactionIcon}>
                    <MaterialCommunityIcons name="check-circle" size={24} color="#10B981" />
                  </View>

                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionCustomer}>{transaction.customerName}</Text>
                    <Text style={styles.transactionService}>{transaction.service}</Text>
                    <Text style={styles.transactionDate}>
                      {transaction.date.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </Text>
                  </View>

                  <Text style={styles.transactionAmount}>+${transaction.amount.toFixed(2)}</Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="cash-remove" size={64} color="#CCC" />
                <Text style={styles.emptyText}>No transactions yet</Text>
              </View>
            )}
          </View>
        </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flex: 1,
  },
  totalRevenueCard: {
    backgroundColor: '#FFF',
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
  },
  totalRevenueLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    fontFamily: 'NunitoSans_400Regular',
  },
  totalRevenueAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#10B981',
    marginTop: 8,
    fontFamily: 'NunitoSans_700Bold',
  },
  totalRevenueSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    fontFamily: 'NunitoSans_700Bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
  statSubtext: {
    fontSize: 10,
    color: '#999',
    marginTop: 2,
    fontFamily: 'NunitoSans_400Regular',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    fontFamily: 'NunitoSans_700Bold',
  },
  chartContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    elevation: 1,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 200,
  },
  chartBar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginHorizontal: 2,
  },
  barContainer: {
    width: '100%',
    height: 120,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '80%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
    minHeight: 4,
  },
  chartLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
  chartValue: {
    fontSize: 9,
    color: '#999',
    fontFamily: 'NunitoSans_400Regular',
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D1FAE5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionCustomer: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
    fontFamily: 'NunitoSans_700Bold',
  },
  transactionService: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
    fontFamily: 'NunitoSans_400Regular',
  },
  transactionDate: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'NunitoSans_400Regular',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#10B981',
    fontFamily: 'NunitoSans_700Bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
    fontFamily: 'NunitoSans_400Regular',
  },
});
