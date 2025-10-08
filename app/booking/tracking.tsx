import { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Linking, Animated } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TrackingScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [currentStep, setCurrentStep] = useState(2); // 0: On the way, 1: Arrived, 2: In Progress, 3: Completed
  const [eta, setEta] = useState(8); // minutes
  const [progress, setProgress] = useState(45); // percentage
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    // Simulate provider location updates
    const interval = setInterval(() => {
      setEta(prev => Math.max(0, prev - 1));
    }, 60000); // Update every minute

    // Pulse animation for live indicator
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.3,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => clearInterval(interval);
  }, []);

  const handleCall = () => {
    Linking.openURL('tel:+1234567890');
  };

  const handleMessage = () => {
    // Navigate to chat or open SMS
    console.log('Open messaging');
  };

  const statusSteps = [
    { label: 'On the way', icon: 'car', color: '#10B981' },
    { label: 'Arrived', icon: 'map-marker-check', color: '#3B82F6' },
    { label: 'In Progress', icon: 'car-wash', color: '#FFA500' },
    { label: 'Completed', icon: 'check-circle', color: '#10B981' },
  ];

  return (
    <View style={styles.container}>
      {/* Map Area (Placeholder) */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <MaterialCommunityIcons name="map" size={64} color="#D1D5DB" />
          <Text style={styles.mapPlaceholderText}>Live Map View</Text>
          <Text style={styles.mapPlaceholderSubtext}>
            Real-time provider location tracking
          </Text>
        </View>

        {/* User Pin Indicator */}
        <View style={styles.userPinContainer}>
          <View style={styles.userPin}>
            <MaterialCommunityIcons name="home-map-marker" size={32} color="#DC2626" />
          </View>
          <Text style={styles.pinLabel}>Your Location</Text>
        </View>

        {/* Provider Pin Indicator */}
        <View style={styles.providerPinContainer}>
          <Animated.View style={[styles.providerPinPulse, { transform: [{ scale: pulseAnim }] }]} />
          <View style={styles.providerPin}>
            <MaterialCommunityIcons name="car" size={28} color="#3B82F6" />
          </View>
        </View>

        {/* Back Button */}
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>

        {/* Live Indicator */}
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      {/* Bottom Sheet Overlay */}
      <View style={styles.bottomSheet}>
        {/* Drag Handle */}
        <View style={styles.dragHandle} />

        {/* Provider Info Card */}
        <View style={styles.providerCard}>
          <View style={styles.providerAvatar}>
            <MaterialCommunityIcons name="account-circle" size={56} color="#3B82F6" />
          </View>
          <View style={styles.providerInfo}>
            <Text style={styles.providerName}>Michael Rodriguez</Text>
            <View style={styles.providerDetails}>
              <MaterialCommunityIcons name="star" size={16} color="#FFA500" />
              <Text style={styles.ratingText}>4.9</Text>
              <Text style={styles.separator}>•</Text>
              <MaterialCommunityIcons name="car-hatchback" size={16} color="#666" />
              <Text style={styles.vehicleText}>Toyota Camry - ABC 123</Text>
            </View>
          </View>
          <View style={styles.contactButtons}>
            <TouchableOpacity style={styles.contactButton} onPress={handleCall}>
              <MaterialCommunityIcons name="phone" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactButton} onPress={handleMessage}>
              <MaterialCommunityIcons name="message-text" size={22} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* ETA Card */}
        <View style={styles.etaCard}>
          <View style={styles.etaInfo}>
            <MaterialCommunityIcons name="clock-outline" size={24} color="#3B82F6" />
            <View style={styles.etaContent}>
              <Text style={styles.etaLabel}>Estimated Time</Text>
              <Text style={styles.etaValue}>
                {currentStep === 0 ? `${eta} min away` :
                 currentStep === 1 ? 'Provider arrived' :
                 currentStep === 2 ? `${100 - progress}% remaining` :
                 'Service completed'}
              </Text>
            </View>
          </View>
          {currentStep === 0 && (
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceText}>0.8 mi</Text>
            </View>
          )}
        </View>

        {/* Service Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Service Progress</Text>
            <Text style={styles.progressPercentage}>{progress}%</Text>
          </View>

          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>

          <View style={styles.statusSteps}>
            {statusSteps.map((step, index) => (
              <View key={index} style={styles.statusStep}>
                <View style={[
                  styles.stepIconContainer,
                  index <= currentStep ? { backgroundColor: step.color } : { backgroundColor: '#E5E7EB' }
                ]}>
                  <MaterialCommunityIcons
                    name={step.icon}
                    size={20}
                    color={index <= currentStep ? '#FFFFFF' : '#9CA3AF'}
                  />
                </View>
                <Text style={[
                  styles.stepLabel,
                  index === currentStep && styles.stepLabelActive
                ]}>
                  {step.label}
                </Text>
                {index === currentStep && (
                  <View style={styles.currentBadge}>
                    <Text style={styles.currentBadgeText}>Current</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </View>

        {/* Service Details */}
        <View style={styles.serviceDetails}>
          <Text style={styles.serviceTitle}>Premium Wash & Wax</Text>
          <View style={styles.serviceMetaRow}>
            <View style={styles.serviceMeta}>
              <MaterialCommunityIcons name="calendar" size={16} color="#666" />
              <Text style={styles.serviceMetaText}>Today, 2:00 PM</Text>
            </View>
            <View style={styles.serviceMeta}>
              <MaterialCommunityIcons name="cash" size={16} color="#666" />
              <Text style={styles.serviceMetaText}>$89.99</Text>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.actionButton}>
            <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#DC2626" />
            <Text style={styles.actionButtonText}>Report Issue</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButtonPrimary}>
            <MaterialCommunityIcons name="information-outline" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonPrimaryText}>View Details</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  mapPlaceholderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6B7280',
    marginTop: 16,
    fontFamily: 'NunitoSans_700Bold',
  },
  mapPlaceholderSubtext: {
    fontSize: 13,
    color: '#9CA3AF',
    marginTop: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
  userPinContainer: {
    position: 'absolute',
    bottom: 180,
    left: 40,
    alignItems: 'center',
  },
  userPin: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  pinLabel: {
    fontSize: 11,
    color: '#333',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  providerPinContainer: {
    position: 'absolute',
    top: 140,
    right: 60,
    alignItems: 'center',
  },
  providerPinPulse: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(59, 130, 246, 0.3)',
  },
  providerPin: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 10,
    borderWidth: 3,
    borderColor: '#3B82F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#FFFFFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  liveIndicator: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
  },
  liveText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'NunitoSans_700Bold',
  },
  bottomSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  providerAvatar: {
    marginRight: 12,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'NunitoSans_700Bold',
  },
  providerDetails: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    color: '#333',
    marginLeft: 4,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  separator: {
    fontSize: 13,
    color: '#D1D5DB',
    marginHorizontal: 6,
  },
  vehicleText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  contactButton: {
    backgroundColor: '#3B82F6',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  etaCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  etaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  etaContent: {
    marginLeft: 12,
  },
  etaLabel: {
    fontSize: 12,
    color: '#0369A1',
    marginBottom: 2,
    fontFamily: 'NunitoSans_400Regular',
  },
  etaValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0C4A6E',
    fontFamily: 'NunitoSans_700Bold',
  },
  distanceBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  distanceText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'NunitoSans_700Bold',
  },
  progressSection: {
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'NunitoSans_700Bold',
  },
  progressPercentage: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3B82F6',
    fontFamily: 'NunitoSans_700Bold',
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3B82F6',
    borderRadius: 4,
  },
  statusSteps: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusStep: {
    alignItems: 'center',
    flex: 1,
  },
  stepIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  stepLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'NunitoSans_400Regular',
  },
  stepLabelActive: {
    color: '#333',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  currentBadge: {
    backgroundColor: '#FFA500',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
  },
  currentBadgeText: {
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontFamily: 'NunitoSans_700Bold',
  },
  serviceDetails: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  serviceTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'NunitoSans_700Bold',
  },
  serviceMetaRow: {
    flexDirection: 'row',
    gap: 16,
  },
  serviceMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  serviceMetaText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
    fontFamily: 'NunitoSans_400Regular',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#DC2626',
    marginLeft: 6,
    fontFamily: 'NunitoSans_700Bold',
  },
  actionButtonPrimary: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 12,
  },
  actionButtonPrimaryText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 6,
    fontFamily: 'NunitoSans_700Bold',
  },
});
