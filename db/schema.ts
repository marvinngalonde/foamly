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
  profilePicture: text('profile_picture'),
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
  location: text('location').notNull(),
  status: bookingStatusEnum('status').notNull().default('pending'),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
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
