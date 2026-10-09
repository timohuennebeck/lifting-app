import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { mainShares, muscleShares } from '@/shared/data/muscles';
import { useUnits } from '@/shared/data/profile';
import { useWorkout } from '@/shared/data/workouts';
import { minutesBetween } from '@/shared/lib/date';
import { formatNumber, kgToLb, weightUnit } from '@/shared/lib/format';
import { BottomFade } from '@/shared/ui/bottom-fade';
import { Button } from '@/shared/ui/button';
import { Gradient, type GradientStop } from '@/shared/ui/gradient';
import { MuscleMap } from '@/shared/ui/muscle-map';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';

import { RecordCard } from '../components/record-card';
import { VolumeComparison } from '../components/volume-comparison';
import { useWorkoutRecords } from '../data/workout-records';

/** Fades the muscle maps into the background (CSS mask in the design). */
const MAPS_FADE: GradientStop[] = [
  [0.6, 0],
  [1, 1],
];

interface StatProps {
  value: string;
  unit: string;
}

function Stat({ value, unit }: StatProps) {
  return (
    <View className="flex-1 flex-row items-baseline justify-center gap-1">
      <Text className="font-inter-semibold text-2xl leading-6">{value}</Text>
      <Text variant="caption" tone="subtle" className="font-inter">
        {unit}
      </Text>
    </View>
  );
}

/** Workout done (design 03s·C): trained muscles, totals, records and a fun comparison. */
export function WorkoutSummaryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation(['workout', 'common', 'muscles']);
  const insets = useSafeAreaInsets();
  const units = useUnits();
  const { data: workout } = useWorkout(id);
  const { data: records = [] } = useWorkoutRecords(id);

  const close = () => (router.canDismiss() ? router.dismissAll() : router.replace('/'));

  const done = (workout?.exercises ?? []).map((e) => ({
    exerciseId: e.exerciseId,
    sets: e.sets.filter((s) => s.completedAt),
  }));
  const setCount = done.reduce((sum, e) => sum + e.sets.length, 0);
  const volumeKg = done.reduce(
    (sum, e) => sum + e.sets.reduce((v, s) => v + (s.weightKg ?? 0) * (s.reps ?? 0), 0),
    0,
  );
  const shares = muscleShares(done.map((e) => ({ exerciseId: e.exerciseId, sets: e.sets.length })));
  const main = mainShares(shares);
  const trained = main.map((s) => s.muscle);
  const chips = main.slice(0, 6);
  const minutes = workout ? minutesBetween(workout.startedAt, workout.finishedAt) : 0;
  const volume = units === 'imperial' ? kgToLb(volumeKg) : volumeKg;

  return (
    <Screen
      header={<ScreenHeader icon="chevron-left" onBack={close} title={workout?.name ?? ''} />}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 + insets.bottom }}
      >
        <View className="-mt-1.5 pt-81">
          <View className="absolute inset-x-0 top-0 h-107.5 flex-row justify-center gap-4 px-4.5">
            <View className="h-full w-40">
              <MuscleMap view="front" selected={trained} />
            </View>
            <View className="h-full w-40">
              <MuscleMap view="back" selected={trained} />
            </View>
            <Gradient from="top" stops={MAPS_FADE} />
          </View>
          <View className="mx-5 gap-2">
            <Text className="font-inter-semibold text-[34px] leading-8.5">
              {t('summary.title')}
            </Text>
            <Text variant="body" className="text-base text-fg">
              {`${workout?.name ?? ''} · ${
                records.length
                  ? t('summary.records', { count: records.length })
                  : t('summary.noRecords')
              }`}
            </Text>
            <View className="flex-row flex-wrap gap-1.5 pt-1.5">
              {chips.map((c) => (
                <View
                  key={c.muscle}
                  className="h-7.5 flex-row items-center gap-1.75 rounded-full bg-chip px-3"
                >
                  <View className="size-1.75 rounded-full bg-accent" />
                  <Text variant="caption">{t(`muscles:names.${c.muscle}`)}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        <View className="flex-row px-5 pt-6.5">
          {volumeKg > 0 ? (
            <Stat
              value={formatNumber(Math.round(volume), 0)}
              unit={t(`common:units.${weightUnit(units)}`)}
            />
          ) : null}
          <Stat value={formatNumber(minutes, 0)} unit={t('common:units.minShort')} />
          <Stat value={formatNumber(setCount, 0)} unit={t('summary.sets', { count: setCount })} />
        </View>
        {records.length ? (
          <View className="gap-2.5 px-4 pt-7">
            {records.map((r) => (
              <RecordCard key={r.exerciseId} record={r} units={units} />
            ))}
          </View>
        ) : null}
        {volumeKg > 0 ? (
          <View className="px-4 pt-7">
            <VolumeComparison volumeKg={volumeKg} units={units} />
          </View>
        ) : null}
      </ScrollView>
      <BottomFade>
        <Button label={t('common:actions.done')} onPress={close} />
      </BottomFade>
    </Screen>
  );
}
