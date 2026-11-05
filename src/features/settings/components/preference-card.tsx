import type { ReactNode } from 'react';
import { View } from 'react-native';

import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

export interface PreferenceCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  onPress: () => void;
}

/** Half-width card: an icon, then the label and its value (language, units, import, export). */
export function PreferenceCard({ label, value, icon, onPress }: PreferenceCardProps) {
  return (
    // A plain slot takes the half: a card's own padding would skew the widths.
    <View className="min-w-0 flex-1">
      <PressableScale
        haptic="tap"
        activeScale={0.98}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${value}`}
        onPress={onPress}
        className="gap-3.5 rounded-[22px] bg-surface p-4"
      >
        {icon}
        <View className="gap-0.5">
          <Text tone="subtle" className="text-sm">
            {label}
          </Text>
          <Text variant="bodyStrong" numberOfLines={1}>
            {value}
          </Text>
        </View>
      </PressableScale>
    </View>
  );
}
