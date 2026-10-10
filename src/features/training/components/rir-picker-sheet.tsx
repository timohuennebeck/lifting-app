import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { formatRir, RIR_VALUES } from '@/shared/lib/rir';
import { colors } from '@/shared/lib/theme';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Sheet } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';

import { editorRirStyle } from '../lib/training-ui';

export interface RirPickerSheetProps {
  visible: boolean;
  value: number | null;
  onClose: () => void;
  onSelect: (rir: number) => void;
}

/** Bottom sheet with RIR targets 0–5+ (00·P2 C·S·R). */
export function RirPickerSheet({ visible, value, onClose, onSelect }: RirPickerSheetProps) {
  const { t } = useTranslation('training');
  return (
    <Sheet visible={visible} onClose={onClose} className="px-5">
      <View className="flex-row justify-between gap-3 pb-2.5">
        {RIR_VALUES.map((rir) => {
          const style = editorRirStyle(rir);
          const selected = rir === value;
          return (
            <PressableScale
              key={rir}
              haptic="select"
              activeScale={0.94}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              accessibilityLabel={t('sets.rirOption', { value: formatRir(rir) })}
              onPress={() => onSelect(rir)}
              className="aspect-square max-w-14 min-w-0 flex-1 items-center justify-center rounded-full"
              style={{
                backgroundColor: style.bg,
                boxShadow: selected
                  ? `0 0 0 3px ${colors.sheet}, 0 0 0 5px ${style.bg}`
                  : undefined,
              }}
            >
              <Text
                variant="headline"
                className="text-xl"
                style={{ color: style.dark ? colors.onAccent : colors.fg }}
              >
                {formatRir(rir)}
              </Text>
            </PressableScale>
          );
        })}
      </View>
    </Sheet>
  );
}
