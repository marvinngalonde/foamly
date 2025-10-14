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
        imageUrl: service.imageUrl,
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
      .map(provider => {
        const profilePic = provider.profilePicture;
        console.log('Provider data:', {
          name: provider.businessName,
          profilePic: profilePic,
          profilePicLength: profilePic?.length,
        });
        return {
          id: provider.id,
          name: provider.businessName,
          rating: Math.round(parseFloat(provider.rating)),
          specialty: provider.serviceArea,
          reviews: parseInt(provider.totalReviews),
          profilePicture: profilePic && profilePic.trim() !== '' ? profilePic : null,
          address: provider.address,
          city: provider.address ? provider.address.split(',')[0] : provider.serviceArea,
          discount: '30% Off', // Can be made dynamic based on provider data
        };
      });
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
          <View style={styles.promoBannerCard}>
            <View style={styles.textContainer}>
              <Text style={styles.title}>Super Saver Week</Text>
              <Text style={styles.subtitle}>40% Off on Full Car Wash</Text>
              <TouchableOpacity style={styles.offerButton}>
                <Text style={styles.offerText}>Grab Offer</Text>
              </TouchableOpacity>
            </View>

            <Image
              source={require("../../assets/wash.png")}
              style={styles.image}
              resizeMode="contain"
            />
          </View>
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
              {/* Left Image */}
              {provider.profilePicture ? (
                <Image
                  source={{ uri: provider.profilePicture }}
                  style={styles.providerImage}
                  onError={(error) => {
                    console.log('Image load error for', provider.name, ':', error.nativeEvent.error);
                  }}
                  defaultSource={require('../../assets/icon.png')}
                />
              ) : (
                <View style={[styles.providerImage, styles.providerImagePlaceholder]}>
                  <Text style={styles.providerInitial}>
                    {provider.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}

              {/* Middle Info */}
              <View style={styles.providerInfo}>
                <Text style={styles.providerName}>{provider.name}</Text>
                <View style={styles.providerLocation}>
                  <MaterialCommunityIcons name="map-marker" size={14} color="#888" />
                  <Text style={styles.providerCity} numberOfLines={1}>
                    {provider.city || "Unknown City"}
                  </Text>
                </View>

                <View style={styles.providerRating}>
                  {[...Array(5)].map((_, i) => (
                    <MaterialCommunityIcons
                      key={i}
                      name="star"
                      size={14}
                      color={i < provider.rating ? "#FBBF24" : "#E5E7EB"}
                    />
                  ))}
                  <Text style={styles.reviewCount}>({provider.reviews})</Text>
                </View>
              </View>

              {/* Right Side */}
              <View style={styles.rightSection}>
                <TouchableOpacity style={styles.likeButton}>
                  <MaterialCommunityIcons name="thumb-up" size={18} color="#fff" />
                </TouchableOpacity>
                <Text style={styles.discountText}>{provider.discount || "30% Off"}</Text>
              </View>
            </TouchableOpacity>

          ))}
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

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
  promoBannerCard: {
    backgroundColor: "#2563EB", // blue background
    borderRadius: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,


  },
  textContainer: {
    flex: 1,
    marginRight: 10,
    marginBottom: 10,
  },
  title: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 4,
  },
  subtitle: {
    color: "#E0E7FF",
    fontSize: 14,
    marginBottom: 20,
  },
  offerButton: {
    backgroundColor: "#FACC15", // yellow button
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginBottom: 5,
  },
  offerText: {
    color: "#000",
    fontWeight: "600",
    fontSize: 14,
  },
  image: {
    width: 80,
    height: 80,
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 0,
    borderBottomColor: '#E5E7EB',

  },
  scrollContent: {
    marginTop: 10,
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  serviceImagePlaceholder: {
    height: 120,
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
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 10,
    marginVertical: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  providerImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
  },
  providerImagePlaceholder: {
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  providerInitial: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'NunitoSans_700Bold',
  },
  providerInfo: {
    flex: 1,
    marginHorizontal: 10,
  },
  providerName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
    fontFamily: 'NunitoSans_700Bold',
  },
  providerLocation: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  providerCity: {
    fontSize: 13,
    color: "#6B7280",
    marginLeft: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
  providerRating: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewCount: {
    fontSize: 12,
    color: "#6B7280",
    marginLeft: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
  rightSection: {
    alignItems: "center",
  },
  likeButton: {
    backgroundColor: "#2563EB",
    borderRadius: 20,
    padding: 6,
    marginBottom: 6,
  },
  discountText: {
    color: "#2563EB",
    fontWeight: "600",
    fontSize: 13,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  bottomPadding: {
    height: 20,
  },
});
