import type { ReactNode } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withDecay,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { clamp } from '@/shared/lib/math';

const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2.5;
/** Unzoomed, a drag this far (or a fast flick) closes or swipes. */
const SWIPE_DISTANCE = 100;
const SWIPE_VELOCITY = 900;

export interface ZoomableViewProps {
  children: ReactNode;
  /** Width / height of the content shown whole ("contain"); unknown, it fills the screen. */
  contentAspect?: number;
  /** Unzoomed drag up or down. */
  onDismiss: () => void;
  /** Unzoomed drag sideways: 1 for the next item, -1 for the previous one. */
  onSwipe?: (direction: 1 | -1) => void;
}

/**
 * Full-screen content to look at closely: pinch or double-tap to zoom, drag to move the zoomed
 * content. Unzoomed, dragging sideways swipes and dragging up or down closes. Remount it (key)
 * to reset the zoom.
 */
export function ZoomableView({ children, contentAspect, onDismiss, onSwipe }: ZoomableViewProps) {
  const { width, height } = useWindowDimensions();
  // The content's size on screen unzoomed: the bars beside it are never panned into view.
  const fitWidth = contentAspect ? Math.min(width, height * contentAspect) : width;
  const fitHeight = contentAspect ? fitWidth / contentAspect : height;
  const scale = useSharedValue(1);
  const x = useSharedValue(0);
  const y = useSharedValue(0);
  const start = useSharedValue({ scale: 1, x: 0, y: 0, focalX: 0, focalY: 0 });

  // How far the zoomed content may move before its edge leaves the screen's edge.
  const maxX = (s: number) => {
    'worklet';
    return Math.max(0, (fitWidth * s - width) / 2);
  };
  const maxY = (s: number) => {
    'worklet';
    return Math.max(0, (fitHeight * s - height) / 2);
  };
  const reset = () => {
    'worklet';
    scale.set(withTiming(1));
    x.set(withTiming(0));
    y.set(withTiming(0));
  };

  const pinch = Gesture.Pinch()
    .onStart((e) => {
      start.set({
        scale: scale.get(),
        x: x.get(),
        y: y.get(),
        // From the centre, where the scale transform starts.
        focalX: e.focalX - width / 2,
        focalY: e.focalY - height / 2,
      });
    })
    .onUpdate((e) => {
      const from = start.get();
      const next = clamp(from.scale * e.scale, 1, MAX_SCALE);
      const ratio = next / from.scale;
      // The point first under the fingers stays under them, also while they move.
      x.set(e.focalX - width / 2 - (from.focalX - from.x) * ratio);
      y.set(e.focalY - height / 2 - (from.focalY - from.y) * ratio);
      scale.set(next);
    })
    .onEnd(() => {
      const s = scale.get();
      if (s <= 1) return reset();
      x.set(withTiming(clamp(x.get(), -maxX(s), maxX(s))));
      y.set(withTiming(clamp(y.get(), -maxY(s), maxY(s))));
    });

  const pan = Gesture.Pan()
    .maxPointers(1)
    .onStart(() => {
      start.set({ ...start.get(), x: x.get(), y: y.get() });
    })
    .onUpdate((e) => {
      const s = scale.get();
      const from = start.get();
      if (s > 1) {
        x.set(clamp(from.x + e.translationX, -maxX(s), maxX(s)));
        y.set(clamp(from.y + e.translationY, -maxY(s), maxY(s)));
      } else {
        x.set(onSwipe ? e.translationX : 0);
        y.set(e.translationY);
      }
    })
    .onEnd((e) => {
      const s = scale.get();
      if (s > 1) {
        x.set(withDecay({ velocity: e.velocityX, clamp: [-maxX(s), maxX(s)] }));
        y.set(withDecay({ velocity: e.velocityY, clamp: [-maxY(s), maxY(s)] }));
        return;
      }
      const sideways = Math.abs(e.translationX) > Math.abs(e.translationY);
      const far = (distance: number, velocity: number) =>
        Math.abs(distance) > SWIPE_DISTANCE || Math.abs(velocity) > SWIPE_VELOCITY;
      if (!sideways && far(e.translationY, e.velocityY)) return scheduleOnRN(onDismiss);
      // Back in place also after a swipe: there may be nothing to swipe to.
      reset();
      if (sideways && onSwipe && far(e.translationX, e.velocityX)) {
        scheduleOnRN(onSwipe, e.translationX < 0 ? 1 : -1);
      }
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((e) => {
      if (scale.get() > 1) return reset();
      // Zooms in on the tapped point.
      const s = DOUBLE_TAP_SCALE;
      scale.set(withTiming(s));
      x.set(withTiming(clamp(-(e.x - width / 2) * (s - 1), -maxX(s), maxX(s))));
      y.set(withTiming(clamp(-(e.y - height / 2) * (s - 1), -maxY(s), maxY(s))));
    });

  const contentStyle = useAnimatedStyle(() => ({
    // Unzoomed, the content fades while it is dragged away.
    opacity:
      scale.get() > 1
        ? 1
        : interpolate(Math.max(Math.abs(x.get()), Math.abs(y.get())), [0, height / 2], [1, 0.4]),
    transform: [{ translateX: x.get() }, { translateY: y.get() }, { scale: scale.get() }],
  }));

  return (
    <GestureDetector gesture={Gesture.Race(doubleTap, Gesture.Simultaneous(pinch, pan))}>
      {/* Fills the screen untransformed, so the gestures' points are screen points. */}
      <View style={StyleSheet.absoluteFill} collapsable={false}>
        <Animated.View style={[StyleSheet.absoluteFill, contentStyle]}>{children}</Animated.View>
      </View>
    </GestureDetector>
  );
}
