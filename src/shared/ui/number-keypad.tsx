import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { type LayoutChangeEvent, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/shared/lib/cn';
import { decimalSeparator, KEYPAD_ROWS, type KeypadKey } from '@/shared/lib/keypad';
import { colors } from '@/shared/lib/theme';

import { Icon } from './icon';
import { PressableScale } from './pressable-scale';
import { Text } from './text';

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

export interface NumberKeypadProps {
  /** Enables the decimal key (weights). */
  decimal: boolean;
  onKey: (key: KeypadKey) => void;
  onBackspace: () => void;
  onConfirm: () => void;
  /** Hides the keypad: the handle, a swipe down or the keyboard key. */
  onDismiss: () => void;
  onLayout?: (e: LayoutChangeEvent) => void;
}

/**
 * Number pad sliding up from the bottom (design 03·C·2B): digits, a hide-keyboard key above
 * the backspace, and a tall check. Used for logging sets and for editing targets.
 */
export function NumberKeypad({
  decimal,
  onKey,
  onBackspace,
  onConfirm,
  onDismiss,
  onLayout,
}: NumberKeypadProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  // Swipe the panel down to close it.
  const swipe = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetY(12)
    .onEnd((e) => {
      if (e.translationY > 40) onDismiss();
    });

  const digit = (key: KeypadKey) => (
    <Key key={key} label={key} onPress={() => onKey(key)} className="flex-1" />
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
          onPress={onDismiss}
          className="self-center py-0.5"
        >
          <View className="h-1.25 w-9 rounded-full bg-track" />
        </PressableScale>
        <View className="flex-row gap-1.5">
          <View className="flex-1 gap-1.5">
            {KEYPAD_ROWS.map((row) => (
              <View key={row.join()} className="flex-row gap-1.5">
                {row.map(digit)}
              </View>
            ))}
            <View className="flex-row gap-1.5">
              <Key
                label={decimalSeparator()}
                accessibilityLabel={t('keypad.decimal')}
                disabled={!decimal}
                onPress={() => onKey('.')}
                className="flex-1"
              />
              <Key label="0" onPress={() => onKey('0')} className="flex-2" />
            </View>
          </View>
          <View className="w-21.5 gap-1.5">
            <Key accessibilityLabel={t('keypad.close')} onPress={onDismiss}>
              <Icon name="keyboard-hide" size={24} color={colors.fg} />
            </Key>
            <Key accessibilityLabel={t('keypad.backspace')} onPress={onBackspace}>
              <Icon name="backspace" size={24} color={colors.fg} />
            </Key>
            <PressableScale
              haptic="press"
              accessibilityLabel={t('keypad.confirm')}
              onPress={onConfirm}
              className="flex-1 items-center justify-center rounded-xl bg-accent"
            >
              <Icon name="check-thin" size={26} color={colors.onAccent} />
            </PressableScale>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
