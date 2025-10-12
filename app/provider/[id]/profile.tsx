import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Text, Card, Button, Chip } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useProvider } from '@/hooks/useProviders';
import { useProviderServices } from '@/hooks/useServices';
import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export default function ProviderProfileScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [providerLocation, setProviderLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const { data: provider, isLoading: providerLoading } = useProvider(id || '');
  const { data: services = [], isLoading: servicesLoading } = useProviderServices(id || '');

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

  if (providerLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 16, color: '#666' }}>Loading provider...</Text>
      </View>
    );
  }

  if (!provider) {
    return (
      <View style={[styles.container, styles.centered]}>
        <MaterialCommunityIcons name="alert-circle" size={64} color="#EF4444" />
        <Text style={styles.errorText}>Provider not found</Text>
        <Button onPress={() => router.back()}>Go Back</Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Provider Profile</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Provider Info Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              {provider.user?.profilePicture ? (
                <Image
                  source={{ uri: provider.user.profilePicture }}
                  style={styles.avatar}
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <MaterialCommunityIcons name="account" size={48} color="#3B82F6" />
                </View>
              )}
              {provider.verified && (
                <View style={styles.verifiedBadge}>
                  <MaterialCommunityIcons name="check-decagram" size={24} color="#10B981" />
                </View>
              )}
            </View>

            <View style={styles.providerInfo}>
              <Text style={styles.businessName}>{provider.businessName}</Text>
              <Text style={styles.serviceArea}>{provider.serviceArea}</Text>

              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="star" size={16} color="#FFA500" />
                  <Text style={styles.statText}>{parseFloat(provider.rating).toFixed(1)}</Text>
                </View>
                <View style={styles.statItem}>
                  <MaterialCommunityIcons name="message-text" size={16} color="#666" />
                  <Text style={styles.statText}>{provider.totalReviews} reviews</Text>
                </View>
              </View>
            </View>
          </View>

          {provider.bio && (
            <View style={styles.bioSection}>
              <Text style={styles.sectionTitle}>About</Text>
              <Text style={styles.bioText}>{provider.bio}</Text>
            </View>
          )}

          {provider.address && (
            <View style={styles.bioSection}>
              <Text style={styles.sectionTitle}>Location</Text>
              <View style={styles.contactRow}>
                <MaterialCommunityIcons name="map-marker" size={20} color="#666" />
                <Text style={styles.bioText}>{provider.address}</Text>
              </View>
              {providerLocation && (
                <View style={styles.mapSection}>
                  <View style={styles.miniMapPlaceholder}>
                    <MaterialCommunityIcons name="map-marker" size={48} color="#3B82F6" />
                    <Text style={styles.coordinatesText}>
                      {providerLocation.latitude.toFixed(4)}, {providerLocation.longitude.toFixed(4)}
                    </Text>
                    <Text style={styles.mapHint}>Location coordinates</Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Services Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Services Offered</Text>
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
                {service.imageUrl && (
                  <Image
                    source={{ uri: service.imageUrl }}
                    style={styles.serviceCardImage}
                  />
                )}
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
                      </View>
                    </View>
                    <View style={styles.priceContainer}>
                      <Text style={styles.price}>${parseFloat(service.price).toFixed(2)}</Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))
          )}
        </View>

        {/* Gallery Section */}
        {provider.gallery && provider.gallery.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Gallery</Text>
            <View style={styles.galleryGrid}>
              {provider.gallery.map((imageUrl, index) => (
                <View key={index} style={styles.galleryImageContainer}>
                  <Image source={{ uri: imageUrl }} style={styles.galleryImage} />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Contact Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          {provider.user && (
            <>
              <View style={styles.contactRow}>
                <MaterialCommunityIcons name="email" size={20} color="#666" />
                <Text style={styles.contactText}>{provider.user.email}</Text>
              </View>
              <View style={styles.contactRow}>
                <MaterialCommunityIcons name="phone" size={20} color="#666" />
                <Text style={styles.contactText}>{provider.user.phoneNumber}</Text>
              </View>
            </>
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Book Button */}
      <View style={styles.footer}>
        <Button
          mode="contained"
          buttonColor="#3B82F6"
          onPress={() => router.push('/booking/service-selection')}
          style={styles.bookButton}
        >
          Book Service
        </Button>
      </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'NunitoSans_700Bold',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 16,
    padding: 20,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  providerInfo: {
    flex: 1,
  },
  businessName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'NunitoSans_700Bold',
  },
  serviceArea: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    fontFamily: 'NunitoSans_400Regular',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  bioSection: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  mapSection: {
    marginTop: 12,
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
    fontFamily: 'NunitoSans_700Bold',
  },
  mapHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontFamily: 'NunitoSans_400Regular',
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    fontFamily: 'NunitoSans_700Bold',
  },
  bioText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    fontFamily: 'NunitoSans_400Regular',
  },
  section: {
    marginTop: 16,
    marginHorizontal: 20,
  },
  serviceCard: {
    marginBottom: 12,
    elevation: 1,
    overflow: 'hidden',
  },
  serviceCardImage: {
    width: '100%',
    height: 150,
    resizeMode: 'cover',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  serviceInfo: {
    flex: 1,
    marginRight: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'NunitoSans_700Bold',
  },
  serviceDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    fontFamily: 'NunitoSans_400Regular',
  },
  serviceMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  chip: {
    height: 28,
  },
  chipText: {
    fontSize: 12,
    color: '#666',
  },
  priceContainer: {
    justifyContent: 'center',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3B82F6',
    fontFamily: 'NunitoSans_700Bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
    fontFamily: 'NunitoSans_400Regular',
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    marginBottom: 20,
    fontFamily: 'NunitoSans_400Regular',
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  contactText: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'NunitoSans_400Regular',
  },
  galleryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  galleryImageContainer: {
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
  bottomPadding: {
    height: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  bookButton: {
    borderRadius: 12,
  },
});
