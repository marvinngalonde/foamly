import { View, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, TextInput, Platform } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useEffect, useRef } from 'react';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useBookingStore } from '@/stores/bookingStore';

const STEPS = ['Service', 'Vehicle', 'Location', 'Provider', 'Time', 'Confirm'];
const CURRENT_STEP = 2; // Location selection is step 3 (index 2)

export default function LocationSelectionScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const { setSelectedLocation, selectedLocation } = useBookingStore();

  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [markerPosition, setMarkerPosition] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
  });

  const [address, setAddress] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);

  // Get current location on mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  // Reverse geocode when marker position changes
  useEffect(() => {
    reverseGeocode(markerPosition.latitude, markerPosition.longitude);
  }, [markerPosition]);

  const getCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please enable location permissions to use this feature');
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };

      setRegion(newRegion);
      setMarkerPosition({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      // Animate map to current location
      mapRef.current?.animateToRegion(newRegion, 1000);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get your current location');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      setIsLoadingAddress(true);
      const results = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (results && results.length > 0) {
        const result = results[0];
        const formattedAddress = [
          result.streetNumber,
          result.street,
          result.city,
          result.region,
          result.postalCode,
        ]
          .filter(Boolean)
          .join(', ');

        setAddress(formattedAddress || 'Unknown location');
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    } finally {
      setIsLoadingAddress(false);
    }
  };

  const handleMapPress = (e: any) => {
    const coordinate = e.nativeEvent.coordinate;
    setMarkerPosition(coordinate);
  };

  const handleContinue = () => {
    if (!address) {
      Alert.alert('Location Required', 'Please select a location for your service');
      return;
    }

    // Save location to store
    setSelectedLocation({
      address: address,
      street: address.split(',')[1]?.trim() || '',
      city: address.split(',')[2]?.trim() || '',
      state: address.split(',')[3]?.trim() || '',
      zipCode: address.split(',')[4]?.trim() || '',
      country: 'USA',
      coordinates: {
        latitude: markerPosition.latitude,
        longitude: markerPosition.longitude,
      },
    });

    router.push('/booking/provider-selection');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Location</Text>
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

        {/* Map Container */}
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
            showsCompass={true}
            loadingEnabled={true}
          >
            <Marker
              coordinate={markerPosition}
              draggable
              onDragEnd={(e) => setMarkerPosition(e.nativeEvent.coordinate)}
            >
              <View style={styles.customMarker}>
                <MaterialCommunityIcons name="map-marker" size={48} color="#3B82F6" />
              </View>
            </Marker>
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

          {/* Map Type Toggle */}
          <View style={styles.mapTypeContainer}>
            <Text style={styles.mapTypeText}>Standard</Text>
          </View>
        </View>

        {/* Address Card */}
        <View style={styles.addressCard}>
          <View style={styles.addressHeader}>
            <MaterialCommunityIcons name="map-marker-outline" size={24} color="#3B82F6" />
            <Text style={styles.addressTitle}>Service Location</Text>
          </View>

          <View style={styles.addressInputContainer}>
            <TextInput
              style={styles.addressInput}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter your address..."
              placeholderTextColor="#999"
              multiline
            />
            {isLoadingAddress && (
              <ActivityIndicator size="small" color="#3B82F6" style={styles.addressLoader} />
            )}
          </View>

          <View style={styles.coordinatesRow}>
            <MaterialCommunityIcons name="crosshairs" size={14} color="#999" />
            <Text style={styles.coordinatesText}>
              {markerPosition.latitude.toFixed(6)}, {markerPosition.longitude.toFixed(6)}
            </Text>
          </View>

          <View style={styles.instructionCard}>
            <MaterialCommunityIcons name="information-outline" size={16} color="#3B82F6" />
            <Text style={styles.instructionText}>
              Drag the marker or tap on the map to adjust your exact location
            </Text>
          </View>
        </View>

        {/* Continue Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.continueButton, !address && styles.continueButtonDisabled]}
            onPress={handleContinue}
            disabled={!address}
          >
            <Text style={styles.continueButtonText}>Continue</Text>
            <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
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
    flex: 1,
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
  mapTypeContainer: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mapTypeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  addressCard: {
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  addressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'NunitoSans_700Bold',
  },
  addressInputContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  addressInput: {
    backgroundColor: '#F8F9FA',
    padding: 14,
    borderRadius: 12,
    fontSize: 14,
    color: '#333',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    minHeight: 60,
    fontFamily: 'NunitoSans_400Regular',
  },
  addressLoader: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  coordinatesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  coordinatesText: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'NunitoSans_400Regular',
  },
  instructionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  instructionText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
    fontFamily: 'NunitoSans_400Regular',
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
  continueButtonDisabled: {
    backgroundColor: '#CCC',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'NunitoSans_700Bold',
  },
});
