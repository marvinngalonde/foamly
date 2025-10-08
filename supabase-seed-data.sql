-- Seed data for Foamly App
-- Run this in Supabase SQL Editor after creating the schema

-- Note: First create users through the app registration, then get their auth_id
-- This seed assumes you have registered users already

-- Sample Provider Profiles (Update user_id with actual UUIDs from your users table)
INSERT INTO provider_profiles (user_id, business_name, bio, service_area, rating, total_reviews, verified)
VALUES
  -- Replace these user_ids with actual UUIDs from registered provider accounts
  ('REPLACE_WITH_PROVIDER_USER_ID_1', 'Elite Auto Detailing', 'Premium car detailing services with over 10 years of experience. We use only the best products and techniques.', 'Downtown, Midtown, Westside', '4.9', '234', true),
  ('REPLACE_WITH_PROVIDER_USER_ID_2', 'Sparkle Car Care', 'Eco-friendly car washing and detailing. We care about your car and the environment.', 'Eastside, Northside', '4.8', '189', true),
  ('REPLACE_WITH_PROVIDER_USER_ID_3', 'Premium Wash & Wax', 'Specialist in paint correction and ceramic coatings. Make your car shine like new!', 'Southside, Downtown', '4.7', '156', true);

-- Sample Services (Update provider_id with actual provider_profile IDs)
INSERT INTO services (provider_id, name, description, service_type, price, duration, is_active)
VALUES
  -- Elite Auto Detailing services
  ('REPLACE_WITH_PROVIDER_PROFILE_ID_1', 'Basic Exterior Wash', 'Hand wash, wheel cleaning, tire shine, and exterior dry. Perfect for regular maintenance.', 'basic_wash', '35.00', '30 minutes', true),
  ('REPLACE_WITH_PROVIDER_PROFILE_ID_1', 'Premium Wash & Wax', 'Complete exterior wash, hand wax application, tire dressing, and window cleaning.', 'premium_wash', '75.00', '60 minutes', true),
  ('REPLACE_WITH_PROVIDER_PROFILE_ID_1', 'Full Interior & Exterior Detail', 'Complete interior vacuum, shampoo, conditioning, plus full exterior wash and wax.', 'full_detail', '150.00', '3 hours', true),
  ('REPLACE_WITH_PROVIDER_PROFILE_ID_1', 'Paint Correction', 'Professional paint correction to remove swirls, scratches, and oxidation.', 'paint_correction', '250.00', '4 hours', true),
  ('REPLACE_WITH_PROVIDER_PROFILE_ID_1', 'Ceramic Coating Application', 'Long-lasting ceramic coating protection for your vehicle paint.', 'ceramic_coating', '500.00', '6 hours', true),

  -- Sparkle Car Care services
  ('REPLACE_WITH_PROVIDER_PROFILE_ID_2', 'Eco-Friendly Basic Wash', 'Waterless wash using eco-friendly products. Great for the environment!', 'basic_wash', '30.00', '25 minutes', true),
  ('REPLACE_WITH_PROVIDER_PROFILE_ID_2', 'Interior Deep Clean', 'Thorough interior cleaning, vacuum, upholstery treatment, and air freshener.', 'interior_detail', '80.00', '90 minutes', true),
  ('REPLACE_WITH_PROVIDER_PROFILE_ID_2', 'Exterior Detail Package', 'Complete exterior detail with clay bar treatment, polish, and sealant.', 'exterior_detail', '120.00', '2 hours', true),

  -- Premium Wash & Wax services
  ('REPLACE_WITH_PROVIDER_PROFILE_ID_3', 'Express Wash', 'Quick exterior wash and dry. Perfect when you''re in a hurry!', 'basic_wash', '25.00', '15 minutes', true),
  ('REPLACE_WITH_PROVIDER_PROFILE_ID_3', 'Deluxe Wash Package', 'Premium wash with tire shine, window treatment, and interior vacuum.', 'premium_wash', '60.00', '45 minutes', true),
  ('REPLACE_WITH_PROVIDER_PROFILE_ID_3', 'Complete Detail Service', 'Full interior and exterior detail. Your car will look brand new!', 'full_detail', '180.00', '4 hours', true),
  ('REPLACE_WITH_PROVIDER_PROFILE_ID_3', 'Paint Protection Package', 'Professional paint correction followed by ceramic coating application.', 'ceramic_coating', '600.00', '8 hours', true);

-- Sample Vehicles for customers (Update user_id with actual customer user IDs)
INSERT INTO vehicles (user_id, make, model, year, color, license_plate, vehicle_type, is_default)
VALUES
  ('REPLACE_WITH_CUSTOMER_USER_ID', 'Toyota', 'Camry', '2022', 'Silver', 'ABC 1234', 'sedan', true),
  ('REPLACE_WITH_CUSTOMER_USER_ID', 'Honda', 'CR-V', '2021', 'Blue', 'XYZ 5678', 'suv', false);

-- Sample Bookings (Update IDs with actual UUIDs)
INSERT INTO bookings (customer_id, provider_id, service_id, vehicle_id, scheduled_date, location, status, total_price, notes)
VALUES
  (
    'REPLACE_WITH_CUSTOMER_USER_ID',
    'REPLACE_WITH_PROVIDER_PROFILE_ID_1',
    'REPLACE_WITH_SERVICE_ID',
    'REPLACE_WITH_VEHICLE_ID',
    NOW() + INTERVAL '2 days',
    '123 Main Street, Downtown',
    'confirmed',
    '75.00',
    'Please call when you arrive'
  );

-- Sample Reviews (Update IDs with actual UUIDs from bookings)
INSERT INTO reviews (booking_id, customer_id, provider_id, rating, comment)
VALUES
  (
    'REPLACE_WITH_BOOKING_ID',
    'REPLACE_WITH_CUSTOMER_USER_ID',
    'REPLACE_WITH_PROVIDER_PROFILE_ID_1',
    '5.0',
    'Excellent service! My car looks brand new. Highly recommended!'
  );

-- How to use this file:
-- 1. First, register users through the app (customers and providers)
-- 2. Query your users table to get the user IDs
-- 3. Replace all REPLACE_WITH_* placeholders with actual UUIDs
-- 4. Run this SQL in Supabase SQL Editor
-- 5. For provider_profiles, you need the user_id from the users table
-- 6. For services, you need the provider_id from provider_profiles
-- 7. For bookings, you need customer_id, provider_id, service_id, and vehicle_id

-- Example query to get user IDs:
-- SELECT id, email, first_name, last_name, role FROM users;

-- Example query to get provider profile IDs:
-- SELECT id, user_id, business_name FROM provider_profiles;

-- Example query to get service IDs:
-- SELECT id, name, provider_id FROM services;

-- Example query to get vehicle IDs:
-- SELECT id, make, model, user_id FROM vehicles;
