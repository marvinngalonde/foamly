# Modern State Management: Redux vs Zustand vs TanStack Query

## TL;DR - The Best Modern Approach

**For Foamly, the optimal solution is:**
```
Zustand (client state) + TanStack Query (server state)
```

This combination is:
- ✅ Less boilerplate than Redux
- ✅ Better TypeScript experience
- ✅ Easier to learn and maintain
- ✅ More performant
- ✅ Modern best practices

## Why Redux Was Initially Used

Redux Toolkit was chosen because it's:
1. Well-established and proven
2. Excellent documentation
3. Great DevTools
4. Familiar to most React developers

**However**, for a modern greenfield project in 2025, **Zustand + TanStack Query is superior**.

## Detailed Comparison

### 1. Zustand vs Redux Toolkit

#### Zustand Advantages ⭐

**Less Boilerplate:**
```typescript
// Redux Toolkit (Current)
// authSlice.ts - 180+ lines
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: { ... },
  extraReducers: (builder) => { ... }
});

// Zustand (Better)
// authStore.ts - 60 lines
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  login: async (credentials) => {
    const response = await authService.login(credentials);
    set({ user: response.user, isAuthenticated: true });
  },
  logout: () => set({ user: null, isAuthenticated: false }),
}));
```

**Simpler Usage:**
```typescript
// Redux
const dispatch = useAppDispatch();
const user = useAppSelector(state => state.auth.user);
dispatch(login(credentials));

// Zustand
const { user, login } = useAuthStore();
await login(credentials);
```

**Better Performance:**
- Zustand uses direct subscription (no Context)
- Avoids unnecessary re-renders
- Smaller bundle size (~1kb vs Redux ~20kb)

**TypeScript Experience:**
- Full type inference out of the box
- No manual typing of actions/reducers
- Better IDE autocomplete

#### Redux Toolkit Advantages

- More mature ecosystem
- Excellent DevTools (though Zustand has devtools too)
- Time-travel debugging
- Middleware ecosystem

### 2. TanStack Query for Server State

**Why TanStack Query is Essential:**

```typescript
// Without TanStack Query (Current approach)
// Manual loading states, error handling, caching
const [services, setServices] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await serviceService.getAll();
      setServices(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };
  fetchServices();
}, []);

// With TanStack Query (Better)
const { data: services, isLoading, error } = useQuery({
  queryKey: ['services'],
  queryFn: serviceService.getAll,
  staleTime: 5 * 60 * 1000, // Auto refetch after 5 min
});
```

**Benefits:**
- ✅ Automatic caching and refetching
- ✅ Background updates
- ✅ Optimistic updates
- ✅ Pagination and infinite scroll built-in
- ✅ Request deduplication
- ✅ Offline support
- ✅ Prefetching

### 3. The Recommended Modern Stack

## 🎯 Recommended Migration

### Architecture:
```
┌─────────────────────────────────────────┐
│  Components                              │
├─────────────────────────────────────────┤
│  Zustand Stores (Client State)          │
│  - authStore                             │
│  - bookingFlowStore                      │
│  - uiStore                               │
├─────────────────────────────────────────┤
│  TanStack Query (Server State)           │
│  - useServices()                         │
│  - useBookings()                         │
│  - useVehicles()                         │
└─────────────────────────────────────────┘
```

### Implementation Example

#### 1. Zustand for Auth State

```typescript
// stores/authStore.ts
import create from 'zustand';
import { persist } from 'zustand/middleware';
import { User, AuthTokens } from '@/types';
import { authService } from '@/services/auth.service';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const response = await authService.login(credentials);
          set({
            user: response.user,
            tokens: response.tokens,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true });
        try {
          const response = await authService.register(data);
          set({
            user: response.user,
            tokens: response.tokens,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        await authService.logout();
        set({
          user: null,
          tokens: null,
          isAuthenticated: false,
        });
      },

      setUser: (user) => set({ user }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        tokens: state.tokens,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
```

#### 2. Zustand for Booking Flow

