import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { type UnitSystem, weightUnit } from '@/shared/lib/format';
import { Text } from '@/shared/ui/text';

/** "KG" or "LB" on a neon circle: the weight unit at a glance. */
export function UnitBadge({ units }: { units: UnitSystem }) {
  const { t } = useTranslation();
  return (
    <View className="size-8 items-center justify-center rounded-full bg-accent">
      <Text tone="onAccent" className="font-inter-bold text-[11px] tracking-[0.4px] uppercase">
        {t(`units.${weightUnit(units)}`)}
      </Text>
    </View>
  );
}
