import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { AppProvider, useApp } from '@/src/context/AppContext';
import { AuthProvider } from '@/src/context/AuthContext';
import { colors } from '@/src/theme';
import { WebShell } from '@/src/web/WebShell';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { hydrated, onboardingDone } = useApp();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (hydrated) SplashScreen.hideAsync();
  }, [hydrated]);

  // Skip onboarding on web — go straight to the site
  useEffect(() => {
    if (!hydrated) return;
    if (!onboardingDone) {
      // complete onboarding silently for web UX
    }
    const inOnboarding = segments[0] === '(onboarding)';
    if (inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [hydrated, onboardingDone, segments, router]);

  if (!hydrated) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  // Auth is a full-page website layout (no main nav/footer)
  const isAuth = segments[0] === '(auth)';
  // Property / agency / modals still use site chrome
  const needsOuterShell =
    !isAuth &&
    (segments[0] === 'agency' ||
      segments[0] === 'property' ||
      segments[0] === 'filters' ||
      segments[0] === 'county-picker');

  const stack = (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'fade',
      }}
    >
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="agency/[id]" />
      <Stack.Screen name="property/[id]" />
      <Stack.Screen name="filters" options={{ presentation: 'modal' }} />
      <Stack.Screen name="county-picker" options={{ presentation: 'modal' }} />
    </Stack>
  );

  return (
    <>
      <StatusBar style="dark" />
      <View style={styles.root}>
        {needsOuterShell ? <WebShell>{stack}</WebShell> : stack}
      </View>
    </>
  );
}

const styles = {
  root: {
    flex: 1,
    minHeight: '100vh' as any,
    backgroundColor: colors.background,
  },
  loader: {
    flex: 1,
    minHeight: '100vh' as any,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    backgroundColor: colors.background,
  },
};

export default function WebRootLayout() {
  return (
    <AuthProvider>
      <AppProvider>
        <RootNavigator />
      </AppProvider>
    </AuthProvider>
  );
}
