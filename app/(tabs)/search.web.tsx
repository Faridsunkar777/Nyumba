import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { EmptyState } from '@/src/components/EmptyState';
import { useApp } from '@/src/context/AppContext';
import { getAgencies } from '@/src/data/repositories/agencies';
import { getEstatesForCounty } from '@/src/data/repositories/locations';
import { getProperties } from '@/src/data/repositories/properties';
import { Agency, Property, PropertyType, TransactionType } from '@/src/data/types';
import { colors, radius, shadows, spacing, typography } from '@/src/theme';
import { WebAgencyCard } from '@/src/web/WebAgencyCard';
import { WebFooter } from '@/src/web/WebFooter';
import { WebPropertyCard } from '@/src/web/WebPropertyCard';

type Mode = 'homes' | 'agencies';

const types: { label: string; value: PropertyType | 'all' }[] = [
  { label: 'Any type', value: 'all' },
  { label: 'Apartment', value: 'apartment' },
  { label: 'House', value: 'house' },
  { label: 'Bedsitter', value: 'bedsitter' },
  { label: 'Studio', value: 'studio' },
  { label: 'Land', value: 'land' },
];

export default function WebSearchPage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { county, filters, setFilters, updateFilters, resetFilters } = useApp();

  const [mode, setMode] = useState<Mode>('homes');
  const [query, setQuery] = useState(filters.query ?? '');
  const [properties, setProperties] = useState<Property[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);

  const cols = width >= 1100 ? 3 : width >= 720 ? 2 : 1;
  const estates = useMemo(() => getEstatesForCounty(county), [county]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (mode === 'homes') {
        setProperties(
          await getProperties({
            ...filters,
            query,
            county,
          })
        );
      } else {
        setAgencies(await getAgencies({ query, county }));
      }
    } finally {
      setLoading(false);
    }
  }, [mode, filters, query, county]);

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  const setTx = (t: TransactionType | 'all') => updateFilters({ transactionType: t });
  const setType = (t: PropertyType | 'all') => updateFilters({ propertyType: t });

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Search {mode === 'homes' ? 'homes' : 'agencies'}</Text>
        <Text style={styles.sub}>
          Showing results in <Text style={styles.em}>{county}</Text>
        </Text>
      </View>

      <View style={styles.layout}>
        {/* Sidebar filters */}
        <View style={styles.sidebar}>
          <Text style={styles.sideTitle}>Filters</Text>

          <View style={styles.modeToggle}>
            <Pressable
              style={[styles.modeBtn, mode === 'homes' && styles.modeBtnOn]}
              onPress={() => setMode('homes')}
            >
              <Text style={[styles.modeText, mode === 'homes' && styles.modeTextOn]}>Homes</Text>
            </Pressable>
            <Pressable
              style={[styles.modeBtn, mode === 'agencies' && styles.modeBtnOn]}
              onPress={() => setMode('agencies')}
            >
              <Text style={[styles.modeText, mode === 'agencies' && styles.modeTextOn]}>
                Agencies
              </Text>
            </Pressable>
          </View>

          <Text style={styles.label}>Search</Text>
          <View style={styles.inputWrap}>
            <Ionicons name="search" size={16} color={colors.textMuted} />
            <TextInput
              style={styles.input}
              placeholder="Keywords…"
              placeholderTextColor={colors.textMuted}
              value={query}
              onChangeText={setQuery}
            />
          </View>

          {mode === 'homes' && (
            <>
              <Text style={styles.label}>Transaction</Text>
              <View style={styles.pills}>
                {(['all', 'rent', 'sale'] as const).map((t) => (
                  <Pill
                    key={t}
                    label={t === 'all' ? 'Any' : t === 'rent' ? 'Rent' : 'Sale'}
                    active={(filters.transactionType ?? 'all') === t}
                    onPress={() => setTx(t)}
                  />
                ))}
              </View>

              <Text style={styles.label}>Property type</Text>
              <View style={styles.pills}>
                {types.map((t) => (
                  <Pill
                    key={t.value}
                    label={t.label}
                    active={(filters.propertyType ?? 'all') === t.value}
                    onPress={() => setType(t.value)}
                  />
                ))}
              </View>

              <Text style={styles.label}>Estate</Text>
              <View style={styles.pills}>
                <Pill
                  label="Any"
                  active={!filters.estate}
                  onPress={() => updateFilters({ estate: undefined })}
                />
                {estates.map((e) => (
                  <Pill
                    key={e}
                    label={e}
                    active={filters.estate === e}
                    onPress={() => updateFilters({ estate: e })}
                  />
                ))}
              </View>

              <Text style={styles.label}>Min bedrooms</Text>
              <View style={styles.pills}>
                {[0, 1, 2, 3, 4].map((n) => (
                  <Pill
                    key={n}
                    label={n === 0 ? 'Any' : `${n}+`}
                    active={(filters.bedrooms ?? 0) === n}
                    onPress={() => updateFilters({ bedrooms: n || undefined })}
                  />
                ))}
              </View>
            </>
          )}

          <Pressable
            style={styles.clear}
            onPress={() => {
              resetFilters();
              setQuery('');
            }}
          >
            <Text style={styles.clearText}>Clear filters</Text>
          </Pressable>
        </View>

        {/* Results */}
        <View style={styles.results}>
          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
          ) : mode === 'homes' ? (
            properties.length === 0 ? (
              <EmptyState
                title="No homes match"
                subtitle="Try another county, budget, or property type."
              />
            ) : (
              <>
                <Text style={styles.count}>{properties.length} homes found</Text>
                <View style={styles.grid}>
                  {properties.map((p) => (
                    <View key={p.id} style={{ width: gridW(width, cols) }}>
                      <WebPropertyCard
                        property={p}
                        onPress={() => router.push(`/property/${p.id}` as any)}
                      />
                    </View>
                  ))}
                </View>
              </>
            )
          ) : agencies.length === 0 ? (
            <EmptyState title="No agencies found" subtitle="Try another search or county." />
          ) : (
            <>
              <Text style={styles.count}>{agencies.length} agencies found</Text>
              <View style={styles.grid}>
                {agencies.map((a) => (
                  <View key={a.id} style={{ width: gridW(width, cols) }}>
                    <WebAgencyCard
                      agency={a}
                      onPress={() => router.push(`/agency/${a.id}` as any)}
                    />
                  </View>
                ))}
              </View>
            </>
          )}
        </View>
      </View>
      <WebFooter />
    </ScrollView>
  );
}

