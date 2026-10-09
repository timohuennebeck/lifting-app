import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Icon, type IconName } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Sheet } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';

import { MinusGlyph } from './glyphs';

export type ExerciseMenuAction = 'editSets' | 'swap' | 'moveUp' | 'moveDown' | 'remove';

export interface ExerciseMenuSheetProps {
  visible: boolean;
  onClose: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  onAction: (action: ExerciseMenuAction) => void;
  /** Actions to leave out, e.g. "editSets" where sets can't be edited. */
  hidden?: ExerciseMenuAction[];
}

const ACTIONS: { action: ExerciseMenuAction; icon?: IconName }[] = [
  { action: 'editSets', icon: 'pencil' },
  { action: 'swap', icon: 'swap' },
  { action: 'moveUp', icon: 'arrow-up' },
  { action: 'moveDown', icon: 'chevron-down' },
  // The app's usual remove mark: a minus.
  { action: 'remove' },
];

/** Per-exercise "⋯" menu: edit sets, swap, reorder, remove. */
export function ExerciseMenuSheet({
  visible,
  onClose,
  canMoveUp,
  canMoveDown,
  onAction,
  hidden = [],
}: ExerciseMenuSheetProps) {
  const { t } = useTranslation('training');
  const available = ACTIONS.filter(
    ({ action }) =>
      !hidden.includes(action) &&
      (action !== 'moveUp' || canMoveUp) &&
      (action !== 'moveDown' || canMoveDown),
  );
  return (
    <Sheet visible={visible} onClose={onClose}>
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
                {icon ? (
                  <Icon name={icon} size={14} color={colors.fg} />
                ) : (
                  <MinusGlyph color={colors.red} width={14} />
                )}
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
