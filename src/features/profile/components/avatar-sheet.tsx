import { useTranslation } from 'react-i18next';

import { ActionSheet } from '@/shared/ui/action-sheet';
import type { IconName } from '@/shared/ui/icon';

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
  const items = ACTIONS.filter(({ action }) => action !== 'remove' || hasPhoto).map(
    ({ action, icon }) => ({ action, icon, label: t(`avatar.${action}`) }),
  );
  return (
    <ActionSheet
      visible={visible}
      onClose={onClose}
      items={items}
      onAction={onAction}
      iconSize={15}
    />
  );
}
