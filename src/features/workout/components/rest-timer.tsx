import { useState } from 'react';
import { View } from 'react-native';
import Animated, { interpolateColor, useAnimatedStyle } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { formatDuration } from '@/shared/lib/format';
import { colors, useAccentColor } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { ProgressBar } from '@/shared/ui/progress-bar';
import { Sheet } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';

import { useRestTimer } from '../hooks/use-rest-timer';
import { useWorkoutSessionStore } from '../stores/workout-session-store';

export interface RestTimerProps {
  /** Rest of the current exercise, used when starting a timer manually. */
  defaultSeconds: number;
}

/** Header rest countdown; flashes when done and opens a sheet to adjust or skip. */
export function RestTimer({ defaultSeconds }: RestTimerProps) {
  const { t } = useTranslation('workout');
  const accent = useAccentColor();
  const { resting, remainingSeconds, fraction, flash } = useRestTimer();
  const [open, setOpen] = useState(false);
  const startRest = useWorkoutSessionStore((s) => s.startRest);
  const addRest = useWorkoutSessionStore((s) => s.addRest);
  const skipRest = useWorkoutSessionStore((s) => s.skipRest);
  const base = resting ? accent : colors.fg;

  const pulse = useAnimatedStyle(() => ({
    color: interpolateColor(flash.get(), [0, 1], [base, accent]),
    transform: [{ scale: 1 + flash.get() * 0.15 }],
  }));
  const label = formatDuration(remainingSeconds);

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
        <Icon name="timer" size={16} color={resting ? accent : colors.fg} />
        <Animated.Text className="font-inter-semibold text-xl tabular-nums" style={pulse}>
          {label}
        </Animated.Text>
      </PressableScale>
      <Sheet
        visible={open}
        onClose={() => setOpen(false)}
        title={t('rest.title')}
        subtitle={resting ? t('rest.running') : t('rest.idle')}
      >
        <View className="items-center gap-5 pb-6">
          <Text variant="display" tone={resting ? 'accent' : 'default'}>
            {formatDuration(resting ? remainingSeconds : defaultSeconds)}
          </Text>
          <ProgressBar value={resting ? fraction : 0} className="h-1.5 w-full flex-none" />
          <View className="flex-row gap-2">
            <Button
              size="md"
              variant="secondary"
              label={t('rest.minus', { seconds: 15 })}
              disabled={!resting}
              haptic="select"
              onPress={() => addRest(-15)}
            />
            <Button
              size="md"
              variant="secondary"
              label={t('rest.plus', { seconds: 30 })}
              disabled={!resting}
              haptic="select"
              onPress={() => addRest(30)}
            />
          </View>
        </View>
        {resting ? (
          <Button
            label={t('rest.skip')}
            onPress={() => {
              skipRest();
              setOpen(false);
            }}
          />
        ) : (
          <Button
            label={t('rest.start')}
            icon="play"
            onPress={() => {
              startRest(defaultSeconds);
              setOpen(false);
            }}
          />
        )}
      </Sheet>
    </>
  );
}
