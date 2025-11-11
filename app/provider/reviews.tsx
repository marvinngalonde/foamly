import { View, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useProviderByUserId } from '@/hooks/useProviders';
import { useProviderReviews } from '@/hooks/useReviews';

export default function ProviderReviewsScreen() {
  const router = useRouter();
  const { user } = useAuthStore();

  const { data: provider } = useProviderByUserId(user?.id || '');
  const { data: reviews = [], isLoading } = useProviderReviews(provider?.id || '');

  // Calculate rating statistics
  const ratingStats = useMemo(() => {
    if (reviews.length === 0) {
      return {
        average: 0,
        total: 0,
        breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
      };
    }

    const breakdown = reviews.reduce((acc, review) => {
      const rating = Math.floor(parseFloat(review.rating));
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const average = reviews.reduce((sum, review) => sum + parseFloat(review.rating), 0) / reviews.length;

    return {
      average,
      total: reviews.length,
      breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0, ...breakdown },
    };
  }, [reviews]);

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(
          <MaterialCommunityIcons key={i} name="star" size={14} color="#F59E0B" />
        );
      } else if (i === fullStars && hasHalfStar) {
        stars.push(
          <MaterialCommunityIcons key={i} name="star-half-full" size={14} color="#F59E0B" />
        );
      } else {
        stars.push(
          <MaterialCommunityIcons key={i} name="star-outline" size={14} color="#D1D5DB" />
        );
      }
    }

    return <View style={styles.stars}>{stars}</View>;
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reviews & Ratings</Text>
        <View style={styles.placeholder} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <>
              {/* Overall Rating Card */}
              <View style={styles.overallCard}>
                <View style={styles.overallLeft}>
                  <Text style={styles.overallRating}>
                    {ratingStats.average > 0 ? ratingStats.average.toFixed(1) : '0.0'}
                  </Text>
                  <View style={styles.overallStarsContainer}>
                    {[...Array(5)].map((_, i) => (
                      <MaterialCommunityIcons
                        key={i}
                        name={i < Math.floor(ratingStats.average) ? 'star' : 'star-outline'}
                        size={20}
                        color="#F59E0B"
                      />
                    ))}
                  </View>
                  <Text style={styles.overallTotal}>
                    {ratingStats.total} {ratingStats.total === 1 ? 'review' : 'reviews'}
                  </Text>
                </View>

                <View style={styles.dividerVertical} />

                <View style={styles.overallRight}>
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = ratingStats.breakdown[rating] || 0;
                    const percentage = ratingStats.total > 0 ? (count / ratingStats.total) * 100 : 0;

                    return (
                      <View key={rating} style={styles.ratingRow}>
                        <Text style={styles.ratingLabel}>{rating}</Text>
                        <MaterialCommunityIcons name="star" size={12} color="#F59E0B" />
                        <View style={styles.ratingBarContainer}>
                          <View style={[styles.ratingBar, { width: `${percentage}%` }]} />
                        </View>
                        <Text style={styles.ratingCount}>{count}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>

              {reviews.length > 0 && (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>All Reviews</Text>
                  <View style={styles.reviewCount}>
                    <Text style={styles.reviewCountText}>{reviews.length}</Text>
                  </View>
                </View>
              )}
            </>
          }
          renderItem={({ item }) => (
            <View style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <View style={styles.customerAvatar}>
                  {item.customer?.profilePicture ? (
                    <Image
                      source={{ uri: item.customer.profilePicture }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <MaterialCommunityIcons name="account-circle" size={40} color="#9CA3AF" />
                  )}
                </View>

                <View style={styles.reviewHeaderInfo}>
                  <Text style={styles.customerName}>
                    {item.customer?.firstName} {item.customer?.lastName}
                  </Text>
                  <View style={styles.reviewMeta}>
                    {renderStars(parseFloat(item.rating))}
                    <Text style={styles.reviewDate}>{formatDate(item.createdAt)}</Text>
                  </View>
                </View>
              </View>

              {item.comment && (
                <Text style={styles.reviewComment}>{item.comment}</Text>
              )}
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <MaterialCommunityIcons name="star-outline" size={80} color="#D1D5DB" />
              </View>
              <Text style={styles.emptyTitle}>No reviews yet</Text>
              <Text style={styles.emptyText}>
                Complete bookings to start receiving customer reviews
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
    color: '#111827',
    fontFamily: 'NunitoSans_700Bold',
  },
  placeholder: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFF',
  },
  list: {
    paddingBottom: 40,
  },
  overallCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 16,
    padding: 24,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  overallLeft: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 24,
  },
  overallRating: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#111827',
    fontFamily: 'NunitoSans_700Bold',
    marginBottom: 8,
  },
  overallStarsContainer: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 8,
  },
  overallTotal: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'NunitoSans_400Regular',
  },
  dividerVertical: {
    width: 1,
    backgroundColor: '#E5E7EB',
    marginHorizontal: 24,
  },
  overallRight: {
    flex: 1,
    justifyContent: 'center',
    gap: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingLabel: {
    fontSize: 13,
    color: '#374151',
    fontFamily: 'NunitoSans_600SemiBold',
    width: 8,
  },
  ratingBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#F3F4F6',
    borderRadius: 4,
    overflow: 'hidden',
  },
  ratingBar: {
    height: '100%',
    backgroundColor: '#F59E0B',
    borderRadius: 4,
  },
  ratingCount: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'NunitoSans_400Regular',
    width: 24,
    textAlign: 'right',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    fontFamily: 'NunitoSans_700Bold',
  },
  reviewCount: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reviewCountText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'NunitoSans_700Bold',
  },
  reviewCard: {
    backgroundColor: '#FFF',
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  reviewHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  customerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: 12,
  },
  avatarImage: {
    width: 40,
    height: 40,
  },
  reviewHeaderInfo: {
    flex: 1,
  },
  customerName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    fontFamily: 'NunitoSans_700Bold',
    marginBottom: 4,
  },
  reviewMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'NunitoSans_400Regular',
  },
  reviewComment: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 22,
    fontFamily: 'NunitoSans_400Regular',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
    fontFamily: 'NunitoSans_700Bold',
  },
  emptyText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'NunitoSans_400Regular',
  },
});
