import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { getDefaultCountyName } from '@/src/data/repositories/locations';
import { PropertyFilters } from '@/src/data/types';

const KEYS = {
  county: '@nyumba/county',
  favorites: '@nyumba/favorites',
  onboarding: '@nyumba/onboarding_done',
};

type AppContextValue = {
  county: string;
  setCounty: (county: string) => void;
  favoriteIds: string[];
  isFavorite: (propertyId: string) => boolean;
  toggleFavorite: (propertyId: string) => void;
  filters: PropertyFilters;
  setFilters: (filters: PropertyFilters) => void;
  updateFilters: (partial: Partial<PropertyFilters>) => void;
  resetFilters: () => void;
  onboardingDone: boolean;
  completeOnboarding: () => void;
  hydrated: boolean;
};

const defaultFilters: PropertyFilters = {
  transactionType: 'all',
  propertyType: 'all',
};

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [county, setCountyState] = useState(getDefaultCountyName());
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [filters, setFilters] = useState<PropertyFilters>(defaultFilters);
  const [onboardingDone, setOnboardingDone] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [storedCounty, storedFavs, storedOnboarding] = await Promise.all([
          AsyncStorage.getItem(KEYS.county),
          AsyncStorage.getItem(KEYS.favorites),
          AsyncStorage.getItem(KEYS.onboarding),
        ]);
        if (storedCounty) setCountyState(storedCounty);
        if (storedFavs) setFavoriteIds(JSON.parse(storedFavs));
        if (storedOnboarding === null) setOnboardingDone(false);
        else setOnboardingDone(storedOnboarding === '1');
      } catch {
        // ignore storage errors in prototype
      } finally {
        setHydrated(true);
      }
    })();
  }, []);

  const setCounty = useCallback((value: string) => {
    setCountyState(value);
    AsyncStorage.setItem(KEYS.county, value).catch(() => {});
  }, []);

  const toggleFavorite = useCallback((propertyId: string) => {
    setFavoriteIds((prev) => {
      const next = prev.includes(propertyId)
        ? prev.filter((id) => id !== propertyId)
        : [...prev, propertyId];
      AsyncStorage.setItem(KEYS.favorites, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (propertyId: string) => favoriteIds.includes(propertyId),
    [favoriteIds]
  );

  const updateFilters = useCallback((partial: Partial<PropertyFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);

  const completeOnboarding = useCallback(() => {
    setOnboardingDone(true);
    AsyncStorage.setItem(KEYS.onboarding, '1').catch(() => {});
  }, []);

  const value = useMemo(
    () => ({
      county,
      setCounty,
      favoriteIds,
      isFavorite,
      toggleFavorite,
      filters,
      setFilters,
      updateFilters,
      resetFilters,
      onboardingDone,
      completeOnboarding,
      hydrated,
    }),
    [
      county,
      setCounty,
      favoriteIds,
      isFavorite,
      toggleFavorite,
      filters,
      updateFilters,
      resetFilters,
      onboardingDone,
      completeOnboarding,
      hydrated,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
