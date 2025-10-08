import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Button, FAB } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useVehicles } from '@/queries/vehicles';
import { useBookingStore } from '@/stores/bookingStore';
import { Vehicle } from '@/types';

export default function VehicleSelectionScreen() {
  const router = useRouter();
  const { data: vehicles = [], isLoading } = useVehicles();
  const { selectedVehicle, setSelectedVehicle } = useBookingStore();

  const handleSelectVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
  };

  const handleContinue = () => {
    if (selectedVehicle) {
      router.push('/booking/new/service-selection');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall">Select Your Vehicle</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Choose the vehicle you'd like to service
        </Text>
      </View>

      <FlatList
        data={vehicles}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card
            style={[
              styles.card,
              selectedVehicle?.id === item.id && styles.selectedCard,
            ]}
            onPress={() => handleSelectVehicle(item)}
          >
            <Card.Content>
              <Text variant="titleMedium">
                {item.year} {item.make} {item.model}
              </Text>
              <Text variant="bodyMedium" style={styles.detail}>
                {item.type} • {item.color}
              </Text>
              <Text variant="bodySmall" style={styles.plate}>
                {item.licensePlate}
              </Text>
            </Card.Content>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="bodyLarge">No vehicles added yet</Text>
            <Button
              mode="contained"
              onPress={() => router.push('/profile/vehicles/add')}
              style={styles.button}
            >
              Add Your First Vehicle
            </Button>
          </View>
        }
      />

      {vehicles.length > 0 && (
        <>
          <FAB
            icon="plus"
            style={styles.fab}
            onPress={() => router.push('/profile/vehicles/add')}
            label="Add Vehicle"
          />

          <View style={styles.footer}>
            <Button
              mode="contained"
              onPress={handleContinue}
              disabled={!selectedVehicle}
              style={styles.continueButton}
            >
              Continue
            </Button>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 24,
    backgroundColor: 'white',
  },
  subtitle: {
    color: '#666',
    marginTop: 4,
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    elevation: 2,
  },
  selectedCard: {
    borderWidth: 2,
    borderColor: '#1E88E5',
  },
  detail: {
    marginTop: 4,
    color: '#666',
  },
  plate: {
    marginTop: 8,
    color: '#999',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
    gap: 16,
  },
  button: {
    borderRadius: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 80,
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  continueButton: {
    borderRadius: 8,
  },
});
