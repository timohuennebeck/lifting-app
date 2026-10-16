import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ExerciseIndexList } from '@/features/exercises/components/exercise-index-list';
import { ExerciseIndexRow } from '@/features/exercises/components/exercise-index-row';
import type { ExerciseOption } from '@/features/exercises/hooks/use-exercise-search';
import { groupOfMuscle } from '@/features/exercises/lib/muscle-groups';
import { levelShare } from '@/features/muscles/lib/levels';
import { formatSet, useCatalogStore } from '@/shared/data/exercises';
import { useUnits } from '@/shared/data/profile';
import { formatShortDate, type UnitSystem } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import type { MuscleId } from '@/shared/ui/muscle-map';
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
  /** Opened for a muscle (from a Level card): the exercises making its level first. */
  muscle?: MuscleId | null;
}

/**
 * The exercises matching the search and the muscle chip picked above them: the trained ones
 * first, last done on top, with their heaviest set (★); then the others A–Z with the letter
 * index. For a muscle, its exercises come first instead, those working it most on top. A tap
 * opens the exercise on its "Übung" tab.
 */
export function ExerciseResults({ query, bottomInset, muscle }: ExerciseResultsProps) {
  const { t } = useTranslation(['common', 'muscles']);
  const units = useUnits();
  const { data: records } = useExerciseRecords();
  const rows = useCatalogStore((s) => s.rows);
  const withRecord = (o: ExerciseOption): ResultOption => ({ ...o, record: records?.get(o.id) });

  return (
    <ExerciseIndexList<ResultOption>
      query={query}
      bottomInset={bottomInset}
      initialGroup={muscle ? groupOfMuscle(muscle) : null}
      split={(options) => {
        if (muscle) {
          const share = (o: ExerciseOption) => (rows[o.id] ? levelShare(rows[o.id], muscle) : 0);
          return {
            first: options
              .filter((o) => share(o) > 0)
              .sort((a, b) => share(b) - share(a))
              .map(withRecord),
            title: t('search.forMuscle', { muscle: t(`muscles:names.${muscle}`) }),
            rest: options.filter((o) => share(o) === 0),
          };
        }
        return {
          first: options
            .filter((o) => records?.has(o.id))
            .map(withRecord)
            .sort((a, b) => (b.record?.lastAt ?? '').localeCompare(a.record?.lastAt ?? '')),
          title: t('search.recent'),
          rest: options.filter((o) => !records?.has(o.id)),
        };
      }}
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
