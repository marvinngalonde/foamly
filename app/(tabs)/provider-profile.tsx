import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Image, Platform, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState, useRef, useEffect } from 'react';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { useAuthStore } from '@/stores/authStore';
import { useProviderByUserId, useUpdateProviderProfile } from '@/hooks/useProviders';
import { useUpdateUser } from '@/hooks/useUsers';
import { pickImage, uploadImage } from '@/lib/storage';

export default function ProviderProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const { user } = useAuthStore();

  const { data: provider, isLoading: providerLoading } = useProviderByUserId(user?.id || '');
  const updateProviderMutation = useUpdateProviderProfile();
  const updateUserMutation = useUpdateUser();

  // View/Edit mode
  const [isEditing, setIsEditing] = useState(false);

  // Business Info
  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Location
  const [address, setAddress] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  const [coordinates, setCoordinates] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
  });
  const [serviceRadius, setServiceRadius] = useState(5000);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Gallery
  const [gallery, setGallery] = useState<string[]>([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Initialize with provider data
  useEffect(() => {
    if (provider) {
      setBusinessName(provider.businessName || '');
      setBio(provider.bio || '');
      setServiceArea(provider.serviceArea || '');
      setAddress(provider.address || '');
      setProfilePicture(provider.profilePicture || null);
      setGallery(provider.gallery || []);

      if ((provider as { latitude?: number }).latitude && (provider as { longitude?: number }).longitude) {
        const coords = {
          latitude: (provider as { latitude: number }).latitude,
          longitude: (provider as { longitude: number }).longitude,
        };
        setCoordinates(coords);
        setRegion({
          ...coords,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        });
      }

      if ((provider as { serviceRadius?: number }).serviceRadius) {
        setServiceRadius((provider as { serviceRadius: number }).serviceRadius);
      }
    }

    if (user) {
      setPhoneNumber(user.phoneNumber || '');
    }
  }, [provider, user]);

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
        `provider_${provider?.id}_${Date.now()}.jpg`
      );
      setProfilePicture(result.url);
      Alert.alert('Success', 'Profile picture uploaded!');
    } catch (error: unknown) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to upload photo');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddGalleryImage = async () => {
    try {
      setUploadingGallery(true);
      const image = await pickImage();
      if (!image) {
        setUploadingGallery(false);
        return;
      }

      const result = await uploadImage(
        image.uri,
        'gallery',
        `provider_${provider?.id}_gallery_${Date.now()}.jpg`
      );
      setGallery([...gallery, result.url]);
      Alert.alert('Success', 'Image added to gallery!');
    } catch (error: unknown) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to upload image');
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleDeleteGalleryImage = (imageUrl: string) => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setGallery(gallery.filter(img => img !== imageUrl));
          },
        },
      ]
    );
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
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
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
      Alert.alert('Error', 'Failed to get your current location');
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleMapPress = async (e: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
    const coordinate = e.nativeEvent.coordinate;
    setCoordinates(coordinate);

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

    if (!businessName.trim()) {
      Alert.alert('Required', 'Please enter your business name');
      return;
    }

    try {
      setIsSaving(true);

      await Promise.all([
        updateProviderMutation.mutateAsync({
          id: provider.id,
          input: {
            businessName,
            bio,
            serviceArea,
            address,
            profilePicture: profilePicture || undefined,
            gallery,
          },
        }),
        updateUserMutation.mutateAsync({
          id: user?.id || '',
          input: {
            phoneNumber,
          },
        }),
      ]);

      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditing(false);
    } catch (error: unknown) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Revert to original provider data
    if (provider) {
      setBusinessName(provider.businessName || '');
      setBio(provider.bio || '');
      setServiceArea(provider.serviceArea || '');
      setAddress(provider.address || '');
      setProfilePicture(provider.profilePicture || null);
      setGallery(provider.gallery || []);

      if ((provider as { latitude?: number }).latitude && (provider as { longitude?: number }).longitude) {
        const coords = {
          latitude: (provider as { latitude: number }).latitude,
          longitude: (provider as { longitude: number }).longitude,
        };
        setCoordinates(coords);
        setRegion({
          ...coords,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        });
      }

      if ((provider as { serviceRadius?: number }).serviceRadius) {
        setServiceRadius((provider as { serviceRadius: number }).serviceRadius);
      }
    }

    if (user) {
      setPhoneNumber(user.phoneNumber || '');
    }

    setIsEditing(false);
  };

  if (providerLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name={isEditing ? "close" : "arrow-left"} size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Profile' : 'My Profile'}</Text>
        {!isEditing ? (
          <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editButton}>
            <MaterialCommunityIcons name="pencil" size={20} color="#FFF" />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>

      <ScrollView
        style={styles.innerContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
      >
        {!isEditing ? (
          /* VIEW MODE */
          <View style={styles.content}>
            {/* Profile Header */}
            <View style={styles.viewProfileSection}>
              {profilePicture ? (
                <Image source={{ uri: profilePicture }} style={styles.viewProfileImage} />
              ) : (
                <View style={styles.viewProfilePlaceholder}>
                  <MaterialCommunityIcons name="store" size={48} color="#3B82F6" />
                </View>
              )}
              <Text style={styles.viewBusinessName}>{provider?.businessName || 'Business Name'}</Text>
              {provider?.verified && (
                <View style={styles.verifiedBadge}>
                  <MaterialCommunityIcons name="check-decagram" size={16} color="#10B981" />
                  <Text style={styles.verifiedText}>Verified</Text>
                </View>
              )}
            </View>

            {/* Business Info */}
            <View style={styles.viewSection}>
              <Text style={styles.viewSectionTitle}>Business Information</Text>
              <View style={styles.viewInfoCard}>
                <View style={styles.viewInfoRow}>
                  <MaterialCommunityIcons name="phone" size={20} color="#3B82F6" />
                  <Text style={styles.viewInfoText}>{phoneNumber || 'No phone number'}</Text>
                </View>
                {bio && (
                  <View style={styles.viewInfoRow}>
                    <MaterialCommunityIcons name="text" size={20} color="#3B82F6" />
                    <Text style={styles.viewInfoText}>{bio}</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Location & Service Area */}
            <View style={styles.viewSection}>
              <Text style={styles.viewSectionTitle}>Location & Service Area</Text>
              <View style={styles.viewInfoCard}>
                <View style={styles.viewInfoRow}>
                  <MaterialCommunityIcons name="map-marker" size={20} color="#3B82F6" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.viewInfoLabel}>Service Area</Text>
                    <Text style={styles.viewInfoText}>{serviceArea || 'Not specified'}</Text>
                  </View>
                </View>
                {address && (
                  <View style={styles.viewInfoRow}>
                    <MaterialCommunityIcons name="home" size={20} color="#3B82F6" />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.viewInfoLabel}>Address</Text>
                      <Text style={styles.viewInfoText}>{address}</Text>
                    </View>
                  </View>
                )}
                <View style={styles.viewInfoRow}>
                  <MaterialCommunityIcons name="radius" size={20} color="#3B82F6" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.viewInfoLabel}>Service Radius</Text>
                    <Text style={styles.viewInfoText}>{(serviceRadius / 1000).toFixed(0)} km</Text>
                  </View>
                </View>
              </View>

              {/* Map Preview */}
              {coordinates && (
                <View style={styles.mapPreview}>
                  <MapView
                    style={styles.map}
                    provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
                    region={region}
                    scrollEnabled={false}
                    zoomEnabled={false}
                  >
                    <Marker coordinate={coordinates}>
                      <View style={styles.customMarker}>
                        <MaterialCommunityIcons name="store" size={28} color="#3B82F6" />
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
                </View>
              )}
            </View>

            {/* Gallery */}
            <View style={styles.viewSection}>
              <Text style={styles.viewSectionTitle}>Work Gallery</Text>
              {gallery.length === 0 ? (
                <View style={styles.emptyGallery}>
                  <MaterialCommunityIcons name="image-multiple" size={48} color="#E5E7EB" />
                  <Text style={styles.emptyGalleryText}>No photos yet</Text>
                </View>
              ) : (
                <View style={styles.galleryGrid}>
                  {gallery.map((imageUrl, index) => (
                    <View key={index} style={styles.galleryItem}>
                      <Image source={{ uri: imageUrl }} style={styles.galleryImage} />
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        ) : (
          /* EDIT MODE */
          <View style={styles.content}>
            {/* Profile Picture Section */}
            <View style={styles.profileSection}>
              <TouchableOpacity
                style={styles.profilePictureButton}
                onPress={handleUploadProfilePicture}
                disabled={uploadingImage}
              >
              {uploadingImage ? (
                <ActivityIndicator size="large" color="#3B82F6" />
              ) : profilePicture ? (
                <Image source={{ uri: profilePicture }} style={styles.profileImage} />
              ) : (
                <View style={styles.profilePlaceholder}>
                  <MaterialCommunityIcons name="camera" size={32} color="#3B82F6" />
                </View>
              )}
            </TouchableOpacity>
            <Text style={styles.profileLabel}>Business Logo/Photo</Text>
            <Text style={styles.profileHint}>Tap to change</Text>
          </View>

          {/* Business Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Business Information</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Business Name *</Text>
              <TextInput
                style={styles.input}
                value={businessName}
                onChangeText={setBusinessName}
                placeholder="Your business name"
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={bio}
                onChangeText={setBio}
                placeholder="Tell customers about your business..."
                placeholderTextColor="#999"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{bio.length}/500</Text>
            </View>

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

          {/* Location & Service Area */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location & Service Area</Text>

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

                <Circle
                  center={coordinates}
                  radius={serviceRadius}
                  fillColor="rgba(59, 130, 246, 0.1)"
                  strokeColor="rgba(59, 130, 246, 0.5)"
                  strokeWidth={2}
                />
              </MapView>

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
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Service Area Name</Text>
              <TextInput
                style={styles.input}
                value={serviceArea}
                onChangeText={setServiceArea}
                placeholder="e.g., San Francisco Bay Area"
                placeholderTextColor="#999"
              />
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
          </View>

          {/* Gallery */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Work Gallery</Text>
              <TouchableOpacity
                style={styles.addPhotoButton}
                onPress={handleAddGalleryImage}
                disabled={uploadingGallery}
              >
                {uploadingGallery ? (
                  <ActivityIndicator size="small" color="#3B82F6" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="plus" size={16} color="#3B82F6" />
                    <Text style={styles.addPhotoText}>Add Photo</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>

            {gallery.length === 0 ? (
              <View style={styles.emptyGallery}>
                <MaterialCommunityIcons name="image-multiple" size={48} color="#E5E7EB" />
                <Text style={styles.emptyGalleryText}>No photos yet</Text>
              </View>
            ) : (
              <View style={styles.galleryGrid}>
                {gallery.map((imageUrl, index) => (
                  <View key={index} style={styles.galleryItem}>
                    <Image source={{ uri: imageUrl }} style={styles.galleryImage} />
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => handleDeleteGalleryImage(imageUrl)}
                    >
                      <MaterialCommunityIcons name="close" size={16} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
        )}
      </ScrollView>
    

    
      {isEditing && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            disabled={isSaving}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
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
      )}
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
  },
  content: {
    padding: 20,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
    paddingTop: 20,
  },
  profilePictureButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    marginBottom: 12,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  profilePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  profileLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  profileHint: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
  section: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    fontFamily: 'NunitoSans_700Bold',
  },
  inputGroup: {
    marginBottom: 16,
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
    minHeight: 100,
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
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
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
    bottom: 12,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
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
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
  },
  addPhotoText: {
    fontSize: 13,
    color: '#3B82F6',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  emptyGallery: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  emptyGalleryText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
    fontFamily: 'NunitoSans_400Regular',
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  galleryItem: {
    width: '31%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  deleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFF',
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    fontFamily: 'NunitoSans_700Bold',
  },
  saveButton: {
    flex: 1,
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
  editButton: {
    padding: 8,
  },
  // View Mode Styles
  viewProfileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  viewProfileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  viewProfilePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  viewBusinessName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'NunitoSans_700Bold',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  viewSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  viewSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 12,
    fontFamily: 'NunitoSans_700Bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  viewInfoCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    gap: 16,
  },
  viewInfoRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  viewInfoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
  viewInfoText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'NunitoSans_400Regular',
    flex: 1,
  },
  mapPreview: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 16,
  },
});
