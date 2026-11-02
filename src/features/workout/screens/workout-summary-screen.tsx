import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MuscleSplit } from '@/features/muscles/components/muscle-split';
import { useUnits } from '@/shared/data/profile';
import { attempt } from '@/shared/lib/async';
import { minutesBetween } from '@/shared/lib/date';
import { formatNumber, formatShortDate } from '@/shared/lib/format';
import { haptics } from '@/shared/lib/haptics';
import { BottomFade } from '@/shared/ui/bottom-fade';
import { Button } from '@/shared/ui/button';
import { DeleteSheet } from '@/shared/ui/delete-sheet';
import { IconButton } from '@/shared/ui/icon-button';
import { MuscleMap } from '@/shared/ui/muscle-map';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';

import { RecordCard } from '../components/record-card';
import {
  DoneExercises,
  doneExercises,
  doneMuscleSplit,
} from '../components/summary/done-exercises';
import { WorkoutStory } from '../components/summary/workout-story';
import { useWorkout } from '../data/workout-detail';
import { discardWorkout } from '../data/workout-mutations';
import { useWorkoutRecords } from '../data/workout-records';

/**
 * A finished workout. Just finished (`?finished=1`) it is the story (`WorkoutStory`); opened from
 * the history, a page that goes back like any other.
 */
export function WorkoutSummaryScreen() {
  const { id, finished } = useLocalSearchParams<{ id: string; finished?: string }>();
  return finished === '1' ? <WorkoutStory workoutId={id} /> : <WorkoutSummaryPage id={id} />;
}

interface WorkoutSummaryPageProps {
  id: string;
}

/**
 * A workout from the history: its name, time and records, the muscles it worked, the exercises
 * with the sets that were done, then each new record. Its "⋯" deletes it.
 */
function WorkoutSummaryPage({ id }: WorkoutSummaryPageProps) {
  const { t } = useTranslation(['workout', 'common']);
  const insets = useSafeAreaInsets();
  const units = useUnits();
  const { data: workout } = useWorkout(id);
  const { data: records = [] } = useWorkoutRecords(id);
  const [menuOpen, setMenuOpen] = useState(false);

  const close = () => router.back();

  const name = workout?.name ?? '';
  const minutes = workout ? minutesBetween(workout.startedAt, workout.finishedAt) : 0;
  const date = workout ? formatShortDate(workout.startedAt) : '';

  // The page goes first, so it never shows the workout half deleted.
  const remove = async () => {
    setMenuOpen(false);
    close();
    if (await attempt('Deleting the workout failed', () => discardWorkout(id))) haptics.success();
  };
  // Only the sets that were done count.
  const done = doneExercises(workout?.exercises ?? []);
  const { primary, secondary } = doneMuscleSplit(done);
  const primaryIds = primary.map((s) => s.muscle);
  const secondaryIds = secondary.map((s) => s.muscle);

  return (
    <View className="flex-1">
      <Screen
        header={
          <ScreenHeader
            icon="chevron-left"
            onBack={close}
            title={name}
            action={
              <IconButton
                icon="more"
                iconSize={18}
                accessibilityLabel={t('summary.more')}
                disabled={!workout}
                onPress={() => setMenuOpen(true)}
              />
            }
          />
        }
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 130 + insets.bottom }}
        >
          <View className="gap-1.5 px-5 pt-3">
            <Text className="font-inter-semibold text-[32px] leading-9.5">
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
          <DoneExercises done={done} records={records} units={units} />
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
      <DeleteSheet
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        title={name}
        subtitle={`${date} · ${formatNumber(minutes, 0)} ${t('common:units.minShort')}`}
        option={t('summary.delete')}
        description={t('summary.deleteHint', { name, date })}
        onDelete={remove}
      />
    </View>
  );
}
