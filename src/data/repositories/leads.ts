import { getSupabase, isSupabaseConfigured } from '@/src/lib/supabase';

export type CreateLeadInput = {
  propertyId: string;
  agencyId: string;
  userId?: string | null;
  name?: string;
  phone?: string;
  message: string;
};

export async function createLead(input: CreateLeadInput): Promise<{ ok: boolean; error?: string }> {
  if (!isSupabaseConfigured) {
    // Prototype / offline: treat as success so UI can continue
    return { ok: true };
  }

  const supabase = getSupabase();
  if (!supabase) return { ok: false, error: 'Supabase not available' };

  const { error } = await supabase.from('leads').insert({
    property_id: input.propertyId,
    agency_id: input.agencyId,
    user_id: input.userId ?? null,
    name: input.name ?? null,
    phone: input.phone ?? null,
    message: input.message,
    status: 'new',
  });

  if (error) {
    console.warn('[nyumba] createLead:', error.message);
    return { ok: false, error: error.message };
  }
  return { ok: true };
}
