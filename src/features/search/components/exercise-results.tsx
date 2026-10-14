import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, View } from 'react-native';

import { AlphabetRail } from '@/features/exercises/components/alphabet-rail';
import { ExerciseIndexRow } from '@/features/exercises/components/exercise-index-row';
import { MuscleGroupFilter } from '@/features/exercises/components/muscle-group-filter';
import {
  type ExerciseOption,
  useExerciseSearch,
} from '@/features/exercises/hooks/use-exercise-search';
import { useLetterIndex } from '@/features/exercises/hooks/use-letter-index';
import type { MuscleGroupId } from '@/features/exercises/lib/muscle-groups';
import { formatSet } from '@/shared/data/exercises';
import { useUnits } from '@/shared/data/profile';
import { formatShortDate, type UnitSystem } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';

import { type ExerciseRecord, useExerciseRecords } from '../data/exercise-records';

interface ResultOption extends ExerciseOption {
  /** Set for the trained exercises listed first. */
  record?: ExerciseRecord;
}

interface RecordSummaryProps {
  exerciseId: string;
  record: ExerciseRecord;
  units: UnitSystem;
}

/** A trained exercise's heaviest set and when it was last done, at the end of its row. */
function RecordSummary({ exerciseId, record, units }: RecordSummaryProps) {
  const { t } = useTranslation('common');
  const value = formatSet(exerciseId, record.best, units);
  const date = formatShortDate(record.lastAt);
  return (
    <View
      className="items-end"
      accessible
      accessibilityLabel={t('search.recordA11y', { value, date })}
    >
      {/* The star marks a personal record, as in the exercise history. */}
      <View className="flex-row items-center gap-1.5">
        <Icon name="star" size={13} color={colors.accent} />
        <Text variant="label">{value}</Text>
      </View>
      <Text variant="caption" tone="subtle" className="mt-0.5 font-inter">
        {date}
      </Text>
    </View>
  );
}

export interface ExerciseResultsProps {
  query: string;
  /** Height of the search bar over the foot of the list, so the last rows clear it. */
  bottomInset: number;
}

/**
 * The exercises matching the search and the muscle chip picked above them: the trained ones
 * first, last done on top, with their heaviest set (★); then the others A–Z with the letter
 * index. A tap opens the exercise on its "Übung" tab.
 */
export function ExerciseResults({ query, bottomInset }: ExerciseResultsProps) {
  const { t } = useTranslation(['exercises', 'common']);
  const units = useUnits();
  const [group, setGroup] = useState<MuscleGroupId | null>(null);
  const options = useExerciseSearch(query, group);
  const { data: records } = useExerciseRecords();

  const trained: ResultOption[] = options
    .filter((o) => records?.has(o.id))
    .map((o) => ({ ...o, record: records?.get(o.id) }))
    .sort((a, b) => (b.record?.lastAt ?? '').localeCompare(a.record?.lastAt ?? ''));
  const rest = options.filter((o) => !records?.has(o.id));
  // The index covers the A–Z part below the trained exercises.
  const { listRef, rows, letters, activeLetter, jump, onViewableItemsChanged, getItemLayout } =
    useLetterIndex<ResultOption>(trained, t('common:search.recent'), rest);
  const bottom = bottomInset + 16;

  return (
    <View className="flex-1">
      <View className="px-4">
        <MuscleGroupFilter value={group} onChange={setGroup} />
      </View>
      <View className="mt-1 flex-1 flex-row px-4">
        <FlatList
          ref={listRef}
          className="flex-1"
          contentContainerClassName="pr-7"
          contentContainerStyle={{ paddingBottom: bottom }}
          data={rows}
          keyExtractor={(r) => r.id}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
          getItemLayout={getItemLayout}
          onViewableItemsChanged={onViewableItemsChanged}
          // About 300 rows: a few screens' worth mounted, not the default 21.
          initialNumToRender={12}
          maxToRenderPerBatch={8}
          windowSize={7}
          ListEmptyComponent={
            <Text variant="label" tone="subtle" className="py-10 text-center font-inter">
              {t('picker.empty')}
            </Text>
          }
          renderItem={({ item }) => (
            <ExerciseIndexRow
              item={item}
              activeScale={0.98}
              accessibilityRole="button"
              onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: item.id } })}
              trailing={
                item.record ? (
                  <RecordSummary exerciseId={item.id} record={item.record} units={units} />
                ) : null
              }
            />
          )}
        />
        {rest.length ? (
          <View className="absolute top-2 right-2" style={{ bottom: bottom + 8 }}>
            <AlphabetRail available={letters} active={activeLetter} onJump={jump} />
          </View>
        ) : null}
      </View>
    </View>
  );
}
