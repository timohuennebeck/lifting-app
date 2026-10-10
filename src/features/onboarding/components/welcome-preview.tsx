import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { ExerciseThumb } from '@/features/exercises/components/exercise-thumb';
import { workoutMuscleSplit } from '@/features/exercises/lib/muscle-groups';
import { exerciseName, getExercise } from '@/shared/data/exercises';
import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import type { MuscleId } from '@/shared/ui/muscle-map/body-paths';
import { MuscleTile } from '@/shared/ui/muscle-map/muscle-tile';
import { Text } from '@/shared/ui/text';

/** The mockup renders a full 390×844 screen and scales it into a 180×390 phone. */
const SCALE = 0.4615;
const SCROLL = 230;
const RIR_COLORS: Record<number, string> = { 3: '#EEA53A', 2: '#EEA53A', 1: '#E2483D' };

const EXERCISES = [
  { id: 'close-grip-bench-press', reps: '7–9', rir: [3, 2, 1] },
  { id: 'dumbbell-shoulder-press', reps: '7–9', rir: [3, 2, 1] },
  { id: 'incline-dumbbell-press', reps: '9–11', rir: [3, 2] },
] as const;

interface PreviewExerciseProps {
  id: (typeof EXERCISES)[number]['id'];
  reps: string;
  rir: readonly number[];
  last: boolean;
}

