import type { PlanSetDraft } from '@/shared/data/templates';

import type { ImportedDay, ImportedExercise } from './plan-import-service';

/** `sets` sets of `min`–`max` reps without RIR, as read from a paper plan. */
export function readSets(sets: number, min: number, max = min): PlanSetDraft[] {
  return Array.from({ length: sets }, () => ({ targetMin: min, targetMax: max, rir: null }));
}

const ex = (
  exerciseId: string,
  sets: number,
  min: number,
  max?: number,
  review?: { raw: string; alternatives: string[] },
): ImportedExercise => ({
  exerciseId,
  sets: readSets(sets, min, max),
  restSeconds: null,
  ...review,
});

/** The prototype's sample import (design `Component.IMP`) mapped to catalog exercises. */
export const MOCK_IMPORT_DAYS: ImportedDay[] = [
  {
    name: 'Push',
    weekday: 0,
    exercises: [
      ex('bench-press', 4, 6, 8),
      ex('dumbbell-shoulder-press', 3, 10),
      ex('dip', 3, 10),
      ex('lateral-raise', 3, 15),
    ],
  },
  {
    name: 'Pull',
    weekday: 2,
    exercises: [
      ex('deadlift', 3, 5),
      ex('pull-up', 4, 8),
      ex('seated-cable-row', 3, 12, 12, {
        raw: 'Cbl. row cl.',
        alternatives: ['t-bar-row', 'lat-pulldown'],
      }),
      ex('face-pull', 3, 15),
      ex('hammer-curl', 3, 12, 12, { raw: 'Hammer DB ?', alternatives: ['dumbbell-curl'] }),
    ],
  },
  {
    name: 'Legs',
    weekday: null,
    rawDay: 'Day 3 – Legs',
    exercises: [
      ex('squat', 4, 6),
      ex('romanian-deadlift', 3, 8),
      ex('leg-press', 3, 12),
      ex('calf-raise', 3, 15),
    ],
  },
];
