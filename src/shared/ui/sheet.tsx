import { type ReactNode, useState } from 'react';
import { Modal, Pressable, View } from 'react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
import { useTranslation } from 'react-i18next';

import { cn } from '@/shared/lib/cn';

import { Text } from './text';

const EXIT_MS = 200;

export interface SheetProps {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

/** Bottom sheet with dimmed backdrop; content stays above the keyboard. */
export function Sheet({ visible, onClose, title, subtitle, children, className }: SheetProps) {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  // Keep the modal mounted until the exit animation finished.
  const [mounted, setMounted] = useState(visible);
  if (visible && !mounted) setMounted(true);

  return (
    <Modal
      transparent
      visible={mounted}
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      {visible ? (
        <KeyboardAvoidingView behavior="padding" className="flex-1 justify-end">
          <Animated.View
            entering={FadeIn}
            exiting={FadeOut}
            className="absolute inset-0 bg-black/60"
          >
            <Pressable
              accessibilityLabel={t('actions.close')}
              className="flex-1"
              onPress={onClose}
            />
          </Animated.View>
          <Animated.View
            entering={SlideInDown.springify().damping(22).stiffness(220)}
            exiting={SlideOutDown.duration(EXIT_MS).withCallback((finished) => {
              'worklet';
              if (finished) scheduleOnRN(setMounted, false);
            })}
            className={cn('rounded-t-[32px] bg-surface px-4 pt-2.5', className)}
            style={{ paddingBottom: insets.bottom + 16 }}
          >
            <View className="mb-4 h-[5px] w-10 self-center rounded-full bg-track" />
            {title ? (
              <View className="mb-5 gap-1 px-1">
                <Text variant="headline">{title}</Text>
                {subtitle ? (
                  <Text variant="label" tone="subtle" className="font-inter">
                    {subtitle}
                  </Text>
                ) : null}
              </View>
            ) : null}
            {children}
          </Animated.View>
        </KeyboardAvoidingView>
      ) : null}
    </Modal>
  );
}
