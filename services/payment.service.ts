import { apiService } from './api';
import { Payment, PaymentMethodCard } from '@/types';

class PaymentService {
  async getPaymentMethods(): Promise<PaymentMethodCard[]> {
    return await apiService.get<PaymentMethodCard[]>('/payments/methods');
  }

  async addPaymentMethod(paymentMethodId: string): Promise<PaymentMethodCard> {
    return await apiService.post<PaymentMethodCard>('/payments/methods', { paymentMethodId });
  }

  async deletePaymentMethod(id: string): Promise<void> {
    await apiService.delete(`/payments/methods/${id}`);
  }

  async setDefaultPaymentMethod(id: string): Promise<PaymentMethodCard> {
    return await apiService.patch<PaymentMethodCard>(`/payments/methods/${id}/set-default`);
  }

  async createPaymentIntent(amount: number, currency: string = 'usd'): Promise<{
    clientSecret: string;
    paymentIntentId: string;
  }> {
    return await apiService.post('/payments/create-intent', { amount, currency });
  }

  async processPayment(bookingId: string, paymentMethodId: string, tip?: number): Promise<Payment> {
    return await apiService.post<Payment>('/payments/process', {
      bookingId,
      paymentMethodId,
      tip,
    });
  }

  async refundPayment(paymentId: string, amount?: number): Promise<Payment> {
    return await apiService.post<Payment>(`/payments/${paymentId}/refund`, { amount });
  }

  async getPaymentHistory(): Promise<Payment[]> {
    return await apiService.get<Payment[]>('/payments/history');
  }
}

export const paymentService = new PaymentService();
