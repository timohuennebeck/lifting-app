import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

export interface PlanCardProps {
  label: string;
  /** Null while the offering loads. */
  price: string | null;
  note: string;
  selected: boolean;
  onPress: () => void;
}

/** Selectable 4:3 plan tile with a square check in the corner. */
export function PlanCard({ label, price, note, selected, onPress }: PlanCardProps) {
  return (
    <PressableScale
      haptic="select"
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={[label, price, note].filter(Boolean).join(', ')}
      onPress={onPress}
      className="flex-1 overflow-hidden rounded-[22px] bg-surface p-4"
      style={{
        aspectRatio: 4 / 3,
        boxShadow: selected ? `inset 0 0 0 2px ${colors.accent}` : `inset 0 0 0 1px ${colors.line}`,
      }}
    >
      {selected ? <View className="absolute inset-0 bg-accent/8" /> : null}
      <View
        className={cn(
          'absolute top-4 right-4 size-5.5 items-center justify-center rounded-[7px]',
          selected ? 'bg-accent' : 'border-2 border-outline',
        )}
      >
        {selected ? <Icon name="check" size={11} color={colors.onAccent} /> : null}
      </View>
      <Text variant="caption" className="text-sm leading-5.5 text-fg-mid">
        {label}
      </Text>
      <Text variant="caption" className="mt-auto text-xl leading-6" numberOfLines={2}>
        {price ?? ' '}
      </Text>
      <Text
        variant="caption"
        tone="subtle"
        numberOfLines={1}
        className="mt-0.5 font-inter text-xs leading-4"
      >
        {note}
      </Text>
    </PressableScale>
  );
}
