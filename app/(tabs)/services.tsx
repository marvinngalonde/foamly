import { View, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, Button, Searchbar, Chip } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useState, useMemo } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useServices } from '@/hooks/useServices';
import { useProviders } from '@/hooks/useProviders';

type TabType = 'services' | 'providers';

export default function ServicesScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('services');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: services = [], isLoading: servicesLoading, error: servicesError } = useServices();
  const { data: providers = [], isLoading: providersLoading, error: providersError } = useProviders();

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

  const filteredProviders = useMemo(() => {
    return providers.filter((provider) => {
      const matchesSearch = provider.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (provider.address && provider.address.toLowerCase().includes(searchQuery.toLowerCase())) ||
        provider.serviceArea.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [providers, searchQuery]);

  const isLoading = activeTab === 'services' ? servicesLoading : providersLoading;
  const error = activeTab === 'services' ? servicesError : providersError;

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 16, color: '#666' }}>Loading...</Text>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={[styles.container, styles.centered]}>
        <Text style={{ color: '#DC2626', marginBottom: 16 }}>Error loading data</Text>
        <Text style={{ color: '#666' }}>{(error as Error).message}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
        <Searchbar
          placeholder={activeTab === 'services' ? 'Search services...' : 'Search providers...'}
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor="#666"
          inputStyle={styles.searchInput}
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'services' && styles.activeTab]}
          onPress={() => {
            setActiveTab('services');
            setSearchQuery('');
            setSelectedCategory(null);
          }}
        >
          <MaterialCommunityIcons
            name="spray"
            size={20}
            color={activeTab === 'services' ? '#3B82F6' : '#666'}
          />
          <Text style={[styles.tabText, activeTab === 'services' && styles.activeTabText]}>
            Services
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'providers' && styles.activeTab]}
          onPress={() => {
            setActiveTab('providers');
            setSearchQuery('');
          }}
        >
          <MaterialCommunityIcons
            name="store"
            size={20}
            color={activeTab === 'providers' ? '#3B82F6' : '#666'}
          />
          <Text style={[styles.tabText, activeTab === 'providers' && styles.activeTabText]}>
            Providers
          </Text>
        </TouchableOpacity>
      </View>

      {/* Categories (only for services) */}
      {activeTab === 'services' && (
        <View style={styles.categoriesContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={[{ id: 'all', name: 'All' }, ...categories]}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.categories}
            renderItem={({ item }) => (
              <Chip
                selected={item.id === 'all' ? !selectedCategory : selectedCategory === item.id}
                onPress={() => setSelectedCategory(item.id === 'all' ? null : item.id)}
                style={styles.chip}
                textStyle={styles.chipText}
              >
                {item.name}
              </Chip>
            )}
          />
        </View>
      )}

      {/* Content */}
      {activeTab === 'services' ? (
        <FlatList
          data={filteredServices}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={styles.serviceCard}>
              <Card.Content>
                <View style={styles.serviceHeader}>
                  <Text style={styles.serviceName}>{item.name}</Text>
                  <Text style={styles.price}>${parseFloat(item.price).toFixed(2)}</Text>
                </View>
                <Text style={styles.description} numberOfLines={2}>
                  {item.description}
                </Text>
                <View style={styles.serviceMeta}>
                  <View style={styles.metaItem}>
                    <MaterialCommunityIcons name="clock-outline" size={14} color="#666" />
                    <Text style={styles.metaText}>{item.duration}</Text>
                  </View>
                  {item.provider && (
                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons name="store" size={14} color="#3B82F6" />
                      <Text style={styles.providerName}>{item.provider.businessName}</Text>
                    </View>
                  )}
                </View>
              </Card.Content>
              <Card.Actions style={styles.cardActions}>
                <Button
                  mode="outlined"
                  textColor="#3B82F6"
                  style={styles.learnMoreButton}
                  onPress={() => router.push(`/services/${item.id}`)}
                >
                  Details
                </Button>
                <Button
                  mode="contained"
                  buttonColor="#3B82F6"
                  style={styles.bookButton}
                  onPress={() => router.push('/booking/service-selection')}
                >
                  Book Now
                </Button>
              </Card.Actions>
            </Card>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="clipboard-text-off" size={64} color="#CCC" />
              <Text style={styles.emptyText}>No services found</Text>
            </View>
          }
        />
      ) : (
        <FlatList
          data={filteredProviders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.providerCard}
              onPress={() => router.push(`/provider/${item.id}/profile` as any)}
            >
              <View style={styles.providerImageContainer}>
                {item.profilePicture ? (
                  <Image
                    source={{ uri: item.profilePicture }}
                    style={styles.providerImage}
                  />
                ) : (
                  <View style={[styles.providerImage, styles.providerImagePlaceholder]}>
                    <Text style={styles.providerInitial}>
                      {item.businessName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.providerInfo}>
                <View style={styles.providerHeader}>
                  <Text style={styles.providerBusinessName}>{item.businessName}</Text>
                  {item.verified && (
                    <MaterialCommunityIcons name="check-decagram" size={16} color="#10B981" />
                  )}
                </View>

                <View style={styles.providerLocation}>
                  <MaterialCommunityIcons name="map-marker" size={14} color="#666" />
                  <Text style={styles.providerLocationText} numberOfLines={1}>
                    {item.address ? item.address.split(',')[0] : item.serviceArea}
                  </Text>
                </View>

                <View style={styles.providerRating}>
                  <MaterialCommunityIcons name="star" size={14} color="#FFA500" />
                  <Text style={styles.ratingText}>{parseFloat(item.rating).toFixed(1)}</Text>
                  <Text style={styles.reviewsText}>({item.totalReviews} reviews)</Text>
                </View>
              </View>

              <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <MaterialCommunityIcons name="store-off" size={64} color="#CCC" />
              <Text style={styles.emptyText}>No providers found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 16,
    backgroundColor: '#FFFFFF',
    gap: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'NunitoSans_700Bold',
  },
  searchbar: {
    elevation: 0,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  searchInput: {
    fontSize: 14,
    fontFamily: 'NunitoSans_400Regular',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '600',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  activeTabText: {
    color: '#3B82F6',
    fontFamily: 'NunitoSans_700Bold',
  },
  categoriesContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  categories: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 8,
  },
  chip: {
    marginRight: 8,
    backgroundColor: '#F8F9FA',
  },
  chipText: {
    fontSize: 13,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  list: {
    padding: 20,
    gap: 16,
  },
  serviceCard: {
    elevation: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    fontFamily: 'NunitoSans_700Bold',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
    fontFamily: 'NunitoSans_700Bold',
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
    fontFamily: 'NunitoSans_400Regular',
  },
  serviceMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'NunitoSans_400Regular',
  },
  providerName: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: '600',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  cardActions: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  learnMoreButton: {
    borderColor: '#3B82F6',
    borderWidth: 1,
  },
  bookButton: {
    marginLeft: 8,
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  providerImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
  },
  providerImage: {
    width: '100%',
    height: '100%',
  },
  providerImagePlaceholder: {
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerInitial: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'NunitoSans_700Bold',
  },
  providerInfo: {
    flex: 1,
    gap: 6,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  providerBusinessName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'NunitoSans_700Bold',
  },
  providerLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  providerLocationText: {
    fontSize: 13,
    color: '#666',
    flex: 1,
    fontFamily: 'NunitoSans_400Regular',
  },
  providerRating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  reviewsText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'NunitoSans_400Regular',
  },
  empty: {
    padding: 60,
    alignItems: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    fontFamily: 'NunitoSans_400Regular',
  },
});
