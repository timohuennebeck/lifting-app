import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { haptics } from '@/shared/lib/haptics';
import { Button } from '@/shared/ui/button';
import { StepScreen } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';

import { PasswordField } from '../components/email-fields';
import {
  EmailAuthError,
  type EmailAuthReason,
  MIN_PASSWORD,
  setNewPassword,
} from '../lib/email-auth';
import { enterAccount } from '../lib/enter-account';

/** After the code: the new password; saved, on into the account like a sign-in. */
export function NewPasswordScreen() {
  const { t } = useTranslation('auth');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<EmailAuthReason | null>(null);
  const ready = password.length >= MIN_PASSWORD;

  const save = async () => {
    if (busy || !ready) return;
    setBusy(true);
    setError(null);
    try {
      await enterAccount(await setNewPassword(password), 'email');
    } catch (e) {
      haptics.error();
      setError(e instanceof EmailAuthError ? e.reason : 'generic');
    }
    setBusy(false);
  };

  return (
    <StepScreen
      title={t('newPassword.title')}
      subtitle={t('newPassword.subtitle')}
      subtitleTone="subtle"
      scroll
      footer={
        <View className="gap-3">
          {error ? (
            <Text variant="caption" tone="danger" className="px-1 text-center">
              {t(`errors.${error}`)}
            </Text>
          ) : null}
          <Button label={t('newPassword.cta')} loading={busy} disabled={!ready} onPress={save} />
        </View>
      }
    >
      <View className="px-4 pt-6">
        <PasswordField isNew value={password} onChange={setPassword} onSubmit={save} autoFocus />
      </View>
    </StepScreen>
  );
}
