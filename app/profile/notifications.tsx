import { View, StyleSheet, ScrollView, TouchableOpacity, Switch, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { useNotificationPreferences, useUpdateNotificationPreferences } from '@/hooks/useNotificationPreferences';

export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  const { data: preferences, isLoading } = useNotificationPreferences(user?.id || '');
  const updateMutation = useUpdateNotificationPreferences();

  const handleToggle = (field: string, value: boolean) => {
    if (!user?.id) return;

    updateMutation.mutate({
      userId: user.id,
      input: { [field]: value },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.innerContainer}>
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#3B82F6" />
            </View>
          ) : (
            <>
              {/* General Notifications */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>General</Text>

                <View style={styles.settingCard}>
                  <View style={styles.settingRow}>
                    <View style={styles.settingLeft}>
                      <MaterialCommunityIcons name="bell" size={22} color="#3B82F6" />
                      <View style={styles.settingInfo}>
                        <Text style={styles.settingLabel}>Push Notifications</Text>
                        <Text style={styles.settingDesc}>Receive push notifications</Text>
                      </View>
                    </View>
                    <Switch
                      value={preferences?.pushNotifications ?? true}
                      onValueChange={(value) => handleToggle('pushNotifications', value)}
                      trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                      thumbColor="#FFF"
                    />
                  </View>

                  <View style={styles.settingRow}>
                    <View style={styles.settingLeft}>
                      <MaterialCommunityIcons name="email" size={22} color="#3B82F6" />
                      <View style={styles.settingInfo}>
                        <Text style={styles.settingLabel}>Email Notifications</Text>
                        <Text style={styles.settingDesc}>Receive email updates</Text>
                      </View>
                    </View>
                    <Switch
                      value={preferences?.emailNotifications ?? true}
                      onValueChange={(value) => handleToggle('emailNotifications', value)}
                      trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                      thumbColor="#FFF"
                    />
                  </View>

                  <View style={styles.settingRow}>
                    <View style={styles.settingLeft}>
                      <MaterialCommunityIcons name="message" size={22} color="#3B82F6" />
                      <View style={styles.settingInfo}>
                        <Text style={styles.settingLabel}>SMS Notifications</Text>
                        <Text style={styles.settingDesc}>Receive text messages</Text>
                      </View>
                    </View>
                    <Switch
                      value={preferences?.smsNotifications ?? false}
                      onValueChange={(value) => handleToggle('smsNotifications', value)}
                      trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                      thumbColor="#FFF"
                    />
                  </View>
                </View>
              </View>

              {/* Booking Notifications */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Bookings</Text>

                <View style={styles.settingCard}>
                  <View style={styles.settingRow}>
                    <View style={styles.settingLeft}>
                      <MaterialCommunityIcons name="calendar-clock" size={22} color="#3B82F6" />
                      <View style={styles.settingInfo}>
                        <Text style={styles.settingLabel}>Booking Reminders</Text>
                        <Text style={styles.settingDesc}>Get reminders before appointments</Text>
                      </View>
                    </View>
                    <Switch
                      value={preferences?.bookingReminders ?? true}
                      onValueChange={(value) => handleToggle('bookingReminders', value)}
                      trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                      thumbColor="#FFF"
                    />
                  </View>

                  <View style={styles.settingRow}>
                    <View style={styles.settingLeft}>
                      <MaterialCommunityIcons name="information" size={22} color="#3B82F6" />
                      <View style={styles.settingInfo}>
                        <Text style={styles.settingLabel}>Service Updates</Text>
                        <Text style={styles.settingDesc}>Updates about your services</Text>
                      </View>
                    </View>
                    <Switch
                      value={preferences?.serviceUpdates ?? true}
                      onValueChange={(value) => handleToggle('serviceUpdates', value)}
                      trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                      thumbColor="#FFF"
                    />
                  </View>
                </View>
              </View>

              {/* Marketing */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Marketing</Text>

                <View style={styles.settingCard}>
                  <View style={styles.settingRow}>
                    <View style={styles.settingLeft}>
                      <MaterialCommunityIcons name="tag" size={22} color="#3B82F6" />
                      <View style={styles.settingInfo}>
                        <Text style={styles.settingLabel}>Promotions & Offers</Text>
                        <Text style={styles.settingDesc}>Receive special deals and offers</Text>
                      </View>
                    </View>
                    <Switch
                      value={preferences?.promotions ?? false}
                      onValueChange={(value) => handleToggle('promotions', value)}
                      trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                      thumbColor="#FFF"
                    />
                  </View>
                </View>
              </View>
            </>
          )}
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
    marginTop: 44,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: 'transparent',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'NunitoSans_700Bold',
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    fontFamily: 'NunitoSans_700Bold',
  },
  settingCard: {
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
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
