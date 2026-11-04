// Two made-up users for the eval, built by a seeded generator so every run sees the same data.
// Lena: German, kg, four workouts a week since January (Mon/Wed/Fri for the last three weeks),
// a vacation in August and a missed week in September, body weight since May, three body checks.
// Sam: English, lb, home workouts once or twice a week since mid-August, no body weight.
import {
  addDays,
  type CoachCatalogExercise,
  type CoachData,
  type CoachExercise,
  type CoachRoutine,
  type CoachUser,
  type CoachWorkout,
  daysBetween,
  type Measure,
  splitShares,
  weekdayOf,
} from '../data.ts';
import type { CoachProfile } from '../prompt.ts';

export interface Fixture {
  user: CoachUser;
  profile: CoachProfile;
  data: CoachData;
}

/** Real catalog ids with their measures and muscle shares (supabase/migrations). */
const CATALOG: Record<
  string,
  {
    de: string;
    en: string;
    measures: Measure[];
    shares: Record<string, number>;
    bodyweight?: boolean;
  }
> = {
  'bench-press': {
    de: 'Bankdrücken',
    en: 'Bench Press',
    measures: ['weight', 'reps'],
    shares: { chest: 0.6, triceps: 0.25, front_delts: 0.15 },
  },
  squat: {
    de: 'Kniebeuge',
    en: 'Squat',
    measures: ['weight', 'reps'],
    shares: { quads: 0.55, glutes: 0.3, adductors: 0.15 },
  },
  deadlift: {
    de: 'Kreuzheben',
    en: 'Deadlift',
    measures: ['weight', 'reps'],
    shares: { hamstrings: 0.3, glutes: 0.3, lower_back: 0.25, traps: 0.15 },
  },
  'overhead-press': {
    de: 'Schulterdrücken',
    en: 'Overhead Press',
    measures: ['weight', 'reps'],
    shares: { front_delts: 0.5, triceps: 0.25, side_delts: 0.15, abs: 0.1 },
  },
  'barbell-row': {
    de: 'Langhantelrudern',
    en: 'Barbell Row',
    measures: ['weight', 'reps'],
    shares: { upper_back: 0.4, lats: 0.3, biceps: 0.15, lower_back: 0.15 },
  },
  'lat-pulldown': {
    de: 'Latzug',
    en: 'Lat Pulldown',
    measures: ['weight', 'reps'],
    shares: { lats: 0.6, biceps: 0.2, upper_back: 0.2 },
  },
  'barbell-curl': {
    de: 'Langhantel-Curl',
    en: 'Barbell Curl',
    measures: ['weight', 'reps'],
    shares: { biceps: 0.85, forearms: 0.15 },
  },
  'triceps-pushdown': {
    de: 'Trizepsdrücken am Kabel',
    en: 'Triceps Pushdown',
    measures: ['weight', 'reps'],
    shares: { triceps: 1 },
  },
  'lying-leg-curl': {
    de: 'Beinbeuger liegend',
    en: 'Lying Leg Curl',
    measures: ['weight', 'reps'],
    shares: { hamstrings: 0.9, calves: 0.1 },
  },
  'leg-press': {
    de: 'Beinpresse',
    en: 'Leg Press',
    measures: ['weight', 'reps'],
    shares: { quads: 0.6, glutes: 0.3, adductors: 0.1 },
  },
  'calf-raise': {
    de: 'Wadenheben',
    en: 'Calf Raise',
    measures: ['weight', 'reps'],
    shares: { calves: 1 },
  },
  'face-pull': {
    de: 'Face Pull',
    en: 'Face Pull',
    measures: ['weight', 'reps'],
    shares: { rear_delts: 0.5, upper_back: 0.3, traps: 0.2 },
  },
  'lateral-raise': {
    de: 'Seitheben',
    en: 'Lateral Raise',
    measures: ['weight', 'reps'],
    shares: { side_delts: 0.85, traps: 0.15 },
  },
  plank: {
    de: 'Unterarmstütz',
    en: 'Plank',
    measures: ['seconds'],
    shares: { abs: 0.7, obliques: 0.3 },
    bodyweight: true,
  },
  'pull-up': {
    de: 'Klimmzug',
    en: 'Pull-up',
    measures: ['weight', 'reps'],
    shares: { lats: 0.55, biceps: 0.2, upper_back: 0.25 },
    bodyweight: true,
  },
  'push-up': {
    de: 'Liegestütz',
    en: 'Push-up',
    measures: ['reps'],
    shares: { chest: 0.55, triceps: 0.25, front_delts: 0.2 },
    bodyweight: true,
  },
  'goblet-squat': {
    de: 'Goblet Squat',
    en: 'Goblet Squat',
    measures: ['weight', 'reps'],
    shares: { quads: 0.6, glutes: 0.25, adductors: 0.1, abs: 0.05 },
  },
  'dumbbell-bench-press': {
    de: 'Kurzhantel-Bankdrücken',
    en: 'Dumbbell Bench Press',
    measures: ['weight', 'reps'],
    shares: { chest: 0.65, triceps: 0.2, front_delts: 0.15 },
  },
  'bent-over-dumbbell-row': {
    de: 'Vorgebeugtes Kurzhantelrudern',
    en: 'Bent-Over Dumbbell Row',
    measures: ['weight', 'reps'],
    shares: { upper_back: 0.4, lats: 0.35, biceps: 0.15, rear_delts: 0.1 },
  },
};

