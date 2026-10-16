import { View } from 'react-native';

import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

export interface SectionTitleProps {
  children: string;
  /** A link on the right, e.g. "Alle anzeigen". */
  action?: { label: string; onPress: () => void };
}

/** Overline over a group on the Training tab and a plan's page. */
export function SectionTitle({ children, action }: SectionTitleProps) {
  return (
    <View className="flex-row items-end justify-between px-5 pt-8 pb-2.5">
      <Text variant="overline" tone="subtle" className="text-[11px]">
        {children}
      </Text>
      {action ? (
        <PressableScale haptic="tap" hitSlop={10} onPress={action.onPress}>
          <Text variant="caption" tone="accent">
            {action.label}
          </Text>
        </PressableScale>
      ) : null}
    </View>
  );
}
