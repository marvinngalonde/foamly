# Foamly Backend Integration Guide

## Overview
The Foamly app now has complete backend integration using:
- **Supabase** for database and authentication
- **Drizzle ORM** for type-safe database queries
- **TanStack Query** for data fetching and caching
- **Zustand** for client state management
- **Zod** for data validation

## Architecture

### Database Layer (`lib/db.ts`)
- Drizzle client configured with Supabase PostgreSQL connection
- Schema defined in `db/schema.ts` with 7 tables

### API Service Layer (`lib/api/`)
All API functions use Supabase client directly:
- `services.ts` - Service CRUD operations
- `vehicles.ts` - Vehicle management
- `bookings.ts` - Booking management
- `providers.ts` - Provider profiles
- `reviews.ts` - Review and rating system

### Validation Layer (`lib/validations.ts`)
Zod schemas for all entities with TypeScript type exports

### React Query Hooks (`hooks/`)
Custom hooks wrapping TanStack Query:
- `useServices.ts` - Service queries and mutations
- `useVehicles.ts` - Vehicle operations
- `useBookings.ts` - Booking management
- `useProviders.ts` - Provider queries
- `useReviews.ts` - Review operations

## Completed Integrations

### ✅ Services Screen (`app/(tabs)/services.tsx`)
**Features:**
- Fetches all services from database
- Category filtering by service type
- Search functionality
- Loading and error states
- Displays provider ratings

**Hooks Used:**
```typescript
const { data: services, isLoading, error } = useServices();
```

### ✅ Vehicles Screen (`app/(tabs)/vehicles.tsx`)
**Features:**
- Loads user's vehicles from database
- Set default vehicle
- Delete vehicle with confirmation
- Loading states
- Empty state handling

**Hooks Used:**
```typescript
const { data: vehicles, isLoading } = useUserVehicles(userId);
const setDefaultMutation = useSetDefaultVehicle(userId);
const deleteMutation = useDeleteVehicle(userId);
```

### ✅ Home Dashboard (`app/(tabs)/index.tsx`)
**Features:**
- Displays featured services from database
- Shows recent bookings with real data
- Lists recommended providers
- All data comes from backend APIs

**Hooks Used:**
```typescript
const { data: services } = useServices();
const { data: bookings } = useCustomerBookings(userId);
const { data: providers } = useProviders();
```

## Remaining Integrations Needed

### 🔄 Bookings Screen (`app/(tabs)/bookings.tsx`)
**Required Changes:**
1. Import `useCustomerBookings` or `useProviderBookings` based on user role
2. Replace mock data with real bookings
3. Add loading and error states
4. Implement cancel booking functionality

**Example Code:**
```typescript
import { useCustomerBookings, useCancelBooking } from '@/hooks/useBookings';

const { data: bookings, isLoading } = useCustomerBookings(user?.id);
const cancelMutation = useCancelBooking();
```

### 🔄 Provider Dashboard (`app/(tabs)/provider-dashboard.tsx`)
**Required Changes:**
1. Use `useProviderBookings` to get provider's bookings
2. Use `useProviderByUserId` to get provider profile
3. Calculate metrics from real booking data
4. Use `useProviderReviews` for reviews section

**Example Code:**
```typescript
import { useProviderBookings } from '@/hooks/useBookings';
import { useProviderByUserId } from '@/hooks/useProviders';
import { useProviderReviews } from '@/hooks/useReviews';

const { data: provider } = useProviderByUserId(user?.id);
const { data: bookings } = useProviderBookings(provider?.id);
const { data: reviews } = useProviderReviews(provider?.id);
```

### 🔄 Booking Flow Screens
#### Service Selection (`app/booking/service-selection.tsx`)
- Use `useServices` to load available services
- Allow service selection and pass to next screen

#### Provider Selection (`app/booking/provider-selection.tsx`)
- Use `useProviders` or `useSearchProviders`
- Filter by selected service
- Display real provider data

#### Booking Confirmation
- Use `useCreateBooking` mutation
- Validate all required data (service, provider, vehicle, datetime)
- Handle success/error states

**Example Code:**
```typescript
import { useCreateBooking } from '@/hooks/useBookings';

const createBookingMutation = useCreateBooking(user?.id);

const handleBooking = () => {
  createBookingMutation.mutate({
    providerId,
    serviceId,
    vehicleId,
    scheduledDate: new Date().toISOString(),
    location: '123 Main St',
    totalPrice: 75.00,
  });
};
```

### 🔄 Review Screen (`app/booking/review.tsx`)
**Required Changes:**
1. Accept booking ID as route param
2. Use `useCreateReview` mutation
3. Validate rating (1-5) before submission
4. Handle photo uploads (future feature)

**Example Code:**
```typescript
import { useCreateReview } from '@/hooks/useReviews';

const createReviewMutation = useCreateReview(user?.id);

const handleSubmit = () => {
  createReviewMutation.mutate({
    bookingId,
    rating: overallRating,
    qualityRating,
    timelinessRating,
    communicationRating,
    comment: reviewText,
  });
};
```

