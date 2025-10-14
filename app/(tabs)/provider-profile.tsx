import { View, StyleSheet, ScrollView, TouchableOpacity, Image, Alert, ActivityIndicator, FlatList } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useProviderByUserId, useUpdateProviderProfile } from '@/hooks/useProviders';
import { useUpdateUser } from '@/hooks/useUsers';
import { pickImage, uploadImage } from '@/lib/storage';

type TabType = 'gallery' | 'services' | 'reviews' | 'about';

export default function ProviderProfileScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: provider, isLoading } = useProviderByUserId(user?.id || '');
  const updateProfileMutation = useUpdateProviderProfile();
  const updateUserMutation = useUpdateUser();

  const [activeTab, setActiveTab] = useState<TabType>('gallery');
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
  const [liked, setLiked] = useState(false);

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

      const result = await uploadImage(image.uri, 'profile_pics', `provider_${provider?.id}_${Date.now()}.jpg`);
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

      const result = await uploadImage(image.uri, 'gallery', `provider_${provider?.id}_gallery_${Date.now()}.jpg`);
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
      await Promise.all([
        updateProfileMutation.mutateAsync({
          id: provider?.id || '',
          input: { businessName, bio, serviceArea, address, gallery: galleryImages },
        }),
        updateUserMutation.mutateAsync({
          id: user?.id || '',
          input: { firstName, lastName, phoneNumber },
        }),
      ]);
      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update profile');
    }
  };

  // Mock services data
  const services = [
    { id: '1', name: 'Car Wash', icon: 'car-wash', description: 'Complete exterior wash' },
    { id: '2', name: 'Car Polish', icon: 'polish', description: 'Professional polishing' },
    { id: '3', name: 'Interior Wash', icon: 'car-seat', description: 'Deep interior cleaning' },
    { id: '4', name: 'Engine Wash', icon: 'engine', description: 'Engine bay cleaning' },
  ];

  // Mock promotions
  const promotions = [
    { id: '1', title: '30% OFF', code: 'Wash120', icon: 'tag-outline', color: '#3B82F6' },
    { id: '2', title: '10% OFF', code: 'New', icon: 'cash', color: '#10B981' },
  ];

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 16, color: '#666' }}>Loading profile...</Text>
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

  const renderTabContent = () => {
    switch (activeTab) {
      case 'gallery':
        return (
          <View style={styles.tabContent}>
            <View style={styles.galleryHeader}>
              <Text style={styles.galleryTitle}>Work Gallery</Text>
              <TouchableOpacity 
                style={styles.addPhotoButton}
                onPress={handleAddGalleryImage}
                disabled={uploadingGallery}
              >
                {uploadingGallery ? (
                  <ActivityIndicator size="small" color="#3B82F6" />
                ) : (
                  <MaterialCommunityIcons name="plus" size={20} color="#3B82F6" />
                )}
                <Text style={styles.addPhotoText}>Add Photo</Text>
              </TouchableOpacity>
            </View>
            
            {galleryImages.length === 0 ? (
              <View style={styles.emptyGallery}>
                <MaterialCommunityIcons name="image-multiple" size={64} color="#E5E7EB" />
                <Text style={styles.emptyGalleryText}>No photos yet</Text>
                <Text style={styles.emptyGallerySubtext}>Add photos to showcase your work</Text>
              </View>
            ) : (
              <View style={styles.galleryGrid}>
                {galleryImages.map((imageUrl, index) => (
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
        );

      case 'services':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.servicesTitle}>Our Services</Text>
            <View style={styles.servicesGrid}>
              {services.map((service) => (
                <View key={service.id} style={styles.serviceCard}>
                  <View style={styles.serviceIcon}>
                    <MaterialCommunityIcons name={service.icon as any} size={32} color="#3B82F6" />
                  </View>
                  <Text style={styles.serviceName}>{service.name}</Text>
                  <Text style={styles.serviceDescription}>{service.description}</Text>
                </View>
              ))}
            </View>
          </View>
        );

      case 'reviews':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.reviewsTitle}>Customer Reviews</Text>
            <View style={styles.ratingOverview}>
              <Text style={styles.ratingNumber}>{parseFloat(provider.rating).toFixed(1)}</Text>
              <MaterialCommunityIcons name="star" size={24} color="#FFA500" />
              <Text style={styles.reviewsCount}>({provider.totalReviews} reviews)</Text>
            </View>
            {/* Add review list here */}
          </View>
        );

      case 'about':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.aboutTitle}>About Us</Text>
            <Text style={styles.aboutText}>{provider.bio || 'No description provided.'}</Text>
            <View style={styles.infoSection}>
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="map-marker" size={20} color="#666" />
                <Text style={styles.infoText}>{provider.serviceArea}</Text>
              </View>
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="phone" size={20} color="#666" />
                <Text style={styles.infoText}>{user?.phoneNumber}</Text>
              </View>
              <View style={styles.infoItem}>
                <MaterialCommunityIcons name="email" size={20} color="#666" />
                <Text style={styles.infoText}>{user?.email}</Text>
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Image with Like Button */}
      <View style={styles.headerImageContainer}>
        <Image 
          source={{ uri: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800' }} 
          style={styles.headerImage}
        />
        <TouchableOpacity 
          style={styles.likeButton}
          onPress={() => setLiked(!liked)}
        >
          <MaterialCommunityIcons 
            name={liked ? "heart" : "heart-outline"} 
            size={28} 
            color={liked ? "#DC2626" : "#FFF"} 
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Service Details */}
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName}>{provider.businessName}</Text>
          <View style={styles.ratingLocation}>
            <View style={styles.rating}>
              <MaterialCommunityIcons name="star" size={16} color="#FFA500" />
              <Text style={styles.ratingText}>5.0</Text>
              <Text style={styles.reviewsText}>(134)</Text>
            </View>
            <View style={styles.location}>
              <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
              <Text style={styles.locationText}>24 Green Street · 2km</Text>
            </View>
          </View>
        </View>

        {/* Promotions */}
        <View style={styles.promotions}>
          {promotions.map((promo) => (
            <View key={promo.id} style={[styles.promoCard, { borderLeftColor: promo.color }]}>
              <MaterialCommunityIcons name={promo.icon as any} size={20} color={promo.color} />
              <View style={styles.promoText}>
                <Text style={styles.promoTitle}>{promo.title}</Text>
                <Text style={styles.promoCode}>use code {promo.code}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Navigation Tabs */}
        <View style={styles.tabs}>
          {[
            { id: 'gallery' as TabType, label: 'Gallery', icon: 'image-multiple' },
            { id: 'services' as TabType, label: 'Services', icon: 'car-wash' },
            { id: 'reviews' as TabType, label: 'Reviews', icon: 'star' },
            { id: 'about' as TabType, label: 'About', icon: 'information' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
              <MaterialCommunityIcons 
                name={tab.icon as any} 
                size={20} 
                color={activeTab === tab.id ? '#3B82F6' : '#666'} 
              />
              <Text style={[styles.tabText, activeTab === tab.id && styles.activeTabText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {renderTabContent()}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Book Now Button */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          style={styles.bookButton}
          labelStyle={styles.bookButtonLabel}
          onPress={() => router.push('/booking/service-selection')}
          buttonColor="#3B82F6"
        >
          Book Now
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerImageContainer: {
    position: 'relative',
    height: 300,
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  likeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  serviceInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  // serviceName: {
  //   fontSize: 24,
  //   fontWeight: 'bold',
  //   color: '#1F2937',
  //   marginBottom: 8,
  // },
  ratingLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  reviewsText: {
    fontSize: 14,
    color: '#6B7280',
  },
  location: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationText: {
    fontSize: 14,
    color: '#6B7280',
  },
  promotions: {
    padding: 20,
    flexDirection: 'row',
    gap: 12,
  },
  promoCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    gap: 12,
  },
  promoText: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 2,
  },
  promoCode: {
    fontSize: 12,
    color: '#6B7280',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
    gap: 6,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3B82F6',
  },
  tabContent: {
    padding: 20,
  },
  galleryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  galleryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
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
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  emptyGallery: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyGalleryText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
    marginBottom: 4,
  },
  emptyGallerySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  galleryItem: {
    width: '48%',
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  servicesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  servicesGrid: {
    gap: 16,
  },
  serviceCard: {
    backgroundColor: '#F8FAFC',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  serviceIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  reviewsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  ratingOverview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  ratingNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  reviewsCount: {
    fontSize: 16,
    color: '#6B7280',
  },
  aboutTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  aboutText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 20,
  },
  infoSection: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  bookButton: {
    borderRadius: 12,
    paddingVertical: 8,
  },
  bookButtonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },
});