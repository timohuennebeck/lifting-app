import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  type SharedValue,
  useAnimatedProps,
  useAnimatedReaction,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { scheduleOnRN } from 'react-native-worklets';

import { haptics } from '@/shared/lib/haptics';
import { colors } from '@/shared/lib/theme';
import { Text } from '@/shared/ui/text';

import { FINGERPRINT_VIEWBOX, RIDGE_PATHS } from '../lib/fingerprint-ridges';

const HOLD_MS = 1800;
/** Pause between sealing and the zoom celebration, then its length. */
export const CELEBRATION_DELAY_MS = 380;
export const CELEBRATION_MS = 2700;
const FP = { width: 140, height: 196, left: 30, top: 2 };
const ZOOM_EASING = Easing.bezier(0.8, 0, 0.15, 1);

type Phase = 'idle' | 'holding' | 'sealed';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface RidgeProps {
  d: string;
  index: number;
  progress: SharedValue<number>;
  color: string;
}

/** A ridge fades in once the hold reaches it, so the print fills line by line. */
function Ridge({ d, index, progress, color }: RidgeProps) {
  const animatedProps = useAnimatedProps(() => ({
    fillOpacity: Math.min(1, Math.max(0, progress.get() * RIDGE_PATHS.length - index)),
  }));
  return <AnimatedPath d={d} fill={color} animatedProps={animatedProps} />;
}

export interface FingerprintHoldProps {
  /** Called once the thumb was held for the full duration. */
  onSealed: () => void;
}

/** Hold-to-commit fingerprint: ridges light up one by one while pressed, then zoom into the screen. */
export function FingerprintHold({ onSealed }: FingerprintHoldProps) {
  const { t } = useTranslation('onboarding');
  const [phase, setPhase] = useState<Phase>('idle');
  const progress = useSharedValue(0);
  const zoom = useSharedValue(0);
  const pulse = useSharedValue(1);
  const burst = useSharedValue(0);
  const out = useSharedValue(0);
  const fade = useSharedValue(1);

  const seal = () => {
    setPhase('sealed');
    haptics.success();
    onSealed();
  };

  // Light haptic ticks while the fill climbs, like a ratchet.
  useAnimatedReaction(
    () => Math.floor(progress.get() * 8),
    (step, prev) => {
      if (prev !== null && step > prev && step < 8) scheduleOnRN(haptics.select);
    },
  );

  useEffect(() => {
    if (phase !== 'sealed') return;
    const d = CELEBRATION_DELAY_MS;
    pulse.set(
      withDelay(
        d,
        withSequence(withTiming(0.88, { duration: 170 }), withTiming(1, { duration: 210 })),
      ),
    );
    zoom.set(withDelay(d + 340, withTiming(1, { duration: 1500, easing: ZOOM_EASING })));
    burst.set(
      withDelay(d + 300, withTiming(1, { duration: 1400, easing: Easing.out(Easing.quad) })),
    );
    fade.set(withDelay(d, withTiming(0, { duration: 300 })));
    out.set(withDelay(d + 2150, withTiming(1, { duration: 550, easing: Easing.in(Easing.quad) })));
    const timer = setTimeout(haptics.heavy, d + 350);
    return () => clearTimeout(timer);
  }, [phase, pulse, zoom, burst, fade, out]);

  const start = () => {
    if (phase === 'sealed') return;
    setPhase('holding');
    haptics.tap();
    const remaining = HOLD_MS * (1 - progress.get());
    progress.set(
      withTiming(1, { duration: remaining, easing: Easing.linear }, (finished) => {
        if (finished) scheduleOnRN(seal);
      }),
    );
  };

  const stop = () => {
    if (phase === 'sealed' || progress.get() >= 1) return;
    cancelAnimation(progress);
    progress.set(withTiming(0, { duration: 220 }));
    setPhase('idle');
  };

  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: phase === 'holding' ? withTiming(0.95) : withTiming(1) }],
  }));
  const glowStyle = useAnimatedStyle(() => ({
    opacity: (phase === 'sealed' ? 1 : progress.get() * 0.6) * fade.get(),
  }));
  const hintStyle = useAnimatedStyle(() => ({ opacity: fade.get() }));
  const printStyle = useAnimatedStyle(() => ({
    opacity: 1 - out.get(),
    transform: [
      { scale: pulse.get() * (1 + zoom.get() * 5.5) * (1 + out.get() * 0.35) },
      { rotate: `${zoom.get() * 6}deg` },
    ],
  }));
  const burstStyle = useAnimatedStyle(() => {
    const b = burst.get();
    return {
      opacity: (b < 0.3 ? b / 0.3 : 1 - (b - 0.3) / 0.7) * (1 - out.get()),
      transform: [{ scale: b < 0.3 ? 0.3 + b : 0.6 + ((b - 0.3) / 0.7) * 2.4 }],
    };
  });

  const hint =
    phase === 'sealed'
      ? t('promise.sealed')
      : phase === 'holding'
        ? t('promise.holding')
        : t('promise.hold');

  return (
    <View className="items-center gap-5">
      <Pressable
        onPressIn={start}
        onPressOut={stop}
        accessibilityRole="button"
        accessibilityLabel={t('promise.holdLabel')}
        accessibilityState={{ checked: phase === 'sealed' }}
        accessibilityActions={[{ name: 'activate' }]}
        onAccessibilityAction={() => phase !== 'sealed' && seal()}
      >
        <Animated.View style={[{ width: 200, height: 200 }, pressStyle]}>
          <Animated.View
            pointerEvents="none"
            className="absolute -inset-7.5 rounded-full"
            style={[
              {
                experimental_backgroundImage: `radial-gradient(circle, ${colors.accent}38 0%, transparent 65%)`,
              },
              glowStyle,
            ]}
          />
          <Animated.View
            pointerEvents="none"
            className="absolute size-130 rounded-full"
            style={[
              {
                left: 100 - 260,
                top: 100 - 260,
                experimental_backgroundImage: `radial-gradient(circle closest-side, ${colors.accent}73, transparent)`,
              },
              burstStyle,
            ]}
          />
          <Animated.View pointerEvents="none" className="absolute" style={[FP, printStyle]}>
            <Svg width={FP.width} height={FP.height} viewBox={FINGERPRINT_VIEWBOX}>
              {RIDGE_PATHS.map((d, i) => (
                <Path key={`base-${i}`} d={d} fill={colors.track} />
              ))}
              {RIDGE_PATHS.map((d, i) => (
                <Ridge key={i} d={d} index={i} progress={progress} color={colors.accent} />
              ))}
            </Svg>
          </Animated.View>
        </Animated.View>
      </Pressable>
      <Animated.View style={hintStyle}>
        <Text variant="label" tone="muted" accessibilityLiveRegion="polite">
          {hint}
        </Text>
      </Animated.View>
    </View>
  );
}
