# Troubleshooting Guide

## Common Errors & Solutions

### ❌ Error: "Attempted to navigate before mounting the Root Layout component"

**Cause**: Navigation is being called before Expo Router is ready.

**Solution**: Already fixed in `app/_layout.tsx` by:
1. Added `isReady` state to wait for router mounting
2. Added `setTimeout` delay before allowing navigation
3. Added better error handling in `loadStoredAuth`

**If you still see this error:**

```bash
# 1. Clear metro cache
npx expo start --clear

# 2. Restart the dev server
# Press Ctrl+C, then:
npm start
```

---

### ❌ Error: "Cannot find module '@/stores/authStore'"

**Cause**: TypeScript path aliases not resolved.

**Solution**:
```bash
# 1. Restart TypeScript server in VS Code
# Press Cmd/Ctrl + Shift + P
# Type: "TypeScript: Restart TS Server"

# 2. Clear cache and restart
npx expo start --clear
```

---

### ❌ Error: Network request failed / API errors

**Cause**: No backend API connected yet.

**Current Behavior**:
- Login/Register will fail (no backend)
- Auth is handled gracefully
- App still loads to splash screen

**Solutions**:

**Option 1: Mock the API (Quick Test)**

Edit `services/api.ts` and add mock responses:

```typescript
// Add at top of api.ts
const MOCK_MODE = true;

if (MOCK_MODE) {
  // Mock successful responses
  const mockResponses: Record<string, unknown> = {
    '/auth/login': {
      success: true,
      data: {
        user: {
          id: '1',
          email: 'demo@foamly.com',
          firstName: 'Demo',
          lastName: 'User',
          role: 'CUSTOMER',
          phoneNumber: '+1234567890',
          emailVerified: true,
          phoneVerified: true,
          biometricEnabled: false,
          twoFactorEnabled: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        tokens: {
          accessToken: 'mock-access-token',
          refreshToken: 'mock-refresh-token',
          expiresIn: 3600,
        },
      },
    },
  };

  // In your API methods, check for mock mode
  // Example in post method:
  if (MOCK_MODE && mockResponses[url]) {
    return mockResponses[url].data;
  }
}
```

**Option 2: Connect Real Backend**

1. Set up your backend API
2. Update `.env`:
   ```
   EXPO_PUBLIC_API_URL=https://your-api.com
   ```
3. Restart: `npx expo start --clear`

---

### ❌ Error: "QueryClient is not defined"

**Cause**: TanStack Query not set up properly.

**Solution**: Already fixed in `app/_layout.tsx` with `QueryClientProvider`.

If you still see this:
```bash
npm install @tanstack/react-query
npx expo start --clear
```

---

### ❌ Error: TypeScript errors everywhere

**Cause**: Build/cache issues.

**Solution**:
```bash
# 1. Delete build artifacts
rm -rf .expo node_modules

# 2. Reinstall
npm install --legacy-peer-deps

# 3. Restart
npx expo start --clear
```

---

### ❌ Error: Metro bundler "Unexpected token"

**Cause**: Syntax error or old cache.

**Solution**:
```bash
# Clear cache
npx expo start --clear

# If that doesn't work, reset Metro
rm -rf .expo
rm -rf node_modules/.cache
npx expo start
```

---

### ❌ App crashes on startup

**Possible causes**:

1. **Check Metro console** for errors
2. **Check device/simulator console** for runtime errors

**Common fixes**:
```bash
# iOS Simulator
# Press Cmd+D → Reload

# Android Emulator
# Press Cmd/Ctrl+M → Reload

# Clear and restart
npx expo start --clear
```

---

## Testing Without Backend

Since you don't have a backend yet, here's how to test the app:

### 1. **Splash Screen** ✅
Should load automatically showing:
- "Foamly" title
- "Professional Car Detailing at Your Doorstep"
- Login and Sign Up buttons

### 2. **Navigation** ✅
Test navigation:
- Tap "Sign Up" → Should go to registration type screen
- Tap "Login" → Should go to login screen
- Use back navigation

