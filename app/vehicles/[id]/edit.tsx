import { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import { useVehicle, useUpdateVehicle } from '@/hooks/useVehicles';
import { pickImage, uploadImage } from '@/lib/storage';

export default function EditVehicleScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { user } = useAuthStore();
  const { data: vehicle, isLoading } = useVehicle(id as string);
  const updateVehicleMutation = useUpdateVehicle(user?.id || '');

  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: '',
    color: '',
    licensePlate: '',
    vehicleType: 'sedan' as 'sedan' | 'suv' | 'truck' | 'van' | 'sports',
    imageUrl: '',
    isDefault: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    if (vehicle) {
      setFormData({
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        color: vehicle.color || '',
        licensePlate: vehicle.licensePlate || '',
        vehicleType: vehicle.vehicleType as any,
        imageUrl: vehicle.imageUrl || '',
        isDefault: vehicle.isDefault,
      });
    }
  }, [vehicle]);

  const handleUploadImage = async () => {
    try {
      setUploadingImage(true);
      const image = await pickImage();
      if (!image) {
        setUploadingImage(false);
        return;
      }

      const result = await uploadImage(
        image.uri,
        'vehicles',
        `vehicle_${user?.id}_${Date.now()}.jpg`
      );

      setFormData({ ...formData, imageUrl: result.url });
      Alert.alert('Success', 'Vehicle image uploaded!');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const vehicleTypes = [
    { value: 'sedan', label: 'Sedan', icon: '🚗' },
    { value: 'suv', label: 'SUV', icon: '🚙' },
    { value: 'truck', label: 'Truck', icon: '🛻' },
    { value: 'van', label: 'Van', icon: '🚐' },
    { value: 'sports', label: 'Sports', icon: '🏎️' },
  ];

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.make.trim()) newErrors.make = 'Make is required';
    if (!formData.model.trim()) newErrors.model = 'Model is required';
    if (!formData.year.trim()) {
      newErrors.year = 'Year is required';
    } else if (!/^\d{4}$/.test(formData.year)) {
      newErrors.year = 'Year must be 4 digits';
    } else {
      const year = parseInt(formData.year);
      const currentYear = new Date().getFullYear();
      if (year < 1900 || year > currentYear + 1) {
        newErrors.year = `Year must be between 1900 and ${currentYear + 1}`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) {
      Alert.alert('Validation Error', 'Please fix the errors before submitting');
      return;
    }

    updateVehicleMutation.mutate(
      { id: id as string, input: formData },
      {
        onSuccess: () => {
          Alert.alert('Success', 'Vehicle updated successfully', [
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
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 16, color: '#666' }}>Loading vehicle...</Text>
      </View>
    );
  }

  if (!vehicle) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={{ color: '#DC2626' }}>Vehicle not found</Text>
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
        <Text style={styles.headerTitle}>Edit Vehicle</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Vehicle Image Upload */}
        <View style={styles.field}>
          <Text style={styles.label}>Vehicle Photo (Optional)</Text>
          <TouchableOpacity
            style={styles.imageUploadContainer}
            onPress={handleUploadImage}
            disabled={uploadingImage}
          >
            {uploadingImage ? (
              <ActivityIndicator size="large" color="#3B82F6" />
            ) : formData.imageUrl ? (
              <>
                <Image source={{ uri: formData.imageUrl }} style={styles.uploadedImage} />
                <View style={styles.changeImageOverlay}>
                  <MaterialCommunityIcons name="camera" size={32} color="#FFF" />
                  <Text style={styles.changeImageText}>Change Photo</Text>
                </View>
              </>
            ) : (
              <>
                <MaterialCommunityIcons name="camera-plus" size={48} color="#9CA3AF" />
                <Text style={styles.uploadPlaceholderText}>Tap to upload vehicle photo</Text>
                <Text style={styles.uploadHintText}>Recommended for better bookings</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Make */}
        <View style={styles.field}>
          <Text style={styles.label}>Make *</Text>
          <TextInput
            style={[styles.input, errors.make && styles.inputError]}
            value={formData.make}
            onChangeText={(text) => setFormData({ ...formData, make: text })}
            placeholder="e.g., Toyota, Honda, BMW"
            placeholderTextColor="#999"
          />
          {errors.make && <Text style={styles.errorText}>{errors.make}</Text>}
        </View>

        {/* Model */}
        <View style={styles.field}>
          <Text style={styles.label}>Model *</Text>
          <TextInput
            style={[styles.input, errors.model && styles.inputError]}
            value={formData.model}
            onChangeText={(text) => setFormData({ ...formData, model: text })}
            placeholder="e.g., Camry, Civic, X5"
            placeholderTextColor="#999"
          />
          {errors.model && <Text style={styles.errorText}>{errors.model}</Text>}
        </View>

        {/* Year */}
        <View style={styles.field}>
          <Text style={styles.label}>Year *</Text>
          <TextInput
            style={[styles.input, errors.year && styles.inputError]}
            value={formData.year}
            onChangeText={(text) => setFormData({ ...formData, year: text })}
            placeholder="e.g., 2022"
            placeholderTextColor="#999"
            keyboardType="number-pad"
            maxLength={4}
          />
          {errors.year && <Text style={styles.errorText}>{errors.year}</Text>}
        </View>

        {/* Color */}
        <View style={styles.field}>
          <Text style={styles.label}>Color (Optional)</Text>
          <TextInput
            style={styles.input}
            value={formData.color}
            onChangeText={(text) => setFormData({ ...formData, color: text })}
            placeholder="e.g., Black, White, Silver"
            placeholderTextColor="#999"
          />
        </View>

        {/* License Plate */}
        <View style={styles.field}>
          <Text style={styles.label}>License Plate (Optional)</Text>
          <TextInput
            style={styles.input}
            value={formData.licensePlate}
            onChangeText={(text) => setFormData({ ...formData, licensePlate: text.toUpperCase() })}
            placeholder="e.g., ABC 1234"
            placeholderTextColor="#999"
            autoCapitalize="characters"
          />
        </View>

        {/* Vehicle Type */}
        <View style={styles.field}>
          <Text style={styles.label}>Vehicle Type *</Text>
          <View style={styles.typeGrid}>
            {vehicleTypes.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.typeCard,
                  formData.vehicleType === type.value && styles.typeCardActive
                ]}
                onPress={() => setFormData({ ...formData, vehicleType: type.value as any })}
              >
                <Text style={styles.typeEmoji}>{type.icon}</Text>
                <Text style={[
                  styles.typeLabel,
                  formData.vehicleType === type.value && styles.typeLabelActive
                ]}>
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Set as Default */}
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setFormData({ ...formData, isDefault: !formData.isDefault })}
        >
          <View style={[styles.checkbox, formData.isDefault && styles.checkboxChecked]}>
            {formData.isDefault && (
              <MaterialCommunityIcons name="check" size={18} color="#FFF" />
            )}
          </View>
          <View style={styles.checkboxLabel}>
            <Text style={styles.checkboxText}>Set as default vehicle</Text>
            <Text style={styles.checkboxSubtext}>
              This vehicle will be pre-selected for bookings
            </Text>
          </View>
        </TouchableOpacity>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, updateVehicleMutation.isPending && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={updateVehicleMutation.isPending}
        >
          {updateVehicleMutation.isPending ? (
            <Text style={styles.submitButtonText}>Updating Vehicle...</Text>
          ) : (
            <>
              <MaterialCommunityIcons name="content-save" size={20} color="#FFF" />
              <Text style={styles.submitButtonText}>Save Changes</Text>
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  errorText: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeCard: {
    width: '30%',
    aspectRatio: 1,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  typeCardActive: {
    backgroundColor: '#E0F2FE',
    borderColor: '#3B82F6',
  },
  typeEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  typeLabelActive: {
    color: '#3B82F6',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 24,
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkboxChecked: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  checkboxLabel: {
    flex: 1,
  },
  checkboxText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  checkboxSubtext: {
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
  bottomPadding: {
    height: 40,
  },
  imageUploadContainer: {
    height: 200,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  changeImageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0,
  },
  changeImageText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 8,
    fontFamily: 'NunitoSans_700Bold',
  },
  uploadPlaceholderText: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    fontFamily: 'NunitoSans_600SemiBold',
  },
  uploadHintText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
});
