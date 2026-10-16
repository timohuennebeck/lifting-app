import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { SetTarget } from '@/shared/data/routines';
import { formatRir, rirColor } from '@/shared/lib/rir';
import { colors } from '@/shared/lib/theme';
import { InputCell } from '@/shared/ui/input-cell';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { SwipeToDelete } from '@/shared/ui/swipe-to-delete';
import { Text } from '@/shared/ui/text';

/** A target row being edited; `key` tells it apart while rows are added and removed. */
export interface SetDraft extends SetTarget {
  key: string;
}

/** Set editor and RIR picker: the RIR colours (red near failure, else amber); grey without. */
export function editorRirStyle(rir: number | null) {
  if (rir === null) return { bg: '#2E2E2C', dark: false };
  return { bg: rirColor(rir), dark: true };
}

/** The two number boxes of a target row. */
export type TargetField = 'min' | 'max';

export interface SetEditorRowProps {
  index: number;
  set: SetDraft;
  /** Targets are seconds (planks): no RIR. */
  timed: boolean;
  /** The box being typed into, if it is in this row. */
  activeField: TargetField | null;
  /** Text of the active box (the number pad's buffer). */
  buffer: string;
  pristine: boolean;
  onFocus: (field: TargetField) => void;
  onRirPress: () => void;
  /** Min above max: both boxes get a red ring. */
  error?: boolean;
  /** Undefined when the set can't be removed (last remaining set). */
  onRemove?: () => void;
}

/** One target set: min/max reps (or seconds) typed with the number pad, RIR badge; swipe left to delete. */
export function SetEditorRow({
  index,
  set,
  timed,
  activeField,
  buffer,
  pristine,
  onFocus,
  onRirPress,
  error,
  onRemove,
}: SetEditorRowProps) {
  const { t } = useTranslation('training');
  const rir = editorRirStyle(set.rir);
  const cell = (field: TargetField) => {
    const active = activeField === field;
    const target = field === 'min' ? set.targetMin : set.targetMax;
    const saved = target == null ? '' : String(target);
    return (
      <InputCell
        value={active ? buffer : saved}
        active={active}
        pristine={pristine}
        label={t(timed ? `sets.${field}Seconds` : `sets.${field}`)}
        placeholder={t('sets.optional')}
        error={error}
        onPress={() => onFocus(field)}
        className="min-w-0 flex-1"
      />
    );
  };

  return (
    <SwipeToDelete onDelete={onRemove} label={t('sets.removeSet')}>
      <View className="h-14 flex-row items-center gap-2.5 bg-bg">
        <View className="size-10 items-center justify-center rounded-full bg-elevated">
          <Text variant="label" className="text-base tabular-nums">
            {index + 1}
          </Text>
        </View>
        {cell('min')}
        {cell('max')}
        {timed ? (
          // Reps in reserve don't apply to holds; keep the column so rows stay aligned.
          <View className="size-7" />
        ) : (
          <PressableScale
            haptic="select"
            hitSlop={10}
            accessibilityLabel={t('sets.rir')}
            onPress={onRirPress}
            className="size-7 items-center justify-center rounded-full"
            style={{ backgroundColor: rir.bg }}
          >
            <Text variant="caption" style={{ color: rir.dark ? colors.onAccent : colors.fg }}>
              {set.rir === null ? '–' : formatRir(set.rir)}
            </Text>
          </PressableScale>
        )}
      </View>
    </SwipeToDelete>
  );
}
