import { router, Stack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import {
  adoptSignUpName,
  isOnboardedAfterSync,
} from '@/features/onboarding/lib/persist-onboarding';
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding-store';
import { supabase } from '@/shared/data/supabase';
import { useHardwareBack } from '@/shared/hooks/use-hardware-back';
import { haptics } from '@/shared/lib/haptics';
import { useSessionStore } from '@/shared/stores/session-store';
import { Button } from '@/shared/ui/button';
import { StepScreen } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';
import { TextField } from '@/shared/ui/text-field';

import { PasswordStrength } from '../components/password-strength';
import {
  type AuthErrorKey,
  authErrorKey,
  MIN_PASSWORD_LENGTH,
  RESET_STEPS,
} from '../lib/credentials';

/** Password reset 3/3: the new password; the user is signed in afterwards. */
export function NewPasswordScreen() {
  const { t } = useTranslation('auth');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AuthErrorKey | null>(null);
  const valid = password.length >= MIN_PASSWORD_LENGTH;
  // The code is used up: there is no way back, only forward (Android back does nothing).
  useHardwareBack(() => {});

  async function save() {
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      const { data, error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError || !data.user) {
        haptics.error();
        setError(updateError ? authErrorKey(updateError) : 'generic');
        setBusy(false);
        return;
      }
      haptics.success();
      // Signed in now, as after "Sign in": the app opens, or onboarding goes on.
      const store = useOnboardingStore.getState();
      const onboarded = await isOnboardedAfterSync(data.user.id);
      useSessionStore.getState().setRecovering(false);
      if (onboarded) {
        store.complete();
        return;
      }
      adoptSignUpName(data.user);
      router.replace('/name');
    } catch {
      haptics.error();
      setError('generic');
      setBusy(false);
    }
  }

  return (
    <StepScreen
      step={3}
      total={RESET_STEPS}
      hideBack
      title={t('forgot.newTitle')}
      subtitle={t('forgot.newSubtitle')}
      scroll
      footer={<Button label={t('forgot.save')} disabled={!valid} loading={busy} onPress={save} />}
    >
      <Stack.Screen options={{ gestureEnabled: false }} />
      <View className="gap-2.5 px-4 pt-6">
        <TextField
          label={t('password')}
          value={password}
          onChangeText={setPassword}
          placeholder={t('passwordPlaceholder')}
          secureTextEntry
          revealable
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          onSubmitEditing={save}
          autoFocus
        />
        <PasswordStrength password={password} />
        {error ? (
          <Text variant="caption" tone="danger" className="px-1 pt-1">
            {t(`errors.${error}`)}
          </Text>
        ) : null}
      </View>
    </StepScreen>
  );
}
