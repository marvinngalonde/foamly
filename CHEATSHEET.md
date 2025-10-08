# Foamly Quick Reference Cheatsheet

## 🚀 Common Commands

```bash
# Development
npm start                    # Start Expo dev server
npm run ios                  # Run on iOS simulator
npm run android              # Run on Android emulator
npx expo start --clear       # Clear cache and start

# Type Checking
npx tsc --noEmit            # Check TypeScript errors

# Build & Deploy
eas build --platform ios    # Build for iOS
eas build --platform android # Build for Android
```

---

## 🔧 State Management Patterns

### Zustand (Client State)

```typescript
// Import store
import { useAuthStore } from '@/stores/authStore';
import { useBookingStore } from '@/stores/bookingStore';
import { useUIStore } from '@/stores/uiStore';

// Use in component
const { user, login, logout, isLoading } = useAuthStore();
const { selectedVehicle, setSelectedVehicle } = useBookingStore();
const { showToast, setGlobalLoading } = useUIStore();

// Call actions
await login({ email, password });
setSelectedVehicle(vehicle);
showToast('Success!', 'success');
```

### TanStack Query (Server State)

```typescript
// Import query hooks
import { useVehicles, useAddVehicle } from '@/queries/vehicles';
import { useActiveBookings } from '@/queries/bookings';
import { useServices } from '@/queries/services';

// Fetch data
const { data, isLoading, error, refetch } = useVehicles();

// Mutations
const addMutation = useAddVehicle();
await addMutation.mutateAsync(newVehicle);

// In FlatList
<FlatList
  data={data}
  refreshing={isLoading}
  onRefresh={refetch}
/>
```

---

## 📁 File Creation Patterns

### New Screen

```typescript
// app/my-screen.tsx
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

export default function MyScreen() {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium">My Screen</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
});
```

### New Query Hook

```typescript
// queries/myResource.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { myService } from '@/services/my.service';

export const myKeys = {
  all: ['myResource'] as const,
  list: () => [...myKeys.all, 'list'] as const,
};

export const useMyResources = () => {
  return useQuery({
    queryKey: myKeys.list(),
    queryFn: myService.getAll,
    staleTime: 60 * 1000,
  });
};

export const useAddMyResource = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: myService.add,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: myKeys.list() });
    },
  });
};
```

### New Service

```typescript
// services/my.service.ts
import { apiService } from './api';
import { MyType } from '@/types';

class MyService {
  async getAll(): Promise<MyType[]> {
    return await apiService.get<MyType[]>('/my-resources');
  }

  async getById(id: string): Promise<MyType> {
    return await apiService.get<MyType>(`/my-resources/${id}`);
  }

  async create(data: Partial<MyType>): Promise<MyType> {
    return await apiService.post<MyType>('/my-resources', data);
  }

  async update(id: string, data: Partial<MyType>): Promise<MyType> {
    return await apiService.put<MyType>(`/my-resources/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    await apiService.delete(`/my-resources/${id}`);
  }
}

export const myService = new MyService();
```

---

## 🎨 UI Components

### Material Design Variants

```typescript
// Typography
<Text variant="displayLarge">Display Large</Text>
<Text variant="displayMedium">Display Medium</Text>
<Text variant="displaySmall">Display Small</Text>
<Text variant="headlineLarge">Headline Large</Text>
<Text variant="headlineMedium">Headline Medium</Text>
<Text variant="headlineSmall">Headline Small</Text>
<Text variant="titleLarge">Title Large</Text>
<Text variant="titleMedium">Title Medium</Text>
<Text variant="titleSmall">Title Small</Text>
<Text variant="bodyLarge">Body Large</Text>
<Text variant="bodyMedium">Body Medium</Text>
<Text variant="bodySmall">Body Small</Text>

// Buttons
<Button mode="contained">Contained</Button>
<Button mode="outlined">Outlined</Button>
<Button mode="text">Text</Button>
<Button icon="camera" loading={isLoading}>With Icon</Button>

// Cards
<Card>
  <Card.Cover source={{ uri: 'image.jpg' }} />
  <Card.Title title="Title" subtitle="Subtitle" />
  <Card.Content>
    <Text>Content</Text>
  </Card.Content>
  <Card.Actions>
    <Button>Action</Button>
  </Card.Actions>
</Card>

// Input
<TextInput
  label="Email"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  left={<TextInput.Icon icon="email" />}
  right={<TextInput.Icon icon="eye" />}
/>
```

---

## 🔍 Common Imports

```typescript
// React & React Native
import { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ScrollView } from 'react-native';

// React Native Paper
import { Text, Button, Card, TextInput, Chip } from 'react-native-paper';

// Navigation
import { useRouter, Link } from 'expo-router';

// State Management
import { useAuthStore } from '@/stores/authStore';
import { useBookingStore } from '@/stores/bookingStore';
import { useVehicles } from '@/queries/vehicles';

// Types
import { User, Vehicle, Booking, Service } from '@/types';

