import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp, LayoutAnimationConfig } from 'react-native-reanimated';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { CoachMark } from './coach-mark';

/** How long each example question shows before the next slides in. */
const QUESTION_MS = 3500;

export interface AskCoachCardProps {
  onPress: () => void;
  className?: string;
}

/** "Frag Kai" over example questions that take turns; a tap opens the coach (Training tab). */
export function AskCoachCard({ onPress, className }: AskCoachCardProps) {
  const { t } = useTranslation('coach');
  const questions = t('card.questions', { returnObjects: true });
  const [turn, setTurn] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTurn((n) => n + 1), QUESTION_MS);
    return () => clearInterval(id);
  }, []);
  return (
    <PressableScale
      haptic="tap"
      accessibilityRole="button"
      accessibilityLabel={t('card.label')}
      onPress={onPress}
      className={cn(
        'flex-row items-center gap-2.5 rounded-full bg-surface py-1.5 pr-1.5 pl-2',
        className,
      )}
    >
      <CoachMark size={36} />
      <View className="min-w-0 flex-1">
        <Text className="font-inter-semibold text-[11px] leading-[13px] tracking-[0.88px] text-dim uppercase">
          {t('card.label')}
        </Text>
        {/* The question leaves upwards as the next one comes in from below. */}
        <View className="h-[17px] overflow-hidden" importantForAccessibility="no-hide-descendants">
          <LayoutAnimationConfig skipEntering>
            <Animated.Text
              key={turn}
              entering={FadeInDown.duration(350)}
              exiting={FadeOutUp.duration(350)}
              numberOfLines={1}
              className="absolute inset-x-0 top-0 font-inter text-sm leading-[17px] text-fg-2"
            >
              {questions[turn % questions.length]}
            </Animated.Text>
          </LayoutAnimationConfig>
        </View>
      </View>
      <View className="size-10 items-center justify-center rounded-full bg-control">
        <Icon name="arrow-up" size={12} color={colors.fg} />
      </View>
    </PressableScale>
  );
}
