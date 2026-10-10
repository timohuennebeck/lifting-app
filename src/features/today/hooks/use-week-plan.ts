import { useProfile } from '@/shared/data/profile';
import { type TemplateSummary, useTemplates } from '@/shared/data/templates';
import { type WorkoutSummary, useWorkoutsInRange } from '@/shared/data/workouts';
import { addDays, mondayIndex, startOfWeek } from '@/shared/lib/date';

export interface WeekDay {
  date: Date;
  /** Most recent finished workout of that day. */
  workout: WorkoutSummary | null;
  /** Template of the active plan scheduled on that weekday. */
  planned: TemplateSummary | null;
}

/** Done and planned workouts for each day of the week containing `today`. */
export function useWeekPlan(today: Date) {
  const monday = startOfWeek(today);
  const fromIso = monday.toISOString();
  const toIso = addDays(monday, 7).toISOString();
  const { profile } = useProfile();
  const { data: workouts } = useWorkoutsInRange(fromIso, toIso);
  const { data: templates = [] } = useTemplates();

  // Fall back to the first collection when no plan is marked active.
  // Templates without a collection sort first (NULL position), so skip them here.
  const collectionId =
    profile?.activeCollectionId ?? templates.find((t) => t.collectionId)?.collectionId ?? null;
  const planTemplates = templates.filter(
    (t) => t.collectionId === collectionId && t.weekday !== null,
  );

  const days = Array.from({ length: 7 }, (_, i): WeekDay => {
    const date = addDays(new Date(fromIso), i);
    const workout = (workouts ?? []).find((w) => mondayIndex(new Date(w.startedAt)) === i) ?? null;
    const planned = planTemplates.find((t) => t.weekday === i) ?? null;
    return { date, workout, planned };
  });

  return { days, planTemplates };
}
