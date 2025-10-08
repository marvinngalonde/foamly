import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { useBooking, useUpdateBookingStatus } from '@/hooks/useBookings';

export default function ProviderBookingDetailsScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [actionLoading, setActionLoading] = useState(false);

  const { data: booking, isLoading, refetch } = useBooking(id);
  const updateStatusMutation = useUpdateBookingStatus();

  const handleUpdateStatus = async (status: string) => {
    if (!booking) return;

    Alert.alert(
      'Confirm Action',
      `Are you sure you want to ${status.replace('_', ' ')} this booking?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setActionLoading(true);
            try {
              await updateStatusMutation.mutateAsync({ id: booking.id, status: status as any });
              Alert.alert('Success', `Booking ${status.replace('_', ' ')} successfully`);
              refetch();
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to update booking status');
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleCall = () => {
    if (booking?.customer?.phone) {
      Linking.openURL(`tel:${booking.customer.phone}`);
    } else {
      Alert.alert('No Phone Number', 'Customer phone number is not available');
    }
  };

  const handleNavigate = () => {
    if (booking?.location?.latitude && booking?.location?.longitude) {
      const url = `https://maps.google.com/?q=${booking.location.latitude},${booking.location.longitude}`;
      Linking.openURL(url);
    } else if (booking?.location?.address) {
      const url = `https://maps.google.com/?q=${encodeURIComponent(booking.location.address)}`;
      Linking.openURL(url);
    } else {
      Alert.alert('No Location', 'Location information is not available');
    }
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

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return {
      date: date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
    };
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading booking details...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="calendar-alert" size={64} color="#999" />
        <Text style={styles.emptyText}>Booking not found</Text>
        <TouchableOpacity style={styles.backToListButton} onPress={() => router.back()}>
          <Text style={styles.backToListText}>Back to Schedule</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { date, time } = formatDateTime(booking.scheduledDate);
  const statusColor = getStatusColor(booking.status);
  const statusIcon = getStatusIcon(booking.status);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Banner */}
        <View style={[styles.statusBanner, { backgroundColor: `${statusColor}20` }]}>
          <MaterialCommunityIcons name={statusIcon as any} size={24} color={statusColor} />
          <Text style={[styles.statusBannerText, { color: statusColor }]}>
            {booking.status.replace('_', ' ').toUpperCase()}
          </Text>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          <View style={styles.card}>
            <View style={styles.customerHeader}>
              <View style={styles.customerAvatar}>
                <MaterialCommunityIcons name="account" size={32} color="#3B82F6" />
              </View>
              <View style={styles.customerInfo}>
                <Text style={styles.customerName}>
                  {booking.customer?.firstName} {booking.customer?.lastName}
                </Text>
                <Text style={styles.customerEmail}>{booking.customer?.email}</Text>
                {booking.customer?.phone && (
                  <Text style={styles.customerPhone}>{booking.customer.phone}</Text>
                )}
              </View>
            </View>
            <TouchableOpacity style={styles.callButton} onPress={handleCall}>
              <MaterialCommunityIcons name="phone" size={20} color="#FFF" />
              <Text style={styles.callButtonText}>Call Customer</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Service Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Details</Text>
          <View style={styles.card}>
            <View style={styles.serviceRow}>
              <MaterialCommunityIcons name="spray" size={20} color="#3B82F6" />
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceLabel}>Service</Text>
                <Text style={styles.serviceValue}>{booking.service?.name || 'N/A'}</Text>
              </View>
            </View>
            {booking.service?.description && (
              <Text style={styles.serviceDescription}>{booking.service.description}</Text>
            )}
          </View>
        </View>

        {/* Vehicle Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vehicle Information</Text>
          <View style={styles.card}>
            <View style={styles.vehicleRow}>
              <MaterialCommunityIcons name="car" size={24} color="#3B82F6" />
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleMake}>
                  {booking.vehicle?.year} {booking.vehicle?.make} {booking.vehicle?.model}
                </Text>
                <Text style={styles.vehicleMeta}>
                  {booking.vehicle?.color} • {booking.vehicle?.type}
                </Text>
                {booking.vehicle?.licensePlate && (
                  <Text style={styles.licensePlate}>Plate: {booking.vehicle.licensePlate}</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Schedule */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Schedule</Text>
          <View style={styles.card}>
            <View style={styles.scheduleRow}>
              <MaterialCommunityIcons name="calendar" size={20} color="#3B82F6" />
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleLabel}>Date</Text>
                <Text style={styles.scheduleValue}>{date}</Text>
              </View>
            </View>
            <View style={styles.scheduleDivider} />
            <View style={styles.scheduleRow}>
              <MaterialCommunityIcons name="clock-outline" size={20} color="#3B82F6" />
              <View style={styles.scheduleInfo}>
                <Text style={styles.scheduleLabel}>Time</Text>
                <Text style={styles.scheduleValue}>{time}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Location */}
        {booking.location && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.card}>
              <View style={styles.locationRow}>
                <MaterialCommunityIcons name="map-marker" size={20} color="#EF4444" />
                <Text style={styles.locationAddress}>{booking.location.address}</Text>
              </View>
              <TouchableOpacity style={styles.navigateButton} onPress={handleNavigate}>
                <MaterialCommunityIcons name="navigation" size={20} color="#FFF" />
                <Text style={styles.navigateButtonText}>Navigate</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Notes */}
        {booking.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Instructions</Text>
            <View style={styles.card}>
              <Text style={styles.notesText}>{booking.notes}</Text>
            </View>
          </View>
        )}

        {/* Pricing */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing</Text>
          <View style={styles.card}>
            <View style={styles.pricingRow}>
              <Text style={styles.pricingLabel}>Total Amount</Text>
              <Text style={styles.pricingValue}>${parseFloat(booking.totalPrice).toFixed(2)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Action Buttons */}
      {booking.status !== 'cancelled' && booking.status !== 'completed' && (
        <View style={styles.actionBar}>
          {booking.status === 'pending' && (
            <>
              <TouchableOpacity
                style={[styles.actionButton, styles.rejectButton]}
                onPress={() => handleUpdateStatus('cancelled')}
                disabled={actionLoading}
              >
                <Text style={styles.rejectButtonText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => handleUpdateStatus('confirmed')}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <Text style={styles.acceptButtonText}>Accept</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {booking.status === 'confirmed' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.startButton]}
              onPress={() => handleUpdateStatus('in_progress')}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="play" size={20} color="#FFF" />
                  <Text style={styles.startButtonText}>Start Service</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {booking.status === 'in_progress' && (
            <TouchableOpacity
              style={[styles.actionButton, styles.completeButton]}
              onPress={() => handleUpdateStatus('completed')}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#FFF" />
              ) : (
                <>
                  <MaterialCommunityIcons name="check" size={20} color="#FFF" />
                  <Text style={styles.completeButtonText}>Mark Complete</Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      )}
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
  backToListButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  backToListText: {
    fontSize: 14,
    color: '#FFF',
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
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  statusBannerText: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'NunitoSans_700Bold',
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 12,
    fontFamily: 'NunitoSans_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  customerHeader: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  customerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  customerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  customerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'NunitoSans_700Bold',
  },
  customerEmail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
    fontFamily: 'NunitoSans_400Regular',
  },
  customerPhone: {
    fontSize: 13,
    color: '#3B82F6',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  callButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  callButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'NunitoSans_700Bold',
  },
  serviceRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  serviceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  serviceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
  serviceValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'NunitoSans_700Bold',
  },
  serviceDescription: {
    fontSize: 13,
    color: '#666',
    marginTop: 12,
    paddingLeft: 32,
    fontFamily: 'NunitoSans_400Regular',
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  vehicleMake: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'NunitoSans_700Bold',
  },
  vehicleMeta: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
  licensePlate: {
    fontSize: 12,
    color: '#3B82F6',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  scheduleInfo: {
    flex: 1,
    marginLeft: 12,
  },
  scheduleLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
  scheduleValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  scheduleDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  locationAddress: {
    flex: 1,
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    fontFamily: 'NunitoSans_400Regular',
  },
  navigateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  navigateButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'NunitoSans_700Bold',
  },
  notesText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    fontFamily: 'NunitoSans_400Regular',
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pricingLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  pricingValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    fontFamily: 'NunitoSans_700Bold',
  },
  bottomPadding: {
    height: 100,
  },
  actionBar: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFF',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  rejectButton: {
    backgroundColor: '#FEE2E2',
  },
  rejectButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#EF4444',
    fontFamily: 'NunitoSans_700Bold',
  },
  acceptButton: {
    backgroundColor: '#3B82F6',
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'NunitoSans_700Bold',
  },
  startButton: {
    backgroundColor: '#8B5CF6',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'NunitoSans_700Bold',
  },
  completeButton: {
    backgroundColor: '#10B981',
  },
  completeButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'NunitoSans_700Bold',
  },
});
