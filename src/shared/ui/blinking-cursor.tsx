import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/shared/lib/cn';

/** The accent text caret, blinking like the system's; `className` sets its height. */
export function BlinkingCursor({ className }: { className?: string }) {
  const opacity = useSharedValue(1);
  useEffect(() => {
    const step = (to: number) => withDelay(500, withTiming(to, { duration: 0 }));
    opacity.set(withRepeat(withSequence(step(0), step(1)), -1));
  }, [opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  return (
    <Animated.View className={cn('h-5 w-0.5 rounded-full bg-accent', className)} style={style} />
  );
}
