import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { clamp } from '@/shared/lib/math';
import { Text } from '@/shared/ui/text';

export interface MetricRowProps {
  label: string;
  /** Verbal rating next to the value ("Very good"). */
  note: string;
  value: string;
  unit?: string;
  /** Marker position on the scale, 0–1. */
  position: number;
  min: string;
  max: string;
}

/** Result metric with value and a four-segment scale (design 08d-A "Basis"). */
export function MetricRow({ label, note, value, unit, position, min, max }: MetricRowProps) {
  return (
    <View className="gap-2.5 border-b border-chip py-3.5">
      <View className="flex-row items-baseline justify-between gap-3">
        <Text variant="label">{label}</Text>
        <View className="flex-row items-baseline gap-2">
          <Text variant="caption" tone="subtle" className="font-inter text-xs">
            {note}
          </Text>
          <Text variant="headline" tone="accent" className="text-xl">
            {value}
            {unit ? (
              <Text variant="caption" tone="subtle" className="font-inter">
                {unit}
              </Text>
            ) : null}
          </Text>
        </View>
      </View>
      <View className="h-2 flex-row gap-0.75">
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            className={cn('flex-1 bg-control', i === 0 && 'rounded-l', i === 3 && 'rounded-r')}
          />
        ))}
        <View
          className="absolute -top-1.75 -ml-2.75 size-5.5 rounded-full border-[3px] border-bg bg-accent"
          style={{ left: `${clamp(position, 0, 1) * 100}%` }}
        />
      </View>
      <View className="flex-row justify-between">
        <Text variant="caption" className="font-inter text-[11px] leading-3.5 text-dim">
          {min}
        </Text>
        <Text variant="caption" className="font-inter text-[11px] leading-3.5 text-dim">
          {max}
        </Text>
      </View>
    </View>
  );
}
