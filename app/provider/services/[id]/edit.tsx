import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Text, Switch } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { useProviderByUserId } from '@/hooks/useProviders';
import { useService, useUpdateService } from '@/hooks/useServices';

export default function EditServiceScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuthStore();
  const { data: provider } = useProviderByUserId(user?.id || '');
  const { data: service, isLoading } = useService(id);
  const updateServiceMutation = useUpdateService();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    serviceType: 'basic_wash' as any,
    price: '',
    duration: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        description: service.description || '',
        serviceType: service.serviceType || 'basic_wash',
        price: service.basePrice?.toString() || '',
        duration: service.duration || '',
        isActive: service.isActive ?? true,
      });
    }
  }, [service]);

  const serviceTypes = [
    { value: 'basic_wash', label: 'Basic Wash', icon: 'water', color: '#3B82F6' },
    { value: 'premium_wash', label: 'Premium Wash', icon: 'star', color: '#FFA500' },
    { value: 'full_detail', label: 'Full Detail', icon: 'sparkles', color: '#8B5CF6' },
    { value: 'interior_detail', label: 'Interior Detail', icon: 'car-seat', color: '#10B981' },
    { value: 'exterior_detail', label: 'Exterior Detail', icon: 'car-wash', color: '#06B6D4' },
    { value: 'paint_correction', label: 'Paint Correction', icon: 'auto-fix', color: '#EC4899' },
    { value: 'ceramic_coating', label: 'Ceramic Coating', icon: 'shield-check', color: '#F59E0B' },
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Service name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.duration.trim()) newErrors.duration = 'Duration is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting');
      return;
    }

    updateServiceMutation.mutate(
      {
        id,
        input: {
          name: formData.name,
          description: formData.description,
          serviceType: formData.serviceType,
          price: parseFloat(formData.price),
          duration: formData.duration,
          isActive: formData.isActive,
        },
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Service updated successfully', [
            { text: 'OK', onPress: () => router.back() }
          ]);
        },
        onError: (error) => {
          Alert.alert('Error', (error as Error).message);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>Loading service...</Text>
      </View>
    );
  }

  if (!service) {
    return (
      <View style={styles.emptyContainer}>
        <MaterialCommunityIcons name="alert-circle" size={64} color="#999" />
        <Text style={styles.emptyText}>Service not found</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBackButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Service</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Service Name */}
        <View style={styles.field}>
          <Text style={styles.label}>Service Name *</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={formData.name}
            onChangeText={(text) => setFormData({ ...formData, name: text })}
            placeholder="e.g., Premium Wash & Wax"
            placeholderTextColor="#999"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.textArea, errors.description && styles.inputError]}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            placeholder="Describe what's included in this service..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
          {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
        </View>

        {/* Service Type */}
        <View style={styles.field}>
          <Text style={styles.label}>Service Type *</Text>
          <View style={styles.serviceTypeGrid}>
            {serviceTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.serviceTypeCard,
                  formData.serviceType === type.value && styles.serviceTypeCardActive,
                  { borderColor: formData.serviceType === type.value ? type.color : '#E5E7EB' }
                ]}
                onPress={() => setFormData({ ...formData, serviceType: type.value })}
              >
                <View style={[styles.serviceTypeIcon, { backgroundColor: `${type.color}20` }]}>
                  <MaterialCommunityIcons name={type.icon as any} size={24} color={type.color} />
                </View>
                <Text style={[
                  styles.serviceTypeLabel,
                  formData.serviceType === type.value && styles.serviceTypeLabelActive
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Price */}
        <View style={styles.field}>
          <Text style={styles.label}>Base Price (USD) *</Text>
          <View style={styles.priceInputContainer}>
            <Text style={styles.currencySymbol}>$</Text>
            <TextInput
              style={[styles.priceInput, errors.price && styles.inputError]}
              value={formData.price}
              onChangeText={(text) => setFormData({ ...formData, price: text })}
              placeholder="0.00"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
            />
          </View>
          {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
        </View>

        {/* Duration */}
        <View style={styles.field}>
          <Text style={styles.label}>Duration *</Text>
          <TextInput
            style={[styles.input, errors.duration && styles.inputError]}
            value={formData.duration}
            onChangeText={(text) => setFormData({ ...formData, duration: text })}
            placeholder="e.g., 1-2 hours, 45 minutes"
            placeholderTextColor="#999"
          />
          {errors.duration && <Text style={styles.errorText}>{errors.duration}</Text>}
        </View>

        {/* Active Status */}
        <View style={styles.field}>
          <View style={styles.switchContainer}>
            <View style={styles.switchLabel}>
              <MaterialCommunityIcons
                name={formData.isActive ? 'check-circle' : 'close-circle'}
                size={24}
                color={formData.isActive ? '#10B981' : '#999'}
              />
              <View style={styles.switchTextContainer}>
                <Text style={styles.switchTitle}>Service Active</Text>
                <Text style={styles.switchSubtitle}>
                  {formData.isActive ? 'Available for customers' : 'Hidden from customers'}
                </Text>
              </View>
            </View>
            <Switch
              value={formData.isActive}
              onValueChange={(value) => setFormData({ ...formData, isActive: value })}
              color="#3B82F6"
            />
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, updateServiceMutation.isPending && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={updateServiceMutation.isPending}
        >
          {updateServiceMutation.isPending ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <MaterialCommunityIcons name="check" size={20} color="#FFF" />
              <Text style={styles.submitButtonText}>Update Service</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    fontFamily: 'NunitoSans_400Regular',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#3B82F6',
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 14,
    color: '#FFF',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerBackButton: {
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
  content: {
    flex: 1,
  },
  field: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    fontFamily: 'NunitoSans_400Regular',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  inputError: {
    borderColor: '#EF4444',
  },
  textArea: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    fontFamily: 'NunitoSans_400Regular',
    minHeight: 100,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
  serviceTypeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceTypeCard: {
    width: '48%',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
  },
  serviceTypeCardActive: {
    backgroundColor: '#F0F9FF',
  },
  serviceTypeIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  serviceTypeLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  serviceTypeLabelActive: {
    color: '#333',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  currencySymbol: {
    fontSize: 18,
    color: '#333',
    paddingLeft: 12,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  priceInput: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: '#333',
    fontFamily: 'NunitoSans_400Regular',
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
  },
  switchLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  switchTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  switchTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  switchSubtitle: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'NunitoSans_400Regular',
  },
  bottomPadding: {
    height: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: '#FFF',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#CCC',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'NunitoSans_700Bold',
  },
});
