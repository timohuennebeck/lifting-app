import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import type Animated from 'react-native-reanimated';
import type { AnimatedRef } from 'react-native-reanimated';
import Sortable from 'react-native-sortables';

import type { DoneDates, RoutineSummary } from '@/shared/data/routines';
import { useSortableDrag } from '@/shared/hooks/use-sortable-drag';
import { formatDate } from '@/shared/lib/format';

import { reorderRoutines } from '../data/routine-mutations';
import { RoutineRow, useRoutineMeta } from './routine-row';

export interface RoutineListProps {
  /** A plan's routines in their order. */
  routines: RoutineSummary[];
  /** The scroll view the list is in: dragging near its edges scrolls it. */
  scrollRef: AnimatedRef<Animated.ScrollView>;
  /** The routine the coach recommends next, tagged and in neon. */
  nextId?: string | null;
  /** The routines done this plan week, with when. */
  done: DoneDates;
  startingId: string | null;
  onStart: (routine: RoutineSummary) => void;
  onMore: (routine: RoutineSummary) => void;
}

/** A plan's routine cards; hold one to drag it to another place in the plan. */
export function RoutineList({
  routines,
  scrollRef,
  nextId,
  done,
  startingId,
  onStart,
  onMore,
}: RoutineListProps) {
  const { t } = useTranslation('training');
  const meta = useRoutineMeta();
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
      renderItem={({ item }) => {
        const doneAt = done[item.id];
        return (
          <RoutineRow
            name={item.name}
            items={item.items}
            meta={
              doneAt
                ? t('myPlan.doneOn', { day: formatDate(new Date(doneAt), { weekday: 'short' }) })
                : meta(item)
            }
            next={item.id === nextId}
            tag={item.id === nextId ? t('list.recommended') : undefined}
            done={!!doneAt}
            starting={startingId === item.id}
            onPress={drag.unlessDragging(() => router.push(`/routine/${item.id}`))}
            // An empty routine has nothing to start: play opens it to add exercises.
            onStart={drag.unlessDragging(() =>
              item.exerciseCount ? onStart(item) : router.push(`/routine/${item.id}`),
            )}
            onMore={drag.unlessDragging(() => onMore(item))}
          />
        );
      }}
    />
  );
}
