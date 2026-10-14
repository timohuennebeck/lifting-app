import { create } from 'zustand';

import { useOnboardingStore } from '@/features/onboarding/stores/onboarding-store';
import type { PlanAnswers } from '@/features/plan-create/lib/plan-answers';
import { newId } from '@/shared/data/json';

import {
  type ImportedPlan,
  ImportError,
  type ImportFailure,
  type ImportFile,
  type ImportPhoto,
  type ImportSource,
  MAX_PHOTOS,
  type PlanEvent,
  streamPlan,
} from '../lib/plan-import-service';
import type { SheetSummary } from '../lib/sheet-summary';
import { loadSheets } from '../lib/sheets';

interface ImportState {
  source: ImportSource | null;
  /** The file's sheets, offered to pick from once it is to be read (see `loadSheets`). */
  workbook: SheetSummary[] | null;
  /** Detected plan being reviewed on the confirm screen; it fills in while `reading`. */
  plan: ImportedPlan | null;
  /** Selected day tab on the confirm screen. */
  dayIndex: number;
  /** Counts the analyses, so a screen only reacts to the one it started or shows. */
  run: number;
  /** The analysis is still sending the plan. */
  reading: boolean;
  /** Why an analysis stopped without a plan. */
  failure: { run: number; reason: ImportFailure } | null;
  /** The day the exercises being read go to. */
  readingDay: number;
  /** The confirm screen shows the day being read until the user picks one. */
  following: boolean;
  setFile: (file: ImportFile) => void;
  /** The plan is to be made from these answers (by the AI), not read. */
  setAnswers: (answers: PlanAnswers) => void;
  offerSheets: (workbook: SheetSummary[]) => void;
  /** Of the file's sheets, the ones to read. */
  pickSheets: (sheets: string[]) => void;
  addPhotos: (photos: ImportPhoto[]) => void;
  replacePhoto: (index: number, photo: ImportPhoto) => void;
  removePhoto: (index: number) => void;
  /** Drops photos beyond `count`, e.g. when the camera is closed without finishing. */
  truncatePhotos: (count: number) => void;
  /** Starts reading the plan from `source`, replacing the plan; returns the run. */
  analyze: (language: string) => number;
  /** Stops that analysis if it is still running (the user left it). */
  stop: (run: number) => void;
  setPlan: (plan: ImportedPlan) => void;
  editPlan: (edit: (plan: ImportedPlan) => ImportedPlan) => void;
  selectDay: (index: number) => void;
  /** Stops following the day being read (the user started doing something on the current one). */
  holdDay: () => void;
  /** Forgets the session, e.g. on sign-out. */
  reset: () => void;
}

const NO_PHOTOS: ImportPhoto[] = [];
const photosOf = (source: ImportSource | null) =>
  source?.kind === 'photos' ? source.photos : NO_PHOTOS;

const EMPTY = {
  source: null,
  workbook: null,
  plan: null,
  dayIndex: 0,
  reading: false,
  failure: null,
  readingDay: 0,
  following: true,
} as const;

/** The running analysis, stopped when another one starts or the user leaves. */
let analysis: AbortController | null = null;

/** The plan with what the analysis just sent. */
function receive(s: ImportState, event: PlanEvent): Partial<ImportState> {
  if (event.type === 'plan') return { plan: { name: event.name, days: [], newExercises: [] } };
  const { plan } = s;
  if (!plan) return {};
  if (event.type === 'day') {
    const days = [...plan.days, { ...event.day, exercises: [] }];
    const at = days.length - 1;
    return { plan: { ...plan, days }, readingDay: at, ...(s.following ? { dayIndex: at } : {}) };
  }
  const exercise = { ...event.exercise, key: newId() };
  const days = plan.days.map((d, i) =>
    i === s.readingDay ? { ...d, exercises: [...d.exercises, exercise] } : d,
  );
  if (!event.newExercise) return { plan: { ...plan, days } };
  const created = { ...event.newExercise, archived: false };
  // Exercises the catalog doesn't have show by name once in the draft, and are created at sign-up
  // (those the plan still uses). Kept from earlier imports too: their plan may still be the draft.
  const { draft, update } = useOnboardingStore.getState();
  update({ customExercises: [...draft.customExercises, created] });
  return { plan: { ...plan, days, newExercises: [...plan.newExercises, created] } };
}

/**
 * In-memory state of one plan import or AI plan session (source, the plan as it comes in, review
 * position).
 */
export const useImportStore = create<ImportState>()((set, get) => ({
  ...EMPTY,
  run: 0,
  setFile: (file) => {
    set({ source: { kind: 'file', file }, workbook: null });
    // Read ahead: its sheets are ready by the time the user goes on.
    void loadSheets(file);
  },
  offerSheets: (workbook) => set({ workbook }),
  setAnswers: (answers) => set({ source: { kind: 'answers', answers }, workbook: null }),
  pickSheets: (sheets) =>
    set((s) => (s.source?.kind === 'file' ? { source: { ...s.source, sheets } } : {})),
  addPhotos: (photos) =>
    set((s) => ({
      source: { kind: 'photos', photos: [...photosOf(s.source), ...photos].slice(0, MAX_PHOTOS) },
    })),
  replacePhoto: (index, photo) =>
    set((s) => ({
      source: {
        kind: 'photos',
        photos: photosOf(s.source).map((p, i) => (i === index ? photo : p)),
      },
    })),
  truncatePhotos: (count) =>
    set((s) => {
      const kept = photosOf(s.source).slice(0, count);
      return { source: kept.length ? { kind: 'photos', photos: kept } : null };
    }),
  removePhoto: (index) =>
    set((s) => ({
      source: { kind: 'photos', photos: photosOf(s.source).filter((_, i) => i !== index) },
    })),
  analyze: (language) => {
    analysis?.abort();
    const controller = new AbortController();
    analysis = controller;
    const { source, run: last } = get();
    const run = last + 1;
    set({ run, plan: null, dayIndex: 0, reading: !!source, failure: null, following: true });
    if (!source) return run;
    streamPlan(
      { source, language },
      (event) => !controller.signal.aborted && set((s) => receive(s, event)),
      controller.signal,
    )
      .then(() => set({ reading: false }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        const reason = error instanceof ImportError ? error.reason : 'failed';
        set({ reading: false, failure: { run, reason } });
      });
    return run;
  },
  stop: (run) => {
    if (get().run !== run || !get().reading) return;
    analysis?.abort();
    set({ reading: false });
  },
  setPlan: (plan) => {
    analysis?.abort();
    set({ plan, dayIndex: 0, reading: false, failure: null });
  },
  editPlan: (edit) => set((s) => (s.plan ? { plan: edit(s.plan) } : {})),
  selectDay: (dayIndex) => set({ dayIndex, following: false }),
  holdDay: () => get().following && set({ following: false }),
  reset: () => {
    analysis?.abort();
    set(EMPTY);
  },
}));

export const usePhotos = () => useImportStore((s) => photosOf(s.source));
