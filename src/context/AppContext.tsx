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
import { AuthUser, PropertyFilters } from '@/src/data/types';

const KEYS = {
  county: '@nyumba/county',
  favorites: '@nyumba/favorites',
  onboarding: '@nyumba/onboarding_done',
  user: '@nyumba/user',
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
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, _password: string) => Promise<{ ok: boolean; error?: string }>;
  signup: (name: string, email: string, _password: string, phone?: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
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
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const [storedCounty, storedFavs, storedOnboarding, storedUser] = await Promise.all([
          AsyncStorage.getItem(KEYS.county),
          AsyncStorage.getItem(KEYS.favorites),
          AsyncStorage.getItem(KEYS.onboarding),
          AsyncStorage.getItem(KEYS.user),
        ]);
        if (storedCounty) setCountyState(storedCounty);
        if (storedFavs) setFavoriteIds(JSON.parse(storedFavs));
        if (storedOnboarding === null) setOnboardingDone(false);
        else setOnboardingDone(storedOnboarding === '1');
        if (storedUser) setUser(JSON.parse(storedUser));
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

  // Prototype auth: validates shape only and "signs in" locally. Swap for a
  // real API (Supabase auth, etc.) when the backend is ready.
  const login = useCallback(async (email: string, _password: string) => {
    const trimmedEmail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      return { ok: false, error: 'Enter a valid email address.' };
    }
    if (!_password || _password.length < 4) {
      return { ok: false, error: 'Enter your password.' };
    }
    const nextUser: AuthUser = {
      id: `user-${trimmedEmail}`,
      name: trimmedEmail.split('@')[0],
      email: trimmedEmail,
    };
    setUser(nextUser);
    await AsyncStorage.setItem(KEYS.user, JSON.stringify(nextUser)).catch(() => {});
    return { ok: true };
  }, []);

  const signup = useCallback(
    async (name: string, email: string, _password: string, phone?: string) => {
      const trimmedName = name.trim();
      const trimmedEmail = email.trim().toLowerCase();
      if (trimmedName.length < 2) {
        return { ok: false, error: 'Enter your full name.' };
      }
      if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
        return { ok: false, error: 'Enter a valid email address.' };
      }
      if (!_password || _password.length < 4) {
        return { ok: false, error: 'Password must be at least 4 characters.' };
      }
      const nextUser: AuthUser = {
        id: `user-${trimmedEmail}`,
        name: trimmedName,
        email: trimmedEmail,
        phone: phone?.trim() || undefined,
      };
      setUser(nextUser);
      await AsyncStorage.setItem(KEYS.user, JSON.stringify(nextUser)).catch(() => {});
      return { ok: true };
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    AsyncStorage.removeItem(KEYS.user).catch(() => {});
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
      user,
      isAuthenticated: !!user,
      login,
      signup,
      logout,
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
      user,
      login,
      signup,
      logout,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
