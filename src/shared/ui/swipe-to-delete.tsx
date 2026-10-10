import type { ReactNode } from 'react';
import { View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import { colors } from '@/shared/lib/theme';

import { PressableScale } from './pressable-scale';

export interface SwipeToDeleteProps {
  children: ReactNode;
  /** Called from the revealed button; undefined turns swiping off. */
  onDelete?: () => void;
  /** Accessibility label of the delete button, e.g. "Delete Push". */
  label: string;
}

/**
 * Swipe a row left to reveal the app's delete mark (the red minus of "Remove exercise"). The row
 * needs an opaque background, as it slides over the button.
 */
export function SwipeToDelete({ children, onDelete, label }: SwipeToDeleteProps) {
  return (
    <Swipeable
      enabled={!!onDelete}
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
            <View className="h-[2.5px] w-3.5 rounded-xs" style={{ backgroundColor: colors.red }} />
          </View>
        </PressableScale>
      )}
    >
      {children}
    </Swipeable>
  );
}
