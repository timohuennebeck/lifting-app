import { useState } from 'react';
import { View, type ViewProps } from 'react-native';

import { cn } from '@/shared/lib/cn';

const DASH = 6;
const GAP = 4;

export interface DashedLineProps {
  className?: string;
  style?: ViewProps['style'];
}

/**
 * A vertical dashed line as tall as its box: whole dashes only, spread so one sits at each end
 * (a cut dash at an end looks broken).
 */
export function DashedLine({ className, style }: DashedLineProps) {
  const [height, setHeight] = useState(0);
  const count = Math.max(1, Math.floor((height + GAP) / (DASH + GAP)));
  return (
    <View
      onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
      className={cn('w-0.5 justify-between', className)}
      style={style}
    >
      {height > 0
        ? Array.from({ length: count }, (_, i) => (
            <View key={i} className="w-0.5 rounded-[1px] bg-[#333333]" style={{ height: DASH }} />
          ))
        : null}
    </View>
  );
}
