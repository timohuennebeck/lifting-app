import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { type Period, PERIODS } from '@/shared/lib/periods';

import { PressableScale } from './pressable-scale';
import { Text } from './text';

export interface RangeTabsProps {
  value: Period;
  onChange: (value: Period) => void;
  className?: string;
}

/** The periods as one pill of tabs, "1W · 1M · 3M · 6M · 1Y · All" (weight, sets). */
export function RangeTabs({ value, onChange, className }: RangeTabsProps) {
  const { t } = useTranslation('common');
  return (
    <View
      className={cn('h-10 flex-row rounded-full bg-surface p-0.75', className)}
      accessibilityRole="tablist"
    >
      {PERIODS.map((period) => {
        const active = period === value;
        return (
          <PressableScale
            key={period}
            haptic="select"
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(period)}
            className={cn(
              'flex-1 items-center justify-center rounded-full',
              active && 'bg-control',
            )}
          >
            <Text variant="caption" tone={active ? 'default' : 'subtle'}>
              {t(`periods.${period}`)}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}