### 🔄 Profile Screen (`app/(tabs)/profile.tsx`)
**Required Changes:**
1. Display real user data from Zustand store
2. Implement profile update functionality
3. Add payment methods integration (Stripe)
4. Connect to real settings

## Database Setup

### 1. Run Migration
Execute `supabase-migration.sql` in Supabase SQL Editor to create all tables.

### 2. Set Up RLS Policies
Execute `supabase-rls-fix.sql` to configure Row Level Security.

### 3. Seed Data
1. Register users through the app (both customers and providers)
2. Get user IDs from Supabase dashboard
3. Edit `supabase-seed-data.sql` and replace all `REPLACE_WITH_*` placeholders
4. Run the seed script

## Environment Variables

Ensure `.env` contains:
```env
EXPO_PUBLIC_SUPABASE_URL=https://dybichwjtjbtppkjpgkf.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
DATABASE_URL=postgresql://postgres.dybichwjtjbtppkjpgkf:password@host:port/postgres
```

## Testing Backend Integration

### 1. Authentication Flow
- Register new customer ✅
- Register new provider ✅
- Login with credentials ✅
- Session persistence ✅

### 2. Services
- View all services ✅
- Filter by category ✅
- Search services ✅

### 3. Vehicles
- Add new vehicle (need to create form)
- View vehicles ✅
- Set default vehicle ✅
- Delete vehicle ✅

### 4. Bookings
- Create booking (need to integrate booking flow)
- View bookings (need to integrate bookings screen)
- Update status (providers only)
- Cancel booking

### 5. Reviews
- Submit review after completed booking
- View provider reviews
- Calculate average ratings

## API Error Handling

All API calls include error handling:
```typescript
const { data, isLoading, error } = useServices();

if (error) {
  return <ErrorMessage message={error.message} />;
}
```

## Mutation Patterns

All mutations follow this pattern:
```typescript
const mutation = useSomeMutation();

mutation.mutate(data, {
  onSuccess: () => {
    Alert.alert('Success', 'Operation completed');
  },
  onError: (error) => {
    Alert.alert('Error', error.message);
  },
});
```

## Query Invalidation

TanStack Query automatically invalidates related queries after mutations:
- Creating a booking → invalidates customer bookings list
- Adding a review → invalidates provider reviews & rating
- Setting default vehicle → invalidates vehicles list

## Type Safety

All API functions return strongly typed data:
```typescript
const { data: services } = useServices();
// services is Service[] with full type information

const { data: booking } = useBooking(id);
// booking is Booking with all related data
```

## Performance Optimizations

1. **Query Caching** - TanStack Query caches data for 1 minute
2. **Automatic Refetching** - Stale data refetched on screen focus
3. **Optimistic Updates** - Mutations can update cache immediately
4. **Pagination** - Can be added with useInfiniteQuery
5. **Lazy Loading** - Queries only run when enabled

## Next Steps

1. ✅ Complete remaining screen integrations (Bookings, Provider Dashboard)
2. Create vehicle add/edit forms
3. Complete booking flow integration
4. Add payment processing (Stripe)
5. Implement real-time tracking
6. Add push notifications
7. Implement image uploads for vehicles and reviews
8. Add location services integration

## Troubleshooting

### "No data showing"
- Check if seed data has been added to database
- Verify user is authenticated
- Check Supabase RLS policies
- Look for errors in console

### "Mutation not working"
- Check if user has permission (RLS policies)
- Verify all required fields are provided
- Check validation schema requirements
- Look at network tab for API errors

### "Type errors"
- Run `npm install` to ensure all types are installed
- Check that Drizzle schema matches database
- Verify Zod schemas match API expectations

## File Structure
```
lib/
├── api/
│   ├── services.ts      # Service operations
│   ├── vehicles.ts      # Vehicle CRUD
│   ├── bookings.ts      # Booking management
│   ├── providers.ts     # Provider queries
│   └── reviews.ts       # Review system
├── db.ts                # Drizzle client
├── supabase.ts          # Supabase client
└── validations.ts       # Zod schemas

hooks/
├── useServices.ts       # Service hooks
├── useVehicles.ts       # Vehicle hooks
├── useBookings.ts       # Booking hooks
├── useProviders.ts      # Provider hooks
└── useReviews.ts        # Review hooks

db/
└── schema.ts            # Database schema

supabase-migration.sql   # Initial schema
supabase-rls-fix.sql     # RLS policies
supabase-seed-data.sql   # Sample data
```

## Summary

✅ **Completed:**
- Full backend API service layer
- TanStack Query hooks for all entities
- Zod validation schemas
- Services screen integration
- Vehicles screen integration
- Home dashboard integration
- Seed data script

🔄 **Remaining:**
- Bookings screen
- Provider dashboard
- Booking flow (3 screens)
- Review submission
- Profile updates
- Vehicle add/edit forms
- Payment integration

The foundation is complete! All the infrastructure is in place. You just need to replace mock data with API hooks in the remaining screens using the same patterns demonstrated in Services, Vehicles, and Home screens.
