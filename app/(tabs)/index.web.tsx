import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
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

import { useApp } from '@/src/context/AppContext';
import { getAgencies, getFeaturedAgencies } from '@/src/data/repositories/agencies';
import { getFeaturedProperties, getProperties } from '@/src/data/repositories/properties';
import { Agency, Property, PropertyType, TransactionType } from '@/src/data/types';
import { colors, radius, shadows, spacing, typography } from '@/src/theme';
import { WebAgencyCard } from '@/src/web/WebAgencyCard';
import { WebFooter } from '@/src/web/WebFooter';
import { WebPropertyCard } from '@/src/web/WebPropertyCard';

const HERO_IMG =
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1600&h=900&fit=crop';

const chips: { label: string; transactionType?: TransactionType; propertyType?: PropertyType }[] = [
  { label: 'For Rent', transactionType: 'rent' },
  { label: 'For Sale', transactionType: 'sale' },
  { label: 'Apartments', propertyType: 'apartment' },
  { label: 'Houses', propertyType: 'house' },
  { label: 'Bedsitters', propertyType: 'bedsitter' },
  { label: 'Land', propertyType: 'land' },
];

export default function WebHomePage() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { county, setFilters } = useApp();
  const [query, setQuery] = useState('');
  const [featuredAgencies, setFeaturedAgencies] = useState<Agency[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [recentProperties, setRecentProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const cols = width >= 1100 ? 3 : width >= 720 ? 2 : 1;

  const load = useCallback(async () => {
    const [fa, all, fp, recent] = await Promise.all([
      getFeaturedAgencies(county),
      getAgencies({ county }),
      getFeaturedProperties(county),
      getProperties({ county }),
    ]);
    setFeaturedAgencies(fa);
    setAgencies(all);
    setFeaturedProperties(fp);
    setRecentProperties(recent.slice(0, 6));
  }, [county]);

  useEffect(() => {
    setLoading(true);
    load().finally(() => setLoading(false));
  }, [load]);

  const goSearch = (extra?: { transactionType?: TransactionType; propertyType?: PropertyType }) => {
    setFilters({
      transactionType: extra?.transactionType ?? 'all',
      propertyType: extra?.propertyType ?? 'all',
      query: query.trim() || undefined,
    });
    router.push('/search' as any);
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.pageContent}>
      {/* HERO */}
      <View style={styles.hero}>
        <Image source={{ uri: HERO_IMG }} style={styles.heroBg} contentFit="cover" />
        <LinearGradient
          colors={['rgba(10,47,36,0.75)', 'rgba(10,47,36,0.55)', 'rgba(10,47,36,0.85)']}
          style={styles.heroBg}
        />
        <View style={styles.heroInner}>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeText}>Kenya’s agency-first house hunt</Text>
          </View>
          <Text style={styles.heroTitle}>Find your next home{'\n'}with agencies you trust</Text>
          <Text style={styles.heroSub}>
            Browse real estate companies like storefronts — rentals, sales, and land across{' '}
            {county} and beyond. Call or WhatsApp in one click.
          </Text>

          <View style={styles.searchCard}>
            <View style={styles.searchRow}>
              <Ionicons name="search" size={20} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search estates, neighbourhoods, or keywords…"
                placeholderTextColor={colors.textMuted}
                value={query}
                onChangeText={setQuery}
                onSubmitEditing={() => goSearch()}
              />
              <Pressable style={styles.searchBtn} onPress={() => goSearch()}>
                <Text style={styles.searchBtnText}>Search</Text>
              </Pressable>
            </View>
            <View style={styles.chipRow}>
              {chips.map((c) => (
                <Pressable
                  key={c.label}
                  style={styles.chip}
                  onPress={() =>
                    goSearch({
                      transactionType: c.transactionType,
                      propertyType: c.propertyType,
                    })
                  }
                >
                  <Text style={styles.chipText}>{c.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.statsRow}>
            <Stat value={`${agencies.length}+`} label="Agencies" />
            <Stat value={`${recentProperties.length}+`} label="Listings near you" />
            <Stat value="KES" label="Local pricing" />
            <Stat value="24/7" label="Browse anytime" />
          </View>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginVertical: 60 }} color={colors.primary} size="large" />
      ) : (
        <>
          <Section
            title="Featured agencies"
            subtitle={`Top-rated partners serving ${county}`}
            action="View all"
            onAction={() => router.push('/search' as any)}
          >
            <View style={[styles.grid, { gap: 20 }]}>
              {featuredAgencies.slice(0, cols * 2).map((a) => (
                <View key={a.id} style={{ width: gridWidth(width, cols), maxWidth: '100%' }}>
                  <WebAgencyCard
                    agency={a}
                    onPress={() => router.push(`/agency/${a.id}` as any)}
                  />
                </View>
              ))}
            </View>
          </Section>

          <Section
            title="Homes you’ll love"
            subtitle="Hand-picked featured listings"
            action="See all homes"
            onAction={() => goSearch()}
          >
            <View style={styles.grid}>
              {featuredProperties.slice(0, cols * 2).map((p) => (
                <View key={p.id} style={{ width: gridWidth(width, cols) }}>
                  <WebPropertyCard
                    property={p}
                    onPress={() => router.push(`/property/${p.id}` as any)}
                  />
                </View>
              ))}
            </View>
          </Section>

          {/* How it works */}
          <View style={styles.howBand}>
            <Text style={styles.howTitle}>How Nyumba works</Text>
            <View style={styles.howGrid}>
              <HowCard
                step="01"
                title="Discover agencies"
                body="Browse verified real estate companies by county — like picking a trusted shop."
                icon="business"
              />
              <HowCard
                step="02"
                title="Filter your home"
                body="Rent or buy, set budget in KES, beds, estates from Westlands to Nyali."
                icon="options"
              />
              <HowCard
                step="03"
                title="Contact instantly"
                body="Call or WhatsApp the agency, save favourites, and request a viewing."
                icon="chatbubbles"
              />
            </View>
          </View>

          <Section
            title={`Agencies in ${county}`}
            subtitle="Open a storefront to see their full catalogue"
          >
            <View style={styles.grid}>
              {agencies.map((a) => (
                <View key={a.id} style={{ width: gridWidth(width, cols) }}>
                  <WebAgencyCard
                    agency={a}
                    onPress={() => router.push(`/agency/${a.id}` as any)}
                  />
                </View>
              ))}
            </View>
          </Section>

          {/* CTA band */}
          <View style={styles.ctaBand}>
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ctaGradient}
            >
              <Text style={styles.ctaTitle}>Ready to find your dream home?</Text>
              <Text style={styles.ctaSub}>
                Create a free account to sync saved homes across phone and web.
              </Text>
              <View style={styles.ctaRow}>
                <Pressable style={styles.ctaPrimary} onPress={() => router.push('/signup' as any)}>
                  <Text style={styles.ctaPrimaryText}>Get started free</Text>
                </Pressable>
                <Pressable style={styles.ctaGhost} onPress={() => goSearch()}>
                  <Text style={styles.ctaGhostText}>Browse homes</Text>
                </Pressable>
              </View>
            </LinearGradient>
          </View>
        </>
      )}
      <WebFooter />
    </ScrollView>
  );
}

