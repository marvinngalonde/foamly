import { View, StyleSheet, ScrollView, TouchableOpacity, Switch, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useProviderByUserId } from '@/hooks/useProviders';
import { useProviderBookings } from '@/hooks/useBookings';
import { useProviderReviews } from '@/hooks/useReviews';
import { useProviderServices } from '@/hooks/useServices';
import { useUnreadCount } from '@/hooks/useNotifications';

export default function ProviderDashboardScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isOnline, setIsOnline] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch provider data
  const { data: provider, isLoading: providerLoading } = useProviderByUserId(user?.id || '');
  const { data: bookings = [], isLoading: bookingsLoading, refetch: refetchBookings } = useProviderBookings(provider?.id || '');
  const { data: reviews = [], isLoading: reviewsLoading } = useProviderReviews(provider?.id || '');
  const { data: services = [], isLoading: servicesLoading } = useProviderServices(provider?.id || '');
  const { data: unreadCount = 0 } = useUnreadCount(user?.id || '');

  // Calculate metrics from real data
  const metrics = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysBookings = bookings.filter(b => {
      const bookingDate = new Date(b.scheduledDate);
      bookingDate.setHours(0, 0, 0, 0);
      return bookingDate.getTime() === today.getTime();
    });

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const weeklyBookings = bookings.filter(b => {
      const bookingDate = new Date(b.scheduledDate);
      return bookingDate >= weekStart;
    });

    const weeklyRevenue = weeklyBookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + parseFloat(b.totalPrice), 0);

    const completedBookings = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');
    const completionRate = completedBookings.length > 0
      ? (bookings.filter(b => b.status === 'completed').length / completedBookings.length) * 100
      : 0;

    return [
      {
        id: 1,
        label: "Today's Appointments",
        value: todaysBookings.length.toString(),
        icon: 'calendar-today',
        color: '#3B82F6',
        route: '/provider/schedule'
      },
      {
        id: 2,
        label: 'Weekly Revenue',
        value: `$${weeklyRevenue.toFixed(2)}`,
        icon: 'cash',
        color: '#10B981',
        route: '/provider/earnings'
      },
      {
        id: 3,
        label: 'Customer Rating',
        value: parseFloat(provider?.rating || '0').toFixed(1),
        icon: 'star',
        color: '#FFA500',
        route: '/provider/reviews'
      },
      {
        id: 4,
        label: 'Completion Rate',
        value: `${completionRate.toFixed(0)}%`,
        icon: 'check-circle',
        color: '#8B5CF6',
        route: '/provider/analytics'
      },
    ];
  }, [bookings, provider]);

  // Get today's bookings
  const todaysBookings = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return bookings
      .filter(b => {
        const bookingDate = new Date(b.scheduledDate);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate.getTime() === today.getTime();
      })
      .sort((a, b) => new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime())
      .slice(0, 5);
  }, [bookings]);

  // Get recent reviews
  const recentReviews = useMemo(() => {
    return reviews
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  }, [reviews]);

  const quickActions = [
    { id: 1, label: 'Services', icon: 'format-list-bulleted', color: '#3B82F6', route: '/provider/services' },
    { id: 2, label: 'Schedule', icon: 'calendar', color: '#10B981', route: '/provider/schedule' },
    { id: 3, label: 'Customers', icon: 'account-group', color: '#FFA500', route: '/provider/customers' },
    { id: 4, label: 'Earnings', icon: 'chart-line', color: '#8B5CF6', route: '/provider/earnings' },
    { id: 5, label: 'Team', icon: 'account-multiple', color: '#EC4899', route: '/provider/team' },
    { id: 6, label: 'Settings', icon: 'cog', color: '#6B7280', route: '/provider/settings' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#3B82F6';
      case 'in_progress': return '#FFA500';
      case 'pending': return '#F59E0B';
      case 'completed': return '#10B981';
      case 'cancelled': return '#DC2626';
      default: return '#666';
    }
  };

  const getStatusLabel = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchBookings();
    setRefreshing(false);
  };

  const handleToggleOnline = () => {
    setIsOnline(!isOnline);
    Alert.alert(
      isOnline ? 'Going Offline' : 'Going Online',
      isOnline
        ? 'You will stop receiving new booking requests'
        : 'You will start receiving booking requests in your service area',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Confirm', onPress: () => {
          // TODO: Update provider online status in database
        }}
      ]
    );
  };

  if (providerLoading || bookingsLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 16, color: '#666' }}>Loading dashboard...</Text>
      </View>
    );
  }

  if (!provider) {
    return (
      <View style={[styles.container, styles.centered]}>
        <MaterialCommunityIcons name="alert-circle" size={64} color="#DC2626" />
        <Text style={{ marginTop: 16, color: '#DC2626', fontSize: 16 }}>Provider profile not found</Text>
        <TouchableOpacity
          style={styles.createProfileButton}
          onPress={() => router.push('/provider/setup')}
        >
          <Text style={styles.createProfileButtonText}>Create Provider Profile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.push('/(tabs)/provider-profile')}>
            <Text style={styles.businessName}>{provider.businessName}</Text>
            <Text style={styles.headerSubtitle}>Tap to view profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => router.push('/notifications')}
          >
            <MaterialCommunityIcons name="bell-outline" size={24} color="#FFF" />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationText}>
                  {unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Metrics Cards - 2 rows, 2 columns */}
        <View style={styles.metricsContainer}>
          {metrics.slice(0, 4).map((metric) => (
            <TouchableOpacity
              key={metric.id}
              style={styles.metricCard}
              onPress={() => metric.route && router.push(metric.route as any)}
            >
              <View style={[styles.metricIcon, { backgroundColor: `${metric.color}20` }]}>
                <MaterialCommunityIcons name={metric.icon as any} size={24} color={metric.color} />
              </View>
              <Text style={styles.metricValue}>{metric.value}</Text>
              <Text style={styles.metricLabel}>{metric.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={styles.quickActionCard}
                onPress={() => router.push(action.route as any)}
              >
                <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}20` }]}>
                  <MaterialCommunityIcons name={action.icon as any} size={28} color={action.color} />
                </View>
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Today's Bookings */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today's Schedule</Text>
            <TouchableOpacity onPress={() => router.push('/provider/schedule')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {todaysBookings.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="calendar-blank" size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>No appointments today</Text>
            </View>
          ) : (
            todaysBookings.map((booking) => (
              <TouchableOpacity
                key={booking.id}
                style={styles.bookingCard}
                onPress={() => router.push(`/booking/${booking.id}/details`)}
              >
                <View style={styles.bookingTime}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color="#666" />
                  <Text style={styles.bookingTimeText}>
                    {new Date(booking.scheduledDate).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit'
                    })}
                  </Text>
                </View>

                <View style={styles.bookingDetails}>
                  <Text style={styles.bookingCustomer}>{booking.customer?.firstName} {booking.customer?.lastName}</Text>
                  <Text style={styles.bookingService}>{booking.service?.name}</Text>
                  <Text style={styles.bookingVehicle}>
                    {booking.vehicle?.year} {booking.vehicle?.make} {booking.vehicle?.model}
                  </Text>
                  <Text style={styles.bookingLocation}>📍 {booking.location}</Text>
                </View>

                <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(booking.status)}20` }]}>
                  <Text style={[styles.statusBadgeText, { color: getStatusColor(booking.status) }]}>
                    {getStatusLabel(booking.status)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Recent Reviews */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Reviews</Text>
            <TouchableOpacity onPress={() => router.push('/provider/reviews')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>

          {recentReviews.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="star-outline" size={48} color="#D1D5DB" />
              <Text style={styles.emptyStateText}>No reviews yet</Text>
            </View>
          ) : (
            recentReviews.map((review) => (
              <View key={review.id} style={styles.reviewCard}>
                <View style={styles.reviewHeader}>
                  <View>
                    <Text style={styles.reviewCustomer}>
                      {review.customer?.firstName} {review.customer?.lastName}
                    </Text>
                    <View style={styles.reviewRating}>
                      {[...Array(5)].map((_, i) => (
                        <MaterialCommunityIcons
                          key={i}
                          name={i < parseFloat(review.rating) ? 'star' : 'star-outline'}
                          size={16}
                          color="#FFA500"
                        />
                      ))}
                    </View>
                  </View>
                  <Text style={styles.reviewDate}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </Text>
                </View>
                {review.comment && (
                  <Text style={styles.reviewComment} numberOfLines={2}>
                    {review.comment}
                  </Text>
                )}
              </View>
            ))
          )}
        </View>

        {/* Business Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="briefcase" size={32} color="#3B82F6" />
              <Text style={styles.statValue}>{services.length}</Text>
              <Text style={styles.statLabel}>Active Services</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="calendar-check" size={32} color="#10B981" />
              <Text style={styles.statValue}>{bookings.filter(b => b.status === 'completed').length}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialCommunityIcons name="star" size={32} color="#FFA500" />
              <Text style={styles.statValue}>{reviews.length}</Text>
              <Text style={styles.statLabel}>Total Reviews</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
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
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  businessName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
    fontFamily: 'NunitoSans_700Bold',
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: 'NunitoSans_400Regular',
  },
  iconButton: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  notificationText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'NunitoSans_700Bold',
  },
  metricsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'NunitoSans_700Bold',
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'NunitoSans_700Bold',
  },
  seeAllText: {
    fontSize: 14,
    color: '#3B82F6',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickActionCard: {
    width: '31%',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  quickActionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  quickActionLabel: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  emptyState: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
    fontFamily: 'NunitoSans_400Regular',
  },
  bookingCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  bookingTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  bookingTimeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
    fontFamily: 'NunitoSans_700Bold',
  },
  bookingDetails: {
    marginBottom: 12,
  },
  bookingCustomer: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'NunitoSans_700Bold',
  },
  bookingService: {
    fontSize: 14,
    color: '#3B82F6',
    marginBottom: 4,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  bookingVehicle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
  bookingLocation: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'NunitoSans_400Regular',
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'NunitoSans_700Bold',
  },
  reviewCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  reviewCustomer: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'NunitoSans_700Bold',
  },
  reviewRating: {
    flexDirection: 'row',
  },
  reviewDate: {
    fontSize: 11,
    color: '#9CA3AF',
    fontFamily: 'NunitoSans_400Regular',
  },
  reviewComment: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    fontFamily: 'NunitoSans_400Regular',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
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
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
    fontFamily: 'NunitoSans_400Regular',
  },
  createProfileButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
  },
  createProfileButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'NunitoSans_700Bold',
  },
  bottomPadding: {
    height: 40,
  },
});
