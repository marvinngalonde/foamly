import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '@/stores/authStore';
import { useUserVehicles } from '@/hooks/useVehicles';
import { useBookingStore } from '@/stores/bookingStore';

const STEPS = ['Service', 'Vehicle', 'Provider', 'Time', 'Confirm'];
const CURRENT_STEP = 1; // Vehicle selection is step 2 (index 1)

export default function VehicleSelectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { data: vehicles = [], isLoading } = useUserVehicles(user?.id || '');
  const { selectedVehicle, setSelectedVehicle } = useBookingStore();

  const handleSelectVehicle = (vehicle: any) => {
    setSelectedVehicle(vehicle);
    router.push('/booking/provider-selection');
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading vehicles...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Vehicle</Text>
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

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Your Vehicle</Text>
          <Text style={styles.sectionSubtitle}>Choose the vehicle for this service</Text>

          {vehicles.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="car-off" size={64} color="#CCC" />
              <Text style={styles.emptyText}>No vehicles added</Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push('/profile/vehicles/add')}
              >
                <Text style={styles.addButtonText}>Add Vehicle</Text>
              </TouchableOpacity>
            </View>
          ) : (
            vehicles.map((vehicle) => {
              const isSelected = selectedVehicle?.id === vehicle.id;

              return (
                <TouchableOpacity
                  key={vehicle.id}
                  style={[styles.vehicleCard, isSelected && styles.vehicleCardSelected]}
                  onPress={() => handleSelectVehicle(vehicle)}
                >
                  <View style={styles.vehicleIcon}>
                    <MaterialCommunityIcons name="car" size={32} color={isSelected ? '#3B82F6' : '#666'} />
                  </View>

                  <View style={styles.vehicleInfo}>
                    <View style={styles.vehicleHeader}>
                      <Text style={styles.vehicleName}>
                        {vehicle.year} {vehicle.make} {vehicle.model}
                      </Text>
                      {vehicle.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultText}>DEFAULT</Text>
                        </View>
                      )}
                    </View>

                    <Text style={styles.vehicleDetails}>
                      {vehicle.color} • {vehicle.licensePlate}
                    </Text>
                  </View>

                  {isSelected && (
                    <View style={styles.checkMark}>
                      <MaterialCommunityIcons name="check-circle" size={24} color="#3B82F6" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>

        {/* Add Vehicle Button */}
        <View style={styles.footer}>
        <TouchableOpacity
          style={styles.addVehicleButton}
          onPress={() => router.push('/profile/vehicles/add')}
        >
          <MaterialCommunityIcons name="plus" size={20} color="#3B82F6" />
          <Text style={styles.addVehicleText}>Add New Vehicle</Text>
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
    paddingHorizontal: 8,
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
    fontSize: 9,
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
    marginBottom: 20,
    fontFamily: 'NunitoSans_400Regular',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    marginTop: 12,
    marginBottom: 20,
    fontFamily: 'NunitoSans_400Regular',
  },
  addButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'NunitoSans_700Bold',
  },
  vehicleCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  vehicleCardSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  vehicleIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'NunitoSans_700Bold',
  },
  defaultBadge: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  defaultText: {
    fontSize: 10,
    color: '#FFF',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  vehicleDetails: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'NunitoSans_400Regular',
  },
  checkMark: {
    marginLeft: 8,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  addVehicleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  addVehicleText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    fontFamily: 'NunitoSans_600SemiBold',
  },
});
