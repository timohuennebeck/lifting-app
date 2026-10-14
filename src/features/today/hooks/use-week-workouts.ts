import { type WorkoutSummary, useWorkoutsInRange } from '@/shared/data/workouts';
import { addDays, mondayIndex, startOfWeek } from '@/shared/lib/date';

export interface WeekDay {
  date: Date;
  /** Most recent finished workout of that day. */
  workout: WorkoutSummary | null;
}

/** Each day of the week containing `today` with the workout done on it. */
export function useWeekWorkouts(today: Date) {
  const monday = startOfWeek(today);
  const { data: workouts = [], isLoading } = useWorkoutsInRange(
    monday.toISOString(),
    addDays(monday, 7).toISOString(),
  );
  const days = Array.from({ length: 7 }, (_, i): WeekDay => ({
    date: addDays(monday, i),
    workout: workouts.find((w) => mondayIndex(new Date(w.startedAt)) === i) ?? null,
  }));
  return { days, isLoading };
}
