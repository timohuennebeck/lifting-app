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

interface NudgeButtonProps {
  icon: IconName;
  accessibilityLabel: string;
  disabled: boolean;
  onPress: () => void;
}

/** Round −10 s / +10 s button beside the countdown; dimmed while no timer runs. */
function NudgeButton({ icon, accessibilityLabel, disabled, onPress }: NudgeButtonProps) {
  return (
    <PressableScale
      haptic="select"
      disabled={disabled}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className={cn(
        'size-14 items-center justify-center rounded-full bg-control',
        disabled && 'opacity-35',
      )}
    >
      <Icon name={icon} size={26} color={colors.fg} />
    </PressableScale>
  );
}

function Choice({ label, icon, accessibilityLabel, onPress }: ChoiceProps) {
  return (
    <PressableScale
      haptic="select"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      className="h-11 flex-row items-center gap-2 rounded-full bg-control px-4"
    >
      {icon ? <Icon name={icon} size={13} color={colors.fg} /> : null}
      <Text variant="bodyStrong" className="text-base tabular-nums">
        {label}
      </Text>
    </PressableScale>
  );
}

export interface RestTimerProps {
  /** Rest of the current exercise, used when (re)starting a timer manually. */
  defaultSeconds: number;
}

/**
 * Header rest countdown with a bar that empties as it runs; flashes when done and opens a sheet
 * to adjust, stop or restart it.
 */
export function RestTimer({ defaultSeconds }: RestTimerProps) {
  const { t } = useTranslation('workout');
  const { resting, remainingSeconds, fraction, flash } = useRestTimer();
  const [open, setOpen] = useState(false);
  const startRest = useWorkoutSessionStore((s) => s.startRest);
  const addRest = useWorkoutSessionStore((s) => s.addRest);
  const skipRest = useWorkoutSessionStore((s) => s.skipRest);
  const tint = resting ? colors.accent : colors.fg;
  const progress = resting ? fraction : 0;

  const pulse = useAnimatedStyle(() => ({
    color: interpolateColor(flash.get(), [0, 1], [tint, colors.accent]),
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
        <Icon name="timer" size={16} color={tint} />
        <Animated.Text className="font-inter-semibold text-xl tabular-nums" style={pulse}>
          {label}
        </Animated.Text>
      </PressableScale>
      <ProgressBar value={progress} className="h-1.5 w-24 flex-none" />
      <Sheet visible={open} onClose={() => setOpen(false)} title={t('rest.title')}>
        <ProgressBar value={progress} className="h-1.5 w-full flex-none" />
        <View className="flex-row items-center justify-between py-6">
          <NudgeButton
            icon="replay-10"
            accessibilityLabel={t('rest.minus', { seconds: NUDGE })}
            disabled={!resting}
            onPress={() => addRest(-NUDGE)}
          />
          <View className="flex-row items-center gap-2">
            <Icon name="timer" size={22} color={tint} />
            <Text
              variant="headline"
              tone={resting ? 'accent' : 'default'}
              className="text-[40px] leading-11 tabular-nums"
            >
              {formatDuration(resting ? remainingSeconds : defaultSeconds)}
            </Text>
          </View>
          <NudgeButton
            icon="forward-10"
            accessibilityLabel={t('rest.plus', { seconds: NUDGE })}
            disabled={!resting}
            onPress={() => addRest(NUDGE)}
          />
        </View>
        <Text variant="label" className="pb-3 text-base">
          {t('rest.restart')}
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="-mx-4"
          // A horizontal ScrollView grows by default, and the pills stretched to its height.
          style={{ flexGrow: 0 }}
          contentContainerClassName="items-center gap-2 px-4"
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
