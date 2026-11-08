import { View } from 'react-native';
import Animated, { type CSSAnimationKeyframes } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';

import { colors } from '@/shared/lib/theme';

export type Spark = 'cross' | 'asterisk' | 'star';

/**
 * The centre's sparkle, drawn rather than typed: iOS shows "✳" as a green emoji. The four
 * teardrops (✢), the eight spokes (✳) and the six-pointed star (✶) of the design.
 */
export function SparkGlyph({ kind, size = 52 }: { kind: Spark; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 52 52">
      {kind === 'cross'
        ? [0, 90, 180, 270].map((angle) => (
            <Path
              key={angle}
              d="M26 26C21.5 19.5 19 13.5 19 10a7 7 0 0 1 14 0c0 3.5-2.5 9.5-7 16z"
              fill={colors.accent}
              transform={`rotate(${angle} 26 26)`}
            />
          ))
        : null}
      {kind === 'asterisk' ? (
        <Path
          d="M26 4v44M4 26h44M10.4 10.4l31.2 31.2M41.6 10.4L10.4 41.6"
          stroke={colors.accent}
          strokeWidth={6}
        />
      ) : null}
      {kind === 'star' ? (
        <Path
          d="M26.0 2.0L29.8 19.5L46.8 14.0L33.5 26.0L46.8 38.0L29.8 32.5L26.0 50.0L22.2 32.5L5.2 38.0L18.5 26.0L5.2 14.0L22.2 19.5Z"
          fill={colors.accent}
          stroke={colors.accent}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />
      ) : null}
    </Svg>
  );
}

/** Shown in its quarters of a 0.4 s cycle, hidden in the others (switching at once). */
const showIn = (quarters: number[]): CSSAnimationKeyframes =>
  Object.fromEntries(
    [0, 1, 2, 3].flatMap((q) => {
      const opacity = quarters.includes(q) ? 1 : 0;
      return [
        [`${q * 25}%`, { opacity }],
        [`${q * 25 + 24.9}%`, { opacity }],
      ];
    }),
  );

/** The sparkles the centre cycles through while reading, one every 100 ms (as in the design). */
const SPARKS: { kind: Spark; frames: CSSAnimationKeyframes }[] = [
  { kind: 'cross', frames: showIn([0]) },
  { kind: 'asterisk', frames: showIn([1, 3]) },
  { kind: 'star', frames: showIn([2]) },
];

/** The three glyphs stacked, each fading in its turn on the UI thread (no re-render). */
export function SpinnerGlyph({ size = 52 }: { size?: number }) {
  return (
    <View style={{ width: size, height: size }}>
      {SPARKS.map(({ kind, frames }) => (
        <Animated.View
          key={kind}
          collapsable={false}
          className="absolute inset-0"
          style={{
            animationName: frames,
            animationDuration: '0.4s',
            animationIterationCount: 'infinite',
            animationTimingFunction: 'linear',
          }}
        >
          <SparkGlyph kind={kind} size={size} />
        </Animated.View>
      ))}
    </View>
  );
}
