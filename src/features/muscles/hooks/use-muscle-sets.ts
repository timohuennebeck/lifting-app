import { exerciseOf, useCatalogStore, useCustomExerciseStore } from '@/shared/data/exercises';
import { splitMuscles } from '@/shared/data/muscle-groups';
import { useToday } from '@/shared/hooks/use-today';
import type { MuscleId } from '@/shared/ui/muscle-map';

import { useExerciseSets } from '../data/muscle-sets';
import {
  historyStart,
  muscleCounts,
  muscleDetail,
  type SetRange,
  type SplitOf,
} from '../lib/muscle-sets';

const NO_MUSCLES = { primary: [], secondary: [] };

/**
 * The completed sets of the loaded days, today, and each exercise's muscles by role from the
 * catalog and the user's own exercises, so a change there recounts. Cardio counts for none.
 */
function useSetRows() {
  const today = useToday();
  const { data: rows, isLoading } = useExerciseSets(historyStart(today));
  const catalog = useCatalogStore((s) => s.rows);
  const custom = useCustomExerciseStore((s) => s.exercises);
  const splitOf: SplitOf = (id) =>
    catalog[id]?.cardio ? NO_MUSCLES : splitMuscles(exerciseOf(catalog[id], custom[id]));
  return { rows: rows ?? [], today, isLoading, splitOf };
}

/** Each muscle's sets in the last `range` days (Sätze tab). */
export function useMuscleCounts(range: SetRange) {
  const { rows, today, isLoading, splitOf } = useSetRows();
  return { counts: muscleCounts(rows, range, today, splitOf), isLoading };
}

/** One muscle's sets in the last `range` days, per day or week, with its exercises. */
export function useMuscleDetail(muscle: MuscleId, range: SetRange) {
  const { rows, today, isLoading, splitOf } = useSetRows();
  return { detail: muscleDetail(rows, muscle, range, today, splitOf), isLoading };
}