// Utils
import { formatCurrency, formatDate } from '@/utils/formatters';
import { isValidEmail } from '@/utils/validators';
import { Colors } from '@/constants';
```

---

## 🎯 Navigation

```typescript
// Push to new screen
router.push('/path/to/screen');

// Replace current screen
router.replace('/path/to/screen');

// Go back
router.back();

// Push with params
router.push('/booking/123');

// Access params
import { useLocalSearchParams } from 'expo-router';
const { id } = useLocalSearchParams<{ id: string }>();

// Link component
<Link href="/profile">Go to Profile</Link>
```

---

## 💾 Forms with Formik

```typescript
import { Formik } from 'formik';
import * as Yup from 'yup';

const schema = Yup.object().shape({
  email: Yup.string().email('Invalid').required('Required'),
  password: Yup.string().min(8).required('Required'),
});

<Formik
  initialValues={{ email: '', password: '' }}
  validationSchema={schema}
  onSubmit={async (values) => {
    await handleSubmit(values);
  }}
>
  {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
    <View>
      <TextInput
        label="Email"
        value={values.email}
        onChangeText={handleChange('email')}
        onBlur={handleBlur('email')}
        error={touched.email && !!errors.email}
      />
      {touched.email && errors.email && (
        <Text style={{ color: 'red' }}>{errors.email}</Text>
      )}

      <Button onPress={() => handleSubmit()}>Submit</Button>
    </View>
  )}
</Formik>
```

---

## 🔐 Authentication Flow

```typescript
// Login
const { login, isLoading } = useAuthStore();

const handleLogin = async () => {
  try {
    await login({ email, password });
    router.replace('/(tabs)');
  } catch (error) {
    Alert.alert('Error', error.message);
  }
};

// Logout
const { logout } = useAuthStore();
await logout();
router.replace('/(auth)/splash');

// Check auth status
const { isAuthenticated, user } = useAuthStore();

if (!isAuthenticated) {
  return <LoginScreen />;
}
```

---

## 🎨 Styling

```typescript
import { StyleSheet } from 'react-native';
import { Colors } from '@/constants';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: Colors.background,
  },
  card: {
    elevation: 2,
    borderRadius: 8,
    marginBottom: 16,
  },
  button: {
    borderRadius: 8,
    marginTop: 16,
  },
  text: {
    color: Colors.text,
    fontSize: 16,
  },
});
```

---

## 🐛 Debugging

```typescript
// Console logs
console.log('Debug:', data);
console.error('Error:', error);

// React Query DevTools
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
<ReactQueryDevtools />

// Zustand DevTools
import { devtools } from 'zustand/middleware';
const useStore = create(devtools(...));

// Check network requests
// Look at terminal where you ran `npm start`

// Element inspector
// Shake device → "Show Element Inspector"
// Or: Cmd/Ctrl + D (iOS simulator)
```

---

## 📦 Environment Variables

```bash
# .env file
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_STRIPE_KEY=pk_test_...

# Access in code
const apiUrl = process.env.EXPO_PUBLIC_API_URL;
```

---

## 🔄 Refresh Patterns

```typescript
// Pull to refresh
<FlatList
  data={data}
  refreshing={isLoading}
  onRefresh={refetch}
/>

// Manual refetch
const { data, refetch } = useVehicles();

<Button onPress={() => refetch()}>Refresh</Button>

// Auto refetch on focus
const { data } = useVehicles({
  refetchOnWindowFocus: true,
});
```

---

## 🎯 Error Handling

```typescript
// TanStack Query errors
const { data, error, isError } = useVehicles();

if (isError) {
  return <ErrorMessage error={error} />;
}

// Mutation errors
const mutation = useAddVehicle();

try {
  await mutation.mutateAsync(data);
} catch (error) {
  Alert.alert('Error', error.message);
}

// Toast for errors
const { showToast } = useUIStore();

try {
  await doSomething();
  showToast('Success!', 'success');
} catch (error) {
  showToast(error.message, 'error');
}
```

---

## 📊 Loading States

```typescript
// Query loading
const { data, isLoading, isFetching } = useVehicles();

if (isLoading) {
  return <ActivityIndicator />;
}

// Mutation loading
const mutation = useAddVehicle();

<Button loading={mutation.isPending}>
  Add Vehicle
</Button>

// Global loading
const { setGlobalLoading } = useUIStore();

setGlobalLoading(true, 'Processing...');
// ... do work
setGlobalLoading(false);
```

---

## 🔗 Quick Links

- **Docs**: `/docs` folder
- **Examples**: Search for `example` in codebase
- **Types**: `types/index.ts`
- **Constants**: `constants/index.ts`
- **Utils**: `utils/` folder

---

## 🆘 Common Fixes

```bash
# Metro bundler issues
npx expo start --clear

# TypeScript errors
Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

# Dependency issues
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps

# Cache issues
rm -rf .expo node_modules
npm install
npx expo start --clear
```

---

**Keep this file handy for quick reference! 📌**
