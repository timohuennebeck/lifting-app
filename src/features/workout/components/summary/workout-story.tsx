import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUnits } from '@/shared/data/profile';
import { volumeKg } from '@/shared/data/workouts';
import { useHardwareBack } from '@/shared/hooks/use-hardware-back';
import { haptics } from '@/shared/lib/haptics';
import { BottomFade } from '@/shared/ui/bottom-fade';
import { Button } from '@/shared/ui/button';

import { useWorkout } from '../../data/workout-detail';
import { useWorkoutRecords } from '../../data/workout-records';
import { liftObjectFor } from '../../lib/lift-comparison';
import { FinishConfetti } from '../finish-confetti';
import { LiftedPage } from './lifted-page';
import { RecordsPage } from './records-page';
import { StoryHeader } from './story-header';
import { TrainedPage } from './trained-page';

type StoryPage = 'lifted' | 'trained' | 'records';

/** A horizontal swipe this far turns the page. */
const SWIPE = 60;

export interface WorkoutStoryProps {
  workoutId: string;
}

/**
 * The story after finishing a workout: the weight it moved (as an object it outweighs, left out
 * below the lightest), what it trained with its exercises, then its new records, if any.
 * "Continue" or a swipe left goes on, a swipe right (or Android's back) goes back; the X, or
 * "Done" on the last page, closes it. Confetti as it opens.
 */
export function WorkoutStory({ workoutId }: WorkoutStoryProps) {
  const { t } = useTranslation(['workout', 'common']);
  const insets = useSafeAreaInsets();
  const units = useUnits();
  const { data: workout } = useWorkout(workoutId);
  const { data: records } = useWorkoutRecords(workoutId);
  const [page, setPage] = useState(0);

  const close = () => {
    if (router.canDismiss()) router.dismissAll();
    else router.replace('/');
  };

  const lifted = (workout?.exercises ?? []).reduce(
    (sum, e) =>
      sum +
      volumeKg(
        e.exerciseId,
        e.sets.filter((s) => s.completedAt),
      ),
    0,
  );
  const object = liftObjectFor(lifted);
  const pages: StoryPage[] = [];
  if (object) pages.push('lifted');
  pages.push('trained');
  if (records?.length) pages.push('records');
  const index = Math.min(page, pages.length - 1);
  const shown = pages[index];
  const last = index === pages.length - 1;

  const go = (to: number) => {
    if (to < 0 || to >= pages.length) return;
    haptics.select();
    setPage(to);
  };
  useHardwareBack(() => go(index - 1), index > 0);
  const swipe = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetX([-20, 20])
    .failOffsetY([-12, 12])
    .onEnd((e) => {
      if (e.translationX < -SWIPE) go(index + 1);
      else if (e.translationX > SWIPE) go(index - 1);
    });

  // The pages come with both queries, so the count and the first page don't change under it.
  if (!workout || !records) return <View className="flex-1 bg-bg" />;
  const bottomInset = 130 + insets.bottom;
  const liftedObject = shown === 'lifted' ? object : null;

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <StoryHeader name={workout.name} page={index} pages={pages.length} onClose={close} />
      <GestureDetector gesture={swipe}>
        <Animated.View key={shown} entering={FadeIn.duration(250)} className="flex-1">
          {liftedObject ? (
            <LiftedPage kg={lifted} object={liftedObject} units={units} bottomInset={bottomInset} />
          ) : null}
          {shown === 'trained' ? (
            <TrainedPage
              workout={workout}
              records={records}
              units={units}
              bottomInset={bottomInset}
            />
          ) : null}
          {shown === 'records' ? (
            <RecordsPage records={records} units={units} bottomInset={bottomInset} />
          ) : null}
        </Animated.View>
      </GestureDetector>
      <BottomFade>
        <Button
          label={last ? t('common:actions.done') : t('summary.story.next')}
          onPress={() => (last ? close() : go(index + 1))}
        />
      </BottomFade>
      {/* Over the header too, so it covers the whole screen. */}
      <FinishConfetti />
    </View>
  );
}
