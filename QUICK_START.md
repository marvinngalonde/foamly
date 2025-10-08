# 🚀 Foamly - Quick Start Guide

## Phase 1 MVP is COMPLETE! ✅

Everything is ready to run. Here's how to get started:

---

## 📦 Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

---

## 🗄️ Database Setup

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Copy the project URL and anon key

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env`:
```env
EXPO_PUBLIC_SUPABASE_URL=your_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Run Database Migrations
In Supabase SQL Editor, execute in order:
1. `supabase-migration.sql` - Creates tables
2. `supabase-rls-fix.sql` - Sets up Row Level Security
3. `supabase-seed-data.sql` - Adds sample data (optional)

---

## 🎯 What's Implemented

### ✅ Customer App (100% Complete)
- **Service Booking Flow**: Browse → Select Service → Choose Provider → Pick Time → Confirm
- **Vehicle Management**: Add, edit, delete vehicles
- **Bookings**: View, track, and cancel bookings
- **Reviews**: Submit ratings and feedback
- **Profile**: Edit personal information

### ✅ Provider App (100% Complete)
- **Dashboard**: Real-time metrics and today's schedule
- **Schedule & Calendar**: Day/Week/Month views with bookings
- **Booking Management**: Accept, reject, update status
- **Service Management**: Add, edit, activate/deactivate services
- **Reviews**: View customer feedback

---

## 🏗️ Architecture

### State Management
- **Zustand** for client state (auth, booking flow, UI)
- **TanStack Query** for server state (API data, caching)

### Backend Integration
- **Supabase** for database and authentication
- **Drizzle ORM** for type-safe database queries

### Key Files

#### Stores (Zustand)
```typescript
stores/
├── authStore.ts       // Authentication state
├── bookingStore.ts    // Booking flow state
└── uiStore.ts         // UI state (modals, loading)
```

#### Hooks (TanStack Query)
```typescript
hooks/
├── useServices.ts     // Services CRUD
├── useVehicles.ts     // Vehicles CRUD
├── useBookings.ts     // Bookings CRUD
├── useProviders.ts    // Providers CRUD
└── useReviews.ts      // Reviews CRUD
```

#### API Layer
```typescript
lib/api/
├── services.ts        // Services API
├── vehicles.ts        // Vehicles API
├── bookings.ts        // Bookings API
├── providers.ts       // Providers API
└── reviews.ts         // Reviews API
```

---

## 🔑 Key Patterns

### 1. Using Zustand Stores
```typescript
import { useAuthStore } from '@/stores/authStore';

const { user, login, logout, isLoading } = useAuthStore();

await login({ email, password });
```

### 2. Fetching Data (TanStack Query)
```typescript
import { useServices } from '@/hooks/useServices';

const { data: services, isLoading, error } = useServices();

if (isLoading) return <Loading />;
if (error) return <Error />;
return <List data={services} />;
```

### 3. Creating/Updating Data
```typescript
import { useCreateBooking } from '@/hooks/useBookings';

const createMutation = useCreateBooking(userId);

await createMutation.mutateAsync({
  providerId,
  serviceId,
  vehicleId,
  scheduledDate,
  totalPrice,
});
```

---

## 📱 Navigation

### Customer Flow
```
(tabs)/index (Home)
  → booking/service-selection
  → booking/provider-selection
  → booking/datetime-selection
  → booking/confirmation
  → (tabs)/bookings (View bookings)
```

### Provider Flow
```
(tabs)/provider-dashboard
  → provider/schedule (Calendar view)
  → provider/bookings/[id] (Booking details)
  → provider/services (Services list)
  → provider/services/add
  → provider/services/[id]/edit
```

---

## 🧪 Testing the App

### As a Customer:
1. Register as customer
2. Add a vehicle
3. Browse services
4. Select a service
5. Choose a provider
6. Pick date & time
7. Confirm booking
8. View in Bookings tab
9. Submit a review (after completion)

### As a Provider:
1. Register as provider
2. Add services
3. View dashboard with metrics
4. Check schedule/calendar
5. Accept/reject bookings
6. Update booking status
7. View reviews

---

## 🎨 Tech Stack

### Frontend
- **React Native** (0.81.4)
- **Expo** (SDK 54)
- **TypeScript** (5.9.2)
- **React Navigation** (Expo Router)

### State & Data
- **Zustand** (5.0.8) - Client state
- **TanStack Query** (5.90.2) - Server state
- **Axios** (1.12.2) - HTTP client

### Backend & Database
- **Supabase** (2.58.0) - Backend platform
- **Drizzle ORM** (0.44.6) - Type-safe SQL
- **PostgreSQL** - Database

### UI & Validation
- **React Native Paper** (5.14.5) - UI components
- **Formik** (2.4.6) - Form handling
- **Yup** (1.7.1) - Validation
- **Zod** (4.1.11) - Schema validation

---

## 🐛 Troubleshooting

### Clear Cache
```bash
npx expo start --clear
```

### Type Errors
```bash
npx tsc --noEmit
```

### Database Issues
- Check RLS policies in Supabase dashboard
- Verify user IDs match database records
- Check Supabase logs for errors

### State Not Updating
- TanStack Query caches for 1 minute by default
- Use `refetch()` to manually refresh
- Check query invalidation after mutations

---

## 📂 Project Structure

```
foamly/
├── app/                          # Screens (Expo Router)
│   ├── (auth)/                  # Auth screens
│   ├── (tabs)/                  # Tab navigation
│   ├── booking/                 # Booking flow
│   ├── vehicles/                # Vehicle management
│   ├── profile/                 # Profile screens
│   └── provider/                # Provider screens
├── stores/                       # Zustand stores
├── hooks/                        # TanStack Query hooks
├── lib/                          # API & utilities
│   ├── api/                     # API functions
│   ├── validations.ts           # Zod schemas
│   ├── supabase.ts             # Supabase client
│   └── db.ts                    # Database client
├── types/                        # TypeScript types
├── db/                           # Drizzle schema
├── constants/                    # App constants
└── utils/                        # Utility functions
```

---

## 🚀 Next Steps

### Phase 2 Enhancements (Optional)
- Payment Integration (Stripe)
- Real-time Tracking (Maps)
- In-app Chat
- Push Notifications
- Analytics Dashboard
- Team Management
- Inventory Tracking

### Deployment
```bash
# Build for production
eas build --platform ios
eas build --platform android

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

---

## 📝 Important Notes

- All API calls use TypeScript for type safety
- Authentication state persists across app restarts
- TanStack Query handles caching and background refetching
- All forms have validation
- Error handling is implemented throughout
- Loading states are shown during async operations

---

## 🎉 You're All Set!

Phase 1 MVP is complete and ready to use. Start the app, create some test accounts, and explore the features!

**Happy coding!** 🚀

For questions or issues, check:
- [PHASE1_MVP_COMPLETE.md](PHASE1_MVP_COMPLETE.md) - Feature list
- [BACKEND_INTEGRATION.md](BACKEND_INTEGRATION.md) - API integration guide
- [MIGRATION_COMPLETE.md](MIGRATION_COMPLETE.md) - State management guide
