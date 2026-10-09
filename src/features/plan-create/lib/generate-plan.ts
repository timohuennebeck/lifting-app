import { type ExerciseId, getExercise } from '@/shared/data/exercises';
import type { EquipmentAccess, Experience, Goal } from '@/shared/data/profile';
import { estimateMinutes, type PlanDayDraft, type PlanDraft } from '@/shared/data/templates';
import type { MuscleId } from '@/shared/ui/muscle-map/body-paths';

import {
  groupOfMuscle,
  type MuscleGroupId,
  primaryGroup,
} from '@/features/exercises/lib/muscle-groups';

import { BASE_RIR, PRESCRIBED_REPS } from './goal-ranges';

export type DayKind = 'full' | 'upper' | 'lower' | 'push' | 'pull' | 'legs';
export type SplitKind = 'full' | 'upperLower' | 'ppl' | 'pplUpperLower';

export interface GeneratePlanInput {
  goal: Goal;
  focus: MuscleId[];
  equipment: EquipmentAccess;
  /** Monday-based weekday indexes. */
  trainingDays: number[];
  sessionMinutes: number;
  experience: Experience | null;
  /** Complaint area ids from onboarding (knees, shoulders, …). */
  complaints: string[];
}

export interface PlanLabels {
  name: string;
  days: Record<DayKind, string>;
}

interface Slot {
  candidates: readonly ExerciseId[];
  compound: boolean;
}

const SLOTS = {
  squat: { candidates: ['squat', 'hack-squat', 'leg-press', 'lunge'], compound: true },
  hinge: { candidates: ['romanian-deadlift', 'deadlift', 'lunge'], compound: true },
  quad: { candidates: ['leg-press', 'hack-squat', 'lunge', 'leg-extension'], compound: true },
  quadIso: { candidates: ['leg-extension', 'lunge'], compound: false },
  calves: { candidates: ['calf-raise'], compound: false },
  // Photographed exercises lead, so a fresh plan looks like the design's (03·0b).
  hPush: {
    candidates: [
      'close-grip-bench-press',
      'bench-press',
      'incline-dumbbell-press',
      'push-up',
      'dip',
    ],
    compound: true,
  },
  inclinePush: {
    candidates: ['incline-dumbbell-press', 'close-grip-bench-press', 'push-up', 'dip'],
    compound: true,
  },
  vPush: {
    candidates: ['dumbbell-shoulder-press', 'seated-shoulder-press', 'arnold-press'],
    compound: true,
  },
  vPull: { candidates: ['pull-up', 'lat-pulldown', 'chin-up'], compound: true },
  row: { candidates: ['seated-cable-row', 't-bar-row', 'chin-up'], compound: true },
  chestIso: { candidates: ['cable-crossover', 'dip', 'push-up'], compound: false },
  sideDelt: { candidates: ['lateral-raise', 'upright-row'], compound: false },
  rearDelt: { candidates: ['face-pull', 'reverse-fly'], compound: false },
  triceps: { candidates: ['dip', 'triceps-pushdown', 'french-press'], compound: false },
  biceps: { candidates: ['dumbbell-curl', 'hammer-curl', 'chin-up'], compound: false },
  core: { candidates: ['plank'], compound: false },
} as const satisfies Record<string, Slot>;
type SlotId = keyof typeof SLOTS;

/** Slots in priority order; the session length cuts from the end. */
const DAY_SLOTS: Record<DayKind, SlotId[]> = {
  full: ['squat', 'hPush', 'vPull', 'hinge', 'vPush', 'row', 'core'],
  upper: ['hPush', 'vPull', 'vPush', 'row', 'sideDelt', 'biceps', 'triceps'],
  lower: ['squat', 'hinge', 'quad', 'calves', 'core', 'quadIso'],
  push: ['hPush', 'vPush', 'inclinePush', 'sideDelt', 'triceps', 'chestIso'],
  pull: ['vPull', 'row', 'rearDelt', 'biceps', 'hinge', 'biceps'],
  legs: ['squat', 'hinge', 'quad', 'calves', 'quadIso', 'core'],
};

