import { create } from 'zustand';
import { Vehicle, Service, Provider, AddOn, Location, BookingPricing } from '@/types';

interface BookingFlowState {
  // Booking flow state
  selectedVehicle: Vehicle | null;
  selectedService: Service | null;
  selectedProvider: Provider | null;
  selectedAddOns: AddOn[];
  selectedDate: string | null;
  selectedTime: string | null;
  selectedLocation: Location | null;
  pricing: BookingPricing | null;

  // Actions
  setSelectedVehicle: (vehicle: Vehicle | null) => void;
  setSelectedService: (service: Service | null) => void;
  setSelectedProvider: (provider: Provider | null) => void;
  setSelectedAddOns: (addOns: AddOn[]) => void;
  toggleAddOn: (addOn: AddOn) => void;
  setSelectedDate: (date: string | null) => void;
  setSelectedTime: (time: string | null) => void;
  setSelectedLocation: (location: Location | null) => void;
  setPricing: (pricing: BookingPricing | null) => void;
  resetBookingFlow: () => void;
}

const initialState = {
  selectedVehicle: null,
  selectedService: null,
  selectedProvider: null,
  selectedAddOns: [],
  selectedDate: null,
  selectedTime: null,
  selectedLocation: null,
  pricing: null,
};

export const useBookingStore = create<BookingFlowState>((set) => ({
  ...initialState,

  setSelectedVehicle: (vehicle) => set({ selectedVehicle: vehicle }),

  setSelectedService: (service) => set({ selectedService: service }),

  setSelectedProvider: (provider) => set({ selectedProvider: provider }),

  setSelectedAddOns: (addOns) => set({ selectedAddOns: addOns }),

  toggleAddOn: (addOn) =>
    set((state) => {
      const exists = state.selectedAddOns.find((a) => a.id === addOn.id);
      return {
        selectedAddOns: exists
          ? state.selectedAddOns.filter((a) => a.id !== addOn.id)
          : [...state.selectedAddOns, addOn],
      };
    }),

  setSelectedDate: (date) => set({ selectedDate: date }),

  setSelectedTime: (time) => set({ selectedTime: time }),

  setSelectedLocation: (location) => set({ selectedLocation: location }),

  setPricing: (pricing) => set({ pricing: pricing }),

  resetBookingFlow: () => set(initialState),
}));
