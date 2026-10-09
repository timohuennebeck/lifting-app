import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib/cn';
import { clamp } from '@/shared/lib/math';

import { IconButton } from './icon-button';
import { Text } from './text';

export interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  /** Caption under the number, e.g. "YEARS". */
  unit?: string;
  format?: (value: number) => string;
  className?: string;
}

/** Big number with round −/+ buttons (Age, frequency). */
export function NumberStepper({
  value,
  onChange,
  min,
  max,
  unit,
  format = String,
  className,
}: NumberStepperProps) {
  const { t } = useTranslation();
  const set = (next: number) => onChange(clamp(next, min, max));
  return (
    <View className={cn('flex-row items-center justify-between gap-3', className)}>
      <IconButton
        icon="minus"
        size={64}
        iconSize={20}
        haptic="select"
        accessibilityLabel={t('actions.decrease')}
        disabled={value <= min}
        className={cn('bg-white/10', value <= min && 'opacity-30')}
        onPress={() => set(value - 1)}
      />
      <View className="items-center gap-1.5">
        <Text variant="display">{format(value)}</Text>
        {unit ? (
          <Text variant="overline" tone="subtle">
            {unit}
          </Text>
        ) : null}
      </View>
      <IconButton
        icon="plus"
        size={64}
        iconSize={20}
        haptic="select"
        accessibilityLabel={t('actions.increase')}
        disabled={value >= max}
        className={cn('bg-white/10', value >= max && 'opacity-30')}
        onPress={() => set(value + 1)}
      />
    </View>
  );
}
