import Animated, {
  type SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

/** Capture flash: call `fire()` on capture and render `<ShutterFlash>` last. */
export function useShutterFlash() {
  const opacity = useSharedValue(0);
  const fire = () =>
    opacity.set(withSequence(withTiming(0.85, { duration: 40 }), withTiming(0, { duration: 250 })));
  return { opacity, fire };
}

export interface ShutterFlashProps {
  opacity: SharedValue<number>;
}

/** Full-screen white blink on top of the camera and its controls. */
export function ShutterFlash({ opacity }: ShutterFlashProps) {
  const style = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  return (
    <Animated.View
      pointerEvents="none"
      className="absolute inset-0 bg-fg"
      style={[{ opacity: 0 }, style]}
    />
  );
}
