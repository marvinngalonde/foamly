// User & Authentication Types
export enum UserRole {
  CUSTOMER = 'customer',
  PROVIDER = 'provider',
  ADMIN = 'admin',
}

export enum ProviderStatus {
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  VERIFIED = 'VERIFIED',
  SUSPENDED = 'SUSPENDED',
  REJECTED = 'REJECTED',
}

export interface User {
  id: string;
  email: string;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  profileImage?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  biometricEnabled: boolean;
  twoFactorEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Customer extends User {
  role: UserRole.CUSTOMER;
  vehicles: Vehicle[];
  defaultPaymentMethod?: string;
  loyaltyPoints: number;
  membershipTier: MembershipTier;
  addresses: Address[];
}

export interface Provider extends User {
  role: UserRole.PROVIDER;
  businessName: string;
  businessLicense: string;
  status: ProviderStatus;
  servicesOffered: Service[];
  serviceRadius: number; // in kilometers
  rating: number;
  totalReviews: number;
  totalBookings: number;
  responseTime: number; // average in minutes
  availability: Availability[];
  bankAccount?: BankAccount;
  documents: Document[];
  staffMembers: Staff[];
}

// Vehicle Types
export enum VehicleType {
  SEDAN = 'SEDAN',
  SUV = 'SUV',
  TRUCK = 'TRUCK',
  VAN = 'VAN',
  SPORTS = 'SPORTS',
  LUXURY = 'LUXURY',
  MOTORCYCLE = 'MOTORCYCLE',
}

export interface Vehicle {
  id: string;
  customerId: string;
  make: string;
  model: string;
  year: number;
  type: VehicleType;
  color: string;
  licensePlate: string;
  vin?: string;
  images: string[];
  serviceHistory: BookingHistory[];
  maintenanceReminders: MaintenanceReminder[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Service Types
export enum ServiceCategory {
  EXTERIOR_WASH = 'EXTERIOR_WASH',
  INTERIOR_CLEANING = 'INTERIOR_CLEANING',
  FULL_DETAIL = 'FULL_DETAIL',
  WAX_POLISH = 'WAX_POLISH',
  ENGINE_CLEAN = 'ENGINE_CLEAN',
  HEADLIGHT_RESTORATION = 'HEADLIGHT_RESTORATION',
  PAINT_CORRECTION = 'PAINT_CORRECTION',
  CERAMIC_COATING = 'CERAMIC_COATING',
}

export interface Service {
  id: string;
  category: ServiceCategory;
  name: string;
  description: string;
  basePrice: number;
  duration: number; // in minutes
  vehicleTypes: VehicleType[];
  addOns: AddOn[];
  images: string[];
  isActive: boolean;
}

export interface AddOn {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // additional minutes
}

// Booking Types
export enum BookingStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  SCHEDULED = 'SCHEDULED',
  EN_ROUTE = 'EN_ROUTE',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export interface Booking {
  id: string;
  customerId: string;
  providerId: string;
  vehicleId: string;
  serviceId: string;
  addOnIds: string[];
  status: BookingStatus;
  scheduledDate: string;
  scheduledTime: string;
  location: Location;
  pricing: BookingPricing;
  payment: Payment;
  notes?: string;
  estimatedDuration: number;
  actualStartTime?: string;
  actualEndTime?: string;
  beforeImages: string[];
  afterImages: string[];
  chatRoomId: string;
  review?: Review;
  createdAt: string;
  updatedAt: string;
}

export interface BookingPricing {
  servicePrice: number;
  addOnsPrice: number;
  subtotal: number;
  tax: number;
  platformFee: number;
  tip: number;
  discount: number;
  total: number;
  currency: string;
}

export interface Location {
  address: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  coordinates: Coordinates;
  placeId?: string;
}

export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Payment Types
export enum PaymentMethod {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  APPLE_PAY = 'APPLE_PAY',
  GOOGLE_PAY = 'GOOGLE_PAY',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CASH = 'CASH',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  status: PaymentStatus;
  stripePaymentIntentId?: string;
  transactionDate: string;
  refundAmount?: number;
  refundDate?: string;
  receiptUrl?: string;
}

export interface PaymentMethodCard {
  id: string;
  customerId: string;
  type: PaymentMethod;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
  stripePaymentMethodId: string;
}

// Review & Rating Types
export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  overallRating: number;
  qualityRating: number;
  timelinessRating: number;
  communicationRating: number;
  comment: string;
  images: string[];
  providerResponse?: string;
  providerResponseDate?: string;
  isModerated: boolean;
  createdAt: string;
  updatedAt: string;
}

// Loyalty & Rewards Types
export enum MembershipTier {
  BASIC = 'BASIC',
  PREMIUM = 'PREMIUM',
  VIP = 'VIP',
}

export interface LoyaltyProgram {
  customerId: string;
  points: number;
  tier: MembershipTier;
  tierBenefits: string[];
  pointsHistory: PointsTransaction[];
  referralCode: string;
  referralsCount: number;
}

export interface PointsTransaction {
  id: string;
  points: number;
  type: 'EARNED' | 'REDEEMED' | 'EXPIRED';
  reason: string;
  date: string;
}

// Notification Types
export enum NotificationType {
  BOOKING_CONFIRMED = 'BOOKING_CONFIRMED',
  BOOKING_REMINDER = 'BOOKING_REMINDER',
  PROVIDER_EN_ROUTE = 'PROVIDER_EN_ROUTE',
  SERVICE_STARTED = 'SERVICE_STARTED',
  SERVICE_COMPLETED = 'SERVICE_COMPLETED',
  PAYMENT_PROCESSED = 'PAYMENT_PROCESSED',
  REVIEW_REQUEST = 'REVIEW_REQUEST',
  PROMOTION = 'PROMOTION',
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

// Chat Types
export interface ChatMessage {
  id: string;
  chatRoomId: string;
  senderId: string;
  senderRole: UserRole;
  message: string;
  images?: string[];
  timestamp: string;
  isRead: boolean;
}

export interface ChatRoom {
  id: string;
  bookingId: string;
  customerId: string;
  providerId: string;
  messages: ChatMessage[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  isActive: boolean;
  createdAt: string;
}

// Provider Business Types
export interface Availability {
  dayOfWeek: number; // 0-6, Sunday-Saturday
  isAvailable: boolean;
  slots: TimeSlot[];
}

export interface TimeSlot {
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  capacity: number;
}

export interface Staff {
  id: string;
  providerId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  createdAt: string;
}

export interface BankAccount {
  id: string;
  providerId: string;
  accountHolderName: string;
  accountNumber: string;
  routingNumber: string;
  bankName: string;
  isVerified: boolean;
}

export interface Document {
  id: string;
  type: DocumentType;
  name: string;
  url: string;
  status: DocumentStatus;
  uploadedAt: string;
  verifiedAt?: string;
}

export enum DocumentType {
  BUSINESS_LICENSE = 'BUSINESS_LICENSE',
  INSURANCE = 'INSURANCE',
  IDENTIFICATION = 'IDENTIFICATION',
  BACKGROUND_CHECK = 'BACKGROUND_CHECK',
}

export enum DocumentStatus {
  PENDING_REVIEW = 'PENDING_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// Analytics & Reporting Types
export interface ProviderEarnings {
  providerId: string;
  period: string;
  totalEarnings: number;
  platformFees: number;
  netEarnings: number;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  averageRating: number;
  topServices: ServicePerformance[];
}

export interface ServicePerformance {
  serviceId: string;
  serviceName: string;
  bookingsCount: number;
  revenue: number;
}

// Misc Types
export interface Address {
  id: string;
  type: 'HOME' | 'WORK' | 'OTHER';
  label: string;
  location: Location;
  isDefault: boolean;
}

export interface BookingHistory {
  bookingId: string;
  date: string;
  serviceType: string;
  provider: string;
  cost: number;
}

export interface MaintenanceReminder {
  id: string;
  vehicleId: string;
  type: string;
  description: string;
  dueDate: string;
  isCompleted: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: UserRole;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthState {
  user: User | Customer | Provider | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Search & Discovery Types
export interface SearchFilters {
  serviceCategory?: ServiceCategory;
  vehicleType?: VehicleType;
  minRating?: number;
  maxPrice?: number;
  minPrice?: number;
  distance?: number; // in km
  availability?: string; // date
  coordinates?: Coordinates;
}

export interface ProviderSearchResult {
  provider: Provider;
  distance: number;
  estimatedPrice: number;
  nextAvailability: string;
  isFavorite: boolean;
}

// Promo & Discount Types
export interface PromoCode {
  id: string;
  code: string;
  description: string;
  discountType: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderValue?: number;
  maxDiscount?: number;
  validFrom: string;
  validUntil: string;
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
}
