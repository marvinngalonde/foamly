import { supabase } from '@/lib/supabase';

// ============ CUSTOMER NOTES TYPES ============

export interface CustomerNote {
  id: string;
  providerId: string;
  customerId: string;
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerNoteInput {
  providerId: string;
  customerId: string;
  note: string;
}

export interface UpdateCustomerNoteInput {
  note: string;
}

// ============ CUSTOMER PREFERENCES TYPES ============

export interface CustomerPreferences {
  id: string;
  providerId: string;
  customerId: string;
  isFavorite: boolean;
  isBlocked: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCustomerPreferencesInput {
  providerId: string;
  customerId: string;
  isFavorite?: boolean;
  isBlocked?: boolean;
  tags?: string[];
}

export interface UpdateCustomerPreferencesInput {
  isFavorite?: boolean;
  isBlocked?: boolean;
  tags?: string[];
}

// ============ CUSTOMER NOTES CRUD OPERATIONS ============

/**
 * Get all notes for a specific customer
 */
export async function getCustomerNotes(
  providerId: string,
  customerId: string
): Promise<CustomerNote[]> {
  const { data, error } = await supabase
    .from('provider_customer_notes')
    .select('*')
    .eq('provider_id', providerId)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return data.map((note) => ({
    id: note.id,
    providerId: note.provider_id,
    customerId: note.customer_id,
    note: note.note,
    createdAt: new Date(note.created_at),
    updatedAt: new Date(note.updated_at),
  }));
}

/**
 * Create a new customer note
 */
export async function createCustomerNote(
  input: CreateCustomerNoteInput
): Promise<CustomerNote> {
  const { data, error } = await supabase
    .from('provider_customer_notes')
    .insert({
      provider_id: input.providerId,
      customer_id: input.customerId,
      note: input.note,
    })
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    providerId: data.provider_id,
    customerId: data.customer_id,
    note: data.note,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * Update a customer note
 */
export async function updateCustomerNote(
  id: string,
  input: UpdateCustomerNoteInput
): Promise<CustomerNote> {
  const { data, error } = await supabase
    .from('provider_customer_notes')
    .update({
      note: input.note,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return {
    id: data.id,
    providerId: data.provider_id,
    customerId: data.customer_id,
    note: data.note,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * Delete a customer note
 */
export async function deleteCustomerNote(id: string): Promise<void> {
  const { error } = await supabase
    .from('provider_customer_notes')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// ============ CUSTOMER PREFERENCES CRUD OPERATIONS ============

/**
 * Get customer preferences
 */
export async function getCustomerPreferences(
  providerId: string,
  customerId: string
): Promise<CustomerPreferences | null> {
  const { data, error } = await supabase
    .from('provider_customer_preferences')
    .select('*')
    .eq('provider_id', providerId)
    .eq('customer_id', customerId)
    .single();

  if (error) {
    // If no preferences exist yet, return null instead of throwing
    if (error.code === 'PGRST116') return null;
    throw error;
  }

  return {
    id: data.id,
    providerId: data.provider_id,
    customerId: data.customer_id,
    isFavorite: data.is_favorite,
    isBlocked: data.is_blocked,
    tags: data.tags || [],
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * Get all favorite customers for a provider
 */
export async function getFavoriteCustomers(providerId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('provider_customer_preferences')
    .select('customer_id')
    .eq('provider_id', providerId)
    .eq('is_favorite', true);

  if (error) throw error;

  return data.map((pref) => pref.customer_id);
}

/**
 * Get all blocked customers for a provider
 */
export async function getBlockedCustomers(providerId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('provider_customer_preferences')
    .select('customer_id')
    .eq('provider_id', providerId)
    .eq('is_blocked', true);

  if (error) throw error;

  return data.map((pref) => pref.customer_id);
}

/**
 * Create or update customer preferences
 */
export async function upsertCustomerPreferences(
  input: CreateCustomerPreferencesInput
): Promise<CustomerPreferences> {
  // Check if preferences already exist
  const existing = await getCustomerPreferences(input.providerId, input.customerId);

  if (existing) {
    // Update existing
    const { data, error } = await supabase
      .from('provider_customer_preferences')
      .update({
        is_favorite: input.isFavorite ?? existing.isFavorite,
        is_blocked: input.isBlocked ?? existing.isBlocked,
        tags: input.tags ?? existing.tags,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      providerId: data.provider_id,
      customerId: data.customer_id,
      isFavorite: data.is_favorite,
      isBlocked: data.is_blocked,
      tags: data.tags || [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  } else {
    // Create new
    const { data, error } = await supabase
      .from('provider_customer_preferences')
      .insert({
        provider_id: input.providerId,
        customer_id: input.customerId,
        is_favorite: input.isFavorite || false,
        is_blocked: input.isBlocked || false,
        tags: input.tags || [],
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      providerId: data.provider_id,
      customerId: data.customer_id,
      isFavorite: data.is_favorite,
      isBlocked: data.is_blocked,
      tags: data.tags || [],
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };
  }
}

/**
 * Toggle favorite status
 */
export async function toggleCustomerFavorite(
  providerId: string,
  customerId: string
): Promise<CustomerPreferences> {
  const existing = await getCustomerPreferences(providerId, customerId);
  const newFavoriteStatus = existing ? !existing.isFavorite : true;

  return upsertCustomerPreferences({
    providerId,
    customerId,
    isFavorite: newFavoriteStatus,
    isBlocked: existing?.isBlocked || false,
    tags: existing?.tags || [],
  });
}

/**
 * Toggle blocked status
 */
export async function toggleCustomerBlocked(
  providerId: string,
  customerId: string
): Promise<CustomerPreferences> {
  const existing = await getCustomerPreferences(providerId, customerId);
  const newBlockedStatus = existing ? !existing.isBlocked : true;

  return upsertCustomerPreferences({
    providerId,
    customerId,
    isFavorite: existing?.isFavorite || false,
    isBlocked: newBlockedStatus,
    tags: existing?.tags || [],
  });
}

/**
 * Add a tag to customer
 */
export async function addCustomerTag(
  providerId: string,
  customerId: string,
  tag: string
): Promise<CustomerPreferences> {
  const existing = await getCustomerPreferences(providerId, customerId);
  const currentTags = existing?.tags || [];

  if (currentTags.includes(tag)) {
    // Tag already exists, return current preferences
    return existing!;
  }

  return upsertCustomerPreferences({
    providerId,
    customerId,
    isFavorite: existing?.isFavorite || false,
    isBlocked: existing?.isBlocked || false,
    tags: [...currentTags, tag],
  });
}

/**
 * Remove a tag from customer
 */
export async function removeCustomerTag(
  providerId: string,
  customerId: string,
  tag: string
): Promise<CustomerPreferences> {
  const existing = await getCustomerPreferences(providerId, customerId);

  if (!existing) {
    throw new Error('Customer preferences not found');
  }

  const updatedTags = existing.tags.filter((t) => t !== tag);

  return upsertCustomerPreferences({
    providerId,
    customerId,
    isFavorite: existing.isFavorite,
    isBlocked: existing.isBlocked,
    tags: updatedTags,
  });
}
