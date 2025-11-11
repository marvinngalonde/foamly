import { supabase } from '@/lib/supabase';

// ============ BANK ACCOUNT TYPES ============

export interface ProviderBankAccount {
  id: string;
  providerId: string;
  accountHolderName: string;
  bankName?: string;
  accountNumberLast4?: string;
  routingNumberLast4?: string;
  accountType: 'checking' | 'savings';
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBankAccountInput {
  providerId: string;
  accountHolderName: string;
  bankName?: string;
  accountNumberLast4?: string;
  routingNumberLast4?: string;
  accountType: 'checking' | 'savings';
}

export interface UpdateBankAccountInput {
  accountHolderName?: string;
  bankName?: string;
  accountNumberLast4?: string;
  routingNumberLast4?: string;
  accountType?: 'checking' | 'savings';
}

// ============ PAYOUT TYPES ============

export interface ProviderPayout {
  id: string;
  providerId: string;
  amount: number;
  status: 'pending' | 'approved' | 'processing' | 'paid' | 'rejected' | 'cancelled';
  requestedAt: Date;
  processedAt?: Date;
  notes?: string;
  rejectionReason?: string;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePayoutInput {
  providerId: string;
  amount: number;
  notes?: string;
}

export interface UpdatePayoutInput {
  status?: 'pending' | 'approved' | 'processing' | 'paid' | 'rejected' | 'cancelled';
  processedAt?: Date;
  rejectionReason?: string;
}

// ============ BANK ACCOUNT CRUD OPERATIONS ============

/**
 * Get provider's bank account
 */
export async function getProviderBankAccount(
  providerId: string
): Promise<ProviderBankAccount | null> {
  const { data, error } = await supabase
    .from('provider_bank_accounts')
    .select('*')
    .eq('provider_id', providerId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return {
    id: data.id,
    providerId: data.provider_id,
    accountHolderName: data.account_holder_name,
    bankName: data.bank_name,
    accountNumberLast4: data.account_number_last4,
    routingNumberLast4: data.routing_number_last4,
    accountType: data.account_type as 'checking' | 'savings',
    isVerified: data.is_verified,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * Create or update provider bank account
 */
export async function upsertBankAccount(
  input: CreateBankAccountInput
): Promise<ProviderBankAccount> {
  // Check if account exists
  const existing = await getProviderBankAccount(input.providerId);

  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from('provider_bank_accounts')
      .update({
        account_holder_name: input.accountHolderName,
        bank_name: input.bankName,
        account_number_last4: input.accountNumberLast4,
        routing_number_last4: input.routingNumberLast4,
        account_type: input.accountType,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      providerId: data.provider_id,
      accountHolderName: data.account_holder_name,
      bankName: data.bank_name,
      accountNumberLast4: data.account_number_last4,
      routingNumberLast4: data.routing_number_last4,
      accountType: data.account_type as 'checking' | 'savings',
      isVerified: data.is_verified,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  } else {
    // Create new
    const { data, error } = await supabase
      .from('provider_bank_accounts')
      .insert({
        provider_id: input.providerId,
        account_holder_name: input.accountHolderName,
        bank_name: input.bankName,
        account_number_last4: input.accountNumberLast4,
        routing_number_last4: input.routingNumberLast4,
        account_type: input.accountType,
        is_verified: false,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      providerId: data.provider_id,
      accountHolderName: data.account_holder_name,
      bankName: data.bank_name,
      accountNumberLast4: data.account_number_last4,
      routingNumberLast4: data.routing_number_last4,
      accountType: data.account_type as 'checking' | 'savings',
      isVerified: data.is_verified,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}

// ============ PAYOUT CRUD OPERATIONS ============

/**
 * Get all payouts for a provider
 */
export async function getProviderPayouts(providerId: string): Promise<ProviderPayout[]> {
  const { data, error } = await supabase
    .from('provider_payouts')
    .select('*')
    .eq('provider_id', providerId)
    .order('requested_at', { ascending: false });

  if (error) throw error;

  return data.map((payout) => ({
    id: payout.id,
    providerId: payout.provider_id,
    amount: parseFloat(payout.amount),
    status: payout.status as ProviderPayout['status'],
    requestedAt: new Date(payout.requested_at),
    processedAt: payout.processed_at ? new Date(payout.processed_at) : undefined,
    notes: payout.notes,
    rejectionReason: payout.rejection_reason,
    paymentMethod: payout.payment_method,
    createdAt: new Date(payout.created_at),
    updatedAt: new Date(payout.updated_at),
  }));
}

/**
 * Get a single payout
 */
export async function getPayout(id: string): Promise<ProviderPayout> {
  const { data, error } = await supabase
    .from('provider_payouts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  return {
    id: data.id,
    providerId: data.provider_id,
    amount: parseFloat(data.amount),
    status: data.status as ProviderPayout['status'],
    requestedAt: new Date(data.requested_at),
    processedAt: data.processed_at ? new Date(data.processed_at) : undefined,
    notes: data.notes,
    rejectionReason: data.rejection_reason,
    paymentMethod: data.payment_method,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * Create a payout request
 */
export async function createPayoutRequest(input: CreatePayoutInput): Promise<ProviderPayout> {
  const { data, error } = await supabase
    .from('provider_payouts')
    .insert({
      provider_id: input.providerId,
      amount: input.amount,
      status: 'pending',
      notes: input.notes,
      payment_method: 'bank_transfer',
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    providerId: data.provider_id,
    amount: parseFloat(data.amount),
    status: data.status as ProviderPayout['status'],
    requestedAt: new Date(data.requested_at),
    processedAt: data.processed_at ? new Date(data.processed_at) : undefined,
    notes: data.notes,
    rejectionReason: data.rejection_reason,
    paymentMethod: data.payment_method,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * Cancel a pending payout request
 */
export async function cancelPayoutRequest(id: string): Promise<ProviderPayout> {
  const { data, error } = await supabase
    .from('provider_payouts')
    .update({
      status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .eq('status', 'pending') // Can only cancel pending requests
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    providerId: data.provider_id,
    amount: parseFloat(data.amount),
    status: data.status as ProviderPayout['status'],
    requestedAt: new Date(data.requested_at),
    processedAt: data.processed_at ? new Date(data.processed_at) : undefined,
    notes: data.notes,
    rejectionReason: data.rejection_reason,
    paymentMethod: data.payment_method,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}
