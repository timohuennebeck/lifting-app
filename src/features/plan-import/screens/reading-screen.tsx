import { Redirect, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { exerciseName } from '@/shared/data/exercises';
import { PaperStack } from '@/shared/ui/paper-sheet';
import { type ScanChip, ScanStage } from '@/shared/ui/scan-stage';

import { usePlanRun } from '../hooks/use-plan-run';
import { useImportStore } from '../stores/import-store';

/**
 * 05b: starts reading the plan behind an animation and opens the review with the first exercise
 * it reads; the rest of the plan fills in there (ConfirmScreen).
 */
export function ReadingScreen() {
  const { t, i18n } = useTranslation(['planImport', 'planCreate']);
  const { step } = usePlanFlow();
  const source = useImportStore((s) => s.source);
  const shown = usePlanRun();

  if (!source) return <Redirect href={step('/import')} />;

  const stages = t('planImport:reading.stages', { returnObjects: true });
  // Paper tags for the routines being read: "T1", "T2", "T3".
  const tag = (n: number) => t('planCreate:building.routineTag', { n });
  const chips: ScanChip[] = [
    { label: exerciseName('bench-press', i18n.language), x: 14, y: 176, duration: 3 },
    { label: '4 × 8', x: 278, y: 150, accent: true, duration: 3.6, delay: 0.6 },
    { label: '3 × 12', x: 292, y: 300, duration: 4.1, delay: 1.1 },
    { label: `${tag(2)} · Pull`, x: 8, y: 452, duration: 3.3, delay: 0.3 },
    { label: exerciseName('pull-up', i18n.language), x: 236, y: 520, duration: 3.9, delay: 0.9 },
  ];

  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false, animation: 'fade' }} />
      <ScanStage progress={shown} stages={stages} chips={chips}>
        <PaperStack tags={[tag(3), tag(2), tag(1)]} />
      </ScanStage>
    </>
  );
}
