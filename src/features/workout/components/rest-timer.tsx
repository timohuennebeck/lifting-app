import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle } from 'react-native-reanimated';

import { cn } from '@/shared/lib/cn';
import { formatDuration } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { Icon, type IconName } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { ProgressBar } from '@/shared/ui/progress-bar';
import { Sheet } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';

import { useRestTimer } from '../hooks/use-rest-timer';
import { useWorkoutSessionStore } from '../stores/workout-session-store';

/** The −/+ buttons move the running timer by this much. */
const NUDGE = 10;
/** Fixed lengths to restart with, after "stop" and the exercise's own rest. */
const PRESETS = [30, 60, 90, 120, 180];

interface ChoiceProps {
  label: string;
  icon?: IconName;
  accessibilityLabel: string;
  onPress: () => void;
}

function Choice({ label, icon, accessibilityLabel, onPress }: ChoiceProps) {
  return (
    <PressableScale
      haptic="select"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className="h-14 flex-row items-center gap-2.5 rounded-full bg-control px-5"
    >
      {icon ? <Icon name={icon} size={14} color={colors.fg} /> : null}
      <Text variant="bodyStrong" className="text-lg tabular-nums">
        {label}
      </Text>
    </PressableScale>
  );
}

export interface RestTimerProps {
  /** Rest of the current exercise, used when (re)starting a timer manually. */
  defaultSeconds: number;
}

/** Header rest countdown; flashes when done and opens a sheet to adjust, stop or restart it. */
export function RestTimer({ defaultSeconds }: RestTimerProps) {
  const { t } = useTranslation('workout');
  const { resting, remainingSeconds, fraction, flash } = useRestTimer();
  const [open, setOpen] = useState(false);
  const startRest = useWorkoutSessionStore((s) => s.startRest);
  const addRest = useWorkoutSessionStore((s) => s.addRest);
  const skipRest = useWorkoutSessionStore((s) => s.skipRest);
  const base = resting ? colors.accent : colors.fg;

  const pulse = useAnimatedStyle(() => ({
    color: interpolateColor(flash.get(), [0, 1], [base, colors.accent]),
    transform: [{ scale: 1 + flash.get() * 0.15 }],
  }));
  const label = formatDuration(remainingSeconds);

  const restart = (seconds: number) => {
    startRest(seconds);
    setOpen(false);
  };

  return (
    <>
      <PressableScale
        haptic="select"
        hitSlop={8}
        accessibilityLabel={t('rest.title')}
        accessibilityValue={{ text: label }}
        onPress={() => setOpen(true)}
        className="ml-auto flex-row items-center gap-1.5"
      >
        <Icon name="timer" size={16} color={resting ? colors.accent : colors.fg} />
        <Animated.Text className="font-inter-semibold text-xl tabular-nums" style={pulse}>
          {label}
        </Animated.Text>
      </PressableScale>
      <Sheet visible={open} onClose={() => setOpen(false)} title={t('rest.title')}>
        <ProgressBar value={resting ? fraction : 0} className="h-1.5 w-full flex-none" />
        <View className="flex-row items-center justify-between py-6">
          <PressableScale
            haptic="select"
            disabled={!resting}
            accessibilityLabel={t('rest.minus', { seconds: NUDGE })}
            onPress={() => addRest(-NUDGE)}
            className={cn(
              'size-14 items-center justify-center rounded-full bg-control',
              !resting && 'opacity-35',
            )}
          >
            <Text variant="label">{t('rest.minus', { seconds: NUDGE })}</Text>
          </PressableScale>
          <View className="flex-row items-center gap-2">
            <Icon name="timer" size={22} color={resting ? colors.accent : colors.fg} />
            <Text
              variant="headline"
              tone={resting ? 'accent' : 'default'}
              className="text-[40px] leading-11 tabular-nums"
            >
              {formatDuration(resting ? remainingSeconds : defaultSeconds)}
            </Text>
          </View>
          <PressableScale
            haptic="select"
            disabled={!resting}
            accessibilityLabel={t('rest.plus', { seconds: NUDGE })}
            onPress={() => addRest(NUDGE)}
            className={cn(
              'size-14 items-center justify-center rounded-full bg-control',
              !resting && 'opacity-35',
            )}
          >
            <Text variant="label">{t('rest.plus', { seconds: NUDGE })}</Text>
          </PressableScale>
        </View>
        <Text variant="label" className="pb-3 text-base">
          {t('rest.restart')}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mx-4 grow-0"
          contentContainerClassName="gap-2 px-4"
        >
          <Choice
            icon="stop"
            label={formatDuration(0)}
            accessibilityLabel={t('rest.stop')}
            onPress={() => {
              skipRest();
              setOpen(false);
            }}
          />
          <Choice
            icon="refresh"
            label={formatDuration(defaultSeconds)}
            accessibilityLabel={t('rest.restartDefault')}
            onPress={() => restart(defaultSeconds)}
          />
          {PRESETS.map((seconds) => (
            <Choice
              key={seconds}
              label={formatDuration(seconds)}
              accessibilityLabel={t('rest.restartWith', { time: formatDuration(seconds) })}
              onPress={() => restart(seconds)}
            />
          ))}
        </ScrollView>
      </Sheet>
    </>
  );
}
