import { apiService } from './api';
import { Booking, BookingStatus, BookingPricing } from '@/types';

class BookingService {
  async getActiveBookings(): Promise<Booking[]> {
    return await apiService.get<Booking[]>('/bookings/active');
  }

  async getPastBookings(): Promise<Booking[]> {
    return await apiService.get<Booking[]>('/bookings/past');
  }

  async getBooking(id: string): Promise<Booking> {
    return await apiService.get<Booking>(`/bookings/${id}`);
  }

  async createBooking(bookingData: Partial<Booking>): Promise<Booking> {
    return await apiService.post<Booking>('/bookings', bookingData);
  }

  async updateStatus(bookingId: string, status: BookingStatus): Promise<Booking> {
    return await apiService.patch<Booking>(`/bookings/${bookingId}/status`, { status });
  }

  async cancelBooking(bookingId: string): Promise<Booking> {
    return await apiService.post<Booking>(`/bookings/${bookingId}/cancel`);
  }

  async calculatePricing(params: {
    serviceId: string;
    addOnIds: string[];
    vehicleType: string;
  }): Promise<BookingPricing> {
    return await apiService.post<BookingPricing>('/bookings/calculate-pricing', params);
  }

  async uploadBeforeImages(bookingId: string, images: FormData): Promise<string[]> {
    return await apiService.uploadFile<string[]>(`/bookings/${bookingId}/before-images`, images);
  }

  async uploadAfterImages(bookingId: string, images: FormData): Promise<string[]> {
    return await apiService.uploadFile<string[]>(`/bookings/${bookingId}/after-images`, images);
  }

  async trackProvider(bookingId: string): Promise<{ latitude: number; longitude: number }> {
    return await apiService.get<{ latitude: number; longitude: number }>(
      `/bookings/${bookingId}/track-provider`
    );
  }
}

export const bookingService = new BookingService();
