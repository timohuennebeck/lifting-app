import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { PasswordStrength } from '@/features/auth/components/password-strength';
import {
  type AuthErrorKey,
  authErrorKey,
  MIN_PASSWORD_LENGTH,
} from '@/features/auth/lib/credentials';
import { supabase } from '@/shared/data/supabase';
import { haptics } from '@/shared/lib/haptics';
import { Button } from '@/shared/ui/button';
import { Sheet } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';
import { TextField } from '@/shared/ui/text-field';

export interface ChangePasswordSheetProps {
  visible: boolean;
  onClose: () => void;
}

/** A new password for the signed-in user; it applies right away (no re-authentication). */
export function ChangePasswordSheet({ visible, onClose }: ChangePasswordSheetProps) {
  const { t } = useTranslation(['profile', 'auth', 'common']);
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AuthErrorKey | null>(null);
  const [wasVisible, setWasVisible] = useState(visible);
  if (visible !== wasVisible) {
    setWasVisible(visible);
    if (visible) {
      setPassword('');
      setError(null);
    }
  }
  const valid = password.length >= MIN_PASSWORD_LENGTH;

  async function save() {
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        haptics.error();
        setError(authErrorKey(updateError));
        return;
      }
      haptics.success();
      onClose();
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
      title={t('settings.password.title')}
      subtitle={t('settings.password.subtitle')}
    >
      <View className="gap-2.5">
        <TextField
          label={t('settings.password.label')}
          value={password}
          onChangeText={(value) => {
            setPassword(value);
            setError(null);
          }}
          placeholder={t('auth:passwordPlaceholder')}
          secureTextEntry
          revealable
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="done"
          onSubmitEditing={save}
          autoFocus
        />
        <PasswordStrength password={password} />
        {error ? (
          <Text variant="caption" tone="danger" className="px-1">
            {t(`auth:errors.${error}`)}
          </Text>
        ) : null}
      </View>
      <View className="gap-2.5 pt-5">
        <Button label={t('common:actions.save')} disabled={!valid} loading={busy} onPress={save} />
        <Button label={t('common:actions.cancel')} variant="secondary" onPress={onClose} />
      </View>
    </Sheet>
  );
}
