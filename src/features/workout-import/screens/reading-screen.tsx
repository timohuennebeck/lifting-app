import { router, Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDraft } from '@/features/onboarding/stores/onboarding-store';
import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { exerciseName } from '@/shared/data/exercises';
import { useProfile, useUnits } from '@/shared/data/profile';
import { useNow } from '@/shared/hooks/use-now';
import { weightUnit } from '@/shared/lib/format';
import { haptics } from '@/shared/lib/haptics';
import { Button } from '@/shared/ui/button';
import { Text } from '@/shared/ui/text';

import { Orbit } from '../components/orbit';
import { showImportFailure, showNothingFound } from '../lib/import-failure';
import type { ImportFile, ReadFile } from '../lib/read-file';
import { useWorkoutImportStore } from '../stores/workout-import-store';

/**
 * 13m31: reads the file (see the store's runImport) behind circling chips, then "Fertig" goes on
 * to what was found. Leaving stops it. A file with nothing to import goes back to the start with
 * 13ie; another failure goes back with the error sheet.
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
  // A plan is found in the history only where the user has none yet.
  const derive = !inApp || !profile?.activePlanId;

  useEffect(() => {
    const run = useWorkoutImportStore.getState().start(i18n.language, derive);
    return () => useWorkoutImportStore.getState().stop(run);
  }, [i18n.language, derive]);

  useEffect(() => {
    if (status === 'ready') haptics.success();
  }, [status]);

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
  const name = (id: string) => exerciseName(id, i18n.language);
  const seconds = Math.max(0, Math.floor((now - startedAt) / 1000));
  const ready = status === 'ready';

  return (
    <View className="flex-1 bg-bg">
      <Stack.Screen options={{ animation: 'fade' }} />
      <Orbit
        inner={[name('bench-press'), weight(80, 185), name('squat'), '3 × 8']}
        outer={[
          name('deadlift'),
          'PR',
          t('common:units.reps', { count: 12 }),
          name('overhead-press'),
          weight(100, 225),
        ]}
        label={t(`workoutImport:reading.${stage === 'done' ? 'plan' : stage}`)}
        caption={t('workoutImport:reading.elapsed', { count: seconds })}
      />
      <View className="absolute inset-x-4" style={{ bottom: Math.max(insets.bottom, 30) }}>
        {ready ? (
          <Button
            label={t('workoutImport:reading.done')}
            onPress={() => router.replace(step('/import/found'))}
          />
        ) : (
          // Greyed out until the file is read.
          <View className="h-15 items-center justify-center rounded-full bg-control">
            <Text variant="label" className="text-[#5A5A56]">
              {t('workoutImport:reading.done')}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
