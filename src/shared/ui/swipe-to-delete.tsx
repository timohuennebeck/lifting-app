import type { ReactNode } from 'react';
import { View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import { colors } from '@/shared/lib/theme';

import { MinusGlyph } from './minus-glyph';
import { PressableScale } from './pressable-scale';

export interface SwipeToDeleteProps {
  children: ReactNode;
  /** Called from the revealed button; undefined turns swiping off. */
  onDelete?: () => void;
  /** Accessibility label of the delete button, e.g. "Delete Push". */
  label: string;
  /**
   * Only a swipe to the left moves the row: one to the right is left to a swipe around it
   * (the live workout's swipe to the previous exercise, a page's swipe back).
   */
  leftOnly?: boolean;
}

/** Further than any finger travels: a swipe to the right never moves a `leftOnly` row. */
const NEVER = 100_000;

/**
 * Swipe a row left to reveal the app's delete mark (the red minus of "Remove exercise"). The row
 * needs an opaque background, as it slides over the button.
 */
export function SwipeToDelete({ children, onDelete, label, leftOnly }: SwipeToDeleteProps) {
  return (
    <Swipeable
      enabled={!!onDelete}
      dragOffsetFromLeftEdge={leftOnly ? NEVER : undefined}
      friction={1.6}
      rightThreshold={40}
      overshootRight={false}
      renderRightActions={(_progress, _translation, swipeable) => (
        <PressableScale
          haptic="warning"
          accessibilityLabel={label}
          onPress={() => {
            swipeable.close();
            onDelete?.();
          }}
          className="ml-2.5 w-14 items-center justify-center"
        >
          <View className="size-10 items-center justify-center rounded-full bg-danger-bg">
            <MinusGlyph color={colors.red} width={14} />
          </View>
        </PressableScale>
      )}
    >
      {children}
    </Swipeable>
  );
}
