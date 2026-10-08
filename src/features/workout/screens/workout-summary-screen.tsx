import { router, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { useTranslation } from 'react-i18next';

import { muscleShares } from '@/shared/data/muscles';
import { useUnits } from '@/shared/data/profile';
import { useWorkout } from '@/shared/data/workouts';
import { minutesBetween } from '@/shared/lib/date';
import { formatNumber, kgToLb, weightUnit } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { BottomFade } from '@/shared/ui/bottom-fade';
import { Button } from '@/shared/ui/button';
import { MuscleMap } from '@/shared/ui/muscle-map';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';

import { RecordCard } from '../components/record-card';
import { VolumeComparison } from '../components/volume-comparison';
import { useWorkoutRecords } from '../data/workout-records';

/** Fades the muscle maps into the background (CSS mask in the design). */
function Fade() {
  return (
    <Svg width="100%" height="100%" style={StyleSheet.absoluteFill} pointerEvents="none">
      <Defs>
        <LinearGradient id="fade-down" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0.6" stopColor={colors.bg} stopOpacity={0} />
          <Stop offset="1" stopColor={colors.bg} stopOpacity={1} />
        </LinearGradient>
      </Defs>
      <Rect width="100%" height="100%" fill="url(#fade-down)" />
    </Svg>
  );
}

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
  const trained = shares.map((s) => s.muscle);
  const chips = shares.filter((s) => s.percent >= 8).slice(0, 6);
  const minutes = workout ? minutesBetween(workout.startedAt, workout.finishedAt) : 0;
  const volume = units === 'imperial' ? kgToLb(volumeKg) : volumeKg;

  return (
    <Screen header={<ScreenHeader icon="close" onBack={close} title={workout?.name ?? ''} />}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 130 + insets.bottom }}
      >
        <View className="-mt-1.5 pt-[324px]">
          <View className="absolute inset-x-0 top-0 h-[430px] flex-row justify-center gap-4 px-[18px]">
            <View className="h-full w-40">
              <MuscleMap view="front" selected={trained} />
            </View>
            <View className="h-full w-40">
              <MuscleMap view="back" selected={trained} />
            </View>
            <Fade />
          </View>
          <View className="mx-5 gap-2">
            <Text className="font-inter-semibold text-[34px] leading-[34px]">
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
                  className="h-[30px] flex-row items-center gap-[7px] rounded-full bg-chip px-3"
                >
                  <View className="size-[7px] rounded-full bg-accent" />
                  <Text variant="caption">{t(`muscles:names.${c.muscle}`)}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>
        <View className="flex-row px-5 pt-[26px]">
          <Stat
            value={formatNumber(Math.round(volume), 0)}
            unit={t(`common:units.${weightUnit(units)}`)}
          />
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
