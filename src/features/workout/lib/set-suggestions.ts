import {
  getExercise,
  hasMeasure,
  isAssisted,
  isBodyweight,
  isCardio,
  isTimed,
  targetsFor,
} from '@/shared/data/exercises';
import {
  fromDisplayWeight,
  type SetValues,
  toDisplayWeight,
  type UnitSystem,
} from '@/shared/lib/format';

import type { WorkoutExercise } from '../data/workout-detail';
import type { RecentSession } from '../data/recent-sessions';
import type { LoggedValues } from '../stores/workout-session-store';
import {
  adaptSets,
  type LoadKind,
  planSets,
  type RuleSet,
  type Suggested,
  type Target,
} from './suggestion-rules';
import { lightestWeight, weightStep } from './weight-step';

const DAY_MS = 24 * 60 * 60 * 1000;

/** What a set is suggested to be, compared with the same set last time. */
export interface SetSuggestion {
  /** Weights in kg, as the boxes take them. */
  values: SetValues;
  /** Heavier (on an assisted machine: less assistance) or lighter than last time. */
  weight: 'up' | 'down' | null;
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

/** A set's targets with the defaults of a new set where it has none. */
function targetOf(set: TargetFields, timed: boolean): Target {
  const fallback = targetsFor(timed);
  const low = set.targetMin ?? set.targetMax ?? fallback.min ?? 8;
  const high = set.targetMax ?? set.targetMin ?? fallback.max ?? low;
  return {
    min: Math.min(low, high),
    max: Math.max(low, high),
    rir: set.targetRir ?? fallback.rir ?? 2,
  };
}

/**
 * Suggestions for each set of one exercise of the live workout from its last workouts
 * (`sessions`, newest first) and the sets logged so far; null the first time it is done, and
 * for cardio.
 */
export function suggestionsFor(
  exercise: WorkoutExercise,
  sessions: RecentSession[],
  logged: Record<string, LoggedValues>,
  startedAt: string,
  units: UnitSystem,
): SetSuggestion[] | null {
  const { exerciseId } = exercise;
  if (!sessions.length || !exercise.sets.length || isCardio(exerciseId)) return null;
  const kind = loadKind(exerciseId);
  const timed = kind === 'timed';
  const weighted = hasMeasure(exerciseId, 'weight');

  const toRule = (values: SetValues & { rir?: number | null }, target: Target): RuleSet | null => {
    const amount = timed ? values.seconds : values.reps;
    if (amount == null || amount <= 0) return null;
    const weight = weighted ? toDisplayWeight(values.weightKg ?? 0, units) : null;
    return { weight, reps: amount, rir: values.rir ?? null, target };
  };
  const history = sessions.map((session) =>
    session.sets.flatMap((s) => toRule(s, targetOf(s, timed)) ?? []),
  );
  const targets = exercise.sets.map((s) => targetOf(s, timed));
  const done = exercise.sets.map((s, i) => {
    const values = logged[s.id] ?? (s.completedAt ? s : null);
    return values && toRule({ ...values, rir: values.rir ?? s.rir }, targets[i]);
  });

  const last = history.find((sets) => sets.length);
  if (!last) return null;
  const weights = [...history.flat(), ...done.flatMap((s) => s ?? [])].flatMap((s) =>
    s.weight == null ? [] : [s.weight],
  );
  const equipment = getExercise(exerciseId)?.equipment ?? undefined;
  const rules = {
    kind,
    step: weightStep(equipment, weights, last[0].weight, units),
    floor: lightestWeight(equipment, units),
  };
  const days = (Date.parse(startedAt) - Date.parse(sessions[0].startedAt)) / DAY_MS;
  const planned = planSets(rules, targets, history, days);
  if (!planned) return null;
  const sets = adaptSets(rules, targets, planned, done);

  const toKg = (w: number) => fromDisplayWeight(w, units);
  const compare = (s: Suggested, i: number): SetSuggestion => {
    const before = last[Math.min(i, last.length - 1)];
    let weight: SetSuggestion['weight'] = null;
    if (before?.weight != null && s.weight != null && s.weight !== before.weight) {
      const heavier = s.weight > before.weight;
      weight = heavier !== (kind === 'assisted') ? 'up' : 'down';
    }
    const reps = before && s.weight === before.weight && s.reps > before.reps ? 'up' : null;
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
