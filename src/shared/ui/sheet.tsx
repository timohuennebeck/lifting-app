import { type ReactNode, useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { useFooterInset } from '@/shared/hooks/use-footer-inset';
import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';

import { Text } from './text';

const OPEN_MS = 280;
const CLOSE_MS = 220;
const MAX_HEIGHT = 0.92;
/** A drag this far (or a fast flick) closes the sheet. */
const DISMISS_DISTANCE = 120;
const DISMISS_VELOCITY = 900;

/** Runs `fn` once a closing sheet has animated out, so sheets never overlap. */
export const afterSheetClose = (fn: () => void) => setTimeout(fn, CLOSE_MS + 60);

export interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  /** A fixed height such as ['92%']; omit to size the sheet to its content. */
  snapPoints?: string[];
  /** Pinned to the bottom of the sheet; rides above the keyboard. */
  footer?: ReactNode;
}

/**
 * Bottom sheet on a native modal, so it shows above every screen, modal screens included.
 * Drag the handle down or tap the backdrop to close; follows the keyboard.
 */
export function Sheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
  className,
  snapPoints,
  footer,
}: SheetProps) {
  const footerInset = useFooterInset();
  const { height: windowHeight } = useWindowDimensions();
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(0);
  const drag = useSharedValue(0);
  const sheetHeight = useSharedValue(windowHeight);
  const { height: keyboard } = useReanimatedKeyboardAnimation();

  // Mount when opening; unmount once the closing animation has run.
  if (visible && !mounted) setMounted(true);
  useEffect(() => {
    if (!mounted) return;
    if (visible) {
      drag.set(0);
      progress.set(withTiming(1, { duration: OPEN_MS, easing: Easing.out(Easing.cubic) }));
    } else {
      progress.set(
        withTiming(0, { duration: CLOSE_MS, easing: Easing.in(Easing.cubic) }, (done) => {
          if (done) scheduleOnRN(setMounted, false);
        }),
      );
    }
  }, [visible, mounted, progress, drag]);

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      drag.set(Math.max(0, e.translationY));
    })
    .onEnd((e) => {
      if (e.translationY > DISMISS_DISTANCE || e.velocityY > DISMISS_VELOCITY) {
        scheduleOnRN(onClose);
      } else {
        drag.set(withTiming(0, { duration: 180 }));
      }
    });

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.get() * 0.6 }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.get()) * sheetHeight.get() + drag.get() }],
    // The keyboard height is negative while it is open.
    paddingBottom: Math.max(0, -keyboard.get()),
  }));

  const fixed = snapPoints?.[0] ? (parseFloat(snapPoints[0]) / 100) * windowHeight : undefined;

  if (!mounted) return null;
  return (
    <Modal
      transparent
      visible
      animationType="none"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <GestureHandlerRootView style={StyleSheet.absoluteFill}>
        <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]} className="bg-black">
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityRole="button" />
        </Animated.View>
        <Animated.View
          onLayout={(e) => sheetHeight.set(e.nativeEvent.layout.height)}
          style={[
            sheetStyle,
            fixed ? { height: fixed } : { maxHeight: windowHeight * MAX_HEIGHT },
            { backgroundColor: colors.sheet },
          ]}
          className="absolute inset-x-0 bottom-0 rounded-t-[34px]"
        >
          <GestureDetector gesture={pan}>
            <View>
              <View className="items-center pt-2.5 pb-1">
                <View className="h-1.25 w-9 rounded-full bg-track" />
              </View>
              {title ? (
                // 01·V·A sheets: title 22pt below the handle.
                <View className="gap-1.5 px-5 pt-3 pb-5">
                  <Text variant="headline">{title}</Text>
                  {subtitle ? (
                    <Text variant="label" tone="subtle" className="font-inter">
                      {subtitle}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>
          </GestureDetector>
          <View
            className={cn('px-4', !title && 'pt-3', fixed && 'flex-1', className)}
            style={{ paddingBottom: footer ? 0 : footerInset }}
          >
            {children}
          </View>
          {footer ? (
            <View className="px-4 pt-2" style={{ paddingBottom: footerInset }}>
              {footer}
            </View>
          ) : null}
        </Animated.View>
      </GestureHandlerRootView>
    </Modal>
  );
}
