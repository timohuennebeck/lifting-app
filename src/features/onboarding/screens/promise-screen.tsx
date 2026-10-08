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

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
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
  const [checked, setChecked] = useState({ stick: true, track: true });
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
      () => router.push('/create-account'),
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
        <View className="gap-0.5 px-6 pt-[18px]">
          {PROMISES.map((key) => {
            const on = checked[key];
            return (
              <PressableScale
                key={key}
                haptic="select"
                accessibilityRole="checkbox"
                accessibilityState={{ checked: on }}
                onPress={() => setChecked((c) => ({ ...c, [key]: !c[key] }))}
                className="min-h-11 flex-row items-center gap-3.5"
              >
                <View
                  className={cn(
                    'size-6 items-center justify-center rounded-full',
                    on ? 'bg-accent' : 'border-[1.5px] border-[#4A4A46]',
                  )}
                >
                  {on ? <Icon name="check" size={14} color={colors.onAccent} /> : null}
                </View>
                <Text variant="body" tone="secondary" className="flex-1 text-base">
                  {t(`promise.${key}`)}
                </Text>
              </PressableScale>
            );
          })}
        </View>
      </Animated.View>
      <View className="flex-1 items-center justify-center pb-10">
        <FingerprintHold key={attempt} onSealed={onSealed} />
      </View>
    </Screen>
  );
}
