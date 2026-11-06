import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { haptics } from '@/shared/lib/haptics';
import { Button } from '@/shared/ui/button';
import { StepScreen } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';
import { TextButton } from '@/shared/ui/text-button';
import { TextField } from '@/shared/ui/text-field';

import { EmailAuthError, type EmailAuthReason, isEmail, sendResetCode } from '../lib/email-auth';

/** "Passwort vergessen?" (1 of 2): the email the code for a new password goes to. */
export function ForgotPasswordScreen() {
  const { t } = useTranslation('auth');
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<EmailAuthReason | null>(null);
  const ready = isEmail(email);

  const send = async () => {
    if (busy || !ready) return;
    setBusy(true);
    setError(null);
    try {
      await sendResetCode(email);
      router.push({ pathname: '/reset-code', params: { email: email.trim() } });
    } catch (e) {
      haptics.error();
      setError(e instanceof EmailAuthError ? e.reason : 'generic');
    }
    setBusy(false);
  };

  return (
    <StepScreen
      step={1}
      total={2}
      title={t('forgot.title')}
      subtitle={t('forgot.subtitle')}
      subtitleTone="subtle"
      scroll
      footer={
        <View className="gap-1">
          {error ? (
            <Text variant="caption" tone="danger" className="px-1 pb-2 text-center">
              {t(`errors.${error}`)}
            </Text>
          ) : null}
          <Button label={t('forgot.cta')} loading={busy} disabled={!ready} onPress={send} />
          <TextButton
            prefix={t('forgot.back')}
            label={t('forgot.backLink')}
            onPress={() => router.back()}
          />
        </View>
      }
    >
      <View className="px-4 pt-6">
        <TextField
          label={t('email.label')}
          value={email}
          onChangeText={setEmail}
          placeholder={t('email.placeholder')}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="username"
          returnKeyType="send"
          onSubmitEditing={send}
          autoFocus
        />
      </View>
    </StepScreen>
  );
}
