import type { ReactNode } from 'react';
import { View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFooterInset } from '@/shared/hooks/use-footer-inset';
import { cn } from '@/shared/lib/cn';

export interface ScreenProps {
  children: ReactNode;
  /** Pinned above the content, below the status bar. */
  header?: ReactNode;
  /** Pinned to the bottom; stays there while the keyboard is open (it covers it). */
  footer?: ReactNode;
  /** Wraps content in a keyboard-aware ScrollView. */
  scroll?: boolean;
  className?: string;
  contentClassName?: string;
}

/**
 * Base screen: safe-area aware, dark background. Focused inputs are scrolled above the keyboard;
 * the footer stays at the bottom so the layout doesn't jump while typing.
 */
export function Screen({
  children,
  header,
  footer,
  scroll,
  className,
  contentClassName,
}: ScreenProps) {
  const insets = useSafeAreaInsets();
  const footerBottom = useFooterInset();

  return (
    <View className={cn('flex-1 bg-bg', className)} style={{ paddingTop: insets.top }}>
      {header}
      {scroll ? (
        <KeyboardAwareScrollView
          bottomOffset={24}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
          contentContainerClassName={cn('grow pb-6', contentClassName)}
        >
          {children}
        </KeyboardAwareScrollView>
      ) : (
        <View className={cn('flex-1', contentClassName)}>{children}</View>
      )}
      {footer ? (
        <View className="px-4 pt-1.5" style={{ paddingBottom: footerBottom }}>
          {footer}
        </View>
      ) : null}
    </View>
  );
}
