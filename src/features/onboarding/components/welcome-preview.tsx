import { Image } from 'expo-image';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { getExercise } from '@/shared/data/exercises';
import { muscleShares } from '@/shared/data/muscles';
import { cn } from '@/shared/lib/cn';
import { colors, useAccentColor } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import type { MuscleId } from '@/shared/ui/muscle-map/body-paths';
import { MuscleTile } from '@/shared/ui/muscle-map/muscle-tile';
import { Text } from '@/shared/ui/text';

/** The mockup renders a full 390×844 screen and scales it into a 180×390 phone. */
const SCALE = 0.4615;
const SCROLL = 440;
const RIR_COLORS: Record<number, string> = { 3: '#EEA53A', 2: '#EEA53A', 1: '#E2483D' };

const DAYS = [
  { key: 'push', state: 'done' },
  { key: 'pull', state: 'done' },
  { key: 'legs', state: 'done' },
  { key: 'push', state: 'today', n: 4 },
  { key: 'pull', state: 'next', n: 5 },
  { key: 'legs', state: 'next', n: 6 },
] as const;

const EXERCISES = [
  { id: 'close-grip-bench-press', reps: '7–9', rir: [3, 2, 1] },
  { id: 'dumbbell-shoulder-press', reps: '7–9', rir: [3, 2, 1] },
  { id: 'incline-dumbbell-press', reps: '9–11', rir: [3, 2] },
] as const;

const SHARES = muscleShares(EXERCISES.map((e) => ({ exerciseId: e.id, sets: e.rir.length })));

interface DayRingProps {
  n: number;
  color: string;
}

function DayRing({ n, color }: DayRingProps) {
  return (
    <View className="size-8 items-center justify-center">
      <Svg
        width={38}
        height={38}
        style={{ position: 'absolute', left: -3, top: -3, transform: [{ rotate: '-90deg' }] }}
      >
        <Circle
          cx={19}
          cy={19}
          r={17.5}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray="13.3 5"
        />
      </Svg>
      <Text variant="caption" className="text-sm">
        {n}
      </Text>
    </View>
  );
}

interface PreviewExerciseProps {
  id: (typeof EXERCISES)[number]['id'];
  reps: string;
  rir: readonly number[];
  last: boolean;
}

