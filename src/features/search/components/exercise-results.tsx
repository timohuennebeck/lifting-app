import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ExerciseIndexList } from '@/features/exercises/components/exercise-index-list';
import { ExerciseIndexRow } from '@/features/exercises/components/exercise-index-row';
import type { ExerciseOption } from '@/features/exercises/hooks/use-exercise-search';
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
  const { t } = useTranslation('common');
  const units = useUnits();
  const { data: records } = useExerciseRecords();

  return (
    <ExerciseIndexList<ResultOption>
      query={query}
      bottomInset={bottomInset}
      split={(options) => ({
        first: options
          .filter((o) => records?.has(o.id))
          .map((o) => ({ ...o, record: records?.get(o.id) }))
          .sort((a, b) => (b.record?.lastAt ?? '').localeCompare(a.record?.lastAt ?? '')),
        title: t('search.recent'),
        rest: options.filter((o) => !records?.has(o.id)),
      })}
      renderRow={(item) => (
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
  );
}
