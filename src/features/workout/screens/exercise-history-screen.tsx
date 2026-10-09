import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { SectionList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { exerciseName, hasMeasure, isTimed } from '@/shared/data/exercises';
import { useUnits } from '@/shared/data/profile';
import { type ExerciseHistoryEntry, useExerciseHistory } from '@/shared/data/workouts';
import { useNow } from '@/shared/hooks/use-now';
import { DAY_MS, MINUTE_MS } from '@/shared/lib/date';
import { formatDate, formatSeconds, formatWeight } from '@/shared/lib/format';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { SegmentedControl } from '@/shared/ui/segmented-control';
import { Text } from '@/shared/ui/text';

import { HistoryChart, type HistoryMetric } from '../components/history-chart';
import { HistorySessionRow } from '../components/history-session-row';
import { fromDisplayWeight, toDisplayWeight } from '../lib/weight';

const RANGES = ['7', '14', '30', '90'] as const;
type Range = (typeof RANGES)[number];

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

/** Exercise history: top-weight chart and month-grouped sessions (designs 03·C·2H·V5/V5H). */
export function ExerciseHistoryScreen() {
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();
  const { t, i18n } = useTranslation(['workout', 'common']);
  const insets = useSafeAreaInsets();
  const units = useUnits();
  const now = useNow(MINUTE_MS);
  const { data: sessions = [] } = useExerciseHistory(exerciseId);
  const [range, setRange] = useState<Range>('30');
  // undefined = default (latest session open), null = all collapsed.
  const [openId, setOpenId] = useState<string | null>();
  const expanded = openId === undefined ? sessions[0]?.workoutId : openId;

  const since = now - Number(range) * DAY_MS;
  // Weighted exercises chart the top weight, the others most reps or the longest hold.
  const metric: HistoryMetric = hasMeasure(exerciseId, 'weight')
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
    <Screen
      header={<ScreenHeader icon="close" className="gap-3.5 px-5" title={t('history.title')} />}
    >
      <View className="px-5 pt-4">
        <Text className="font-inter-semibold text-[30px] leading-7.5">
          {exerciseName(exerciseId, i18n.language)}
        </Text>
      </View>
      <View className="gap-3 px-5 pt-5 pb-1">
        <HistoryChart data={chartData} metric={metric} format={formatValue} />
        <SegmentedControl
          className="bg-surface"
          value={range}
          onChange={setRange}
          options={RANGES.map((r) => ({
            value: r,
            label: t('history.days', { count: Number(r) }),
          }))}
        />
      </View>
      <SectionList
        sections={monthSections(sessions, new Date(now).getFullYear())}
        keyExtractor={(s) => s.workoutId}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        contentContainerStyle={{
          paddingHorizontal: 8,
          paddingTop: 8,
          paddingBottom: insets.bottom + 30,
        }}
        renderSectionHeader={({ section }) => (
          <Text className="px-3 pt-4.5 pb-1.5 font-inter-semibold text-[11px] leading-3.5 tracking-[1.1px] text-dim">
            {section.title}
          </Text>
        )}
        renderItem={({ item }) => (
          <HistorySessionRow
            session={item}
            latest={item.workoutId === sessions[0]?.workoutId}
            open={item.workoutId === expanded}
            units={units}
            minLabel={t('common:units.minShort')}
            onToggle={() => setOpenId(item.workoutId === expanded ? null : item.workoutId)}
          />
        )}
        ListEmptyComponent={
          <Text tone="subtle" className="px-3 pt-10 text-center text-sm leading-5">
            {t('history.empty')}
          </Text>
        }
      />
    </Screen>
  );
}
