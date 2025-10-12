import { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Image, ActivityIndicator } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { useProviderByUserId } from '@/hooks/useProviders';
import { useCreateService } from '@/hooks/useServices';
import { pickImage, uploadImage } from '@/lib/storage';

export default function AddServiceScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: provider } = useProviderByUserId(user?.id || '');
  const createServiceMutation = useCreateService(provider?.id || '');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    serviceType: 'basic_wash' as any,
    price: '',
    duration: '',
    isActive: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageUrl, setImageUrl] = useState<string>('');
  const [uploadingImage, setUploadingImage] = useState(false);

  const serviceTypes = [
    { value: 'basic_wash', label: 'Basic Wash', icon: 'water', color: '#3B82F6' },
    { value: 'premium_wash', label: 'Premium Wash', icon: 'star', color: '#FFA500' },
    { value: 'full_detail', label: 'Full Detail', icon: 'sparkles', color: '#8B5CF6' },
    { value: 'interior_detail', label: 'Interior Detail', icon: 'car-seat', color: '#10B981' },
    { value: 'exterior_detail', label: 'Exterior Detail', icon: 'car-wash', color: '#06B6D4' },
    { value: 'paint_correction', label: 'Paint Correction', icon: 'auto-fix', color: '#EC4899' },
    { value: 'ceramic_coating', label: 'Ceramic Coating', icon: 'shield-check', color: '#F59E0B' },
  ];

  const handleUploadImage = async () => {
    try {
      setUploadingImage(true);

      const image = await pickImage();
      if (!image) {
        setUploadingImage(false);
        return;
      }

      // Upload to Supabase
      const result = await uploadImage(image.uri, 'services', `service_${provider?.id}_${Date.now()}.jpg`);
      setImageUrl(result.url);

      Alert.alert('Success', 'Service image uploaded!');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', error.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Service name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid price is required';
    if (!formData.duration.trim()) newErrors.duration = 'Duration is required';
    if (!imageUrl.trim()) newErrors.image = 'Service image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting');
      return;
    }

    createServiceMutation.mutate(
      {
        name: formData.name,
        description: formData.description,
        serviceType: formData.serviceType,
        price: parseFloat(formData.price),
        duration: formData.duration,
        isActive: formData.isActive,
        imageUrl: imageUrl,
      },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Service created successfully', [
            { text: 'OK', onPress: () => router.back() }
          ]);
        },
        onError: (error) => {
          Alert.alert('Error', (error as Error).message);
        },
      }
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Service</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Service Image */}
        <View style={styles.field}>
          <Text style={styles.label}>Service Image *</Text>
          <TouchableOpacity
            style={[styles.imageUploadContainer, errors.image && styles.imageUploadError]}
            onPress={handleUploadImage}
            disabled={uploadingImage}
          >
            {uploadingImage ? (
              <ActivityIndicator size="large" color="#3B82F6" />
            ) : imageUrl ? (
              <>
                <Image source={{ uri: imageUrl }} style={styles.uploadedImage} />
                <View style={styles.changeImageOverlay}>
                  <MaterialCommunityIcons name="camera" size={32} color="#FFF" />
                  <Text style={styles.changeImageText}>Change Image</Text>
                </View>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="image-plus" size={48} color="#9CA3AF" />
                <Text style={styles.uploadPlaceholderText}>Tap to upload service image</Text>
                <Text style={styles.uploadHintText}>Recommended: 800x600px</Text>
              </>
            )}
          </TouchableOpacity>
          {errors.image && <Text style={styles.errorText}>{errors.image}</Text>}
        </View>

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

        {/* Service Type */}
        <View style={styles.field}>
          <Text style={styles.label}>Service Type *</Text>
          <View style={styles.typeGrid}>
            {serviceTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeCard,
                  formData.serviceType === type.value && styles.typeCardActive,
                  { borderColor: formData.serviceType === type.value ? type.color : '#E5E7EB' }
                ]}
                onPress={() => setFormData({ ...formData, serviceType: type.value as any })}
              >
                <MaterialCommunityIcons
                  name={type.icon as any}
                  size={28}
                  color={formData.serviceType === type.value ? type.color : '#9CA3AF'}
                />
                <Text style={[
                  styles.typeLabel,
                  formData.serviceType === type.value && { color: type.color }
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
          <Text style={styles.characterCount}>{formData.description.length}/500</Text>
        </View>

        {/* Price & Duration Row */}
        <View style={styles.row}>
          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>Price *</Text>
            <View style={styles.inputWithIcon}>
              <Text style={styles.inputIcon}>$</Text>
              <TextInput
                style={[styles.input, styles.inputWithPadding, errors.price && styles.inputError]}
                value={formData.price}
                onChangeText={(text) => setFormData({ ...formData, price: text })}
                placeholder="0.00"
                placeholderTextColor="#999"
                keyboardType="decimal-pad"
              />
            </View>
            {errors.price && <Text style={styles.errorText}>{errors.price}</Text>}
          </View>

          <View style={[styles.field, styles.halfField]}>
            <Text style={styles.label}>Duration *</Text>
            <TextInput
              style={[styles.input, errors.duration && styles.inputError]}
              value={formData.duration}
              onChangeText={(text) => setFormData({ ...formData, duration: text })}
              placeholder="e.g., 45 min"
              placeholderTextColor="#999"
            />
            {errors.duration && <Text style={styles.errorText}>{errors.duration}</Text>}
          </View>
        </View>

        {/* Active Toggle */}
        <TouchableOpacity
          style={styles.toggleContainer}
          onPress={() => setFormData({ ...formData, isActive: !formData.isActive })}
        >
          <View style={styles.toggleLeft}>
            <MaterialCommunityIcons
              name={formData.isActive ? 'check-circle' : 'circle-outline'}
              size={24}
              color={formData.isActive ? '#10B981' : '#9CA3AF'}
            />
            <View style={styles.toggleInfo}>
              <Text style={styles.toggleLabel}>Activate Service</Text>
              <Text style={styles.toggleSubtext}>
                Service will be visible to customers and available for booking
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, createServiceMutation.isPending && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={createServiceMutation.isPending}
        >
          {createServiceMutation.isPending ? (
            <Text style={styles.submitButtonText}>Creating Service...</Text>
          ) : (
            <>
              <MaterialCommunityIcons name="plus-circle" size={20} color="#FFF" />
              <Text style={styles.submitButtonText}>Create Service</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'NunitoSans_700Bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  field: {
    marginTop: 24,
  },
  halfField: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    borderWidth: 2,
    borderColor: 'transparent',
    fontFamily: 'NunitoSans_400Regular',
  },
  inputError: {
    borderColor: '#DC2626',
  },
  inputWithIcon: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: 14,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    zIndex: 1,
    fontFamily: 'NunitoSans_700Bold',
  },
  inputWithPadding: {
    paddingLeft: 32,
  },
  textArea: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#333',
    borderWidth: 2,
    borderColor: 'transparent',
    fontFamily: 'NunitoSans_400Regular',
    minHeight: 100,
  },
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: '31%',
    aspectRatio: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
  },
  typeCardActive: {
    backgroundColor: '#FFF',
  },
  typeLabel: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  toggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  toggleInfo: {
    marginLeft: 12,
    flex: 1,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  toggleSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    fontFamily: 'NunitoSans_400Regular',
  },
  submitButton: {
    flexDirection: 'row',
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    paddingVertical: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 32,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    fontFamily: 'NunitoSans_700Bold',
  },
  imageUploadContainer: {
    height: 200,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
    borderStyle: 'dashed',
    overflow: 'hidden',
  },
  imageUploadError: {
    borderColor: '#DC2626',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  changeImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeImageText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  uploadPlaceholderText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    fontFamily: 'NunitoSans_400Regular',
  },
  uploadHintText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
  bottomPadding: {
    height: 40,
  },
});
