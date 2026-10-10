import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { supabase } from '@/shared/data/supabase';
import { haptics } from '@/shared/lib/haptics';
import { Button } from '@/shared/ui/button';
import { StepScreen } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';
import { TextButton } from '@/shared/ui/text-button';
import { TextField } from '@/shared/ui/text-field';

import { type AuthErrorKey, authErrorKey, isValidEmail, RESET_STEPS } from '../lib/credentials';

/** Password reset 1/3 (design PW-A): the email the code goes to. */
export function ForgotPasswordScreen() {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AuthErrorKey | null>(null);
  const valid = isValidEmail(email);

  async function send() {
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      // Unknown addresses get no email but the same answer, so accounts can't be probed.
      const { error: sendError } = await supabase.auth.resetPasswordForEmail(email);
      if (sendError) {
        haptics.error();
        setError(authErrorKey(sendError));
        return;
      }
      haptics.success();
      router.push({ pathname: '/forgot-password/code', params: { email } });
    } catch {
      haptics.error();
      setError('generic');
    } finally {
      setBusy(false);
    }
  }

  return (
    <StepScreen
      step={1}
      total={RESET_STEPS}
      title={t('forgot.title')}
      subtitle={t('forgot.subtitle')}
      scroll
      footer={
        <View className="gap-1">
          <Button label={t('forgot.send')} disabled={!valid} loading={busy} onPress={send} />
          <TextButton
            prefix={t('forgot.backPrefix')}
            label={t('forgot.back')}
            onPress={() => router.back()}
          />
        </View>
      }
    >
      <View className="px-4 pt-6">
        <TextField
          label={t('email')}
          value={email}
          onChangeText={(v) => setEmail(v.trim())}
          placeholder={t('emailPlaceholder')}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="username"
          returnKeyType="send"
          onSubmitEditing={send}
          autoFocus
        />
        {error ? (
          <Text variant="caption" tone="danger" className="px-1 pt-3">
            {t(`errors.${error}`)}
          </Text>
        ) : null}
      </View>
    </StepScreen>
  );
}