function gridWidth(screenW: number, cols: number) {
  const pad = 48;
  const gap = 20;
  const max = Math.min(screenW, 1200) - pad;
  return (max - gap * (cols - 1)) / cols;
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Section({
  title,
  subtitle,
  action,
  onAction,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHead}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {subtitle ? <Text style={styles.sectionSub}>{subtitle}</Text> : null}
        </View>
        {action && onAction ? (
          <Pressable onPress={onAction}>
            <Text style={styles.sectionAction}>{action} →</Text>
          </Pressable>
        ) : null}
      </View>
      {children}
    </View>
  );
}

function HowCard({
  step,
  title,
  body,
  icon,
}: {
  step: string;
  title: string;
  body: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <View style={styles.howCard}>
      <Text style={styles.howStep}>{step}</Text>
      <View style={styles.howIcon}>
        <Ionicons name={icon} size={22} color={colors.primary} />
      </View>
      <Text style={styles.howCardTitle}>{title}</Text>
      <Text style={styles.howCardBody}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    width: '100%',
    backgroundColor: colors.background,
  },
  pageContent: {
    flexGrow: 1,
  },
  hero: {
    minHeight: 560,
    justifyContent: 'center',
    paddingVertical: 64,
    overflow: 'hidden',
    position: 'relative',
  },
  heroBg: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  heroInner: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: radius.full,
    marginBottom: spacing.lg,
  },
  heroBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -1.2,
    lineHeight: 54,
    marginBottom: spacing.md,
  },
  heroSub: {
    fontSize: 18,
    lineHeight: 28,
    color: 'rgba(255,255,255,0.85)',
    maxWidth: 560,
    marginBottom: spacing.xxl,
  },
  searchCard: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.lg,
    maxWidth: 720,
    ...shadows.card,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: radius.full,
    paddingLeft: spacing.lg,
    paddingRight: 6,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    // @ts-expect-error web
    outlineStyle: 'none',
    paddingVertical: 10,
  } as any,
  searchBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: radius.full,
  },
  searchBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: spacing.md,
  },
  chip: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
  },
  chipText: {
    ...typography.captionBold,
    color: colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xxl,
    marginTop: spacing.xxxl,
  },
  stat: {
    minWidth: 100,
  },
  statValue: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  statLabel: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  section: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxxl,
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
    gap: spacing.lg,
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    letterSpacing: -0.6,
  },
  sectionSub: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: 4,
  },
  sectionAction: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  howBand: {
    backgroundColor: colors.primarySoft,
    paddingVertical: spacing.xxxl + 8,
    paddingHorizontal: spacing.xl,
  },
  howTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xxl,
    letterSpacing: -0.5,
  },
  howGrid: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'center',
  },
  howCard: {
    flex: 1,
    minWidth: 240,
    maxWidth: 360,
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
  },
  howStep: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  howIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  howCardTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  howCardBody: {
    ...typography.body,
    color: colors.textSecondary,
  },
  ctaBand: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
  },
  ctaGradient: {
    borderRadius: 28,
    padding: spacing.xxxl,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  ctaSub: {
    ...typography.body,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    maxWidth: 420,
    marginBottom: spacing.xl,
  },
  ctaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    justifyContent: 'center',
  },
  ctaPrimary: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: radius.full,
  },
  ctaPrimaryText: {
    ...typography.bodyBold,
    color: colors.primary,
  },
  ctaGhost: {
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.6)',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: radius.full,
  },
  ctaGhostText: {
    ...typography.bodyBold,
    color: '#fff',
  },
});
