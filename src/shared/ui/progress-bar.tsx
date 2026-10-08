import { View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { cn } from '@/shared/lib/cn';

export interface ProgressBarProps {
  /** 0–1 */
  value: number;
  className?: string;
}

export function ProgressBar({ value, className }: ProgressBarProps) {
  const fill = useAnimatedStyle(() => ({
    width: withTiming(`${Math.min(1, Math.max(0, value)) * 100}%`, { duration: 300 }),
  }));
  return (
    <View className={cn('h-1 flex-1 overflow-hidden rounded-full bg-control', className)}>
      <Animated.View className="h-full rounded-full bg-accent" style={fill} />
    </View>
  );
}
