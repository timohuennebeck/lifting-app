import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { formatRir, RIR_VALUES, rirColor } from '@/shared/lib/rir';
import { colors } from '@/shared/lib/theme';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

export interface KeypadRirProps {
  /** As entered; until then the set's target is ringed in grey. */
  value: number | null;
  target: number | null;
  /** A value tapped; the entered one tapped again is to be removed. */
  onSelect: (rir: number) => void;
}

/** The reps in reserve a set had, above the number pad's keys: 0 to 5+, the entered one ringed. */
export function KeypadRir({ value, target, onSelect }: KeypadRirProps) {
  const { t } = useTranslation('training');
  const picked = value ?? target;
  const entered = value != null;
  return (
    <View accessibilityRole="radiogroup" className="gap-2 px-0.5 pb-1">
      <Text className="font-inter-semibold text-[11px] leading-3.5 tracking-[0.9px] text-dim">
        {t('sets.rir')}
      </Text>
      <View className="flex-row gap-2.5">
        {RIR_VALUES.map((rir) => {
          const ringed = rir === picked;
          const bg = rirColor(rir);
          const ringColor = entered ? bg : colors.outline;
          return (
            <PressableScale
              key={rir}
              haptic="select"
              activeScale={0.94}
              accessibilityRole="radio"
              accessibilityState={{ selected: rir === value }}
              accessibilityLabel={t('sets.rirOption', { value: formatRir(rir) })}
              onPress={() => onSelect(rir)}
              className="size-11 items-center justify-center rounded-full"
              style={{
                backgroundColor: bg,
                boxShadow: ringed
                  ? `0 0 0 3px ${colors.surface}, 0 0 0 5px ${ringColor}`
                  : undefined,
              }}
            >
              <Text variant="bodyStrong" tone="onAccent">
                {formatRir(rir)}
              </Text>
            </PressableScale>
          );
        })}
      </View>
    </View>
  );
}
