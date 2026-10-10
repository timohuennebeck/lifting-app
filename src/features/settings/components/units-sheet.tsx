import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { UnitSystem } from '@/shared/lib/format';
import { RadioListSheet } from '@/shared/ui/radio-list-sheet';
import { Text } from '@/shared/ui/text';

/** "KG" or "LB" on a neon circle: the weight unit at a glance. */
export function UnitBadge({ units, size = 32 }: { units: UnitSystem; size?: number }) {
  const { t } = useTranslation();
  return (
    <View
      className="items-center justify-center rounded-full bg-accent"
      style={{ width: size, height: size }}
    >
      <Text tone="onAccent" className="font-inter-bold text-[11px] tracking-[0.4px] uppercase">
        {t(units === 'metric' ? 'units.kg' : 'units.lb')}
      </Text>
    </View>
  );
}

export interface UnitsSheetProps {
  visible: boolean;
  onClose: () => void;
  value: UnitSystem;
  onSelect: (units: UnitSystem) => void;
}

/** Metric or imperial, for weights and the body measurements. */
export function UnitsSheet({ visible, onClose, value, onSelect }: UnitsSheetProps) {
  const { t } = useTranslation('profile');
  return (
    <RadioListSheet<UnitSystem>
      visible={visible}
      onClose={onClose}
      value={value}
      onSelect={onSelect}
      options={(['metric', 'imperial'] as const).map((units) => ({
        value: units,
        label: t(`settings.${units}`),
        leading: <UnitBadge units={units} />,
      }))}
    />
  );
}
