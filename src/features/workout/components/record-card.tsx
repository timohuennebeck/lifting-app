import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { ExerciseThumb } from '@/features/exercises/components/exercise-thumb';
import type { ExerciseId } from '@/shared/data/exercises';
import { formatWeight, type UnitSystem } from '@/shared/lib/format';
import { Text } from '@/shared/ui/text';

import type { WorkoutRecord } from '../data/workout-records';

export interface RecordCardProps {
  record: WorkoutRecord;
  units: UnitSystem;
}

/** New personal record with the previous best (design 03s·C). */
export function RecordCard({ record, units }: RecordCardProps) {
  const { t } = useTranslation(['workout', 'exercises']);
  const name = t(`exercises:${record.exerciseId as ExerciseId}.name`);
  const value = (kg: number, reps: number) => `${formatWeight(kg, units)} × ${reps}`;
  return (
    <View className="flex-row items-center gap-3.5 py-1.5">
      <ExerciseThumb
        exerciseId={record.exerciseId}
        name={name}
        className="h-[86px] w-16 rounded-lg"
      />
      <View className="flex-1 gap-2">
        <Text tone="accent" className="font-inter-bold text-xs leading-4 tracking-[1.4px]">
          {t('summary.newRecord')}
        </Text>
        <Text variant="label" className="leading-5">
          {name}
        </Text>
        <View className="flex-row flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
          <Text variant="headline">{value(record.weightKg, record.reps)}</Text>
          <Text tone="subtle" className="text-sm leading-[18px]">
            {t('summary.previously', {
              value: value(record.previous.weightKg, record.previous.reps),
            })}
          </Text>
        </View>
      </View>
    </View>
  );
}
