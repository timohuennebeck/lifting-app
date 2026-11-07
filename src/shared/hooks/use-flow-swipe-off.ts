import { useIsFocused, useNavigation } from 'expo-router';
import { useEffect } from 'react';

/** How many shown screens hold each flow's swipe off, by the flow's navigator. */
const holds = new Map<string, number>();

/**
 * Keeps the swipe that leaves the whole flow off while this screen is shown: a flow such as the
 * app's plan flow is a screen of its own, whose swipe would take over once the screen's own is
 * off. Counted per flow, so a screen replacing another one keeps it off in either effect order.
 */
export function useFlowSwipeOff(enabled = true) {
  const navigation = useNavigation();
  const focused = useIsFocused();
  const off = enabled && focused;
  useEffect(() => {
    const parent = navigation.getParent();
    const key = parent?.getState()?.key;
    if (!off || !parent || !key) return;
    holds.set(key, (holds.get(key) ?? 0) + 1);
    parent.setOptions({ gestureEnabled: false });
    return () => {
      const left = (holds.get(key) ?? 1) - 1;
      if (left > 0) {
        holds.set(key, left);
        return;
      }
      holds.delete(key);
      parent.setOptions({ gestureEnabled: true });
    };
  }, [navigation, off]);
}
