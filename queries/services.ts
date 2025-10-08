import { useQuery } from '@tanstack/react-query';
import { Service, ServiceCategory } from '@/types';

// Mock service for now - replace with actual API call
const mockServices: Service[] = [
  {
    id: '1',
    category: ServiceCategory.EXTERIOR_WASH,
    name: 'Basic Exterior Wash',
    description: 'Hand wash, wheels, tires, and dry',
    basePrice: 49.99,
    duration: 30,
    vehicleTypes: [],
    addOns: [],
    images: [],
    isActive: true,
  },
  {
    id: '2',
    category: ServiceCategory.INTERIOR_CLEANING,
    name: 'Interior Deep Clean',
    description: 'Vacuum, wipe down, windows, and air freshener',
    basePrice: 79.99,
    duration: 60,
    vehicleTypes: [],
    addOns: [],
    images: [],
    isActive: true,
  },
  {
    id: '3',
    category: ServiceCategory.FULL_DETAIL,
    name: 'Complete Detail Package',
    description: 'Full exterior and interior detailing',
    basePrice: 149.99,
    duration: 120,
    vehicleTypes: [],
    addOns: [],
    images: [],
    isActive: true,
  },
  {
    id: '4',
    category: ServiceCategory.WAX_POLISH,
    name: 'Premium Wax & Polish',
    description: 'Hand wax and polish for shine protection',
    basePrice: 99.99,
    duration: 90,
    vehicleTypes: [],
    addOns: [],
    images: [],
    isActive: true,
  },
];

// Query keys
export const serviceKeys = {
  all: ['services'] as const,
  lists: () => [...serviceKeys.all, 'list'] as const,
  list: (filters?: ServiceCategory) => [...serviceKeys.lists(), { filters }] as const,
  details: () => [...serviceKeys.all, 'detail'] as const,
  detail: (id: string) => [...serviceKeys.details(), id] as const,
};

// Fetch all services
export const useServices = (category?: ServiceCategory) => {
  return useQuery({
    queryKey: serviceKeys.list(category),
    queryFn: async () => {
      // Replace with actual API call: return await serviceService.getAll();
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate network delay
      return category
        ? mockServices.filter((s) => s.category === category)
        : mockServices;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes - services don't change often
  });
};

// Fetch single service
export const useService = (id: string) => {
  return useQuery({
    queryKey: serviceKeys.detail(id),
    queryFn: async () => {
      // Replace with actual API call: return await serviceService.getById(id);
      await new Promise((resolve) => setTimeout(resolve, 300));
      return mockServices.find((s) => s.id === id) || null;
    },
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
};
