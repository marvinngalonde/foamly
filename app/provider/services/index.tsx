import { View, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState, useMemo } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useProviderByUserId } from '@/hooks/useProviders';
import { useProviderServices, useUpdateService, useDeleteService } from '@/hooks/useServices';

export default function ProviderServicesScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { data: provider } = useProviderByUserId(user?.id || '');
  const { data: services = [], isLoading, refetch } = useProviderServices(provider?.id || '');
  const updateServiceMutation = useUpdateService();
  const deleteServiceMutation = useDeleteService();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = [
    { id: 'basic_wash', name: 'Exterior Wash', icon: 'water', color: '#3B82F6' },
    { id: 'interior_detail', name: 'Interior', icon: 'car-seat', color: '#10B981' },
    { id: 'premium_wash', name: 'Premium', icon: 'star', color: '#FFA500' },
    { id: 'full_detail', name: 'Full Detail', icon: 'sparkles', color: '#8B5CF6' },
    { id: 'paint_correction', name: 'Paint', icon: 'auto-fix', color: '#EC4899' },
    { id: 'ceramic_coating', name: 'Coating', icon: 'shield-check', color: '#06B6D4' },
  ];

  const filteredServices = useMemo(() => {
    if (!selectedCategory) return services;
    return services.filter(s => s.serviceType === selectedCategory);
  }, [services, selectedCategory]);

  const activeServices = services.filter(s => s.isActive).length;
  const totalRevenue = 150000; // TODO: Calculate from completed bookings
  const mostPopular = services.sort((a, b) => {
    // TODO: Sort by booking count
    return 0;
  })[0];

  const handleToggleActive = (serviceId: string, currentStatus: boolean) => {
    updateServiceMutation.mutate(
      { id: serviceId, input: { isActive: !currentStatus } },
      {
        onSuccess: () => {
          Alert.alert('Success', `Service ${currentStatus ? 'deactivated' : 'activated'}`);
          refetch();
        },
        onError: (error) => {
          Alert.alert('Error', (error as Error).message);
        },
      }
    );
  };

  const handleDelete = (serviceId: string, serviceName: string) => {
    Alert.alert(
      'Delete Service',
      `Are you sure you want to delete "${serviceName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteServiceMutation.mutate(serviceId, {
              onSuccess: () => {
                Alert.alert('Success', 'Service deleted');
                refetch();
              },
              onError: (error) => {
                Alert.alert('Error', (error as Error).message);
              },
            });
          }
        }
      ]
    );
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={{ marginTop: 16, color: '#666' }}>Loading services...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Services</Text>
          <Text style={styles.headerSubtitle}>{services.length} total • {activeServices} active</Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => router.push('/provider/services/add')}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="format-list-bulleted" size={24} color="#3B82F6" />
          <Text style={styles.statValue}>{activeServices}</Text>
          <Text style={styles.statLabel}>Active Services</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="cash" size={24} color="#10B981" />
          <Text style={styles.statValue}>${(totalRevenue / 1000).toFixed(1)}k</Text>
          <Text style={styles.statLabel}>Total Revenue</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="star" size={24} color="#FFA500" />
          <Text style={styles.statValue}>{mostPopular?.name.substring(0, 10) || 'N/A'}</Text>
          <Text style={styles.statLabel}>Most Popular</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Categories */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
          contentContainerStyle={styles.categoriesContent}
        >
          <TouchableOpacity
            style={[styles.categoryChip, !selectedCategory && styles.categoryChipActive]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text style={[styles.categoryText, !selectedCategory && styles.categoryTextActive]}>
              All ({services.length})
            </Text>
          </TouchableOpacity>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryChip,
                selectedCategory === category.id && styles.categoryChipActive,
                { borderColor: category.color }
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <MaterialCommunityIcons
                name={category.icon as any}
                size={16}
                color={selectedCategory === category.id ? category.color : '#666'}
              />
              <Text style={[
                styles.categoryText,
                selectedCategory === category.id && { color: category.color }
              ]}>
                {category.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Services List */}
        <View style={styles.servicesContainer}>
          {filteredServices.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="car-wash" size={64} color="#D1D5DB" />
              <Text style={styles.emptyTitle}>No Services Yet</Text>
              <Text style={styles.emptyText}>
                {selectedCategory
                  ? 'No services in this category. Try another category or add a new service.'
                  : 'Add your first service to start receiving bookings'}
              </Text>
              <TouchableOpacity
                style={styles.emptyButton}
                onPress={() => router.push('/provider/services/add')}
              >
                <MaterialCommunityIcons name="plus-circle" size={20} color="#FFF" />
                <Text style={styles.emptyButtonText}>Add Service</Text>
              </TouchableOpacity>
            </View>
          ) : (
            filteredServices.map((service) => (
              <View key={service.id} style={styles.serviceCard}>
                {/* Service Header */}
                <View style={styles.serviceHeader}>
                  <View style={styles.serviceHeaderLeft}>
                    <View style={[styles.serviceIcon, { backgroundColor: `${getCategoryColor(service.serviceType)}20` }]}>
                      <MaterialCommunityIcons
                        name={getCategoryIcon(service.serviceType)}
                        size={24}
                        color={getCategoryColor(service.serviceType)}
                      />
                    </View>
                    <View style={styles.serviceInfo}>
                      <Text style={styles.serviceName}>{service.name}</Text>
                      <Text style={styles.serviceType}>{getServiceTypeLabel(service.serviceType)}</Text>
                    </View>
                  </View>
                  <Switch
                    value={service.isActive}
                    onValueChange={() => handleToggleActive(service.id, service.isActive)}
                    trackColor={{ false: '#D1D5DB', true: '#10B981' }}
                    thumbColor="#FFF"
                  />
                </View>

                {/* Service Description */}
                <Text style={styles.serviceDescription} numberOfLines={2}>
                  {service.description}
                </Text>

                {/* Service Details */}
                <View style={styles.serviceDetails}>
                  <View style={styles.detailItem}>
                    <MaterialCommunityIcons name="clock-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>{service.duration}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <MaterialCommunityIcons name="cash" size={16} color="#666" />
                    <Text style={styles.detailText}>${service.price}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <MaterialCommunityIcons name="calendar-check" size={16} color="#666" />
                    <Text style={styles.detailText}>25 bookings</Text>
                  </View>
                </View>

                {/* Service Actions */}
                <View style={styles.serviceActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push(`/provider/services/${service.id}/edit`)}
                  >
                    <MaterialCommunityIcons name="pencil" size={18} color="#3B82F6" />
                    <Text style={styles.actionButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push(`/provider/services/${service.id}/duplicate`)}
                  >
                    <MaterialCommunityIcons name="content-copy" size={18} color="#10B981" />
                    <Text style={styles.actionButtonText}>Duplicate</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDelete(service.id, service.name)}
                  >
                    <MaterialCommunityIcons name="delete" size={18} color="#DC2626" />
                    <Text style={[styles.actionButtonText, { color: '#DC2626' }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Floating Add Button */}
      {services.length > 0 && (
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/provider/services/add')}
        >
          <MaterialCommunityIcons name="plus" size={28} color="#FFF" />
        </TouchableOpacity>
      )}
    </View>
  );
}

function getCategoryIcon(type: string): any {
  const icons: Record<string, string> = {
    basic_wash: 'water',
    interior_detail: 'car-seat',
    premium_wash: 'star',
    full_detail: 'sparkles',
    exterior_detail: 'car-wash',
    paint_correction: 'auto-fix',
    ceramic_coating: 'shield-check',
  };
  return icons[type] || 'car-wash';
}

function getCategoryColor(type: string): string {
  const colors: Record<string, string> = {
    basic_wash: '#3B82F6',
    interior_detail: '#10B981',
    premium_wash: '#FFA500',
    full_detail: '#8B5CF6',
    exterior_detail: '#06B6D4',
    paint_correction: '#EC4899',
    ceramic_coating: '#F59E0B',
  };
  return colors[type] || '#3B82F6';
}

function getServiceTypeLabel(type: string): string {
  return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#FFF',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'NunitoSans_700Bold',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#666',
    marginTop: 4,
    fontFamily: 'NunitoSans_400Regular',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    fontFamily: 'NunitoSans_700Bold',
  },
  statLabel: {
    fontSize: 11,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
    fontFamily: 'NunitoSans_400Regular',
  },
  categoriesScroll: {
    maxHeight: 60,
  },
  categoriesContent: {
    paddingHorizontal: 20,
    gap: 8,
    paddingVertical: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 6,
  },
  categoryChipActive: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  categoryText: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  categoryTextActive: {
    color: '#3B82F6',
  },
  servicesContainer: {
    padding: 20,
  },
  emptyState: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    fontFamily: 'NunitoSans_700Bold',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
    fontFamily: 'NunitoSans_400Regular',
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#3B82F6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 24,
    gap: 8,
  },
  emptyButtonText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: 'bold',
    fontFamily: 'NunitoSans_700Bold',
  },
  serviceCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'NunitoSans_700Bold',
  },
  serviceType: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
    fontFamily: 'NunitoSans_400Regular',
  },
  serviceDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
    fontFamily: 'NunitoSans_400Regular',
  },
  serviceDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'NunitoSans_600SemiBold',
  },
  serviceActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F9FAFB',
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#3B82F6',
    fontWeight: 'bold',
    fontFamily: 'NunitoSans_700Bold',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3B82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  bottomPadding: {
    height: 100,
  },
});
