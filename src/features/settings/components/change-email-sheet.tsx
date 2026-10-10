import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { type AuthErrorKey, authErrorKey, isValidEmail } from '@/features/auth/lib/credentials';
import { supabase } from '@/shared/data/supabase';
import { haptics } from '@/shared/lib/haptics';
import { Button } from '@/shared/ui/button';
import { Sheet } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';
import { TextField } from '@/shared/ui/text-field';

export interface ChangeEmailSheetProps {
  visible: boolean;
  onClose: () => void;
  currentEmail: string;
}

/**
 * A new email address: Supabase mails a link to the old and the new address, and the change
 * applies once both are confirmed (auth.email.double_confirm_changes).
 */
export function ChangeEmailSheet({ visible, onClose, currentEmail }: ChangeEmailSheetProps) {
  const { t } = useTranslation(['profile', 'auth', 'common']);
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AuthErrorKey | 'sameEmail' | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [wasVisible, setWasVisible] = useState(visible);
  // A fresh form each time the sheet opens.
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setEmail('');
      setError(null);
      setSentTo(null);
    }
  }
  const next = email.trim();
  const valid = isValidEmail(next);

  async function send() {
    if (!valid || busy) return;
    if (next.toLowerCase() === currentEmail.toLowerCase()) {
      haptics.error();
      setError('sameEmail');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ email: next });
      if (updateError) {
        haptics.error();
        setError(authErrorKey(updateError));
        return;
      }
      haptics.success();
      setSentTo(next);
    } catch {
      haptics.error();
      setError('generic');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={t(sentTo ? 'settings.email.sentTitle' : 'settings.email.title')}
      subtitle={
        sentTo
          ? t('settings.email.sent', { old: currentEmail, new: sentTo })
          : t('settings.email.subtitle')
      }
    >
      {sentTo ? (
        <Button label={t('common:actions.done')} onPress={onClose} />
      ) : (
        <>
          <View className="gap-2">
            <TextField
              label={t('settings.email.label')}
              value={email}
              onChangeText={(value) => {
                setEmail(value);
                setError(null);
              }}
              placeholder={t('auth:emailPlaceholder')}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              returnKeyType="send"
              onSubmitEditing={send}
              clearable
              autoFocus
            />
            {error ? (
              <Text variant="caption" tone="danger" className="px-1">
                {error === 'sameEmail'
                  ? t('settings.email.same')
                  : error === 'alreadyRegistered'
                    ? t('settings.email.taken')
                    : t(`auth:errors.${error}`)}
              </Text>
            ) : null}
          </View>
          <View className="gap-2.5 pt-5">
            <Button
              label={t('settings.email.send')}
              disabled={!valid}
              loading={busy}
              onPress={send}
            />
            <Button label={t('common:actions.cancel')} variant="secondary" onPress={onClose} />
          </View>
        </>
      )}
    </Sheet>
  );
}
