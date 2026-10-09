import { View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { cn } from '@/shared/lib/cn';
import { clamp } from '@/shared/lib/math';

export interface ProgressBarProps {
  /** 0–1 */
  value: number;
  className?: string;
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  const percent = clamp(value, 0, 1) * 100;
  const fill = useAnimatedStyle(() => ({
    width: withTiming(`${percent}%`, { duration: 300 }),
  }));
  return (
    <View className={cn('h-1 flex-1 overflow-hidden rounded-full bg-control', className)}>
      <Animated.View className="h-full rounded-full bg-accent" style={fill} />
    </View>
  );
}
