import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { PlanSetDraft } from '@/shared/data/templates';
import { formatRir } from '@/shared/lib/rir';
import { colors } from '@/shared/lib/theme';
import { InputCell } from '@/shared/ui/input-cell';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { SwipeToDelete } from '@/shared/ui/swipe-to-delete';
import { Text } from '@/shared/ui/text';

import { editorRirStyle } from '../lib/training-ui';

export interface SetDraft extends PlanSetDraft {
  key: string;
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
  onRemove,
}: SetEditorRowProps) {
  const { t } = useTranslation('training');
  const rir = editorRirStyle(set.rir);
  const cell = (field: TargetField) => {
    const value = field === 'min' ? set.targetMin : set.targetMax;
    return (
      <InputCell
        value={activeField === field ? buffer : value == null ? '' : String(value)}
        active={activeField === field}
        pristine={pristine}
        label={t(timed ? `sets.${field}Seconds` : `sets.${field}`)}
        placeholder={t('sets.optional')}
        onPress={() => onFocus(field)}
        className="min-w-0 flex-1"
      />
    );
  };

  return (
    <SwipeToDelete onDelete={onRemove} label={t('sets.removeSet')}>
      <View className="h-14 flex-row items-center gap-2.5 bg-bg">
        <View className="size-10 items-center justify-center rounded-full bg-elevated">
          <Text variant="label" className="text-base">
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
