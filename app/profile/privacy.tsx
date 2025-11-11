import { View, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { useUserSettings, useUpdateUserSettings } from '@/hooks/useUserSettings';

export default function PrivacyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  const { data: settings, isLoading } = useUserSettings(user?.id || '');
  const updateMutation = useUpdateUserSettings();

  const handleToggle = (field: string, value: boolean) => {
    if (!user?.id) return;

    updateMutation.mutate({
      userId: user.id,
      input: { [field]: value },
    });
  };

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'Password change coming soon!');
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to permanently delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {} }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy & Security</Text>
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
              {/* Security */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Security</Text>

                <View style={styles.settingCard}>
                  <View style={styles.settingRow}>
                    <View style={styles.settingLeft}>
                      <MaterialCommunityIcons name="fingerprint" size={22} color="#3B82F6" />
                      <View style={styles.settingInfo}>
                        <Text style={styles.settingLabel}>Biometric Login</Text>
                        <Text style={styles.settingDesc}>Use fingerprint or Face ID</Text>
                      </View>
                    </View>
                    <Switch
                      value={settings?.biometricEnabled ?? false}
                      onValueChange={(value) => handleToggle('biometricEnabled', value)}
                      trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                      thumbColor="#FFF"
                    />
                  </View>

                  <View style={styles.settingRow}>
                    <View style={styles.settingLeft}>
                      <MaterialCommunityIcons name="two-factor-authentication" size={22} color="#3B82F6" />
                      <View style={styles.settingInfo}>
                        <Text style={styles.settingLabel}>Two-Factor Authentication</Text>
                        <Text style={styles.settingDesc}>Add extra security to your account</Text>
                      </View>
                    </View>
                    <Switch
                      value={settings?.twoFactorEnabled ?? false}
                      onValueChange={(value) => handleToggle('twoFactorEnabled', value)}
                      trackColor={{ false: '#E5E7EB', true: '#3B82F6' }}
                      thumbColor="#FFF"
                    />
                  </View>
                </View>

                <TouchableOpacity style={styles.actionButton} onPress={handleChangePassword}>
                  <MaterialCommunityIcons name="lock-reset" size={20} color="#3B82F6" />
                  <Text style={styles.actionButtonText}>Change Password</Text>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
                </TouchableOpacity>
              </View>

              {/* Privacy */}
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Privacy</Text>

                <TouchableOpacity style={styles.menuItem}>
                  <MaterialCommunityIcons name="file-document" size={20} color="#666" />
                  <View style={styles.menuInfo}>
                    <Text style={styles.menuLabel}>Privacy Policy</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                  <MaterialCommunityIcons name="file-certificate" size={20} color="#666" />
                  <View style={styles.menuInfo}>
                    <Text style={styles.menuLabel}>Terms of Service</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                  <MaterialCommunityIcons name="shield-check" size={20} color="#666" />
                  <View style={styles.menuInfo}>
                    <Text style={styles.menuLabel}>Data & Permissions</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
                </TouchableOpacity>
              </View>

              {/* Danger Zone */}
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, styles.dangerTitle]}>Danger Zone</Text>

                <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteAccount}>
                  <MaterialCommunityIcons name="delete-forever" size={20} color="#DC2626" />
                  <Text style={styles.dangerButtonText}>Delete Account</Text>
                </TouchableOpacity>
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
  dangerTitle: {
    color: '#DC2626',
  },
  settingCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 4,
    marginBottom: 12,
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
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#3B82F6',
  },
  actionButtonText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 12,
    fontFamily: 'NunitoSans_600SemiBold',
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
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  dangerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    marginLeft: 8,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
