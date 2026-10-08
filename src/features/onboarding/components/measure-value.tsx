import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { IconButton } from '@/shared/ui/icon-button';
import { Text } from '@/shared/ui/text';

export interface MeasureValueProps {
  value: string;
  unit?: string;
  className?: string;
}

/** Big tabular number with a muted unit, as on the Weight and Height steps. */
export function MeasureValue({ value, unit, className }: MeasureValueProps) {
  return (
    <View className={cn('flex-row items-baseline gap-2', className)}>
      <Text variant="display" accessibilityLiveRegion="polite">
        {value}
      </Text>
      {unit ? (
        <Text variant="headline" tone="subtle" className="uppercase">
          {unit}
        </Text>
      ) : null}
    </View>
  );
}

export interface StepButtonsProps {
  onDecrease: () => void;
  onIncrease: () => void;
  className?: string;
}

/** Round −/+ pair for fine adjustments next to a ruler. */
export function StepButtons({ onDecrease, onIncrease, className }: StepButtonsProps) {
  const { t } = useTranslation();
  return (
    <View className={cn('flex-row gap-3', className)}>
      <IconButton
        icon="minus"
        size={52}
        iconSize={16}
        haptic="select"
        accessibilityLabel={t('actions.decrease')}
        onPress={onDecrease}
      />
      <IconButton
        icon="plus"
        size={52}
        iconSize={16}
        haptic="select"
        accessibilityLabel={t('actions.increase')}
        onPress={onIncrease}
      />
    </View>
  );
}
