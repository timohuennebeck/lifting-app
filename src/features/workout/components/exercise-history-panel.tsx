import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { hasMeasure, isBodyweight, isTimed } from '@/shared/data/exercises';
import { useUnits } from '@/shared/data/profile';
import { type ExerciseHistoryEntry, useExerciseHistory } from '@/shared/data/workouts';
import { useNow } from '@/shared/hooks/use-now';
import { DAY_MS, DAY_RANGES, type DayRange, MINUTE_MS } from '@/shared/lib/date';
import {
  formatDate,
  formatSeconds,
  formatWeight,
  fromDisplayWeight,
  toDisplayWeight,
} from '@/shared/lib/format';
import { SegmentedControl } from '@/shared/ui/segmented-control';
import { Text } from '@/shared/ui/text';

import { HistoryChart, type HistoryMetric } from './history-chart';
import { HistorySessionRow } from './history-session-row';

function monthSections(sessions: ExerciseHistoryEntry[], currentYear: number) {
  const sections: { title: string; data: ExerciseHistoryEntry[] }[] = [];
  for (const session of sessions) {
    const date = new Date(session.startedAt);
    const title = formatDate(date, {
      month: 'long',
      ...(date.getFullYear() !== currentYear && { year: 'numeric' }),
    }).toUpperCase();
    const section = sections.at(-1);
    if (section?.title === title) section.data.push(session);
    else sections.push({ title, data: [session] });
  }
  return sections;
}

export interface ExerciseHistoryPanelProps {
  exerciseId: string;
}

/**
 * An exercise's history: best-set chart over 7–90 days and the sessions by month (designs
 * 03·C·2H·V5/V5H). Shown in the "History" tab of the exercise info.
 */
export function ExerciseHistoryPanel({ exerciseId }: ExerciseHistoryPanelProps) {
  const { t } = useTranslation(['workout', 'common']);
  const units = useUnits();
  const now = useNow(MINUTE_MS);
  const { data: sessions = [], isLoading } = useExerciseHistory(exerciseId);
  const [range, setRange] = useState<DayRange>(30);
  // undefined = default (latest session open), null = all collapsed.
  const [openId, setOpenId] = useState<string | null>();
  const expanded = openId === undefined ? sessions[0]?.workoutId : openId;

  if (!sessions.length) {
    return isLoading ? null : (
      <Text tone="subtle" className="px-3 pt-10 text-center text-sm leading-5">
        {t('history.empty')}
      </Text>
    );
  }

  const since = now - range * DAY_MS;
  // Bodyweight exercises never done with added weight would chart a flat 0 kg.
  const unweighted =
    isBodyweight(exerciseId) && sessions.every((s) => s.sets.every((set) => !set.weightKg));
  // Weighted exercises chart the top weight, the others most reps or the longest hold.
  const metric: HistoryMetric =
    hasMeasure(exerciseId, 'weight') && !unweighted
      ? 'topWeight'
      : isTimed(exerciseId)
        ? 'topSeconds'
        : 'topReps';
  // The top set is the best by score; the weight chart wants the heaviest set instead.
  const chartValue = ({ sets, topSet }: ExerciseHistoryEntry) =>
    metric === 'topWeight'
      ? toDisplayWeight(Math.max(...sets.map((s) => s.weightKg ?? 0)), units)
      : ((metric === 'topSeconds' ? topSet.seconds : topSet.reps) ?? 0);
  const formatValue = (value: number) =>
    metric === 'topWeight'
      ? formatWeight(fromDisplayWeight(value, units), units)
      : metric === 'topSeconds'
        ? formatSeconds(value)
        : t('common:units.reps', { count: value });
  const chartData = sessions
    .filter((s) => Date.parse(s.startedAt) >= since)
    .reverse()
    .map((s) => ({ time: Date.parse(s.startedAt), value: chartValue(s) }));

  return (
    <View>
      <View className="gap-3 pb-1">
        <HistoryChart data={chartData} metric={metric} format={formatValue} />
        <SegmentedControl
          className="bg-surface"
          value={range}
          onChange={setRange}
          options={DAY_RANGES.map((r) => ({
            value: r,
            label: t('history.days', { count: r }),
          }))}
        />
      </View>
      <View className="-mx-2 pt-2">
        {monthSections(sessions, new Date(now).getFullYear()).map((section) => (
          <View key={section.title}>
            <Text className="px-3 pt-4.5 pb-1.5 font-inter-semibold text-[11px] leading-3.5 tracking-[1.1px] text-dim">
              {section.title}
            </Text>
            {section.data.map((item) => (
              <HistorySessionRow
                key={item.workoutId}
                session={item}
                latest={item.workoutId === sessions[0]?.workoutId}
                open={item.workoutId === expanded}
                units={units}
                minLabel={t('common:units.minShort')}
                onToggle={() => setOpenId(item.workoutId === expanded ? null : item.workoutId)}
              />
            ))}
          </View>
        ))}
      </View>
    </View>
  );
}