```typescript
// stores/bookingStore.ts
import create from 'zustand';
import { Vehicle, Service, Provider, AddOn, Location } from '@/types';

interface BookingFlowState {
  selectedVehicle: Vehicle | null;
  selectedService: Service | null;
  selectedProvider: Provider | null;
  selectedAddOns: AddOn[];
  selectedDate: string | null;
  selectedTime: string | null;
  selectedLocation: Location | null;

  // Actions
  setSelectedVehicle: (vehicle: Vehicle) => void;
  setSelectedService: (service: Service) => void;
  setSelectedProvider: (provider: Provider) => void;
  toggleAddOn: (addOn: AddOn) => void;
  setSelectedDate: (date: string) => void;
  setSelectedTime: (time: string) => void;
  setSelectedLocation: (location: Location) => void;
  resetFlow: () => void;
}

export const useBookingStore = create<BookingFlowState>((set) => ({
  selectedVehicle: null,
  selectedService: null,
  selectedProvider: null,
  selectedAddOns: [],
  selectedDate: null,
  selectedTime: null,
  selectedLocation: null,

  setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),
  setSelectedService: (service) => set({ selectedService: service }),
  setSelectedProvider: (provider) => set({ selectedProvider: provider }),

  toggleAddOn: (addOn) =>
    set((state) => {
      const exists = state.selectedAddOns.find((a) => a.id === addOn.id);
      return {
        selectedAddOns: exists
          ? state.selectedAddOns.filter((a) => a.id !== addOn.id)
          : [...state.selectedAddOns, addOn],
      };
    }),

  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedTime: (time) => set({ selectedTime: time }),
  setSelectedLocation: (location) => set({ selectedLocation: location }),

  resetFlow: () =>
    set({
      selectedVehicle: null,
      selectedService: null,
      selectedProvider: null,
      selectedAddOns: [],
      selectedDate: null,
      selectedTime: null,
      selectedLocation: null,
    }),
}));
```

#### 3. TanStack Query for Server Data

```typescript
// queries/vehicles.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { vehicleService } from '@/services/vehicle.service';
import { Vehicle } from '@/types';

export const useVehicles = () => {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: vehicleService.getVehicles,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

export const useAddVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vehicleService.addVehicle,
    onSuccess: () => {
      // Automatically refetch vehicles
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: vehicleService.deleteVehicle,
    onMutate: async (vehicleId) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['vehicles'] });

      // Snapshot the previous value
      const previousVehicles = queryClient.getQueryData<Vehicle[]>(['vehicles']);

      // Optimistically update
      queryClient.setQueryData<Vehicle[]>(['vehicles'], (old) =>
        old?.filter((v) => v.id !== vehicleId)
      );

      return { previousVehicles };
    },
    onError: (err, vehicleId, context) => {
      // Rollback on error
      queryClient.setQueryData(['vehicles'], context?.previousVehicles);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
    },
  });
};
```

```typescript
// queries/bookings.ts
export const useActiveBookings = () => {
  return useQuery({
    queryKey: ['bookings', 'active'],
    queryFn: bookingService.getActiveBookings,
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

export const useCreateBooking = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingService.createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', 'active'] });
    },
  });
};
```

#### 4. Usage in Components

```typescript
// app/(tabs)/bookings.tsx
import { useActiveBookings } from '@/queries/bookings';
import { useAuthStore } from '@/stores/authStore';

export default function BookingsScreen() {
  // Auth state from Zustand
  const user = useAuthStore((state) => state.user);

  // Server data from TanStack Query
  const { data: bookings, isLoading, error, refetch } = useActiveBookings();

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <FlatList
      data={bookings}
      refreshing={isLoading}
      onRefresh={refetch}
      renderItem={({ item }) => <BookingCard booking={item} />}
    />
  );
}
```

```typescript
// app/booking/new/vehicle-selection.tsx
import { useVehicles } from '@/queries/vehicles';
import { useBookingStore } from '@/stores/bookingStore';

export default function VehicleSelectionScreen() {
  const { data: vehicles, isLoading } = useVehicles();
  const { selectedVehicle, setSelectedVehicle } = useBookingStore();

  return (
    <FlatList
      data={vehicles}
      renderItem={({ item }) => (
        <VehicleCard
          vehicle={item}
          isSelected={selectedVehicle?.id === item.id}
          onSelect={() => setSelectedVehicle(item)}
        />
      )}
    />
  );
}
```

