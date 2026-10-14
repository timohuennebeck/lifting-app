import { Redirect, router, Stack } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { exerciseName } from '@/shared/data/exercises';
import { haptics } from '@/shared/lib/haptics';
import { PaperStack } from '@/shared/ui/paper-sheet';
import { type ScanChip, ScanStage, useTimedProgress } from '@/shared/ui/scan-stage';

import { useImportStore } from '../stores/import-store';

/** The scan plays at least this long, even when the plan is read faster. */
const MIN_MS = 3600;
/** The progress bar is paced for the wait until the first exercise and slows near the end. */
const EXPECTED_MS = 15_000;

/**
 * 05b: starts reading the plan behind an animation and opens the review with the first exercise
 * it reads; the rest of the plan fills in there (ConfirmScreen).
 */
export function ReadingScreen() {
  const { t, i18n } = useTranslation(['planImport', 'common']);
  const { step } = usePlanFlow();
  const source = useImportStore((s) => s.source);
  const started = useImportStore((s) => !!s.plan?.days[0]?.exercises.length);
  const failure = useImportStore((s) => s.failure);
  const progress = useTimedProgress(EXPECTED_MS);
  const animated = progress * EXPECTED_MS >= MIN_MS;
  const run = useRef(0);
  const opened = useRef(false);

  useEffect(() => {
    if (!source) return;
    const store = useImportStore.getState();
    run.current = store.start(i18n.language);
    // Leaving before the review opened (Android back) stops it; after that the review owns it.
    return () => {
      if (!opened.current) store.stop(run.current);
    };
  }, [source, i18n.language]);

  useEffect(() => {
    if (!started || !animated || opened.current) return;
    opened.current = true;
    // Already complete: the review won't see it finish.
    if (!useImportStore.getState().reading) haptics.success();
    router.replace(step('/import/confirm'));
  }, [started, animated, step]);

  useEffect(() => {
    if (failure?.run !== run.current || opened.current) return;
    opened.current = true;
    Alert.alert(t(`planImport:reading.errors.${failure.reason}`));
    router.back();
  }, [failure, t]);

  if (!source) return <Redirect href={step('/import')} />;

  const stages = t('planImport:reading.stages', { returnObjects: true });
  const short = t('common:weekdays.short', { returnObjects: true });
  const shown = started ? 1 : Math.min(0.95, progress);
  const chips: ScanChip[] = [
    { label: exerciseName('bench-press', i18n.language), x: 14, y: 176, duration: 3 },
    { label: '4 × 8', x: 278, y: 150, accent: true, duration: 3.6, delay: 0.6 },
    { label: '3 × 12', x: 292, y: 300, duration: 4.1, delay: 1.1 },
    { label: `${short[2]} · Pull`, x: 8, y: 452, duration: 3.3, delay: 0.3 },
    { label: exerciseName('pull-up', i18n.language), x: 236, y: 520, duration: 3.9, delay: 0.9 },
  ];

  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false, animation: 'fade' }} />
      <ScanStage progress={shown} stages={stages} chips={chips}>
        <PaperStack tags={[short[4], short[2], short[0]]} />
      </ScanStage>
    </>
  );
}
