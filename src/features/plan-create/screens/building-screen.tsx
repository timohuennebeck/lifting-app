import { router, Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { groupOfMuscle } from '@/features/exercises/lib/muscle-groups';
import { useDraft } from '@/features/onboarding/stores/onboarding-store';
import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { useImportStore } from '@/features/plan-import/stores/import-store';
import { haptics } from '@/shared/lib/haptics';
import { PaperStack } from '@/shared/ui/paper-sheet';
import { type ScanChip, ScanStage, useTimedProgress } from '@/shared/ui/scan-stage';

import { answersFromDraft, generateFailure } from '../lib/plan-answers';

/** The animation plays at least this long, even when the first exercise comes sooner. */
const MIN_MS = 3600;
/** The progress bar is paced for the wait until the first exercise and slows near the end. */
const EXPECTED_MS = 15_000;

/**
 * 00·P1: the AI makes the plan from the answers (generate-plan) behind an animation; the editor
 * opens with its first exercise and the rest fills in there (ConfirmScreen), the name comes after.
 */
export function BuildingScreen() {
  const { t, i18n } = useTranslation(['planCreate', 'exercises']);
  const { step } = usePlanFlow();
  const draft = useDraft();
  // The answers as the screen opened; a new draft object doesn't start another plan.
  const [input] = useState(() => answersFromDraft(draft));
  const started = useImportStore((s) => !!s.plan?.routines[0]?.exercises.length);
  const failure = useImportStore((s) => s.failure);
  const progress = useTimedProgress(EXPECTED_MS);
  const animated = progress * EXPECTED_MS >= MIN_MS;
  const run = useRef(0);
  const opened = useRef(false);

  useEffect(() => {
    const store = useImportStore.getState();
    store.setAnswers(input);
    run.current = store.start(i18n.language);
    // Leaving before the editor opened (Android back) stops it; after that the editor owns it.
    return () => {
      if (!opened.current) store.stop(run.current);
    };
  }, [input, i18n.language]);

  useEffect(() => {
    if (!started || !animated || opened.current) return;
    opened.current = true;
    // Already complete: the editor won't see it finish.
    if (!useImportStore.getState().reading) haptics.success();
    router.replace(step('/import/confirm'));
  }, [started, animated, step]);

  useEffect(() => {
    if (failure?.run !== run.current || opened.current) return;
    opened.current = true;
    Alert.alert(t(`planCreate:generate.errors.${generateFailure(failure.reason)}`));
    router.back();
  }, [failure, t]);

  const stages = t('planCreate:building.stages', { returnObjects: true });
  const areas = [...new Set(input.focus.map(groupOfMuscle))].map((g) => t(`exercises:groups.${g}`));
  const shown = started ? 1 : Math.min(0.95, progress);

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
