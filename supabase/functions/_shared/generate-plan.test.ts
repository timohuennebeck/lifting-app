// The generated plan's checks (planBuilder): it stores no rest, and fits each routine to the session
// length with the rest the app will give (restAfterSet).
import { assertEquals } from 'jsr:@std/assert@1';

import { type ModelExercise, type PlanAnswers, planBuilder } from '../generate-plan/generate.ts';
import type { CatalogRow } from './plans.ts';

const row = (id: string, rest: number): CatalogRow => ({
  id,
  name: { en: id },
  equipment: 'barbell',
  needs: [],
  measures: ['weight', 'reps'],
  muscles: { quads: 1 },
  rest_seconds: rest,
  cardio: false,
});

const ANSWERS: PlanAnswers = {
  goal: 'strength',
  focus: [],
  equipment: 'gym',
  homeEquipment: [],
  sessionsPerWeek: 2,
  split: null,
  sessionMinutes: 30,
  experience: 'intermediate',
};

const line = (exercise_id: string, sets: number, reps: number): ModelExercise => ({
  exercise_id,
  sets,
  target_min: reps,
  target_max: reps,
  rir: 3,
});

/** One routine of squats (at `squatReps`), bench press and curls, as the plan reads it. */
function routine(squatReps: number) {
  const plan = planBuilder(ANSWERS, [row('squat', 180), row('bench-press', 150), row('curl', 60)]);
  plan.routine({ name: 'A' });
  return [line('squat', 3, squatReps), line('bench-press', 3, 10), line('curl', 2, 12)].map(
    (l) => plan.exercise(l)?.exercise ?? null,
  );
}

Deno.test('a generated plan stores no rest: the app gives each exercise its own', () => {
  assertEquals(
    routine(10).map((e) => e?.restSeconds),
    [null, null, null],
  );
});

Deno.test('heavy sets rest longer, and that counts toward the session length', () => {
  // Squats at 10 reps rest 3:00: 825 + 735 + 360 s fit in 30 minutes (plus 10 %: 1,980 s).
  assertEquals(
    routine(10).map((e) => e?.exerciseId ?? null),
    ['squat', 'bench-press', 'curl'],
  );
  // At 5 reps they rest 4:30: 1,095 + 735 s, and the curls would run past the session.
  assertEquals(
    routine(5).map((e) => e?.exerciseId ?? null),
    ['squat', 'bench-press', null],
  );
});
