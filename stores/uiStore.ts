import { create } from 'zustand';

interface UIState {
  // Modal states
  isBottomSheetOpen: boolean;
  activeModal: string | null;

  // Loading states
  globalLoading: boolean;
  loadingMessage: string | null;

  // Toast/Snackbar
  toast: {
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  };

  // Search and filters
  searchQuery: string;
  activeFilters: Record<string, unknown>;

  // Actions
  openBottomSheet: () => void;
  closeBottomSheet: () => void;
  openModal: (modalName: string) => void;
  closeModal: () => void;
  setGlobalLoading: (loading: boolean, message?: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  hideToast: () => void;
  setSearchQuery: (query: string) => void;
  setFilter: (key: string, value: unknown) => void;
  clearFilters: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Initial state
  isBottomSheetOpen: false,
  activeModal: null,
  globalLoading: false,
  loadingMessage: null,
  toast: {
    visible: false,
    message: '',
    type: 'info',
  },
  searchQuery: '',
  activeFilters: {},

  // Actions
  openBottomSheet: () => set({ isBottomSheetOpen: true }),

  closeBottomSheet: () => set({ isBottomSheetOpen: false }),

  openModal: (modalName) => set({ activeModal: modalName }),

  closeModal: () => set({ activeModal: null }),

  setGlobalLoading: (loading, message) =>
    set({ globalLoading: loading, loadingMessage: message || null }),

  showToast: (message, type = 'info') =>
    set({
      toast: {
        visible: true,
        message,
        type,
      },
    }),

  hideToast: () =>
    set({
      toast: {
        visible: false,
        message: '',
        type: 'info',
      },
    }),

  setSearchQuery: (query) => set({ searchQuery: query }),

  setFilter: (key, value) =>
    set((state) => ({
      activeFilters: {
        ...state.activeFilters,
        [key]: value,
      },
    })),

  clearFilters: () => set({ activeFilters: {}, searchQuery: '' }),
}));
