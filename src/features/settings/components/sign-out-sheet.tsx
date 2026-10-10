import { useTranslation } from 'react-i18next';

import { colors } from '@/shared/lib/theme';
import { ChoiceSheet } from '@/shared/ui/choice-sheet';
import { Icon } from '@/shared/ui/icon';

export interface SignOutSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Changes and photos not uploaded yet: signing out deletes them from this device. */
  unsynced: number;
  onSignOut: () => void;
}

/** Shown before signing out only when unsynced data would be lost; its one option comes selected. */
export function SignOutSheet({ visible, onClose, unsynced, onSignOut }: SignOutSheetProps) {
  const { t } = useTranslation('profile');
  return (
    <ChoiceSheet
      visible={visible}
      onClose={onClose}
      title={t('settings.signOutConfirm.title')}
      value="signOut"
      onChange={() => {}}
      onConfirm={onSignOut}
      options={[
        {
          value: 'signOut',
          tone: 'danger',
          title: t('settings.signOutConfirm.option'),
          description: t('settings.signOutConfirm.unsynced', { count: unsynced }),
          cta: t('settings.signOut'),
          renderIcon: (active) => (
            <Icon name="sign-out" size={18} color={active ? colors.bg : colors.fg} />
          ),
        },
      ]}
    />
  );
}
