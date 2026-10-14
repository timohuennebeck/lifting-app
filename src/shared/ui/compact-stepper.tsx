import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { clamp } from '@/shared/lib/math';

import { IconButton } from './icon-button';
import { Text } from './text';

export interface CompactStepperProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  format?: (value: number) => string;
  /** Small text after the number, e.g. "Min.". */
  unit?: string;
}

/** A number between round minus and plus buttons, one row high (rest time, workouts a week). */
export function CompactStepper({
  value,
  onChange,
  min,
  max,
  step = 1,
  format = String,
  unit,
}: CompactStepperProps) {
  const { t } = useTranslation();
  const set = (next: number) => onChange(clamp(next, min, max));
  return (
    <View className="h-16 flex-row items-center justify-between">
      <IconButton
        icon="minus"
        size={48}
        haptic="select"
        className="bg-raised"
        accessibilityLabel={t('actions.decrease')}
        disabled={value <= min}
        onPress={() => set(value - step)}
      />
      <View className="flex-row items-baseline gap-1.5">
        <Text variant="headline" className="text-[26px] leading-7.5 tabular-nums">
          {format(value)}
        </Text>
        {unit ? (
          <Text variant="caption" tone="subtle" className="font-inter text-sm">
            {unit}
          </Text>
        ) : null}
      </View>
      <IconButton
        icon="plus"
        size={48}
        haptic="select"
        className="bg-raised"
        accessibilityLabel={t('actions.increase')}
        disabled={value >= max}
        onPress={() => set(value + step)}
      />
    </View>
  );
}
