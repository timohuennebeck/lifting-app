import '@/global.css';
import '@/shared/i18n';

import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from '@expo-google-fonts/inter';
import { PowerSyncContext } from '@powersync/react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { Uniwind } from 'uniwind';

import { useAuthListener } from '@/features/auth/hooks/use-auth-listener';
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding-store';
import { db } from '@/shared/data/powersync/database';
import { queryClient } from '@/shared/data/query-client';
import { useCatalogRefresh } from '@/shared/hooks/use-catalog-refresh';
import { colors } from '@/shared/lib/theme';
import { useSessionStore } from '@/shared/stores/session-store';

SplashScreen.preventAutoHideAsync();
Uniwind.setTheme('dark');

const LEGAL_CHECK_WAIT_MS = 2500;

const navigationTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, card: colors.bg, text: colors.fg },
};

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });
  useAuthListener();
  // Also before login: onboarding builds the first plan from the catalog.
  useCatalogRefresh();
  const ready = useSessionStore((s) => s.ready);
  const signedIn = useSessionStore((s) => !!s.session);
  // A password reset signs in with its code; the app opens once the new password is set.
  const recovering = useSessionStore((s) => s.recovering);
  const onboarded = useOnboardingStore((s) => s.completed);
  const inApp = signedIn && onboarded && !recovering;
  useEffect(() => {
    if (!fontsLoaded || !ready) return;
    if (!inApp) {
      SplashScreen.hide();
      return;
    }
    // In the app it waits for the legal check, which hides it (LegalUpdateGate); a slow or
    // missing connection never keeps it up longer than this.
    const timer = setTimeout(SplashScreen.hide, LEGAL_CHECK_WAIT_MS);
    return () => clearTimeout(timer);
  }, [fontsLoaded, ready, inApp]);

  if (!fontsLoaded || !ready) return null;

  return (
    <GestureHandlerRootView className="flex-1 bg-bg">
      <KeyboardProvider>
        <PowerSyncContext.Provider value={db}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider value={navigationTheme}>
              <StatusBar style="light" />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: colors.bg },
                }}
              >
                <Stack.Protected guard={inApp}>
                  <Stack.Screen name="(app)" />
                </Stack.Protected>
                <Stack.Protected guard={!inApp}>
                  <Stack.Screen name="(onboarding)" />
                </Stack.Protected>
                {/* Open from sign-up and from settings alike. */}
                <Stack.Screen name="legal/[kind]" options={{ animation: 'slide_from_right' }} />
                {/* Exercise info, from the live workout and from the plan import. */}
                <Stack.Screen name="exercise/[id]" options={{ animation: 'slide_from_right' }} />
                {/* Muscle breakdown of a workout, from the overview, builder and plan import. */}
                <Stack.Screen name="workout-muscles" options={{ animation: 'slide_from_right' }} />
              </Stack>
            </ThemeProvider>
          </QueryClientProvider>
        </PowerSyncContext.Provider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
