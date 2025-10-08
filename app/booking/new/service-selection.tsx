import { View, StyleSheet, FlatList } from 'react-native';
import { Text, Card, Button, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { useBookingStore } from '@/stores/bookingStore';
import { Service, ServiceCategory, AddOn } from '@/types';

// Mock services data - in production, fetch from API
const mockServices: Service[] = [
  {
    id: '1',
    category: ServiceCategory.EXTERIOR_WASH,
    name: 'Basic Exterior Wash',
    description: 'Hand wash, wheels, tires, and dry',
    basePrice: 49.99,
    duration: 30,
    vehicleTypes: [],
    addOns: [],
    images: [],
    isActive: true,
  },
  {
    id: '2',
    category: ServiceCategory.INTERIOR_CLEANING,
    name: 'Interior Deep Clean',
    description: 'Vacuum, wipe down, windows, and air freshener',
    basePrice: 79.99,
    duration: 60,
    vehicleTypes: [],
    addOns: [],
    images: [],
    isActive: true,
  },
  {
    id: '3',
    category: ServiceCategory.FULL_DETAIL,
    name: 'Complete Detail Package',
    description: 'Full exterior and interior detailing',
    basePrice: 149.99,
    duration: 120,
    vehicleTypes: [],
    addOns: [],
    images: [],
    isActive: true,
  },
];

const mockAddOns: AddOn[] = [
  { id: '1', name: 'Engine Bay Cleaning', description: 'Clean and degrease engine bay', price: 29.99, duration: 20 },
  { id: '2', name: 'Pet Hair Removal', description: 'Specialized pet hair removal', price: 19.99, duration: 15 },
  { id: '3', name: 'Odor Elimination', description: 'Deep odor treatment', price: 39.99, duration: 30 },
];

export default function ServiceSelectionScreen() {
  const router = useRouter();
  const { selectedService, selectedAddOns, setSelectedService, toggleAddOn } = useBookingStore();
  const [services] = useState<Service[]>(mockServices);

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
  };

  const handleToggleAddOn = (addOn: AddOn) => {
    toggleAddOn(addOn);
  };

  const handleContinue = () => {
    if (selectedService) {
      router.push('/booking/new/provider-selection');
    }
  };

  const calculateTotal = () => {
    const servicePrice = selectedService?.basePrice || 0;
    const addOnsPrice = selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0);
    return servicePrice + addOnsPrice;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall">Choose Service</Text>
        <Text variant="bodyMedium" style={styles.subtitle}>
          Select the service you need
        </Text>
      </View>

      <FlatList
        data={services}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card
            style={[
              styles.card,
              selectedService?.id === item.id && styles.selectedCard,
            ]}
            onPress={() => handleSelectService(item)}
          >
            <Card.Content>
              <View style={styles.serviceHeader}>
                <Text variant="titleMedium">{item.name}</Text>
                <Text variant="titleLarge" style={styles.price}>
                  ${item.basePrice}
                </Text>
              </View>
              <Text variant="bodyMedium" style={styles.description}>
                {item.description}
              </Text>
              <Text variant="bodySmall" style={styles.duration}>
                ⏱️ {item.duration} minutes
              </Text>
            </Card.Content>
          </Card>
        )}
      />

      {selectedService && (
        <View style={styles.addOnsSection}>
          <Text variant="titleMedium" style={styles.addOnsTitle}>
            Add-ons (Optional)
          </Text>
          <View style={styles.addOns}>
            {mockAddOns.map((addOn) => (
              <Chip
                key={addOn.id}
                selected={selectedAddOns.some((a) => a.id === addOn.id)}
                onPress={() => handleToggleAddOn(addOn)}
                style={styles.addOnChip}
              >
                {addOn.name} (+${addOn.price})
              </Chip>
            ))}
          </View>
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.total}>
          <Text variant="titleMedium">Total:</Text>
          <Text variant="titleLarge" style={styles.totalPrice}>
            ${calculateTotal().toFixed(2)}
          </Text>
        </View>
        <Button
          mode="contained"
          onPress={handleContinue}
          disabled={!selectedService}
          style={styles.continueButton}
        >
          Continue
        </Button>
      </View>
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
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    color: '#1E88E5',
    fontWeight: 'bold',
  },
  description: {
    marginTop: 8,
    color: '#666',
  },
  duration: {
    marginTop: 8,
    color: '#999',
  },
  addOnsSection: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  addOnsTitle: {
    marginBottom: 12,
  },
  addOns: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  addOnChip: {
    marginBottom: 4,
  },
  footer: {
    padding: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  total: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalPrice: {
    color: '#1E88E5',
    fontWeight: 'bold',
  },
  continueButton: {
    borderRadius: 8,
  },
});
