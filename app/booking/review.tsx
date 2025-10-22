import { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Image, Alert, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBooking } from '@/hooks/useBookings';
import { useCreateReview } from '@/hooks/useReviews';
import { useAuthStore } from '@/stores/authStore';

export default function ReviewScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();

  const [overallRating, setOverallRating] = useState(0);
  const [qualityRating, setQualityRating] = useState(0);
  const [timelinessRating, setTimelinessRating] = useState(0);
  const [communicationRating, setCommunicationRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: booking, isLoading } = useBooking(id);
  const createReviewMutation = useCreateReview(user?.id || '');

  const handleSubmit = async () => {
    if (overallRating === 0) {
      Alert.alert('Rating Required', 'Please provide an overall rating');
      return;
    }

    if (!booking) {
      Alert.alert('Error', 'Booking information not found');
      return;
    }

    setIsSubmitting(true);

    try {
      await createReviewMutation.mutateAsync({
        bookingId: booking.id,
        providerId: booking.providerId,
        rating: overallRating.toString(),
        qualityRating: qualityRating || undefined,
        timelinessRating: timelinessRating || undefined,
        communicationRating: communicationRating || undefined,
        comment: reviewText || undefined,
        photos: photos.length > 0 ? photos : undefined,
      });

      Alert.alert(
        'Review Submitted',
        'Thank you for your feedback!',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const renderStars = (rating: number, onPress: (star: number) => void, size: number = 32) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity key={star} onPress={() => onPress(star)}>
            <MaterialCommunityIcons
              name={star <= rating ? 'star' : 'star-outline'}
              size={size}
              color={star <= rating ? '#FFA500' : '#E5E7EB'}
            />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading booking details...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="alert-circle" size={64} color="#999" />
        <Text style={styles.emptyText}>Booking not found</Text>
        <TouchableOpacity style={styles.backToListButton} onPress={() => router.back()}>
          <Text style={styles.backToListText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rate Your Experience</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.innerContainer}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}>
        {/* Service Summary */}
        <View style={styles.serviceSummary}>
          <View style={styles.serviceIcon}>
            <MaterialCommunityIcons name="car-wash" size={32} color="#3B82F6" />
          </View>
          <View style={styles.serviceInfo}>
            <Text style={styles.serviceName}>{booking.service?.name || 'Service'}</Text>
            <Text style={styles.providerName}>{booking.provider?.businessName || 'Provider'}</Text>
            <Text style={styles.serviceDate}>
              {booking.status === 'completed' ? 'Completed on' : 'Scheduled for'} {formatDateTime(booking.scheduledDate)}
            </Text>
          </View>
        </View>

        {/* Overall Rating */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Rating</Text>
          <Text style={styles.sectionSubtitle}>How was your experience?</Text>

          <View style={styles.overallRatingContainer}>
            {renderStars(overallRating, setOverallRating, 48)}
          </View>

          {overallRating > 0 && (
            <Text style={styles.ratingLabel}>
              {overallRating === 1 && 'Poor'}
              {overallRating === 2 && 'Fair'}
              {overallRating === 3 && 'Good'}
              {overallRating === 4 && 'Very Good'}
              {overallRating === 5 && 'Excellent'}
            </Text>
          )}
        </View>

        {/* Detailed Ratings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rate Specific Aspects</Text>

          {/* Service Quality */}
          <View style={styles.ratingCategory}>
            <View style={styles.categoryHeader}>
              <MaterialCommunityIcons name="star-check" size={20} color="#3B82F6" />
              <Text style={styles.categoryLabel}>Service Quality</Text>
            </View>
            {renderStars(qualityRating, setQualityRating, 28)}
          </View>

          {/* Timeliness */}
          <View style={styles.ratingCategory}>
            <View style={styles.categoryHeader}>
              <MaterialCommunityIcons name="clock-check" size={20} color="#3B82F6" />
              <Text style={styles.categoryLabel}>Timeliness</Text>
            </View>
            {renderStars(timelinessRating, setTimelinessRating, 28)}
          </View>

          {/* Communication */}
          <View style={styles.ratingCategory}>
            <View style={styles.categoryHeader}>
              <MaterialCommunityIcons name="message-text" size={20} color="#3B82F6" />
              <Text style={styles.categoryLabel}>Communication</Text>
            </View>
            {renderStars(communicationRating, setCommunicationRating, 28)}
          </View>
        </View>

        {/* Written Review */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Share Your Feedback</Text>
          <Text style={styles.sectionSubtitle}>Tell us more about your experience (optional)</Text>

          <TextInput
            style={styles.reviewInput}
            value={reviewText}
            onChangeText={setReviewText}
            placeholder="What did you like? What could be improved?"
            placeholderTextColor="#999"
            multiline
            numberOfLines={6}
            textAlignVertical="top"
            maxLength={500}
          />

          <Text style={styles.characterCount}>{reviewText.length}/500</Text>
        </View>

        {/* Photo Upload */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Photos</Text>
          <Text style={styles.sectionSubtitle}>Show others the results (optional)</Text>

          <View style={styles.photoGrid}>
            {photos.map((photo, index) => (
              <View key={index} style={styles.photoContainer}>
                <Image source={{ uri: photo }} style={styles.photo} />
                <TouchableOpacity
                  style={styles.removePhoto}
                  onPress={() => setPhotos(photos.filter((_, i) => i !== index))}
                >
                  <MaterialCommunityIcons name="close-circle" size={24} color="#DC2626" />
                </TouchableOpacity>
              </View>
            ))}

            {photos.length < 4 && (
              <TouchableOpacity style={styles.addPhotoButton}>
                <MaterialCommunityIcons name="camera-plus" size={32} color="#999" />
                <Text style={styles.addPhotoText}>Add Photo</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.tipsSection}>
          <MaterialCommunityIcons name="lightbulb-outline" size={20} color="#FFA500" />
          <View style={styles.tipsContent}>
            <Text style={styles.tipsTitle}>Tips for helpful reviews:</Text>
            <Text style={styles.tipsText}>• Mention specific aspects you liked or didn't like</Text>
            <Text style={styles.tipsText}>• Be honest and constructive</Text>
            <Text style={styles.tipsText}>• Photos help others see the quality of work</Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, (overallRating === 0 || isSubmitting) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={overallRating === 0 || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Review</Text>
          )}
        </TouchableOpacity>
        </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    fontFamily: 'NunitoSans_400Regular',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  backToListButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  backToListText: {
    fontSize: 14,
    color: '#FFF',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'NunitoSans_700Bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  serviceSummary: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  serviceIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  serviceInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'NunitoSans_700Bold',
  },
  providerName: {
    fontSize: 14,
    color: '#3B82F6',
    marginBottom: 4,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  serviceDate: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'NunitoSans_400Regular',
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    fontFamily: 'NunitoSans_700Bold',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 16,
    fontFamily: 'NunitoSans_400Regular',
  },
  overallRatingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  starsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  ratingLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFA500',
    textAlign: 'center',
    marginTop: 12,
    fontFamily: 'NunitoSans_700Bold',
  },
  ratingCategory: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  categoryLabel: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  reviewInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    color: '#333',
    fontFamily: 'NunitoSans_400Regular',
    minHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 8,
    fontFamily: 'NunitoSans_400Regular',
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  photoContainer: {
    position: 'relative',
    width: 80,
    height: 80,
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  removePhoto: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
  addPhotoButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  addPhotoText: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
  tipsSection: {
    flexDirection: 'row',
    backgroundColor: '#FFFBEB',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FFA500',
  },
  tipsContent: {
    flex: 1,
    marginLeft: 12,
  },
  tipsTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 8,
    fontFamily: 'NunitoSans_700Bold',
  },
  tipsText: {
    fontSize: 12,
    color: '#78350F',
    marginBottom: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
  submitButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 25,
    paddingVertical: 16,
    marginHorizontal: 20,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#D1D5DB',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'NunitoSans_700Bold',
  },
});
