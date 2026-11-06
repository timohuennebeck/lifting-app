import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';

/** The import's 26pt check box: filled accent with a tick, or an empty frame. */
export function CheckBox({ checked, className }: { checked: boolean; className?: string }) {
  return (
    <View
      className={cn(
        'size-6.5 items-center justify-center rounded-lg border-2',
        checked ? 'border-transparent bg-accent' : 'border-[#3A3A3A]',
        className,
      )}
    >
      {checked ? <Icon name="check" size={12} color={colors.onAccent} /> : null}
    </View>
  );
}
