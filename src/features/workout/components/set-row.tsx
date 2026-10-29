import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { InputCell } from '@/shared/ui/input-cell';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { RirBadge } from '@/shared/ui/rir-badge';
import { Text } from '@/shared/ui/text';

import type { SetField } from '../stores/workout-session-store';

/** Box width: one of two boxes, or a single box spanning both (planks, push-ups). */
export const cellWidth = (count: number) => (count > 1 ? 'w-19.5' : 'w-41.5');

interface SetCell {
  field: SetField;
  value: string;
}

const CELL_LABEL = { weight: 'weightCell', reps: 'repsCell', seconds: 'secondsCell' } as const;

/**
 * The middle column: targets ("7–9"), or a set's weight over its reps ("60 kg" over "× 9"), the
 * suggested one or last time's.
 */
export interface SetRowMiddle {
  /** The targets, the weight, or the reps alone ("12 Wdh.") when there is no weight. */
  main: string;
  /** The reps or time under the weight. */
  detail?: string;
  /** A set is set in semibold, targets aren't. */
  strong?: boolean;
  /** The suggestion went up or down from last time: a marker before the line that changed. */
  mainTrend?: Trend;
  detailTrend?: Trend;
}

type Trend = 'up' | 'down';

interface TrendMarkProps {
  trend: Trend;
}

/** Neon arrow up, or amber arrow down, before a suggested value. */
function TrendMark({ trend }: TrendMarkProps) {
  return (
    <View
      className={cn(
        'size-3.5 items-center justify-center rounded-full',
        trend === 'up' ? 'bg-accent' : 'bg-amber',
      )}
    >
      <Icon name={trend === 'up' ? 'arrow-up' : 'arrow-down'} size={8} color={colors.onAccent} />
    </View>
  );
}

export interface SetRowProps {
  number: number;
  middle: SetRowMiddle | null;
  /** One box per measure of the exercise, e.g. KG and REPS, or only SEC. */
  cells: SetCell[];
  rir: number | null;
  /** The RIR shown is the set's target, not entered: its badge is dimmed. */
  rirIsTarget: boolean;
  done: boolean;
  selected: boolean;
  field: SetField;
  pristine: boolean;
  /** A box tapped, or null for the row outside its boxes. */
  onSelect: (field: SetField | null) => void;
  onToggleDone: () => void;
}

/** One row of the logging table: SET · SUGGESTED/TARGETS/LAST · KG · REPS (or SEC) · done. */
export function SetRow({
  number,
  middle,
  cells,
  rir,
  rirIsTarget,
  done,
  selected,
  field,
  pristine,
  onSelect,
  onToggleDone,
}: SetRowProps) {
  const { t } = useTranslation('workout');
  return (
    <Pressable
      accessibilityLabel={t('table.setLabel', { n: number })}
      onPress={() => onSelect(null)}
      // Logged sets step back; the row being edited stays at full strength.
      className={cn('h-14 flex-row items-center gap-2.5', done && !selected && 'opacity-45')}
    >
      <View className="size-10 items-center justify-center rounded-full bg-elevated">
        <Text variant="bodyStrong" className="text-base tabular-nums">
          {number}
        </Text>
      </View>
      <View className="flex-1 items-center">
        <View className="flex-row items-center gap-1">
          {middle?.mainTrend ? <TrendMark trend={middle.mainTrend} /> : null}
          <Text
            variant="label"
            numberOfLines={1}
            className={cn(
              'text-center leading-4.75 tabular-nums',
              !middle?.strong && 'font-inter',
              !middle && 'text-dim',
            )}
          >
            {middle?.main ?? '–'}
          </Text>
        </View>
        {middle?.detail ? (
          <View className="flex-row items-center gap-1">
            {middle.detailTrend ? <TrendMark trend={middle.detailTrend} /> : null}
            <Text
              variant="label"
              tone="secondary"
              numberOfLines={1}
              className="text-center font-inter leading-4.75 tabular-nums"
            >
              {middle.detail}
            </Text>
          </View>
        ) : null}
      </View>
      {cells.map((cell) => (
        <InputCell
          key={cell.field}
          value={cell.value}
          className={cellWidth(cells.length)}
          active={selected && field === cell.field}
          pristine={pristine}
          label={t(`table.${CELL_LABEL[cell.field]}`)}
          onPress={() => onSelect(cell.field)}
        >
          {/* Reps in reserve belong to the reps box. */}
          {cell.field === 'reps' && rir != null ? (
            <RirBadge
              rir={rir}
              className={cn('absolute -right-1.75 -bottom-1.75', rirIsTarget && 'opacity-40')}
            />
          ) : null}
        </InputCell>
      ))}
      <PressableScale
        haptic={done ? 'tap' : 'press'}
        hitSlop={10}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={t('table.done')}
        onPress={onToggleDone}
        className="w-7 items-end"
      >
        <View
          className={cn(
            'size-6 items-center justify-center rounded-full',
            done ? 'bg-accent' : 'border-2 border-track',
          )}
        >
          {done ? <Icon name="check" size={11} color={colors.onAccent} /> : null}
        </View>
      </PressableScale>
    </Pressable>
  );
}
