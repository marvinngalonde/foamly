import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BookingDetailsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams();

  // Mock booking data
  const booking = {
    id: id || '1',
    status: 'in-progress',
    service: 'Premium Wash',
    vehicle: '2022 Toyota Camry',
    licensePlate: 'ABC 1234',
    provider: {
      name: 'Elite Auto Spa',
      rating: 4.9,
      phone: '+1 234 567 8900',
      photo: null,
    },
    schedule: {
      date: 'Today, Dec 6',
      time: '10:00 AM',
    },
    location: {
      address: '123 Main Street, Downtown',
      coords: { lat: 0, lng: 0 },
    },
    price: 49.99,
    notes: 'Please focus on the wheels and undercarriage',
    timeline: [
      { step: 'Scheduled', time: '9:45 AM', completed: true, icon: 'clock' },
      { step: 'Confirmed', time: '9:50 AM', completed: true, icon: 'check-circle' },
      { step: 'In Progress', time: '10:05 AM', completed: true, icon: 'car-wash' },
      { step: 'Completed', time: '-', completed: false, icon: 'flag-checkered' },
    ],
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#F59E0B';
      case 'confirmed': return '#3B82F6';
      case 'in-progress': return '#FFA500';
      case 'completed': return '#10B981';
      case 'cancelled': return '#DC2626';
      default: return '#666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return 'clock-outline';
      case 'confirmed': return 'check-circle';
      case 'in-progress': return 'progress-clock';
      case 'completed': return 'check-all';
      case 'cancelled': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const handleCancel = () => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => {
            // Handle cancellation
            router.back();
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)/bookings')} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Details</Text>
        <TouchableOpacity style={styles.shareButton}>
          <MaterialCommunityIcons name="share-variant" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.innerContainer}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        {/* Status Header */}
        <View style={[styles.statusHeader, { backgroundColor: getStatusColor(booking.status) + '20' }]}>
          <View style={[styles.statusIconContainer, { backgroundColor: getStatusColor(booking.status) }]}>
            <MaterialCommunityIcons
              name={getStatusIcon(booking.status) as any}
              size={32}
              color="#FFF"
            />
          </View>
          <View style={styles.statusInfo}>
            <Text style={[styles.statusLabel, { color: getStatusColor(booking.status) }]}>
              {booking.status.toUpperCase().replace('-', ' ')}
            </Text>
            <Text style={styles.statusDescription}>
              {booking.status === 'in-progress' && 'Your service is currently being performed'}
              {booking.status === 'confirmed' && 'Your booking has been confirmed'}
              {booking.status === 'pending' && 'Waiting for provider confirmation'}
              {booking.status === 'completed' && 'Service completed successfully'}
            </Text>
          </View>
        </View>

        {/* Service Timeline */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Timeline</Text>
          <View style={styles.timeline}>
            {booking.timeline.map((item, index) => (
              <View key={index} style={styles.timelineItem}>
                <View style={styles.timelineIcon}>
                  <View style={[
                    styles.timelineDot,
                    item.completed && styles.timelineDotCompleted
                  ]}>
                    <MaterialCommunityIcons
                      name={item.icon as any}
                      size={16}
                      color={item.completed ? '#FFF' : '#999'}
                    />
                  </View>
                  {index < booking.timeline.length - 1 && (
                    <View style={[
                      styles.timelineLine,
                      item.completed && styles.timelineLineCompleted
                    ]} />
                  )}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={[
                    styles.timelineStep,
                    item.completed && styles.timelineStepCompleted
                  ]}>{item.step}</Text>
                  <Text style={styles.timelineTime}>{item.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Service Details Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Details</Text>
          <View style={styles.card}>
            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="star" size={20} color="#3B82F6" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Service</Text>
                <Text style={styles.detailValue}>{booking.service}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="car" size={20} color="#3B82F6" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Vehicle</Text>
                <Text style={styles.detailValue}>{booking.vehicle}</Text>
                <Text style={styles.detailSubvalue}>{booking.licensePlate}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="calendar" size={20} color="#3B82F6" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Schedule</Text>
                <Text style={styles.detailValue}>{booking.schedule.date}</Text>
                <Text style={styles.detailSubvalue}>{booking.schedule.time}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <MaterialCommunityIcons name="cash" size={20} color="#3B82F6" />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Total Price</Text>
                <Text style={styles.priceValue}>${booking.price}</Text>
              </View>
            </View>

            {booking.notes && (
              <View style={styles.notesContainer}>
                <MaterialCommunityIcons name="note-text" size={20} color="#666" />
                <View style={styles.detailContent}>
                  <Text style={styles.detailLabel}>Special Instructions</Text>
                  <Text style={styles.notesText}>{booking.notes}</Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {/* Provider Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Provider</Text>
          <View style={styles.providerCard}>
            <View style={styles.providerAvatar}>
              <MaterialCommunityIcons name="store" size={32} color="#3B82F6" />
            </View>
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>{booking.provider.name}</Text>
              <View style={styles.providerRating}>
                <MaterialCommunityIcons name="star" size={14} color="#FFA500" />
                <Text style={styles.ratingText}>{booking.provider.rating}</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.contactButton}
              onPress={() => Alert.alert('Call', `Call ${booking.provider.name}?`)}
            >
              <MaterialCommunityIcons name="phone" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Location Map */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Location</Text>
          <View style={styles.mapCard}>
            <View style={styles.mapPlaceholder}>
              <MaterialCommunityIcons name="map-marker" size={40} color="#3B82F6" />
              <Text style={styles.mapText}>Map View</Text>
            </View>
            <View style={styles.addressContainer}>
              <MaterialCommunityIcons name="map-marker" size={20} color="#666" />
              <Text style={styles.addressText}>{booking.location.address}</Text>
            </View>
            <TouchableOpacity style={styles.directionsButton}>
              <MaterialCommunityIcons name="directions" size={18} color="#3B82F6" />
              <Text style={styles.directionsText}>Get Directions</Text>
            </TouchableOpacity>
          </View>
        </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
          <MaterialCommunityIcons name="close" size={20} color="#DC2626" />
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.rescheduleButton}>
          <MaterialCommunityIcons name="calendar-edit" size={20} color="#3B82F6" />
          <Text style={styles.rescheduleButtonText}>Reschedule</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryButton}>
          <MaterialCommunityIcons name="message" size={20} color="#FFF" />
          <Text style={styles.primaryButtonText}>Contact</Text>
        </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3B82F6',
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'NunitoSans_700Bold',
  },
  shareButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  statusHeader: {
    flexDirection: 'row',
    padding: 20,
    alignItems: 'center',
  },
  statusIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    fontFamily: 'NunitoSans_700Bold',
  },
  statusDescription: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'NunitoSans_400Regular',
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    fontFamily: 'NunitoSans_700Bold',
  },
  timeline: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  timelineItem: {
    flexDirection: 'row',
  },
  timelineIcon: {
    alignItems: 'center',
    marginRight: 16,
  },
  timelineDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timelineDotCompleted: {
    backgroundColor: '#10B981',
  },
  timelineLine: {
    width: 2,
    height: 40,
    backgroundColor: '#E5E7EB',
    marginTop: 4,
  },
  timelineLineCompleted: {
    backgroundColor: '#10B981',
  },
  timelineContent: {
    flex: 1,
    paddingTop: 4,
    paddingBottom: 16,
  },
  timelineStep: {
    fontSize: 14,
    color: '#999',
    marginBottom: 2,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  timelineStepCompleted: {
    color: '#333',
  },
  timelineTime: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'NunitoSans_400Regular',
  },
  card: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'NunitoSans_700Bold',
  },
  detailSubvalue: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    fontFamily: 'NunitoSans_400Regular',
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#10B981',
    fontFamily: 'NunitoSans_700Bold',
  },
  notesContainer: {
    flexDirection: 'row',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  notesText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    fontFamily: 'NunitoSans_400Regular',
  },
  providerCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  providerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'NunitoSans_700Bold',
  },
  providerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    color: '#333',
    marginLeft: 4,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  contactButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    height: 150,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    fontSize: 14,
    color: '#3B82F6',
    marginTop: 8,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  addressContainer: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  addressText: {
    fontSize: 13,
    color: '#333',
    marginLeft: 8,
    flex: 1,
    fontFamily: 'NunitoSans_400Regular',
  },
  directionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  directionsText: {
    fontSize: 14,
    color: '#3B82F6',
    marginLeft: 6,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#DC2626',
    fontFamily: 'NunitoSans_700Bold',
  },
  rescheduleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DBEAFE',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  rescheduleButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3B82F6',
    fontFamily: 'NunitoSans_700Bold',
  },
  primaryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'NunitoSans_700Bold',
  },
});
