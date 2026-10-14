import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import type Animated from 'react-native-reanimated';
import type { AnimatedRef } from 'react-native-reanimated';
import Sortable from 'react-native-sortables';

import type { RoutineSummary } from '@/shared/data/routines';
import { useSortableDrag } from '@/shared/hooks/use-sortable-drag';

import { reorderRoutines } from '../data/routine-mutations';
import { RoutineRow } from './routine-row';

export interface RoutineListProps {
  /** One plan's routines, or the library's, in their order. */
  routines: RoutineSummary[];
  /** The scroll view the list is in: dragging near its edges scrolls it. */
  scrollRef: AnimatedRef<Animated.ScrollView>;
  /** The routine tagged "Als Nächstes". */
  nextId?: string | null;
  startingId: string | null;
  onStart: (routine: RoutineSummary) => void;
  onMore: (routine: RoutineSummary) => void;
}

/** Routine cards; hold one to drag it to another place in its plan (or the library). */
export function RoutineList({
  routines,
  scrollRef,
  nextId,
  startingId,
  onStart,
  onMore,
}: RoutineListProps) {
  const { t } = useTranslation('training');
  const drag = useSortableDrag<RoutineSummary>(
    ({ data }) => void reorderRoutines(data.map((r) => r.id)),
  );
  return (
    <Sortable.Grid
      data={routines}
      keyExtractor={(r) => r.id}
      columns={1}
      rowGap={8}
      scrollableRef={scrollRef}
      {...drag.gridProps}
      renderItem={({ item }) => (
        <RoutineRow
          name={item.name}
          minutes={item.estimatedMinutes}
          exerciseCount={item.exerciseCount}
          items={item.items}
          tag={item.id === nextId ? t('list.next') : undefined}
          starting={startingId === item.id}
          onPress={drag.unlessDragging(() => router.push(`/routine/${item.id}`))}
          onStart={drag.unlessDragging(() => onStart(item))}
          onMore={drag.unlessDragging(() => onMore(item))}
        />
      )}
    />
  );
}
