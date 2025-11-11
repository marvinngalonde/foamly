import { pgTable, uuid, varchar, timestamp, decimal, text, boolean, pgEnum } from 'drizzle-orm/pg-core';

// Enums
export const userRoleEnum = pgEnum('user_role', ['customer', 'provider', 'admin']);
export const serviceTypeEnum = pgEnum('service_type', [
  'basic_wash',
  'premium_wash',
  'full_detail',
  'interior_detail',
  'exterior_detail',
  'paint_correction',
  'ceramic_coating',
]);
export const vehicleTypeEnum = pgEnum('vehicle_type', ['sedan', 'suv', 'truck', 'van', 'sports']);
export const bookingStatusEnum = pgEnum('booking_status', [
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
]);
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'failed', 'refunded']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  authId: uuid('auth_id').notNull().unique(), // Supabase auth.users.id
  email: varchar('email', { length: 255 }).notNull().unique(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  phoneNumber: varchar('phone_number', { length: 20 }).notNull(),
  role: userRoleEnum('role').notNull().default('customer'),
  profilePicture: text('profile_picture'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Provider profiles table
export const providerProfiles = pgTable('provider_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  businessName: varchar('business_name', { length: 255 }).notNull(),
  bio: text('bio'),
  serviceArea: text('service_area').notNull(),
  address: text('address'),
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  serviceRadius: decimal('service_radius', { precision: 10, scale: 0 }).default('5000'),
  phoneNumber: varchar('phone_number', { length: 20 }),
  profilePicture: text('profile_picture'),
  gallery: text('gallery').array(), // Array of image URLs
  isActive: boolean('is_active').default(true),
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0.00'),
  totalReviews: decimal('total_reviews', { precision: 10, scale: 0 }).default('0'),
  verified: boolean('verified').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Vehicles table
export const vehicles = pgTable('vehicles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  make: varchar('make', { length: 100 }).notNull(),
  model: varchar('model', { length: 100 }).notNull(),
  year: varchar('year', { length: 4 }).notNull(),
  color: varchar('color', { length: 50 }),
  licensePlate: varchar('license_plate', { length: 20 }),
  vehicleType: vehicleTypeEnum('vehicle_type').notNull(),
  imageUrl: text('image_url'),
  isDefault: boolean('is_default').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Services table
export const services = pgTable('services', {
  id: uuid('id').primaryKey().defaultRandom(),
  providerId: uuid('provider_id').notNull().references(() => providerProfiles.id),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description').notNull(),
  serviceType: serviceTypeEnum('service_type').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  duration: varchar('duration', { length: 50 }).notNull(),
  imageUrl: text('image_url'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Bookings table
export const bookings = pgTable('bookings', {
  id: uuid('id').primaryKey().defaultRandom(),
  customerId: uuid('customer_id').notNull().references(() => users.id),
  providerId: uuid('provider_id').notNull().references(() => providerProfiles.id),
  serviceId: uuid('service_id').notNull().references(() => services.id),
  vehicleId: uuid('vehicle_id').notNull().references(() => vehicles.id),
  scheduledDate: timestamp('scheduled_date').notNull(),
  scheduledTime: varchar('scheduled_time', { length: 10 }),
  location: text('location').notNull(), // JSON: {address, latitude, longitude}
  latitude: decimal('latitude', { precision: 10, scale: 8 }),
  longitude: decimal('longitude', { precision: 11, scale: 8 }),
  status: bookingStatusEnum('status').notNull().default('pending'),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  estimatedDuration: decimal('estimated_duration', { precision: 5, scale: 0 }).default('60'),
  actualStartTime: timestamp('actual_start_time'),
  actualEndTime: timestamp('actual_end_time'),
  beforeImages: text('before_images').array(), // Array of image URLs
  afterImages: text('after_images').array(), // Array of image URLs
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Reviews table
export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookingId: uuid('booking_id').notNull().references(() => bookings.id),
  customerId: uuid('customer_id').notNull().references(() => users.id),
  providerId: uuid('provider_id').notNull().references(() => providerProfiles.id),
  rating: decimal('rating', { precision: 2, scale: 1 }).notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Payments table
export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  bookingId: uuid('booking_id').notNull().references(() => bookings.id),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  status: paymentStatusEnum('status').notNull().default('pending'),
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(),
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Payment Methods table
export const paymentMethods = pgTable('payment_methods', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id),
  type: varchar('type', { length: 50 }).notNull(), // 'Visa', 'Mastercard', etc.
  last4: varchar('last4', { length: 4 }).notNull(),
  brand: varchar('brand', { length: 50 }).notNull(),
  expiryMonth: varchar('expiry_month', { length: 2 }).notNull(),
  expiryYear: varchar('expiry_year', { length: 4 }).notNull(),
  isDefault: boolean('is_default').default(false),
  stripePaymentMethodId: varchar('stripe_payment_method_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Notification Preferences table
export const notificationPreferences = pgTable('notification_preferences', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id).unique(),
  pushNotifications: boolean('push_notifications').default(true),
  emailNotifications: boolean('email_notifications').default(true),
  smsNotifications: boolean('sms_notifications').default(false),
  bookingReminders: boolean('booking_reminders').default(true),
  promotions: boolean('promotions').default(false),
  serviceUpdates: boolean('service_updates').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// User Settings table (for privacy and security settings)
export const userSettings = pgTable('user_settings', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id).unique(),
  biometricEnabled: boolean('biometric_enabled').default(false),
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
