import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function HelpSupportScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const handleContactSupport = () => {
    Alert.alert('Contact Support', 'Our team will respond within 24 hours.');
  };

  const handleLiveChat = () => {
    Alert.alert('Live Chat', 'Live chat feature coming soon!');
  };

  const handleEmail = async () => {
    const email = 'support@foamly.com';
    const url = `mailto:${email}`;
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      Alert.alert('Error', 'Cannot open email client');
    }
  };

  const handlePhone = async () => {
    const phone = 'tel:+1234567890';
    const canOpen = await Linking.canOpenURL(phone);
    if (canOpen) {
      await Linking.openURL(phone);
    } else {
      Alert.alert('Error', 'Cannot make phone calls');
    }
  };

  const handleFAQ = () => {
    Alert.alert('FAQ', 'Frequently asked questions coming soon!');
  };

  const handleHelpCenter = () => {
    Alert.alert('Help Center', 'Help documentation coming soon!');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.innerContainer}>
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        >
          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>

            <TouchableOpacity style={styles.actionCard} onPress={handleLiveChat}>
              <View style={styles.actionIcon}>
                <MaterialCommunityIcons name="message-text" size={24} color="#3B82F6" />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>Live Chat</Text>
                <Text style={styles.actionDesc}>Chat with our support team</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionCard} onPress={handleFAQ}>
              <View style={styles.actionIcon}>
                <MaterialCommunityIcons name="help-circle" size={24} color="#3B82F6" />
              </View>
              <View style={styles.actionInfo}>
                <Text style={styles.actionTitle}>FAQ</Text>
                <Text style={styles.actionDesc}>Find answers to common questions</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
            </TouchableOpacity>
          </View>

          {/* Contact Us */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Us</Text>

            <View style={styles.contactCard}>
              <TouchableOpacity style={styles.contactItem} onPress={handleEmail}>
                <View style={styles.contactIconContainer}>
                  <MaterialCommunityIcons name="email" size={20} color="#3B82F6" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Email</Text>
                  <Text style={styles.contactValue}>support@foamly.com</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.contactItem} onPress={handlePhone}>
                <View style={styles.contactIconContainer}>
                  <MaterialCommunityIcons name="phone" size={20} color="#3B82F6" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Phone</Text>
                  <Text style={styles.contactValue}>+1 (234) 567-890</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.contactItem} onPress={handleContactSupport}>
                <View style={styles.contactIconContainer}>
                  <MaterialCommunityIcons name="ticket" size={20} color="#3B82F6" />
                </View>
                <View style={styles.contactInfo}>
                  <Text style={styles.contactLabel}>Submit a Ticket</Text>
                  <Text style={styles.contactValue}>We'll respond within 24 hours</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Resources */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resources</Text>

            <TouchableOpacity style={styles.menuItem} onPress={handleHelpCenter}>
              <MaterialCommunityIcons name="book-open" size={20} color="#666" />
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>Help Center</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons name="video" size={20} color="#666" />
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>Video Tutorials</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <MaterialCommunityIcons name="comment-question" size={20} color="#666" />
              <View style={styles.menuInfo}>
                <Text style={styles.menuLabel}>Community Forum</Text>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={24} color="#CCC" />
            </TouchableOpacity>
          </View>

          {/* Hours */}
          <View style={styles.section}>
            <View style={styles.hoursCard}>
              <MaterialCommunityIcons name="clock-outline" size={24} color="#3B82F6" />
              <View style={styles.hoursInfo}>
                <Text style={styles.hoursTitle}>Support Hours</Text>
                <Text style={styles.hoursText}>Monday - Friday: 8:00 AM - 8:00 PM</Text>
                <Text style={styles.hoursText}>Saturday - Sunday: 9:00 AM - 6:00 PM</Text>
              </View>
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
  contactCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 4,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  contactIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactInfo: {
    flex: 1,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  contactValue: {
    fontSize: 13,
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
  hoursCard: {
    flexDirection: 'row',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  hoursInfo: {
    marginLeft: 12,
    flex: 1,
  },
  hoursTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    fontFamily: 'NunitoSans_700Bold',
  },
  hoursText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
});
