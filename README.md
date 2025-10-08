# Foamly - Professional Car Detailing Platform

Foamly is a comprehensive React Native (Expo) mobile application that connects customers with professional car detailing service providers. Built with TypeScript, Redux Toolkit, and modern React Native best practices.

## 🚀 Features

### Phase 1: MVP (Current Implementation)

#### Authentication & Security
- ✅ Email/Password authentication
- ✅ Customer and Provider registration flows
- ✅ Biometric authentication (Face ID/Touch ID)
- ✅ Secure token storage with Expo Secure Store
- ✅ Automatic session management

#### Core Booking Flow
- ✅ Vehicle selection and management
- ✅ Service browsing and selection
- ✅ Add-ons and customization
- ✅ Provider matching (ready for implementation)
- ✅ Date/time scheduling
- ✅ Real-time booking status tracking

#### Payment Integration
- ✅ Stripe integration setup
- ✅ Multiple payment methods support
- ✅ Secure payment processing
- ✅ Transaction history

#### User Management
- ✅ Customer profiles with vehicle management
- ✅ Provider business profiles
- ✅ Booking history
- ✅ Loyalty program structure

### Phase 2-4: Planned Features

- Real-time provider tracking with maps
- In-app chat system
- Advanced search and filtering
- Reviews and ratings system
- Provider business management dashboard
- Staff management for providers
- Analytics and reporting
- Marketing tools and promo codes
- Admin panel for platform management

## 📋 Tech Stack

- **Framework**: React Native with Expo (SDK 54)
- **Language**: TypeScript (strict mode)
- **State Management**: Redux Toolkit
- **Navigation**: Expo Router (file-based routing)
- **UI Components**: React Native Paper
- **Forms**: Formik + Yup validation
- **HTTP Client**: Axios with interceptors
- **Payment**: Stripe React Native SDK
- **Maps**: React Native Maps
- **Chat**: React Native Gifted Chat
- **Storage**: Expo Secure Store & Async Storage
- **Authentication**: Expo Local Authentication

## 🛠️ Installation

### Prerequisites
- Node.js 18+ and npm/yarn
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd foamly
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your API keys and configuration.

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on your device**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on physical device

## 📁 Project Structure

```
foamly/
├── app/                          # Expo Router screens
│   ├── (auth)/                  # Authentication screens
│   │   ├── splash.tsx
│   │   ├── login.tsx
│   │   ├── registration-type.tsx
│   │   ├── register-customer.tsx
│   │   └── register-provider.tsx
│   ├── (tabs)/                  # Main tab navigation
│   │   ├── _layout.tsx
│   │   ├── index.tsx           # Home screen
│   │   ├── bookings.tsx        # Bookings list
│   │   ├── services.tsx        # Services catalog
│   │   └── profile.tsx         # User profile
│   ├── booking/                 # Booking flow screens
│   │   └── new/
│   │       ├── vehicle-selection.tsx
│   │       ├── service-selection.tsx
│   │       ├── provider-selection.tsx
│   │       ├── datetime-selection.tsx
│   │       └── confirmation.tsx
│   └── _layout.tsx              # Root layout
├── store/                       # Redux state management
│   ├── slices/
│   │   ├── authSlice.ts
│   │   ├── bookingSlice.ts
│   │   └── vehicleSlice.ts
│   ├── hooks.ts
│   └── index.ts
├── services/                    # API services
│   ├── api.ts                  # Base API client
│   ├── auth.service.ts
│   ├── booking.service.ts
│   ├── vehicle.service.ts
│   └── payment.service.ts
├── types/                       # TypeScript type definitions
│   └── index.ts
├── components/                  # Reusable components (to be added)
├── utils/                       # Utility functions (to be added)
├── constants/                   # App constants (to be added)
└── hooks/                       # Custom hooks (to be added)
```

## 🔐 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
EXPO_PUBLIC_API_URL=https://api.foamly.com
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=AIza...
```

See `.env.example` for complete list.

## 🎨 Design System

### Colors
- Primary: `#1E88E5` (Blue)
- Success: `#4CAF50` (Green)
- Warning: `#FF9800` (Orange)
- Error: `#F44336` (Red)
- Background: `#F5F5F5` (Light Gray)

### Typography
Using React Native Paper's default Material Design typography variants.

## 📱 Key Screens

### Authentication Flow
1. **Splash Screen** - Welcome screen with login/signup options
2. **Login Screen** - Email/password + biometric login
3. **Registration Type** - Choose customer or provider
4. **Registration** - Complete profile setup

### Customer Flow
1. **Home** - Service discovery and quick booking
2. **Services** - Browse all available services
3. **Bookings** - Active and past bookings
4. **Profile** - Account management

### Booking Flow
1. **Vehicle Selection** - Choose vehicle to service
2. **Service Selection** - Pick service + add-ons
3. **Provider Selection** - Choose provider
4. **Date/Time** - Schedule appointment
5. **Payment** - Process payment
6. **Confirmation** - Booking confirmed

## 🧪 Testing (To Be Implemented)

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 🚀 Deployment

### Build for iOS
```bash
eas build --platform ios
```

### Build for Android
```bash
eas build --platform android
```

### Submit to App Stores
```bash
eas submit --platform ios
eas submit --platform android
```

## 📝 API Integration

The app expects a REST API with the following endpoints:

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout
- `POST /auth/biometric-login` - Biometric authentication

### Bookings
- `GET /bookings/active` - Get active bookings
- `GET /bookings/past` - Get past bookings
- `POST /bookings` - Create new booking
- `PATCH /bookings/:id/status` - Update booking status
- `POST /bookings/:id/cancel` - Cancel booking

### Vehicles
- `GET /vehicles` - Get user vehicles
- `POST /vehicles` - Add new vehicle
- `PUT /vehicles/:id` - Update vehicle
- `DELETE /vehicles/:id` - Delete vehicle

### Payments
- `POST /payments/create-intent` - Create payment intent
- `POST /payments/process` - Process payment
- `GET /payments/methods` - Get payment methods
- `POST /payments/methods` - Add payment method

See `/services` directory for complete API service implementations.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

- **Development**: Your Team
- **Design**: Your Design Team
- **Product**: Your Product Team

## 📞 Support

For support, email support@foamly.com or open an issue in the repository.

## 🗺️ Roadmap

### Q1 2025
- ✅ Phase 1: MVP launch with core booking features
- 🔄 Phase 2: Real-time tracking and chat

### Q2 2025
- ⏳ Phase 3: Provider business management tools
- ⏳ Advanced analytics and reporting

### Q3 2025
- ⏳ Phase 4: Performance optimization
- ⏳ Internationalization (i18n)
- ⏳ White-label support

---

**Built with ❤️ using React Native and Expo**
# foamly
