import type { ReactNode } from 'react';
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { scheduleOnRN } from 'react-native-worklets';
import Svg, { Circle, ClipPath, Defs, G, Path } from 'react-native-svg';

import { colors, useAccentColor } from '@/shared/lib/theme';

const SIZE = 240;
const C = SIZE / 2;
const KNOB_R = 105.5;
const RINGS = [95, 102, 109, 116];
const DOTS = 90;

const DOT_POINTS = RINGS.flatMap((r) =>
  Array.from({ length: DOTS }, (_, i) => {
    const a = (i / DOTS) * 2 * Math.PI;
    return { x: C + r * Math.sin(a), y: C - r * Math.cos(a) };
  }),
);

function sectorPath(fraction: number) {
  if (fraction >= 0.999) return `M0 0H${SIZE}V${SIZE}H0Z`;
  const a = fraction * 2 * Math.PI;
  const R = SIZE;
  const x = C + R * Math.sin(a);
  const y = C - R * Math.cos(a);
  return `M${C} ${C}L${C} ${C - R}A${R} ${R} 0 ${fraction > 0.5 ? 1 : 0} 1 ${x} ${y}Z`;
}

export interface DialRingProps {
  /** 0–1, how much of the ring is filled. */
  fraction: number;
  /** Called with the new fraction while dragging the knob. */
  onChange: (fraction: number) => void;
  children?: ReactNode;
}

/** Dotted circular dial with a draggable knob (Training days, Duration). */
export function DialRing({ fraction, onChange, children }: DialRingProps) {
  const accent = useAccentColor();
  const a = fraction * 2 * Math.PI;
  const knob = { x: C + KNOB_R * Math.sin(a), y: C - KNOB_R * Math.cos(a) };

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
          <Defs>
            <ClipPath id="dial-fill">
              <Path d={sectorPath(fraction)} />
            </ClipPath>
          </Defs>
          {DOT_POINTS.map((p, i) => (
            <Circle key={i} cx={p.x} cy={p.y} r={2.5} fill={colors.track} />
          ))}
          <G clipPath="url(#dial-fill)">
            {DOT_POINTS.map((p, i) => (
              <Circle key={i} cx={p.x} cy={p.y} r={2.5} fill={accent} />
            ))}
          </G>
          <Circle cx={knob.x} cy={knob.y} r={17} fill={colors.fg} />
          <Circle cx={knob.x} cy={knob.y} r={6} fill={accent} />
        </Svg>
        {children}
      </View>
    </GestureDetector>
  );
}
