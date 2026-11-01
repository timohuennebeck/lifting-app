import { Trans, useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { MuscleSplit } from '@/features/muscles/components/muscle-split';
import { groupOfMuscle, type MuscleGroupId, workoutMuscleSplit } from '@/shared/data/muscle-groups';
import type { MuscleShare } from '@/shared/data/muscles';
import { minutesBetween } from '@/shared/lib/date';
import { formatNumber, type UnitSystem } from '@/shared/lib/format';
import { BodyMaps } from '@/shared/ui/muscle-map';
import { Text } from '@/shared/ui/text';

import type { WorkoutDetail } from '../../data/workout-detail';
import type { WorkoutRecord } from '../../data/workout-records';
import { DoneExerciseCard } from '../done-exercise-card';
import { StoryTitle, storyAccent } from './story-title';

/** Muscle groups of the primary muscles, most worked first (their shares added up per group). */
function mainGroups(primary: MuscleShare[]): MuscleGroupId[] {
  const sums = new Map<MuscleGroupId, number>();
  for (const share of primary) {
    const group = groupOfMuscle(share.muscle);
    sums.set(group, (sums.get(group) ?? 0) + share.percent);
  }
  return [...sums].sort((a, b) => b[1] - a[1]).map(([group]) => group);
}

export interface TrainedPageProps {
  workout: WorkoutDetail;
  records: WorkoutRecord[];
  units: UnitSystem;
  bottomInset: number;
}

/**
 * Story page 2: how long the workout took and its two main muscle groups, the muscle map and
 * split, then each exercise with the sets that were done. Scrolls.
 */
export function TrainedPage({ workout, records, units, bottomInset }: TrainedPageProps) {
  const { t } = useTranslation(['workout', 'training', 'exercises']);
  const minutes = minutesBetween(workout.startedAt, workout.finishedAt);
  // Only the sets that were done count.
  const done = workout.exercises
    .map((e) => ({ ...e, sets: e.sets.filter((s) => s.completedAt) }))
    .filter((e) => e.sets.length);
  const { primary, secondary } = workoutMuscleSplit(
    done.map((e) => ({ exerciseId: e.exerciseId, sets: e.sets.length })),
  );
  const [first, second] = mainGroups(primary);
  const groupName = (group: MuscleGroupId | undefined) =>
    group ? t(`exercises:groups.${group}`) : '';

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: bottomInset }}
    >
      <View className="px-5 pt-8">
        <StoryTitle overline={t('summary.story.trainedFor', { minutes: formatNumber(minutes, 0) })}>
          {first ? (
            <Trans
              t={t}
              i18nKey={second ? 'summary.story.groupsTwo' : 'summary.story.groupsOne'}
              values={{ first: groupName(first), second: groupName(second) }}
              components={{ accent: storyAccent }}
            />
          ) : (
            t('summary.title', { name: workout.name })
          )}
        </StoryTitle>
      </View>
      <BodyMaps
        selected={primary.map((s) => s.muscle)}
        secondary={secondary.map((s) => s.muscle)}
      />
      <MuscleSplit primary={primary} secondary={secondary} className="px-4 pt-6" />
      {done.length ? (
        <View className="px-5 pt-9">
          <Text variant="headline">{t('training:overview.exercises', { count: done.length })}</Text>
          <View className="pt-1">
            {done.map((e) => (
              <DoneExerciseCard
                key={e.id}
                exerciseId={e.exerciseId}
                sets={e.sets}
                units={units}
                recordSetId={records.find((r) => e.sets.some((s) => s.id === r.setId))?.setId}
              />
            ))}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}
