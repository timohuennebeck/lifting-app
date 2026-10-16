import { View } from 'react-native';

import { type UnitSystem, weightUnit } from '@/shared/lib/format';
import { Text } from '@/shared/ui/text';

/** "KG" or "LB" on a neon circle: the weight unit at a glance. */
export function UnitBadge({ units }: { units: UnitSystem }) {
  return (
    <View className="size-8 items-center justify-center rounded-full bg-accent">
      <Text tone="onAccent" className="font-inter-bold text-[11px] tracking-[0.4px] uppercase">
        {weightUnit(units)}
      </Text>
    </View>
  );
}
