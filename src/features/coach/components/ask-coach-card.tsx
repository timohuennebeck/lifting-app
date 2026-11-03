import { useIsFocused } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { CoachMark } from '@/shared/ui/coach-mark';
import { FlashText } from '@/shared/ui/flash-text';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

/** One flash, then a rest until the next. */
const FLASH_MS = 3500;

export interface AskCoachCardProps {
  onPress: () => void;
  className?: string;
}

/** "Kai · KI-Coach" over "Frag mich zu deinem Training"; a tap opens the coach (Training tab). */
export function AskCoachCard({ onPress, className }: AskCoachCardProps) {
  const { t } = useTranslation('coach');
  // Behind another tab or the coach itself, the card rests.
  const focused = useIsFocused();
  const [flashes, setFlashes] = useState(0);
  useEffect(() => {
    if (!focused) return;
    const id = setInterval(() => setFlashes((n) => n + 1), FLASH_MS);
    return () => clearInterval(id);
  }, [focused]);
  return (
    <PressableScale
      haptic="tap"
      accessibilityRole="button"
      accessibilityLabel={`${t('title')}: ${t('card.prompt')}`}
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
          {t('title')}
        </Text>
        <FlashText
          text={t('card.prompt')}
          periodMs={FLASH_MS}
          paused={!focused}
          className="text-sm leading-[17px]"
        />
      </View>
      <View className="size-10 items-center justify-center rounded-full bg-control">
        <Icon name="arrow-up" size={12} color={colors.fg} />
      </View>
    </PressableScale>
  );
}
