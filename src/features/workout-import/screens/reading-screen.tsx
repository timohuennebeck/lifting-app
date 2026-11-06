import { router, useNavigation } from 'expo-router';
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
import { DeleteSheet } from '@/shared/ui/delete-sheet';
import { Text } from '@/shared/ui/text';

import { FloatingChips } from '../components/floating-chips';
import { showImportFailure, showNothingFound } from '../lib/import-failure';
import type { ImportFile, ReadFile } from '../lib/read-file';
import { useImportSteps } from '../hooks/use-import-steps';
import { afterPick, CTA_STYLE } from '../lib/steps';
import { useWorkoutImportStore } from '../stores/workout-import-store';

/**
 * 13m31: reads the file (see the store's runImport) behind chips popping in and floating, then
 * shows "Fertig", which goes on (useImportSteps: checks, dates, "Importiert"). No swiping
 * back while it reads; Android's back asks before it stops. A file with nothing to import goes
 * back to the start with 13ie; another failure goes back with the error sheet.
 */
export function ReadingScreen() {
  const { t, i18n } = useTranslation(['workoutImport', 'common']);
  const { inApp, step } = usePlanFlow();
  const insets = useSafeAreaInsets();
  const { profile } = useProfile();
  const profileUnits = useUnits();
  const draftUnits = useDraft().unitPreference;
  const status = useWorkoutImportStore((s) => s.status);
  const failure = useWorkoutImportStore((s) => s.failure);
  const setFile = useWorkoutImportStore((s) => s.setFile);
  const navigation = useNavigation();
  const [startedAt] = useState(Date.now);
  const [cancelling, setCancelling] = useState(false);
  const now = useNow(1000, status === 'reading');
  const left = useRef(false);
  const advanced = useRef(false);
  const { afterRead, saving } = useImportSteps();
  const goOn = useCallback(() => {
    if (advanced.current) return;
    advanced.current = true;
    afterRead();
  }, [afterRead]);
  // A plan is found in the history only where the user has none yet.
  const derive = !inApp || !profile?.activePlanId;

  useEffect(() => {
    const run = useWorkoutImportStore.getState().start(i18n.language, derive);
    return () => useWorkoutImportStore.getState().stop(run);
  }, [i18n.language, derive]);

  // In the app the plan flow is a screen of its own: its swipe would leave from here too.
  useEffect(() => {
    const parent = navigation.getParent();
    parent?.setOptions({ gestureEnabled: false });
    return () => parent?.setOptions({ gestureEnabled: true });
  }, [navigation]);

  // Android's back asks first.
  useHardwareBack(() => setCancelling(true), status === 'reading');

  /** Stops reading (leaving stops the run) and goes back to the file. */
  function cancel() {
    setCancelling(false);
    router.back();
  }

  // Read: a tick and "Fertig"; it goes on only when tapped.
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
        router.push(step(afterPick(read)));
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

  return (
    <View className="flex-1 bg-bg">
      <FloatingChips
        // Short names of well-known lifts: catalog names can be too long for a chip.
        chips={[
          t('workoutImport:reading.lifts.bench'),
          weight(80, 185),
          '3 × 8',
          t('workoutImport:reading.lifts.squat'),
          t('common:units.reps', { count: 12 }),
        ]}
        label={ready ? t('workoutImport:reading.sorted') : t('workoutImport:reading.understand')}
        caption={
          ready
            ? t('workoutImport:reading.took', { count: seconds })
            : t('workoutImport:reading.elapsed', { count: seconds })
        }
        done={ready}
      />
      <View className="absolute inset-x-4" style={{ bottom: Math.max(insets.bottom, 30) }}>
        {ready ? (
          <Button
            {...CTA_STYLE}
            label={t('workoutImport:reading.done')}
            loading={saving}
            onPress={goOn}
          />
        ) : (
          // Greyed out until the file is read.
          <View className="h-14 items-center justify-center rounded-full bg-control">
            <Text variant="label" className="text-base text-[#5A5A56]">
              {t('workoutImport:reading.done')}
            </Text>
          </View>
        )}
      </View>
      <DeleteSheet
        visible={cancelling}
        onClose={() => setCancelling(false)}
        title={t('workoutImport:reading.cancel.title')}
        option={t('workoutImport:reading.cancel.option')}
        description={t('workoutImport:reading.cancel.description')}
        cta={t('workoutImport:reading.cancel.cta')}
        onDelete={cancel}
      />
    </View>
  );
}
