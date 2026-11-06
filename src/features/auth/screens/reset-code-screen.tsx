import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useNow } from '@/shared/hooks/use-now';
import { formatDuration } from '@/shared/lib/format';
import { haptics } from '@/shared/lib/haptics';
import { Button } from '@/shared/ui/button';
import { StepScreen } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';
import { TextButton } from '@/shared/ui/text-button';

import { CODE_LENGTH, CodeInput } from '../components/code-input';
import {
  EmailAuthError,
  type EmailAuthReason,
  sendResetCode,
  verifyResetCode,
} from '../lib/email-auth';

/** Seconds before the code can be sent again. */
const RESEND_AFTER = 60;

/** "Code eingeben" (2 of 2): the code from the email; right, it signs in for the new password. */
export function ResetCodeScreen() {
  const { t } = useTranslation('auth');
  const { email = '' } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<EmailAuthReason | null>(null);
  const [sentAt, setSentAt] = useState(Date.now);
  const now = useNow(1000);
  const left = Math.max(0, RESEND_AFTER - Math.floor((now - sentAt) / 1000));

  const confirm = async () => {
    if (busy || code.length < CODE_LENGTH) return;
    setBusy(true);
    setError(null);
    try {
      await verifyResetCode(email, code);
      router.replace('/new-password');
    } catch (e) {
      haptics.error();
      setError(e instanceof EmailAuthError ? e.reason : 'generic');
      setCode('');
    }
    setBusy(false);
  };

  const resend = async () => {
    setError(null);
    setSentAt(Date.now());
    await sendResetCode(email).catch(() => setError('generic'));
  };

  return (
    <StepScreen
      step={2}
      total={2}
      title={t('code.title')}
      subtitle={
        <Trans
          t={t}
          i18nKey="code.subtitle"
          values={{ email }}
          components={{ email: <Text variant="paragraph" className="font-inter-semibold" /> }}
        />
      }
      subtitleTone="subtle"
      scroll
      footer={
        <View className="gap-1">
          <Button
            label={t('code.cta')}
            loading={busy}
            disabled={code.length < CODE_LENGTH}
            onPress={confirm}
          />
          <TextButton
            label={t('code.otherEmail')}
            tone="muted"
            textClassName="font-inter-medium"
            onPress={() => router.back()}
          />
        </View>
      }
    >
      <View className="gap-3.5 px-4 pt-6">
        <CodeInput
          value={code}
          onChange={(next) => {
            setCode(next);
            setError(null);
          }}
          editable={!busy}
        />
        {error ? (
          <Text variant="caption" tone="danger" className="px-1">
            {t(`errors.${error}`)}
          </Text>
        ) : null}
        <View className="flex-row items-center justify-between px-1">
          <Text variant="caption" tone="subtle" className="font-inter">
            {t('code.noCode')}
          </Text>
          {left > 0 ? (
            <Text variant="caption" tone="subtle" className="font-inter tabular-nums">
              {t('code.resendIn', { time: formatDuration(left) })}
            </Text>
          ) : (
            <TextButton
              label={t('code.resend')}
              tone="accent"
              className="min-h-8 px-0"
              textClassName="text-[13px]"
              onPress={() => void resend()}
            />
          )}
        </View>
      </View>
    </StepScreen>
  );
}
