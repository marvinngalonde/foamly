import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { useUserVehicles, useSetDefaultVehicle, useDeleteVehicle } from '@/hooks/useVehicles';

export default function VehicleManagementScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: vehicles = [], isLoading, error } = useUserVehicles(user?.id || '');
  const setDefaultMutation = useSetDefaultVehicle(user?.id || '');
  const deleteMutation = useDeleteVehicle(user?.id || '');

  const handleSetDefault = (vehicleId: string) => {
    setDefaultMutation.mutate(vehicleId, {
      onSuccess: () => {
        Alert.alert('Success', 'Default vehicle updated');
      },
      onError: (error) => {
        Alert.alert('Error', (error as Error).message);
      },
    });
  };

  const handleDelete = (vehicleId: string) => {
    Alert.alert(
      'Delete Vehicle',
      'Are you sure you want to remove this vehicle?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteMutation.mutate(vehicleId, {
              onSuccess: () => {
                Alert.alert('Success', 'Vehicle deleted');
              },
              onError: (error) => {
                Alert.alert('Error', (error as Error).message);
              },
            });
          }
        }
      ]
    );
  };

  const getVehicleEmoji = (type: string) => {
    switch (type.toLowerCase()) {
      case 'suv': return '🚙';
      case 'truck': return '🛻';
      case 'van': return '🚐';
      case 'sports': return '🏎️';
      default: return '🚗';
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 16, color: '#666' }}>Loading vehicles...</Text>
      </View>
    );
  }

  const defaultVehicle = vehicles.find(v => v.isDefault);
  const otherVehicles = vehicles.filter(v => !v.isDefault);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Vehicles</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => router.push('/vehicles/add')}>
          <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {vehicles.length === 0 ? (
          // Empty State
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons name="garage" size={80} color="#CCC" />
            </View>
            <Text style={styles.emptyTitle}>No Vehicles Yet</Text>
            <Text style={styles.emptySubtitle}>
              Add your first vehicle to start booking services
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => router.push('/vehicles/add')}
            >
              <MaterialCommunityIcons name="plus-circle" size={20} color="#FFF" />
              <Text style={styles.emptyButtonText}>Add Vehicle</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Default Vehicle Section */}
            {defaultVehicle && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="star" size={20} color="#FFA500" />
                  <Text style={styles.sectionTitle}>Default Vehicle</Text>
                </View>

                <VehicleCard
                  vehicle={{
                    ...defaultVehicle,
                    image: getVehicleEmoji(defaultVehicle.vehicleType),
                    colorHex: defaultVehicle.color || '#C0C0C0',
                  }}
                  onEdit={() => router.push(`/vehicles/${defaultVehicle.id}/edit`)}
                  onDelete={() => handleDelete(defaultVehicle.id)}
                  onSetDefault={() => handleSetDefault(defaultVehicle.id)}
                />
              </View>
            )}

            {/* Other Vehicles Section */}
            {otherVehicles.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="car-multiple" size={20} color="#666" />
                  <Text style={styles.sectionTitle}>Other Vehicles</Text>
                </View>

                {otherVehicles.map(vehicle => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={{
                      ...vehicle,
                      image: getVehicleEmoji(vehicle.vehicleType),
                      colorHex: vehicle.color || '#C0C0C0',
                    }}
                    onEdit={() => router.push(`/vehicles/${vehicle.id}/edit`)}
                    onDelete={() => handleDelete(vehicle.id)}
                    onSetDefault={() => handleSetDefault(vehicle.id)}
                  />
                ))}
              </View>
            )}
          </>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Floating Add Button */}
      {vehicles.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/vehicles/add')}
        >
          <MaterialCommunityIcons name="plus" size={28} color="#FFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

interface VehicleCardProps {
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: string;
    color?: string;
    colorHex: string;
    licensePlate?: string;
    vehicleType: string;
    isDefault: boolean;
    image: string;
  };
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}

function VehicleCard({ vehicle, onEdit, onDelete, onSetDefault }: VehicleCardProps) {
  return (
    <View style={styles.vehicleCard}>
      {/* Vehicle Image */}
      <View style={styles.vehicleImageContainer}>
        <Text style={styles.vehicleEmoji}>{vehicle.image}</Text>
        {vehicle.isDefault && (
          <View style={styles.defaultBadge}>
            <MaterialCommunityIcons name="star" size={12} color="#FFA500" />
          </View>
        )}
      </View>

      {/* Vehicle Info */}
      <View style={styles.vehicleInfo}>
        <Text style={styles.vehicleName}>
          {vehicle.year} {vehicle.make} {vehicle.model}
        </Text>

        <View style={styles.vehicleDetails}>
          <View style={styles.detailItem}>
            <View style={[styles.colorSwatch, { backgroundColor: vehicle.colorHex }]} />
            <Text style={styles.detailText}>{vehicle.color}</Text>
          </View>

          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="car" size={14} color="#666" />
            <Text style={styles.detailText}>{vehicle.vehicleType}</Text>
          </View>
        </View>

        {vehicle.licensePlate && (
          <View style={styles.licensePlate}>
            <Text style={styles.licensePlateText}>{vehicle.licensePlate}</Text>
          </View>
        )}
      </View>

      {/* Actions Menu */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
          <MaterialCommunityIcons name="pencil" size={20} color="#3B82F6" />
        </TouchableOpacity>

        {!vehicle.isDefault && (
          <TouchableOpacity style={styles.actionButton} onPress={onSetDefault}>
            <MaterialCommunityIcons name="star-outline" size={20} color="#FFA500" />
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.actionButton} onPress={onDelete}>
          <MaterialCommunityIcons name="delete-outline" size={20} color="#DC2626" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'NunitoSans_700Bold',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
    fontFamily: 'NunitoSans_700Bold',
  },
  vehicleCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  vehicleImageContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#FFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  vehicleEmoji: {
    fontSize: 40,
  },
  defaultBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#FFF3CD',
    borderRadius: 10,
    padding: 4,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'NunitoSans_700Bold',
  },
  vehicleDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  colorSwatch: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'NunitoSans_400Regular',
  },
  licensePlate: {
    backgroundColor: '#1E3A8A',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  licensePlateText: {
    fontSize: 12,
    color: '#FFF',
    fontFamily: 'Courier New',
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyIcon: {
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'NunitoSans_700Bold',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'NunitoSans_400Regular',
  },
  emptyButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    gap: 8,
  },
  emptyButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'NunitoSans_700Bold',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  bottomPadding: {
    height: 100,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
