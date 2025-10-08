import { z } from 'zod';

// User validation schemas
export const registerCustomerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
});

export const registerProviderSchema = registerCustomerSchema.extend({
  businessName: z.string().min(2, 'Business name must be at least 2 characters'),
  serviceArea: z.string().min(2, 'Service area is required'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Vehicle validation schemas
export const vehicleSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.string().regex(/^\d{4}$/, 'Year must be 4 digits'),
  color: z.string().optional(),
  licensePlate: z.string().optional(),
  vehicleType: z.enum(['sedan', 'suv', 'truck', 'van', 'sports']),
  isDefault: z.boolean().optional(),
});

export const updateVehicleSchema = vehicleSchema.partial();

// Service validation schemas
export const serviceSchema = z.object({
  name: z.string().min(3, 'Service name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  serviceType: z.enum([
    'basic_wash',
    'premium_wash',
    'full_detail',
    'interior_detail',
    'exterior_detail',
    'paint_correction',
    'ceramic_coating',
  ]),
  price: z.number().positive('Price must be positive'),
  duration: z.string().min(1, 'Duration is required'),
  isActive: z.boolean().optional(),
});

// Booking validation schemas
export const createBookingSchema = z.object({
  providerId: z.string().uuid('Invalid provider ID'),
  serviceId: z.string().uuid('Invalid service ID'),
  vehicleId: z.string().uuid('Invalid vehicle ID'),
  scheduledDate: z.string().datetime('Invalid date format'),
  location: z.string().min(5, 'Location must be at least 5 characters'),
  totalPrice: z.number().positive('Total price must be positive'),
  notes: z.string().optional(),
});

export const updateBookingStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']),
});

// Review validation schemas
export const createReviewSchema = z.object({
  bookingId: z.string().uuid('Invalid booking ID'),
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  qualityRating: z.number().min(1).max(5).optional(),
  timelinessRating: z.number().min(1).max(5).optional(),
  communicationRating: z.number().min(1).max(5).optional(),
  comment: z.string().optional(),
  photos: z.array(z.string()).optional(),
});

// Profile update schema
export const updateProfileSchema = z.object({
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  phoneNumber: z.string().min(10).optional(),
  profilePicture: z.string().optional(),
});

// Provider profile update schema
export const updateProviderProfileSchema = z.object({
  businessName: z.string().min(2).optional(),
  bio: z.string().optional(),
  serviceArea: z.string().min(2).optional(),
  profilePicture: z.string().optional(),
});

// Type exports
export type RegisterCustomerInput = z.infer<typeof registerCustomerSchema>;
export type RegisterProviderInput = z.infer<typeof registerProviderSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VehicleInput = z.infer<typeof vehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type ServiceInput = z.infer<typeof serviceSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingStatusInput = z.infer<typeof updateBookingStatusSchema>;
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type UpdateProviderProfileInput = z.infer<typeof updateProviderProfileSchema>;
