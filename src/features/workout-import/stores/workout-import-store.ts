import { create } from 'zustand';

import { useOnboardingStore } from '@/features/onboarding/stores/onboarding-store';
import type { ImportedPlan } from '@/features/plan-import/lib/plan-import-service';
import { useImportStore } from '@/features/plan-import/stores/import-store';
import {
  type CustomExercise,
  exerciseName,
  getExercise,
  isAssisted,
  isBodyweight,
  measuresOf,
  useCustomExerciseStore,
} from '@/shared/data/exercises';
import { newId } from '@/shared/data/json';
import { splitMuscles } from '@/shared/data/muscle-groups';
import {
  CUSTOM_EXERCISE_NAME_MAX,
  IMPORT_SHEETS_MAX,
  PLAN_TEXT_MAX,
  ROUTINE_NAME_MAX,
} from '@/shared/lib/limits';
import { getOrInsert } from '@/shared/lib/map';
import { i18n } from '@/shared/i18n';
import { track } from '@/shared/lib/posthog';

import { csvLine } from '../lib/csv';
import {
  chronological,
  type ImportTable,
  type LoggedWorkout,
  nameUses,
  readLog,
  spreadUndated,
  usualLoad,
} from '../lib/history';
import {
  categorize,
  type ImportFailure,
  type MappedName,
  mapNames,
  nameRoutines,
  WorkoutImportError,
} from '../lib/import-service';
import type { ImportFile, ReadFile } from '../lib/read-file';
import {
  decidedId,
  decidePlan,
  type Decision,
  nameKey,
  type ReviewItem,
  reviewItems,
} from '../lib/review';
import { currentRoutines, findRoutines, type ResolvedWorkout } from '../lib/routines';
import { sheetSample } from '../lib/samples';
import type { WorkoutRow, WorkoutToSave } from '../lib/save-history';

interface WorkoutImportState {
  file: ImportFile | null;
  read: ReadFile | null;
  /** Of a workbook, the sheets to read; all when null. */
  sheets: string[] | null;
  /** Counts the runs, so a screen only reacts to the one it started. */
  run: number;
  status: 'idle' | 'reading' | 'ready' | 'failed';
  /** Why the run stopped: a failure, or nothing in the file to import (13ie). */
  failure: ImportFailure | 'nothing' | null;
  /** The history's workouts as the file has them (some maybe without a date). */
  workouts: LoggedWorkout[];
  /** Which exercise each name of the history is, by nameKey. */
  names: Record<string, MappedName>;
  /** Where the plan in the editor comes from; null when there is none. */
  planFrom: 'file' | 'history' | null;
  /** Whether a plan may come from the history (see `start`): then the user picks how it's made. */
  derivePlan: boolean;
  reviews: ReviewItem[];
  decisions: Record<string, Decision>;
  /** Workouts without a date get one (18a), or are left out. */
  keepUndated: boolean;
  /** What the import took over once finished: the workouts as saved, and the exercises it made. */
  imported: { workouts: WorkoutRow[]; created: string[] } | null;
  /** The import of a new file starts; a workbook's sheets are read, a CSV file is one. */
  setFile: (file: ImportFile, read: ReadFile) => void;
  pickSheets: (sheets: string[]) => void;
  /** Reads the file (see runImport); `derivePlan`: find a plan in the history if it has none. */
  start: (language: string, derivePlan: boolean) => number;
  decide: (name: string, decision: Decision) => void;
  setKeepUndated: (keep: boolean) => void;
  setImported: (imported: { workouts: WorkoutRow[]; created: string[] }) => void;
  /** Stops run `run` if it is still reading (the user left the reading screen). */
  stop: (run: number) => void;
  reset: () => void;
}

type Session = Omit<WorkoutImportState, 'run' | ActionKeys>;
type ActionKeys =
  | 'setFile'
  | 'pickSheets'
  | 'start'
  | 'decide'
  | 'setKeepUndated'
  | 'setImported'
  | 'stop'
  | 'reset';

const EMPTY: Session = {
  file: null,
  read: null,
  sheets: null,
  status: 'idle',
  failure: null,
  workouts: [],
  names: {},
  planFrom: null,
  derivePlan: false,
  reviews: [],
  decisions: {},
  keepUndated: true,
  imported: null,
};

/** The run in progress, stopped when another one starts or the user leaves. */
let running: AbortController | null = null;

/** The id of the exercise "Eigene Übung anlegen" makes of a name: the same each time it's finished. */
const madeIds = new Map<string, string>();

/**
 * Reads the plan's rows with read-workout-file into the plan import's store, which streams it as the plan
 * editor shows it. Resolves with whether there is a plan; throws on anything but "not a plan".
 */
