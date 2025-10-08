import { apiService } from './api';
import { LoginCredentials, RegisterData, User, AuthTokens } from '@/types';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';

interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return await apiService.post<AuthResponse>('/auth/login', credentials);
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    return await apiService.post<AuthResponse>('/auth/register', data);
  }

  async logout(): Promise<void> {
    await apiService.post('/auth/logout');
  }

  async validateToken(token: string): Promise<User> {
    return await apiService.get<User>('/auth/validate');
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    return await apiService.post<AuthTokens>('/auth/refresh', { refreshToken });
  }

  async requestPasswordReset(email: string): Promise<void> {
    await apiService.post('/auth/password-reset/request', { email });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiService.post('/auth/password-reset/confirm', { token, newPassword });
  }

  async verifyEmail(token: string): Promise<void> {
    await apiService.post('/auth/verify-email', { token });
  }

  async sendEmailVerification(email: string): Promise<void> {
    await apiService.post('/auth/send-verification', { email });
  }

  async verifyPhone(code: string): Promise<void> {
    await apiService.post('/auth/verify-phone', { code });
  }

  async sendPhoneVerification(phoneNumber: string): Promise<void> {
    await apiService.post('/auth/send-phone-verification', { phoneNumber });
  }

  async enableTwoFactor(): Promise<{ qrCode: string; secret: string }> {
    return await apiService.post('/auth/2fa/enable');
  }

  async verifyTwoFactor(code: string): Promise<void> {
    await apiService.post('/auth/2fa/verify', { code });
  }

  async disableTwoFactor(): Promise<void> {
    await apiService.post('/auth/2fa/disable');
  }

  // Biometric Authentication
  async isBiometricAvailable(): Promise<boolean> {
    const compatible = await LocalAuthentication.hasHardwareAsync();
    const enrolled = await LocalAuthentication.isEnrolledAsync();
    return compatible && enrolled;
  }

  async authenticateWithBiometric(): Promise<boolean> {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Authenticate to continue',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });
    return result.success;
  }

  async enableBiometric(): Promise<void> {
    const isAvailable = await this.isBiometricAvailable();
    if (!isAvailable) {
      throw new Error('Biometric authentication is not available');
    }

    const success = await this.authenticateWithBiometric();
    if (success) {
      await SecureStore.setItemAsync('biometricEnabled', 'true');
    } else {
      throw new Error('Biometric authentication failed');
    }
  }

  async disableBiometric(): Promise<void> {
    await SecureStore.deleteItemAsync('biometricEnabled');
  }

  async isBiometricEnabled(): Promise<boolean> {
    const enabled = await SecureStore.getItemAsync('biometricEnabled');
    return enabled === 'true';
  }

  async biometricLogin(): Promise<AuthResponse> {
    const enabled = await this.isBiometricEnabled();
    if (!enabled) {
      throw new Error('Biometric authentication is not enabled');
    }

    const success = await this.authenticateWithBiometric();
    if (!success) {
      throw new Error('Biometric authentication failed');
    }

    // Get stored credentials (in production, use a more secure method)
    const userId = await SecureStore.getItemAsync('userId');
    if (!userId) {
      throw new Error('No stored credentials found');
    }

    return await apiService.post<AuthResponse>('/auth/biometric-login', { userId });
  }
}

export const authService = new AuthService();
