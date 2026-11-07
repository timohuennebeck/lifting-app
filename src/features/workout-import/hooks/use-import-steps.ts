import { type Href, router } from 'expo-router';
import { useState } from 'react';

import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { AFTER_IMPORT } from '@/features/plan-import/lib/edit-plan';
import { useImportStore } from '@/features/plan-import/stores/import-store';
import type { CustomExercise } from '@/shared/data/exercises';
import { i18n } from '@/shared/i18n';
import { attempt } from '@/shared/lib/async';
import { showError } from '@/shared/stores/error-sheet-store';
import { requireUserId } from '@/shared/stores/session-store';

import type { ImportFile, ReadFile } from '../lib/read-file';
import { keepForSignUp, sendHistory, toRows } from '../lib/save-history';
import { afterPick } from '../lib/steps';
import {
  choosesPlan,
  decidedImport,
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
  const saved = await attempt('Saving the workout history failed', () =>
    sendHistory(requireUserId(), rows, custom),
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

  const checks = () => useWorkoutImportStore.getState().reviews.length;
  // Straight from the reading screen, it is replaced: going back must not read again.
  const go = (href: Href, replace: boolean) => (replace ? router.replace(href) : router.push(href));

  /** Whether the editor opens with the file's plan at the end. */
  const withPlan = () => {
    const s = useWorkoutImportStore.getState();
    return s.planFrom === 'file' && !!useImportStore.getState().plan;
  };

  function next(replace = false) {
    const s = useWorkoutImportStore.getState();
    // Only once workouts were saved: the choice builds on them.
    const choose = choosesPlan(s) && !!s.imported?.workouts.length;
    if (withPlan()) go({ pathname: step('/import/confirm'), params: AFTER_IMPORT }, replace);
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

  /** A picked file: its sheets (a workbook with several), else straight to reading. */
  function open(file: ImportFile, read: ReadFile) {
    useWorkoutImportStore.getState().setFile(file, read);
    router.push(step(afterPick(read)));
  }

  return { open, afterRead, afterCheck, finish, next, withPlan, saving };
}
