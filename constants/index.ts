export { Colors } from './colors';

export const APP_NAME = 'Foamly';
export const APP_TAGLINE = 'Professional Car Detailing at Your Doorstep';

// Booking constants
export const BOOKING_STATUS_LABELS = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  SCHEDULED: 'Scheduled',
  EN_ROUTE: 'On the Way',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  REFUNDED: 'Refunded',
} as const;

// Service constants
export const SERVICE_CATEGORY_LABELS = {
  EXTERIOR_WASH: 'Exterior Wash',
  INTERIOR_CLEANING: 'Interior Cleaning',
  FULL_DETAIL: 'Full Detail',
  WAX_POLISH: 'Wax & Polish',
  ENGINE_CLEAN: 'Engine Clean',
  HEADLIGHT_RESTORATION: 'Headlight Restoration',
  PAINT_CORRECTION: 'Paint Correction',
  CERAMIC_COATING: 'Ceramic Coating',
} as const;

// Vehicle constants
export const VEHICLE_TYPE_LABELS = {
  SEDAN: 'Sedan',
  SUV: 'SUV',
  TRUCK: 'Truck',
  VAN: 'Van',
  SPORTS: 'Sports Car',
  LUXURY: 'Luxury',
  MOTORCYCLE: 'Motorcycle',
} as const;

// Payment constants
export const PAYMENT_METHOD_LABELS = {
  CREDIT_CARD: 'Credit Card',
  DEBIT_CARD: 'Debit Card',
  APPLE_PAY: 'Apple Pay',
  GOOGLE_PAY: 'Google Pay',
  BANK_TRANSFER: 'Bank Transfer',
  CASH: 'Cash',
} as const;

// Membership tiers
export const MEMBERSHIP_TIER_LABELS = {
  BASIC: 'Basic',
  PREMIUM: 'Premium',
  VIP: 'VIP',
} as const;

export const MEMBERSHIP_TIER_BENEFITS = {
  BASIC: [
    'Standard booking priority',
    'Email support',
    'Basic rewards points',
  ],
  PREMIUM: [
    'Priority booking',
    'Phone support',
    '2x rewards points',
    '10% discount on all services',
    'Free cancellation',
  ],
  VIP: [
    'Highest booking priority',
    '24/7 premium support',
    '3x rewards points',
    '20% discount on all services',
    'Free cancellation anytime',
    'Exclusive provider access',
    'Complimentary add-ons',
  ],
} as const;

// Validation constants
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PHONE_REGEX: /^\+?[1-9]\d{1,14}$/,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  LICENSE_PLATE_REGEX: /^[A-Z0-9-]{2,10}$/,
} as const;

// Time slots
export const TIME_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00',
] as const;

// Map constants
export const DEFAULT_MAP_REGION = {
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
} as const;

// Pagination
export const ITEMS_PER_PAGE = 20;

// Image constants
export const MAX_IMAGE_SIZE_MB = 5;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

// Rating constants
export const MIN_RATING = 1;
export const MAX_RATING = 5;

// Currency
export const DEFAULT_CURRENCY = 'USD';
export const CURRENCY_SYMBOL = '$';

// Support
export const SUPPORT_EMAIL = 'support@foamly.com';
export const SUPPORT_PHONE = '+1-800-FOAMLY';

// Social media
export const SOCIAL_LINKS = {
  facebook: 'https://facebook.com/foamly',
  twitter: 'https://twitter.com/foamly',
  instagram: 'https://instagram.com/foamly',
} as const;

// App Store links
export const APP_STORE_LINKS = {
  ios: 'https://apps.apple.com/app/foamly',
  android: 'https://play.google.com/store/apps/details?id=com.foamly.app',
} as const;
