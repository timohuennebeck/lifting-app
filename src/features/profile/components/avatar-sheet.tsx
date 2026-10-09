import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { MinusGlyph } from '@/features/training/components/glyphs';
import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Icon, type IconName } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Sheet } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';

import type { AvatarSource } from '../lib/avatar';

export type AvatarAction = AvatarSource | 'remove';

export interface AvatarSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Offers "remove" while a photo is set. */
  hasPhoto: boolean;
  onAction: (action: AvatarAction) => void;
}

const ACTIONS: { action: AvatarAction; icon?: IconName }[] = [
  { action: 'camera', icon: 'photo-camera' },
  { action: 'library', icon: 'image' },
  { action: 'remove' },
];

/** Take, choose or remove the profile photo. */
export function AvatarSheet({ visible, onClose, hasPhoto, onAction }: AvatarSheetProps) {
  const { t } = useTranslation('profile');
  return (
    <Sheet visible={visible} onClose={onClose}>
      <View className="gap-1">
        {ACTIONS.filter(({ action }) => action !== 'remove' || hasPhoto).map(({ action, icon }) => {
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
                  <Icon name={icon} size={15} color={colors.fg} />
                ) : (
                  <MinusGlyph color={colors.red} width={14} />
                )}
              </View>
              <Text variant="label" className={cn('text-base', danger && 'text-red')}>
                {t(`avatar.${action}`)}
              </Text>
            </PressableScale>
          );
        })}
      </View>
    </Sheet>
  );
}
