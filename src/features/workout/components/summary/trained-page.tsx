import { Trans, useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { MuscleSplit } from '@/features/muscles/components/muscle-split';
import { groupOfMuscle, type MuscleGroupId } from '@/shared/data/muscle-groups';
import type { MuscleShare } from '@/shared/data/muscles';
import { minutesBetween } from '@/shared/lib/date';
import { formatNumber, type UnitSystem } from '@/shared/lib/format';
import { BodyMaps } from '@/shared/ui/muscle-map';

import type { WorkoutDetail } from '../../data/workout-detail';
import type { WorkoutRecord } from '../../data/workout-records';
import { DoneExercises, doneExercises, doneMuscleSplit } from './done-exercises';
import { type StoryTaps, StoryTapArea } from './story-tap-area';
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
  /** Scrolling started: the user is reading. */
  onRead: () => void;
  taps: StoryTaps;
}

/**
 * Story page 2: how long the workout took and its two main muscle groups, the muscle map and
 * split, then each exercise with the sets that were done. Scrolls.
 */
export function TrainedPage({
  workout,
  records,
  units,
  bottomInset,
  onRead,
  taps,
}: TrainedPageProps) {
  const { t } = useTranslation(['workout', 'exercises']);
  const minutes = minutesBetween(workout.startedAt, workout.finishedAt);
  const done = doneExercises(workout.exercises);
  const { primary, secondary } = doneMuscleSplit(done);
  const [first, second] = mainGroups(primary);
  const groupName = (group: MuscleGroupId | undefined) =>
    group ? t(`exercises:groups.${group}`) : '';

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: bottomInset }}
      onScrollBeginDrag={onRead}
    >
      <StoryTapArea taps={taps}>
        <View className="px-5 pt-8">
          <StoryTitle
            overline={t('summary.story.trainedFor', { minutes: formatNumber(minutes, 0) })}
          >
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
        <DoneExercises done={done} records={records} units={units} />
      </StoryTapArea>
    </ScrollView>
  );
}
