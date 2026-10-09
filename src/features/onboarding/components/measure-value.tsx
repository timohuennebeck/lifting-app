import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/shared/lib/cn';
import { IconButton } from '@/shared/ui/icon-button';
import { Text } from '@/shared/ui/text';

export interface MeasureValueProps {
  value: string;
  /** The raw number, so the change can slide in from the side it came from. */
  amount: number;
  unit?: string;
}

/**
 * Big tabular number with a muted unit, as on the Weight and Height steps. Each change slides
 * in softly (up when it grows, down when it shrinks) instead of jumping.
 */
export function MeasureValue({ value, amount, unit }: MeasureValueProps) {
  const previous = useRef(amount);
  const offset = useSharedValue(0);
  const opacity = useSharedValue(1);

  useEffect(() => {
    if (amount === previous.current) return;
    const direction = amount > previous.current ? 1 : -1;
    previous.current = amount;
    offset.set(direction * 10);
    opacity.set(0.35);
    offset.set(withTiming(0, { duration: 160, easing: Easing.out(Easing.cubic) }));
    opacity.set(withTiming(1, { duration: 160 }));
  }, [amount, offset, opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.get(),
    transform: [{ translateY: offset.get() }],
  }));

  return (
    <View className="flex-row items-baseline gap-2">
      <Animated.View style={style}>
        <Text variant="display" accessibilityLiveRegion="polite">
          {value}
        </Text>
      </Animated.View>
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
