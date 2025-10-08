import { View, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useServices } from '@/hooks/useServices';
import { useCustomerBookings } from '@/hooks/useBookings';
import { useProviders } from '@/hooks/useProviders';
import { useMemo } from 'react';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  // Fetch data from backend
  const { data: services = [], isLoading: servicesLoading } = useServices();
  const { data: bookings = [], isLoading: bookingsLoading } = useCustomerBookings(user?.id || '');
  const { data: providers = [], isLoading: providersLoading } = useProviders();

  // Get time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };


  // Get featured services (top 3 by rating)
  const featuredServices = useMemo(() => {
    return services
      .slice(0, 3)
      .map(service => ({
        id: service.id,
        name: service.name,
        price: parseFloat(service.price),
        rating: service.provider ? parseFloat(service.provider.rating) : 0,
        imageUrl: (service as any).imageUrl,
      }));
  }, [services]);

  // Get recent bookings (upcoming + recent)
  const recentBookings = useMemo(() => {
    return bookings
      .slice(0, 2)
      .map(booking => ({
        id: booking.id,
        service: booking.service?.name || 'Service',
        date: new Date(booking.scheduledDate).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit'
        }),
        status: booking.status.charAt(0).toUpperCase() + booking.status.slice(1),
        statusColor: booking.status === 'confirmed' ? '#10B981' :
                     booking.status === 'pending' ? '#F59E0B' :
                     booking.status === 'in_progress' ? '#3B82F6' :
                     booking.status === 'completed' ? '#10B981' : '#DC2626',
      }));
  }, [bookings]);

  // Get top providers
  const recommendedProviders = useMemo(() => {
    return providers
      .slice(0, 2)
      .map(provider => ({
        id: provider.id,
        name: provider.businessName,
        rating: parseFloat(provider.rating),
        distance: '2.5 km', // TODO: Calculate actual distance
        specialty: (provider as any).serviceArea,
        reviews: parseInt(provider.totalReviews),
        profilePicture: (provider as any).profilePicture,
      }));
  }, [providers]);

  return (
    <View style={styles.container}>
      {/* Fixed Header with Greeting */}
      <View style={styles.header}>
        <View style={styles.greetingContainer}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}, {user?.firstName || 'Guest'}!</Text>
            <Text style={styles.subGreeting}>Ready to make your car shine?</Text>
          </View>
          <TouchableOpacity style={styles.avatar} onPress={() => router.push('/(tabs)/profile')}>
            {user?.profileImage ? (
              <Image
                source={{ uri: user.profileImage }}
                style={styles.avatarImage}
              />
            ) : (
              <MaterialCommunityIcons name="account-circle" size={50} color="#3B82F6" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Main CTA Button */}
      <View style={styles.section}>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push('/booking/service-selection')}
        >
          <View style={styles.ctaContent}>
            <View>
              <Text style={styles.ctaTitle}>Book a Car Wash</Text>
              <Text style={styles.ctaSubtitle}>Get your car cleaned today</Text>
            </View>
            <View style={styles.ctaIcon}>
              <MaterialCommunityIcons name="arrow-right" size={24} color="#FFF" />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* Promo Banner */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.promoBanner}>
          <View style={styles.promoContent}>
            <MaterialCommunityIcons name="tag" size={32} color="#F59E0B" />
            <View style={styles.promoText}>
              <Text style={styles.promoTitle}>Special Offer!</Text>
              <Text style={styles.promoSubtitle}>Get 20% off your first premium wash</Text>
            </View>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Featured Services */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Featured Services</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/services')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {featuredServices.map((service) => (
            <TouchableOpacity key={service.id} style={styles.serviceCard}>
              <View style={styles.serviceImagePlaceholder}>
                {service.imageUrl ? (
                  <Image source={{ uri: service.imageUrl }} style={styles.serviceImage} />
                ) : (
                  <Text style={styles.serviceEmoji}>🚗</Text>
                )}
              </View>
              <View style={styles.serviceInfo}>
                <Text style={styles.serviceName}>{service.name}</Text>
                <View style={styles.serviceDetails}>
                  <MaterialCommunityIcons name="star" size={14} color="#FFA500" />
                  <Text style={styles.serviceRating}>{service.rating.toFixed(1)}</Text>
                </View>
                <Text style={styles.servicePrice}>${service.price.toFixed(2)}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Recent Bookings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Bookings</Text>
          <TouchableOpacity onPress={() => router.push('/bookings')}>
            <Text style={styles.seeAll}>View all</Text>
          </TouchableOpacity>
        </View>
        {recentBookings.map((booking) => (
          <TouchableOpacity key={booking.id} style={styles.bookingCard}>
            <View style={styles.bookingIcon}>
              <MaterialCommunityIcons name="calendar-check" size={24} color="#3B82F6" />
            </View>
            <View style={styles.bookingInfo}>
              <Text style={styles.bookingService}>{booking.service}</Text>
              <Text style={styles.bookingDate}>{booking.date}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: booking.statusColor }]}>
              <Text style={styles.statusText}>{booking.status}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Recommended Providers */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended Providers</Text>
          <TouchableOpacity onPress={() => router.push('/providers')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        {recommendedProviders.map((provider) => (
          <TouchableOpacity
            key={provider.id}
            style={styles.providerCard}
            onPress={() => router.push(`/provider/${provider.id}/profile` as any)}
          >
            <View style={styles.providerAvatar}>
              {provider.profilePicture ? (
                <Image source={{ uri: provider.profilePicture }} style={styles.providerImage} />
              ) : (
                <MaterialCommunityIcons name="account" size={32} color="#3B82F6" />
              )}
            </View>
            <View style={styles.providerInfo}>
              <Text style={styles.providerName}>{provider.name}</Text>
              <Text style={styles.providerSpecialty}>{provider.specialty}</Text>
              <View style={styles.providerMeta}>
                <View style={styles.providerRating}>
                  <MaterialCommunityIcons name="star" size={14} color="#FFA500" />
                  <Text style={styles.providerRatingText}>{provider.rating.toFixed(1)}</Text>
                  <Text style={styles.providerReviews}>({provider.reviews})</Text>
                </View>
                <View style={styles.providerDistance}>
                  <MaterialCommunityIcons name="map-marker" size={14} color="#666" />
                  <Text style={styles.providerDistanceText}>{provider.distance}</Text>
                </View>
              </View>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>
        ))}
      </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  scrollContent: {
    marginTop:10,
    flex: 1,
  },
  greetingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'NunitoSans_700Bold',
  },
  subGreeting: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: 50,
    height: 50,
  },
  addressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    marginHorizontal: 20,
    marginVertical: 16,
    padding: 12,
    borderRadius: 10,
  },
  addressText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#333',
    fontFamily: 'NunitoSans_400Regular',
  },
  editIcon: {
    padding: 4,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
    marginTop: 4,
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
    fontFamily: 'NunitoSans_700Bold',
  },
  seeAll: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '600',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  ctaButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
    fontFamily: 'NunitoSans_700Bold',
  },
  ctaSubtitle: {
    fontSize: 14,
    color: '#E0F2FE',
    fontFamily: 'NunitoSans_400Regular',
  },
  ctaIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FED7AA',
  },
  promoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  promoText: {
    marginLeft: 12,
    flex: 1,
  },
  promoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 2,
    fontFamily: 'NunitoSans_700Bold',
  },
  promoSubtitle: {
    fontSize: 13,
    color: '#B45309',
    fontFamily: 'NunitoSans_400Regular',
  },
  horizontalScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  serviceCard: {
    width: 160,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  serviceImagePlaceholder: {
    height: 100,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
  },
  serviceEmoji: {
    fontSize: 40,
  },
  serviceInfo: {
    padding: 12,
  },
  serviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  serviceDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  serviceRating: {
    fontSize: 12,
    color: '#666',
    marginLeft: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
  servicePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3B82F6',
    fontFamily: 'NunitoSans_700Bold',
  },
  bookingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  bookingIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingService: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  bookingDate: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'NunitoSans_400Regular',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  providerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  providerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  providerImage: {
    width: 56,
    height: 56,
  },
  providerInfo: {
    flex: 1,
  },
  providerName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  providerSpecialty: {
    fontSize: 13,
    color: '#666',
    marginBottom: 6,
    fontFamily: 'NunitoSans_400Regular',
  },
  providerMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  providerRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerRatingText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginLeft: 4,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  providerReviews: {
    fontSize: 12,
    color: '#666',
    marginLeft: 2,
    fontFamily: 'NunitoSans_400Regular',
  },
  providerDistance: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  providerDistanceText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
  bottomPadding: {
    height: 20,
  },
});
