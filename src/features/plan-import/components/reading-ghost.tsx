import { useEffect } from 'react';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import { GhostExercise } from '@/shared/ui/ghost-exercise';

/** A breathing skeleton row under the routine being read: more exercises are on their way. */
export function ReadingGhost() {
  const opacity = useSharedValue(1);
  useEffect(() => {
    opacity.set(withRepeat(withTiming(0.35, { duration: 700 }), -1, true));
  }, [opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  // Fading in and breathing on separate views: both animate the opacity.
  return (
    <Animated.View entering={FadeIn.duration(250)}>
      <Animated.View style={style}>
        <GhostExercise widths={['82%', '52%']} />
      </Animated.View>
    </Animated.View>
  );
}
