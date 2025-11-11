import { View, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, Image, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useUpdateProfilePicture } from '@/hooks/useUsers';
import { pickImage, uploadProfilePicture } from '@/lib/storage';
import { UserRole } from '@/types';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuthStore();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [biometric, setBiometric] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const updateProfilePictureMutation = useUpdateProfilePicture();

  // Redirect providers to their provider-specific profile page
  useEffect(() => {
    if (user?.role === UserRole.PROVIDER) {
      router.replace('/provider/profile');
    }
  }, [user?.role, router]);

  const handleUploadPhoto = async () => {
    try {
      setUploadingImage(true);

      // Pick image
      const image = await pickImage();
      if (!image) {
        setUploadingImage(false);
        return;
      }

      // Upload to Supabase
      const result = await uploadProfilePicture(image.uri, user?.id || '');

      // Update user profile
      await updateProfilePictureMutation.mutateAsync({
        id: user?.id || '',
        url: result.url,
      });

      Alert.alert('Success', 'Profile picture updated successfully!');
    } catch (error: any) {
      console.error('Error uploading photo:', error);
      Alert.alert('Error', error.message || 'Failed to upload photo');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  const paymentMethods = [
    { id: 1, type: 'Visa', last4: '4242', expiry: '12/25', isDefault: true },
    { id: 2, type: 'Mastercard', last4: '8888', expiry: '08/26', isDefault: false },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header with Profile */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {user?.profileImage ? (
              <Image
                source={{ uri: user.profileImage }}
                style={styles.avatar}
              />
            ) : (
              <MaterialCommunityIcons name="account-circle" size={70} color="#FFF" />
            )}
            <TouchableOpacity style={styles.cameraButton} onPress={handleUploadPhoto} disabled={uploadingImage}>
              {uploadingImage ? (
                <ActivityIndicator size="small" color="#3B82F6" />
              ) : (
                <MaterialCommunityIcons name="camera" size={16} color="#3B82F6" />
              )}
            </TouchableOpacity>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{user?.firstName} {user?.lastName}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={() => router.push('/profile/edit')} style={styles.editButton}>
          <MaterialCommunityIcons name="pencil" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.innerContainer}>
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        >

        {/* Quick Access Cards */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/vehicles')}
          >
            <View style={styles.actionIcon}>
              <MaterialCommunityIcons name="car-multiple" size={24} color="#3B82F6" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>My Vehicles</Text>
              <Text style={styles.actionDesc}>Manage your vehicles</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/bookings')}
          >
            <View style={styles.actionIcon}>
              <MaterialCommunityIcons name="calendar-month" size={24} color="#3B82F6" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionTitle}>My Bookings</Text>
              <Text style={styles.actionDesc}>View booking history</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity style={styles.menuItem}>
            <MaterialCommunityIcons name="phone" size={20} color="#666" />
            <View style={styles.menuInfo}>
              <Text style={styles.menuLabel}>Phone Number</Text>
              <Text style={styles.menuValue}>{user?.phoneNumber || 'Add phone'}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile/payment-methods')}>
            <MaterialCommunityIcons name="credit-card" size={20} color="#666" />
            <View style={styles.menuInfo}>
              <Text style={styles.menuLabel}>Payment Methods</Text>
              <Text style={styles.menuValue}>2 cards</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile/notifications')}>
            <MaterialCommunityIcons name="bell-outline" size={20} color="#666" />
            <View style={styles.menuInfo}>
              <Text style={styles.menuLabel}>Notifications</Text>
              <Text style={styles.menuValue}>Enabled</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile/privacy')}>
            <MaterialCommunityIcons name="shield-account" size={20} color="#666" />
            <View style={styles.menuInfo}>
              <Text style={styles.menuLabel}>Privacy & Security</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile/help-support')}>
            <MaterialCommunityIcons name="help-circle-outline" size={20} color="#666" />
            <View style={styles.menuInfo}>
              <Text style={styles.menuLabel}>Help & Support</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push('/profile/about')}>
            <MaterialCommunityIcons name="information-outline" size={20} color="#666" />
            <View style={styles.menuInfo}>
              <Text style={styles.menuLabel}>About</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>
        </View>

        {/* Sign Out Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={22} color="#DC2626" />
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>Foamly v1.0.0</Text>
        </View>
      </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3B82F6',
  },
  innerContainer: {
    flex: 1,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    borderTopRightRadius: 24,
    borderTopLeftRadius: 24,
    marginTop: 34,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
    backgroundColor: 'transparent',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3B82F6',
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 2,
    fontFamily: 'NunitoSans_700Bold',
  },
  userEmail: {
    fontSize: 13,
    color: '#FFF',
    opacity: 0.9,
    fontFamily: 'NunitoSans_400Regular',
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    fontFamily: 'NunitoSans_700Bold',
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionInfo: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
    fontFamily: 'NunitoSans_700Bold',
  },
  actionDesc: {
    fontSize: 13,
    color: '#6B7280',
    fontFamily: 'NunitoSans_400Regular',
  },
  card: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 4,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  settingRowButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingInfo: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  settingDesc: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'NunitoSans_400Regular',
  },
  paymentCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
    fontFamily: 'NunitoSans_700Bold',
  },
  paymentNumber: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
    fontFamily: 'NunitoSans_400Regular',
  },
  paymentExpiry: {
    fontSize: 11,
    color: '#999',
    fontFamily: 'NunitoSans_400Regular',
  },
  defaultBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: 11,
    color: '#3B82F6',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  quickAccessCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  quickAccessInfo: {
    flex: 1,
    marginLeft: 12,
  },
  quickAccessTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
    fontFamily: 'NunitoSans_700Bold',
  },
  quickAccessDesc: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'NunitoSans_400Regular',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  menuInfo: {
    flex: 1,
    marginLeft: 12,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  menuValue: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
    fontFamily: 'NunitoSans_400Regular',
  },
  signOutButton: {
    flexDirection: 'row',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signOutText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#DC2626',
    marginLeft: 8,
    fontFamily: 'NunitoSans_700Bold',
  },
  versionInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'NunitoSans_400Regular',
  },
  bottomPadding: {
    height: 40,
  },
});
