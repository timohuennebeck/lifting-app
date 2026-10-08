import { router, Stack } from 'expo-router';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';

import { groupOfMuscle } from '@/features/exercises/lib/muscle-groups';
import { useUpdateDraft } from '@/features/onboarding/stores/onboarding-store';
import { haptics } from '@/shared/lib/haptics';
import { PaperStack } from '@/shared/ui/paper-sheet';
import { type ScanChip, ScanStage, useTimedProgress } from '@/shared/ui/scan-stage';

import { usePlanGenerator } from '../hooks/use-plan-generator';

const DURATION_MS = 3600;

/** 00·P1: builds the plan while an animation plays, then asks for its name. */
export function BuildingScreen() {
  const { t } = useTranslation(['planCreate', 'exercises']);
  const update = useUpdateDraft();
  const { input, generate } = usePlanGenerator();
  const done = useRef(false);

  function finish() {
    if (done.current) return;
    done.current = true;
    update({ plan: generate() });
    haptics.success();
    router.replace('/create/plan-name');
  }

  const progress = useTimedProgress(DURATION_MS, finish);
  const stages = t('planCreate:building.stages', { returnObjects: true });
  const areas = [...new Set(input.focus.map(groupOfMuscle))].map((g) => t(`exercises:groups.${g}`));
  const days = new Set(input.trainingDays).size;

  const chips: ScanChip[] = [
    { label: t(`planCreate:goalShort.${input.goal}`), x: 14, y: 176, duration: 3 },
    {
      label: t('planCreate:building.frequency', { count: days, minutes: input.sessionMinutes }),
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
    ...(input.complaints.length
      ? [{ label: t('planCreate:building.complaints'), x: 236, y: 520, duration: 3.9, delay: 0.9 }]
      : []),
  ];

  return (
    <>
      <Stack.Screen options={{ gestureEnabled: false, animation: 'fade' }} />
      <ScanStage
        progress={progress}
        stages={stages}
        chips={chips}
        onPress={finish}
        pressLabel={t('planCreate:building.skip')}
      >
        <PaperStack
          tags={[
            t('planCreate:building.dayTag', { n: 3 }),
            t('planCreate:building.dayTag', { n: 2 }),
            t('planCreate:building.dayTag', { n: 1 }),
          ]}
        />
      </ScanStage>
    </>
  );
}
