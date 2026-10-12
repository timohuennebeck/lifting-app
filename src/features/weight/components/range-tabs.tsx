import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

export const CHART_RANGES = [7, 14, 30, 90, 180] as const;
export type ChartRange = (typeof CHART_RANGES)[number];

export interface RangeTabsProps {
  value: ChartRange;
  onChange: (value: ChartRange) => void;
  className?: string;
}

/** The chart's range: 7 to 180 days (GW·2). */
export function RangeTabs({ value, onChange, className }: RangeTabsProps) {
  const { t } = useTranslation('weight');
  return (
    <View className={cn('h-10 flex-row rounded-full bg-surface p-0.75', className)}>
      {CHART_RANGES.map((range) => {
        const active = range === value;
        return (
          <PressableScale
            key={range}
            haptic="select"
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(range)}
            className={cn(
              'flex-1 items-center justify-center rounded-full',
              active && 'bg-control',
            )}
          >
            <Text variant="caption" tone={active ? 'default' : 'subtle'}>
              {t('history.range', { count: range })}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}
