import { agencies as mockAgencies } from '../mock/agencies';
import { properties as mockProperties } from '../mock/properties';
import { Agency, AgencyFilters } from '../types';

function withListingCounts(list: Agency[]): Agency[] {
  return list.map((agency) => ({
    ...agency,
    listingCount: mockProperties.filter(
      (p) => p.agencyId === agency.id && p.status === 'active'
    ).length,
  }));
}

const delay = (ms = 180) => new Promise((resolve) => setTimeout(resolve, ms));

export async function getAgencies(filters: AgencyFilters = {}): Promise<Agency[]> {
  await delay();
  let result = withListingCounts(mockAgencies);

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

export async function getAgencyById(id: string): Promise<Agency | null> {
  await delay(120);
  const agency = mockAgencies.find((a) => a.id === id);
  if (!agency) return null;
  return withListingCounts([agency])[0];
}

export async function getFeaturedAgencies(county?: string): Promise<Agency[]> {
  return getAgencies({ featuredOnly: true, county });
}
