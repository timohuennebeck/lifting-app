import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';
import Swipeable from 'react-native-gesture-handler/ReanimatedSwipeable';

import type { PlanSetDraft } from '@/shared/data/templates';
import { clamp } from '@/shared/lib/math';
import { formatRir } from '@/shared/lib/rir';
import { colors, useAccentColor } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { editorRirStyle } from '../lib/training-ui';

export interface SetDraft extends PlanSetDraft {
  key: string;
}

export interface SetEditorRowProps {
  index: number;
  set: SetDraft;
  /** Targets are seconds (planks): wider range and no RIR. */
  timed: boolean;
  onChange: (patch: Partial<SetDraft>) => void;
  onRirPress: () => void;
  /** Undefined when the set can't be removed (last remaining set). */
  onRemove?: () => void;
}

interface TargetInputProps {
  value: number;
  /** Largest value: 60 reps or 600 seconds. */
  max: number;
  onChangeValue: (value: number) => void;
  onBlur: () => void;
  label: string;
}

/** Target field: digits update the draft live; the row normalizes min ≤ max on blur. */
function TargetInput({ value, max, onChangeValue, onBlur, label }: TargetInputProps) {
  const [text, setText] = useState<string | null>(null);
  return (
    <TextInput
      value={text ?? String(value)}
      onChangeText={(next) => {
        const digits = next.replace(/[^0-9]/g, '').slice(0, String(max).length);
        setText(digits);
        if (digits) onChangeValue(clamp(Number(digits), 1, max));
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
      textAlignVertical="center"
      className="h-11 min-w-0 flex-1 rounded-xl bg-white/8 py-0 text-center font-inter-semibold text-[18px] text-fg"
    />
  );
}

/** One editable target set: min/max reps (or seconds), RIR badge; swipe left to delete (00·P2 C·S). */
export function SetEditorRow({
  index,
  set,
  timed,
  onChange,
  onRirPress,
  onRemove,
}: SetEditorRowProps) {
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
        <TargetInput
          value={set.targetMin}
          max={timed ? 600 : 60}
          label={t(timed ? 'sets.minSeconds' : 'sets.min')}
          onChangeValue={(targetMin) => onChange({ targetMin })}
          onBlur={() => onChange({ targetMax: Math.max(set.targetMin, set.targetMax) })}
        />
        <TargetInput
          value={set.targetMax}
          max={timed ? 600 : 60}
          label={t(timed ? 'sets.maxSeconds' : 'sets.max')}
          onChangeValue={(targetMax) => onChange({ targetMax })}
          onBlur={() => onChange({ targetMin: Math.min(set.targetMin, set.targetMax) })}
        />
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
    </Swipeable>
  );
}
