import { View, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function AboutScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleWebsite = async () => {
    const url = 'https://foamly.com';
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  };

  const handlePrivacyPolicy = () => {
    router.push('/profile/privacy');
  };

  const handleTerms = async () => {
    const url = 'https://foamly.com/terms';
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  };

  const handleLicenses = () => {
    // Navigate to licenses screen or show alert
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>About</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.innerContainer}>
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        >
          {/* App Info */}
          <View style={styles.section}>
            <View style={styles.appInfoCard}>
              <View style={styles.logoContainer}>
                <MaterialCommunityIcons name="car-wash" size={60} color="#3B82F6" />
              </View>
              <Text style={styles.appName}>Foamly</Text>
              <Text style={styles.appVersion}>Version 1.0.0</Text>
              <Text style={styles.appTagline}>Your Premium Car Care Solution</Text>
            </View>
          </View>

          {/* About Us */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>About Us</Text>
            <View style={styles.descriptionCard}>
              <Text style={styles.descriptionText}>
                Foamly is the leading platform connecting car owners with professional detailing and car care services.
                We make it easy to book, track, and manage all your vehicle maintenance needs in one place.
              </Text>
            </View>
          </View>

          {/* Company */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Company</Text>

            <TouchableOpacity style={styles.menuItem} onPress={handleWebsite}>
              <MaterialCommunityIcons name="web" size={20} color="#666" />
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>Website</Text>
                <Text style={styles.menuValue}>foamly.com</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons name="email" size={20} color="#666" />
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>Contact</Text>
                <Text style={styles.menuValue}>hello@foamly.com</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons name="map-marker" size={20} color="#666" />
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>Location</Text>
                <Text style={styles.menuValue}>San Francisco, CA</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
            </TouchableOpacity>
          </View>

          {/* Social Media */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Follow Us</Text>
            <View style={styles.socialContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <MaterialCommunityIcons name="facebook" size={24} color="#1877F2" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <MaterialCommunityIcons name="twitter" size={24} color="#1DA1F2" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <MaterialCommunityIcons name="instagram" size={24} color="#E4405F" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton}>
                <MaterialCommunityIcons name="linkedin" size={24} color="#0A66C2" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Legal */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Legal</Text>

            <TouchableOpacity style={styles.menuItem} onPress={handleTerms}>
              <MaterialCommunityIcons name="file-document" size={20} color="#666" />
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>Terms of Service</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handlePrivacyPolicy}>
              <MaterialCommunityIcons name="shield-check" size={20} color="#666" />
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>Privacy Policy</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={handleLicenses}>
              <MaterialCommunityIcons name="license" size={20} color="#666" />
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>Open Source Licenses</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
            </TouchableOpacity>
          </View>

          {/* Credits */}
          <View style={styles.section}>
            <View style={styles.creditsCard}>
              <Text style={styles.creditsText}>Made with care by the Foamly team</Text>
              <Text style={styles.copyrightText}>© 2025 Foamly. All rights reserved.</Text>
            </View>
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
  appInfoCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
    fontFamily: 'NunitoSans_700Bold',
  },
  appVersion: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    fontFamily: 'NunitoSans_400Regular',
  },
  appTagline: {
    fontSize: 14,
    color: '#3B82F6',
    textAlign: 'center',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  descriptionCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  descriptionText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 22,
    textAlign: 'center',
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
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  creditsCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  creditsText: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 8,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  copyrightText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontFamily: 'NunitoSans_400Regular',
  },
});