```typescript
// app/(auth)/login.tsx
import { useAuthStore } from '@/stores/authStore';

export default function LoginScreen() {
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const handleLogin = async (credentials: LoginCredentials) => {
    try {
      await login(credentials);
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return <LoginForm onSubmit={handleLogin} loading={isLoading} />;
}
```

## Migration Steps

### 1. Install New Dependencies

```bash
npm install zustand @tanstack/react-query
npm install --save-dev @tanstack/eslint-plugin-query
```

### 2. Remove Redux (Optional)

```bash
npm uninstall @reduxjs/toolkit react-redux
```

### 3. Setup TanStack Query

```typescript
// app/_layout.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider>
        <Slot />
      </PaperProvider>
    </QueryClientProvider>
  );
}
```

### 4. Create Zustand Stores

Create the stores shown above in `stores/` directory.

### 5. Create Query Hooks

Create query hooks shown above in `queries/` directory.

### 6. Update Components

Replace Redux hooks with Zustand and TanStack Query hooks.

## Performance Comparison

| Feature | Redux | Zustand | TanStack Query |
|---------|-------|---------|----------------|
| Bundle Size | ~20kb | ~1kb | ~10kb |
| Boilerplate | High | Minimal | Minimal |
| Learning Curve | Steep | Gentle | Gentle |
| TypeScript | Good | Excellent | Excellent |
| DevTools | Excellent | Good | Excellent |
| Server State | Manual | Manual | Automatic |
| Caching | Manual | Manual | Automatic |
| Re-renders | Can be excessive | Optimized | Optimized |

## Code Comparison

### Creating a Store

**Redux Toolkit (Current - 180 lines):**
- Define types
- Create initial state
- Create slice with reducers
- Create async thunks
- Export actions and reducer
- Configure store
- Create typed hooks

**Zustand (60 lines):**
- Define interface
- Create store with actions inline
- Done!

### Using in Components

**Redux:**
```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login, selectUser, selectIsLoading } from '@/store/slices/authSlice';

const dispatch = useAppDispatch();
const user = useAppSelector(selectUser);
const isLoading = useAppSelector(selectIsLoading);

dispatch(login(credentials));
```

**Zustand:**
```typescript
import { useAuthStore } from '@/stores/authStore';

const { user, isLoading, login } = useAuthStore();

await login(credentials);
```

**TanStack Query:**
```typescript
import { useVehicles, useAddVehicle } from '@/queries/vehicles';

const { data: vehicles, isLoading } = useVehicles();
const addVehicleMutation = useAddVehicle();

await addVehicleMutation.mutateAsync(newVehicle);
// Vehicles list automatically updates!
```

## Recommendation

### For Foamly:

**Migrate to: Zustand + TanStack Query**

**Why:**
1. 70% less boilerplate code
2. Better developer experience
3. Automatic server state management
4. Better performance
5. Modern best practices for 2025
6. Easier to maintain and test

**When:**
- If you haven't started backend integration: **Migrate now**
- If you have backend integrated: **Migrate incrementally**

### Migration Priority:

1. **Phase 1**: Add TanStack Query for all server data fetching
2. **Phase 2**: Replace Redux with Zustand for auth state
3. **Phase 3**: Replace Redux with Zustand for booking flow
4. **Phase 4**: Remove Redux entirely

## Resources

- **Zustand**: https://zustand-demo.pmnd.rs/
- **TanStack Query**: https://tanstack.com/query/latest
- **Migration Guide**: https://tkdodo.eu/blog/leveraging-the-query-function-context
- **Zustand Persist**: https://github.com/pmndrs/zustand#persist-middleware

---

**Bottom Line**: For a modern React Native app in 2025, **Zustand + TanStack Query** is the superior choice. Would you like me to migrate the codebase to this stack?
