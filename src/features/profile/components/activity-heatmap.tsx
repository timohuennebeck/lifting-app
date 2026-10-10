import { useMemo } from 'react';
import { View } from 'react-native';

import { useWorkoutsInRange } from '@/shared/data/workouts';
import { addDays, startOfWeek } from '@/shared/lib/date';
import { colors } from '@/shared/lib/theme';

const WEEKS = 13;
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/** Accent opacity of a day from its share of the busiest day's sets: none, or one of three steps. */
function shade(share: number) {
  if (share === 0) return 0;
  if (share > 0.66) return 1;
  return share > 0.33 ? 0.6 : 0.3;
}

/** 13-week grid (columns = weeks, rows = Mon–Sun) shaded by completed sets per day. */
export function ActivityHeatmap() {
  const thisWeek = startOfWeek(new Date());
  const fromIso = addDays(thisWeek, -(WEEKS - 1) * 7).toISOString();
  const { data: workouts } = useWorkoutsInRange(fromIso, addDays(thisWeek, 7).toISOString());
  const weeks = useMemo(() => {
    const sets = new Map<string, number>();
    for (const w of workouts ?? []) {
      const key = dayKey(new Date(w.startedAt));
      sets.set(key, (sets.get(key) ?? 0) + Math.max(1, w.setCount));
    }
    const max = Math.max(1, ...sets.values());
    const first = new Date(fromIso);
    return Array.from({ length: WEEKS }, (_, w) =>
      Array.from({ length: 7 }, (_, d) => {
        const daySets = sets.get(dayKey(addDays(first, w * 7 + d))) ?? 0;
        return shade(daySets / max);
      }),
    );
  }, [workouts, fromIso]);

  return (
    <View className="mt-3.5 flex-row gap-1">
      {weeks.map((days, w) => (
        <View key={w} className="flex-1 gap-1">
          {days.map((level, d) => (
            <View key={d} className="aspect-square overflow-hidden rounded bg-raised">
              {level ? (
                <View
                  className="flex-1"
                  style={{ backgroundColor: colors.accent, opacity: level }}
                />
              ) : null}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
