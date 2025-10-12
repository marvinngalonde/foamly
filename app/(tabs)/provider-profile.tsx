import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useProviderByUserId, useUpdateProviderProfile } from '@/hooks/useProviders';
import { useUpdateUser } from '@/hooks/useUsers';
import { pickImage, uploadImage } from '@/lib/storage';

export default function ProviderProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: provider, isLoading } = useProviderByUserId(user?.id || '');
  const updateProfileMutation = useUpdateProviderProfile();
  const updateUserMutation = useUpdateUser();

  const [isEditing, setIsEditing] = useState(false);
  const [businessName, setBusinessName] = useState('');
  const [bio, setBio] = useState('');
  const [serviceArea, setServiceArea] = useState('');
  const [address, setAddress] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Initialize form when provider data loads
  useEffect(() => {
    if (provider) {
      setBusinessName(provider.businessName);
      setBio(provider.bio || '');
      setServiceArea(provider.serviceArea);
      setAddress(provider.address || '');
      setGalleryImages(provider.gallery || []);
    }
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setPhoneNumber(user.phoneNumber);
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

      // Upload to Supabase
      const result = await uploadImage(image.uri, 'profile_pics', `provider_${provider?.id}_${Date.now()}.jpg`);

      // Update provider profile
      await updateProfileMutation.mutateAsync({
        id: provider?.id || '',
        input: { profilePicture: result.url },
      });

      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', error.message || 'Failed to upload photo');
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

      // Upload to Supabase
      const result = await uploadImage(image.uri, 'gallery', `provider_${provider?.id}_gallery_${Date.now()}.jpg`);

      // Update gallery in provider profile
      const updatedGallery = [...galleryImages, result.url];
      setGalleryImages(updatedGallery);

      await updateProfileMutation.mutateAsync({
        id: provider?.id || '',
        input: { gallery: updatedGallery },
      });

      Alert.alert('Success', 'Image added to gallery!');
    } catch (error: any) {
      console.error('Error uploading gallery image:', error);
      Alert.alert('Error', error.message || 'Failed to upload image');
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleDeleteGalleryImage = async (imageUrl: string) => {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedGallery = galleryImages.filter(img => img !== imageUrl);
              setGalleryImages(updatedGallery);

              await updateProfileMutation.mutateAsync({
                id: provider?.id || '',
                input: { gallery: updatedGallery },
              });

              Alert.alert('Success', 'Image deleted from gallery!');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete image');
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    try {
      // Update both provider profile and user info
      await Promise.all([
        updateProfileMutation.mutateAsync({
          id: provider?.id || '',
          input: {
            businessName,
            bio,
            serviceArea,
            address,
            gallery: galleryImages,
          },
        }),
        updateUserMutation.mutateAsync({
          id: user?.id || '',
          input: {
            firstName,
            lastName,
            phoneNumber,
          },
        }),
      ]);

      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 16 }}>Loading profile...</Text>
      </View>
    );
  }

  if (!provider) {
    return (
      <View style={[styles.container, styles.centered]}>
        <MaterialCommunityIcons name="alert-circle" size={64} color="#DC2626" />
        <Text style={{ marginTop: 16, color: '#DC2626' }}>Provider profile not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/(tabs)')} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Provider Profile</Text>
        <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
          <MaterialCommunityIcons
            name={isEditing ? 'close' : 'pencil'}
            size={24}
            color="#FFF"
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {provider.user?.profilePicture ? (
              <Image
                source={{ uri: provider.user.profilePicture }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <MaterialCommunityIcons name="store" size={64} color="#3B82F6" />
              </View>
            )}
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={handleUploadProfilePicture}
              disabled={uploadingImage}
            >
              {uploadingImage ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <MaterialCommunityIcons name="camera" size={20} color="#FFF" />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.ratingContainer}>
            <MaterialCommunityIcons name="star" size={20} color="#FFA500" />
            <Text style={styles.rating}>{parseFloat(provider.rating).toFixed(1)}</Text>
            <Text style={styles.reviews}>({provider.totalReviews} reviews)</Text>
          </View>

          {provider.verified && (
            <View style={styles.verifiedBadge}>
              <MaterialCommunityIcons name="check-decagram" size={16} color="#10B981" />
              <Text style={styles.verifiedText}>Verified Provider</Text>
            </View>
          )}
        </View>

        {/* Profile Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Information</Text>

          {isEditing ? (
            <>
              <TextInput
                label="Business Name"
                value={businessName}
                onChangeText={setBusinessName}
                style={styles.input}
                mode="outlined"
                outlineColor="#E5E7EB"
                activeOutlineColor="#3B82F6"
              />
              <TextInput
                label="Bio"
                value={bio}
                onChangeText={setBio}
                style={styles.input}
                mode="outlined"
                outlineColor="#E5E7EB"
                activeOutlineColor="#3B82F6"
                multiline
                numberOfLines={4}
              />
              <TextInput
                label="Service Area"
                value={serviceArea}
                onChangeText={setServiceArea}
                style={styles.input}
                mode="outlined"
                outlineColor="#E5E7EB"
                activeOutlineColor="#3B82F6"
              />
              <TextInput
                label="Business Address"
                value={address}
                onChangeText={setAddress}
                style={styles.input}
                mode="outlined"
                outlineColor="#E5E7EB"
                activeOutlineColor="#3B82F6"
                multiline
                numberOfLines={2}
              />
            </>
          ) : (
            <>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="store" size={20} color="#666" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Business Name</Text>
                  <Text style={styles.infoValue}>{provider.businessName}</Text>
                </View>
              </View>

              {provider.bio && (
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="text" size={20} color="#666" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>About</Text>
                    <Text style={styles.infoValue}>{provider.bio}</Text>
                  </View>
                </View>
              )}

              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="map-marker" size={20} color="#666" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Service Area</Text>
                  <Text style={styles.infoValue}>{provider.serviceArea}</Text>
                </View>
              </View>

              {provider.address && (
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="home-map-marker" size={20} color="#666" />
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>Business Address</Text>
                    <Text style={styles.infoValue}>{provider.address}</Text>
                  </View>
                </View>
              )}
            </>
          )}
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          {isEditing ? (
            <>
              <TextInput
                label="First Name"
                value={firstName}
                onChangeText={setFirstName}
                style={styles.input}
                mode="outlined"
                outlineColor="#E5E7EB"
                activeOutlineColor="#3B82F6"
              />
              <TextInput
                label="Last Name"
                value={lastName}
                onChangeText={setLastName}
                style={styles.input}
                mode="outlined"
                outlineColor="#E5E7EB"
                activeOutlineColor="#3B82F6"
              />
              <TextInput
                label="Phone Number"
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                style={styles.input}
                mode="outlined"
                outlineColor="#E5E7EB"
                activeOutlineColor="#3B82F6"
                keyboardType="phone-pad"
              />
              <TextInput
                label="Email"
                value={user?.email || ''}
                style={styles.input}
                mode="outlined"
                outlineColor="#E5E7EB"
                activeOutlineColor="#3B82F6"
                disabled
                editable={false}
              />
              <Text style={styles.fieldHint}>Email cannot be changed</Text>

              <View style={styles.buttonRow}>
                <Button
                  mode="outlined"
                  onPress={() => setIsEditing(false)}
                  style={[styles.button, styles.cancelButton]}
                  textColor="#666"
                >
                  Cancel
                </Button>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  style={[styles.button, styles.saveButton]}
                  buttonColor="#3B82F6"
                  loading={updateProfileMutation.isPending || updateUserMutation.isPending}
                >
                  Save Changes
                </Button>
              </View>
            </>
          ) : (
            <>
              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="account" size={20} color="#666" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Full Name</Text>
                  <Text style={styles.infoValue}>{user?.firstName} {user?.lastName}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="email" size={20} color="#666" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{user?.email}</Text>
                </View>
              </View>

              <View style={styles.infoRow}>
                <MaterialCommunityIcons name="phone" size={20} color="#666" />
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{user?.phoneNumber}</Text>
                </View>
              </View>
            </>
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{provider.totalReviews}</Text>
              <Text style={styles.statLabel}>Reviews</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{parseFloat(provider.rating).toFixed(1)}</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{provider.verified ? 'Yes' : 'No'}</Text>
              <Text style={styles.statLabel}>Verified</Text>
            </View>
          </View>
        </View>

        {/* Gallery Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Gallery</Text>
            <TouchableOpacity onPress={handleAddGalleryImage} disabled={uploadingGallery}>
              {uploadingGallery ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : (
                <MaterialCommunityIcons name="plus" size={24} color="#3B82F6" />
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.galleryGrid}>
            {galleryImages.length === 0 ? (
              <View style={styles.galleryPlaceholder}>
                <MaterialCommunityIcons name="image-plus" size={48} color="#CCC" />
                <Text style={styles.galleryPlaceholderText}>Add photos to showcase your work</Text>
              </View>
            ) : (
              <>
                {galleryImages.map((imageUrl, index) => (
                  <View key={index} style={styles.galleryImageContainer}>
                    <Image source={{ uri: imageUrl }} style={styles.galleryImage} />
                    <TouchableOpacity
                      style={styles.deleteImageButton}
                      onPress={() => handleDeleteGalleryImage(imageUrl)}
                    >
                      <MaterialCommunityIcons name="close-circle" size={24} color="#DC2626" />
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#3B82F6',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
  content: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: '#FFF',
    paddingVertical: 32,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rating: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 6,
    fontFamily: 'NunitoSans_700Bold',
  },
  reviews: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  verifiedText: {
    fontSize: 12,
    color: '#10B981',
    marginLeft: 4,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  section: {
    backgroundColor: '#FFF',
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
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
  input: {
    marginBottom: 16,
    backgroundColor: '#FFF',
  },
  fieldHint: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: -12,
    marginBottom: 16,
    fontFamily: 'NunitoSans_400Regular',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
  },
  cancelButton: {
    borderColor: '#E5E7EB',
  },
  saveButton: {},
  infoRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
  infoValue: {
    fontSize: 15,
    color: '#333',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'NunitoSans_700Bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'NunitoSans_400Regular',
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  galleryPlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
  },
  galleryPlaceholderText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
    fontFamily: 'NunitoSans_400Regular',
  },
  galleryImageContainer: {
    position: 'relative',
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  galleryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  deleteImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bottomPadding: {
    height: 40,
  },
});