function readPlan(name: string, text: string, language: string, signal: AbortSignal) {
  const store = useImportStore.getState();
  store.setText(name, text);
  const run = store.start(language);
  return new Promise<boolean>((resolve, reject) => {
    const check = (s: ReturnType<typeof useImportStore.getState>) => {
      if (s.run !== run || s.reading) return;
      stop();
      if (s.failure?.run === run && s.failure.reason !== 'notAPlan') {
        reject(new WorkoutImportError(s.failure.reason, `plan_${s.failure.reason}`));
      } else resolve(!!s.plan?.routines.length && s.failure?.run !== run);
    };
    const stop = useImportStore.subscribe(check);
    signal.addEventListener('abort', () => {
      stop();
      useImportStore.getState().stop(run);
    });
    check(useImportStore.getState());
  });
}

/** Exercises the import makes (new to the catalog), shown by name like the plan's. */
function addDraftExercises(exercises: Omit<CustomExercise, 'archived'>[]) {
  const { draft, update } = useOnboardingStore.getState();
  const known = new Set(draft.customExercises.map((e) => e.id));
  const fresh = exercises.filter((e) => !known.has(e.id)).map((e) => ({ ...e, archived: false }));
  if (fresh.length) update({ customExercises: [...draft.customExercises, ...fresh] });
}

/**
 * A new exercise of the history that the user (or the plan) has already under the same name is
 * that one: no second exercise of the same name.
 */
function sameNamedExercises(names: MappedName[], plan: ImportedPlan | null) {
  const byName = new Map<string, string>();
  for (const e of Object.values(useCustomExerciseStore.getState().exercises)) {
    if (!e.archived) byName.set(nameKey(e.name), e.id);
  }
  for (const e of plan?.newExercises ?? []) byName.set(nameKey(e.name), e.id);
  return names.map((n) => {
    const same = n.newExercise && byName.get(nameKey(n.newExercise.name));
    return same ? { ...n, exerciseId: same, newExercise: undefined } : n;
  });
}

/** The history's workouts with the exercises as the model matched them, for finding routines. */
function resolved(workouts: LoggedWorkout[], names: Record<string, MappedName>): ResolvedWorkout[] {
  return spreadUndated(workouts).flatMap((w) => {
    const exercises = w.exercises.flatMap((e) => {
      const id = names[nameKey(e.name)]?.exerciseId;
      return id ? [{ exerciseId: id, sets: e.sets }] : [];
    });
    return w.start && exercises.length ? [{ name: w.name, start: w.start, exercises }] : [];
  });
}

/** The plan the user follows now, found in the history (see currentRoutines); null when none. */
async function planFromHistory(
  workouts: LoggedWorkout[],
  names: Record<string, MappedName>,
  language: string,
  signal: AbortSignal,
): Promise<ImportedPlan | null> {
  const current = currentRoutines(findRoutines(resolved(workouts, names)), (id) =>
    measuresOf(id).includes('seconds'),
  );
  if (!current.length) return null;
  // Routines whose workouts have no name in the file get one from the model.
  const unnamed = current.filter((c) => !c.routine.fileName);
  const label = (id: string) => exerciseName(id, 'en');
  const given = unnamed.length
    ? await nameRoutines(
        unnamed.map((c) => ({
          exercises: c.exercises.slice(0, 8).map((e) => label(e.exerciseId)),
          workouts: c.routine.workouts.length,
        })),
        language,
        signal,
      ).catch(() => [] as string[])
    : [];
  const letters = 'ABCDEFGHIJKL';
  return {
    name: i18n.t('workoutImport:plan.fromHistory'),
    routines: current.map((c, i) => ({
      key: newId(),
      name:
        c.routine.fileName?.slice(0, ROUTINE_NAME_MAX) ||
        given[unnamed.indexOf(c)] ||
        i18n.t('workoutImport:plan.routine', { letter: letters[i] }),
      exercises: c.exercises.map((e) => ({
        key: newId(),
        exerciseId: e.exerciseId,
        sets: Array.from({ length: e.sets }, () => ({
          targetMin: e.targetMin,
          targetMax: e.targetMax,
          rir: null,
        })),
        restSeconds: null,
      })),
    })),
    newExercises: [],
  };
}

/**
 * Reads the file: step 1 (read-workout-file: what each sheet holds, which column is which), then the
 * rows into workouts on the device, then side by side step 2 (which exercise each name is) and the
 * plan's rows (read-workout-file). Without a plan in the file, and when asked, the plan comes from the
 * history. Everything is done when the reading screen goes on.
 */
