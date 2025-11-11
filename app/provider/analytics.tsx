import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useProviderByUserId } from '@/hooks/useProviders';
import { useProviderBookings } from '@/hooks/useBookings';
import { SafeAreaView } from 'react-native-safe-area-context';

const SCREEN_WIDTH = Dimensions.get('window').width;

type TimePeriod = 'week' | 'month' | 'year';

export default function ProviderAnalyticsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [period, setPeriod] = useState<TimePeriod>('month');

  const { data: provider } = useProviderByUserId(user?.id || '');
  const { data: bookings = [], isLoading } = useProviderBookings(provider?.id || '');

  // Calculate analytics based on selected period
  const analytics = useMemo(() => {
    const now = new Date();
    let startDate = new Date();

    if (period === 'week') {
      startDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      startDate.setMonth(now.getMonth() - 1);
    } else {
      startDate.setFullYear(now.getFullYear() - 1);
    }

    const periodBookings = bookings.filter(b =>
      new Date(b.scheduledDate) >= startDate
    );

    const completedBookings = periodBookings.filter(b => b.status === 'completed');
    const cancelledBookings = periodBookings.filter(b => b.status === 'cancelled');
    const inProgressBookings = periodBookings.filter(b => b.status === 'in_progress');
    const pendingBookings = periodBookings.filter(b => b.status === 'pending');

    const totalRevenue = completedBookings.reduce(
      (sum, b) => sum + parseFloat(b.totalPrice),
      0
    );

    const completionRate = periodBookings.length > 0
      ? (completedBookings.length / (completedBookings.length + cancelledBookings.length)) * 100
      : 0;

    const cancellationRate = periodBookings.length > 0
      ? (cancelledBookings.length / periodBookings.length) * 100
      : 0;

    const avgBookingValue = completedBookings.length > 0
      ? totalRevenue / completedBookings.length
      : 0;

    // Status breakdown
    const statusBreakdown = [
      {
        status: 'Completed',
        count: completedBookings.length,
        percentage: periodBookings.length > 0 ? (completedBookings.length / periodBookings.length) * 100 : 0,
        color: '#10B981',
        icon: 'check-circle',
      },
      {
        status: 'In Progress',
        count: inProgressBookings.length,
        percentage: periodBookings.length > 0 ? (inProgressBookings.length / periodBookings.length) * 100 : 0,
        color: '#FFA500',
        icon: 'progress-clock',
      },
      {
        status: 'Pending',
        count: pendingBookings.length,
        percentage: periodBookings.length > 0 ? (pendingBookings.length / periodBookings.length) * 100 : 0,
        color: '#F59E0B',
        icon: 'clock-outline',
      },
      {
        status: 'Cancelled',
        count: cancelledBookings.length,
        percentage: periodBookings.length > 0 ? (cancelledBookings.length / periodBookings.length) * 100 : 0,
        color: '#DC2626',
        icon: 'close-circle',
      },
    ];

    // Service type breakdown
    const serviceBreakdown = periodBookings.reduce((acc, booking) => {
      const serviceName = booking.service?.name || 'Unknown';
      if (!acc[serviceName]) {
        acc[serviceName] = { count: 0, revenue: 0 };
      }
      acc[serviceName].count++;
      if (booking.status === 'completed') {
        acc[serviceName].revenue += parseFloat(booking.totalPrice);
      }
      return acc;
    }, {} as Record<string, { count: number; revenue: number }>);

    const topServices = Object.entries(serviceBreakdown)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    return {
      totalBookings: periodBookings.length,
      completedBookings: completedBookings.length,
      totalRevenue,
      completionRate,
      cancellationRate,
      avgBookingValue,
      statusBreakdown,
      topServices,
    };
  }, [bookings, period]);

  const getPeriodLabel = () => {
    switch (period) {
      case 'week': return 'Last 7 Days';
      case 'month': return 'Last 30 Days';
      case 'year': return 'Last 12 Months';
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <View style={styles.placeholder} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Period Selector */}
          <View style={styles.periodSelector}>
            {(['week', 'month', 'year'] as TimePeriod[]).map((p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.periodButton,
                  period === p && styles.periodButtonActive,
                ]}
                onPress={() => setPeriod(p)}
              >
                <Text
                  style={[
                    styles.periodButtonText,
                    period === p && styles.periodButtonTextActive,
                  ]}
                >
                  {p === 'week' ? '7D' : p === 'month' ? '30D' : '1Y'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.periodLabel}>{getPeriodLabel()}</Text>

          {/* Key Metrics */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: '#E0F2FE' }]}>
                <MaterialCommunityIcons name="calendar-check" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.metricValue}>{analytics.totalBookings}</Text>
              <Text style={styles.metricLabel}>Total Bookings</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: '#D1FAE5' }]}>
                <MaterialCommunityIcons name="cash" size={24} color="#10B981" />
              </View>
              <Text style={styles.metricValue}>${analytics.totalRevenue.toFixed(2)}</Text>
              <Text style={styles.metricLabel}>Revenue</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: '#E0E7FF' }]}>
                <MaterialCommunityIcons name="percent" size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.metricValue}>{analytics.completionRate.toFixed(0)}%</Text>
              <Text style={styles.metricLabel}>Completion Rate</Text>
            </View>

            <View style={styles.metricCard}>
              <View style={[styles.metricIcon, { backgroundColor: '#FEF3C7' }]}>
                <MaterialCommunityIcons name="cash-multiple" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.metricValue}>${analytics.avgBookingValue.toFixed(2)}</Text>
              <Text style={styles.metricLabel}>Avg Booking</Text>
            </View>
          </View>

          {/* Booking Status Breakdown */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Booking Status</Text>
            <View style={styles.statusCard}>
              {analytics.statusBreakdown.map((item) => (
                <View key={item.status} style={styles.statusRow}>
                  <View style={styles.statusLeft}>
                    <View style={[styles.statusIcon, { backgroundColor: `${item.color}20` }]}>
                      <MaterialCommunityIcons
                        name={item.icon as any}
                        size={20}
                        color={item.color}
                      />
                    </View>
                    <Text style={styles.statusLabel}>{item.status}</Text>
                  </View>

                  <View style={styles.statusRight}>
                    <Text style={styles.statusCount}>{item.count}</Text>
                    <View style={styles.statusBarContainer}>
                      <View
                        style={[
                          styles.statusBar,
                          { width: `${item.percentage}%`, backgroundColor: item.color },
                        ]}
                      />
                    </View>
                    <Text style={styles.statusPercentage}>{item.percentage.toFixed(0)}%</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>

          {/* Top Services */}
          {analytics.topServices.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Top Services</Text>
              <View style={styles.servicesCard}>
                {analytics.topServices.map((service, index) => (
                  <View key={service.name} style={styles.serviceRow}>
                    <View style={styles.serviceRank}>
                      <Text style={styles.serviceRankText}>{index + 1}</Text>
                    </View>
                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceName}>{service.name}</Text>
                      <Text style={styles.serviceStats}>
                        {service.count} booking{service.count !== 1 ? 's' : ''} • ${service.revenue.toFixed(2)} revenue
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Additional Insights */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Insights</Text>
            <View style={styles.insightsCard}>
              <View style={styles.insightRow}>
                <MaterialCommunityIcons name="information" size={20} color="#3B82F6" />
                <Text style={styles.insightText}>
                  Your completion rate is {analytics.completionRate >= 90 ? 'excellent' : analytics.completionRate >= 70 ? 'good' : 'below average'} at {analytics.completionRate.toFixed(0)}%
                </Text>
              </View>

              {analytics.cancellationRate > 10 && (
                <View style={styles.insightRow}>
                  <MaterialCommunityIcons name="alert" size={20} color="#F59E0B" />
                  <Text style={styles.insightText}>
                    Your cancellation rate is {analytics.cancellationRate.toFixed(0)}%. Consider following up with cancelled bookings.
                  </Text>
                </View>
              )}

              {analytics.completedBookings > 0 && (
                <View style={styles.insightRow}>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
                  <Text style={styles.insightText}>
                    You've completed {analytics.completedBookings} booking{analytics.completedBookings !== 1 ? 's' : ''} in the selected period!
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'NunitoSans_700Bold',
  },
  placeholder: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  periodButtonActive: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  periodButtonText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  periodButtonTextActive: {
    color: '#FFF',
    fontFamily: 'NunitoSans_700Bold',
  },
  periodLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 8,
    fontFamily: 'NunitoSans_400Regular',
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 12,
  },
  metricCard: {
    width: (SCREEN_WIDTH - 52) / 2,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'NunitoSans_700Bold',
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
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
    fontFamily: 'NunitoSans_700Bold',
    marginBottom: 12,
  },
  statusCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    gap: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusLabel: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  statusRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1.2,
  },
  statusCount: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'NunitoSans_600SemiBold',
    width: 28,
    textAlign: 'right',
  },
  statusBarContainer: {
    flex: 1,
    height: 6,
    backgroundColor: '#F3F4F6',
    borderRadius: 3,
    overflow: 'hidden',
  },
  statusBar: {
    height: '100%',
    borderRadius: 3,
  },
  statusPercentage: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'NunitoSans_600SemiBold',
    width: 36,
    textAlign: 'right',
  },
  servicesCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    gap: 12,
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceRank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceRankText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#3B82F6',
    fontFamily: 'NunitoSans_700Bold',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'NunitoSans_700Bold',
    marginBottom: 2,
  },
  serviceStats: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'NunitoSans_400Regular',
  },
  insightsCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    gap: 16,
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  insightText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    fontFamily: 'NunitoSans_400Regular',
  },
});
