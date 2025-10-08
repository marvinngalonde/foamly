export const Colors = {
  // Primary colors
  primary: '#1E88E5',
  primaryDark: '#1565C0',
  primaryLight: '#42A5F5',

  // Status colors
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3',

  // Neutral colors
  white: '#FFFFFF',
  black: '#000000',
  background: '#F5F5F5',
  surface: '#FFFFFF',
  card: '#FFFFFF',

  // Text colors
  text: '#212121',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textDisabled: '#BDBDBD',

  // Border colors
  border: '#E0E0E0',
  divider: '#E0E0E0',

  // Booking status colors
  bookingPending: '#FFA726',
  bookingConfirmed: '#66BB6A',
  bookingInProgress: '#42A5F5',
  bookingCompleted: '#4CAF50',
  bookingCancelled: '#EF5350',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.3)',
} as const;

export type ColorKey = keyof typeof Colors;
