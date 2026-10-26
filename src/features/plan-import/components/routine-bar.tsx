import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { useWindowDimensions, View } from 'react-native';
import Animated, { useAnimatedRef } from 'react-native-reanimated';
import Sortable from 'react-native-sortables';

import { useSortableDrag } from '@/shared/hooks/use-sortable-drag';
import { cn } from '@/shared/lib/cn';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { ROUTINE_ADD_SIZE, RoutineSlot } from './routine-slot';

/** A strip entry; `review` adds the amber dot. */
interface RoutineBarItem {
  /** Stays with the routine while it is dragged to another place. */
  key: string;
  name: string;
  review?: boolean;
}

const SLOT = 52;
/** A slot's name (caption line), the gap, the slot and its ring, which hangs 3pt below it. */
const ROW_HEIGHT = 17 + 8 + 32 + 3;

export interface RoutineBarProps {
  items: RoutineBarItem[];
  currentIndex: number;
  onSelect: (index: number) => void;
  /** Adds a routine; without it there is no "+". */
  onAdd?: () => void;
  /** A routine held and dragged to another place; without it they stay put. */
  onMove?: (from: number, to: number) => void;
}

/**
 * Plan strip of the plan's routines, numbered, with a "+" to add one (03·0b). Hold a routine to
 * drag it to another place.
 */
export function RoutineBar({ items, currentIndex, onSelect, onAdd, onMove }: RoutineBarProps) {
  const { t } = useTranslation('training');
  const { width } = useWindowDimensions();
  const scroller = useAnimatedRef<Animated.ScrollView>();
  const drag = useSortableDrag<RoutineBarItem>(({ fromIndex, toIndex }) =>
    onMove?.(fromIndex, toIndex),
  );
  // Keep the current slot in view.
  const offset = Math.max(0, SLOT * (currentIndex + 2) - width);
  useEffect(() => {
    scroller.current?.scrollTo({ x: offset, animated: true });
  }, [offset, scroller]);

  return (
    <Animated.ScrollView
      ref={scroller}
      onContentSizeChange={() => scroller.current?.scrollTo({ x: offset, animated: false })}
      horizontal
      showsHorizontalScrollIndicator={false}
      style={{ flexGrow: 0 }}
      contentContainerClassName="px-3.5 pt-3.5 pb-4"
    >
      <Sortable.Grid
        data={items}
        keyExtractor={(item) => item.key}
        rows={1}
        rowHeight={ROW_HEIGHT}
        scrollableRef={scroller}
        autoScrollDirection="horizontal"
        sortEnabled={!!onMove}
        {...drag.gridProps}
        renderItem={({ item, index }) => {
          const current = index === currentIndex;
          return (
            <PressableScale
              haptic="select"
              accessibilityRole="tab"
              accessibilityState={{ selected: current }}
              accessibilityLabel={item.name}
              onPress={drag.unlessDragging(() => onSelect(index))}
              className="items-center gap-2 px-0.5"
              style={{ width: SLOT }}
            >
              <Text
                variant="caption"
                numberOfLines={1}
                className={cn(current ? 'text-fg' : 'font-inter-medium text-subtle')}
              >
                {item.name}
              </Text>
              <RoutineSlot number={index + 1} selected={current} review={item.review} />
            </PressableScale>
          );
        }}
      />
      {onAdd ? (
        <View className="justify-end" style={{ width: SLOT }}>
          <PressableScale
            haptic="tap"
            accessibilityLabel={t('list.addRoutine')}
            onPress={onAdd}
            className="items-center justify-center self-center rounded-full bg-elevated"
            // Level with the slots' ring, which ends at the bottom of the row.
            style={{ width: ROUTINE_ADD_SIZE, height: ROUTINE_ADD_SIZE }}
          >
            <Icon name="plus" size={13} />
          </PressableScale>
        </View>
      ) : null}
    </Animated.ScrollView>
  );
}
