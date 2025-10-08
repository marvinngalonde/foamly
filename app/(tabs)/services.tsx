import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Text, Card, Button, Searchbar, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useState, useMemo } from 'react';
import { useServices } from '@/hooks/useServices';

export default function ServicesScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: services = [], isLoading, error } = useServices();

  const categories = [
    { id: 'basic_wash', name: 'Basic Wash' },
    { id: 'premium_wash', name: 'Premium Wash' },
    { id: 'full_detail', name: 'Full Detail' },
    { id: 'interior_detail', name: 'Interior' },
    { id: 'exterior_detail', name: 'Exterior' },
    { id: 'paint_correction', name: 'Paint Correction' },
    { id: 'ceramic_coating', name: 'Ceramic Coating' },
  ];

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        service.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || service.serviceType === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [services, searchQuery, selectedCategory]);

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 16, color: '#666' }}>Loading services...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={{ color: '#DC2626', marginBottom: 16 }}>Error loading services</Text>
        <Text style={{ color: '#666' }}>{(error as Error).message}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="headlineSmall">Services</Text>
        <Searchbar
          placeholder="Search services..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <View style={styles.categories}>
        <Chip
          selected={!selectedCategory}
          onPress={() => setSelectedCategory(null)}
          style={styles.chip}
        >
          All
        </Chip>
        {categories.map((category) => (
          <Chip
            key={category.id}
            selected={selectedCategory === category.id}
            onPress={() => setSelectedCategory(category.id)}
            style={styles.chip}
          >
            {category.name}
          </Chip>
        ))}
      </View>

      <FlatList
        data={filteredServices}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.serviceHeader}>
                <Text variant="titleMedium">{item.name}</Text>
                <Text variant="titleLarge" style={styles.price}>
                  ${item.price}
                </Text>
              </View>
              <Text variant="bodyMedium" style={styles.description}>
                {item.description}
              </Text>
              <Text variant="bodySmall" style={styles.duration}>
                ⏱️ {item.duration}
              </Text>
              {item.provider && (
                <Text variant="bodySmall" style={styles.provider}>
                  {item.provider.businessName} ⭐ {parseFloat(item.provider.rating).toFixed(1)}
                </Text>
              )}
            </Card.Content>
            <Card.Actions>
              <Button
                style={styles.learnMoreButton}
                mode="outlined"
                textColor="#3B82F6"
                onPress={() => router.push(`/services/${item.id}`)}
              >
                Learn More
              </Button>
              <Button style={styles.bookButton} mode="contained" onPress={() => router.push('/booking/service-selection')}>
                Book Now
              </Button>
            </Card.Actions>
          </Card>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text variant="bodyLarge">No services found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
  header: {
    padding: 24,
    backgroundColor: 'white',
    gap: 16,
  },
  searchbar: {
    elevation: 0,
    backgroundColor: '#f0f0f0',
  },
  categories: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  chip: {
    marginRight: 4,
    backgroundColor: '#f0f0f0',
  },
  list: {
    padding: 16,
    gap: 12,
  },
  card: {
    elevation: 2,
    backgroundColor: '#f0f0f0',
  },
  bookButton: {
    backgroundColor: '#1E88E5',
  },
  learnMoreButton: {
    backgroundColor: 'transparent',
    borderColor: '#3B82F6',
    borderWidth: 1,
    marginRight: 8,
  },
  learnMoreButtonText: {
    color: '#3B82F6',
  }
  ,
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
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  provider: {
    marginTop: 8,
    color: '#3B82F6',
    fontWeight: '600',
  },
});
