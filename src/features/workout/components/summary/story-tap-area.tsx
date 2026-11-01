import type { ReactNode } from 'react';
import { Pressable, type PressableProps } from 'react-native';

/** What a story page does with a tap (back on the left, on elsewhere) and a held finger. */
export type StoryTaps = Pick<
  PressableProps,
  'onPress' | 'onLongPress' | 'onPressOut' | 'delayLongPress'
>;

export interface StoryTapAreaProps {
  taps: StoryTaps;
  children: ReactNode;
}

/**
 * Where a story page takes its taps. On a page that scrolls it goes inside the scroll view,
 * never around it: iOS doesn't scroll a scroll view while a view around it has the touch. Taps
 * on the page's own buttons (an exercise, "+N") stay theirs.
 */
export function StoryTapArea({ taps, children }: StoryTapAreaProps) {
  return (
    <Pressable accessible={false} className="flex-1" {...taps}>
      {children}
    </Pressable>
  );
}
