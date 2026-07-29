import { getSupabase, isSupabaseConfigured } from '@/src/lib/supabase';

import { mapProperty } from '../mappers';
import { properties as mockProperties } from '../mock/properties';
import { Property, PropertyFilters } from '../types';

const delay = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

function filterMock(list: Property[], filters: PropertyFilters): Property[] {
  let result = list.filter((p) => p.status === 'active');

  if (filters.agencyId) result = result.filter((p) => p.agencyId === filters.agencyId);
  if (filters.county) result = result.filter((p) => p.county === filters.county);
  if (filters.estate) result = result.filter((p) => p.estate === filters.estate);
  if (filters.transactionType && filters.transactionType !== 'all') {
    result = result.filter((p) => p.transactionType === filters.transactionType);
  }
  if (filters.propertyType && filters.propertyType !== 'all') {
    result = result.filter((p) => p.propertyType === filters.propertyType);
  }
  if (filters.minPrice != null) result = result.filter((p) => p.priceKes >= filters.minPrice!);
  if (filters.maxPrice != null) result = result.filter((p) => p.priceKes <= filters.maxPrice!);
  if (filters.bedrooms != null && filters.bedrooms > 0) {
    result = result.filter((p) => p.bedrooms >= filters.bedrooms!);
  }
  if (filters.bathrooms != null && filters.bathrooms > 0) {
    result = result.filter((p) => p.bathrooms >= filters.bathrooms!);
  }
  if (filters.featuredOnly) result = result.filter((p) => p.featured);
  if (filters.amenities?.length) {
    result = result.filter((p) => filters.amenities!.every((a) => p.amenities.includes(a)));
  }
  if (filters.query?.trim()) {
    const q = filters.query.trim().toLowerCase();
    result = result.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.estate.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q) ||
        p.county.toLowerCase().includes(q) ||
        p.propertyType.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  return result.sort((a, b) => Number(b.featured) - Number(a.featured));
}

async function getPropertiesFromSupabase(
  filters: PropertyFilters
): Promise<Property[] | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  let query = supabase.from('properties').select('*').eq('status', 'active');

  if (filters.agencyId) query = query.eq('agency_id', filters.agencyId);
  if (filters.county) query = query.eq('county', filters.county);
  if (filters.estate) query = query.eq('estate', filters.estate);
  if (filters.transactionType && filters.transactionType !== 'all') {
    query = query.eq('transaction_type', filters.transactionType);
  }
  if (filters.propertyType && filters.propertyType !== 'all') {
    query = query.eq('property_type', filters.propertyType);
  }
  if (filters.minPrice != null) query = query.gte('price_kes', filters.minPrice);
  if (filters.maxPrice != null) query = query.lte('price_kes', filters.maxPrice);
  if (filters.bedrooms != null && filters.bedrooms > 0) {
    query = query.gte('bedrooms', filters.bedrooms);
  }
  if (filters.bathrooms != null && filters.bathrooms > 0) {
    query = query.gte('bathrooms', filters.bathrooms);
  }
  if (filters.featuredOnly) query = query.eq('featured', true);
  if (filters.query?.trim()) {
    const q = filters.query.trim();
    query = query.or(
      `title.ilike.%${q}%,estate.ilike.%${q}%,city.ilike.%${q}%,county.ilike.%${q}%,description.ilike.%${q}%`
    );
  }

  const { data, error } = await query.order('featured', { ascending: false });
  if (error || !data) {
    console.warn('[nyumba] properties supabase fallback:', error?.message);
    return null;
  }

  let mapped = data.map(mapProperty);
  if (filters.amenities?.length) {
    mapped = mapped.filter((p) =>
      filters.amenities!.every((a) => p.amenities.includes(a))
    );
  }
  return mapped;
}

export async function getProperties(filters: PropertyFilters = {}): Promise<Property[]> {
  if (isSupabaseConfigured) {
    const remote = await getPropertiesFromSupabase(filters);
    if (remote) return remote;
  }
  await delay();
  return filterMock(mockProperties, filters);
}

export async function getPropertyById(id: string): Promise<Property | null> {
  if (isSupabaseConfigured) {
    const supabase = getSupabase();
    if (supabase) {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      if (!error && data) return mapProperty(data);
    }
  }
  await delay(80);
  return mockProperties.find((p) => p.id === id) ?? null;
}

export async function getFeaturedProperties(county?: string): Promise<Property[]> {
  return getProperties({ featuredOnly: true, county });
}

export async function getPropertiesByAgency(
  agencyId: string,
  filters: Omit<PropertyFilters, 'agencyId'> = {}
): Promise<Property[]> {
  return getProperties({ ...filters, agencyId });
}
