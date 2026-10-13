import { useProfile } from '@/shared/data/profile';
import { currentCollectionId, type TemplateSummary, useTemplates } from '@/shared/data/templates';
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
  const { data: workouts = [] } = useWorkoutsInRange(fromIso, toIso);
  const { data: templates = [] } = useTemplates();

  const collectionId = currentCollectionId(profile?.activeCollectionId, templates);
  const plan = templates.filter((t) => t.collectionId === collectionId);
  const planTemplates = plan.filter((t) => t.weekday !== null);

  const days = Array.from({ length: 7 }, (_, i): WeekDay => {
    const date = addDays(monday, i);
    const workout = workouts.find((w) => mondayIndex(new Date(w.startedAt)) === i) ?? null;
    const planned = planTemplates.find((t) => t.weekday === i) ?? null;
    return { date, workout, planned };
  });

  // `plan` also holds the templates without a day: what an empty day can be filled with.
  return { days, plan, planTemplates };
}
