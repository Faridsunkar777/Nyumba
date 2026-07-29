import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { PrimaryButton } from '@/src/components/PrimaryButton';
import { useAuth } from '@/src/context/AuthContext';
import { colors, radius, spacing, typography } from '@/src/theme';

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { signUp, isConfigured } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError('');
    if (!email.trim() || password.length < 6) {
      setError('Use a valid email and password (6+ characters)');
      return;
    }
    setLoading(true);
    const result = await signUp(email.trim(), password, fullName.trim());
    setLoading(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <KeyboardAvoidingView
      style={[styles.screen, { paddingTop: insets.top + spacing.lg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Pressable style={styles.back} onPress={() => router.back()} hitSlop={8}>
        <Ionicons name="arrow-back" size={22} color={colors.text} />
      </Pressable>

      <Text style={styles.title}>Create account</Text>
      <Text style={styles.subtitle}>Save homes and request viewings across devices</Text>

      {!isConfigured && (
        <View style={styles.banner}>
          <Text style={styles.bannerText}>
            Demo mode — accounts need Supabase configured in `.env`.
          </Text>
        </View>
      )}

      <Text style={styles.label}>Full name</Text>
      <TextInput
        style={styles.input}
        placeholder="Your name"
        placeholderTextColor={colors.textMuted}
        value={fullName}
        onChangeText={setFullName}
      />

      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        placeholder="you@email.com"
        placeholderTextColor={colors.textMuted}
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>Password</Text>
      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder="At least 6 characters"
        placeholderTextColor={colors.textMuted}
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <PrimaryButton
        label={loading ? 'Creating…' : 'Create account'}
        onPress={onSubmit}
        style={{ marginTop: spacing.xl, opacity: loading ? 0.7 : 1 }}
      />
      {loading && <ActivityIndicator style={{ marginTop: spacing.md }} color={colors.primary} />}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account?</Text>
        <Link href={"/login" as any} asChild>
          <Pressable>
            <Text style={styles.link}>Sign in</Text>
          </Pressable>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
  },
  back: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.hero,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    marginBottom: spacing.xxl,
  },
  banner: {
    backgroundColor: colors.accentSoft,
    padding: spacing.md,
    borderRadius: radius.md,
    marginBottom: spacing.lg,
  },
  bannerText: {
    ...typography.caption,
    color: colors.accent,
  },
  label: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    ...typography.body,
    color: colors.text,
  },
  error: {
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginTop: spacing.xxl,
  },
  footerText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  link: {
    ...typography.bodyBold,
    color: colors.primary,
  },
});
