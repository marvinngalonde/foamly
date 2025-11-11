import { View, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Modal, TextInput } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { usePaymentMethods, useSetDefaultPaymentMethod, useDeletePaymentMethod, useCreatePaymentMethod } from '@/hooks/usePaymentMethods';

export default function PaymentMethodsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();

  const { data: paymentMethods = [], isLoading, error } = usePaymentMethods(user?.id || '');
  const setDefaultMutation = useSetDefaultPaymentMethod();
  const deleteMutation = useDeletePaymentMethod();
  const createMutation = useCreatePaymentMethod();

  const [showAddModal, setShowAddModal] = useState(false);
  const [cardType, setCardType] = useState('Visa');
  const [last4, setLast4] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');

  const handleAddCard = () => {
    setShowAddModal(true);
  };

  const handleSaveCard = () => {
    if (!user?.id) return;

    // Validation
    if (!last4 || last4.length !== 4) {
      Alert.alert('Error', 'Please enter the last 4 digits of your card');
      return;
    }
    if (!expiryMonth || !expiryYear) {
      Alert.alert('Error', 'Please enter card expiry date');
      return;
    }
    if (parseInt(expiryMonth) < 1 || parseInt(expiryMonth) > 12) {
      Alert.alert('Error', 'Invalid expiry month');
      return;
    }

    createMutation.mutate(
      {
        userId: user.id,
        type: cardType,
        last4: last4,
        brand: cardType,
        expiryMonth: expiryMonth.padStart(2, '0'),
        expiryYear: expiryYear,
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Payment method added successfully');
          setShowAddModal(false);
          setLast4('');
          setExpiryMonth('');
          setExpiryYear('');
          setCardType('Visa');
        },
        onError: (err) => {
          Alert.alert('Error', 'Failed to add payment method');
          console.error(err);
        },
      }
    );
  };

  const handleSetDefault = (paymentMethodId: string) => {
    if (!user?.id) return;

    setDefaultMutation.mutate(
      { userId: user.id, paymentMethodId },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Default payment method updated');
        },
        onError: (err) => {
          Alert.alert('Error', 'Failed to set default payment method');
          console.error(err);
        },
      }
    );
  };

  const handleRemove = (paymentMethodId: string) => {
    if (!user?.id) return;

    Alert.alert(
      'Remove Card',
      'Are you sure you want to remove this payment method?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            deleteMutation.mutate(
              { paymentMethodId, userId: user.id },
              {
                onSuccess: () => {
                  Alert.alert('Success', 'Payment method removed');
                },
                onError: (err) => {
                  Alert.alert('Error', 'Failed to remove payment method');
                  console.error(err);
                },
              }
            );
          }
        }
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
        <Text style={styles.headerTitle}>Payment Methods</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.innerContainer}>
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
        >
          {/* Add Card Button */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.addButton} onPress={handleAddCard}>
              <MaterialCommunityIcons name="plus-circle" size={24} color="#3B82F6" />
              <Text style={styles.addButtonText}>Add New Card</Text>
            </TouchableOpacity>
          </View>

          {/* Cards List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Saved Cards</Text>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3B82F6" />
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Failed to load payment methods</Text>
              </View>
            ) : paymentMethods.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="credit-card-off" size={48} color="#CCC" />
                <Text style={styles.emptyText}>No payment methods added yet</Text>
              </View>
            ) : (
              paymentMethods.map((method) => (
                <View key={method.id} style={styles.paymentCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.cardInfo}>
                      <MaterialCommunityIcons
                        name={method.brand.toLowerCase() === 'visa' ? 'credit-card' : 'credit-card-outline'}
                        size={32}
                        color={method.brand.toLowerCase() === 'visa' ? '#1A1F71' : '#EB001B'}
                      />
                      <View style={styles.cardDetails}>
                        <Text style={styles.cardType}>{method.brand}</Text>
                        <Text style={styles.cardNumber}>•••• {method.last4}</Text>
                      </View>
                    </View>
                    {method.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultText}>Default</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardExpiry}>Expires {method.expiryMonth}/{method.expiryYear}</Text>

                  <View style={styles.cardActions}>
                    {!method.isDefault && (
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleSetDefault(method.id)}
                        disabled={setDefaultMutation.isPending}
                      >
                        <Text style={styles.actionButtonText}>Set as Default</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.actionButton, styles.removeButton]}
                      onPress={() => handleRemove(method.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Text style={styles.removeButtonText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>

      {/* Add Card Modal */}
      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Payment Method</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Card Type</Text>
              <View style={styles.cardTypeButtons}>
                {['Visa', 'Mastercard', 'Amex', 'Discover'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.cardTypeButton, cardType === type && styles.cardTypeButtonActive]}
                    onPress={() => setCardType(type)}
                  >
                    <Text style={[styles.cardTypeText, cardType === type && styles.cardTypeTextActive]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formSection}>
              <Text style={styles.formLabel}>Last 4 Digits</Text>
              <TextInput
                style={styles.input}
                value={last4}
                onChangeText={setLast4}
                placeholder="1234"
                keyboardType="numeric"
                maxLength={4}
                placeholderTextColor="#999"
              />
            </View>

            <View style={styles.formRow}>
              <View style={[styles.formSection, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.formLabel}>Expiry Month</Text>
                <TextInput
                  style={styles.input}
                  value={expiryMonth}
                  onChangeText={setExpiryMonth}
                  placeholder="12"
                  keyboardType="numeric"
                  maxLength={2}
                  placeholderTextColor="#999"
                />
              </View>
              <View style={[styles.formSection, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.formLabel}>Expiry Year</Text>
                <TextInput
                  style={styles.input}
                  value={expiryYear}
                  onChangeText={setExpiryYear}
                  placeholder="2025"
                  keyboardType="numeric"
                  maxLength={4}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.modalButtonTextCancel}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSave]}
                onPress={handleSaveCard}
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? (
                  <ActivityIndicator size="small" color="#FFF" />
                ) : (
                  <Text style={styles.modalButtonTextSave}>Add Card</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 16,
    fontFamily: 'NunitoSans_700Bold',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderStyle: 'dashed',
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    marginLeft: 12,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  paymentCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardDetails: {
    marginLeft: 12,
  },
  cardType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'NunitoSans_700Bold',
  },
  cardNumber: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
    fontFamily: 'NunitoSans_400Regular',
  },
  cardExpiry: {
    fontSize: 13,
    color: '#999',
    marginBottom: 12,
    fontFamily: 'NunitoSans_400Regular',
  },
  defaultBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: '600',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  removeButton: {
    backgroundColor: '#FEE2E2',
  },
  removeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#DC2626',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 12,
    fontFamily: 'NunitoSans_400Regular',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    fontFamily: 'NunitoSans_700Bold',
  },
  formSection: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    fontFamily: 'NunitoSans_400Regular',
  },
  formRow: {
    flexDirection: 'row',
  },
  cardTypeButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  cardTypeButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#F8F9FA',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  cardTypeButtonActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  cardTypeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  cardTypeTextActive: {
    color: '#3B82F6',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#F3F4F6',
  },
  modalButtonSave: {
    backgroundColor: '#3B82F6',
  },
  modalButtonTextCancel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  modalButtonTextSave: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
    fontFamily: 'NunitoSans_600SemiBold',
  },
});
