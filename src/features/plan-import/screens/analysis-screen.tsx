import { Redirect, router, Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { useUpdateDraft } from '@/features/onboarding/stores/onboarding-store';
import { exerciseName } from '@/shared/data/exercises';
import { haptics } from '@/shared/lib/haptics';
import { PaperStack } from '@/shared/ui/paper-sheet';
import { type ScanChip, ScanStage, useTimedProgress } from '@/shared/ui/scan-stage';

import { analyzePlan, ImportError, type ImportedPlan } from '../lib/plan-import-service';
import { useImportStore } from '../stores/import-store';

/** The scan plays at least this long, even when the plan is read faster. */
const MIN_MS = 3600;
/** The progress bar is paced for a typical analysis and waits near the end beyond it. */
const EXPECTED_MS = 30_000;

/** 05b: runs the plan analysis behind an animation, then opens the review. */
export function AnalysisScreen() {
  const { t, i18n } = useTranslation(['planImport', 'common']);
  const source = useImportStore((s) => s.source);
  const setPlan = useImportStore((s) => s.setPlan);
  const updateDraft = useUpdateDraft();
  const [result, setResult] = useState<ImportedPlan | null>(null);
  const progress = useTimedProgress(EXPECTED_MS);
  const animated = progress * EXPECTED_MS >= MIN_MS;
  const opened = useRef(false);

  useEffect(() => {
    if (!source) return;
    let active = true;
    analyzePlan({ source, language: i18n.language })
      .then((plan) => active && setResult(plan))
      .catch((error) => {
        if (!active) return;
        const reason = error instanceof ImportError ? error.reason : 'failed';
        Alert.alert(t(`planImport:analysis.errors.${reason}`));
        router.back();
      });
    return () => {
      active = false;
    };
  }, [source, i18n.language, t]);

  useEffect(() => {
    if (!result || !animated || opened.current) return;
    opened.current = true;
    setPlan(result);
    // Exercises the catalog doesn't have show by name in the review and are created at sign-up.
    updateDraft({ customExercises: result.newExercises });
    haptics.success();
    router.replace('/import/confirm');
  }, [result, animated, setPlan, updateDraft]);

  if (!source) return <Redirect href="/import" />;

  const stages = t('planImport:analysis.stages', { returnObjects: true });
  const short = t('common:weekdays.short', { returnObjects: true });
  const shown = result ? 1 : Math.min(0.95, progress);
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
