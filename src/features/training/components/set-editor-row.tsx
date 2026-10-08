import { useState } from 'react';
import { formatRir } from '@/shared/lib/rir';
import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import { colors, useAccentColor } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { clamp, editorRirStyle } from '../lib/training-ui';

export interface SetDraft {
  key: string;
  repsMin: number;
  repsMax: number;
  rir: number | null;
}

export interface SetEditorRowProps {
  index: number;
  set: SetDraft;
  onChange: (patch: Partial<SetDraft>) => void;
  onRirPress: () => void;
  /** Undefined when the set can't be removed (last remaining set). */
  onRemove?: () => void;
}

/** Reps field: digits update the draft live; the row normalizes min ≤ max on blur. */
function RepsInput({
  value,
  onChangeValue,
  onBlur,
  label,
}: {
  value: number;
  onChangeValue: (value: number) => void;
  onBlur: () => void;
  label: string;
}) {
  const [text, setText] = useState<string | null>(null);
  return (
    <TextInput
      value={text ?? String(value)}
      onChangeText={(next) => {
        const digits = next.replace(/[^0-9]/g, '').slice(0, 2);
        setText(digits);
        if (digits) onChangeValue(clamp(Number(digits), 1, 60));
      }}
      onFocus={() => setText(String(value))}
      onBlur={() => {
        setText(null);
        onBlur();
      }}
      accessibilityLabel={label}
      keyboardType="number-pad"
      returnKeyType="done"
      selectTextOnFocus
      keyboardAppearance="dark"
      selectionColor={colors.fg}
      className="h-11 min-w-0 flex-1 rounded-xl bg-white/8 text-center font-inter-semibold text-lg text-fg"
    />
  );
}

/** One editable target set: min/max reps, RIR badge; swipe left to delete (00·P2 C·S). */
export function SetEditorRow({ index, set, onChange, onRirPress, onRemove }: SetEditorRowProps) {
  const { t } = useTranslation('training');
  const accent = useAccentColor();
  const rir = editorRirStyle(set.rir, accent);

  return (
    <Swipeable
      enabled={!!onRemove}
      friction={1.6}
      rightThreshold={40}
      overshootRight={false}
      renderRightActions={() => (
        <PressableScale
          haptic="warning"
          accessibilityLabel={t('sets.removeSet')}
          onPress={onRemove}
          className="ml-2.5 w-16 items-center justify-center rounded-xl"
          style={{ backgroundColor: colors.red }}
        >
          <Icon name="trash" size={16} color={colors.bg} />
        </PressableScale>
      )}
    >
      <View className="h-14 flex-row items-center gap-2.5 bg-bg">
        <View className="size-10 items-center justify-center rounded-full bg-elevated">
          <Text variant="label" className="text-base">
            {index + 1}
          </Text>
        </View>
        <RepsInput
          value={set.repsMin}
          label={t('sets.min')}
          onChangeValue={(repsMin) => onChange({ repsMin })}
          onBlur={() => onChange({ repsMax: Math.max(set.repsMin, set.repsMax) })}
        />
        <RepsInput
          value={set.repsMax}
          label={t('sets.max')}
          onChangeValue={(repsMax) => onChange({ repsMax })}
          onBlur={() => onChange({ repsMin: Math.min(set.repsMin, set.repsMax) })}
        />
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
      </View>
    </Swipeable>
  );
}
