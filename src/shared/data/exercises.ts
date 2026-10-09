import type { ImageSourcePropType } from 'react-native';

import type { MuscleId } from '@/shared/ui/muscle-map/body-paths';

export type Equipment = 'barbell' | 'dumbbell' | 'machine' | 'cable' | 'bodyweight';

export interface Exercise {
  id: ExerciseId;
  equipment: Equipment;
  image: ImageSourcePropType | null;
  /** Default rest between sets, in seconds. */
  restSeconds: number;
  /** Share of the training stimulus per muscle; values sum to 1. */
  muscles: Partial<Record<MuscleId, number>>;
}

export const EXERCISE_IDS = [
  'bench-press',
  'close-grip-bench-press',
  'incline-dumbbell-press',
  'dumbbell-shoulder-press',
  'seated-shoulder-press',
  'arnold-press',
  'lateral-raise',
  'front-raise',
  'reverse-fly',
  'upright-row',
  'face-pull',
  'cable-crossover',
  'dip',
  'push-up',
  'triceps-pushdown',
  'french-press',
  'pull-up',
  'chin-up',
  'lat-pulldown',
  'seated-cable-row',
  't-bar-row',
  'deadlift',
  'hammer-curl',
  'dumbbell-curl',
  'squat',
  'hack-squat',
  'leg-press',
  'romanian-deadlift',
  'lunge',
  'leg-extension',
  'calf-raise',
  'plank',
] as const;
export type ExerciseId = (typeof EXERCISE_IDS)[number];

