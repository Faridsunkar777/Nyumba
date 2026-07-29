import { getSupabase, isSupabaseConfigured } from '@/src/lib/supabase';

import { mapAgency } from '../mappers';
import { agencies as mockAgencies } from '../mock/agencies';
import { properties as mockProperties } from '../mock/properties';
import { Agency, AgencyFilters } from '../types';

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

function withListingCounts(list: Agency[]): Agency[] {
  return list.map((agency) => ({
    ...agency,
    listingCount: mockProperties.filter(
      (p) => p.agencyId === agency.id && p.status === 'active'
    ).length,
  }));
}

function filterMock(list: Agency[], filters: AgencyFilters): Agency[] {
  let result = withListingCounts(list);
  if (filters.county) {
    result = result.filter((a) => a.counties.includes(filters.county!));
  }
  if (filters.verifiedOnly) {
    result = result.filter((a) => a.verified);
  }
  if (filters.featuredOnly) {
    result = result.filter((a) => a.featured);
  }
  if (filters.query?.trim()) {
    const q = filters.query.trim().toLowerCase();
    result = result.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.bio.toLowerCase().includes(q) ||
        a.counties.some((c) => c.toLowerCase().includes(q))
    );
  }
  return result.sort((a, b) => b.rating - a.rating);
}

async function getAgenciesFromSupabase(filters: AgencyFilters): Promise<Agency[] | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  let query = supabase.from('agencies').select('*');
  if (filters.featuredOnly) query = query.eq('featured', true);
  if (filters.verifiedOnly) query = query.eq('verified', true);
  if (filters.county) query = query.contains('counties', [filters.county]);
  if (filters.query?.trim()) {
    query = query.or(
      `name.ilike.%${filters.query.trim()}%,bio.ilike.%${filters.query.trim()}%`
    );
  }

  const { data, error } = await query.order('rating', { ascending: false });
  if (error || !data) {
    console.warn('[nyumba] agencies supabase fallback:', error?.message);
    return null;
  }

  // listing counts
  const { data: props } = await supabase
    .from('properties')
    .select('agency_id')
    .eq('status', 'active');

  const counts = new Map<string, number>();
  (props ?? []).forEach((p: { agency_id: string }) => {
    counts.set(p.agency_id, (counts.get(p.agency_id) ?? 0) + 1);
  });

  return data.map((row) =>
    mapAgency({ ...row, listing_count: counts.get(row.id) ?? 0 })
  );
}

export async function getAgencies(filters: AgencyFilters = {}): Promise<Agency[]> {
  if (isSupabaseConfigured) {
    const remote = await getAgenciesFromSupabase(filters);
    if (remote) return remote;
  }
  await delay();
  return filterMock(mockAgencies, filters);
}

export async function getAgencyById(id: string): Promise<Agency | null> {
  if (isSupabaseConfigured) {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase.from('agencies').select('*').eq('id', id).maybeSingle();
      if (!error && data) {
        const { count } = await supabase
          .from('properties')
          .select('*', { count: 'exact', head: true })
          .eq('agency_id', id)
          .eq('status', 'active');
        return mapAgency({ ...data, listing_count: count ?? 0 });
      }
    }
  }
  await delay(80);
  const agency = mockAgencies.find((a) => a.id === id);
  if (!agency) return null;
  return withListingCounts([agency])[0];
}

export async function getFeaturedAgencies(county?: string): Promise<Agency[]> {
  return getAgencies({ featuredOnly: true, county });
}
