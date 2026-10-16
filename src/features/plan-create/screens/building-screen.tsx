import { Stack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useDraft } from '@/features/onboarding/stores/onboarding-store';
import { usePlanRun } from '@/features/plan-import/hooks/use-plan-run';
import { groupOfMuscle } from '@/shared/data/muscle-groups';
import { PaperStack } from '@/shared/ui/paper-sheet';
import { type ScanChip, ScanStage } from '@/shared/ui/scan-stage';

import { answersFromDraft } from '../lib/plan-answers';

/**
 * 00·P1: the AI makes the plan from the answers (generate-plan) behind an animation; the editor
 * opens with its first exercise and the rest fills in there (ConfirmScreen), the name comes after.
 */
export function BuildingScreen() {
  const { t } = useTranslation(['planCreate', 'exercises']);
  const draft = useDraft();
  // The answers as the screen opened; a new draft object doesn't start another plan.
  const [input] = useState(() => answersFromDraft(draft));
  const shown = usePlanRun(input);

  const stages = t('planCreate:building.stages', { returnObjects: true });
  const areas = [...new Set(input.focus.map(groupOfMuscle))].map((g) => t(`exercises:groups.${g}`));

  const chips: ScanChip[] = [
    { label: t(`planCreate:goalShort.${input.goal}`), x: 14, y: 176, duration: 3 },
    {
      label: t('planCreate:building.frequency', {
        count: input.sessionsPerWeek,
        minutes: input.sessionMinutes,
      }),
      x: 278,
      y: 150,
      accent: true,
      duration: 3.6,
      delay: 0.6,
    },
    {
      label: t(`planCreate:equipmentShort.${input.equipment}`),
      x: 270,
      y: 300,
      duration: 4.1,
      delay: 1.1,
    },
    {
      label: areas.length
        ? t('planCreate:building.focus', { areas: areas.join(', ') })
        : t('planCreate:building.balanced'),
      x: 8,
      y: 452,
      duration: 3.3,
      delay: 0.3,
    },
  ];

  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false, animation: 'fade' }} />
      <ScanStage progress={shown} stages={stages} chips={chips}>
        <PaperStack
          tags={[
            t('planCreate:building.routineTag', { n: 3 }),
            t('planCreate:building.routineTag', { n: 2 }),
            t('planCreate:building.routineTag', { n: 1 }),
          ]}
        />
      </ScanStage>
    </>
  );
}
