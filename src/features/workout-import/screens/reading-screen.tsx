import { router, Stack } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDraft } from '@/features/onboarding/stores/onboarding-store';
import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { useProfile, useUnits } from '@/shared/data/profile';
import { useHardwareBack } from '@/shared/hooks/use-hardware-back';
import { useNow } from '@/shared/hooks/use-now';
import { weightUnit } from '@/shared/lib/format';
import { haptics } from '@/shared/lib/haptics';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';

import { Orbit } from '../components/orbit';
import { showImportFailure, showNothingFound } from '../lib/import-failure';
import type { ImportFile, ReadFile } from '../lib/read-file';
import { useWorkoutImportStore } from '../stores/workout-import-store';
import { CTA_STYLE } from '../lib/steps';

/** How long "Fertig" shows before the found screen opens. */
const ADVANCE_MS = 800;

/**
 * 13m31: reads the file (see the store's runImport) behind chips popping in and circling, then
 * shows "Fertig" and goes on to what was found by itself. No way back while it reads. A file with
 * nothing to import goes back to the start with 13ie; another failure goes back with the error
 * sheet.
 */
export function ReadingScreen() {
  const { t, i18n } = useTranslation(['workoutImport', 'common']);
  const { inApp, step } = usePlanFlow();
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const profileUnits = useUnits();
  const draftUnits = useDraft().unitPreference;
  const status = useWorkoutImportStore((s) => s.status);
  const stage = useWorkoutImportStore((s) => s.stage);
  const failure = useWorkoutImportStore((s) => s.failure);
  const setFile = useWorkoutImportStore((s) => s.setFile);
  const [startedAt] = useState(Date.now);
  const now = useNow(1000, status === 'reading');
  const left = useRef(false);
  const advanced = useRef(false);
  const goOn = useCallback(() => {
    if (advanced.current) return;
    advanced.current = true;
    router.replace(step('/import/found'));
  }, [step]);
  // A plan is found in the history only where the user has none yet.
  const derive = !inApp || !profile?.activePlanId;

  useEffect(() => {
    const run = useWorkoutImportStore.getState().start(i18n.language, derive);
    return () => useWorkoutImportStore.getState().stop(run);
  }, [i18n.language, derive]);

  // Android's back does nothing while reading, like the swipe.
  useHardwareBack(() => undefined, status === 'reading');

  // Read: a tick and "Fertig", then on to what was found by itself (the button skips the wait).
  useEffect(() => {
    if (status !== 'ready') return;
    haptics.success();
    const timer = setTimeout(goOn, ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [status, goOn]);

  useEffect(() => {
    if (status !== 'failed' || !failure || left.current) return;
    left.current = true;
    if (failure === 'nothing') {
      const name = useWorkoutImportStore.getState().file?.name ?? '';
      const open = (file: ImportFile, read: ReadFile) => {
        setFile(file, read);
        router.push(step('/import/file'));
      };
      router.dismissTo(step('/import'));
      showNothingFound(name, open);
      return;
    }
    // The sheet stays up over the screen this goes back to; trying again reads anew.
    showImportFailure(failure, () => router.push(step('/import/reading')));
    router.back();
  }, [status, failure, step, setFile]);

  const units = inApp ? profileUnits : draftUnits;
  const weight = (kg: number, lb: number) =>
    `${units === 'imperial' ? lb : kg} ${weightUnit(units)}`;
  const seconds = Math.max(0, Math.floor((now - startedAt) / 1000));
  const ready = status === 'ready';
  const readingStage = stage === 'done' ? 'plan' : stage;

  return (
    <View className="flex-1 bg-bg">
      {/* No swiping back mid-read: a failure goes back on its own. */}
      <Stack.Screen options={{ animation: 'fade', gestureEnabled: false }} />
      <Orbit
        // Short names of well-known lifts: catalog names can be too long for a chip.
        inner={[
          t('workoutImport:reading.lifts.bench'),
          weight(80, 185),
          t('workoutImport:reading.lifts.squat'),
          '3 × 8',
        ]}
        outer={[
          t('workoutImport:reading.lifts.deadlift'),
          'PR',
          t('common:units.reps', { count: 12 }),
          t('workoutImport:reading.lifts.press'),
          weight(100, 225),
        ]}
        label={ready ? t('workoutImport:reading.done') : t(`workoutImport:reading.${readingStage}`)}
        caption={
          ready
            ? t('workoutImport:reading.took', { count: seconds })
            : t('workoutImport:reading.elapsed', { count: seconds })
        }
        done={ready}
      />
      <View className="absolute inset-x-4" style={{ bottom: Math.max(insets.bottom, 30) }}>
        {ready ? (
          <Button {...CTA_STYLE} label={t('workoutImport:reading.done')} onPress={goOn} />
        ) : (
          // Greyed out until the file is read.
          <View className="h-14 items-center justify-center rounded-full bg-control">
            <Text variant="label" className="text-base text-[#5A5A56]">
              {t('workoutImport:reading.done')}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