/** Mulberry32: a small seeded random generator. */
function random(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** An exercise in a routine: sets, rep range, and its weight (or reps/seconds) from start to today. */
type Lift = [id: string, sets: number, reps: [number, number], from: number, to: number];

interface Routine {
  name: string;
  lifts: Lift[];
}

interface Plan {
  start: string;
  today: string;
  /** Whether the user trains on a day (before the routine rotation picks what). */
  trains: (day: string, rand: () => number) => boolean;
  routines: Routine[];
  /** The hour (UTC) workouts start. */
  hour: number;
}

function generate({ start, today, trains, routines, hour }: Plan, rand: () => number) {
  const workouts: CoachWorkout[] = [];
  const span = daysBetween(start, today);
  let next = 0;
  for (let day = start; day <= today; day = addDays(day, 1)) {
    if (!trains(day, rand)) continue;
    const routine = routines[next++ % routines.length];
    const progress = daysBetween(start, day) / span;
    const exercises = routine.lifts
      // Calf raises and face pulls are often skipped: the muscles the eval expects to be neglected.
      .filter(([id]) => !['calf-raise', 'face-pull'].includes(id) || rand() < 0.5)
      .map(([id, sets, [low, high], from, to]) => {
        const target = (from + (to - from) * progress) * (1 + (rand() - 0.5) * 0.04);
        const measures = CATALOG[id].measures;
        const timed = measures.includes('seconds');
        const weighted = measures.includes('weight');
        const step = target >= 40 ? 2.5 : 1;
        return {
          exerciseId: id,
          sets: Array.from({ length: sets }, (_, i) => {
            const reps = Math.max(1, low + Math.floor(rand() * (high - low + 1)) - (i > 1 ? 1 : 0));
            return {
              weightKg: weighted ? Math.round(target / step) * step : null,
              reps: timed ? null : weighted ? reps : Math.round(target) - i,
              seconds: timed ? Math.round(target / 5) * 5 : null,
              rir: rand() < 0.6 ? 1 + Math.floor(rand() * 3) : null,
            };
          }),
        };
      });
    const startedAt = new Date(
      Date.parse(`${day}T${String(hour).padStart(2, '0')}:00:00Z`) +
        Math.floor(rand() * 40) * 60_000,
    );
    workouts.push({
      name: routine.name,
      startedAt: startedAt.toISOString(),
      finishedAt: new Date(
        startedAt.getTime() + (50 + Math.floor(rand() * 26)) * 60_000,
      ).toISOString(),
      exercises,
    });
  }
  return workouts;
}

/** A saved workout: its exercises as [id, sets, lowest target, highest target]. */
const routineOf = (
  id: string,
  name: string,
  status: CoachRoutine['status'],
  lines: [string, number, number, number][],
): CoachRoutine => ({
  id,
  name,
  status,
  exercises: lines.map(([exerciseId, sets, targetMin, targetMax]) => ({
    exerciseId,
    sets,
    targetMin,
    targetMax,
    rir: 2,
    restSeconds: null,
  })),
});

/** What each catalog row takes, for the exercises a workout can be built from. */
const EQUIPMENT: Record<string, string> = {
  'bench-press': 'barbell',
  squat: 'barbell',
  deadlift: 'barbell',
  'overhead-press': 'barbell',
  'barbell-row': 'barbell',
  'lat-pulldown': 'cable',
  'barbell-curl': 'barbell',
  'triceps-pushdown': 'cable',
  'lying-leg-curl': 'machine',
  'leg-press': 'machine',
  'calf-raise': 'machine',
  'face-pull': 'cable',
  'lateral-raise': 'dumbbell',
  plank: 'bodyweight',
  'pull-up': 'bodyweight',
  'push-up': 'bodyweight',
  'goblet-squat': 'dumbbell',
  'dumbbell-bench-press': 'dumbbell',
  'bent-over-dumbbell-row': 'dumbbell',
};

/** The catalog, with what the user's equipment allows (all of it for null). */
const catalogOf = (language: 'de' | 'en', have: string[] | null): CoachCatalogExercise[] =>
  Object.entries(CATALOG).map(([id, row]) => ({
    id,
    name: row[language],
    equipment: EQUIPMENT[id],
    measures: row.measures,
    muscles: row.shares,
    usable: !have || have.includes(EQUIPMENT[id]),
  }));

function exercisesOf(workouts: CoachWorkout[], language: 'de' | 'en') {
  const ids = new Set(workouts.flatMap((w) => w.exercises.map((e) => e.exerciseId)));
  return new Map(
    [...ids].map((id): [string, CoachExercise] => {
      const row = CATALOG[id];
      return [
        id,
        {
          id,
          name: row[language],
          measures: row.measures,
          ...splitShares(row.shares),
          bodyweight: !!row.bodyweight,
          assisted: false,
          cardio: false,
        },
      ];
    }),
  );
}

const between = (day: string, from: string, to: string) => day >= from && day <= to;

function lena(): Fixture {
  const rand = random(7);
  const today = '2026-11-06';
  const workouts = generate(
    {
      start: '2026-01-05',
      today,
      hour: 17,
      trains: (day, r) => {
        if (between(day, '2026-08-10', '2026-08-23') || between(day, '2026-08-31', '2026-09-06'))
          return false;
        const weekday = weekdayOf(day);
        if (day >= '2026-10-19') return ['mon', 'wed', 'fri'].includes(weekday);
        return ['mon', 'tue', 'thu', 'fri'].includes(weekday)
          ? r() > 0.06
          : weekday === 'sat' && r() < 0.03;
      },
      routines: [
        {
          name: 'Push',
          lifts: [
            ['bench-press', 3, [5, 8], 82.5, 95],
            ['overhead-press', 3, [6, 10], 45, 52.5],
            ['triceps-pushdown', 3, [10, 12], 25, 32.5],
            ['lateral-raise', 3, [12, 15], 8, 11],
          ],
        },
        {
          name: 'Pull',
          lifts: [
            ['deadlift', 3, [4, 6], 120, 150],
            ['barbell-row', 3, [6, 10], 70, 80],
            ['lat-pulldown', 3, [8, 12], 55, 65],
            ['barbell-curl', 3, [8, 12], 30, 36],
            ['face-pull', 2, [12, 15], 20, 25],
          ],
        },
        {
          name: 'Beine',
          lifts: [
            ['squat', 3, [5, 8], 95, 110],
            ['leg-press', 3, [8, 12], 160, 200],
            ['lying-leg-curl', 3, [10, 12], 40, 48],
            ['calf-raise', 2, [10, 15], 60, 70],
            ['plank', 3, [1, 1], 30, 60],
          ],
        },
        {
          name: 'Oberkörper',
          lifts: [
            ['bench-press', 3, [8, 10], 72.5, 85],
            ['pull-up', 3, [6, 10], 0, 0],
            ['overhead-press', 3, [8, 10], 42.5, 50],
            ['barbell-curl', 2, [10, 12], 27.5, 32.5],
          ],
        },
      ],
    },
    rand,
  );
  const weights: CoachData['weights'] = [];
  for (let day = '2026-05-04'; day <= today; day = addDays(day, 1)) {
    if (rand() > 0.45) continue;
    const progress = daysBetween('2026-05-04', day) / daysBetween('2026-05-04', today);
    weights.push({
      date: day,
      kg: Math.round((84.2 - 4.6 * progress + (rand() - 0.5) * 1.2) * 10) / 10,
    });
  }
  return {
    user: { today, timeZone: 'Europe/Berlin', units: 'metric', language: 'de' },
    profile: {
      goal: 'hypertrophy',
      experience: 'intermediate',
      focus: ['chest'],
      equipment: 'gym',
      plan: { name: 'Push Pull Beine + Oberkörper', sessionsPerWeek: 4 },
    },
    data: {
      exercises: exercisesOf(workouts, 'de'),
      catalog: catalogOf('de', null),
      workouts,
      routines: [
        routineOf('r-push', 'Push', 'done', [
          ['bench-press', 3, 5, 8],
          ['overhead-press', 3, 6, 10],
          ['triceps-pushdown', 3, 10, 12],
        ]),
        routineOf('r-pull', 'Pull', 'next', [
          ['deadlift', 3, 4, 6],
          ['barbell-row', 3, 6, 10],
          ['lat-pulldown', 3, 8, 12],
        ]),
        routineOf('r-beine', 'Beine', 'open', [
          ['squat', 3, 5, 8],
          ['leg-press', 3, 8, 12],
          ['calf-raise', 2, 10, 15],
        ]),
        routineOf('r-arme', 'Arme', null, [
          ['barbell-curl', 3, 8, 12],
          ['triceps-pushdown', 3, 10, 12],
        ]),
      ],
      weights,
      checks: [
        { date: '2026-06-01', score: 62 },
        { date: '2026-08-03', score: 66 },
        { date: '2026-10-05', score: 71 },
      ],
    },
  };
}

function sam(): Fixture {
  const rand = random(11);
  const workouts = generate(
    {
      start: '2026-08-17',
      today: '2026-11-06',
      hour: 22,
      trains: (day, r) => ['mon', 'thu', 'sat'].includes(weekdayOf(day)) && r() < 0.55,
      routines: [
        {
          name: 'Full Body',
          lifts: [
            ['dumbbell-bench-press', 3, [8, 12], 18, 24],
            ['goblet-squat', 3, [8, 12], 16, 24],
            ['bent-over-dumbbell-row', 3, [8, 12], 16, 22],
            ['push-up', 2, [1, 1], 12, 20],
            ['plank', 2, [1, 1], 30, 45],
          ],
        },
      ],
    },
    rand,
  );
  return {
    user: { today: '2026-11-06', timeZone: 'America/New_York', units: 'imperial', language: 'en' },
    profile: {
      goal: 'strength_hypertrophy',
      experience: 'beginner',
      focus: [],
      equipment: 'home',
      plan: { name: 'Home Full Body', sessionsPerWeek: 3 },
    },
    data: {
      exercises: exercisesOf(workouts, 'en'),
      catalog: catalogOf('en', ['dumbbell', 'bodyweight']),
      workouts,
      routines: [
        routineOf('r-full-body', 'Full Body', 'next', [
          ['dumbbell-bench-press', 3, 8, 12],
          ['goblet-squat', 3, 8, 12],
          ['bent-over-dumbbell-row', 3, 8, 12],
        ]),
      ],
      weights: [],
      checks: [],
    },
  };
}

export const FIXTURES: Record<string, Fixture> = { lena: lena(), sam: sam() };
