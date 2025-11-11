import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Switch, ActivityIndicator } from 'react-native';
import { Text, Button, TextInput } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useProviderByUserId } from '@/hooks/useProviders';
import { useProviderSettings, useUpdateProviderSettings } from '@/hooks/useProviderSettings';
import { supabase } from '@/lib/supabase';

export default function ProviderSettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const { data: provider } = useProviderByUserId(user?.id || '');
  const { data: settings, isLoading } = useProviderSettings(provider?.id || '');
  const updateSettingsMutation = useUpdateProviderSettings();

  // Notification settings
  const [newBookingNotifications, setNewBookingNotifications] = useState(true);
  const [cancelNotifications, setCancelNotifications] = useState(true);
  const [messageNotifications, setMessageNotifications] = useState(true);
  const [reminderNotifications, setReminderNotifications] = useState(true);

  // Business hours
  const [isOpen, setIsOpen] = useState(true);
  const [openingTime, setOpeningTime] = useState('08:00');
  const [closingTime, setClosingTime] = useState('18:00');

  // Load settings from database
  useEffect(() => {
    if (settings) {
      setNewBookingNotifications(settings.newBookingNotifications);
      setCancelNotifications(settings.cancelNotifications);
      setMessageNotifications(settings.messageNotifications);
      setReminderNotifications(settings.reminderNotifications);
      setIsOpen(settings.isOpen);
      setOpeningTime(settings.openingTime);
      setClosingTime(settings.closingTime);
    }
  }, [settings]);

  const handleSaveNotificationSettings = async () => {
    if (!provider?.id) return;

    try {
      await updateSettingsMutation.mutateAsync({
        providerId: provider.id,
        input: {
          newBookingNotifications,
          cancelNotifications,
          messageNotifications,
          reminderNotifications,
        },
      });
      Alert.alert('Success', 'Notification settings updated');
    } catch (error) {
      Alert.alert('Error', (error as Error).message || 'Failed to update settings');
    }
  };

  const handleSaveBusinessHours = async () => {
    if (!provider?.id) return;

    try {
      await updateSettingsMutation.mutateAsync({
        providerId: provider.id,
        input: {
          isOpen,
          openingTime,
          closingTime,
        },
      });
      Alert.alert('Success', 'Business hours updated');
    } catch (error) {
      Alert.alert('Error', (error as Error).message || 'Failed to update business hours');
    }
  };

  const handleDeactivateAccount = () => {
    Alert.alert(
      'Deactivate Account',
      'Are you sure you want to deactivate your provider account? You can reactivate it anytime by contacting support.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Deactivate',
          style: 'destructive',
          onPress: async () => {
            if (!provider?.id) return;

            try {
              const { error } = await supabase
                .from('provider_profiles')
                .update({ is_active: false })
                .eq('id', provider.id);

              if (error) throw error;

              Alert.alert('Success', 'Account deactivated. Contact support to reactivate.', [
                {
                  text: 'OK',
                  onPress: () => {
                    logout();
                    router.replace('/auth/login');
                  },
                },
              ]);
            } catch (error) {
              Alert.alert('Error', (error as Error).message || 'Failed to deactivate account');
            }
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/auth/login');
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollContent}>
        {/* Business Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Business Hours</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Currently Open</Text>
                <Text style={styles.settingDescription}>Toggle business availability</Text>
              </View>
              <Switch
                value={isOpen}
                onValueChange={setIsOpen}
                trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
                thumbColor={isOpen ? '#3B82F6' : '#9CA3AF'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.timeInputContainer}>
              <View style={styles.timeInput}>
                <Text style={styles.timeLabel}>Opening Time</Text>
                <TextInput
                  value={openingTime}
                  onChangeText={setOpeningTime}
                  mode="outlined"
                  placeholder="08:00"
                  style={styles.input}
                  outlineColor="#E5E7EB"
                  activeOutlineColor="#3B82F6"
                  disabled={!isOpen}
                />
              </View>

              <View style={styles.timeInput}>
                <Text style={styles.timeLabel}>Closing Time</Text>
                <TextInput
                  value={closingTime}
                  onChangeText={setClosingTime}
                  mode="outlined"
                  placeholder="18:00"
                  style={styles.input}
                  outlineColor="#E5E7EB"
                  activeOutlineColor="#3B82F6"
                  disabled={!isOpen}
                />
              </View>
            </View>

            <Button
              mode="contained"
              buttonColor="#3B82F6"
              onPress={handleSaveBusinessHours}
              style={styles.saveButton}
              loading={updateSettingsMutation.isPending}
              disabled={updateSettingsMutation.isPending}
            >
              Save Business Hours
            </Button>
          </View>
        </View>

        {/* Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>

          <View style={styles.settingCard}>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>New Bookings</Text>
                <Text style={styles.settingDescription}>Get notified of new booking requests</Text>
              </View>
              <Switch
                value={newBookingNotifications}
                onValueChange={setNewBookingNotifications}
                trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
                thumbColor={newBookingNotifications ? '#3B82F6' : '#9CA3AF'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Cancellations</Text>
                <Text style={styles.settingDescription}>Get notified when bookings are cancelled</Text>
              </View>
              <Switch
                value={cancelNotifications}
                onValueChange={setCancelNotifications}
                trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
                thumbColor={cancelNotifications ? '#3B82F6' : '#9CA3AF'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Messages</Text>
                <Text style={styles.settingDescription}>Get notified of new customer messages</Text>
              </View>
              <Switch
                value={messageNotifications}
                onValueChange={setMessageNotifications}
                trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
                thumbColor={messageNotifications ? '#3B82F6' : '#9CA3AF'}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Reminders</Text>
                <Text style={styles.settingDescription}>Get reminded about upcoming bookings</Text>
              </View>
              <Switch
                value={reminderNotifications}
                onValueChange={setReminderNotifications}
                trackColor={{ false: '#E5E7EB', true: '#93C5FD' }}
                thumbColor={reminderNotifications ? '#3B82F6' : '#9CA3AF'}
              />
            </View>

            <Button
              mode="contained"
              buttonColor="#3B82F6"
              onPress={handleSaveNotificationSettings}
              style={styles.saveButton}
              loading={updateSettingsMutation.isPending}
              disabled={updateSettingsMutation.isPending}
            >
              Save Notification Settings
            </Button>
          </View>
        </View>

        {/* Service Area */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Service Area</Text>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/provider/service-area/edit')}
          >
            <View style={styles.actionIcon}>
              <MaterialCommunityIcons name="map-marker-radius" size={24} color="#3B82F6" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionLabel}>Edit Service Area</Text>
              <Text style={styles.actionDescription}>
                {provider?.serviceArea || 'Update your service area and coverage'}
              </Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>
        </View>

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => router.push('/(tabs)/provider-profile')}
          >
            <View style={styles.actionIcon}>
              <MaterialCommunityIcons name="account-edit" size={24} color="#3B82F6" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionLabel}>Edit Profile</Text>
              <Text style={styles.actionDescription}>Update your business information</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => {
              Alert.alert('Coming Soon', 'Payment settings will be available in a future update');
            }}
          >
            <View style={styles.actionIcon}>
              <MaterialCommunityIcons name="credit-card" size={24} color="#3B82F6" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionLabel}>Payment Settings</Text>
              <Text style={styles.actionDescription}>Manage payment methods and payouts</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => {
              Alert.alert('Coming Soon', 'Legal documents will be available in a future update');
            }}
          >
            <View style={styles.actionIcon}>
              <MaterialCommunityIcons name="file-document" size={24} color="#3B82F6" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionLabel}>Legal & Documents</Text>
              <Text style={styles.actionDescription}>Terms, privacy policy, and agreements</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => {
              Alert.alert('Coming Soon', 'Help center will be available in a future update');
            }}
          >
            <View style={styles.actionIcon}>
              <MaterialCommunityIcons name="help-circle" size={24} color="#3B82F6" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionLabel}>Help Center</Text>
              <Text style={styles.actionDescription}>Get help and support</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => {
              Alert.alert('Coming Soon', 'Feedback system will be available in a future update');
            }}
          >
            <View style={styles.actionIcon}>
              <MaterialCommunityIcons name="message-text" size={24} color="#3B82F6" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={styles.actionLabel}>Send Feedback</Text>
              <Text style={styles.actionDescription}>Share your thoughts and suggestions</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Danger Zone</Text>

          <TouchableOpacity style={styles.dangerCard} onPress={handleDeactivateAccount}>
            <View style={[styles.actionIcon, styles.dangerIcon]}>
              <MaterialCommunityIcons name="account-off" size={24} color="#EF4444" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={[styles.actionLabel, styles.dangerText]}>Deactivate Account</Text>
              <Text style={styles.actionDescription}>Temporarily disable your provider account</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.dangerCard} onPress={handleLogout}>
            <View style={[styles.actionIcon, styles.dangerIcon]}>
              <MaterialCommunityIcons name="logout" size={24} color="#EF4444" />
            </View>
            <View style={styles.actionInfo}>
              <Text style={[styles.actionLabel, styles.dangerText]}>Logout</Text>
              <Text style={styles.actionDescription}>Sign out of your account</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>Foamy Provider v1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#666',
    fontFamily: 'NunitoSans_400Regular',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'NunitoSans_700Bold',
  },
  placeholder: {
    width: 32,
  },
  scrollContent: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 12,
    fontFamily: 'NunitoSans_700Bold',
  },
  settingCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    elevation: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
    fontFamily: 'NunitoSans_700Bold',
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'NunitoSans_400Regular',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 12,
  },
  timeInputContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  timeInput: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
  input: {
    backgroundColor: '#FFF',
    fontSize: 14,
  },
  saveButton: {
    marginTop: 16,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionInfo: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
    fontFamily: 'NunitoSans_700Bold',
  },
  actionDescription: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'NunitoSans_400Regular',
  },
  dangerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 1,
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  dangerIcon: {
    backgroundColor: '#FEE2E2',
  },
  dangerText: {
    color: '#EF4444',
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  versionText: {
    fontSize: 12,
    color: '#999',
    fontFamily: 'NunitoSans_400Regular',
  },
});
