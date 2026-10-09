import { Pressable, type PressableProps } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { haptics } from '@/shared/lib/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type HapticKind = keyof typeof haptics | 'none';

export interface PressableScaleProps extends PressableProps {
  className?: string;
  /** Scale applied while pressed. */
  activeScale?: number;
  haptic?: HapticKind;
}

/** Pressable with a short scale-down (no spring, so it never bounces) and a haptic tick. */
export function PressableScale({
  activeScale = 0.97,
  haptic = 'tap',
  onPressIn,
  onPressOut,
  onPress,
  style,
  disabled,
  ...props
}: PressableScaleProps) {
  // 0 at rest, 1 while pressed. Timed both ways: a spring here overshoots and looks bouncy.
  const pressed = useSharedValue(0);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 - (1 - activeScale) * pressed.get() }],
  }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={disabled}
      onPressIn={(e) => {
        pressed.set(withTiming(1, { duration: 90, easing: Easing.out(Easing.quad) }));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        pressed.set(withTiming(0, { duration: 140, easing: Easing.out(Easing.quad) }));
        onPressOut?.(e);
      }}
      onPress={(e) => {
        if (haptic !== 'none') haptics[haptic]();
        onPress?.(e);
      }}
      style={[animatedStyle, style as object]}
      {...props}
    />
  );
}