function PreviewExercise({ id, reps, rir, last }: PreviewExerciseProps) {
  const { t } = useTranslation('exercises');
  const { t: tm } = useTranslation('muscles');
  const exercise = getExercise(id);
  const muscles = Object.entries(exercise?.muscles ?? {}) as [MuscleId, number][];
  return (
    <View className={cn('flex-row gap-3.5 py-[18px]', !last && 'border-b border-[#1E1E1E]')}>
      <View className="h-[86px] w-16 overflow-hidden rounded-[5px] bg-[#1E1E1E]">
        {exercise?.image ? (
          <Image source={exercise.image} contentFit="cover" style={{ flex: 1 }} />
        ) : null}
      </View>
      <View className="min-w-0 flex-1 gap-2.5">
        <View className="flex-row items-start gap-2.5">
          <Text variant="label" className="flex-1 pt-[5px] text-base leading-5">
            {t(`${id}.name`)}
          </Text>
          <View className="size-8 items-center justify-center">
            <Icon name="more" size={16} color="#E6E6E1" />
          </View>
        </View>
        <View className="gap-1.5">
          {rir.map((value, i) => (
            <View key={i} className="flex-row items-center gap-2.5">
              <View className="size-6 items-center justify-center rounded-full bg-[#1E1E1E]">
                <Text variant="caption" className="text-xs">
                  {i + 1}
                </Text>
              </View>
              <Text variant="paragraph" className="flex-1 text-sm text-[#E6E6E1]">
                {reps}
              </Text>
              <View
                className="size-[22px] items-center justify-center rounded-full"
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
                share >= 0.25 ? 'bg-[#1E1E1E]' : 'border border-[#333]',
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

/** Auto-scrolling miniature of the training overview shown on the welcome screen. */
export function WelcomePreview() {
  const { t } = useTranslation('onboarding');
  const accent = useAccentColor();
  const offset = useSharedValue(0);

  // Hold, scroll down, hold, scroll back – a 14 s loop like the prototype.
  useEffect(() => {
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
  }, [offset]);
  const scrollStyle = useAnimatedStyle(() => ({ transform: [{ translateY: offset.get() }] }));

  return (
    <View
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      className="h-[404px] w-[194px] rounded-[32px] bg-[#111] p-[7px]"
      style={{ boxShadow: `inset 0 0 0 1.5px ${colors.track}, 0 30px 60px rgba(0,0,0,0.7)` }}
    >
      <View className="h-[390px] w-[180px] overflow-hidden rounded-[25px] bg-bg">
        <View
          className="h-[844px] w-[390px] pt-[54px]"
          style={{ transform: [{ scale: SCALE }], transformOrigin: '0 0' }}
        >
          <View className="absolute inset-x-0 top-0 h-[54px] flex-row items-center justify-between pr-[34px] pl-10">
            <Text variant="label" className="text-base">
              9:41
            </Text>
            <View className="h-3 w-6 rounded border-[1.5px] border-fg/50 p-[1.5px]">
              <View className="h-full w-[70%] rounded-[1.5px] bg-fg" />
            </View>
          </View>
          <View className="flex-row items-center justify-between px-4 py-1.5">
            <View className="size-[42px] items-center justify-center rounded-full bg-elevated">
              <Icon name="close" size={14} />
            </View>
            <Text variant="bodyStrong">{t('welcome.preview.plan')}</Text>
            <View className="size-[42px] items-center justify-center rounded-full bg-elevated">
              <Icon name="more" size={14} />
            </View>
          </View>
          <View className="flex-1 overflow-hidden">
            <Animated.View style={scrollStyle}>
              <View className="flex-row px-3.5 pt-3.5 pb-4">
                {DAYS.map((day, i) => (
                  <View key={i} className="flex-1 items-center gap-2">
                    <Text
                      variant="caption"
                      tone={day.state === 'today' ? 'default' : 'subtle'}
                      className={cn(day.state !== 'today' && 'font-inter-medium')}
                    >
                      {t(`welcome.preview.${day.key}`)}
                    </Text>
                    {day.state === 'done' ? (
                      <View
                        className="size-8 items-center justify-center rounded-full bg-accent"
                        style={{ boxShadow: `0 0 0 3px ${colors.bg}, 0 0 0 4.5px ${accent}80` }}
                      >
                        <Icon name="check" size={14} color={colors.onAccent} />
                      </View>
                    ) : (
                      <DayRing n={day.n} color={day.state === 'today' ? accent : '#4A4A48'} />
                    )}
                  </View>
                ))}
                <View className="flex-1 items-center justify-end">
                  <View className="size-8 items-center justify-center rounded-full bg-elevated">
                    <Icon name="plus" size={12} />
                  </View>
                </View>
              </View>
              <Text variant="title" className="px-5 pt-[30px] normal-case">
                {t('welcome.preview.push')}
              </Text>
              <Text variant="paragraph" tone="subtle" className="px-5 pt-2">
                {t('welcome.preview.noFixedDay')}
              </Text>
              <Text variant="headline" className="px-5 pt-6 leading-[22px]">
                {t('welcome.preview.musclesWorked')}
              </Text>
              <View className="flex-row gap-2.5 px-5 pt-3.5">
                {SHARES.slice(0, 2).map((s) => (
                  <MuscleTile key={s.muscle} muscle={s.muscle} percent={s.percent} />
                ))}
              </View>
              <View className="flex-row items-center gap-3 px-5 pt-[30px]">
                <View className="min-w-0 flex-1">
                  <Text variant="headline" className="leading-[22px]">
                    {t('welcome.preview.exercises', { count: 6 })}
                  </Text>
                  <Text variant="caption" tone="subtle" className="mt-1.5 font-inter text-sm">
                    {t('welcome.preview.duration', { minutes: 55 })}
                  </Text>
                </View>
                <View className="size-11 items-center justify-center rounded-full bg-[#1E1E1E]">
                  <Icon name="plus" size={14} />
                </View>
              </View>
              <View className="px-5 pt-2 pb-[120px]">
                {EXERCISES.map((e, i) => (
                  <PreviewExercise key={e.id} {...e} last={i === EXERCISES.length - 1} />
                ))}
              </View>
            </Animated.View>
          </View>
          <View
            className="absolute inset-x-0 bottom-0 px-4 pt-10 pb-[30px]"
            style={{
              experimental_backgroundImage: `linear-gradient(to top, ${colors.bg} 55%, rgba(10,10,10,0))`,
            }}
          >
            <View className="h-[60px] items-center justify-center rounded-full bg-accent">
              <Text variant="label" tone="onAccent" className="text-base">
                {t('welcome.preview.startWorkout')}
              </Text>
            </View>
          </View>
        </View>
      </View>
      <View className="absolute top-2 left-1/2 -ml-7 h-4 w-[55px] rounded-full bg-black" />
    </View>
  );
}
