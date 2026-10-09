import { router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { Screen } from '@/shared/ui/screen';
import { StepHeader } from '@/shared/ui/step-header';
import { StepTitle } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';

import {
  CELEBRATION_DELAY_MS,
  CELEBRATION_MS,
  FingerprintHold,
} from '../components/fingerprint-hold';
import { START_STEPS } from '../lib/flow';
import { useDraft } from '../stores/onboarding-store';

const PROMISES = ['stick', 'track'] as const;

export function PromiseScreen() {
  const { t } = useTranslation('onboarding');
  const name = useDraft().firstName.trim();
  const [attempt, setAttempt] = useState(0);
  const sealed = useRef(false);
  const leave = useSharedValue(0);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Coming back from the next step starts a fresh commitment.
  useFocusEffect(
    useCallback(() => {
      if (sealed.current) {
        sealed.current = false;
        leave.set(0);
        setAttempt((a) => a + 1);
      }
      return () => clearTimeout(timer.current);
    }, [leave]),
  );

  const onSealed = () => {
    sealed.current = true;
    leave.set(withDelay(CELEBRATION_DELAY_MS, withTiming(1, { duration: 300 })));
    timer.current = setTimeout(
      () => router.push('/paywall'),
      CELEBRATION_DELAY_MS + CELEBRATION_MS,
    );
  };

  const uiStyle = useAnimatedStyle(() => ({
    opacity: 1 - leave.get(),
    transform: [{ scale: 1 - leave.get() * 0.06 }],
  }));

  return (
    <Screen
      header={
        <Animated.View style={uiStyle}>
          <StepHeader step={1} total={START_STEPS} />
        </Animated.View>
      }
    >
      <Animated.View style={uiStyle}>
        <StepTitle title={name ? t('promise.titleNamed', { name }) : t('promise.title')} />
        <View className="gap-0.5 px-6 pt-4.5">
          {/* Fixed commitments: always checked, not toggleable. */}
          {PROMISES.map((key) => (
            <View key={key} className="min-h-11 flex-row items-center gap-3.5">
              <View className="size-6 items-center justify-center rounded-full bg-accent">
                <Icon name="check" size={14} color={colors.onAccent} />
              </View>
              <Text variant="body" tone="secondary" className="flex-1 text-base">
                {t(`promise.${key}`)}
              </Text>
            </View>
          ))}
        </View>
      </Animated.View>
      <View className="flex-1 items-center justify-center pb-10">
        <FingerprintHold key={attempt} onSealed={onSealed} />
      </View>
    </Screen>
  );
}
