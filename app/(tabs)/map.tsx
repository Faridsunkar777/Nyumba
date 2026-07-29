import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

import { useApp } from '@/src/context/AppContext';
import { getCountyByName } from '@/src/data/repositories/locations';
import { getProperties } from '@/src/data/repositories/properties';
import { Property } from '@/src/data/types';
import { colors, radius, shadows, spacing, typography } from '@/src/theme';
import { formatKes } from '@/src/utils/format';

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { county } = useApp();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selected, setSelected] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [locating, setLocating] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(
    null
  );
  const [region, setRegion] = useState({
    latitude: -1.2921,
    longitude: 36.8219,
    latitudeDelta: 0.18,
    longitudeDelta: 0.18,
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [list, countyData] = await Promise.all([
        getProperties({ county }),
        getCountyByName(county),
      ]);
      setProperties(list.filter((p) => p.lat && p.lng));
      if (countyData) {
        setRegion({
          latitude: countyData.lat,
          longitude: countyData.lng,
          latitudeDelta: 0.22,
          longitudeDelta: 0.22,
        });
      }
      setSelected(null);
    } finally {
      setLoading(false);
    }
  }, [county]);

  useEffect(() => {
    load();
  }, [load]);

  const pins = useMemo(() => {
    if (!query.trim()) return properties;
    const q = query.trim().toLowerCase();
    return properties.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.estate.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q)
    );
  }, [properties, query]);

  const onSubmitSearch = () => {
    Keyboard.dismiss();
    if (pins.length > 0) {
      const first = pins[0];
      setSelected(first);
      setRegion({
        latitude: first.lat,
        longitude: first.lng,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  };

  const locateMe = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocating(false);
        return;
      }
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setUserLocation(coords);
      setRegion({
        ...coords,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      });
    } catch {
      // permission denied or location unavailable — silently ignore in this prototype
    } finally {
      setLocating(false);
    }
  };

  return (
    <View style={styles.screen}>
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <Text style={styles.title}>Map</Text>
        <Text style={styles.subtitle}>{pins.length} homes in {county}</Text>

        <View style={styles.searchRow}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search estates, areas, homes…"
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            onSubmitEditing={onSubmitSearch}
            clearButtonMode="while-editing"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.loader}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <MapView
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          region={region}
          onRegionChangeComplete={setRegion}
          showsUserLocation={!!userLocation}
        >
          {pins.map((p) => (
            <Marker
              key={p.id}
              coordinate={{ latitude: p.lat, longitude: p.lng }}
              pinColor={selected?.id === p.id ? colors.primary : colors.mapPin}
              onPress={() => setSelected(p)}
              title={formatKes(p.priceKes)}
            />
          ))}
        </MapView>
      )}

      <Pressable
        style={[
          styles.locateBtn,
          { bottom: (selected ? 190 : 24) + insets.bottom },
        ]}
        onPress={locateMe}
        disabled={locating}
      >
        {locating ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <Ionicons name="locate" size={22} color={colors.primary} />
        )}
      </Pressable>

      {selected && (
        <Pressable
          style={[styles.sheet, { bottom: insets.bottom + 90 }]}
          onPress={() => router.push(`/property/${selected.id}`)}
        >
          <Image
            source={{ uri: selected.images[0] }}
            style={styles.sheetImage}
            contentFit="cover"
          />
          <View style={styles.sheetBody}>
            <Text style={styles.sheetPrice}>
              {selected.transactionType === 'rent'
                ? `${formatKes(selected.priceKes)}/mo`
                : formatKes(selected.priceKes)}
            </Text>
            <Text style={styles.sheetTitle} numberOfLines={1}>
              {selected.title}
            </Text>
            <Text style={styles.sheetLoc} numberOfLines={1}>
              {selected.estate}, {selected.county}
            </Text>
          </View>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: 'rgba(247,248,246,0.92)',
  },
  title: {
    ...typography.hero,
    color: colors.text,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.text,
    padding: 0,
  },
  map: {
    flex: 1,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locateBtn: {
    position: 'absolute',
    right: spacing.lg,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.card,
  },
  sheet: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadows.card,
  },
  sheetImage: {
    width: 100,
    height: 96,
    backgroundColor: colors.chip,
  },
  sheetBody: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'center',
    gap: 2,
  },
  sheetPrice: {
    ...typography.price,
    color: colors.accent,
    fontSize: 16,
  },
  sheetTitle: {
    ...typography.bodyBold,
    color: colors.text,
  },
  sheetLoc: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
