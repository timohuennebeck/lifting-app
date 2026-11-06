import { router } from 'expo-router';
import { useState } from 'react';

import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { useImportStore } from '@/features/plan-import/stores/import-store';
import type { CustomExercise } from '@/shared/data/exercises';
import { i18n } from '@/shared/i18n';
import { showError } from '@/shared/stores/error-sheet-store';
import { requireUserId } from '@/shared/stores/session-store';

import { keepForSignUp, sendHistory, toRows } from '../lib/save-history';
import {
  decidedImport,
  reviewsToShow,
  undatedCount,
  useWorkoutImportStore,
} from '../stores/workout-import-store';

type Rows = ReturnType<typeof toRows>;

/** Saves the history in the app; a failure offers to try again. */
async function send(
  rows: Rows,
  custom: CustomExercise[],
  onSaving: (saving: boolean) => void,
  onSaved: () => void,
) {
  onSaving(true);
  const saved = await sendHistory(requireUserId(), rows, custom).then(
    () => true,
    (error: unknown) => {
      console.warn('Saving the workout history failed', error);
      return false;
    },
  );
  onSaving(false);
  if (saved) onSaved();
  else {
    showError({
      title: i18n.t('workoutImport:errors.save.title'),
      message: i18n.t('workoutImport:errors.save.message'),
      onRetry: () => void send(rows, custom, onSaving, onSaved),
    });
  }
}

/**
 * The steps after "Import starten" (13p): a check per unsure name (15a), the dates (18a) when
 * workouts have none, then the end: the history is saved (in onboarding at sign-up) and the plan
 * opens in the editor, or the flow ends without one.
 */
export function useImportSteps() {
  const { inApp, step, done } = usePlanFlow();
  const [saving, setSaving] = useState(false);

  const checks = () => reviewsToShow(useWorkoutImportStore.getState()).length;

  function leave() {
    const { take } = useWorkoutImportStore.getState();
    if (take.plan && useImportStore.getState().plan) router.push(step('/import/confirm'));
    else done();
  }

  function finish() {
    const { workouts, custom } = decidedImport();
    const rows = toRows(workouts);
    if (!rows.length) return leave();
    if (inApp) return void send(rows, custom, setSaving, leave);
    keepForSignUp(rows, custom);
    leave();
  }

  /** After the checks: the dates, or the end. */
  function afterChecks() {
    if (undatedCount(useWorkoutImportStore.getState())) router.push(step('/import/dates'));
    else finish();
  }

  /** After 13p: the first check, or what comes after them. */
  function afterFound() {
    if (checks()) router.push({ pathname: step('/import/check'), params: { index: '1' } });
    else afterChecks();
  }

  /** Check `index` (from 1) is decided: the next one, or what comes after them. */
  function afterCheck(index: number) {
    if (index < checks()) {
      router.push({ pathname: step('/import/check'), params: { index: String(index + 1) } });
    } else afterChecks();
  }

  return { afterFound, afterCheck, finish, saving };
}
