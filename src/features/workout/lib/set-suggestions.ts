import {
  getExercise,
  hasMeasure,
  isAssisted,
  isBodyweight,
  isCardio,
  isTimed,
  targetsFor,
} from '@/shared/data/exercises';
import { DAY_MS } from '@/shared/lib/date';
import {
  fromDisplayWeight,
  type SetValues,
  toDisplayWeight,
  type UnitSystem,
} from '@/shared/lib/format';

import type { WorkoutExercise } from '../data/workout-detail';
import type { RecentSession } from '../data/recent-sessions';
import type { LoggedValues } from '../stores/workout-session-store';
import { adaptRepSets, planRepSets } from './rep-progression';
import {
  adaptSets,
  type LoadKind,
  planSets,
  type RuleExercise,
  type RuleSet,
  type Suggested,
  type Target,
} from './suggestion-rules';
import { lightestWeight, roundedStep, weightStep } from './weight-step';

/** What a set is suggested to be, compared with the same set last time. */
export interface SetSuggestion {
  /** Weights in kg, as the boxes take them. */
  values: SetValues;
  /**
   * Heavier (on an assisted machine: less assistance) or lighter than last time; `hold`: the
   * same weight without more reps. Null without a last time to compare with.
   */
  weight: 'up' | 'down' | 'hold' | null;
  /** More reps (or seconds) at the same weight. */
  reps: 'up' | null;
}

function loadKind(exerciseId: string): LoadKind {
  if (isTimed(exerciseId)) return 'timed';
  if (isAssisted(exerciseId)) return 'assisted';
  if (isBodyweight(exerciseId) || !hasMeasure(exerciseId, 'weight')) return 'bodyweight';
  return 'load';
}

interface TargetFields {
  targetMin: number | null;
  targetMax: number | null;
  targetRir: number | null;
}

/**
 * A set's targets with the defaults of a new set where it has none; one end of the range set
 * alone stands for both. Timed sets have no RIR target, and the rules don't read one for them.
 */
function targetOf(set: TargetFields, timed: boolean): Target {
  const fallback = targetsFor(timed);
  return {
    min: set.targetMin ?? set.targetMax ?? fallback.min,
    max: set.targetMax ?? set.targetMin ?? fallback.max,
    rir: set.targetRir ?? fallback.rir ?? 0,
  };
}

/**
 * Suggestions for each set of one exercise of the live workout from its last workouts
 * (`sessions`, newest first) and the sets logged so far; null for a set without one. Null for
 * cardio, and the first time until a logged set shows something (weighted exercises) or for the
 * whole workout (the others).
 */
export function suggestionsFor(
  exercise: WorkoutExercise,
  sessions: RecentSession[],
  logged: Record<string, LoggedValues>,
  startedAt: string,
  units: UnitSystem,
): (SetSuggestion | null)[] | null {
  const { exerciseId } = exercise;
  if (!exercise.sets.length || isCardio(exerciseId)) return null;
  const kind = loadKind(exerciseId);
  if (!sessions.length && kind !== 'load') return null;
  const timed = kind === 'timed';
  const weighted = hasMeasure(exerciseId, 'weight');

  const toWeight = (kg: number | null) => (weighted ? toDisplayWeight(kg ?? 0, units) : null);
  const toRule = (values: SetValues & { rir?: number | null }, target: Target): RuleSet | null => {
    const amount = timed ? values.seconds : values.reps;
    if (amount == null || amount <= 0) return null;
    return { weight: toWeight(values.weightKg), reps: amount, rir: values.rir ?? null, target };
  };
  const toSuggested = (values: SetValues | null): Suggested | null => {
    const amount = timed ? values?.seconds : values?.reps;
    return values && amount != null ? { weight: toWeight(values.weightKg), reps: amount } : null;
  };
  const history = sessions.map((session) =>
    session.sets.flatMap((s) => {
      const set = toRule(s, targetOf(s, timed));
      return set ? { ...set, suggested: toSuggested(s.suggested) } : [];
    }),
  );
  const targets = exercise.sets.map((s) => targetOf(s, timed));
  const done = exercise.sets.map((s, i) => {
    const values = logged[s.id] ?? (s.completedAt ? s : null);
    return values && toRule({ ...values, rir: values.rir ?? s.rir }, targets[i]);
  });

  const last = history.find((sets) => sets.length) ?? [];
  if (!last.length && kind !== 'load') return null;
  const loggedSets = [...history.flat(), ...done.flatMap((s) => s ?? [])];
  const weights = loggedSets.flatMap((s) => (s.weight == null ? [] : [s.weight]));
  const equipment = getExercise(exerciseId)?.equipment ?? undefined;
  const step = weightStep(equipment, weights, loggedSets[0]?.weight ?? null, units);
  const rounding = loggedSets.map((s) => ({
    weight: s.weight ?? 0,
    suggested: s.suggested?.weight ?? null,
  }));
  const rules: RuleExercise = {
    kind,
    step: roundedStep(step, rounding, units),
    floor: lightestWeight(equipment, units),
  };
  const days = sessions.length
    ? (Date.parse(startedAt) - Date.parse(sessions[0].startedAt)) / DAY_MS
    : 0;
  let sets: (Suggested | null)[];
  if (kind === 'load') {
    sets = adaptSets(rules, targets, planSets(rules, targets, history, days), done, history);
    if (sets.every((s) => s == null)) return null;
  } else {
    const planned = planRepSets(rules, targets, history, days);
    if (!planned) return null;
    sets = adaptRepSets(rules, targets, planned, done);
  }

  const toKg = (w: number) => fromDisplayWeight(w, units);
  const compare = (s: Suggested | null, i: number): SetSuggestion | null => {
    if (!s) return null;
    const before = last.length ? last[Math.min(i, last.length - 1)] : null;
    let weight: SetSuggestion['weight'] = null;
    if (before?.weight != null && s.weight != null && s.weight !== before.weight) {
      const heavier = s.weight > before.weight;
      weight = heavier !== (kind === 'assisted') ? 'up' : 'down';
    }
    const reps = before && s.weight === before.weight && s.reps > before.reps ? 'up' : null;
    if (before && s.weight === before.weight && !reps) weight = 'hold';
    // On a bodyweight exercise an empty weight box means no added weight.
    let weightKg: number | null = null;
    if (weighted && s.weight != null && !(kind === 'bodyweight' && s.weight === 0)) {
      weightKg = toKg(s.weight);
    }
    return {
      values: {
        weightKg,
        reps: timed ? null : s.reps,
        seconds: timed ? s.reps : null,
      },
      weight,
      reps,
    };
  };
  return sets.map(compare);
}
