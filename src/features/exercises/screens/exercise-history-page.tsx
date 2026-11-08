import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SectionList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUnitsOrDraft } from '@/features/onboarding/hooks/use-units-or-draft';
import { useImportedHistory } from '@/features/workout-import/hooks/use-imported-history';
import { hasMeasure, isAssisted, isBodyweight, isTimed } from '@/shared/data/exercises';
import { type ExerciseHistoryEntry, useExerciseHistory } from '@/shared/data/workouts';
import { useNow } from '@/shared/hooks/use-now';
import { DAY_MS, MINUTE_MS } from '@/shared/lib/date';
import {
  formatSeconds,
  formatWeight,
  fromDisplayWeight,
  toDisplayWeight,
} from '@/shared/lib/format';
import { type Period, PERIOD_DAYS, PERIODS } from '@/shared/lib/periods';
import { SegmentedControl } from '@/shared/ui/segmented-control';
import { Text } from '@/shared/ui/text';

import { useExerciseId } from '../components/exercise-layout';
import { HistoryChart, type HistoryMetric } from '../components/history-chart';
import { HistorySessionRow } from '../components/history-session-row';
import { monthSections } from '../lib/month-sections';
import { sessionOneRepMaxKg } from '../lib/one-rep-max';

/**
 * Exercise page, "Historie": best-set chart over a period (1W to All) and the sessions by month (designs
 * 03·C·2H·V5/V5H), as a list that only renders the sessions near the screen. Before the first
 * workout the chart and the periods are there all the same, empty, with the hint under the chart.
 */
export function ExerciseHistoryPage() {
  const exerciseId = useExerciseId();
  const { t } = useTranslation(['exercises', 'common']);
  const insets = useSafeAreaInsets();
  // Opened from the import's "Importiert" in onboarding too, before there is a profile.
  const units = useUnitsOrDraft();
  const now = useNow(MINUTE_MS);
  const { data: stored = [], isLoading } = useExerciseHistory(exerciseId);
  // Right after an import, its workouts until the account has them (onboarding, the next sync).
  const imported = useImportedHistory(exerciseId, !stored.length);
  const sessions = stored.length ? stored : imported;
  const [period, setPeriod] = useState<Period>('1m');
  // undefined = default (latest session open), null = all collapsed.
  const [openId, setOpenId] = useState<string | null>();
  const expanded = openId === undefined ? sessions[0]?.workoutId : openId;

  const days = PERIOD_DAYS[period];
  const since = days === null ? -Infinity : now - days * DAY_MS;
  // Bodyweight exercises never done with added weight would chart a flat 0 kg.
  const unweighted =
    isBodyweight(exerciseId) && sessions.every((s) => s.sets.every((set) => !set.weightKg));
  // Weighted exercises chart the top weight (assisted machines the least assistance), the others
  // most reps or the longest hold.
  const metric: HistoryMetric = isAssisted(exerciseId)
    ? 'leastAssistance'
    : hasMeasure(exerciseId, 'weight') && !unweighted
      ? 'topWeight'
      : isTimed(exerciseId)
        ? 'topSeconds'
        : 'topReps';
  const weighted = metric === 'topWeight' || metric === 'leastAssistance';
  // The top set is the best by score; the weight chart wants the heaviest set instead.
  const chartValue = ({ sets, topSet }: ExerciseHistoryEntry) => {
    if (!weighted) return (metric === 'topSeconds' ? topSet.seconds : topSet.reps) ?? 0;
    const weights = sets.map((s) => s.weightKg ?? 0);
    return toDisplayWeight(
      metric === 'topWeight' ? Math.max(...weights) : Math.min(...weights),
      units,
    );
  };
  const formatValue = (value: number) =>
    weighted
      ? formatWeight(fromDisplayWeight(value, units), units)
      : metric === 'topSeconds'
        ? formatSeconds(value)
        : t('common:units.reps', { count: value });
  const inRange = sessions.filter((s) => Date.parse(s.startedAt) >= since).reverse();
  const chartData = inRange.map((s) => ({ time: Date.parse(s.startedAt), value: chartValue(s) }));
  // The estimated 1RM as a second line, for lifts counted in weight and reps; a bodyweight
  // exercise's would include the body and dwarf the added weight charted.
  const withOneRepMax =
    metric === 'topWeight' && !isBodyweight(exerciseId) && hasMeasure(exerciseId, 'reps');
  const oneRepMaxData = withOneRepMax
    ? inRange.flatMap((s) => {
        const kg = sessionOneRepMaxKg(s.sets);
        return kg == null
          ? []
          : [{ time: Date.parse(s.startedAt), value: toDisplayWeight(kg, units) }];
      })
    : undefined;

  return (
    <SectionList
      // The session rows reach 8pt further out than the chart.
      contentContainerClassName="px-2 pt-7"
      contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled={false}
      sections={monthSections(sessions, new Date(now).getFullYear())}
      keyExtractor={(item) => item.workoutId}
      extraData={expanded}
      ListHeaderComponent={
        <View className="gap-3 px-2 pb-3">
          <HistoryChart
            data={chartData}
            metric={metric}
            format={formatValue}
            oneRepMax={oneRepMaxData}
            // No workouts at all: what brings the first; nothing while they load.
            emptyText={sessions.length ? undefined : isLoading ? '' : t('history.empty')}
          />
          <SegmentedControl
            className="bg-surface"
            value={period}
            onChange={setPeriod}
            options={PERIODS.map((p) => ({ value: p, label: t(`common:periods.${p}`) }))}
          />
        </View>
      }
      renderSectionHeader={({ section }) => (
        <Text className="px-2 pt-5.5 pb-1.5 font-inter-semibold text-xs leading-4 tracking-[1.2px] text-subtle">
          {section.title}
        </Text>
      )}
      renderItem={({ item }) => (
        <HistorySessionRow
          exerciseId={exerciseId}
          session={item}
          open={item.workoutId === expanded}
          units={units}
          onToggle={() => setOpenId(item.workoutId === expanded ? null : item.workoutId)}
        />
      )}
    />
  );
}
