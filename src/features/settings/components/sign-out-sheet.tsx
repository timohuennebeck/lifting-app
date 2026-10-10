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

/** "Abmelden": its one option comes selected, as in the other sheets; red if data would be lost. */
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
          tone: unsynced > 0 ? 'danger' : 'accent',
          title: t('settings.signOutConfirm.option'),
          description:
            unsynced > 0
              ? t('settings.signOutConfirm.unsynced', { count: unsynced })
              : t('settings.signOutConfirm.body'),
          cta: t('settings.signOut'),
          renderIcon: (active) => (
            <Icon name="sign-out" size={18} color={active ? colors.bg : colors.fg} />
          ),
        },
      ]}
    />
  );
}
