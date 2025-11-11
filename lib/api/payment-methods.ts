import { supabase } from '@/lib/supabase';

export interface PaymentMethodCard {
  id: string;
  userId: string;
  type: string;
  last4: string;
  brand: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
  stripePaymentMethodId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentMethodInput {
  userId: string;
  type: string;
  last4: string;
  brand: string;
  expiryMonth: string;
  expiryYear: string;
  stripePaymentMethodId?: string;
}

// Get all payment methods for a user
export async function getPaymentMethods(userId: string): Promise<PaymentMethodCard[]> {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map((pm) => ({
    id: pm.id,
    userId: pm.user_id,
    type: pm.type,
    last4: pm.last4,
    brand: pm.brand,
    expiryMonth: pm.expiry_month,
    expiryYear: pm.expiry_year,
    isDefault: pm.is_default,
    stripePaymentMethodId: pm.stripe_payment_method_id,
    createdAt: new Date(pm.created_at),
    updatedAt: new Date(pm.updated_at),
  }));
}

// Create a new payment method
export async function createPaymentMethod(input: CreatePaymentMethodInput): Promise<PaymentMethodCard> {
  const { data, error } = await supabase
    .from('payment_methods')
    .insert({
      user_id: input.userId,
      type: input.type,
      last4: input.last4,
      brand: input.brand,
      expiry_month: input.expiryMonth,
      expiry_year: input.expiryYear,
      stripe_payment_method_id: input.stripePaymentMethodId,
      is_default: false,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    userId: data.user_id,
    type: data.type,
    last4: data.last4,
    brand: data.brand,
    expiryMonth: data.expiry_month,
    expiryYear: data.expiry_year,
    isDefault: data.is_default,
    stripePaymentMethodId: data.stripe_payment_method_id,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

// Set a payment method as default
export async function setDefaultPaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
  // First, set all payment methods for this user to non-default
  const { error: updateError } = await supabase
    .from('payment_methods')
    .update({ is_default: false, updated_at: new Date().toISOString() })
    .eq('user_id', userId);

  if (updateError) throw updateError;

  // Then set the specified payment method as default
  const { error: setDefaultError } = await supabase
    .from('payment_methods')
    .update({ is_default: true, updated_at: new Date().toISOString() })
    .eq('id', paymentMethodId)
    .eq('user_id', userId);

  if (setDefaultError) throw setDefaultError;
}

// Delete a payment method
export async function deletePaymentMethod(paymentMethodId: string, userId: string): Promise<void> {
  const { error } = await supabase
    .from('payment_methods')
    .delete()
    .eq('id', paymentMethodId)
    .eq('user_id', userId);

  if (error) throw error;
}
