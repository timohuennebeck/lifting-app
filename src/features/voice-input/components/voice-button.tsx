import { View } from 'react-native';
import Animated, {
  type CSSAnimationKeyframes,
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

/** The bars' heights from the outside in, as a share of the tallest (next to the button). */
const BARS = [0.62, 0.74, 0.88, 1];
const BAR_MIN = 8;
const BAR_MAX = 34;
/** The bars stand at least this tall in silence, so they never vanish while listening. */
const QUIET_LEVEL = 0.4;

/** Each bar also sways at its own pace (seconds), so they look alive between volume changes. */
const PACES = [0.62, 0.8, 0.98, 0.71];
const SWAY: CSSAnimationKeyframes = {
  '0%': { transform: [{ scaleY: 1 }] },
  '50%': { transform: [{ scaleY: 0.72 }] },
  '100%': { transform: [{ scaleY: 1 }] },
};

interface BarProps {
  share: number;
  level: SharedValue<number>;
  /** Seconds per sway. */
  pace: number;
}

function Bar({ share, level, pace }: BarProps) {
  const size = useAnimatedStyle(() => ({
    height: BAR_MIN + (BAR_MAX - BAR_MIN) * share * Math.max(QUIET_LEVEL, level.get()),
  }));
  return (
    <Animated.View className="w-1.25" style={size}>
      <Animated.View
        className="flex-1 rounded-full bg-accent"
        style={{
          animationName: SWAY,
          animationDuration: `${pace}s`,
          animationIterationCount: 'infinite',
          animationTimingFunction: 'ease-in-out',
        }}
      />
    </Animated.View>
  );
}

interface BarsProps {
  level: SharedValue<number>;
  /** Right of the button: the tallest bar first. */
  mirrored?: boolean;
}

function Bars({ level, mirrored }: BarsProps) {
  const shares = mirrored ? [...BARS].reverse() : BARS;
  return (
    <View className="flex-row items-center gap-1.25">
      {shares.map((share, i) => (
        <Bar key={i} share={share} level={level} pace={PACES[i]} />
      ))}
    </View>
  );
}

export interface VoiceButtonProps {
  listening: boolean;
  /** Voice volume, 0–1. */
  level: SharedValue<number>;
  /** What to do or what happens, under the button. */
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
}

/** The voice input's microphone button: neon with volume bars beside it while listening. */
export function VoiceButton({
  listening,
  level,
  label,
  accessibilityLabel,
  onPress,
}: VoiceButtonProps) {
  return (
    <View className="items-center gap-4.5">
      <View className="flex-row items-center gap-6">
        <View className="w-9 items-end">{listening ? <Bars level={level} /> : null}</View>
        <PressableScale
          haptic="press"
          activeScale={0.94}
          accessibilityLabel={accessibilityLabel}
          onPress={onPress}
          className={cn(
            'size-24 items-center justify-center rounded-full',
            listening ? 'bg-accent' : 'bg-elevated',
          )}
        >
          <Icon name="mic" size={22} color={listening ? colors.onAccent : colors.fg} />
        </PressableScale>
        <View className="w-9 items-start">
          {listening ? <Bars level={level} mirrored /> : null}
        </View>
      </View>
      <Text variant="label" tone="muted" accessibilityLiveRegion="polite" className="font-inter">
        {label}
      </Text>
    </View>
  );
}
