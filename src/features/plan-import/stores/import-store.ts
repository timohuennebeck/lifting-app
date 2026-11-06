import { create } from 'zustand';

import { useOnboardingStore } from '@/features/onboarding/stores/onboarding-store';
import type { PlanAnswers } from '@/features/plan-create/lib/plan-answers';
import type { SpokenExercises } from '@/features/voice-input/lib/spoken-exercises';
import { newId } from '@/shared/data/json';
import { track } from '@/shared/lib/posthog';

import {
  type ImportedPlan,
  ImportError,
  type ImportFailure,
  type ImportSource,
  type PlanEvent,
  streamPlan,
} from '../lib/plan-import-service';

interface ImportState {
  source: ImportSource | null;
  /** Detected plan being reviewed on the confirm screen; it fills in while `reading`. */
  plan: ImportedPlan | null;
  /** The saved plan `plan` is, when the editor changes it ("Bearbeiten") instead of making one. */
  editing: string | null;
  /** Selected routine tab on the confirm screen. */
  routineIndex: number;
  /** Counts the runs, so a screen only reacts to the one it started or shows. */
  run: number;
  /** The plan is still coming in. */
  reading: boolean;
  /** Why a run stopped without a plan. */
  failure: { run: number; reason: ImportFailure } | null;
  /** The routine the exercises being read go to. */
  readingRoutine: number;
  /** The confirm screen shows the routine being read until the user picks one. */
  following: boolean;
  /** The plan is to be read from a workout file's rows (see the workout import). */
  setText: (name: string, text: string) => void;
  /** The plan is to be made from these answers (by the AI), not read. */
  setAnswers: (answers: PlanAnswers) => void;
  /** Starts reading the plan from `source`, replacing the plan; returns the run. */
  start: (language: string) => number;
  /** Stops that run if it is still going (the user left it). */
  stop: (run: number) => void;
  setPlan: (plan: ImportedPlan) => void;
  /** Opens saved plan `planId` in the editor, to be changed rather than made anew. */
  editSaved: (planId: string, plan: ImportedPlan) => void;
  editPlan: (edit: (plan: ImportedPlan) => ImportedPlan) => void;
  /** Adds exercises the user said to the selected routine. */
  addSpoken: (spoken: SpokenExercises) => void;
  selectRoutine: (index: number) => void;
  /** Stops following the routine being read (the user started on the one shown). */
  holdRoutine: () => void;
  /** Forgets the session, e.g. on sign-out. */
  reset: () => void;
}

const EMPTY = {
  source: null,
  plan: null,
  editing: null,
  routineIndex: 0,
  reading: false,
  failure: null,
  readingRoutine: 0,
  following: true,
} as const;

/** The run in progress, stopped when another one starts or the user leaves. */
let running: AbortController | null = null;

/** A plan the AI made or read, for analytics: how long it took and what came out. */
function trackRead(source: ImportSource, plan: ImportedPlan | null, durationMs: number) {
  const routines = plan?.routines ?? [];
  if (source.kind === 'answers') {
    track('plan:generate_complete', {
      duration_ms: durationMs,
      sessions_per_week: source.answers.sessionsPerWeek,
      split: source.answers.split ?? 'auto',
      routine_count: routines.length,
    });
    return;
  }
  track('plan_import:read_complete', {
    exercise_count: routines.reduce((n, r) => n + r.exercises.length, 0),
    unmatched_count: plan?.newExercises.length ?? 0,
    duration_ms: durationMs,
  });
}

/** The plan with what the function just sent. */
function receive(s: ImportState, event: PlanEvent): Partial<ImportState> {
  if (event.type === 'plan') return { plan: { name: event.name, routines: [], newExercises: [] } };
  const { plan } = s;
  if (!plan) return {};
  if (event.type === 'routine') {
    const routines = [...plan.routines, { ...event.routine, key: newId(), exercises: [] }];
    const at = routines.length - 1;
    return {
      plan: { ...plan, routines },
      readingRoutine: at,
      ...(s.following ? { routineIndex: at } : {}),
    };
  }
  const exercise = { ...event.exercise, key: newId() };
  const routines = plan.routines.map((r, i) =>
    i === s.readingRoutine ? { ...r, exercises: [...r.exercises, exercise] } : r,
  );
  if (!event.newExercise) return { plan: { ...plan, routines } };
  const created = { ...event.newExercise, archived: false };
  // Exercises the catalog doesn't have show by name once in the draft, and are created at sign-up
  // (those the plan still uses). Kept from earlier imports too: their plan may still be the draft.
  const { draft, update } = useOnboardingStore.getState();
  update({ customExercises: [...draft.customExercises, created] });
  return { plan: { ...plan, routines, newExercises: [...plan.newExercises, created] } };
}

/**
 * In-memory state of one plan import or AI plan session (source, the plan as it comes in, review
 * position), or of a saved plan being edited.
 */
export const useImportStore = create<ImportState>()((set, get) => ({
  ...EMPTY,
  run: 0,
  setText: (name, text) => set({ source: { kind: 'text', name, text } }),
  setAnswers: (answers) => set({ source: { kind: 'answers', answers } }),
  start: (language) => {
    running?.abort();
    const controller = new AbortController();
    running = controller;
    const { source, run: last } = get();
    const run = last + 1;
    set({
      run,
      plan: null,
      editing: null,
      routineIndex: 0,
      reading: !!source,
      failure: null,
      following: true,
    });
    if (!source) return run;
    const startedAt = Date.now();
    streamPlan(
      { source, language },
      (event) => !controller.signal.aborted && set((s) => receive(s, event)),
      controller.signal,
    )
      .then(() => {
        set({ reading: false });
        trackRead(source, get().plan, Date.now() - startedAt);
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const reason = error instanceof ImportError ? error.reason : 'failed';
        set({ reading: false, failure: { run, reason } });
        const failure = {
          error_code: reason,
          error_detail:
            error instanceof ImportError
              ? error.detail
              : `client_${error instanceof Error ? error.name : 'unknown'}`,
        };
        if (source.kind === 'answers') track('plan:generate_fail', failure);
        else track('plan_import:read_fail', failure);
      });
    return run;
  },
  stop: (run) => {
    if (get().run !== run || !get().reading) return;
    running?.abort();
    set({ reading: false });
  },
  setPlan: (plan) => {
    running?.abort();
    set({ plan, editing: null, routineIndex: 0, reading: false, failure: null });
  },
  editSaved: (planId, plan) => {
    running?.abort();
    set({ ...EMPTY, plan, editing: planId });
  },
  editPlan: (edit) => set((s) => (s.plan ? { plan: edit(s.plan) } : {})),
  addSpoken: ({ exercises, newExercises }) => {
    // New exercises are created at sign-up or with the plan, like an import's (see `receive`).
    const { draft, update } = useOnboardingStore.getState();
    update({ customExercises: [...draft.customExercises, ...newExercises] });
    const added = exercises.map((e) => ({ ...e, key: newId() }));
    set((s) =>
      s.plan
        ? {
            plan: {
              ...s.plan,
              routines: s.plan.routines.map((r, i) =>
                i === s.routineIndex ? { ...r, exercises: [...r.exercises, ...added] } : r,
              ),
              newExercises: [...s.plan.newExercises, ...newExercises],
            },
          }
        : {},
    );
  },
  selectRoutine: (routineIndex) => set({ routineIndex, following: false }),
  holdRoutine: () => get().following && set({ following: false }),
  reset: () => {
    running?.abort();
    set(EMPTY);
  },
}));