async function runImport(
  tables: ImportTable[],
  fileName: string,
  language: string,
  derive: boolean,
  signal: AbortSignal,
  set: (patch: Partial<WorkoutImportState>) => void,
) {
  const readings = await categorize(fileName, tables.map(sheetSample), language, signal);
  const logs = tables.map((table) => {
    const reading = readings.find((r) => r.name === table.name.slice(0, 100));
    return reading ? { table, reading, ...readLog(table, reading) } : null;
  });
  const workouts = chronological(logs.flatMap((l) => l?.workouts ?? []));
  const planText = logs
    .flatMap((l) => {
      if (!l || l.planRows.length < 2) return [];
      return [`Sheet "${l.table.name}":\n${l.planRows.map(csvLine).join('\n')}`];
    })
    .join('\n\n')
    .slice(0, PLAN_TEXT_MAX);
  if (!workouts.length && !planText) {
    set({ failure: 'nothing', status: 'failed' });
    return null;
  }
  set({ workouts });

  const uses = nameUses(workouts);
  const [mapped, hasPlan] = await Promise.all([
    uses.length
      ? mapNames(
          uses.map((u) => ({ name: u.name, sets: u.sets, hint: usualLoad(u) })),
          language,
          signal,
        )
      : Promise.resolve([] as MappedName[]),
    planText ? readPlan(fileName, planText, language, signal) : Promise.resolve(false),
  ]);
  const filePlan = hasPlan ? useImportStore.getState().plan : null;
  const names = sameNamedExercises(mapped, filePlan);
  addDraftExercises(names.flatMap((n) => (n.newExercise ? [n.newExercise] : [])));
  const byKey = Object.fromEntries(names.map((n) => [nameKey(n.name), n]));
  set({ names: byKey });

  let plan = filePlan;
  if (!plan && derive && workouts.length) {
    plan = await planFromHistory(workouts, byKey, language, signal);
    if (plan) useImportStore.getState().setPlan(plan);
  }
  const workoutsPerName = Object.fromEntries(uses.map((u) => [nameKey(u.name), u.workouts]));
  return {
    names: byKey,
    planFrom: filePlan ? ('file' as const) : plan ? ('history' as const) : null,
    reviews: reviewItems(names, workoutsPerName, filePlan),
    workouts,
    sets: workouts.reduce((n, w) => n + w.exercises.reduce((k, e) => k + e.sets.length, 0), 0),
  };
}

/** In-memory state of one workout import (see runImport), from the file to what is taken over. */
export const useWorkoutImportStore = create<WorkoutImportState>()((set, get) => ({
  ...EMPTY,
  run: 0,
  setFile: (file, read) => {
    running?.abort();
    set({ ...EMPTY, file, read });
  },
  pickSheets: (sheets) => set({ sheets }),
  start: (language, derivePlan) => {
    running?.abort();
    madeIds.clear();
    const controller = new AbortController();
    running = controller;
    const { file, read, sheets, run: last } = get();
    const run = last + 1;
    set({ ...EMPTY, file, read, sheets, run, status: 'reading', derivePlan });
    // The plan editor starts with this import's plan, or none.
    useImportStore.getState().reset();
    const tables = (read?.tables ?? [])
      .filter((t) => (!sheets || sheets.includes(t.name)) && t.rows.length >= 2)
      .slice(0, IMPORT_SHEETS_MAX);
    const startedAt = Date.now();
    const live = (patch: Partial<WorkoutImportState>) =>
      !controller.signal.aborted && get().run === run && set(patch);
    runImport(tables, file?.name ?? '', language, derivePlan, controller.signal, live)
      .then((result) => {
        if (!result) return;
        const plan = !!result.planFrom;
        live({ ...result, status: 'ready' });
        track('workout_import:read_complete', {
          kind: result.workouts.length ? (plan ? 'both' : 'history') : 'plan',
          plan_source: result.planFrom ?? 'none',
          workout_count: result.workouts.length,
          set_count: result.sets,
          name_count: Object.keys(result.names).length,
          review_count: result.reviews.length,
          duration_ms: Date.now() - startedAt,
        });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const reason = error instanceof WorkoutImportError ? error.reason : 'failed';
        live({ status: 'failed', failure: reason });
        track('workout_import:read_fail', {
          error_code: reason,
          error_detail:
            error instanceof WorkoutImportError
              ? error.detail
              : `client_${error instanceof Error ? error.name : 'unknown'}`,
        });
      });
    return run;
  },
  decide: (name, decision) =>
    set((s) => ({ decisions: { ...s.decisions, [nameKey(name)]: decision } })),
  setKeepUndated: (keepUndated) => set({ keepUndated }),
  setImported: (imported) => set({ imported }),
  stop: (run) => {
    if (get().run !== run || get().status !== 'reading') return;
    running?.abort();
    set({ status: 'idle' });
  },
  reset: () => {
    running?.abort();
    set({ ...EMPTY });
  },
}));

