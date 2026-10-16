import '@/global.css';
import '@/shared/i18n';

// One import per weight: the package's index requires all 18 weights (6 MB in the bundle).
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { Inter_500Medium } from '@expo-google-fonts/inter/500Medium';
import { Inter_600SemiBold } from '@expo-google-fonts/inter/600SemiBold';
import { Inter_700Bold } from '@expo-google-fonts/inter/700Bold';
import { PowerSyncContext } from '@powersync/react-native';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { Uniwind } from 'uniwind';

import { useAuthListener } from '@/features/auth/hooks/use-auth-listener';
import { legalUpdateWasPending } from '@/features/legal/data/legal-acceptances';
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding-store';
import { CatalogOffline } from '@/shared/components/catalog-offline';
import { CustomExerciseGate } from '@/shared/components/custom-exercise-gate';
import { useCustomExerciseStore } from '@/shared/data/exercises';
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
  const catalog = useCatalogRefresh();
  const signedIn = useSessionStore((s) => !!s.session);
  // A password reset signs in with its code; the app opens once the new password is set.
  const recovering = useSessionStore((s) => s.recovering);
  const onboarded = useOnboardingStore((s) => s.completed);
  const inApp = signedIn && onboarded && !recovering;
  // On first launch the splash stays up until the exercises are downloaded or that failed, and
  // always until the user's own are read (CustomExerciseGate), so no empty frame shows first.
  const customLoaded = useCustomExerciseStore((s) => s.loaded);
  const catalogSettled = catalog.failed || (catalog.ready && customLoaded);
  useEffect(() => {
    if (!fontsLoaded || !catalogSettled) return;
    if (!inApp || !legalUpdateWasPending()) {
      SplashScreen.hide();
      return;
    }
    // While a new terms or privacy version waits for consent, the legal check hides it
    // (LegalUpdateGate), so the app doesn't show first with the gate over it; a slow or missing
    // connection never keeps it up longer than this.
    const timer = setTimeout(SplashScreen.hide, LEGAL_CHECK_WAIT_MS);
    return () => clearTimeout(timer);
  }, [fontsLoaded, catalogSettled, inApp]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView className="flex-1 bg-bg">
      <KeyboardProvider>
        <PowerSyncContext.Provider value={db}>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider value={navigationTheme}>
              <StatusBar style="light" />
              {/* Screens read the exercises as they render (and don't re-render when the
                  download lands), so they only mount once the catalog and the user's own
                  exercises are there. */}
              {catalog.ready ? (
                <CustomExerciseGate>
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
                    {/* Exercise info, from workouts, routines, search and the plan import. */}
                    <Stack.Screen
                      name="exercise/[id]"
                      options={{ animation: 'slide_from_right' }}
                    />
                    {/* Muscle breakdown of a workout, from the overview, builder and plan import. */}
                    <Stack.Screen
                      name="workout-muscles"
                      options={{ animation: 'slide_from_right' }}
                    />
                  </Stack>
                </CustomExerciseGate>
              ) : null}
              {catalog.failed ? (
                <CatalogOffline retrying={catalog.retrying} onRetry={catalog.retry} />
              ) : null}
            </ThemeProvider>
          </QueryClientProvider>
        </PowerSyncContext.Provider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
