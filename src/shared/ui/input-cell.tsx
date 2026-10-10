import { type ReactNode, useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';

import { Text } from './text';

function BlinkingCursor() {
  const opacity = useSharedValue(1);
  useEffect(() => {
    const step = (to: number) => withDelay(500, withTiming(to, { duration: 0 }));
    opacity.set(withRepeat(withSequence(step(0), step(1)), -1));
  }, [opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.get() }));
  return <Animated.View className="h-5 w-0.5 rounded-full bg-accent" style={style} />;
}

export interface InputCellProps {
  /** Text shown in the box: the keypad buffer while active. */
  value: string;
  /** Being typed into with the number pad. */
  active: boolean;
  /** The next key replaces the value, so it is shown selected. */
  pristine: boolean;
  label: string;
  onPress: () => void;
  /** Dim text in an empty box that isn't being typed into, e.g. "Optional". */
  placeholder?: string;
  className?: string;
  children?: ReactNode;
}

/** A number box filled with the in-app number pad (sets in the workout, targets in plans). */
export function InputCell({
  value,
  active,
  pristine,
  label,
  onPress,
  placeholder,
  className,
  children,
}: InputCellProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityValue={{ text: value }}
      onPress={onPress}
      className={cn(
        'relative h-11 flex-row items-center justify-center rounded-xl bg-white/8',
        className,
      )}
    >
      {/* The focus ring is drawn over the box: a border would move what is placed inside it
          (the RIR badge). */}
      {active ? (
        <View pointerEvents="none" className="absolute inset-0 rounded-xl border-2 border-accent" />
      ) : null}
      {value ? (
        <View>
          <Text
            variant="bodyStrong"
            className="rounded-md px-0.5 text-lg leading-5.5"
            // A value waiting to be typed over looks selected, in the system's selection colour.
            style={active && pristine ? { backgroundColor: colors.selection } : undefined}
          >
            {value}
          </Text>
          {/* The caret floats after the text, so the number doesn't move when it goes away. */}
          {active && !pristine ? (
            <View className="absolute inset-y-0 -right-1 justify-center">
              <BlinkingCursor />
            </View>
          ) : null}
        </View>
      ) : active ? (
        <BlinkingCursor />
      ) : placeholder ? (
        <Text variant="label" className="font-inter text-dim">
          {placeholder}
        </Text>
      ) : null}
      {children}
    </Pressable>
  );
}
