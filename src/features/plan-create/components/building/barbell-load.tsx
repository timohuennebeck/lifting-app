import { View } from 'react-native';
import Animated, { type CSSAnimationKeyframes } from 'react-native-reanimated';

import { colors } from '@/shared/lib/theme';
import { Text } from '@/shared/ui/text';

import { BuildingCaption } from './building-caption';
import { loop } from './motion';
import type { BuildingVariantProps } from './motion';

/** One rep: plates slide on, the bar goes up and down, the plates come off. */
export const REP_SECONDS = 4;

const BAR_WIDTH = 300;
/** The plates from the inside out: height and colour. */
const PLATES = [
  { height: 116, color: colors.accent },
  { height: 96, color: colors.fg },
  { height: 72, color: colors.outline },
] as const;
const PLATE_WIDTH = 16;
/** Where the inner plate sits, from the bar's middle. */
const INNER = 92;

/** A plate sliding on from its side in its turn, staying for the lift, then sliding off. */
function plateFrames(side: -1 | 1, order: number): CSSAnimationKeyframes {
  const away = { opacity: 0, transform: [{ translateX: side * 90 }] };
  const on = { opacity: 1, transform: [{ translateX: 0 }] };
  return {
    '0%': away,
    [`${6 + order * 10}%`]: away,
    [`${16 + order * 10}%`]: on,
    '86%': on,
    '96%': away,
    '100%': away,
  };
}

const LIFT: CSSAnimationKeyframes = {
  '0%': { transform: [{ translateY: 0 }] },
  '48%': { transform: [{ translateY: 0 }] },
  '60%': { transform: [{ translateY: -56 }] },
  '68%': { transform: [{ translateY: -56 }] },
  '80%': { transform: [{ translateY: 0 }] },
  '100%': { transform: [{ translateY: 0 }] },
};

const SHADOW: CSSAnimationKeyframes = {
  '0%': { opacity: 0.6, transform: [{ scaleX: 1 }] },
  '48%': { opacity: 0.6, transform: [{ scaleX: 1 }] },
  '60%': { opacity: 0.25, transform: [{ scaleX: 0.7 }] },
  '68%': { opacity: 0.25, transform: [{ scaleX: 0.7 }] },
  '80%': { opacity: 0.6, transform: [{ scaleX: 1 }] },
  '100%': { opacity: 0.6, transform: [{ scaleX: 1 }] },
};

/**
 * Variant 3, a barbell: plates slide on from both sides, the bar goes up for a rep and the plates
 * come off again. A rep counter stands where the percentage was.
 */
export function BarbellLoad({ line, elapsed, rep }: BuildingVariantProps & { rep: string }) {
  const height = PLATES[0].height;
  return (
    <View className="flex-1">
      <View className="flex-1 items-center justify-center pb-40" accessibilityElementsHidden>
        <Animated.View
          collapsable={false}
          style={[{ width: BAR_WIDTH, height }, loop(LIFT, REP_SECONDS, 0)]}
        >
          <View
            className="absolute h-2 rounded-full bg-muted"
            style={{ top: height / 2 - 4, width: BAR_WIDTH }}
          />
          {/* Collars */}
          {[-1, 1].map((side) => (
            <View
              key={side}
              className="absolute h-5 w-2 rounded-sm bg-fg-2"
              style={{ top: height / 2 - 10, left: BAR_WIDTH / 2 + side * (INNER - 12) - 4 }}
            />
          ))}
          {PLATES.flatMap((plate, order) =>
            ([-1, 1] as const).map((side) => (
              <Animated.View
                key={`${order}${side}`}
                className="absolute rounded-md"
                style={{
                  width: PLATE_WIDTH,
                  height: plate.height,
                  top: (height - plate.height) / 2,
                  left:
                    BAR_WIDTH / 2 + side * (INNER + order * (PLATE_WIDTH + 2)) - PLATE_WIDTH / 2,
                  backgroundColor: plate.color,
                  ...loop(plateFrames(side, order), REP_SECONDS, 0, 'ease-out'),
                }}
              />
            )),
          )}
        </Animated.View>
        <Animated.View
          className="mt-6 h-3 w-60 rounded-full bg-[#000]"
          style={loop(SHADOW, REP_SECONDS, 0)}
        />
      </View>
      <BuildingCaption line={line} elapsed={elapsed}>
        <Text className="font-inter-semibold text-[56px] leading-16 text-fg tabular-nums">
          {rep}
        </Text>
      </BuildingCaption>
    </View>
  );
}
