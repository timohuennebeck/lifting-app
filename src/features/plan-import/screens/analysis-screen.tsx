import { Redirect, router, Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { useDraft } from '@/features/onboarding/stores/onboarding-store';
import { exerciseName } from '@/shared/data/exercises';
import { formatWeight } from '@/shared/lib/format';
import { haptics } from '@/shared/lib/haptics';
import { PaperStack } from '@/shared/ui/paper-sheet';
import { type ScanChip, ScanStage, useTimedProgress } from '@/shared/ui/scan-stage';

import { analyzePlan, type ImportedPlan } from '../lib/plan-import-service';
import { useImportStore } from '../stores/import-store';

const DURATION_MS = 3600;

/** 05b: runs the plan analysis behind an animation, then opens the review. */
export function AnalysisScreen() {
  const { t, i18n } = useTranslation(['planImport', 'common']);
  const source = useImportStore((s) => s.source);
  const setPlan = useImportStore((s) => s.setPlan);
  const { unitSystem } = useDraft();
  const [result, setResult] = useState<ImportedPlan | null>(null);
  const [animated, setAnimated] = useState(false);
  const progress = useTimedProgress(DURATION_MS, () => setAnimated(true));
  const opened = useRef(false);

  useEffect(() => {
    if (!source) return;
    let active = true;
    analyzePlan({ source, language: i18n.language })
      .then((plan) => active && setResult(plan))
      .catch(() => {
        if (!active) return;
        Alert.alert(t('planImport:analysis.error'));
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
    haptics.success();
    router.replace('/import/confirm');
  }, [result, animated, setPlan]);

  if (!source) return <Redirect href="/import" />;

  const stages = t('planImport:analysis.stages', { returnObjects: true });
  const short = t('common:weekdays.short', { returnObjects: true });
  // Waits at 99 % if the analysis takes longer than the animation.
  const shown = Math.min(result ? 1 : 0.99, progress);
  const chips: ScanChip[] = [
    { label: exerciseName('bench-press', i18n.language), x: 14, y: 176, duration: 3 },
    { label: '4 × 8', x: 278, y: 150, accent: true, duration: 3.6, delay: 0.6 },
    { label: formatWeight(80, unitSystem), x: 292, y: 300, duration: 4.1, delay: 1.1 },
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