const DAY_GROUPS: Record<DayKind, MuscleGroupId[]> = {
  full: ['chest', 'back', 'shoulders', 'arms', 'core', 'glutes', 'legs'],
  upper: ['chest', 'back', 'shoulders', 'arms'],
  lower: ['legs', 'glutes', 'core'],
  push: ['chest', 'shoulders', 'arms'],
  pull: ['back', 'arms', 'shoulders'],
  legs: ['legs', 'glutes', 'core'],
};

const FOCUS_SLOT: Record<MuscleGroupId, SlotId> = {
  chest: 'chestIso',
  back: 'row',
  shoulders: 'sideDelt',
  arms: 'biceps',
  core: 'core',
  glutes: 'hinge',
  legs: 'quad',
};

const EQUIPMENT: Record<EquipmentAccess, readonly string[]> = {
  gym: ['barbell', 'dumbbell', 'machine', 'cable', 'bodyweight'],
  home: ['barbell', 'dumbbell', 'bodyweight'],
  bodyweight: ['bodyweight'],
};
/** Catalog exercises that also work without their listed equipment. */
const ALSO_AT: Partial<Record<EquipmentAccess, readonly ExerciseId[]>> = {
  home: ['calf-raise'],
  bodyweight: ['lunge', 'calf-raise'],
};

/** Exercises that load a complaint area and are left out when it hurts. */
const COMPLAINT_AVOID: Record<string, readonly ExerciseId[]> = {
  neck: ['upright-row', 'deadlift'],
  shoulders: ['upright-row', 'dip', 'front-raise', 'arnold-press'],
  elbows: ['french-press', 'close-grip-bench-press', 'chin-up'],
  wrists: ['push-up', 'french-press', 'front-raise'],
  upper_back: ['t-bar-row', 'deadlift'],
  lower_back: ['deadlift', 'romanian-deadlift', 'squat', 't-bar-row'],
  hips: ['lunge', 'deadlift'],
  knees: ['lunge', 'leg-extension', 'hack-squat', 'squat'],
  ankles: ['lunge', 'calf-raise'],
};

const MIN_EXERCISES = 2;
const MAX_EXERCISES = 8;
const MAX_SETS = 5;

export function splitFor(
  dayCount: number,
  experience: Experience | null,
): { kind: SplitKind; days: DayKind[] } {
  const novice = experience === 'none' || experience === 'beginner';
  switch (dayCount) {
    case 0:
    case 1:
    case 2:
      return { kind: 'full', days: Array(Math.max(1, dayCount)).fill('full') };
    case 3:
      return novice
        ? { kind: 'full', days: ['full', 'full', 'full'] }
        : { kind: 'ppl', days: ['push', 'pull', 'legs'] };
    case 4:
      return { kind: 'upperLower', days: ['upper', 'lower', 'upper', 'lower'] };
    case 5:
      return { kind: 'pplUpperLower', days: ['push', 'pull', 'legs', 'upper', 'lower'] };
    case 6:
      return { kind: 'ppl', days: ['push', 'pull', 'legs', 'push', 'pull', 'legs'] };
    default:
      return { kind: 'ppl', days: ['push', 'pull', 'legs', 'push', 'pull', 'legs', 'full'] };
  }
}

/**
 * Builds a weekly plan from the onboarding answers. Pure and deterministic:
 * the same answers always produce the same plan.
 */
