import { useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useApp } from '@/src/context/AppContext';
import { colors, radius, shadows, spacing, typography } from '@/src/theme';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { county, favoriteIds, user, logout } = useApp();

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'YK';

  const confirmLogout = () => {
    Alert.alert('Log out?', 'You can sign back in anytime.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/(auth)');
        },
      },
    ]);
  };

  const resetDemo = () => {
    Alert.alert('Reset demo data?', 'This clears favorites, county, and onboarding.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove([
            '@nyumba/county',
            '@nyumba/favorites',
            '@nyumba/onboarding_done',
          ]);
          Alert.alert('Done', 'Reload the app to see onboarding again.');
        },
      },
    ]);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Profile</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{user?.name ?? 'You (Guest)'}</Text>
          <Text style={styles.meta}>{user?.email ?? 'House hunter in Kenya'}</Text>
        </View>
      </View>

      <Text style={styles.section}>Preferences</Text>
      <Pressable style={styles.row} onPress={() => router.push('/county-picker')}>
        <Ionicons name="location-outline" size={22} color={colors.primary} />
        <View style={styles.rowBody}>
          <Text style={styles.rowTitle}>Preferred county</Text>
          <Text style={styles.rowValue}>{county}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </Pressable>
      <View style={styles.row}>
        <Ionicons name="cash-outline" size={22} color={colors.primary} />
        <View style={styles.rowBody}>
          <Text style={styles.rowTitle}>Currency</Text>
          <Text style={styles.rowValue}>KES (Kenyan Shilling)</Text>
        </View>
      </View>
      <View style={styles.row}>
        <Ionicons name="heart-outline" size={22} color={colors.primary} />
        <View style={styles.rowBody}>
          <Text style={styles.rowTitle}>Saved homes</Text>
          <Text style={styles.rowValue}>{favoriteIds.length}</Text>
        </View>
      </View>

      <Text style={styles.section}>About</Text>
      <View style={styles.about}>
        <Text style={styles.aboutTitle}>Nyumba</Text>
        <Text style={styles.aboutBody}>
          Prototype house-hunting app for Kenya. Browse real estate agencies like
          restaurants on Uber Eats, explore their listings, and contact them on WhatsApp
          or call.
        </Text>
        <Text style={styles.disclaimer}>
          Demo data only — not a live marketplace. Built for agency demos.
        </Text>
      </View>

      <Pressable style={styles.reset} onPress={resetDemo}>
        <Text style={styles.resetText}>Reset demo data</Text>
      </Pressable>

      {user && (
        <Pressable style={styles.reset} onPress={confirmLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  header: {
    paddingTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.hero,
    color: colors.text,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    ...shadows.soft,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.subtitle,
    color: colors.textInverse,
  },
  name: {
    ...typography.subtitle,
    color: colors.text,
  },
  meta: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  section: {
    ...typography.label,
    color: colors.textMuted,
    marginTop: spacing.xxl,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.sm,
  },
  rowBody: {
    flex: 1,
  },
  rowTitle: {
    ...typography.bodyBold,
    color: colors.text,
  },
  rowValue: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  about: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  aboutTitle: {
    ...typography.subtitle,
    color: colors.primary,
  },
  aboutBody: {
    ...typography.body,
    color: colors.textSecondary,
  },
  disclaimer: {
    ...typography.caption,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  reset: {
    marginTop: spacing.xxl,
    alignItems: 'center',
    padding: spacing.lg,
  },
  resetText: {
    ...typography.bodyBold,
    color: colors.error,
  },
  logoutText: {
    ...typography.bodyBold,
    color: colors.textSecondary,
  },
});