### 3. **Forms** ✅
Test form validation:
- Try submitting empty forms → Should show validation errors
- Enter invalid email → Should show "Invalid email"
- Enter short password → Should show password requirements

### 4. **Mock Login** (Optional)

To test authenticated screens without backend, temporarily add to login handler:

```typescript
// In app/(auth)/login.tsx
const handleLogin = async (values) => {
  // TEMPORARY MOCK - Remove when backend ready
  const mockUser = {
    id: '1',
    email: values.email,
    firstName: 'Demo',
    lastName: 'User',
    role: 'CUSTOMER',
    phoneNumber: '+1234567890',
    emailVerified: true,
    phoneVerified: true,
    biometricEnabled: false,
    twoFactorEnabled: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  useAuthStore.setState({
    user: mockUser,
    isAuthenticated: true,
    tokens: {
      accessToken: 'mock-token',
      refreshToken: 'mock-refresh',
      expiresIn: 3600,
    },
  });

  router.replace('/(tabs)');
};
```

---

## Debugging Tips

### 1. **Enable Remote Debugging**

```bash
# In Metro console, press 'd'
# Or shake device → "Debug Remote JS"
```

Then open Chrome DevTools:
- **Console**: See console.log outputs
- **Network**: See API requests
- **React DevTools**: Inspect component state

### 2. **Check Zustand State**

Add this anywhere in your code to inspect state:

```typescript
import { useAuthStore } from '@/stores/authStore';

// In any component
const state = useAuthStore.getState();
console.log('Current auth state:', state);
```

### 3. **Check TanStack Query State**

Add React Query DevTools:

```bash
npm install @tanstack/react-query-devtools
```

```typescript
// In app/_layout.tsx
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

<QueryClientProvider client={queryClient}>
  <PaperProvider>
    <RootLayoutNav />
  </PaperProvider>
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

---

## Performance Issues

### Slow startup

```bash
# Clear cache
npx expo start --clear

# Check bundle size
npx expo export --dump-assetmap
```

### Laggy navigation

1. Check for memory leaks
2. Reduce image sizes
3. Enable Hermes (already enabled in Expo)

---

## Environment Issues

### iOS Issues

```bash
# Clean build
cd ios && pod install && cd ..

# Reset simulator
xcrun simctl erase all
```

### Android Issues

```bash
# Clean build
cd android && ./gradlew clean && cd ..

# Reset emulator
# In Android Studio: AVD Manager → Wipe Data
```

---

## Getting Help

If you're still stuck:

1. **Check Documentation**:
   - [QUICKSTART.md](QUICKSTART.md)
   - [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)
   - [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)

2. **Check Console Logs**:
   - Metro bundler terminal
   - Device console (in Xcode/Android Studio)

3. **Check TypeScript**:
   ```bash
   npx tsc --noEmit
   ```

4. **Fresh Install**:
   ```bash
   rm -rf node_modules package-lock.json .expo
   npm install --legacy-peer-deps
   npx expo start --clear
   ```

---

## Quick Fixes Checklist

- [ ] Clear Metro cache: `npx expo start --clear`
- [ ] Restart TypeScript server in VS Code
- [ ] Check `.env` file exists
- [ ] Verify all dependencies installed: `npm install`
- [ ] Check for TypeScript errors: `npx tsc --noEmit`
- [ ] Restart dev server
- [ ] Reload app on device (Cmd/Ctrl+D or Cmd/Ctrl+M)

---

## Known Limitations (No Backend)

Without a backend connected:

- ❌ Login/Register won't work (API calls fail)
- ❌ Data won't persist across app restarts
- ❌ No real bookings can be created
- ✅ Navigation works
- ✅ UI/Forms work
- ✅ Validation works
- ✅ State management works

**To fully test**: Set up a backend API or use the mock mode described above.

---

**Still having issues? Check the error message carefully - it usually tells you exactly what's wrong!**
