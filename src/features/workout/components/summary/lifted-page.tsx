import { Image } from 'expo-image';
import { useEffect, useId, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { formatNumber, kgToLb, type UnitSystem, weightUnit } from '@/shared/lib/format';
import { colors } from '@/shared/lib/theme';
import { Text } from '@/shared/ui/text';

import type { LiftObject } from '../../lib/lift-comparison';
import { StoryTitle, storyAccent } from './story-title';

const COUNT_MS = 1200;
const GLOW = 340;

/** `target`, counted up from 0 with an ease-out (at once with reduced motion). */
function useCountUp(target: number) {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const start = Date.now();
    let frame = 0;
    const tick = () => {
      const t = Math.min(1, (Date.now() - start) / COUNT_MS);
      setValue(target * (1 - (1 - t) ** 3));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, reduced]);
  return reduced ? target : value;
}

/** A soft neon light behind the object. */
function Glow() {
  const id = useId();
  return (
    <Svg width={GLOW} height={GLOW} style={{ position: 'absolute' }}>
      <Defs>
        <RadialGradient id={id} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={colors.accent} stopOpacity={0.22} />
          <Stop offset="1" stopColor={colors.accent} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={GLOW / 2} cy={GLOW / 2} r={GLOW / 2} fill={`url(#${id})`} />
    </Svg>
  );
}

export interface LiftedPageProps {
  /** Weight the workout moved. */
  kg: number;
  /** The heaviest object it reaches. */
  object: LiftObject;
  units: UnitSystem;
  bottomInset: number;
}

/** Story page 1: the weight the workout moved, as the object it outweighs, and counting up. */
export function LiftedPage({ kg, object, units, bottomInset }: LiftedPageProps) {
  const { t } = useTranslation('workout');
  const total = units === 'imperial' ? kgToLb(kg) : kg;
  const shown = useCountUp(total);
  const moved = t('summary.story.moved', { unit: weightUnit(units) });
  return (
    <View className="flex-1 px-5 pt-8" style={{ paddingBottom: bottomInset }}>
      <StoryTitle overline={t('summary.story.liftedToday')}>
        <Trans
          t={t}
          i18nKey={`summary.story.objects.${object.id}`}
          components={{ accent: storyAccent }}
        />
      </StoryTitle>
      <View
        className="flex-1 items-center justify-center py-6"
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Glow />
        {object.image ? (
          <Image source={object.image} contentFit="contain" style={{ width: '100%', flex: 1 }} />
        ) : (
          <Text style={{ fontSize: 140, lineHeight: 170 }}>{object.emoji}</Text>
        )}
      </View>
      <View
        className="flex-row items-baseline gap-2.5"
        accessible
        accessibilityLabel={`${formatNumber(total, 0)} ${moved}`}
      >
        <Text className="font-inter-semibold text-[56px] leading-16 tabular-nums">
          {formatNumber(shown, 0)}
        </Text>
        <Text tone="muted" className="font-inter-semibold text-xl leading-6">
          {moved}
        </Text>
      </View>
    </View>
  );
}
