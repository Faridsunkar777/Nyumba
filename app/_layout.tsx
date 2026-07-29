import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import 'react-native-reanimated';

import { AppProvider, useApp } from '@/src/context/AppContext';
import { AuthProvider } from '@/src/context/AuthContext';
import { colors } from '@/src/theme';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { hydrated, onboardingDone } = useApp();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (hydrated) {
      SplashScreen.hideAsync();
    }
  }, [hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    const inOnboarding = segments[0] === '(onboarding)';
    if (!onboardingDone && !inOnboarding) {
      router.replace('/(onboarding)');
    } else if (onboardingDone && inOnboarding) {
      router.replace('/(tabs)');
    }
  }, [hydrated, onboardingDone, segments, router]);

  if (!hydrated) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <View style={styles.root}>
        <View style={styles.shell}>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: colors.background },
            }}
          >
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="agency/[id]"
              options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="property/[id]"
              options={{ headerShown: false, animation: 'slide_from_right' }}
            />
            <Stack.Screen
              name="filters"
              options={{ presentation: 'modal', headerShown: false }}
            />
            <Stack.Screen
              name="county-picker"
              options={{ presentation: 'modal', headerShown: false }}
            />
          </Stack>
        </View>
      </View>
    </>
  );
}

const styles = {
  root: {
    flex: 1,
    minHeight: Platform.OS === 'web' ? ('100vh' as unknown as number) : undefined,
    height: Platform.OS === 'web' ? ('100%' as unknown as number) : undefined,
    backgroundColor: colors.background,
    ...(Platform.OS === 'web'
      ? ({ alignItems: 'center' as const } as const)
      : {}),
  },
  shell: {
    flex: 1,
    width: '100%' as const,
    minHeight: Platform.OS === 'web' ? ('100vh' as unknown as number) : undefined,
    ...(Platform.OS === 'web'
      ? ({
          maxWidth: 1100,
          width: '100%',
          alignSelf: 'center' as const,
        } as const)
      : {}),
  },
};

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppProvider>
        <RootNavigator />
      </AppProvider>
    </AuthProvider>
  );
}
