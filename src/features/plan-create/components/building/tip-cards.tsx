import { useWindowDimensions, View } from 'react-native';
import Animated, {
  FadeInDown,
  FadeOutUp,
  type CSSAnimationKeyframes,
} from 'react-native-reanimated';

import { cn } from '@/shared/lib/cn';
import { SpinnerGlyph } from '@/shared/ui/spark-glyph';
import { Text } from '@/shared/ui/text';

import { BuildingCaption } from './building-caption';
import { FLOAT, loop } from './motion';
import type { BuildingVariantProps } from './motion';

/** Seconds a tip stays. */
const TIP_SECONDS = 5;
/** The moving bar's share of the track. */
const SWEEP = 0.35;

/**
 * Variant 5, tips while waiting: a training tip changes every few seconds over a bar that sweeps
 * back and forth instead of filling up.
 */
export function TipCards({
  seconds,
  line,
  elapsed,
  title,
  tips,
}: BuildingVariantProps & { title: string; tips: readonly string[] }) {
  const { width } = useWindowDimensions();
  const track = width - 48;
  const tip = Math.floor(seconds / TIP_SECONDS) % tips.length;
  const sweep: CSSAnimationKeyframes = {
    '0%': { transform: [{ translateX: -track * SWEEP }] },
    '100%': { transform: [{ translateX: track }] },
  };
  return (
    <View className="flex-1">
      <View className="flex-1 justify-center gap-6 px-6 pb-36">
        <View className="items-center">
          <Animated.View collapsable={false} style={loop(FLOAT, 2.4)}>
            <SpinnerGlyph />
          </Animated.View>
        </View>
        <View className="min-h-48 gap-4 rounded-3xl bg-surface p-6">
          <Text variant="overline" tone="accent">
            {title}
          </Text>
          <Animated.View
            key={tip}
            entering={FadeInDown.duration(400)}
            exiting={FadeOutUp.duration(250)}
          >
            <Text className="font-inter-semibold text-[22px] leading-7.5 text-fg">{tips[tip]}</Text>
          </Animated.View>
        </View>
        <View className="flex-row justify-center gap-1.5">
          {tips.map((_, i) => (
            <View
              key={i}
              className={cn('h-1.5 rounded-full', i === tip ? 'w-5 bg-accent' : 'w-1.5 bg-control')}
            />
          ))}
        </View>
      </View>
      <BuildingCaption line={line} elapsed={elapsed}>
        <View className="mb-2 h-1 w-full overflow-hidden rounded-sm bg-control">
          <Animated.View
            className="h-1 rounded-sm bg-accent"
            style={{ width: track * SWEEP, ...loop(sweep, 1.6, 0, 'ease-in-out') }}
          />
        </View>
      </BuildingCaption>
    </View>
  );
}
