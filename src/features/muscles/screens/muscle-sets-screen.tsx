import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/shared/lib/cn';
import { signOf } from '@/shared/lib/format';
import { MUSCLE_IDS, type MuscleId } from '@/shared/ui/muscle-map';
import { RangeTabs } from '@/shared/ui/range-tabs';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';

import { MuscleExerciseRow } from '../components/muscle-exercise-row';
import { SetsChart } from '../components/sets-chart';
import { useMuscleDetail } from '../hooks/use-muscle-sets';
import { type MuscleExercise, SET_RANGES, type SetRange } from '../lib/muscle-sets';
import { useSetRangeStore } from '../stores/set-range-store';

interface ExerciseGroupProps {
  label: string;
  exercises: MuscleExercise[];
}

/** "PRIMÄR · 3" over the exercises it names. */
function ExerciseGroup({ label, exercises }: ExerciseGroupProps) {
  if (!exercises.length) return null;
  return (
    <View className="gap-1.5">
      <Text variant="overline" tone="subtle" accessibilityRole="header" className="text-[11px]">
        {`${label} · ${exercises.length}`}
      </Text>
      {exercises.map((e) => (
        <MuscleExerciseRow key={e.exerciseId} {...e} />
      ))}
    </View>
  );
}

/**
 * A muscle's sets, pushed from the Sätze tab: the sets in the range against the same days
 * before, per day or week, and the exercises that worked it as primary or secondary muscle.
 * Opens with the tab's range.
 */
export function MuscleSetsScreen() {
  const { t } = useTranslation('muscles');
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ id: string }>();
  const muscle = MUSCLE_IDS.find((m): m is MuscleId => m === params.id) ?? 'chest';
  const [range, setRange] = useState<SetRange>(() => useSetRangeStore.getState().range);
  const { detail, isLoading } = useMuscleDetail(muscle, range);
  const change = detail.total - detail.previous;

  return (
    <Screen header={<ScreenHeader title={t(`names.${muscle}`)} />}>
      <ScrollView
        contentContainerClassName="px-4 pt-5"
        contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
        showsVerticalScrollIndicator={false}
      >
        <Text variant="overline" tone="subtle" className="text-[11px]">
          {t('sets.inDays', { count: range })}
        </Text>
        <Text className="mt-1 font-inter-semibold text-[44px] leading-[52px] tabular-nums">
          {isLoading ? ' ' : detail.total}
        </Text>
        <Text variant="caption" className={cn(change > 0 ? 'text-accent' : 'text-subtle')}>
          {isLoading
            ? ' '
            : t('sets.change', { change: `${signOf(change)}${Math.abs(change)}`, days: range })}
        </Text>
        {/* A new range starts without a picked bar. */}
        <View className="pt-6">
          <SetsChart key={range} buckets={detail.buckets} />
        </View>
        <RangeTabs ranges={SET_RANGES} value={range} onChange={setRange} className="mt-6" />
        <View className="gap-7 pt-8">
          {!isLoading && !detail.primary.length && !detail.secondary.length ? (
            <Text tone="subtle" className="text-sm">
              {t('sets.empty')}
            </Text>
          ) : null}
          <ExerciseGroup label={t('breakdown.primary')} exercises={detail.primary} />
          <ExerciseGroup label={t('breakdown.secondary')} exercises={detail.secondary} />
        </View>
      </ScrollView>
    </Screen>
  );
}
