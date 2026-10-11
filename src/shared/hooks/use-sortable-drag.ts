import { useRef } from 'react';
import type { SortableGridDragEndParams } from 'react-native-sortables';

import { haptics } from '@/shared/lib/haptics';

/**
 * Hold-to-drag reordering for a Sortable.Grid of tappable items: spread `gridProps` on the grid
 * (`onMove` runs when an item lands somewhere else) and wrap the items' presses in
 * `unlessDragging`, since letting go of a dragged item also ends a press on it.
 */
export function useSortableDrag<T>(onMove: (params: SortableGridDragEndParams<T>) => void) {
  const dragging = useRef(false);
  return {
    gridProps: {
      dragActivationDelay: 250,
      activeItemScale: 1.03,
      inactiveItemOpacity: 0.6,
      hapticsEnabled: false,
      onDragStart: () => {
        dragging.current = true;
        haptics.press();
      },
      onDragEnd: (params: SortableGridDragEndParams<T>) => {
        setTimeout(() => (dragging.current = false), 150);
        if (params.toIndex !== params.fromIndex) onMove(params);
      },
    },
    unlessDragging: (onPress: () => void) => () => {
      if (!dragging.current) onPress();
    },
  };
}
