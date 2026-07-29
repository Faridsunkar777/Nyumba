import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import Logo from '@/assets/images/Nyumba-Logo.png';
import { colors, spacing, typography } from '@/src/theme';

/** Site footer — place at the bottom of page scroll content (not fixed). */
export function WebFooter() {
  const router = useRouter();

  return (
    <View style={styles.footer}>
      <View style={styles.footerInner}>
        <View style={styles.footerCol}>
          <View style={styles.brand}>
            <Image source={Logo} style={styles.logoSm} contentFit="contain" />
            <Text style={styles.brandName}>Nyumba</Text>
          </View>
          <Text style={styles.footerBlurb}>
            House hunting across Kenya — discover trusted agencies, browse homes for rent or
            sale, and contact agents in one tap.
          </Text>
        </View>
        <View style={styles.footerCol}>
          <Text style={styles.footerHeading}>Explore</Text>
          <Pressable onPress={() => router.push('/search' as any)}>
            <Text style={styles.footerLink}>Search homes</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/map' as any)}>
            <Text style={styles.footerLink}>Map</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/favorites' as any)}>
            <Text style={styles.footerLink}>Saved homes</Text>
          </Pressable>
        </View>
        <View style={styles.footerCol}>
          <Text style={styles.footerHeading}>Account</Text>
          <Pressable onPress={() => router.push('/login' as any)}>
            <Text style={styles.footerLink}>Sign in</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/signup' as any)}>
            <Text style={styles.footerLink}>Create account</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/settings' as any)}>
            <Text style={styles.footerLink}>Settings</Text>
          </Pressable>
        </View>
      </View>
      <Text style={styles.copyright}>
        © {new Date().getFullYear()} Nyumba · Built for Kenya · Demo marketplace
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  footer: {
    backgroundColor: '#0A2F24',
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
    width: '100%',
    marginTop: spacing.xxl,
  },
  footerInner: {
    maxWidth: 1200,
    width: '100%',
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xxxl,
    marginBottom: spacing.xxl,
  },
  footerCol: {
    minWidth: 180,
    flex: 1,
    gap: spacing.sm,
  },
  brand: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoSm: {
    width: 28,
    height: 28,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: -0.4,
  },
  footerBlurb: {
    ...typography.body,
    color: 'rgba(255,255,255,0.72)',
    marginTop: spacing.sm,
    maxWidth: 320,
    lineHeight: 22,
  },
  footerHeading: {
    ...typography.label,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: spacing.xs,
  },
  footerLink: {
    ...typography.body,
    color: 'rgba(255,255,255,0.88)',
    paddingVertical: 4,
  },
  copyright: {
    ...typography.caption,
    color: 'rgba(255,255,255,0.45)',
    textAlign: 'center',
    paddingHorizontal: spacing.xl,
  },
});
