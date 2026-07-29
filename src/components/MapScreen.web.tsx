import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { EmptyState } from '@/src/components/EmptyState';
import { useApp } from '@/src/context/AppContext';
import { getProperties } from '@/src/data/repositories/properties';
import { Property } from '@/src/data/types';
import { colors, radius, shadows, spacing, typography } from '@/src/theme';
import { formatKes } from '@/src/utils/format';
import { WebFooter } from '@/src/web/WebFooter';

/** Web map tab: list + coordinates (no react-native-maps). */
export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { county } = useApp();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await getProperties({ county });
      setProperties(list.filter((p) => p.lat && p.lng));
    } finally {
      setLoading(false);
    }
  }, [county]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <FlatList
      style={styles.screen}
      data={loading ? [] : properties}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.list}
      ListHeaderComponent={
        <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
          <Text style={styles.title}>Map</Text>
          <Text style={styles.subtitle}>
            {properties.length} homes in {county} · open a listing for location details
          </Text>
          <View style={styles.webNote}>
            <Ionicons name="globe-outline" size={16} color={colors.primary} />
            <Text style={styles.webNoteText}>
              Interactive map pins work best in the iOS/Android app. Browse locations below on
              web.
            </Text>
          </View>
          {loading ? (
            <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
          ) : null}
        </View>
      }
      ListEmptyComponent={
        loading ? null : (
          <EmptyState title="No mapped homes" subtitle="Try another county." />
        )
      }
      ListFooterComponent={<WebFooter />}
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          onPress={() => router.push(`/property/${item.id}` as any)}
        >
          <Image source={{ uri: item.images[0] }} style={styles.image} contentFit="cover" />
          <View style={styles.body}>
            <Text style={styles.price}>
              {item.transactionType === 'rent'
                ? `${formatKes(item.priceKes)}/mo`
                : formatKes(item.priceKes)}
            </Text>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.loc} numberOfLines={1}>
              {item.estate}, {item.county} · {item.lat.toFixed(3)}, {item.lng.toFixed(3)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
  },
  title: {
    ...typography.hero,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 4,
  },
  webNote: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    marginTop: spacing.md,
    backgroundColor: colors.primarySoft,
    padding: spacing.md,
    borderRadius: radius.md,
  },
  webNoteText: {
    ...typography.caption,
    color: colors.primaryDark,
    flex: 1,
  },
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: 0,
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    ...shadows.soft,
  },
  image: {
    width: 88,
    height: 88,
    backgroundColor: colors.chip,
  },
  body: {
    flex: 1,
    padding: spacing.md,
    gap: 2,
  },
  price: {
    ...typography.price,
    color: colors.accent,
    fontSize: 15,
  },
  cardTitle: {
    ...typography.bodyBold,
    color: colors.text,
  },
  loc: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
