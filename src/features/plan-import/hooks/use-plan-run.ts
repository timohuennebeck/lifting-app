import { router } from 'expo-router';
import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { generateFailure, type PlanAnswers } from '@/features/plan-create/lib/plan-answers';
import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { useTimedProgress } from '@/shared/hooks/use-timed-progress';
import { haptics } from '@/shared/lib/haptics';

import { useImportStore } from '../stores/import-store';

/** The animation plays at least this long, even when the first exercise comes sooner. */
const MIN_MS = 3600;
/** The progress bar is paced for the wait until the first exercise and slows near the end. */
const EXPECTED_MS = 15_000;

/**
 * Gets the plan behind the reading or building animation: the AI makes it from `answers`, else
 * it is read from the import's source. Opens the editor with the first exercise once the
 * animation has played; the rest fills in there (ConfirmScreen). A failure alerts and goes back.
 * Returns the progress to show.
 */
export function usePlanRun(answers?: PlanAnswers) {
  const { t, i18n } = useTranslation(['planImport', 'planCreate']);
  const { step } = usePlanFlow();
  const started = useImportStore((s) => !!s.plan?.routines[0]?.exercises.length);
  const failure = useImportStore((s) => s.failure);
  const progress = useTimedProgress(EXPECTED_MS);
  const animated = progress * EXPECTED_MS >= MIN_MS;
  const run = useRef(0);
  const opened = useRef(false);

  useEffect(() => {
    const store = useImportStore.getState();
    if (answers) store.setAnswers(answers);
    else if (!store.source) return;
    run.current = store.start(i18n.language);
    // Leaving before the editor opened (Android back) stops it; after that the editor owns it.
    return () => {
      if (!opened.current) store.stop(run.current);
    };
  }, [answers, i18n.language]);

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
    Alert.alert(
      answers
        ? t(`planCreate:generate.errors.${generateFailure(failure.reason)}`)
        : t(`planImport:reading.errors.${failure.reason}`),
    );
    router.back();
  }, [failure, answers, t]);

  return started ? 1 : Math.min(0.95, progress);
}
