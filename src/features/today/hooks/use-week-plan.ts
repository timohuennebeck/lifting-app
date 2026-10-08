import { useMemo } from 'react';

import { useProfile } from '@/shared/data/profile';
import { type TemplateSummary, useTemplates } from '@/shared/data/templates';
import { type WorkoutSummary, useWorkoutsInRange } from '@/shared/data/workouts';
import { mondayIndex } from '@/shared/lib/format';

import { addDays, startOfWeek } from '../lib/week';

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
  const { data: templates } = useTemplates();

  const planTemplates = useMemo(() => {
    const all = templates ?? [];
    // Fall back to the first collection when no plan is marked active.
    const collectionId = profile?.activeCollectionId ?? all[0]?.collectionId ?? null;
    return all.filter((t) => t.collectionId === collectionId && t.weekday !== null);
  }, [templates, profile?.activeCollectionId]);

  const days = useMemo<WeekDay[]>(
    () =>
      Array.from({ length: 7 }, (_, i) => {
        const date = new Date(Date.parse(fromIso));
        date.setDate(date.getDate() + i);
        const workout =
          (workouts ?? []).find((w) => mondayIndex(new Date(w.startedAt)) === i) ?? null;
        const planned = planTemplates.find((t) => t.weekday === i) ?? null;
        return { date, workout, planned };
      }),
    [fromIso, workouts, planTemplates],
  );

  return { days, planTemplates };
}
