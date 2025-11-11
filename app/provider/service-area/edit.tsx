import { View, StyleSheet, TouchableOpacity, Alert, TextInput, Platform, ActivityIndicator, ScrollView } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useRef, useEffect } from 'react';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useAuthStore } from '@/stores/authStore';
import { useProviderByUserId, useUpdateProviderProfile } from '@/hooks/useProviders';

export default function ServiceAreaEditScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const { user } = useAuthStore();

  const { data: provider, isLoading: providerLoading } = useProviderByUserId(user?.id || '');
  const updateProviderMutation = useUpdateProviderProfile();

  const [serviceArea, setServiceArea] = useState('');
  const [address, setAddress] = useState('');
  const [serviceRadius, setServiceRadius] = useState(5000);
  const [coordinates, setCoordinates] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
  });
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.2,
    longitudeDelta: 0.2,
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize with provider data
  useEffect(() => {
    if (provider) {
      setServiceArea(provider.serviceArea || '');
      setAddress(provider.address || '');

      // If provider has coordinates, use them
      if ((provider as { latitude?: number }).latitude && (provider as { longitude?: number }).longitude) {
        const coords = {
          latitude: (provider as { latitude: number }).latitude,
          longitude: (provider as { longitude: number }).longitude,
        };
        setCoordinates(coords);
        setRegion({
          ...coords,
          latitudeDelta: 0.2,
          longitudeDelta: 0.2,
        });
      }

      if ((provider as { serviceRadius?: number }).serviceRadius) {
        setServiceRadius((provider as { serviceRadius: number }).serviceRadius);
      }
    }
  }, [provider]);

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location permissions');
        return;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      const newRegion = {
        ...newCoords,
        latitudeDelta: 0.2,
        longitudeDelta: 0.2,
      };

      setCoordinates(newCoords);
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);

      // Reverse geocode
      const results = await Location.reverseGeocodeAsync(newCoords);
      if (results && results.length > 0) {
        const result = results[0];
        const formattedAddress = [
          result.streetNumber,
          result.street,
          result.city,
          result.region,
          result.postalCode,
        ].filter(Boolean).join(', ');
        setAddress(formattedAddress);
      }
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your current location');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleMapPress = async (e: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
    const coordinate = e.nativeEvent.coordinate;
    setCoordinates(coordinate);

    // Reverse geocode
    try {
      const results = await Location.reverseGeocodeAsync(coordinate);
      if (results && results.length > 0) {
        const result = results[0];
        const formattedAddress = [
          result.streetNumber,
          result.street,
          result.city,
          result.region,
          result.postalCode,
        ].filter(Boolean).join(', ');
        setAddress(formattedAddress);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  const handleSave = async () => {
    if (!provider?.id) return;

    if (!serviceArea.trim()) {
      Alert.alert('Required', 'Please enter a service area name');
      return;
    }

    try {
      setIsSaving(true);

      // Update provider with new service area data
      await updateProviderMutation.mutateAsync({
        id: provider.id,
        input: {
          serviceArea,
          address,
        },
      });

      Alert.alert('Success', 'Service area updated successfully', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: unknown) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update service area');
    } finally {
      setIsSaving(false);
    }
  };

  if (providerLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading...</Text>
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
        <Text style={styles.headerTitle}>Edit Service Area</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.innerContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        >
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Define Your Coverage</Text>
            <Text style={styles.sectionSubtitle}>
              Set your business location and service radius to help customers find you
            </Text>

            {/* Map with Service Radius */}
            <View style={styles.mapContainer}>
              <MapView
                ref={mapRef}
                style={styles.map}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                region={region}
                onRegionChangeComplete={setRegion}
                onPress={handleMapPress}
                showsUserLocation={true}
                showsMyLocationButton={false}
              >
                <Marker
                  coordinate={coordinates}
                  draggable
                  onDragEnd={(e) => handleMapPress(e)}
                >
                  <View style={styles.customMarker}>
                    <MaterialCommunityIcons name="store" size={36} color="#3B82F6" />
                  </View>
                </Marker>

                <Circle
                  center={coordinates}
                  radius={serviceRadius}
                  fillColor="rgba(59, 130, 246, 0.1)"
                  strokeColor="rgba(59, 130, 246, 0.5)"
                  strokeWidth={2}
                />
              </MapView>

              {/* Current Location Button */}
              <TouchableOpacity
                style={styles.currentLocationButton}
                onPress={getCurrentLocation}
                disabled={isLoadingLocation}
              >
                {isLoadingLocation ? (
                  <ActivityIndicator size="small" color="#3B82F6" />
                ) : (
                  <MaterialCommunityIcons name="crosshairs-gps" size={24} color="#3B82F6" />
                )}
              </TouchableOpacity>

              {/* Radius Badge */}
              <View style={styles.radiusBadge}>
                <Text style={styles.radiusBadgeText}>
                  {(serviceRadius / 1000).toFixed(1)} km radius
                </Text>
              </View>
            </View>

            {/* Service Area Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Service Area Name *</Text>
              <TextInput
                style={styles.input}
                value={serviceArea}
                onChangeText={setServiceArea}
                placeholder="e.g., San Francisco Bay Area"
                placeholderTextColor="#999"
              />
              <Text style={styles.inputHint}>
                Give your service area a recognizable name
              </Text>
            </View>

            {/* Address */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Business Address</Text>
              <TextInput
                style={styles.input}
                value={address}
                onChangeText={setAddress}
                placeholder="Tap on map to update address"
                placeholderTextColor="#999"
                multiline
              />
              <View style={styles.coordsInfo}>
                <MaterialCommunityIcons name="crosshairs" size={14} color="#999" />
                <Text style={styles.coordsText}>
                  {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
                </Text>
              </View>
            </View>

            {/* Service Radius Options */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Service Radius</Text>
              <View style={styles.radiusOptions}>
                {[2000, 5000, 10000, 20000, 50000].map((radius) => (
                  <TouchableOpacity
                    key={radius}
                    style={[
                      styles.radiusOption,
                      serviceRadius === radius && styles.radiusOptionActive,
                    ]}
                    onPress={() => setServiceRadius(radius)}
                  >
                    <Text
                      style={[
                        styles.radiusOptionText,
                        serviceRadius === radius && styles.radiusOptionTextActive,
                      ]}
                    >
                      {radius / 1000} km
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Info Card */}
            <View style={styles.infoCard}>
              <MaterialCommunityIcons name="information" size={20} color="#3B82F6" />
              <Text style={styles.infoText}>
                Customers within this radius will be able to see and book your services.
                Adjust the radius based on how far you're willing to travel.
              </Text>
            </View>

            {/* Coverage Statistics */}
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>Coverage Statistics</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="map-marker-radius" size={24} color="#3B82F6" />
                  <Text style={styles.statValue}>{(serviceRadius / 1000).toFixed(1)} km</Text>
                  <Text style={styles.statLabel}>Radius</Text>
                </View>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="arrow-expand-all" size={24} color="#10B981" />
                  <Text style={styles.statValue}>
                    {((Math.PI * serviceRadius * serviceRadius) / 1000000).toFixed(1)} km²
                  </Text>
                  <Text style={styles.statLabel}>Coverage Area</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <>
                <MaterialCommunityIcons name="check" size={20} color="#FFF" />
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </>
            )}
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  innerContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopRightRadius: 24,
    borderTopLeftRadius: 24,
    overflow: 'hidden',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'NunitoSans_700Bold',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    fontFamily: 'NunitoSans_400Regular',
  },
  mapContainer: {
    height: 350,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 24,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  customMarker: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentLocationButton: {
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
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  radiusBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  radiusBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: '#333',
    fontFamily: 'NunitoSans_400Regular',
  },
  inputHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
  coordsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  coordsText: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'NunitoSans_400Regular',
  },
  radiusOptions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  radiusOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  radiusOptionActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  radiusOptionText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  radiusOptionTextActive: {
    color: '#3B82F6',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
    gap: 8,
    marginBottom: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    fontFamily: 'NunitoSans_400Regular',
  },
  statsCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  statsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    fontFamily: 'NunitoSans_700Bold',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 8,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    fontFamily: 'NunitoSans_700Bold',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#CCC',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'NunitoSans_700Bold',
  },
});
