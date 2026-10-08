import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Icon, type IconName } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Sheet } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';

export type ExerciseMenuAction = 'editSets' | 'swap' | 'moveUp' | 'moveDown' | 'remove';

export interface ExerciseMenuSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onAction: (action: ExerciseMenuAction) => void;
}

const ACTIONS: { action: ExerciseMenuAction; icon: IconName }[] = [
  { action: 'editSets', icon: 'pencil' },
  { action: 'swap', icon: 'swap' },
  { action: 'moveUp', icon: 'arrow-up' },
  { action: 'moveDown', icon: 'chevron-down' },
  { action: 'remove', icon: 'trash' },
];

/** Per-exercise "⋯" menu: edit sets, swap, reorder, remove. */
export function ExerciseMenuSheet({
  visible,
  onClose,
  title,
  canMoveUp,
  canMoveDown,
  onAction,
}: ExerciseMenuSheetProps) {
  const { t } = useTranslation('training');
  const available = ACTIONS.filter(
    ({ action }) => (action !== 'moveUp' || canMoveUp) && (action !== 'moveDown' || canMoveDown),
  );
  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      <View className="gap-1">
        {available.map(({ action, icon }) => {
          const danger = action === 'remove';
          return (
            <PressableScale
              key={action}
              haptic={danger ? 'warning' : 'tap'}
              onPress={() => onAction(action)}
              className="h-14 flex-row items-center gap-3.5 rounded-[18px] px-2"
            >
              <View
                className={cn(
                  'size-10 items-center justify-center rounded-full',
                  danger ? 'bg-danger-bg' : 'bg-control',
                )}
              >
                <Icon name={icon} size={14} color={danger ? colors.red : colors.fg} />
              </View>
              <Text variant="label" className={cn('text-base', danger && 'text-red')}>
                {t(`exerciseMenu.${action}`)}
              </Text>
            </PressableScale>
          );
        })}
      </View>
    </Sheet>
  );
}
