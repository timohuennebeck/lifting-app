import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';

import { Icon, type IconName } from './icon';
import { MinusGlyph } from './minus-glyph';
import { PressableScale } from './pressable-scale';
import { Sheet } from './sheet';
import { Text } from './text';

export interface ActionSheetItem<T extends string> {
  action: T;
  label: string;
  /** Without one the row removes something: red, marked with the app's minus. */
  icon?: IconName;
}

export interface ActionSheetProps<T extends string> {
  visible: boolean;
  onClose: () => void;
  items: ActionSheetItem<T>[];
  onAction: (action: T) => void;
  iconSize?: number;
}

/** Sheet with one row per action, its icon in a circle in front (exercise "⋯", profile photo). */
export function ActionSheet<T extends string>({
  visible,
  onClose,
  items,
  onAction,
  iconSize = 14,
}: ActionSheetProps<T>) {
  return (
    <Sheet visible={visible} onClose={onClose}>
      <View className="gap-1">
        {items.map(({ action, label, icon }) => (
          <PressableScale
            key={action}
            haptic={icon ? 'tap' : 'warning'}
            onPress={() => onAction(action)}
            className="h-14 flex-row items-center gap-3.5 rounded-[18px] px-2"
          >
            <View
              className={cn(
                'size-10 items-center justify-center rounded-full',
                icon ? 'bg-control' : 'bg-danger-bg',
              )}
            >
              {icon ? (
                <Icon name={icon} size={iconSize} color={colors.fg} />
              ) : (
                <MinusGlyph color={colors.red} width={14} />
              )}
            </View>
            <Text variant="label" className={cn('text-base', !icon && 'text-red')}>
              {label}
            </Text>
          </PressableScale>
        ))}
      </View>
    </Sheet>
  );
}
