import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useMemo, useEffect } from 'react';
import { useServices } from '@/hooks/useServices';
import { useBookingStore } from '@/stores/bookingStore';
import { useAuthStore } from '@/stores/authStore';
import { useUserVehicles } from '@/hooks/useVehicles';

const STEPS = ['Service', 'Provider', 'Time', 'Confirm'];
const CURRENT_STEP = 0; // Service selection is step 1 (index 0)

export default function ServiceSelectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { data: services = [], isLoading } = useServices();
  const { data: vehicles = [] } = useUserVehicles(user?.id || '');
  const { setSelectedService, setSelectedVehicle, selectedVehicle } = useBookingStore();
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  // Auto-select default vehicle on mount if not already selected
  useEffect(() => {
    if (!selectedVehicle && vehicles.length > 0) {
      const defaultVehicle = vehicles.find(v => v.isDefault) || vehicles[0];
      if (defaultVehicle) {
        setSelectedVehicle(defaultVehicle);
      }
    }
  }, [vehicles, selectedVehicle, setSelectedVehicle]);

  const serviceIconMap: Record<string, { icon: string; color: string }> = {
    basic_wash: { icon: 'water', color: '#3B82F6' },
    premium_wash: { icon: 'star', color: '#FFA500' },
    full_detail: { icon: 'sparkles', color: '#8B5CF6' },
    interior_detail: { icon: 'car-seat', color: '#10B981' },
    exterior_detail: { icon: 'car-wash', color: '#06B6D4' },
    paint_correction: { icon: 'auto-fix', color: '#EC4899' },
    ceramic_coating: { icon: 'shield-check', color: '#F59E0B' },
  };

  const handleSelectService = (service: any) => {
    setSelectedService(service);
    router.push('/booking/vehicle-selection');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading services...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Service</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.innerContainer}>
      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        {STEPS.map((step, index) => (
          <View key={step} style={styles.stepContainer}>
            <View style={styles.stepWrapper}>
              <View style={[
                styles.stepCircle,
                index <= CURRENT_STEP && styles.stepCircleActive,
                index < CURRENT_STEP && styles.stepCircleCompleted
              ]}>
                {index < CURRENT_STEP ? (
                  <MaterialCommunityIcons name="check" size={16} color="#FFF" />
                ) : (
                  <Text style={[
                    styles.stepNumber,
                    index <= CURRENT_STEP && styles.stepNumberActive
                  ]}>{index + 1}</Text>
                )}
              </View>
              <Text style={[
                styles.stepLabel,
                index <= CURRENT_STEP && styles.stepLabelActive
              ]}>{step}</Text>
            </View>
            {index < STEPS.length - 1 && (
              <View style={[
                styles.stepLine,
                index < CURRENT_STEP && styles.stepLineActive
              ]} />
            )}
          </View>
        ))}
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      >
        {/* Service Categories */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Choose Your Service</Text>

          {services.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="cloud-off-outline" size={48} color="#CCC" />
              <Text style={styles.emptyText}>No services available</Text>
            </View>
          ) : (
            services.map((service) => {
              const iconData = serviceIconMap[service.serviceType || 'basic_wash'] || serviceIconMap.basic_wash;
              const price = service.price ? parseFloat(service.price) : 0;

              return (
                <TouchableOpacity
                  key={service.id}
                  style={styles.serviceCard}
                  onPress={() => handleSelectService(service)}
                >
                  {service.isActive && (
                    <View style={styles.popularBadge}>
                      <Text style={styles.popularText}>AVAILABLE</Text>
                    </View>
                  )}
                  <View style={styles.serviceImageContainer}>
                    <MaterialCommunityIcons
                      name={iconData.icon as any}
                      size={32}
                      color={iconData.color}
                    />
                  </View>
                  <View style={styles.serviceInfo}>
                    <View style={styles.serviceHeader}>
                      <View style={[styles.serviceIcon, { backgroundColor: iconData.color }]}>
                        <MaterialCommunityIcons name={iconData.icon as any} size={20} color="#FFF" />
                      </View>
                      <Text style={styles.serviceName}>{service.name}</Text>
                    </View>
                    <Text style={styles.serviceDescription}>{service.description}</Text>
                    <View style={styles.serviceMeta}>
                      <View style={styles.metaItem}>
                        <MaterialCommunityIcons name="cash" size={16} color="#3B82F6" />
                        <Text style={styles.metaText}>${price.toFixed(2)}</Text>
                      </View>
                      {service.duration && (
                        <View style={styles.metaItem}>
                          <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
                          <Text style={styles.metaText}>{service.duration}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
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
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
    fontFamily: 'NunitoSans_400Regular',
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
  progressContainer: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 20,
    backgroundColor: '#F8F9FA',
  },
  stepContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  stepCircleActive: {
    backgroundColor: '#3B82F6',
  },
  stepCircleCompleted: {
    backgroundColor: '#10B981',
  },
  stepNumber: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  stepNumberActive: {
    color: '#FFF',
  },
  stepLabel: {
    fontSize: 10,
    color: '#999',
    fontFamily: 'NunitoSans_400Regular',
  },
  stepLabelActive: {
    color: '#333',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  stepLine: {
    height: 2,
    backgroundColor: '#E5E7EB',
    position: 'absolute',
    left: '50%',
    right: '-50%',
    top: 15,
  },
  stepLineActive: {
    backgroundColor: '#10B981',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'NunitoSans_700Bold',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    fontFamily: 'NunitoSans_400Regular',
  },
  serviceCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    position: 'relative',
  },
  popularBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFA500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  popularText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'NunitoSans_700Bold',
  },
  serviceImageContainer: {
    width: 60,
    height: 60,
    backgroundColor: '#FFF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceEmoji: {
    fontSize: 32,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  serviceIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'NunitoSans_700Bold',
  },
  serviceDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'NunitoSans_400Regular',
  },
  serviceMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 13,
    color: '#333',
    marginLeft: 4,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  packageCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#3B82F6',
    position: 'relative',
  },
  savingsBadge: {
    position: 'absolute',
    top: -8,
    right: 16,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  savingsText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'NunitoSans_700Bold',
  },
  packageName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    fontFamily: 'NunitoSans_700Bold',
  },
  packageServices: {
    marginBottom: 12,
  },
  packageServiceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  packageServiceText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
    fontFamily: 'NunitoSans_400Regular',
  },
  packagePricing: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  regularPrice: {
    fontSize: 14,
    color: '#999',
    textDecorationLine: 'line-through',
    fontFamily: 'NunitoSans_400Regular',
  },
  packagePrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
    fontFamily: 'NunitoSans_700Bold',
  },
  addonItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  addonInfo: {
    flex: 1,
  },
  addonName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  addonPrice: {
    fontSize: 13,
    color: '#3B82F6',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  addonToggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#E5E7EB',
    padding: 2,
    justifyContent: 'center',
  },
  addonToggleActive: {
    backgroundColor: '#3B82F6',
  },
  addonToggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
  },
  addonToggleThumbActive: {
    alignSelf: 'flex-end',
  },
  bottomPadding: {
    height: 100,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFF',
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
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'NunitoSans_700Bold',
  },
});
