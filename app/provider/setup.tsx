import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Image, Platform, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useRef } from 'react';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useAuthStore } from '@/stores/authStore';
import { useCreateProvider } from '@/hooks/useProviders';
import { pickImage, uploadImage } from '@/lib/storage';

const SETUP_STEPS = ['Business Info', 'Location', 'Service Area', 'Complete'];

export default function ProviderSetupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const { user } = useAuthStore();
  const createProviderMutation = useCreateProvider();

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: Business Info
  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || '');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Step 2: Location
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [coordinates, setCoordinates] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  // Step 3: Service Area
  const [serviceRadius, setServiceRadius] = useState(5000); // 5km default
  const [serviceArea, setServiceArea] = useState('');

  const handleUploadProfilePicture = async () => {
    try {
      setUploadingImage(true);
      const image = await pickImage();
      if (!image) {
        setUploadingImage(false);
        return;
      }

      const result = await uploadImage(
        image.uri,
        'profile_pics',
        `provider_${user?.id}_${Date.now()}.jpg`
      );
      setProfilePicture(result.url);
      Alert.alert('Success', 'Profile picture uploaded successfully!');
    } catch (error: unknown) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to upload photo');
    } finally {
      setUploadingImage(false);
    }
  };

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
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };

      setCoordinates(newCoords);
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);

      // Reverse geocode
      const results = await Location.reverseGeocodeAsync(newCoords);
      if (results && results.length > 0) {
        const result = results[0];
        setAddress(`${result.streetNumber || ''} ${result.street || ''}`.trim());
        setCity(result.city || '');
        setState(result.region || '');
        setZipCode(result.postalCode || '');
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
        setAddress(`${result.streetNumber || ''} ${result.street || ''}`.trim());
        setCity(result.city || '');
        setState(result.region || '');
        setZipCode(result.postalCode || '');
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  const validateStep = () => {
    switch (currentStep) {
      case 0:
        if (!businessName.trim()) {
          Alert.alert('Required', 'Please enter your business name');
          return false;
        }
        if (!bio.trim()) {
          Alert.alert('Required', 'Please enter a business description');
          return false;
        }
        return true;
      case 1:
        if (!address.trim() || !city.trim() || !state.trim()) {
          Alert.alert('Required', 'Please select your business location on the map');
          return false;
        }
        return true;
      case 2:
        if (!serviceArea.trim()) {
          Alert.alert('Required', 'Please enter your service area name (e.g., "San Francisco Bay Area")');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep()) return;

    if (currentStep < SETUP_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      await createProviderMutation.mutateAsync({
        userId: user?.id || '',
        businessName,
        bio,
        address: `${address}, ${city}, ${state} ${zipCode}`,
        serviceArea,
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        serviceRadius,
        profilePicture: profilePicture || undefined,
        phoneNumber,
        isActive: true,
        verified: false,
      });

      Alert.alert(
        'Success!',
        'Your provider profile has been created. You can now start adding services and receiving bookings.',
        [
          {
            text: 'Go to Dashboard',
            onPress: () => router.replace('/(tabs)/provider-dashboard'),
          },
        ]
      );
    } catch (error: unknown) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create provider profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Tell us about your business</Text>
              <Text style={styles.stepSubtitle}>
                This information will be visible to customers
              </Text>

              {/* Profile Picture */}
              <View style={styles.profilePictureSection}>
                <TouchableOpacity
                  style={styles.profilePictureButton}
                  onPress={handleUploadProfilePicture}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? (
                    <ActivityIndicator size="large" color="#3B82F6" />
                  ) : profilePicture ? (
                    <Image source={{ uri: profilePicture }} style={styles.profilePictureImage} />
                  ) : (
                    <View style={styles.profilePicturePlaceholder}>
                      <MaterialCommunityIcons name="camera" size={32} color="#3B82F6" />
                      <Text style={styles.profilePictureText}>Add Photo</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <Text style={styles.profilePictureLabel}>Business Logo/Photo</Text>
              </View>

              {/* Business Name */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Business Name *</Text>
                <TextInput
                  style={styles.input}
                  value={businessName}
                  onChangeText={setBusinessName}
                  placeholder="e.g., Premium Auto Detailing"
                  placeholderTextColor="#999"
                />
              </View>

              {/* Bio/Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Business Description *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={bio}
                  onChangeText={setBio}
                  placeholder="Tell customers about your business, experience, and what makes you special..."
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                />
                <Text style={styles.charCount}>{bio.length}/500</Text>
              </View>

              {/* Phone Number */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Contact Phone</Text>
                <TextInput
                  style={styles.input}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="(123) 456-7890"
                  placeholderTextColor="#999"
                  keyboardType="phone-pad"
                />
              </View>
            </View>
          </ScrollView>
        );

      case 1:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Where is your business located?</Text>
            <Text style={styles.stepSubtitle}>
              Tap on the map to set your exact location
            </Text>

            {/* Map */}
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
                    <MaterialCommunityIcons name="store" size={32} color="#3B82F6" />
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
            </View>

            {/* Address Fields */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
              <View style={styles.addressFields}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Street Address *</Text>
                  <TextInput
                    style={styles.input}
                    value={address}
                    onChangeText={setAddress}
                    placeholder="123 Main Street"
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 2 }]}>
                    <Text style={styles.inputLabel}>City *</Text>
                    <TextInput
                      style={styles.input}
                      value={city}
                      onChangeText={setCity}
                      placeholder="San Francisco"
                      placeholderTextColor="#999"
                    />
                  </View>

                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 12 }]}>
                    <Text style={styles.inputLabel}>State *</Text>
                    <TextInput
                      style={styles.input}
                      value={state}
                      onChangeText={setState}
                      placeholder="CA"
                      placeholderTextColor="#999"
                      maxLength={2}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>ZIP Code</Text>
                  <TextInput
                    style={styles.input}
                    value={zipCode}
                    onChangeText={setZipCode}
                    placeholder="94102"
                    placeholderTextColor="#999"
                    keyboardType="numeric"
                    maxLength={5}
                  />
                </View>

                <View style={styles.coordsInfo}>
                  <MaterialCommunityIcons name="crosshairs" size={14} color="#999" />
                  <Text style={styles.coordsText}>
                    {coordinates.latitude.toFixed(6)}, {coordinates.longitude.toFixed(6)}
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContent}>
            <Text style={styles.stepTitle}>Define your service area</Text>
            <Text style={styles.stepSubtitle}>
              Set the radius where you'll provide services
            </Text>

            {/* Map with Service Radius */}
            <View style={styles.mapContainer}>
              <MapView
                ref={mapRef}
                style={styles.map}
                provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                initialRegion={{
                  ...coordinates,
                  latitudeDelta: 0.2,
                  longitudeDelta: 0.2,
                }}
                showsUserLocation={false}
              >
                <Marker coordinate={coordinates}>
                  <View style={styles.customMarker}>
                    <MaterialCommunityIcons name="store" size={32} color="#3B82F6" />
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

              {/* Radius Badge */}
              <View style={styles.radiusBadge}>
                <Text style={styles.radiusBadgeText}>
                  Service Radius: {(serviceRadius / 1000).toFixed(1)} km
                </Text>
              </View>
            </View>

            {/* Service Area Controls */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
              <View style={styles.serviceAreaControls}>
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

                <View style={styles.infoCard}>
                  <MaterialCommunityIcons name="information" size={20} color="#3B82F6" />
                  <Text style={styles.infoText}>
                    Customers within this radius will be able to book your services. You can change this later.
                  </Text>
                </View>
              </View>
            </ScrollView>
          </View>
        );

      case 3:
        return (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}>
            <View style={styles.stepContent}>
              <View style={styles.completionIcon}>
                <MaterialCommunityIcons name="check-circle" size={80} color="#10B981" />
              </View>

              <Text style={styles.completionTitle}>You're all set!</Text>
              <Text style={styles.completionText}>
                Review your information before completing setup
              </Text>

              {/* Summary Cards */}
              <View style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                  <MaterialCommunityIcons name="briefcase" size={24} color="#3B82F6" />
                  <Text style={styles.summaryHeaderText}>Business Information</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Business Name:</Text>
                  <Text style={styles.summaryValue}>{businessName}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Description:</Text>
                  <Text style={styles.summaryValue} numberOfLines={2}>{bio}</Text>
                </View>
                {phoneNumber && (
                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Phone:</Text>
                    <Text style={styles.summaryValue}>{phoneNumber}</Text>
                  </View>
                )}
              </View>

              <View style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                  <MaterialCommunityIcons name="map-marker" size={24} color="#3B82F6" />
                  <Text style={styles.summaryHeaderText}>Location</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Address:</Text>
                  <Text style={styles.summaryValue}>
                    {address}, {city}, {state} {zipCode}
                  </Text>
                </View>
              </View>

              <View style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                  <MaterialCommunityIcons name="map-marker-radius" size={24} color="#3B82F6" />
                  <Text style={styles.summaryHeaderText}>Service Area</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Area:</Text>
                  <Text style={styles.summaryValue}>{serviceArea}</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Radius:</Text>
                  <Text style={styles.summaryValue}>{(serviceRadius / 1000).toFixed(1)} km</Text>
                </View>
              </View>

              <View style={styles.nextStepsCard}>
                <Text style={styles.nextStepsTitle}>Next Steps:</Text>
                <View style={styles.nextStepItem}>
                  <MaterialCommunityIcons name="check" size={16} color="#10B981" />
                  <Text style={styles.nextStepText}>Add your services and pricing</Text>
                </View>
                <View style={styles.nextStepItem}>
                  <MaterialCommunityIcons name="check" size={16} color="#10B981" />
                  <Text style={styles.nextStepText}>Set your business hours</Text>
                </View>
                <View style={styles.nextStepItem}>
                  <MaterialCommunityIcons name="check" size={16} color="#10B981" />
                  <Text style={styles.nextStepText}>Start accepting bookings!</Text>
                </View>
              </View>
            </View>
          </ScrollView>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Provider Setup</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        {SETUP_STEPS.map((step, index) => (
          <View key={step} style={styles.stepIndicator}>
            <View
              style={[
                styles.stepCircle,
                index <= currentStep && styles.stepCircleActive,
                index < currentStep && styles.stepCircleCompleted,
              ]}
            >
              {index < currentStep ? (
                <MaterialCommunityIcons name="check" size={16} color="#FFF" />
              ) : (
                <Text
                  style={[
                    styles.stepCircleText,
                    index <= currentStep && styles.stepCircleTextActive,
                  ]}
                >
                  {index + 1}
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.stepText,
                index <= currentStep && styles.stepTextActive,
              ]}
            >
              {step}
            </Text>
            {index < SETUP_STEPS.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  index < currentStep && styles.stepLineActive,
                ]}
              />
            )}
          </View>
        ))}
      </View>

      {/* Step Content */}
      {renderStepContent()}

      {/* Navigation Buttons */}
      <View style={styles.navigationButtons}>
        <TouchableOpacity
          style={[styles.nextButton, isSubmitting && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <Text style={styles.nextButtonText}>
                {currentStep === SETUP_STEPS.length - 1 ? 'Complete Setup' : 'Continue'}
              </Text>
              <MaterialCommunityIcons name="arrow-right" size={20} color="#FFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3B82F6',
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
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  stepIndicator: {
    flex: 1,
    alignItems: 'center',
    position: 'relative',
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: '#3B82F6',
  },
  stepCircleCompleted: {
    backgroundColor: '#10B981',
  },
  stepCircleText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  stepCircleTextActive: {
    color: '#FFF',
  },
  stepText: {
    fontSize: 10,
    color: '#999',
    textAlign: 'center',
    fontFamily: 'NunitoSans_400Regular',
  },
  stepTextActive: {
    color: '#333',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  stepLine: {
    position: 'absolute',
    top: 16,
    left: '50%',
    right: '-50%',
    height: 2,
    backgroundColor: '#E5E7EB',
  },
  stepLineActive: {
    backgroundColor: '#10B981',
  },
  stepContent: {
    flex: 1,
    backgroundColor: '#FFF',
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'NunitoSans_700Bold',
  },
  stepSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    fontFamily: 'NunitoSans_400Regular',
  },
  profilePictureSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profilePictureButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 12,
  },
  profilePictureImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profilePicturePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  profilePictureText: {
    fontSize: 12,
    color: '#3B82F6',
    marginTop: 8,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  profilePictureLabel: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'NunitoSans_400Regular',
  },
  inputGroup: {
    marginBottom: 20,
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
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
  mapContainer: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
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
  addressFields: {
    marginTop: 8,
  },
  row: {
    flexDirection: 'row',
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
  radiusBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#FFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  radiusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  serviceAreaControls: {
    marginTop: 8,
  },
  inputHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
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
    marginTop: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    fontFamily: 'NunitoSans_400Regular',
  },
  completionIcon: {
    alignItems: 'center',
    marginVertical: 24,
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'NunitoSans_700Bold',
  },
  completionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
    fontFamily: 'NunitoSans_400Regular',
  },
  summaryCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  summaryHeaderText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'NunitoSans_700Bold',
  },
  summaryRow: {
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  summaryValue: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'NunitoSans_400Regular',
  },
  nextStepsCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  nextStepsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    fontFamily: 'NunitoSans_700Bold',
  },
  nextStepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  nextStepText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'NunitoSans_400Regular',
  },
  navigationButtons: {
    backgroundColor: '#FFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  nextButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  nextButtonDisabled: {
    backgroundColor: '#CCC',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'NunitoSans_700Bold',
  },
});
