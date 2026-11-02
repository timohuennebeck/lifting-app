import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, { type CSSAnimationKeyframes } from 'react-native-reanimated';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { CoachMark } from './coach-mark';

/** One flash, then a rest until the next; each letter lights up a moment after the one before. */
const FLASH_MS = 3500;
const LETTER_MS = 30;

/** A letter brightens and fades back early in each flash. */
const FLASH: CSSAnimationKeyframes = {
  '0%': { color: colors.subtle },
  '6%': { color: colors.fg },
  '18%': { color: colors.subtle },
  '100%': { color: colors.subtle },
};

/** The line with a light running across it from left to right. */
function FlashText({ text }: { text: string }) {
  return (
    <View className="flex-row overflow-hidden" importantForAccessibility="no-hide-descendants">
      {Array.from(text).map((letter, i) => (
        <Animated.Text
          key={i}
          className="font-inter text-sm leading-[17px]"
          style={{
            color: colors.subtle,
            animationName: FLASH,
            animationDuration: `${FLASH_MS}ms`,
            animationDelay: `${i * LETTER_MS}ms`,
            animationIterationCount: 'infinite',
            animationTimingFunction: 'linear',
          }}
        >
          {letter}
        </Animated.Text>
      ))}
    </View>
  );
}

export interface AskCoachCardProps {
  onPress: () => void;
  className?: string;
}

/** "Kai · KI-Coach" over "Frag mich zu deinem Training"; a tap opens the coach (Training tab). */
export function AskCoachCard({ onPress, className }: AskCoachCardProps) {
  const { t } = useTranslation('coach');
  const [flashes, setFlashes] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setFlashes((n) => n + 1), FLASH_MS);
    return () => clearInterval(id);
  }, []);
  return (
    <PressableScale
      haptic="tap"
      accessibilityRole="button"
      accessibilityLabel={`${t('card.label')}: ${t('card.prompt')}`}
      onPress={onPress}
      className={cn(
        'flex-row items-center gap-2.5 rounded-[18px] bg-surface py-1.5 pr-1.5 pl-2',
        className,
      )}
    >
      {/* The diamond turns half a turn with each flash. */}
      <CoachMark size={36} turns={flashes} />
      <View className="min-w-0 flex-1">
        <Text className="font-inter-semibold text-[11px] leading-[13px] tracking-[0.88px] text-dim uppercase">
          {t('card.label')}
        </Text>
        <FlashText text={t('card.prompt')} />
      </View>
      <View className="size-10 items-center justify-center rounded-full bg-control">
        <Icon name="arrow-up" size={12} color={colors.fg} />
      </View>
    </PressableScale>
  );
}
