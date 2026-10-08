import { useMemo } from 'react';
import { View } from 'react-native';

import type { WorkoutSummary } from '@/shared/data/workouts';
import { addDays, startOfWeek } from '@/shared/lib/date';
import { useAccentColor } from '@/shared/lib/theme';

const WEEKS = 13;
const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

export interface ActivityHeatmapProps {
  workouts: WorkoutSummary[];
}

/** 13-week grid (columns = weeks, rows = Mon–Sun) shaded by completed sets per day. */
export function ActivityHeatmap({ workouts }: ActivityHeatmapProps) {
  const accent = useAccentColor();
  const weeks = useMemo(() => {
    const sets = new Map<string, number>();
    for (const w of workouts) {
      const key = dayKey(new Date(w.startedAt));
      sets.set(key, (sets.get(key) ?? 0) + Math.max(1, w.setCount));
    }
    const max = Math.max(1, ...sets.values());
    const first = addDays(startOfWeek(new Date()), -(WEEKS - 1) * 7);
    return Array.from({ length: WEEKS }, (_, w) =>
      Array.from({ length: 7 }, (_, d) => {
        const value = (sets.get(dayKey(addDays(first, w * 7 + d))) ?? 0) / max;
        return value === 0 ? 0 : value > 0.66 ? 1 : value > 0.33 ? 0.6 : 0.3;
      }),
    );
  }, [workouts]);

  return (
    <View className="mt-3.5 flex-row gap-1">
      {weeks.map((days, w) => (
        <View key={w} className="flex-1 gap-1">
          {days.map((level, d) => (
            <View key={d} className="aspect-square overflow-hidden rounded bg-[#1E1E1E]">
              {level ? (
                <View className="flex-1" style={{ backgroundColor: accent, opacity: level }} />
              ) : null}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
