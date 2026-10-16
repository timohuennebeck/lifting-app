import { useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { haptics } from '@/shared/lib/haptics';
import { colors } from '@/shared/lib/theme';

/** Seconds from the shot until the last piece has faded. */
const DURATION = 3.2;
const FADE_FROM = 2.5;
/** After the screen's fade-in, in ms. */
const DELAY = 250;
/** Air drag per second and gravity in screen heights per second², as on paper. */
const DRAG = 0.9;
const GRAVITY = 0.75;
/** Where the cannons sit: the bottom corners, a little above the Done button. */
const SIDE_INSET = 6;
const START_Y = 0.86;
const PER_SIDE = 40;
const PALETTE = [colors.accent, colors.fg, '#C9C9C4', colors.accent, colors.subtle];

interface Piece {
  left: boolean;
  /** Speeds in screen widths (sideways) and heights (up) per second. */
  vx: number;
  vy: number;
  width: number;
  height: number;
  color: string;
  rotate: number;
  spin: number;
  flip: number;
  flipSpeed: number;
}

const between = (min: number, max: number) => min + Math.random() * (max - min);

// Made once when the module loads, so rendering stays pure; every finish looks alike.
const PIECES: Piece[] = Array.from({ length: PER_SIDE * 2 }, (_, i) => ({
  left: i < PER_SIDE,
  vx: between(0.64, 1.7),
  vy: between(0.94, 1.46),
  width: between(6, 11),
  height: between(4, 8),
  color: PALETTE[i % PALETTE.length],
  rotate: between(0, 2 * Math.PI),
  spin: between(-9, 9),
  flip: between(0, 2 * Math.PI),
  flipSpeed: between(8, 13),
}));

interface ConfettiPieceProps {
  piece: Piece;
  /** Seconds since the shot. */
  time: SharedValue<number>;
  screenWidth: number;
  screenHeight: number;
}

/** One paper piece flying on a curve with air drag, turning and flipping as it falls. */
function ConfettiPiece({ piece, time, screenWidth, screenHeight }: ConfettiPieceProps) {
  const style = useAnimatedStyle(() => {
    const t = time.get();
    const slowed = (1 - Math.exp(-DRAG * t)) / DRAG;
    const gravity = GRAVITY * screenHeight;
    const side = piece.left ? 1 : -1;
    const x =
      (piece.left ? SIDE_INSET : screenWidth - SIDE_INSET) + side * piece.vx * screenWidth * slowed;
    const y =
      START_Y * screenHeight +
      (gravity / DRAG) * t +
      (-piece.vy * screenHeight - gravity / DRAG) * slowed;
    return {
      opacity: t > FADE_FROM ? Math.max(0, 1 - (t - FADE_FROM) / (DURATION - FADE_FROM)) : 1,
      transform: [
        { translateX: x - piece.width / 2 },
        { translateY: y - piece.height / 2 },
        { rotate: `${piece.rotate + piece.spin * t}rad` },
        { scaleY: Math.abs(Math.cos(piece.flip + piece.flipSpeed * t)) + 0.15 },
      ],
    };
  });
  return (
    <Animated.View
      style={[
        styles.piece,
        { width: piece.width, height: piece.height, backgroundColor: piece.color },
        style,
      ]}
    />
  );
}

/**
 * Workout finished: two confetti cannons fire from the bottom corners and meet over the headline,
 * once, with a haptic. Nothing with "reduce motion" on.
 */
export function FinishConfetti() {
  const { width, height } = useWindowDimensions();
  const reduceMotion = useReducedMotion();
  const time = useSharedValue(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (reduceMotion) return;
    const fire = setTimeout(() => haptics.press(), DELAY);
    time.set(
      withDelay(
        DELAY,
        withTiming(DURATION, { duration: DURATION * 1000, easing: Easing.linear }, (finished) => {
          if (finished) scheduleOnRN(setDone, true);
        }),
      ),
    );
    return () => clearTimeout(fire);
  }, [reduceMotion, time]);

  if (reduceMotion || done) return null;
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      {PIECES.map((piece, i) => (
        <ConfettiPiece
          key={i}
          piece={piece}
          time={time}
          screenWidth={width}
          screenHeight={height}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  piece: { position: 'absolute', top: 0, left: 0, borderRadius: 1 },
});
