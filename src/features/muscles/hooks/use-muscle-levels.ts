import { useMemo } from 'react';

import { trendOn, withTrend } from '@/features/weight/lib/trend';
import { getExercise, useCatalogStore } from '@/shared/data/exercises';
import { useProfile } from '@/shared/data/profile';
import { useWeightEntries } from '@/shared/data/weight-entries';
import { useToday } from '@/shared/hooks/use-today';
import { DEFAULT_BODY_WEIGHT_KG } from '@/shared/lib/body-weight';
import { DAY_MS, toIsoDate } from '@/shared/lib/date';

import { useLevelSets } from '../data/level-sets';
import { type LevelExercise, mainLift, muscleLevels, PAUSE_DAYS } from '../lib/levels';

/** The lift the ranks are put in numbers with when the user has none of their own yet. */
const EXAMPLE_LIFT = 'bench-press';

/** Gains are counted over this many days. */
const GAIN_DAYS = 30;

/**
 * Each muscle's level now and 30 days ago, from the completed sets, the body-weight trend on
 * each lift's day and the profile's sex; with the muscles on pause, today's body weight, the sex
 * the levels were scored for and the lift to put levels in numbers with: the user's main lift in
 * their usual reps (`own`), else the bench press for one rep as an example.
 */
export function useMuscleLevels() {
  const dayKey = useToday();
  // The end of today, so today's sets count; the day moves on overnight.
  const end = dayKey + DAY_MS;
  const { data: sets, isLoading } = useLevelSets();
  const { entries, isLoading: weightLoading } = useWeightEntries();
  const { profile } = useProfile();
  const rows = useCatalogStore((s) => s.rows);

  const result = useMemo(() => {
    const exercises = (id: string): LevelExercise | undefined => {
      const exercise = getExercise(id);
      if (!exercise) return undefined;
      const row = rows[id];
      return {
        standard: row?.strength_standard ?? null,
        measures: exercise.measures,
        equipment: exercise.equipment,
        assisted: row?.assisted ?? false,
        muscles: exercise.muscles,
      };
    };
    const points = withTrend(entries);
    const bodyWeightOn = (date: string) =>
      trendOn(points, date) ?? points[0]?.trendKg ?? DEFAULT_BODY_WEIGHT_KG;
    const input = { sets: sets ?? [], exercises, bodyWeightOn, sex: profile?.sex ?? null };
    const levels = muscleLevels({ ...input, now: new Date(end) });
    const before = muscleLevels({ ...input, now: new Date(end - GAIN_DAYS * DAY_MS) });
    const pauseSince = new Date(end - PAUSE_DAYS * DAY_MS).toISOString();
    const bodyWeight = bodyWeightOn(toIsoDate(new Date(dayKey)));
    const main = mainLift(input.sets, exercises, new Date(end));
    const liftId = main?.exerciseId ?? EXAMPLE_LIFT;
    const liftExercise = exercises(liftId);
    const lift = liftExercise
      ? { exerciseId: liftId, exercise: liftExercise, reps: main?.reps ?? 1, own: !!main }
      : null;
    return { levels, before, pauseSince, end, bodyWeight, sex: input.sex, lift };
    // The user's own exercises have no standard, so they never change a level.
  }, [sets, entries, profile?.sex, rows, end, dayKey]);

  return { ...result, isLoading: isLoading || weightLoading };
}
