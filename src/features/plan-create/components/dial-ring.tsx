import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '@/shared/lib/theme';

const SIZE = 240;
const C = SIZE / 2;
const RINGS = [95, 102, 109, 116];
const DOTS = 90;

/** Each dot with its place around the ring (0 at 12 o'clock, clockwise to 1). */
const DOT_POINTS = RINGS.flatMap((r) =>
  Array.from({ length: DOTS }, (_, i) => {
    const a = (i / DOTS) * 2 * Math.PI;
    return { x: C + r * Math.sin(a), y: C - r * Math.cos(a), at: i / DOTS };
  }),
);

export interface DialRingProps {
  /** 0–1, how much of the ring is filled. */
  fraction: number;
  /** Called with the new fraction while dragging. */
  onChange: (fraction: number) => void;
  children?: ReactNode;
}

/**
 * Dotted circular dial; drag anywhere on it to set the value (Duration). Filled clockwise from
 * 12 o'clock, a whole dot at a time: no clip path, so reaching the full ring doesn't flicker.
 */
export function DialRing({ fraction, onChange, children }: DialRingProps) {
  const pan = Gesture.Pan()
    .minDistance(0)
    .onBegin((e) => scheduleOnRN(update, e.x, e.y))
    .onUpdate((e) => scheduleOnRN(update, e.x, e.y));

  function update(x: number, y: number) {
    let angle = Math.atan2(x - C, -(y - C));
    if (angle < 0) angle += 2 * Math.PI;
    onChange(angle / (2 * Math.PI));
  }

  return (
    <GestureDetector gesture={pan}>
      <View
        style={{ width: SIZE, height: SIZE }}
        className="items-center justify-center self-center"
      >
        <Svg width={SIZE} height={SIZE} style={{ position: 'absolute' }}>
          {DOT_POINTS.map((p, i) => (
            <Circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={2.5}
              // The small margin keeps a full ring full despite rounding.
              fill={p.at < fraction - 1e-6 ? colors.accent : colors.track}
            />
          ))}
        </Svg>
        {children}
      </View>
    </GestureDetector>
  );
}
