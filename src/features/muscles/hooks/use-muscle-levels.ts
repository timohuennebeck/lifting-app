import { useMemo } from 'react';

import { trendOn, withTrend } from '@/features/weight/lib/trend';
import { getExercise, useCatalogStore } from '@/shared/data/exercises';
import { useProfile } from '@/shared/data/profile';
import { useWeightEntries } from '@/shared/data/weight-entries';
import { useLevelSets } from '@/shared/data/workouts';
import { useToday } from '@/shared/hooks/use-today';
import { DEFAULT_BODY_WEIGHT_KG } from '@/shared/lib/body-weight';
import { DAY_MS } from '@/shared/lib/date';

import { LEVEL_WINDOW_DAYS, type LevelExercise, muscleLevels, PAUSE_DAYS } from '../lib/levels';

/** Gains are counted over this many days. */
const GAIN_DAYS = 30;

/**
 * Each muscle's level now and 30 days ago, from the completed sets, the body-weight trend on
 * each lift's day and the profile's sex; with the muscles on pause.
 */
export function useMuscleLevels() {
  const dayKey = useToday();
  // The end of today, so today's sets count; the day moves on overnight.
  const end = dayKey + DAY_MS;
  const sinceIso = new Date(end - (LEVEL_WINDOW_DAYS + GAIN_DAYS) * DAY_MS).toISOString();
  const { data: sets, isLoading } = useLevelSets(sinceIso);
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
    return { levels, before, pauseSince, end };
    // The user's own exercises have no standard, so they never change a level.
  }, [sets, entries, profile?.sex, rows, end]);

  return { ...result, isLoading: isLoading || weightLoading };
}
