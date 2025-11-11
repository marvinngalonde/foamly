import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Text, Card, Button, Chip } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useProvider } from '@/hooks/useProviders';
import { useProviderServices } from '@/hooks/useServices';
import { useBookingStore } from '@/stores/bookingStore';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

type TabType = 'description' | 'services' | 'location' | 'reviews';

export default function ProviderProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('description');
  const [providerLocation, setProviderLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [liked, setLiked] = useState(false);

  const { data: provider, isLoading: providerLoading } = useProvider(id || '');
  const { data: services = [], isLoading: servicesLoading } = useProviderServices(id || '');
  const { setSelectedProvider } = useBookingStore();

  // Geocode provider address to get coordinates
  useEffect(() => {
    (async () => {
      if (provider?.address) {
        try {
          const geocoded = await Location.geocodeAsync(provider.address);
          if (geocoded.length > 0) {
            setProviderLocation({
              latitude: geocoded[0].latitude,
              longitude: geocoded[0].longitude,
            });
          }
        } catch (error) {
          console.error('Error geocoding address:', error);
        }
      }
    })();
  }, [provider?.address]);

  // Mock promotions data
  const promotions = [
    { id: '1', title: '30% OFF', code: 'Wash120', icon: 'tag-outline', color: '#3B82F6' },
    { id: '2', title: '10% OFF', code: 'New', icon: 'cash', color: '#10B981' },
  ];

  // Mock service icons
  const serviceIcons = [
    { id: '1', name: 'Car Wash', icon: 'car-wash' },
    { id: '2', name: 'Car Polish', icon: 'polish' },
    { id: '3', name: 'Interior Wash', icon: 'car-seat' },
    { id: '4', name: 'Engine Wash', icon: 'engine' },
  ];

  // Mock service list
  const serviceList = [
    { id: '1', name: 'Car Wash' },
    { id: '2', name: 'Car Polish' },
    { id: '3', name: 'Interior Wash' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'description':
        return (
          <View style={styles.tabContent}>
            <Text style={styles.descriptionText}>
              {provider?.bio || 'Professional car wash service with attention to detail. We provide premium cleaning services for all vehicle types.'}
            </Text>
            <View style={styles.serviceIcons}>
              {serviceIcons.map((service) => (
                <View key={service.id} style={styles.serviceIconItem}>
                  <View style={styles.iconContainer}>
                    <MaterialCommunityIcons name={service.icon as any} size={32} color="#3B82F6" />
                  </View>
                  <Text style={styles.serviceIconText}>{service.name}</Text>
                </View>
              ))}
            </View>
            <View style={styles.serviceList}>
              {serviceList.map((service) => (
                <View key={service.id} style={styles.serviceListItem}>
                  <MaterialCommunityIcons name="check-circle" size={20} color="#10B981" />
                  <Text style={styles.serviceListText}>{service.name}</Text>
                </View>
              ))}
            </View>
          </View>
        );

      case 'services':
        return (
          <View style={styles.tabContent}>
            {servicesLoading ? (
              <ActivityIndicator color="#3B82F6" style={{ marginTop: 20 }} />
            ) : services.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialCommunityIcons name="clipboard-text-off" size={48} color="#CCC" />
                <Text style={styles.emptyText}>No services available</Text>
              </View>
            ) : (
              services.map((service) => (
                <Card key={service.id} style={styles.serviceCard}>
                  <Card.Content>
                    <View style={styles.serviceHeader}>
                      <View style={styles.serviceInfo}>
                        <Text style={styles.serviceName}>{service.name}</Text>
                        <Text style={styles.serviceDescription}>{service.description}</Text>
                        <View style={styles.serviceMeta}>
                          <Chip mode="flat" style={styles.chip}>
                            <MaterialCommunityIcons name="clock-outline" size={14} color="#666" />
                            <Text style={styles.chipText}> {service.duration}</Text>
                          </Chip>
                          <Text style={styles.servicePrice}>${parseFloat(service.price).toFixed(2)}</Text>
                        </View>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              ))
            )}
          </View>
        );

      case 'location':
        return (
          <View style={styles.tabContent}>
            <View style={styles.locationInfo}>
              <View style={styles.locationHeader}>
                <MaterialCommunityIcons name="map-marker" size={24} color="#3B82F6" />
                <View style={styles.addressContainer}>
                  <Text style={styles.addressLabel}>Service Area</Text>
                  <Text style={styles.addressText}>{provider?.serviceArea || 'Not specified'}</Text>
                </View>
              </View>
              {provider?.address && (
                <View style={styles.locationHeader}>
                  <MaterialCommunityIcons name="map-marker-radius" size={24} color="#10B981" />
                  <View style={styles.addressContainer}>
                    <Text style={styles.addressLabel}>Address</Text>
                    <Text style={styles.addressText}>{provider.address}</Text>
                  </View>
                </View>
              )}
            </View>
            {providerLocation && (
              <View style={styles.mapSection}>
                <View style={styles.miniMapPlaceholder}>
                  <MaterialCommunityIcons name="map-marker" size={48} color="#3B82F6" />
                  <Text style={styles.coordinatesText}>
                    {providerLocation.latitude.toFixed(4)}, {providerLocation.longitude.toFixed(4)}
                  </Text>
                  <Text style={styles.mapHint}>Location on map</Text>
                </View>
              </View>
            )}
          </View>
        );

      case 'reviews':
        return (
          <View style={styles.tabContent}>
            <View style={styles.ratingOverview}>
              <Text style={styles.ratingNumber}>{parseFloat(provider?.rating || '5.0').toFixed(1)}</Text>
              <MaterialCommunityIcons name="star" size={24} color="#FFA500" />
              <Text style={styles.reviewsCount}>({provider?.totalReviews || 134} reviews)</Text>
            </View>
            {/* Add review list here */}
            <View style={styles.reviewsPlaceholder}>
              <MaterialCommunityIcons name="message-text" size={48} color="#E5E7EB" />
              <Text style={styles.reviewsPlaceholderText}>Customer reviews will appear here</Text>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  if (providerLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 16, color: '#666' }}>Loading provider...</Text>
      </SafeAreaView>
    );
  }

  if (!provider) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <MaterialCommunityIcons name="alert-circle" size={64} color="#EF4444" />
        <Text style={styles.errorText}>Provider not found</Text>
        <Button onPress={() => router.back()}>Go Back</Button>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Back and Like Buttons - Fixed Position */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#FFF"
            />
          </TouchableOpacity>

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
        {/* Header Image */}
        <View style={styles.headerImageContainer}>
          {provider.profilePicture ? (
            <Image
              source={{ uri: provider.profilePicture }}
              style={styles.headerImage}
            />
          ) : (
            <View style={[styles.headerImage, styles.headerImagePlaceholder]}>
              <Text style={styles.headerInitial}>
                {provider.businessName.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>
        {/* Service Details */}
        <View style={styles.providerInfoSection}>
          <Text style={styles.providerName}>{provider.businessName}</Text>
          {provider.verified && (
            <View style={styles.verifiedBadge}>
              <MaterialCommunityIcons name="check-decagram" size={16} color="#10B981" />
              <Text style={styles.verifiedText}>Verified</Text>
            </View>
          )}
          <View style={styles.ratingLocation}>
            <View style={styles.rating}>
              <MaterialCommunityIcons name="star" size={16} color="#FFA500" />
              <Text style={styles.ratingText}>{parseFloat(provider.rating).toFixed(1)}</Text>
              <Text style={styles.reviewsText}>({provider.totalReviews})</Text>
            </View>
            <View style={styles.locationRow}>
              <MaterialCommunityIcons name="map-marker" size={16} color="#666" />
              <Text style={styles.locationTextSmall} numberOfLines={1}>
                {provider.address ? provider.address.split(',')[0] : provider.serviceArea}
              </Text>
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
            { id: 'description' as TabType, label: 'Description' },
            { id: 'services' as TabType, label: 'Service' },
            { id: 'location' as TabType, label: 'Location' },
            { id: 'reviews' as TabType, label: 'Reviews' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.activeTab]}
              onPress={() => setActiveTab(tab.id)}
            >
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
            onPress={() => {
              if (provider) {
                setSelectedProvider(provider);
                router.push('/booking/service-selection');
              }
            }}
            buttonColor="#3B82F6"
          >
            Book Now
          </Button>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF',
  },
  container: {
    flex: 1,
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
  headerImagePlaceholder: {
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInitial: {
    fontSize: 80,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'NunitoSans_700Bold',
  },
  buttonRow: {
    position: 'absolute',
    top: 10,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  likeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  providerInfoSection: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  providerName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
    fontFamily: 'NunitoSans_700Bold',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  verifiedText: {
    fontSize: 13,
    color: '#10B981',
    fontWeight: '600',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  ratingLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  reviewsText: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'NunitoSans_400Regular',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  locationTextSmall: {
    fontSize: 14,
    color: '#6B7280',
    fontFamily: 'NunitoSans_400Regular',
    flex: 1,
  },
  promotions: {
    padding: 24,
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
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 16,
  },
  activeTab: {
    borderBottomWidth: 3,
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  activeTabText: {
    color: '#3B82F6',
    fontFamily: 'NunitoSans_700Bold',
  },
  tabContent: {
    padding: 24,
  },
  descriptionText: {
    fontSize: 15,
    color: '#6B7280',
    lineHeight: 24,
    marginBottom: 24,
    fontFamily: 'NunitoSans_400Regular',
  },
  serviceIcons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  serviceIconItem: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceIconText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  serviceList: {
    gap: 12,
  },
  serviceListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  serviceListText: {
    fontSize: 14,
    color: '#6B7280',
  },
  serviceCard: {
    marginBottom: 12,
    elevation: 1,
    overflow: 'hidden',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  serviceDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  serviceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chip: {
    height: 28,
  },
  chipText: {
    fontSize: 12,
    color: '#666',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  locationInfo: {
    marginBottom: 24,
    gap: 20,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 12,
  },
  addressContainer: {
    flex: 1,
  },
  addressLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  addressText: {
    fontSize: 15,
    color: '#1F2937',
    lineHeight: 22,
    fontFamily: 'NunitoSans_400Regular',
  },
  mapSection: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
  },
  miniMapPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  coordinatesText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },
  mapHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  ratingOverview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
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
  reviewsPlaceholder: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  reviewsPlaceholderText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    marginBottom: 20,
  },
  bottomPadding: {
    height: 40,
  },
  footer: {
    padding: 16,
    backgroundColor: '#ffffff',
    
  },
  bookButton: {
    borderRadius: 8,
    paddingVertical: 4,
  },
  bookButtonLabel: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'NunitoSans_600SemiBold',
  },
});