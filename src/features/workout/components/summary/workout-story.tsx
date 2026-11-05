import { router, useIsFocused } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useWindowDimensions, View } from 'react-native';
import Animated, { FadeIn, useSharedValue } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useUnits } from '@/shared/data/profile';
import { useWorkoutStats, volumeKg } from '@/shared/data/workouts';
import { useHardwareBack } from '@/shared/hooks/use-hardware-back';
import { haptics } from '@/shared/lib/haptics';
import { BottomFade } from '@/shared/ui/bottom-fade';
import { Button } from '@/shared/ui/button';

import { useWorkout } from '../../data/workout-detail';
import { useWorkoutRecords } from '../../data/workout-records';
import { useScreenReader } from '../../hooks/use-screen-reader';
import { useStoryTimer } from '../../hooks/use-story-timer';
import { liftObjectFor } from '../../lib/lift-comparison';
import { requestReviewAfterWorkout } from '../../lib/review-prompt';
import { FinishConfetti } from '../finish-confetti';
import { LiftedPage } from './lifted-page';
import { RecordsPage } from './records-page';
import { StoryHeader } from './story-header';
import type { StoryTaps } from './story-tap-area';
import { TrainedPage } from './trained-page';

type StoryPage = 'lifted' | 'trained' | 'records';

/** How long each page shows before the next comes; the exercises get longer. */
const PAGE_MS: Record<StoryPage, number> = { lifted: 5000, trained: 8000, records: 5000 };
/** A tap on this share of the width from the left goes back, elsewhere on. */
const BACK_ZONE = 0.3;

export interface WorkoutStoryProps {
  workoutId: string;
}

/**
 * The story after finishing a workout, like Instagram's: the weight it moved (as an object it
 * outweighs, left out below the lightest), what it trained with its exercises, then its new
 * records, if any. Each page goes on by itself when its bar is full (the last one stays); a tap
 * on the right or "Continue" goes on, a tap on the left or Android's back goes back. A finger
 * held on the page, scrolling it, another screen or a screen reader holds the time. The X, or
 * "Done" on the last page, closes it, which may ask for a store review. Confetti as it opens.
 */
export function WorkoutStory({ workoutId }: WorkoutStoryProps) {
  const { t } = useTranslation(['workout', 'common']);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const focused = useIsFocused();
  const screenReader = useScreenReader();
  const units = useUnits();
  const { data: workout } = useWorkout(workoutId);
  const { data: records } = useWorkoutRecords(workoutId);
  const { data: stats } = useWorkoutStats();
  const [page, setPage] = useState(0);
  // A finger held on the page, and the page scrolled to read (it then waits for a tap).
  const [held, setHeld] = useState(false);
  const [read, setRead] = useState<StoryPage | null>(null);
  // How far the shown page is through its time, 0–1 (its bar).
  const progress = useSharedValue(0);

  const close = () => {
    if (router.canDismiss()) router.dismissAll();
    else router.replace('/');
    if (stats) {
      requestReviewAfterWorkout({
        workoutCount: stats.count,
        firstStartedAt: stats.first,
        recordCount: records?.length ?? 0,
      });
    }
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

  const go = (to: number, tick = true) => {
    if (to < 0 || to >= pages.length) return;
    if (tick) haptics.select();
    // Empty before the next page's bar is drawn, so it never shows the last page's for a frame.
    progress.set(0);
    setPage(to);
  };
  const running = !!workout && !!records && focused && !screenReader && !held && read !== shown;
  useStoryTimer(progress, shown, PAGE_MS[shown], running, () => go(index + 1, false));
  useHardwareBack(() => go(index - 1), index > 0);

  // The pages come with both queries, so the count and the first page don't change under it.
  if (!workout || !records) return <View className="flex-1 bg-bg" />;
  const bottomInset = 130 + insets.bottom;
  const liftedObject = shown === 'lifted' ? object : null;
  const taps: StoryTaps = {
    delayLongPress: 250,
    onLongPress: () => setHeld(true),
    onPressOut: () => setHeld(false),
    onPress: (e) => go(e.nativeEvent.pageX < width * BACK_ZONE ? index - 1 : index + 1),
  };

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <StoryHeader
        name={workout.name}
        page={index}
        pages={pages.length}
        progress={progress}
        onClose={close}
      />
      <Animated.View key={shown} entering={FadeIn.duration(250)} className="flex-1">
        {liftedObject ? (
          <LiftedPage
            kg={lifted}
            object={liftedObject}
            units={units}
            bottomInset={bottomInset}
            taps={taps}
          />
        ) : null}
        {shown === 'trained' ? (
          <TrainedPage
            workout={workout}
            records={records}
            units={units}
            bottomInset={bottomInset}
            onRead={() => setRead('trained')}
            taps={taps}
          />
        ) : null}
        {shown === 'records' ? (
          <RecordsPage
            records={records}
            units={units}
            bottomInset={bottomInset}
            onRead={() => setRead('records')}
            taps={taps}
          />
        ) : null}
      </Animated.View>
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
