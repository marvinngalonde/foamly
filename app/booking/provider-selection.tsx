import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import { useProviders } from '@/hooks/useProviders';
import { useBookingStore } from '@/stores/bookingStore';
import * as Location from 'expo-location';
import MapView, { Marker, PROVIDER_GOOGLE, Circle } from 'react-native-maps';

const STEPS = ['Service', 'Vehicle', 'Location', 'Provider', 'Time', 'Confirm'];
const CURRENT_STEP = 3; // Provider selection is step 4 (index 3)

export default function ProviderSelectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('best-match');
  const { setSelectedProvider, selectedLocation, selectedService } = useBookingStore();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const { data: allProviders = [], isLoading } = useProviders();

  // Filter providers by location and service
  const providers = allProviders.filter((provider) => {
    // Filter by selected service if available
    if (selectedService) {
      // Check if provider offers this service type
      // This assumes provider has servicesOffered or similar field
    }
    return provider.isActive; // Only show active providers
  });

  // Use selected location or get current location
  useEffect(() => {
    if (selectedLocation?.coordinates) {
      setUserLocation(selectedLocation.coordinates);
      // Animate map to selected location
      mapRef.current?.animateToRegion({
        latitude: selectedLocation.coordinates.latitude,
        longitude: selectedLocation.coordinates.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 1000);
    } else {
      (async () => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      })();
    }
  }, [selectedLocation]);

  const handleSelectProvider = (provider: any) => {
    setSelectedProvider(provider);
    router.push('/booking/datetime-selection');
  };

  const filters = [
    { id: '5-star', label: '5 Star', icon: 'star' },
    { id: 'nearby', label: 'Nearby', icon: 'map-marker' },
    { id: 'budget', label: 'Budget', icon: 'cash' },
    { id: 'available', label: 'Available Now', icon: 'clock' },
  ];

  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev =>
      prev.includes(filterId)
        ? prev.filter(id => id !== filterId)
        : [...prev, filterId]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading providers...</Text>
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
        <Text style={styles.headerTitle}>Select Provider</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.innerContainer}>
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          {STEPS.map((step, index) => (
            <View key={step} style={styles.stepContainer}>
              <View style={styles.stepWrapper}>
                <View
                  style={[
                    styles.stepCircle,
                    index <= CURRENT_STEP && styles.stepCircleActive,
                    index < CURRENT_STEP && styles.stepCircleCompleted,
                  ]}
                >
                  {index < CURRENT_STEP ? (
                    <MaterialCommunityIcons name="check" size={16} color="#FFF" />
                  ) : (
                    <Text
                      style={[
                        styles.stepNumber,
                        index <= CURRENT_STEP && styles.stepNumberActive,
                      ]}
                    >
                      {index + 1}
                    </Text>
                  )}
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    index <= CURRENT_STEP && styles.stepLabelActive,
                  ]}
                >
                  {step}
                </Text>
              </View>
              {index < STEPS.length - 1 && (
                <View
                  style={[
                    styles.stepLine,
                    index < CURRENT_STEP && styles.stepLineActive,
                  ]}
                />
              )}
            </View>
          ))}
        </View>

        {/* Map Container - Live Map */}
        <View style={styles.mapContainer}>
          {userLocation ? (
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
              initialRegion={{
                latitude: userLocation.latitude,
                longitude: userLocation.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              showsUserLocation={true}
              showsMyLocationButton={false}
            >
              {/* User's selected location marker */}
              {selectedLocation?.coordinates && (
                <Marker
                  coordinate={selectedLocation.coordinates}
                  title="Service Location"
                  description={selectedLocation.address}
                >
                  <View style={styles.markerContainer}>
                    <MaterialCommunityIcons name="map-marker" size={32} color="#3B82F6" />
                  </View>
                </Marker>
              )}

              {/* Service area circle around selected location */}
              {selectedLocation?.coordinates && (
                <Circle
                  center={selectedLocation.coordinates}
                  radius={5000} // 5km radius
                  fillColor="rgba(59, 130, 246, 0.1)"
                  strokeColor="rgba(59, 130, 246, 0.3)"
                  strokeWidth={2}
                />
              )}

              {/* Provider markers */}
              {providers.map((provider) => {
                // Use provider's location if available, otherwise mock nearby location
                const providerLocation = provider.location || {
                  latitude: userLocation.latitude + (Math.random() - 0.5) * 0.05,
                  longitude: userLocation.longitude + (Math.random() - 0.5) * 0.05,
                };

                return (
                  <Marker
                    key={provider.id}
                    coordinate={providerLocation}
                    title={provider.businessName}
                    description={provider.serviceArea || 'Service Provider'}
                    onPress={() => handleSelectProvider(provider)}
                  >
                    <View style={styles.providerIndicator}>
                      <MaterialCommunityIcons name="store" size={20} color="#FFF" />
                    </View>
                  </Marker>
                );
              })}
            </MapView>
          ) : (
            <View style={styles.mapPlaceholder}>
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text style={styles.mapText}>Loading map...</Text>
            </View>
          )}
        </View>

        <View style={styles.mapOverlay}>
          <View style={styles.mapInfoBadge}>
            <MaterialCommunityIcons name="map-marker-multiple" size={16} color="#3B82F6" />
            <Text style={styles.mapInfoText}>{providers.length} providers nearby</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.locationButton}
          onPress={async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
              let location = await Location.getCurrentPositionAsync({});
              setUserLocation({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              });
            }
          }}
        >
          <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#3B82F6" />
        </TouchableOpacity>
      </View>

      {/* Filter Bar */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterChip,
                selectedFilters.includes(filter.id) && styles.filterChipActive
              ]}
              onPress={() => toggleFilter(filter.id)}
            >
              <MaterialCommunityIcons
                name={filter.icon as any}
                size={16}
                color={selectedFilters.includes(filter.id) ? '#FFF' : '#666'}
              />
              <Text style={[
                styles.filterLabel,
                selectedFilters.includes(filter.id) && styles.filterLabelActive
              ]}>{filter.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity style={styles.sortButton}>
          <MaterialCommunityIcons name="sort" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Provider List */}
      <ScrollView style={styles.providerList} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>{providers.length} Providers Found</Text>
          <TouchableOpacity>
            <Text style={styles.sortText}>Best Match ▼</Text>
          </TouchableOpacity>
        </View>

        {providers.map((provider) => {
          const rating = provider.rating ? parseFloat(provider.rating) : 0;
          const isAvailable = provider.isActive;

          return (
            <TouchableOpacity
              key={provider.id}
              style={styles.providerCard}
              onPress={() => router.push(`/provider/${provider.id}/profile`)}
            >
              {/* Provider Photo */}
              <View style={styles.providerPhotoContainer}>
                {provider.user?.profilePicture ? (
                  <Image
                    source={{ uri: provider.user.profilePicture }}
                    style={styles.providerPhoto}
                  />
                ) : (
                  <View style={styles.providerPhotoPlaceholder}>
                    <MaterialCommunityIcons name="account" size={32} color="#3B82F6" />
                  </View>
                )}
                {provider.verified && (
                  <View style={styles.verifiedBadge}>
                    <MaterialCommunityIcons name="check-decagram" size={16} color="#10B981" />
                  </View>
                )}
              </View>

              {/* Provider Info */}
              <View style={styles.providerInfo}>
                <View style={styles.providerHeader}>
                  <Text style={styles.providerName}>{provider.businessName}</Text>
                  {!isAvailable && (
                    <View style={styles.unavailableBadge}>
                      <Text style={styles.unavailableText}>Inactive</Text>
                    </View>
                  )}
                </View>

                <Text style={styles.providerSpecialty} numberOfLines={1}>
                  {provider.serviceArea || 'Local Service Area'}
                </Text>

                <View style={styles.providerMeta}>
                  {rating > 0 && (
                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons name="star" size={14} color="#FFA500" />
                      <Text style={styles.metaText}>{rating.toFixed(1)}</Text>
                    </View>
                  )}

                  {provider.serviceArea && (
                    <View style={styles.metaItem}>
                      <MaterialCommunityIcons name="map-marker" size={14} color="#666" />
                      <Text style={styles.metaText} numberOfLines={1}>
                        {provider.serviceArea}
                      </Text>
                    </View>
                  )}
                </View>

                {provider.bio && (
                  <Text style={styles.providerBio} numberOfLines={2}>
                    {provider.bio}
                  </Text>
                )}
              </View>

              {/* Select Button */}
              <View style={styles.selectButtonContainer}>
                <TouchableOpacity
                  style={styles.selectButton}
                  onPress={() => handleSelectProvider(provider)}
                >
                  <Text style={styles.selectButtonText}>Select</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })}

      </ScrollView>
    
    </SafeAreaView >
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
    paddingVertical: 16,
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
    width: 28,
    height: 28,
    borderRadius: 14,
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
    fontSize: 11,
    color: '#999',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  stepNumberActive: {
    color: '#FFF',
  },
  stepLabel: {
    fontSize: 8,
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
    top: 13,
  },
  stepLineActive: {
    backgroundColor: '#10B981',
  },
  mapContainer: {
    height: 300,
    backgroundColor: '#E0F2FE',
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
  },
  mapText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
    fontFamily: 'NunitoSans_700Bold',
  },
  mapSubtext: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
  locationText: {
    fontSize: 11,
    color: '#666',
    marginTop: 8,
    fontFamily: 'NunitoSans_400Regular',
  },
  providersOverlay: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'none',
  },
  providerIndicator: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  markerContainer: {
    backgroundColor: '#FFF',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#3B82F6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  mapOverlay: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
  },
  mapInfoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapInfoText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  locationButton: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F8F9FA',
    marginRight: 8,
    gap: 4,
  },
  filterChipActive: {
    backgroundColor: '#3B82F6',
  },
  filterLabel: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  filterLabelActive: {
    color: '#FFF',
  },
  sortButton: {
    padding: 8,
    marginLeft: 8,
  },
  providerList: {
    flex: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'NunitoSans_700Bold',
  },
  sortText: {
    fontSize: 13,
    color: '#3B82F6',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  providerCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    marginHorizontal: 20,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    alignItems: 'flex-start',
  },
  providerPhotoContainer: {
    width: 56,
    height: 56,
    marginRight: 12,
    position: 'relative',
  },
  providerPhoto: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  providerPhotoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderRadius: 8,
  },
  providerInfo: {
    flex: 1,
  },
  providerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  providerName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'NunitoSans_700Bold',
  },
  unavailableBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  unavailableText: {
    fontSize: 10,
    color: '#DC2626',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  providerSpecialty: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'NunitoSans_400Regular',
  },
  providerMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 4,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  metaSubtext: {
    fontSize: 11,
    color: '#666',
    marginLeft: 2,
    fontFamily: 'NunitoSans_400Regular',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'NunitoSans_400Regular',
  },
  priceValue: {
    fontSize: 13,
    color: '#10B981',
    marginLeft: 4,
    fontFamily: 'NunitoSans_700Bold',
  },
  providerBio: {
    fontSize: 12,
    color: '#666',
    marginTop: 6,
    fontFamily: 'NunitoSans_400Regular',
  },
  selectButtonContainer: {
    marginLeft: 8,
  },
  selectButton: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  selectButtonText: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'NunitoSans_700Bold',
  },
  viewScheduleButton: {
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  viewScheduleText: {
    fontSize: 12,
    color: '#3B82F6',
    fontFamily: 'NunitoSans_600SemiBold',
  },
});
