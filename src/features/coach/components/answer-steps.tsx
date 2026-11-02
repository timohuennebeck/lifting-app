import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, { type CSSAnimationKeyframes } from 'react-native-reanimated';

import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';

import { CoachMark } from './coach-mark';

const SPIN: CSSAnimationKeyframes = { to: { transform: [{ rotate: '360deg' }] } };

/** The current step's text brightens and dims (the design's shimmer). */
const SHIMMER: CSSAnimationKeyframes = {
  '0%': { color: colors.subtle },
  '50%': { color: colors.fg },
  '100%': { color: colors.subtle },
};

/** What the coach has done so far, from the answer's stream. */
export interface AnswerProgress {
  /** "142 Trainings durchsucht": what the model looked through. */
  searched: { of: 'workouts' | 'weights' | 'checks'; count: number } | null;
  /** The data for the answer is there. */
  found: boolean;
}

function DoneStep({ label }: { label: string }) {
  return (
    <View className="flex-row items-center gap-2.5">
      <View className="size-5 items-center justify-center rounded-full bg-elevated">
        <Icon name="check" size={10} color={colors.accent} />
      </View>
      <Text className="font-inter-medium text-sm leading-[17px] text-subtle">{label}</Text>
    </View>
  );
}

/**
 * The coach at work (design CO2-F): the steps done with a tick, the current one with a spinning
 * ring and shimmering text. Neutral, so it guesses no chart before the answer comes.
 */
export function AnswerSteps({ progress }: { progress: AnswerProgress }) {
  const { t } = useTranslation('coach');
  const { searched, found } = progress;
  const current = searched && !found ? t('steps.searching') : t('steps.writing');
  return (
    <View className="flex-row gap-2.5">
      <CoachMark animation="think" />
      <View className="min-w-0 flex-1 gap-2.5 pt-1">
        {searched ? <DoneStep label={t(`steps.searched.${searched.of}`, searched)} /> : null}
        {found ? <DoneStep label={t('steps.found')} /> : null}
        <View className="flex-row items-center gap-2.5">
          <Animated.View
            className="size-5 rounded-full border-2 border-control"
            style={{
              borderTopColor: colors.accent,
              animationName: SPIN,
              animationDuration: '0.8s',
              animationIterationCount: 'infinite',
              animationTimingFunction: 'linear',
            }}
          />
          <Animated.Text
            className="font-inter-semibold text-sm leading-[17px]"
            style={{
              color: colors.subtle,
              animationName: SHIMMER,
              animationDuration: '1.8s',
              animationIterationCount: 'infinite',
              animationTimingFunction: 'linear',
            }}
          >
            {current}
          </Animated.Text>
        </View>
      </View>
    </View>
  );
}
