import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { useBookingStore } from '@/stores/bookingStore';

export default function DateTimeSelectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { selectedProvider, setSelectedDate, setSelectedTime } = useBookingStore();
  const [selectedDateLocal, setSelectedDateLocal] = useState<string | null>(null);
  const [selectedTimeLocal, setSelectedTimeLocal] = useState<string | null>(null);

  // Generate next 14 days
  const dates: { date: Date; dayName: string; dayNum: number; monthName: string }[] = [];
  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    dates.push({
      date,
      dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: date.getDate(),
      monthName: date.toLocaleDateString('en-US', { month: 'short' }),
    });
  }

  // Generate time slots (8 AM to 6 PM)
  const timeSlots: string[] = [];
  for (let hour = 8; hour <= 18; hour++) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour;
    timeSlots.push(`${displayHour}:00 ${period}`);
    if (hour < 18) {
      timeSlots.push(`${displayHour}:30 ${period}`);
    }
  }

  const handleContinue = () => {
    if (!selectedDateLocal || !selectedTimeLocal) {
      Alert.alert('Selection Required', 'Please select both date and time');
      return;
    }

    setSelectedDate(selectedDateLocal);
    setSelectedTime(selectedTimeLocal);
    router.push('/booking/confirmation');
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Date & Time</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.innerContainer}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        {/* Provider Info */}
        {selectedProvider && (
          <View style={styles.providerInfo}>
            <View style={styles.providerAvatar}>
              <MaterialCommunityIcons name="store" size={24} color="#3B82F6" />
            </View>
            <View style={styles.providerDetails}>
              <Text style={styles.providerName}>{selectedProvider.businessName}</Text>
              <Text style={styles.providerArea}>{(selectedProvider as any).serviceArea}</Text>
            </View>
          </View>
        )}

        {/* Date Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateScroll}>
            {dates.map((item, index) => {
              const dateStr = item.date.toISOString().split('T')[0];
              const isSelected = selectedDateLocal === dateStr;
              const isTodayDate = isToday(item.date);

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.dateCard,
                    isSelected && styles.dateCardSelected,
                    isTodayDate && styles.dateCardToday
                  ]}
                  onPress={() => setSelectedDateLocal(dateStr)}
                >
                  <Text style={[styles.dayName, isSelected && styles.dayNameSelected]}>
                    {item.dayName}
                  </Text>
                  <Text style={[styles.dayNum, isSelected && styles.dayNumSelected]}>
                    {item.dayNum}
                  </Text>
                  <Text style={[styles.monthName, isSelected && styles.monthNameSelected]}>
                    {item.monthName}
                  </Text>
                  {isTodayDate && !isSelected && (
                    <View style={styles.todayDot} />
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Time Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Time</Text>
          <Text style={styles.sectionSubtitle}>Available time slots</Text>
          <View style={styles.timeGrid}>
            {timeSlots.map((time, index) => {
              const isSelected = selectedTimeLocal === time;
              // Simulate some slots being unavailable
              const isAvailable = index % 5 !== 0;

              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.timeSlot,
                    isSelected && styles.timeSlotSelected,
                    !isAvailable && styles.timeSlotUnavailable
                  ]}
                  onPress={() => isAvailable && setSelectedTimeLocal(time)}
                  disabled={!isAvailable}
                >
                  <Text style={[
                    styles.timeText,
                    isSelected && styles.timeTextSelected,
                    !isAvailable && styles.timeTextUnavailable
                  ]}>
                    {time}
                  </Text>
                  {!isAvailable && (
                    <View style={styles.unavailableOverlay}>
                      <MaterialCommunityIcons name="close" size={16} color="#EF4444" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Service Duration Notice */}
        <View style={styles.noticeCard}>
          <MaterialCommunityIcons name="information" size={20} color="#3B82F6" />
          <View style={styles.noticeContent}>
            <Text style={styles.noticeTitle}>Service Duration</Text>
            <Text style={styles.noticeText}>
              Please allow 1-2 hours for the service. Your provider will confirm the exact duration.
            </Text>
          </View>
        </View>
        </ScrollView>

        {/* Continue Button */}
        <View style={styles.footer}>
        <View style={styles.selectionSummary}>
          {selectedDateLocal && (
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons name="calendar" size={16} color="#666" />
              <Text style={styles.summaryText}>
                {new Date(selectedDateLocal).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </View>
          )}
          {selectedTimeLocal && (
            <View style={styles.summaryItem}>
              <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
              <Text style={styles.summaryText}>{selectedTimeLocal}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity
          style={[
            styles.continueButton,
            (!selectedDateLocal || !selectedTimeLocal) && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={!selectedDateLocal || !selectedTimeLocal}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
          <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
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
  providerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
  },
  providerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  providerDetails: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'NunitoSans_700Bold',
  },
  providerArea: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'NunitoSans_400Regular',
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    paddingHorizontal: 20,
    fontFamily: 'NunitoSans_700Bold',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    paddingHorizontal: 20,
    fontFamily: 'NunitoSans_400Regular',
  },
  dateScroll: {
    paddingLeft: 20,
  },
  dateCard: {
    width: 70,
    paddingVertical: 16,
    paddingHorizontal: 12,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    position: 'relative',
  },
  dateCardSelected: {
    backgroundColor: '#3B82F6',
  },
  dateCardToday: {
    borderWidth: 2,
    borderColor: '#FFA500',
  },
  dayName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
  dayNameSelected: {
    color: '#FFF',
  },
  dayNum: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
    fontFamily: 'NunitoSans_700Bold',
  },
  dayNumSelected: {
    color: '#FFF',
  },
  monthName: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'NunitoSans_400Regular',
  },
  monthNameSelected: {
    color: '#FFF',
  },
  todayDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFA500',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
  },
  timeSlot: {
    width: '30%',
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    position: 'relative',
  },
  timeSlotSelected: {
    backgroundColor: '#3B82F6',
  },
  timeSlotUnavailable: {
    backgroundColor: '#F8F9FA',
    opacity: 0.5,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  timeTextSelected: {
    color: '#FFF',
  },
  timeTextUnavailable: {
    color: '#999',
  },
  unavailableOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  noticeCard: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  noticeContent: {
    flex: 1,
    marginLeft: 12,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'NunitoSans_700Bold',
  },
  noticeText: {
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
  selectionSummary: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 24,
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  summaryText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  continueButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueButtonDisabled: {
    backgroundColor: '#CCC',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'NunitoSans_700Bold',
  },
});
