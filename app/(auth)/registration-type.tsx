import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function RegistrationTypeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Blue Background Header */}
      <View style={styles.blueHeader}>
        <View style={styles.headerContent}>
          <Text style={styles.foamlyText}>FOAMLY</Text>
          <View style={styles.underline} />
        </View>
      </View>

      {/* White Card */}
      <View style={styles.whiteCard}>
        {/* Title */}
        <Text style={styles.titleText}>JOIN FOAMLY</Text>

        <Text style={styles.subtitle}>
          Choose how you want to use Foamly
        </Text>

        {/* Customer Card */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => router.push('/(auth)/register-customer')}
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="account" size={40} color="#3B82F6" />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>I'm a Customer</Text>
            <Text style={styles.optionDescription}>
              Book car detailing services
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>

        {/* Provider Card */}
        <TouchableOpacity
          style={styles.optionCard}
          onPress={() => router.push('/(auth)/register-provider')}
        >
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons name="car-wash" size={40} color="#FFA500" />
          </View>
          <View style={styles.optionContent}>
            <Text style={styles.optionTitle}>I'm a Provider</Text>
            <Text style={styles.optionDescription}>
              Offer detailing services
            </Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#999" />
        </TouchableOpacity>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.loginLink}>Log In</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffffff',
  },
  blueHeader: {
    height: 300,
    backgroundColor: '#3B82F6',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 60,
  },
  headerContent: {
    alignItems: 'center',
    marginTop: 40,
  },
  foamlyText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  underline: {
    width: 60,
    height: 4,
    backgroundColor: '#FFA500',
    marginTop: 8,
    borderRadius: 2,
  },
  whiteCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderBottomLeftRadius: 30,
    marginTop: -60,
    marginBottom: 40,
    marginLeft: 40,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
  },
  titleText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3B82F6',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 30,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  iconContainer: {
    width: 56,
    height: 56,
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 12,
    color: '#666',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 13,
    color: '#666',
  },
  loginLink: {
    fontSize: 13,
    color: '#3B82F6',
    fontWeight: 'bold',
  },
});