// Local catalog; names live in the `exercises` i18n namespace under `<id>.name`.
// Photos follow the prototype: close variants share one (e.g. all bench presses).
export const EXERCISES: Record<ExerciseId, Exercise> = {
  'bench-press': {
    id: 'bench-press',
    equipment: 'barbell',
    image: require('@/assets/images/exercises/close-grip-bench-press.png'),
    restSeconds: 120,
    muscles: { chest: 0.6, triceps: 0.25, front_delts: 0.15 },
  },
  'close-grip-bench-press': {
    id: 'close-grip-bench-press',
    equipment: 'machine',
    image: require('@/assets/images/exercises/close-grip-bench-press.png'),
    restSeconds: 120,
    muscles: { chest: 0.45, triceps: 0.35, front_delts: 0.2 },
  },
  'incline-dumbbell-press': {
    id: 'incline-dumbbell-press',
    equipment: 'dumbbell',
    image: require('@/assets/images/exercises/incline-dumbbell-press.png'),
    restSeconds: 90,
    muscles: { chest: 0.55, front_delts: 0.3, triceps: 0.15 },
  },
  'dumbbell-shoulder-press': {
    id: 'dumbbell-shoulder-press',
    equipment: 'dumbbell',
    image: require('@/assets/images/exercises/overhead-press.png'),
    restSeconds: 120,
    muscles: { front_delts: 0.55, side_delts: 0.2, triceps: 0.25 },
  },
  'seated-shoulder-press': {
    id: 'seated-shoulder-press',
    equipment: 'machine',
    image: require('@/assets/images/exercises/overhead-press.png'),
    restSeconds: 120,
    muscles: { front_delts: 0.55, side_delts: 0.2, triceps: 0.25 },
  },
  'arnold-press': {
    id: 'arnold-press',
    equipment: 'dumbbell',
    image: require('@/assets/images/exercises/arnold-press.png'),
    restSeconds: 90,
    muscles: { front_delts: 0.5, side_delts: 0.3, triceps: 0.2 },
  },
  'lateral-raise': {
    id: 'lateral-raise',
    equipment: 'dumbbell',
    image: require('@/assets/images/exercises/lateral-raise.png'),
    restSeconds: 60,
    muscles: { side_delts: 0.85, traps: 0.15 },
  },
  'front-raise': {
    id: 'front-raise',
    equipment: 'dumbbell',
    image: null,
    restSeconds: 60,
    muscles: { front_delts: 0.85, side_delts: 0.15 },
  },
  'reverse-fly': {
    id: 'reverse-fly',
    equipment: 'dumbbell',
    image: null,
    restSeconds: 60,
    muscles: { rear_delts: 0.7, upper_back: 0.3 },
  },
  'upright-row': {
    id: 'upright-row',
    equipment: 'barbell',
    image: null,
    restSeconds: 90,
    muscles: { side_delts: 0.5, traps: 0.5 },
  },
  'face-pull': {
    id: 'face-pull',
    equipment: 'cable',
    image: null,
    restSeconds: 60,
    muscles: { rear_delts: 0.5, upper_back: 0.3, traps: 0.2 },
  },
  'cable-crossover': {
    id: 'cable-crossover',
    equipment: 'cable',
    image: require('@/assets/images/exercises/cable-crossover.png'),
    restSeconds: 60,
    muscles: { chest: 0.85, front_delts: 0.15 },
  },
  dip: {
    id: 'dip',
    equipment: 'bodyweight',
    image: require('@/assets/images/exercises/dip.png'),
    restSeconds: 90,
    muscles: { chest: 0.45, triceps: 0.4, front_delts: 0.15 },
  },
  'push-up': {
    id: 'push-up',
    equipment: 'bodyweight',
    image: require('@/assets/images/exercises/push-up.png'),
    restSeconds: 60,
    muscles: { chest: 0.55, triceps: 0.25, front_delts: 0.2 },
  },
  'triceps-pushdown': {
    id: 'triceps-pushdown',
    equipment: 'cable',
    image: null,
    restSeconds: 60,
    muscles: { triceps: 1.0 },
  },
  'french-press': {
    id: 'french-press',
    equipment: 'barbell',
    image: null,
    restSeconds: 60,
    muscles: { triceps: 1.0 },
  },
  'pull-up': {
    id: 'pull-up',
    equipment: 'bodyweight',
    image: require('@/assets/images/exercises/pull-up.png'),
    restSeconds: 120,
    muscles: { lats: 0.55, biceps: 0.2, upper_back: 0.25 },
  },
  'chin-up': {
    id: 'chin-up',
    equipment: 'bodyweight',
    image: require('@/assets/images/exercises/chin-up.png'),
    restSeconds: 120,
    muscles: { lats: 0.5, biceps: 0.35, upper_back: 0.15 },
  },
  'lat-pulldown': {
    id: 'lat-pulldown',
    equipment: 'cable',
    image: require('@/assets/images/exercises/chin-up.png'),
    restSeconds: 90,
    muscles: { lats: 0.6, biceps: 0.2, upper_back: 0.2 },
  },
  'seated-cable-row': {
    id: 'seated-cable-row',
    equipment: 'cable',
    image: null,
    restSeconds: 90,
    muscles: { upper_back: 0.45, lats: 0.35, biceps: 0.2 },
  },
  't-bar-row': {
    id: 't-bar-row',
    equipment: 'barbell',
    image: null,
    restSeconds: 90,
    muscles: { upper_back: 0.5, lats: 0.3, biceps: 0.2 },
  },
  deadlift: {
    id: 'deadlift',
    equipment: 'barbell',
    image: null,
    restSeconds: 180,
    muscles: { hamstrings: 0.3, glutes: 0.3, lower_back: 0.25, traps: 0.15 },
  },
  'hammer-curl': {
    id: 'hammer-curl',
    equipment: 'dumbbell',
    image: null,
    restSeconds: 60,
    muscles: { biceps: 0.6, forearms: 0.4 },
  },
  'dumbbell-curl': {
    id: 'dumbbell-curl',
    equipment: 'dumbbell',
    image: null,
    restSeconds: 60,
    muscles: { biceps: 0.85, forearms: 0.15 },
  },
  squat: {
    id: 'squat',
    equipment: 'barbell',
    image: null,
    restSeconds: 180,
    muscles: { quads: 0.55, glutes: 0.3, adductors: 0.15 },
  },
  'hack-squat': {
    id: 'hack-squat',
    equipment: 'machine',
    image: null,
    restSeconds: 90,
    muscles: { quads: 0.7, glutes: 0.3 },
  },
  'leg-press': {
    id: 'leg-press',
    equipment: 'machine',
    image: null,
    restSeconds: 120,
    muscles: { quads: 0.6, glutes: 0.3, adductors: 0.1 },
  },
  'romanian-deadlift': {
    id: 'romanian-deadlift',
    equipment: 'barbell',
    image: null,
    restSeconds: 120,
    muscles: { hamstrings: 0.55, glutes: 0.35, lower_back: 0.1 },
  },
  lunge: {
    id: 'lunge',
    equipment: 'dumbbell',
    image: null,
    restSeconds: 90,
    muscles: { quads: 0.5, glutes: 0.4, adductors: 0.1 },
  },
  'leg-extension': {
    id: 'leg-extension',
    equipment: 'machine',
    image: null,
    restSeconds: 60,
    muscles: { quads: 1.0 },
  },
  'calf-raise': {
    id: 'calf-raise',
    equipment: 'machine',
    image: null,
    restSeconds: 60,
    muscles: { calves: 1.0 },
  },
  plank: {
    id: 'plank',
    equipment: 'bodyweight',
    image: require('@/assets/images/exercises/plank.png'),
    restSeconds: 60,
    muscles: { abs: 0.7, obliques: 0.3 },
  },
};

export function getExercise(id: string): Exercise | undefined {
  return EXERCISES[id as ExerciseId];
}
