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

export interface SetCell {
  field: SetField;
  value: string;
}

const CELL_LABEL = { weight: 'weightCell', reps: 'repsCell', seconds: 'secondsCell' } as const;

export interface SetRowProps {
  number: number;
  /** Targets ("7–9") or last time ("60 kg × 9"), whichever column is shown. */
  middle: string | null;
  /** One box per measure of the exercise, e.g. KG and REPS, or only SEC. */
  cells: SetCell[];
  rir: number | null;
  done: boolean;
  record: boolean;
  selected: boolean;
  field: SetField;
  pristine: boolean;
  onSelect: (field: SetField) => void;
  onToggleDone: () => void;
}

/** One row of the logging table: SET · TARGETS/LAST · KG · REPS (or SEC) · done. */
export function SetRow({
  number,
  middle,
  cells,
  rir,
  done,
  record,
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
      onPress={() => onSelect(cells[0].field)}
      // Logged sets step back; the row being edited stays at full strength.
      className={cn('h-14 flex-row items-center gap-2.5', done && !selected && 'opacity-45')}
    >
      <View
        className={cn(
          'size-10 items-center justify-center rounded-full bg-elevated',
          record && 'bg-accent',
        )}
      >
        <Text variant="bodyStrong" tone={record ? 'onAccent' : 'default'} className="text-base">
          {number}
        </Text>
      </View>
      <View className="flex-1 items-center">
        <Text variant="label" numberOfLines={1} className={cn('font-inter', !middle && 'text-dim')}>
          {middle ?? '–'}
        </Text>
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
            <RirBadge rir={rir} className="absolute -right-1.75 -bottom-1.75" />
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