export function generatePlan(input: GeneratePlanInput, labels: PlanLabels): PlanDraft {
  const weekdays = [...new Set(input.trainingDays)].sort((a, b) => a - b);
  const { days } = splitFor(weekdays.length, input.experience);
  const allowed = allowedExercises(input);
  const focusGroups = [...new Set(input.focus.map(groupOfMuscle))];
  const counts = new Map<DayKind, number>();
  const totals = days.reduce((m, k) => m.set(k, (m.get(k) ?? 0) + 1), new Map<DayKind, number>());

  const planDays = days.map((kind, i): PlanDayDraft => {
    const variant = counts.get(kind) ?? 0;
    counts.set(kind, variant + 1);
    const suffix = (totals.get(kind) ?? 0) > 1 ? ` ${String.fromCharCode(65 + variant)}` : '';
    return {
      name: `${labels.days[kind]}${suffix}`,
      weekday: weekdays[i] ?? null,
      exercises: buildDay(kind, variant, input, allowed, focusGroups),
    };
  });
  return { name: labels.name, days: planDays };
}

function allowedExercises({ equipment, complaints }: GeneratePlanInput) {
  const avoid = new Set(complaints.flatMap((c) => COMPLAINT_AVOID[c] ?? []));
  const also = ALSO_AT[equipment] ?? [];
  return (id: ExerciseId) => {
    const ex = getExercise(id);
    if (!ex || avoid.has(id)) return false;
    return EQUIPMENT[equipment].includes(ex.equipment) || also.includes(id);
  };
}

function buildDay(
  kind: DayKind,
  variant: number,
  input: GeneratePlanInput,
  allowed: (id: ExerciseId) => boolean,
  focusGroups: MuscleGroupId[],
) {
  const slots = [...DAY_SLOTS[kind]];
  const extra = focusGroups
    .filter((g) => DAY_GROUPS[kind].includes(g))
    .map((g): SlotId => (g === 'arms' && kind === 'push' ? 'triceps' : FOCUS_SLOT[g]));
  slots.splice(2, 0, ...extra);

  const used = new Set<ExerciseId>();
  const items: { exerciseId: ExerciseId; sets: number; compound: boolean }[] = [];
  for (const slotId of slots) {
    if (items.length >= MAX_EXERCISES) break;
    const slot: Slot = SLOTS[slotId];
    const options = slot.candidates.filter((id) => allowed(id) && !used.has(id));
    if (!options.length) continue;
    const exerciseId = options[variant % options.length];
    const sets = setCount(slot.compound, items.length, exerciseId, input, focusGroups);
    const next = [...items, { exerciseId, sets, compound: slot.compound }];
    // Too long: skip it, a cheaper slot further down may still fit.
    if (items.length >= MIN_EXERCISES && estimateMinutes(next) > input.sessionMinutes) continue;
    used.add(exerciseId);
    items.push(next[next.length - 1]);
  }
  return items.map(({ exerciseId, sets, compound }) => ({
    exerciseId,
    restSeconds: null,
    sets: setsFor(sets, compound, input),
  }));
}

function setCount(
  compound: boolean,
  position: number,
  exerciseId: ExerciseId,
  { goal, experience }: GeneratePlanInput,
  focusGroups: MuscleGroupId[],
) {
  let sets = compound && goal === 'strength' ? 4 : 3;
  if (experience === 'none' || experience === 'beginner') sets = Math.min(sets, 3);
  if (experience === 'advanced' && position === 0) sets += 1;
  if (focusGroups.includes(primaryGroup(exerciseId))) sets += 1;
  return Math.min(MAX_SETS, sets);
}

function setsFor(count: number, compound: boolean, { goal, experience }: GeneratePlanInput) {
  const reps = PRESCRIBED_REPS[goal][compound ? 'compound' : 'isolation'];
  const rir = BASE_RIR[experience ?? 'beginner'];
  // Counts down to one below the base RIR, capped one above it (3 · 2 · 1, or 3 · 3 · 2 · 1).
  const last = Math.max(0, rir - 1);
  return Array.from({ length: count }, (_, i) => ({
    repsMin: reps.min,
    repsMax: reps.max,
    rir: Math.min(rir + 1, last + count - 1 - i),
  }));
}
