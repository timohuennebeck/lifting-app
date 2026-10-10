import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { colors } from '@/shared/lib/theme';
import { ChoiceSheet } from '@/shared/ui/choice-sheet';
import { Icon } from '@/shared/ui/icon';

export type AccountAction = 'email' | 'password';

export interface AccountSheetProps {
  visible: boolean;
  onClose: () => void;
  email: string;
  onChoose: (action: AccountAction) => void;
}

/** The profile card in the settings: change the email address or the password. */
export function AccountSheet({ visible, onClose, email, onChoose }: AccountSheetProps) {
  const { t } = useTranslation(['profile', 'common']);
  const [choice, setChoice] = useState<AccountAction>('email');
  const [wasVisible, setWasVisible] = useState(visible);
  // Opens on the first option each time, like the other sheets.
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) setChoice('email');
  }
  return (
    <ChoiceSheet
      visible={visible}
      onClose={onClose}
      title={t('settings.account.title')}
      value={choice}
      onChange={setChoice}
      onConfirm={onChoose}
      options={[
        {
          value: 'email',
          title: t('settings.account.email'),
          description: email,
          cta: t('common:actions.continue'),
          renderIcon: (active) => (
            <Icon name="mail" size={18} color={active ? colors.bg : colors.fg} />
          ),
        },
        {
          value: 'password',
          title: t('settings.account.password'),
          description: t('settings.account.passwordHint'),
          cta: t('common:actions.continue'),
          renderIcon: (active) => (
            <Icon name="lock" size={17} color={active ? colors.bg : colors.fg} />
          ),
        },
      ]}
    />
  );
}
