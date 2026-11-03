import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

export interface SectionTitleProps {
  children: string;
  /** A link on the right, e.g. "Alle anzeigen". */
  action?: { label: string; onPress: () => void };
  /** A pencil button on the right instead, e.g. "Bearbeiten". */
  edit?: { label: string; onPress: () => void };
  /** First on the page: less space above. */
  first?: boolean;
}

/** Overline over a group on the Training tab and the Einzeltrainings page. */
export function SectionTitle({ children, action, edit, first }: SectionTitleProps) {
  return (
    <View
      className={cn(
        'flex-row justify-between px-5 pb-2.5',
        edit ? 'items-center pr-4' : 'items-end',
        first ? 'pt-2' : 'pt-8',
      )}
    >
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
      {edit ? (
        <PressableScale
          haptic="tap"
          hitSlop={4}
          accessibilityRole="button"
          onPress={edit.onPress}
          className="h-9 flex-row items-center gap-1.5 rounded-full bg-elevated px-3.5"
        >
          <Icon name="pencil" size={12} color={colors.fg} />
          <Text variant="caption" className="font-inter-semibold">
            {edit.label}
          </Text>
        </PressableScale>
      ) : null}
    </View>
  );
}
