import { Pressable, type PressableProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

import { haptics } from '@/shared/lib/haptics';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type HapticKind = keyof typeof haptics | 'none';

export interface PressableScaleProps extends PressableProps {
  className?: string;
  /** Scale applied while pressed. */
  activeScale?: number;
  haptic?: HapticKind;
}

/** Pressable with a spring scale-down and a haptic tick on press. */
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
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.get() }] }));

  return (
    <AnimatedPressable
      accessibilityRole="button"
      disabled={disabled}
      onPressIn={(e) => {
        scale.set(withSpring(activeScale, { damping: 20, stiffness: 400 }));
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        scale.set(withSpring(1, { damping: 15, stiffness: 300 }));
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
