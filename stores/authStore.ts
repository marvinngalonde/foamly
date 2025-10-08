import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserRole } from '@/types';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  role: UserRole;
  businessName?: string;
  serviceArea?: string;
}

interface AuthState {
  // State
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  setUser: (user: User | null) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Login action
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          if (!data.user) {
            throw new Error('No user data returned');
          }

          // Fetch user profile from our custom users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', data.user.id)
            .single();

          if (userError) throw userError;

          // Map snake_case to camelCase
          const mappedUser: User = {
            id: userData.id,
            email: userData.email,
            firstName: userData.first_name,
            lastName: userData.last_name,
            phoneNumber: userData.phone_number,
            role: userData.role,
            profileImage: userData.profile_picture,
            emailVerified: false,
            phoneVerified: false,
            biometricEnabled: false,
            twoFactorEnabled: false,
            createdAt: userData.created_at,
            updatedAt: userData.updated_at,
          };

          set({
            user: mappedUser,
            session: data.session,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: unknown) {
          set({
            isLoading: false,
            error: (error as Error).message || 'Login failed',
          });
          throw error;
        }
      },

      // Register action
      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          // 1. Create auth user
          const { data: authData, error: authError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
          });

          if (authError) throw authError;

          if (!authData.user) {
            throw new Error('No user data returned from signup');
          }

          // 2. Create user profile in our custom users table
          const { data: userData, error: userError } = await supabase
            .from('users')
            .insert({
              auth_id: authData.user.id,
              email: data.email,
              first_name: data.firstName,
              last_name: data.lastName,
              phone_number: data.phoneNumber,
              role: data.role,
            })
            .select()
            .single();

          if (userError) throw userError;

          // 3. If provider, create provider profile
          if (data.role === UserRole.PROVIDER && data.businessName && data.serviceArea) {
            const { error: providerError } = await supabase
              .from('provider_profiles')
              .insert({
                user_id: userData.id,
                business_name: data.businessName,
                service_area: data.serviceArea,
              });

            if (providerError) throw providerError;
          }

          // Map snake_case to camelCase
          const mappedUser: User = {
            id: userData.id,
            email: userData.email,
            firstName: userData.first_name,
            lastName: userData.last_name,
            phoneNumber: userData.phone_number,
            role: userData.role,
            profileImage: userData.profile_picture,
            emailVerified: false,
            phoneVerified: false,
            biometricEnabled: false,
            twoFactorEnabled: false,
            createdAt: userData.created_at,
            updatedAt: userData.updated_at,
          };

          set({
            user: mappedUser,
            session: authData.session,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: unknown) {
          set({
            isLoading: false,
            error: (error as Error).message || 'Registration failed',
          });
          throw error;
        }
      },

      // Logout action
      logout: async () => {
        set({ isLoading: true });
        try {
          const { error } = await supabase.auth.signOut();
          if (error) throw error;

          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error: unknown) {
          set({
            isLoading: false,
            error: (error as Error).message || 'Logout failed',
          });
        }
      },

      // Load stored authentication
      loadStoredAuth: async () => {
        set({ isLoading: true });
        try {
          const { data: { session }, error } = await supabase.auth.getSession();

          if (error || !session) {
            set({ isLoading: false, isAuthenticated: false });
            return;
          }

          // Fetch user profile
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('auth_id', session.user.id)
            .single();

          if (userError) {
            console.log('User profile fetch failed:', userError);
            set({ isLoading: false, isAuthenticated: false });
            return;
          }

          // Map snake_case to camelCase
          const mappedUser: User = {
            id: userData.id,
            email: userData.email,
            firstName: userData.first_name,
            lastName: userData.last_name,
            phoneNumber: userData.phone_number,
            role: userData.role,
            profileImage: userData.profile_picture,
            emailVerified: false,
            phoneVerified: false,
            biometricEnabled: false,
            twoFactorEnabled: false,
            createdAt: userData.created_at,
            updatedAt: userData.updated_at,
          };

          set({
            user: mappedUser,
            session,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error: unknown) {
          console.error('Load stored auth error:', error);
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      },

      // Set user
      setUser: (user: User | null) => set({ user }),

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