function PreviewExercise({ id, reps, rir, last }: PreviewExerciseProps) {
  const { t: tm, i18n } = useTranslation('muscles');
  const exercise = getExercise(id);
  const muscles = Object.entries(exercise?.muscles ?? {}) as [MuscleId, number][];
  return (
    <View className={cn('flex-row gap-3.5 py-4.5', !last && 'border-b border-raised')}>
      <ExerciseThumb
        exerciseId={id}
        name={exerciseName(id, i18n.language)}
        className="h-21.5 w-16"
      />
      <View className="min-w-0 flex-1 gap-2.5">
        <View className="flex-row items-start gap-2.5">
          <Text variant="label" className="flex-1 pt-1.25 text-base leading-5">
            {exerciseName(id, i18n.language)}
          </Text>
          <View className="size-8 items-center justify-center">
            <Icon name="more" size={16} color={colors.fgSoft} />
          </View>
        </View>
        <View className="gap-1.5">
          {rir.map((value, i) => (
            <View key={i} className="flex-row items-center gap-2.5">
              <View className="size-6 items-center justify-center rounded-full bg-raised">
                <Text variant="caption" className="text-xs">
                  {i + 1}
                </Text>
              </View>
              <Text variant="paragraph" className="flex-1 text-sm text-fg-soft">
                {reps}
              </Text>
              <View
                className="size-5.5 items-center justify-center rounded-full"
                style={{ backgroundColor: RIR_COLORS[value] }}
              >
                <Text variant="caption" tone="onAccent" className="font-inter-bold text-xs">
                  {value}
                </Text>
              </View>
            </View>
          ))}
        </View>
        <View className="flex-row flex-wrap gap-1.5">
          {muscles.map(([muscle, share]) => (
            <View
              key={muscle}
              className={cn(
                'h-7 justify-center rounded-full px-2.5',
                share >= 0.25 ? 'bg-raised' : 'border border-[#333]',
              )}
            >
              <Text
                variant="caption"
                tone={share >= 0.25 ? 'default' : 'muted'}
                className={cn('text-xs', share < 0.25 && 'font-inter')}
              >
                {tm(`names.${muscle}`)}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

export interface WelcomePreviewProps {
  /** Runs the scroll loop; off while the rest of the flow covers the welcome screen. */
  active: boolean;
}

/** Auto-scrolling miniature of the training overview shown on the welcome screen. */
export function WelcomePreview({ active }: WelcomePreviewProps) {
  const { t } = useTranslation('onboarding');
  const offset = useSharedValue(0);
  // The muscles of the exercises shown, split like on the real workout page.
  const { primary, secondary } = workoutMuscleSplit(
    EXERCISES.map((e) => ({ exerciseId: e.id, sets: e.rir.length })),
  );

  // Hold, scroll down, hold, scroll back – a 14 s loop like the prototype.
  useEffect(() => {
    if (!active) return;
    const move = (to: number) =>
      withTiming(to, { duration: 4480, easing: Easing.inOut(Easing.ease) });
    offset.set(
      withRepeat(
        withSequence(
          withDelay(1960, move(-SCROLL)),
          withDelay(2240, move(0)),
          withDelay(840, withTiming(0, { duration: 0 })),
        ),
        -1,
      ),
    );
    return () => cancelAnimation(offset);
  }, [active, offset]);
  const scrollStyle = useAnimatedStyle(() => ({ transform: [{ translateY: offset.get() }] }));

  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      className="h-101 w-48.5 rounded-4xl bg-[#111] p-1.75"
      style={{ boxShadow: `inset 0 0 0 1.5px ${colors.track}, 0 30px 60px rgba(0,0,0,0.7)` }}
    >
      <View className="h-97.5 w-45 overflow-hidden rounded-[25px] bg-bg">
        <View
          className="h-211 w-97.5 pt-13.5"
          style={{ transform: [{ scale: SCALE }], transformOrigin: '0 0' }}
        >
          <View className="absolute inset-x-0 top-0 h-13.5 flex-row items-center justify-between pr-8.5 pl-10">
            <Text variant="label" className="text-base">
              9:41
            </Text>
            <View className="h-3 w-6 rounded border-[1.5px] border-fg/50 p-[1.5px]">
              <View className="h-full w-[70%] rounded-[1.5px] bg-fg" />
            </View>
          </View>
          <View className="flex-row items-center justify-between px-4 py-1.5">
            <View className="size-10.5 items-center justify-center rounded-full bg-elevated">
              <Icon name="close" size={14} />
            </View>
            <Text variant="bodyStrong">{t('welcome.preview.push')}</Text>
            <View className="size-10.5 items-center justify-center rounded-full bg-elevated">
              <Icon name="more" size={14} />
            </View>
          </View>
          <View className="flex-1 overflow-hidden">
            <Animated.View style={scrollStyle}>
              <View className="flex-row items-center gap-2 px-5 pt-6">
                <Text variant="headline">{t('welcome.preview.musclesWorked')}</Text>
                <View className="size-6.5 items-center justify-center rounded-full bg-control">
                  <Icon name="info-glyph" size={12} color={colors.fg} />
                </View>
              </View>
              <View className="flex-row gap-2 px-4 pt-3.5">
                {[...primary, ...secondary].map((s) => (
                  <MuscleTile
                    key={s.muscle}
                    muscle={s.muscle}
                    percent={s.percent}
                    highlight={primary.includes(s)}
                  />
                ))}
              </View>
              <View className="flex-row items-center gap-3 px-5 pt-7.5">
                <View className="min-w-0 flex-1">
                  <Text variant="headline">{t('welcome.preview.exercises', { count: 6 })}</Text>
                  <Text variant="caption" tone="subtle" className="mt-1.5 font-inter text-sm">
                    {t('welcome.preview.duration', { minutes: 55 })}
                  </Text>
                </View>
                <View className="size-11 items-center justify-center rounded-full bg-raised">
                  <Icon name="plus" size={14} />
                </View>
              </View>
              <View className="px-5 pt-2 pb-30">
                {EXERCISES.map((e, i) => (
                  <PreviewExercise key={e.id} {...e} last={i === EXERCISES.length - 1} />
                ))}
              </View>
            </Animated.View>
          </View>
          <View
            className="absolute inset-x-0 bottom-0 px-4 pt-10 pb-7.5"
            style={{
              experimental_backgroundImage: `linear-gradient(to top, ${colors.bg} 55%, rgba(10,10,10,0))`,
            }}
          >
            <View className="h-15 items-center justify-center rounded-full bg-accent">
              <Text variant="label" tone="onAccent" className="text-base">
                {t('welcome.preview.startWorkout')}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View className="absolute top-2 left-1/2 -ml-7 h-4 w-13.75 rounded-full bg-black" />
    </View>
  );
}
