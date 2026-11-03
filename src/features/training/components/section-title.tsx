import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

export interface SectionTitleProps {
  children: string;
  /** A link on the right, e.g. "Alle anzeigen". */
  action?: { label: string; onPress: () => void };
  /** First on the page: less space above. */
  first?: boolean;
}

/** Overline over a group on the Training tab and the Einzeltrainings page. */
export function SectionTitle({ children, action, first }: SectionTitleProps) {
  return (
    <View className={cn('flex-row items-end justify-between px-5 pb-2.5', first ? 'pt-2' : 'pt-8')}>
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
