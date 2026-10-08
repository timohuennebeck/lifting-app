import type { ReactNode } from 'react';
import { View } from 'react-native';
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/shared/lib/cn';

export interface ScreenProps {
  children: ReactNode;
  /** Pinned above the content, below the status bar. */
  header?: ReactNode;
  /** Pinned to the bottom; rides up with the keyboard. */
  footer?: ReactNode;
  /** Wraps content in a keyboard-aware ScrollView. */
  scroll?: boolean;
  className?: string;
  contentClassName?: string;
}

/**
 * Base screen: safe-area aware, dark background, keyboard handling built in.
 * Focused inputs are scrolled above the keyboard and the footer sticks to it.
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
  const footerGap = 16;

  return (
    <View className={cn('flex-1 bg-bg', className)} style={{ paddingTop: insets.top }}>
      {header}
      {scroll ? (
        <KeyboardAwareScrollView
          bottomOffset={footer ? 96 : 24}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerClassName={cn('grow pb-6', contentClassName)}
        >
          {children}
        </KeyboardAwareScrollView>
      ) : (
        <View className={cn('flex-1', contentClassName)}>{children}</View>
      )}
      {footer ? (
        <KeyboardStickyView offset={{ closed: 0, opened: insets.bottom - footerGap / 2 }}>
          <View className="px-4 pt-1.5" style={{ paddingBottom: insets.bottom + footerGap }}>
            {footer}
          </View>
        </KeyboardStickyView>
      ) : null}
    </View>
  );
}
