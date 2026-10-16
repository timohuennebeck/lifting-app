import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { formatDuration } from '@/shared/lib/format';
import { clamp } from '@/shared/lib/math';

import { IconButton } from './icon-button';
import { Text } from './text';

const MIN_SECONDS = 15;
const MAX_SECONDS = 600;
const STEP_SECONDS = 15;

export interface RestStepperProps {
  /** Rest in seconds. */
  value: number;
  onChange: (seconds: number) => void;
}

/**
 * Rest between sets as "1:30 Min." between round minus and plus buttons, one row high: 15 s
 * steps, 0:15 to 10:00.
 */
export function RestStepper({ value, onChange }: RestStepperProps) {
  const { t } = useTranslation(['common', 'training']);
  // At the ends a step changes nothing, so nothing is reported.
  const set = (next: number) => {
    const clamped = clamp(next, MIN_SECONDS, MAX_SECONDS);
    if (clamped !== value) onChange(clamped);
  };
  return (
    <View className="h-16 flex-row items-center justify-between">
      <IconButton
        icon="minus"
        size={48}
        haptic="select"
        className="bg-raised"
        accessibilityLabel={t('actions.decrease')}
        disabled={value <= MIN_SECONDS}
        onPress={() => set(value - STEP_SECONDS)}
      />
      <View className="flex-row items-baseline gap-1.5">
        <Text variant="headline" className="text-[26px] leading-7.5 tabular-nums">
          {formatDuration(value)}
        </Text>
        <Text variant="caption" tone="subtle" className="font-inter text-sm">
          {t('training:sets.minutes')}
        </Text>
      </View>
      <IconButton
        icon="plus"
        size={48}
        haptic="select"
        className="bg-raised"
        accessibilityLabel={t('actions.increase')}
        disabled={value >= MAX_SECONDS}
        onPress={() => set(value + STEP_SECONDS)}
      />
    </View>
  );
}
