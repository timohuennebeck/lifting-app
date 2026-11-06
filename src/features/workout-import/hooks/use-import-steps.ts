import { type Href, router } from 'expo-router';
import { useState } from 'react';

import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { useImportStore } from '@/features/plan-import/stores/import-store';
import type { CustomExercise } from '@/shared/data/exercises';
import { i18n } from '@/shared/i18n';
import { showError } from '@/shared/stores/error-sheet-store';
import { requireUserId } from '@/shared/stores/session-store';

import { keepForSignUp, sendHistory, toRows } from '../lib/save-history';
import {
  choosesPlan,
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
 * The steps after reading the file: a check per unsure name (15a), the dates (18a) when
 * workouts have none, then the history is saved (in onboarding at sign-up) and "Importiert" shows
 * it. `next` goes on from there: the file's plan opens in the editor, the user picks how a plan is
 * made (from the history or the questions), or the flow ends without one.
 */
export function useImportSteps() {
  const { inApp, step, done } = usePlanFlow();
  const [saving, setSaving] = useState(false);

  const checks = () => reviewsToShow(useWorkoutImportStore.getState()).length;
  // Straight from the reading screen, it is replaced: going back must not read again.
  const go = (href: Href, replace: boolean) => (replace ? router.replace(href) : router.push(href));

  /** Whether the editor opens with the file's plan at the end. */
  const withPlan = () => {
    const s = useWorkoutImportStore.getState();
    return s.planFrom === 'file' && s.take.plan && !!useImportStore.getState().plan;
  };

  function next(replace = false) {
    const s = useWorkoutImportStore.getState();
    // Only once workouts were saved: the choice builds on them.
    const choose = choosesPlan(s) && !!s.imported?.workouts.length;
    if (withPlan()) go(step('/import/confirm'), replace);
    else if (choose) go(step('/import/plan'), replace);
    else done();
  }

  function finish(replace = false) {
    const { workouts, custom } = decidedImport();
    const rows = toRows(workouts);
    if (!rows.length) return next(replace);
    useWorkoutImportStore
      .getState()
      .setImported({ workouts: rows, created: custom.map((c) => c.id) });
    const show = () => go(step('/import/imported'), replace);
    if (inApp) return void send(rows, custom, setSaving, show);
    keepForSignUp(rows, custom);
    show();
  }

  /** After the checks: the dates, or the end. */
  function afterChecks(replace = false) {
    if (undatedCount(useWorkoutImportStore.getState())) go(step('/import/dates'), replace);
    else finish(replace);
  }

  /** The file is read: the first check, or what comes after them. */
  function afterRead() {
    if (checks()) router.replace({ pathname: step('/import/check'), params: { index: '1' } });
    else afterChecks(true);
  }

  /** Check `index` (from 1) is decided: the next one, or what comes after them. */
  function afterCheck(index: number) {
    if (index < checks()) {
      router.push({ pathname: step('/import/check'), params: { index: String(index + 1) } });
    } else afterChecks();
  }

  return { afterRead, afterCheck, finish, next, withPlan, saving };
}
