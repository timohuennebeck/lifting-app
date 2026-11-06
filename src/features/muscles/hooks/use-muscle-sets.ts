import { exerciseOf, useCatalogStore, useCustomExerciseStore } from '@/shared/data/exercises';
import { splitMuscles } from '@/shared/data/muscle-groups';
import { useToday } from '@/shared/hooks/use-today';
import type { Period } from '@/shared/lib/periods';
import type { MuscleId } from '@/shared/ui/muscle-map';

import { useExerciseSets } from '../data/muscle-sets';
import { historyStart, muscleCounts, muscleDetail, type SplitOf } from '../lib/muscle-sets';

const NO_MUSCLES = { primary: [], secondary: [] };

/**
 * The completed sets of the loaded days, today, and each exercise's muscles by role from the
 * catalog and the user's own exercises, so a change there recounts. Cardio counts for none.
 */
function useSetRows(period: Period) {
  const today = useToday();
  const { data: rows, isLoading } = useExerciseSets(historyStart(today, period));
  const catalog = useCatalogStore((s) => s.rows);
  const custom = useCustomExerciseStore((s) => s.exercises);
  const splitOf: SplitOf = (id) =>
    catalog[id]?.cardio ? NO_MUSCLES : splitMuscles(exerciseOf(catalog[id], custom[id]));
  return { rows: rows ?? [], today, isLoading, splitOf };
}

/** Each muscle's sets in the period (Sätze tab). */
export function useMuscleCounts(period: Period) {
  const { rows, today, isLoading, splitOf } = useSetRows(period);
  return { counts: muscleCounts(rows, period, today, splitOf), isLoading };
}

/** One muscle's sets in the period, per bar, with its exercises. */
export function useMuscleDetail(muscle: MuscleId, period: Period) {
  const { rows, today, isLoading, splitOf } = useSetRows(period);
  return { detail: muscleDetail(rows, muscle, period, today, splitOf), isLoading };
}
