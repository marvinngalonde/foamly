import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useBookingStore } from '@/stores/bookingStore';
import { useAuthStore } from '@/stores/authStore';
import { useCreateBooking } from '@/hooks/useBookings';

export default function BookingConfirmationScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const {
    selectedVehicle,
    selectedService,
    selectedProvider,
    selectedDate,
    selectedTime,
    selectedLocation,
    resetBookingFlow,
  } = useBookingStore();

  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createBookingMutation = useCreateBooking(user?.id || '');

  const handleConfirmBooking = async () => {
    // Debug: Log what we have
    console.log('Booking data:', {
      vehicle: selectedVehicle?.id,
      service: selectedService?.id,
      provider: selectedProvider?.id,
      date: selectedDate,
      time: selectedTime,
    });

    if (!selectedVehicle || !selectedService || !selectedProvider || !selectedDate || !selectedTime) {
      const missing = [];
      if (!selectedVehicle) missing.push('vehicle');
      if (!selectedService) missing.push('service');
      if (!selectedProvider) missing.push('provider');
      if (!selectedDate) missing.push('date');
      if (!selectedTime) missing.push('time');

      Alert.alert('Missing Information', `Please select: ${missing.join(', ')}`);
      return;
    }

    // Combine date and time
    const [time, period] = selectedTime.split(' ');
    const [hours, minutes] = time.split(':');
    let hour = parseInt(hours);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;

    const scheduledDate = new Date(selectedDate);
    scheduledDate.setHours(hour, parseInt(minutes), 0, 0);

    setIsSubmitting(true);

    try {
      const service = selectedService as any;
      const totalPrice = service?.price ? parseFloat(service.price) : 0;

      await createBookingMutation.mutateAsync({
        providerId: selectedProvider.id,
        serviceId: selectedService.id,
        vehicleId: selectedVehicle.id,
        scheduledDate: scheduledDate.toISOString(),
        location: selectedLocation?.address || 'Customer Location',
        totalPrice: totalPrice,
        notes: notes || undefined,
      });

      Alert.alert(
        'Booking Confirmed!',
        'Your booking has been created successfully. The provider will confirm shortly.',
        [
          {
            text: 'View Bookings',
            onPress: () => {
              resetBookingFlow();
              router.replace('/(tabs)/bookings');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Booking Failed', error.message || 'Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateTotal = () => {
    // The API returns 'price' as string, but the type definition has 'basePrice' as number
    const service = selectedService as any;
    const basePrice = service?.price ? parseFloat(service.price) : 0;
    // Add any addons or fees here
    return basePrice;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const total = calculateTotal();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Confirm Booking</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.innerContainer}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        {/* Booking Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <MaterialCommunityIcons name="clipboard-check" size={24} color="#3B82F6" />
            <Text style={styles.summaryTitle}>Booking Summary</Text>
          </View>

          {/* Service */}
          {selectedService && (
            <View style={styles.summaryRow}>
              <View style={styles.summaryLabel}>
                <MaterialCommunityIcons name="spray" size={18} color="#666" />
                <Text style={styles.summaryLabelText}>Service</Text>
              </View>
              <Text style={styles.summaryValue}>{selectedService.name}</Text>
            </View>
          )}

          {/* Vehicle */}
          {selectedVehicle && (
            <View style={styles.summaryRow}>
              <View style={styles.summaryLabel}>
                <MaterialCommunityIcons name="car" size={18} color="#666" />
                <Text style={styles.summaryLabelText}>Vehicle</Text>
              </View>
              <Text style={styles.summaryValue}>
                {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
              </Text>
            </View>
          )}

          {/* Provider */}
          {selectedProvider && (
            <View style={styles.summaryRow}>
              <View style={styles.summaryLabel}>
                <MaterialCommunityIcons name="store" size={18} color="#666" />
                <Text style={styles.summaryLabelText}>Provider</Text>
              </View>
              <Text style={styles.summaryValue}>{selectedProvider.businessName}</Text>
            </View>
          )}

          {/* Date */}
          {selectedDate && (
            <View style={styles.summaryRow}>
              <View style={styles.summaryLabel}>
                <MaterialCommunityIcons name="calendar" size={18} color="#666" />
                <Text style={styles.summaryLabelText}>Date</Text>
              </View>
              <Text style={styles.summaryValue}>{formatDate(selectedDate)}</Text>
            </View>
          )}

          {/* Time */}
          {selectedTime && (
            <View style={styles.summaryRow}>
              <View style={styles.summaryLabel}>
                <MaterialCommunityIcons name="clock-outline" size={18} color="#666" />
                <Text style={styles.summaryLabelText}>Time</Text>
              </View>
              <Text style={styles.summaryValue}>{selectedTime}</Text>
            </View>
          )}
        </View>

        {/* Pricing */}
        <View style={styles.pricingCard}>
          <Text style={styles.pricingTitle}>Pricing Details</Text>

          <View style={styles.pricingRow}>
            <Text style={styles.pricingLabel}>Service Fee</Text>
            <Text style={styles.pricingAmount}>${total.toFixed(2)}</Text>
          </View>

          <View style={styles.pricingDivider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalAmount}>${total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Special Instructions */}
        <View style={styles.notesCard}>
          <Text style={styles.notesTitle}>Special Instructions (Optional)</Text>
          <Text style={styles.notesSubtitle}>Add any special requests or notes for the provider</Text>
          <TextInput
            style={styles.notesInput}
            value={notes}
            onChangeText={setNotes}
            placeholder="Enter any special requests or notes..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Important Information */}
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <MaterialCommunityIcons name="information" size={20} color="#3B82F6" />
            <Text style={styles.infoTitle}>Important Information</Text>
          </View>
          <View style={styles.infoList}>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="check-circle" size={16} color="#10B981" />
              <Text style={styles.infoText}>Provider will confirm your booking within 1 hour</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="check-circle" size={16} color="#10B981" />
              <Text style={styles.infoText}>You'll receive SMS/email notifications</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="check-circle" size={16} color="#10B981" />
              <Text style={styles.infoText}>Free cancellation up to 24 hours before</Text>
            </View>
          </View>
        </View>
        </ScrollView>

        {/* Confirm Button */}
        <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmButton, isSubmitting && styles.confirmButtonDisabled]}
          onPress={handleConfirmBooking}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <MaterialCommunityIcons name="check" size={20} color="#FFF" />
              <Text style={styles.confirmButtonText}>Confirm Booking</Text>
            </>
          )}
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
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: '#F8F9FA',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'NunitoSans_700Bold',
  },
  summaryRow: {
    marginBottom: 16,
  },
  summaryLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  summaryLabelText: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  summaryValue: {
    fontSize: 15,
    color: '#333',
    paddingLeft: 26,
    fontFamily: 'NunitoSans_400Regular',
  },
  pricingCard: {
    backgroundColor: '#F0F9FF',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 20,
    borderRadius: 12,
  },
  pricingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    fontFamily: 'NunitoSans_700Bold',
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  pricingLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'NunitoSans_400Regular',
  },
  pricingAmount: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  pricingDivider: {
    height: 1,
    backgroundColor: '#3B82F6',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'NunitoSans_700Bold',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#10B981',
    fontFamily: 'NunitoSans_700Bold',
  },
  notesCard: {
    marginHorizontal: 20,
    marginTop: 16,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'NunitoSans_700Bold',
  },
  notesSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    fontFamily: 'NunitoSans_400Regular',
  },
  notesInput: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
    minHeight: 100,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    fontSize: 14,
    color: '#333',
    fontFamily: 'NunitoSans_400Regular',
  },
  infoCard: {
    backgroundColor: '#F0FDF4',
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'NunitoSans_700Bold',
  },
  infoList: {
    gap: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    fontFamily: 'NunitoSans_400Regular',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  confirmButton: {
    flexDirection: 'row',
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmButtonDisabled: {
    backgroundColor: '#CCC',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'NunitoSans_700Bold',
  },
});
