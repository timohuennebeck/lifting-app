import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { workoutMuscleSplit } from '@/features/exercises/lib/muscle-groups';
import { MuscleSplit } from '@/features/muscles/components/muscle-split';
import { useUnits } from '@/shared/data/profile';
import { useWorkout } from '@/shared/data/workouts';
import { minutesBetween } from '@/shared/lib/date';
import { formatNumber } from '@/shared/lib/format';
import { BottomFade } from '@/shared/ui/bottom-fade';
import { Button } from '@/shared/ui/button';
import { MuscleMap } from '@/shared/ui/muscle-map';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';

import { RecordCard } from '../components/record-card';
import { useWorkoutRecords } from '../data/workout-records';

/** Workout done: its name, time and records, the muscles it worked, then each new record. */
export function WorkoutSummaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation(['workout', 'common']);
  const insets = useSafeAreaInsets();
  const units = useUnits();
  const { data: workout } = useWorkout(id);
  const { data: records = [] } = useWorkoutRecords(id);

  const close = () => (router.canDismiss() ? router.dismissAll() : router.replace('/'));

  const name = workout?.name ?? '';
  const minutes = workout ? minutesBetween(workout.startedAt, workout.finishedAt) : 0;
  // Only the sets that were done count.
  const { primary, secondary } = workoutMuscleSplit(
    (workout?.exercises ?? []).map((e) => ({
      exerciseId: e.exerciseId,
      sets: e.sets.filter((s) => s.completedAt).length,
    })),
  );
  const primaryIds = primary.map((s) => s.muscle);
  const secondaryIds = secondary.map((s) => s.muscle);

  return (
    <Screen header={<ScreenHeader icon="close" onBack={close} title={name} />}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 + insets.bottom }}
      >
        <View className="gap-1.5 px-5 pt-3">
          <Text className="font-inter-semibold text-[32px] leading-9">
            {t('summary.title', { name })}
          </Text>
          <Text tone="secondary" className="font-inter text-[15px] leading-5">
            {`${formatNumber(minutes, 0)} ${t('common:units.minShort')} · ${
              records.length
                ? t('summary.records', { count: records.length })
                : t('summary.noRecords')
            }`}
          </Text>
        </View>
        <View
          className="mt-8 flex-row justify-center gap-2"
          accessibilityElementsHidden
          importantForAccessibility="no-hide-descendants"
        >
          {(['front', 'back'] as const).map((view) => (
            <MuscleMap
              key={view}
              view={view}
              selected={primaryIds}
              secondary={secondaryIds}
              width={135}
              height={245}
            />
          ))}
        </View>
        <MuscleSplit primary={primary} secondary={secondary} className="px-4 pt-6" />
        {records.length ? (
          <View className="gap-2.5 px-4 pt-9">
            {records.map((r) => (
              <RecordCard key={r.exerciseId} record={r} units={units} />
            ))}
          </View>
        ) : null}
      </ScrollView>
      <BottomFade>
        <Button label={t('common:actions.done')} onPress={close} />
      </BottomFade>
    </Screen>
  );
}
