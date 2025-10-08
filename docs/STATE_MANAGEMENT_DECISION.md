# State Management Decision: Redux Toolkit vs TanStack Query

## Why Redux Toolkit was chosen for Foamly

### Executive Summary

Redux Toolkit was selected for this project because Foamly requires **complex client-side state management** beyond just server state, including booking flows, real-time updates, and offline capabilities.

## Comparison: Redux Toolkit vs TanStack Query

### TanStack Query (React Query)
**Best for:** Server state management, caching, and data fetching

**Pros:**
- Excellent for server state synchronization
- Built-in caching and background refetching
- Automatic loading and error states
- Less boilerplate for data fetching
- Great DevTools

**Cons:**
- Primarily focused on **server state only**
- Limited for complex client-side state logic
- Harder to manage cross-feature state
- Multi-step workflows are more complex

### Redux Toolkit
**Best for:** Complex application state, client-side workflows

**Pros:**
- Manages **both client and server state**
- Perfect for multi-step flows (booking process)
- Centralized state for complex workflows
- Better for offline-first apps
- Excellent debugging with Redux DevTools
- Predictable state updates

**Cons:**
- More boilerplate (though Redux Toolkit reduces this significantly)
- Steeper learning curve for beginners
- Requires more setup

## Why Redux Toolkit Wins for Foamly

### 1. **Complex Booking Flow State**

Foamly's booking flow has **7 steps** that need coordinated state:

```typescript
Vehicle Selection → Service Selection → Provider Selection →
Date/Time → Location → Add-ons → Payment → Confirmation
```

**With Redux:**
```typescript
// All booking state in one place
const bookingState = {
  selectedVehicle: Vehicle,
  selectedService: Service,
  selectedProvider: Provider,
  selectedAddOns: AddOn[],
  selectedDate: string,
  selectedTime: string,
  pricing: BookingPricing,
}

// Easy to access across all 7 screens
const booking = useAppSelector(state => state.booking);
```

**With TanStack Query:**
- Each step would need separate state management
- Sharing state between steps requires React Context or props
- More complex to coordinate

### 2. **Offline-First Capabilities**

Foamly needs to work offline for:
- Viewing past bookings
- Browsing saved services
- Managing vehicles

Redux with Redux Persist makes this trivial:
```typescript
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['booking', 'vehicle', 'user']
};
```

TanStack Query requires additional libraries and setup for offline support.

### 3. **Real-Time Updates**

For provider tracking and booking status:
```typescript
// Redux makes it easy to update state from WebSocket
socket.on('booking:updated', (data) => {
  dispatch(updateBookingStatus(data));
});

// Immediately reflects across all components
```

### 4. **Authentication State**

Auth state needs to be:
- Available globally
- Persist across sessions
- Control navigation
- Sync with secure storage

Redux centralizes this perfectly:
```typescript
const authState = {
  user: User | null,
  tokens: AuthTokens | null,
  isAuthenticated: boolean,
}
```

### 5. **Provider Dashboard**

Providers need complex client-side state:
- Calendar with drag-and-drop bookings
- Real-time booking requests
- Earnings calculations
- Staff management

All benefit from centralized Redux state.

## Hybrid Approach (Recommended for Future)

You can actually **use both**:

```typescript
// Redux for client state and workflows
- Booking flow state
- Auth state
- UI state (modals, filters)
- Real-time updates

// TanStack Query for server data
- Fetching service catalog
- Loading provider list
- Fetching booking history
- User profile data
```

### Example Hybrid Implementation:

```typescript
// Using TanStack Query for data fetching
const { data: services } = useQuery({
  queryKey: ['services'],
  queryFn: serviceService.getAll,
});

// Using Redux for booking flow state
const dispatch = useAppDispatch();
const selectedService = useAppSelector(state => state.booking.selectedService);

const handleSelectService = (service: Service) => {
  dispatch(setSelectedService(service));
  router.push('/booking/provider-selection');
};
```

## Migration Path (If Desired)

If you want to add TanStack Query later:

1. **Install TanStack Query**
```bash
npm install @tanstack/react-query
```

2. **Keep Redux for:**
   - Booking flow state
   - Auth state
   - UI state
   - Real-time updates

3. **Use TanStack Query for:**
   - Fetching services list
   - Loading providers
   - Booking history
   - Reviews and ratings

4. **Example:**

```typescript
// queries/services.ts
export const useServices = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      return await apiService.get<Service[]>('/services');
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// In component
const { data: services, isLoading } = useServices();
const dispatch = useAppDispatch();

const handleSelectService = (service: Service) => {
  dispatch(setSelectedService(service)); // Redux for booking flow
  router.push('/next-step');
};
```

## Conclusion

**Redux Toolkit** is the right choice for Foamly's MVP because:

1. ✅ Complex multi-step booking workflow
2. ✅ Mixed client and server state
3. ✅ Offline-first requirements
4. ✅ Real-time updates
5. ✅ Provider business management complexity

**TanStack Query** would be excellent to add later for:
- Server data fetching and caching
- Background data synchronization
- Optimistic updates for mutations

Both libraries are excellent - the choice depends on your app's specific needs. For Foamly's requirements, Redux Toolkit provides the best foundation, with the option to add TanStack Query for enhanced server state management in the future.

## Quick Comparison Table

| Feature | Redux Toolkit | TanStack Query |
|---------|--------------|----------------|
| Server State | ✅ Good | ⭐ Excellent |
| Client State | ⭐ Excellent | ⚠️ Manual Context |
| Multi-step Flows | ⭐ Excellent | ⚠️ Complex |
| Offline Support | ⭐ Native | ⚠️ Additional Setup |
| Real-time Updates | ⭐ Excellent | ✅ Good |
| Learning Curve | ⚠️ Moderate | ✅ Easy |
| Boilerplate | ✅ Reduced | ⭐ Minimal |
| DevTools | ⭐ Excellent | ⭐ Excellent |

## Resources

- Redux Toolkit: https://redux-toolkit.js.org
- TanStack Query: https://tanstack.com/query
- Discussion: https://redux.js.org/faq/general#when-should-i-use-redux
