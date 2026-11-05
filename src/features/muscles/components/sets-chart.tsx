import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { haptics } from '@/shared/lib/haptics';
import { cn } from '@/shared/lib/cn';
import { formatShortDate } from '@/shared/lib/format';
import { Text } from '@/shared/ui/text';

import { formatDays } from '../lib/format-days';
import type { SetBucket } from '../lib/muscle-sets';

/** Height of the tallest bar. */
const HEIGHT = 120;

export interface SetsChartProps {
  buckets: SetBucket[];
}

/**
 * A muscle's sets per day or week as flat neon bars of equal width, days without sets as grey
 * strokes; the oldest date on the left, "Heute" on the right. A tapped bar stands out with its
 * days and sets above the chart (the line keeps its place); a second tap lets it go.
 */
export function SetsChart({ buckets }: SetsChartProps) {
  const { t } = useTranslation('muscles');
  const [picked, setPicked] = useState<number | null>(null);
  const top = Math.max(1, ...buckets.map((b) => b.sets));
  const shown = picked === null ? null : buckets[picked];
  const label = (b: SetBucket) =>
    `${formatDays(b.from, b.to)} · ${t('sets.count', { count: b.sets })}`;

  return (
    <View className="gap-2.5">
      <Text variant="caption" numberOfLines={1} className="h-4 leading-4">
        {shown ? label(shown) : ''}
      </Text>
      <View className="flex-row items-end gap-0.75" style={{ height: HEIGHT }}>
        {buckets.map((bucket, i) => (
          <Pressable
            key={bucket.from}
            accessibilityRole="button"
            accessibilityLabel={label(bucket)}
            accessibilityState={{ selected: picked === i }}
            onPress={() => {
              haptics.select();
              setPicked(picked === i ? null : i);
            }}
            className={cn(
              'h-full flex-1 justify-end',
              picked !== null && picked !== i && 'opacity-30',
            )}
          >
            {bucket.sets ? (
              <View
                className="rounded-t-[1px] bg-accent"
                style={{ height: Math.max(2, (bucket.sets / top) * HEIGHT) }}
              />
            ) : (
              <View className="h-0.5 bg-track" />
            )}
          </Pressable>
        ))}
      </View>
      <View className="flex-row justify-between">
        <Text variant="caption" tone="subtle">
          {buckets[0] ? formatShortDate(buckets[0].from) : ''}
        </Text>
        <Text variant="caption" tone="subtle">
          {t('sets.today')}
        </Text>
      </View>
    </View>
  );
}
