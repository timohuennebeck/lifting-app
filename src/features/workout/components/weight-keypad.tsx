import type { ReactNode } from 'react';
import { type LayoutChangeEvent, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { KEYPAD_ROWS, type KeypadKey } from '../lib/keypad';
import { decimalSeparator } from '../lib/weight';
import { useWorkoutSessionStore } from '../stores/workout-session-store';

interface KeyProps {
  label?: string;
  onPress: () => void;
  disabled?: boolean;
  className?: string;
  children?: ReactNode;
  accessibilityLabel?: string;
}

function Key({ label, onPress, disabled, className, children, accessibilityLabel }: KeyProps) {
  return (
    <PressableScale
      haptic="tap"
      activeScale={0.94}
      disabled={disabled}
      onPress={onPress}
      accessibilityLabel={accessibilityLabel ?? label}
      className={cn(
        'h-11.5 items-center justify-center rounded-xl bg-control',
        disabled && 'opacity-30',
        className,
      )}
    >
      {children ?? <Text className="font-inter-medium text-2xl leading-7 text-fg">{label}</Text>}
    </PressableScale>
  );
}

export interface WeightKeypadProps {
  onConfirm: () => void;
  onLayout?: (e: LayoutChangeEvent) => void;
}

/** Custom numeric keypad (design 03·C·2B, without the ± chips): digits, backspace and a tall check. */
export function WeightKeypad({ onConfirm, onLayout }: WeightKeypadProps) {
  const { t } = useTranslation('workout');
  const insets = useSafeAreaInsets();
  const field = useWorkoutSessionStore((s) => s.field);
  const pressKey = useWorkoutSessionStore((s) => s.pressKey);
  const pressBackspace = useWorkoutSessionStore((s) => s.pressBackspace);
  const closeKeypad = useWorkoutSessionStore((s) => s.closeKeypad);
  const isWeight = field === 'weight';
  const separator = decimalSeparator();

  // Swipe the panel down to close it.
  const swipe = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetY(12)
    .onEnd((e) => {
      if (e.translationY > 40) closeKeypad();
    });

  const digit = (key: KeypadKey) => (
    <Key key={key} label={key} onPress={() => pressKey(key)} className="flex-1" />
  );

  return (
    <GestureDetector gesture={swipe}>
      <Animated.View
        entering={SlideInDown.springify().mass(1).damping(30).stiffness(260)}
        exiting={SlideOutDown.duration(180)}
        onLayout={onLayout}
        className="absolute inset-x-0 bottom-0 z-20 gap-2.5 rounded-t-[28px] border-t border-white/6 bg-surface px-3 pt-2"
        style={{ paddingBottom: Math.max(insets.bottom, 12) + 8 }}
      >
        <PressableScale
          haptic="none"
          hitSlop={12}
          accessibilityLabel={t('keypad.close')}
          onPress={closeKeypad}
          className="self-center py-0.5"
        >
          <View className="h-1.25 w-9 rounded-full bg-track" />
        </PressableScale>
        <Text variant="overline" tone="subtle" className="px-1">
          {t(`keypad.${field}`)}
        </Text>
        <View className="flex-row gap-1.5">
          <View className="flex-1 gap-1.5">
            {KEYPAD_ROWS.map((row) => (
              <View key={row.join()} className="flex-row gap-1.5">
                {row.map(digit)}
              </View>
            ))}
            <View className="flex-row gap-1.5">
              <Key
                label={separator}
                accessibilityLabel={t('keypad.decimal')}
                disabled={!isWeight}
                onPress={() => pressKey('.')}
                className="flex-1"
              />
              <Key label="0" onPress={() => pressKey('0')} className="flex-2" />
            </View>
          </View>
          <View className="w-21.5 gap-1.5">
            <Key accessibilityLabel={t('keypad.backspace')} onPress={pressBackspace}>
              <Icon name="backspace" size={24} color={colors.fg} />
            </Key>
            <PressableScale
              haptic="press"
              accessibilityLabel={t('keypad.confirm')}
              onPress={onConfirm}
              className="flex-1 items-center justify-center rounded-xl bg-accent"
            >
              <Icon name="check" size={28} color={colors.onAccent} />
            </PressableScale>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
