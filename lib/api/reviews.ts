import { supabase } from '@/lib/supabase';
import { CreateReviewInput, createReviewSchema } from '@/lib/validations';

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  rating: string;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  booking?: {
    id: string;
    scheduledDate: Date;
  };
}

// Get reviews for provider
export async function getProviderReviews(providerId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      users:customer_id (
        id,
        first_name,
        last_name,
        profile_picture
      ),
      bookings:booking_id (
        id,
        scheduled_date
      )
    `)
    .eq('provider_id', providerId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map((review: any) => ({
    id: review.id,
    bookingId: review.booking_id,
    customerId: review.customer_id,
    providerId: review.provider_id,
    rating: review.rating,
    comment: review.comment,
    createdAt: new Date(review.created_at),
    updatedAt: new Date(review.updated_at),
    customer: review.users ? {
      id: review.users.id,
      firstName: review.users.first_name,
      lastName: review.users.last_name,
      profilePicture: review.users.profile_picture,
    } : undefined,
    booking: review.bookings ? {
      id: review.bookings.id,
      scheduledDate: new Date(review.bookings.scheduled_date),
    } : undefined,
  }));
}

// Get reviews by customer
export async function getCustomerReviews(customerId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      bookings:booking_id (
        id,
        scheduled_date
      )
    `)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map((review: any) => ({
    id: review.id,
    bookingId: review.booking_id,
    customerId: review.customer_id,
    providerId: review.provider_id,
    rating: review.rating,
    comment: review.comment,
    createdAt: new Date(review.created_at),
    updatedAt: new Date(review.updated_at),
    booking: review.bookings ? {
      id: review.bookings.id,
      scheduledDate: new Date(review.bookings.scheduled_date),
    } : undefined,
  }));
}

// Get review by booking ID
export async function getReviewByBookingId(bookingId: string): Promise<Review | null> {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      users:customer_id (
        id,
        first_name,
        last_name,
        profile_picture
      )
    `)
    .eq('booking_id', bookingId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // No rows returned
    throw error;
  }

  return {
    id: data.id,
    bookingId: data.booking_id,
    customerId: data.customer_id,
    providerId: data.provider_id,
    rating: data.rating,
    comment: data.comment,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
    customer: data.users ? {
      id: data.users.id,
      firstName: data.users.first_name,
      lastName: data.users.last_name,
      profilePicture: data.users.profile_picture,
    } : undefined,
  };
}

// Create review
export async function createReview(customerId: string, input: CreateReviewInput): Promise<Review> {
  const validated = createReviewSchema.parse(input);

  // Get booking to extract provider ID
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('provider_id')
    .eq('id', validated.bookingId)
    .single();

  if (bookingError) throw bookingError;

  // Check if review already exists
  const existing = await getReviewByBookingId(validated.bookingId);
  if (existing) {
    throw new Error('Review already exists for this booking');
  }

  // Create the review
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      booking_id: validated.bookingId,
      customer_id: customerId,
      provider_id: booking.provider_id,
      rating: validated.rating.toString(),
      comment: validated.comment,
    })
    .select()
    .single();

  if (error) throw error;

  // Update provider rating
  await updateProviderRating(booking.provider_id);

  return {
    id: data.id,
    bookingId: data.booking_id,
    customerId: data.customer_id,
    providerId: data.provider_id,
    rating: data.rating,
    comment: data.comment,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

// Update provider rating (helper function)
async function updateProviderRating(providerId: string): Promise<void> {
  const { data: reviews } = await supabase
    .from('reviews')
    .select('rating')
    .eq('provider_id', providerId);

  if (!reviews || reviews.length === 0) return;

  const totalRating = reviews.reduce((sum: number, review: any) => sum + parseFloat(review.rating), 0);
  const avgRating = (totalRating / reviews.length).toFixed(2);

  await supabase
    .from('provider_profiles')
    .update({
      rating: avgRating,
      total_reviews: reviews.length.toString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', providerId);
}

// Update review
export async function updateReview(id: string, customerId: string, input: Partial<CreateReviewInput>): Promise<Review> {
  const updateData: any = {};

  if (input.rating !== undefined) updateData.rating = input.rating.toString();
  if (input.comment !== undefined) updateData.comment = input.comment;

  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('reviews')
    .update(updateData)
    .eq('id', id)
    .eq('customer_id', customerId)
    .select()
    .single();

  if (error) throw error;

  // Update provider rating
  await updateProviderRating(data.provider_id);

  return {
    id: data.id,
    bookingId: data.booking_id,
    customerId: data.customer_id,
    providerId: data.provider_id,
    rating: data.rating,
    comment: data.comment,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

// Delete review
export async function deleteReview(id: string, customerId: string): Promise<void> {
  // Get provider ID before deleting
  const { data: review } = await supabase
    .from('reviews')
    .select('provider_id')
    .eq('id', id)
    .eq('customer_id', customerId)
    .single();

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', id)
    .eq('customer_id', customerId);

  if (error) throw error;

  // Update provider rating
  if (review) {
    await updateProviderRating(review.provider_id);
  }
}