function gridW(screenW: number, cols: number) {
  // sidebar ~280 + gaps
  const content = Math.min(screenW, 1200) - 48 - (screenW >= 900 ? 300 : 0);
  const gap = 20;
  return Math.max(240, (content - gap * (cols - 1)) / cols);
}

function Pill({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.pill, active && styles.pillOn]} onPress={onPress}>
      <Text style={[styles.pillText, active && styles.pillTextOn]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, width: '100%', backgroundColor: colors.background },
  content: { flexGrow: 1, paddingBottom: 0 },
  header: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.lg,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.8,
  },
  sub: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 6,
  },
  em: { fontWeight: '700', color: colors.primary },
  layout: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xl,
    alignItems: 'flex-start',
  },
  sidebar: {
    width: 280,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  sideTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.md,
  },
  modeToggle: {
    flexDirection: 'row',
    backgroundColor: colors.chip,
    borderRadius: radius.full,
    padding: 4,
    marginBottom: spacing.lg,
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: radius.full,
    alignItems: 'center',
  },
  modeBtnOn: { backgroundColor: colors.surface, ...shadows.soft },
  modeText: { ...typography.captionBold, color: colors.textMuted },
  modeTextOn: { color: colors.primary },
  label: {
    ...typography.label,
    color: colors.textMuted,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    // @ts-expect-error web
    outlineStyle: 'none',
  } as any,
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.chip,
  },
  pillOn: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  pillText: { ...typography.captionBold, color: colors.textSecondary },
  pillTextOn: { color: colors.primary },
  clear: { marginTop: spacing.xl, alignItems: 'center', padding: spacing.sm },
  clearText: { ...typography.bodyBold, color: colors.error },
  results: { flex: 1, minWidth: 280 },
  count: {
    ...typography.captionBold,
    color: colors.textMuted,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
});
