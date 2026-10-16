import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';

import { PressableScale } from './pressable-scale';
import { Text } from './text';

export interface RangeTabsProps<TRange extends number> {
  /** Day counts to pick from, e.g. 7 to 180. */
  ranges: readonly TRange[];
  value: TRange;
  onChange: (value: TRange) => void;
  className?: string;
}

/** A range of days as one pill of tabs, "7 T · 14 T · …" (weight history). */
export function RangeTabs<TRange extends number>({
  ranges,
  value,
  onChange,
  className,
}: RangeTabsProps<TRange>) {
  const { t } = useTranslation('common');
  return (
    <View
      className={cn('h-10 flex-row rounded-full bg-surface p-0.75', className)}
      accessibilityRole="tablist"
    >
      {ranges.map((range) => {
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
              {t('rangeDays', { count: Number(range) })}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}
