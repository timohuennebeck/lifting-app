import { type ReactNode, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { type LayoutChangeEvent, View } from 'react-native';
import { Gesture, GestureDetector, type TapGesture } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  type SharedValue,
  SlideInDown,
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/shared/lib/cn';
import { haptics } from '@/shared/lib/haptics';
import { decimalSeparator, KEYPAD_ROWS, type KeypadKey } from '@/shared/lib/keypad';
import { colors } from '@/shared/lib/theme';

import { Icon } from './icon';
import { PressableScale } from './pressable-scale';
import { Text } from './text';

type KeyId = KeypadKey | 'hide' | 'backspace' | 'confirm';
const KEY_IDS: KeyId[] = [...KEYPAD_ROWS.flat(), '.', '0', 'hide', 'backspace', 'confirm'];

/** The keys held down now, for their press animation. */
type HeldKeys = Partial<Record<KeyId, boolean>>;

interface KeyProps {
  id: KeyId;
  tap: TapGesture;
  held: SharedValue<HeldKeys>;
  /** What the key does, for screen readers (a tap goes through `tap`). */
  onPress: () => void;
  label?: string;
  disabled?: boolean;
  /** The check: neon, as tall as the space left. */
  accent?: boolean;
  className?: string;
  children?: ReactNode;
  accessibilityLabel?: string;
}

function Key({
  id,
  tap,
  held,
  onPress,
  label,
  disabled,
  accent,
  className,
  children,
  accessibilityLabel,
}: KeyProps) {
  // Scaled down while held, timed both ways as PressableScale.
  const style = useAnimatedStyle(() => {
    const down = !!held.value[id];
    return {
      transform: [
        {
          scale: withTiming(down ? 0.94 : 1, {
            duration: down ? 90 : 140,
            easing: Easing.out(Easing.quad),
          }),
        },
      ],
    };
  });
  return (
    <GestureDetector gesture={tap}>
      <Animated.View
        accessible
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ disabled }}
        accessibilityActions={[{ name: 'activate' }]}
        onAccessibilityAction={(e) => {
          if (e.nativeEvent.actionName === 'activate' && !disabled) onPress();
        }}
        style={style}
        className={cn(
          'items-center justify-center rounded-xl',
          accent ? 'flex-1 bg-accent' : 'h-11.5 bg-control',
          disabled && 'opacity-30',
          className,
        )}
      >
        {children ?? <Text className="font-inter-medium text-2xl leading-7 text-fg">{label}</Text>}
      </Animated.View>
    </GestureDetector>
  );
}

/** The key held down whose press hasn't counted yet, for the taps' callbacks (not render). */
function usePendingKey() {
  const ref = useRef<KeyId | null>(null);
  return {
    get: () => ref.current,
    set: (id: KeyId | null) => {
      ref.current = id;
    },
  };
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
  const held = useSharedValue<HeldKeys>({});
  const pending = usePendingKey();

  // Swipe the panel down to close it.
  const swipe = Gesture.Pan()
    .runOnJS(true)
    .activeOffsetY(12)
    .onEnd((e) => {
      if (e.translationY > 40) onDismiss();
    });

  const run = (id: KeyId) => {
    haptics[id === 'confirm' ? 'press' : 'tap']();
    if (id === 'hide') onDismiss();
    else if (id === 'backspace') onBackspace();
    else if (id === 'confirm') onConfirm();
    else onKey(id);
  };

  // Each key has a tap of its own, and they may run at once, so a key touched while another is
  // still held counts too (fast typing with both thumbs). A key counts when let go of, or when
  // the next key is touched first, so the keys keep the order they were typed in. A slide off
  // the key or a swipe down cancels it.
  const taps = Object.fromEntries(
    KEY_IDS.map((id) => [
      id,
      Gesture.Tap()
        .runOnJS(true)
        .enabled(id !== '.' || decimal)
        .maxDuration(60_000)
        .maxDistance(24)
        .onBegin(() => {
          const previous = pending.get();
          if (previous && previous !== id) run(previous);
          pending.set(id);
          held.set((keys) => ({ ...keys, [id]: true }));
        })
        .onEnd((_e, success) => {
          if (success && pending.get() === id) run(id);
        })
        .onFinalize(() => {
          if (pending.get() === id) pending.set(null);
          held.set((keys) => ({ ...keys, [id]: false }));
        }),
    ]),
  ) as Record<KeyId, TapGesture>;
  const all = Object.values(taps);
  for (const tap of all)
    tap.simultaneousWithExternalGesture(...all.filter((other) => other !== tap));

  const keyProps = (id: KeyId) => ({ id, tap: taps[id], held, onPress: () => run(id) });

  return (
    <GestureDetector gesture={swipe}>
      <Animated.View
        entering={SlideInDown.springify().mass(1).damping(30).stiffness(260)}
        exiting={SlideOutDown.duration(180)}
        onLayout={onLayout}
        className="absolute inset-x-0 bottom-0 z-20 gap-2.5 rounded-t-[18px] border-t border-white/6 bg-surface px-3 pt-2"
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
                {row.map((digit) => (
                  <Key key={digit} {...keyProps(digit)} label={digit} className="flex-1" />
                ))}
              </View>
            ))}
            <View className="flex-row gap-1.5">
              <Key
                {...keyProps('.')}
                label={decimalSeparator()}
                accessibilityLabel={t('keypad.decimal')}
                disabled={!decimal}
                className="flex-1"
              />
              <Key {...keyProps('0')} label="0" className="flex-2" />
            </View>
          </View>
          <View className="w-21.5 gap-1.5">
            <Key {...keyProps('hide')} accessibilityLabel={t('keypad.close')}>
              <Icon name="keyboard-hide" size={24} color={colors.fg} />
            </Key>
            <Key {...keyProps('backspace')} accessibilityLabel={t('keypad.backspace')}>
              <Icon name="backspace" size={24} color={colors.fg} />
            </Key>
            <Key {...keyProps('confirm')} accessibilityLabel={t('keypad.confirm')} accent>
              <Icon name="check-thin" size={26} color={colors.onAccent} />
            </Key>
          </View>
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