/**
 * After "Importiert", the user picks how the plan is made (from the history or from the questions):
 * the file has no plan of its own, a plan may come from the history, and it has workouts.
 */
export const choosesPlan = (s: Pick<WorkoutImportState, 'derivePlan' | 'planFrom' | 'workouts'>) =>
  s.derivePlan && s.planFrom !== 'file' && s.workouts.length > 0;

/** Workouts without a date (18a asks about them). */
export const undatedCount = (s: Pick<WorkoutImportState, 'workouts'>) =>
  s.workouts.filter((w) => !w.start).length;

/**
 * A new exercise of the user's for a checked name, with the muscles (split as the app shows them)
 * and measures of its likeliest one.
 */
function customFor(item: ReviewItem): CustomExercise | null {
  const like = item.options[0] ? getExercise(item.options[0]) : undefined;
  if (!like) return null;
  const { primary, secondary } = splitMuscles(like);
  if (!primary.length) return null;
  return {
    id: getOrInsert(madeIds, nameKey(item.name), newId),
    name: item.name.trim().slice(0, CUSTOM_EXERCISE_NAME_MAX),
    primary,
    secondary,
    measures: like.measures,
    restSeconds: like.restSeconds,
    archived: false,
  };
}

/** Whether "Eigene Übung anlegen" can make one for the item (it takes the likeliest one's muscles). */
export const canMakeCustom = (item: ReviewItem) => !!customFor(item);

/**
 * What the user takes over, with their decisions: the workouts to save (with the exercises the
 * import makes), and the plan for the editor (the plan import's store gets it decided).
 */
export function decidedImport(): { workouts: WorkoutToSave[]; custom: CustomExercise[] } {
  const s = useWorkoutImportStore.getState();
  const made = new Map<string, CustomExercise>();
  const customId = (item: ReviewItem) => {
    const key = nameKey(item.name);
    if (!made.has(key)) {
      const custom = customFor(item);
      if (custom) made.set(key, custom);
    }
    return made.get(key)?.id ?? item.options[0] ?? '';
  };
  const items = new Map(s.reviews.map((r) => [nameKey(r.name), r]));
  const idOf = (name: string) => {
    const item = items.get(nameKey(name));
    if (item) return decidedId(item, s.decisions[nameKey(name)], customId);
    return s.names[nameKey(name)]?.exerciseId ?? null;
  };

  // The plan: lines of checked names as decided; in a plan from the history, the likeliest
  // exercise of a checked name becomes the one picked.
  const { plan, editPlan } = useImportStore.getState();
  if (plan && s.planFrom) {
    const replaced = new Map<string, string | null>();
    if (s.planFrom === 'history') {
      for (const item of s.reviews) {
        if (item.options[0]) replaced.set(item.options[0], idOf(item.name));
      }
    }
    editPlan((p) =>
      decidePlan(p, (raw) => (items.has(nameKey(raw)) ? idOf(raw) : undefined), replaced),
    );
  }

  const madeById = new Map([...made.values()].map((c) => [c.id, c]));
  const workouts: WorkoutToSave[] = (
    s.keepUndated ? spreadUndated(s.workouts) : s.workouts
  ).flatMap((w) => {
    if (!w.start) return [];
    const exercises = w.exercises.flatMap((e) => {
      const id = idOf(e.name);
      if (!id) return [];
      const custom = madeById.get(id);
      return [
        {
          exerciseId: id,
          measures: custom?.measures ?? measuresOf(id),
          bodyweight: isBodyweight(id) || isAssisted(id),
          sets: e.sets,
        },
      ];
    });
    return exercises.length
      ? [
          {
            name: w.name ?? i18n.t('workoutImport:defaultName'),
            start: w.start,
            end: w.end,
            exercises,
          },
        ]
      : [];
  });

  // Decided new exercises show by name in the editor and go with the plan if it uses them.
  addDraftExercises([...made.values()]);
  // New exercises the history uses (the draft holds every one the import or its plan made): an
  // account that keeps its own plan (signed in during onboarding) gets them with the history.
  const used = new Set(workouts.flatMap((w) => w.exercises.map((e) => e.exerciseId)));
  const custom = useOnboardingStore
    .getState()
    .draft.customExercises.filter((e) => used.has(e.id))
    .map((e) => ({ ...e, archived: false }));
  return { workouts, custom };
}
