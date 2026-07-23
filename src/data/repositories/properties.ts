import { properties as mockProperties } from '../mock/properties';
import { Property, PropertyFilters } from '../types';

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getProperties(filters: PropertyFilters = {}): Promise<Property[]> {
  await delay();
  let result = mockProperties.filter((p) => p.status === 'active');

  if (filters.agencyId) {
    result = result.filter((p) => p.agencyId === filters.agencyId);
  }
  if (filters.county) {
    result = result.filter((p) => p.county === filters.county);
  }
  if (filters.estate) {
    result = result.filter((p) => p.estate === filters.estate);
  }
  if (filters.transactionType && filters.transactionType !== 'all') {
    result = result.filter((p) => p.transactionType === filters.transactionType);
  }
  if (filters.propertyType && filters.propertyType !== 'all') {
    result = result.filter((p) => p.propertyType === filters.propertyType);
  }
  if (filters.minPrice != null) {
    result = result.filter((p) => p.priceKes >= filters.minPrice!);
  }
  if (filters.maxPrice != null) {
    result = result.filter((p) => p.priceKes <= filters.maxPrice!);
  }
  if (filters.bedrooms != null && filters.bedrooms > 0) {
    result = result.filter((p) => p.bedrooms >= filters.bedrooms!);
  }
  if (filters.bathrooms != null && filters.bathrooms > 0) {
    result = result.filter((p) => p.bathrooms >= filters.bathrooms!);
  }
  if (filters.featuredOnly) {
    result = result.filter((p) => p.featured);
  }
  if (filters.amenities?.length) {
    result = result.filter((p) =>
      filters.amenities!.every((a) => p.amenities.includes(a))
    );
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

export async function getPropertyById(id: string): Promise<Property | null> {
  await delay(100);
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
