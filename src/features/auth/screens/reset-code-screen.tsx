import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { supabase } from '@/shared/data/supabase';
import { useNow } from '@/shared/hooks/use-now';
import { formatDuration } from '@/shared/lib/format';
import { haptics } from '@/shared/lib/haptics';
import { useSessionStore } from '@/shared/stores/session-store';
import { Button } from '@/shared/ui/button';
import { StepScreen } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';
import { TextButton } from '@/shared/ui/text-button';

import { CodeInput } from '../components/code-input';
import { type AuthErrorKey, authErrorKey, RESET_STEPS } from '../lib/credentials';

const CODE_LENGTH = 6;
/** A new code can be asked for this long after the last one. */
const RESEND_SECONDS = 60;

/** Password reset 2/3 (design PW-B): the 6-digit code from the email. */
export function ResetCodeScreen() {
  const { t } = useTranslation('auth');
  const { email = '' } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<AuthErrorKey | null>(null);
  const [sentAt, setSentAt] = useState(() => Date.now());
  const now = useNow(1000);
  const wait = Math.max(0, Math.ceil(RESEND_SECONDS - (now - sentAt) / 1000));
  const complete = code.length === CODE_LENGTH;

  // A full code is checked straight away (e.g. filled in from the email).
  useEffect(() => {
    if (complete) void confirm();
    // Only when the last digit arrives.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complete]);

  async function confirm() {
    if (!complete || busy) return;
    setBusy(true);
    setError(null);
    const { setRecovering } = useSessionStore.getState();
    // The code signs in; the app opens only once the new password is set.
    setRecovering(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: code,
        type: 'recovery',
      });
      if (verifyError) {
        setRecovering(false);
        haptics.error();
        setError(authErrorKey(verifyError));
        return;
      }
      haptics.success();
      router.replace('/forgot-password/new');
    } catch {
      setRecovering(false);
      haptics.error();
      setError('generic');
    } finally {
      setBusy(false);
    }
  }

  async function resend() {
    setError(null);
    setCode('');
    const { error: sendError } = await supabase.auth.resetPasswordForEmail(email);
    if (sendError) {
      haptics.error();
      setError(authErrorKey(sendError));
      return;
    }
    haptics.success();
    setSentAt(Date.now());
  }

  return (
    <StepScreen
      step={2}
      total={RESET_STEPS}
      title={t('forgot.codeTitle')}
      footer={
        <View className="gap-1">
          <Button
            label={t('forgot.confirm')}
            disabled={!complete}
            loading={busy}
            onPress={confirm}
          />
          <TextButton label={t('forgot.otherEmail')} onPress={() => router.back()} />
        </View>
      }
    >
      <Text variant="paragraph" tone="muted" className="mt-2.5 px-5">
        <Trans
          t={t}
          i18nKey="forgot.codeSubtitle"
          values={{ email }}
          components={{ bold: <Text variant="paragraph" className="font-inter-semibold" /> }}
        />
      </Text>
      <View className="px-4 pt-6">
        <CodeInput
          value={code}
          onChange={(next) => {
            setCode(next);
            setError(null);
          }}
          length={CODE_LENGTH}
          accessibilityLabel={t('forgot.codeLabel')}
          error={!!error}
        />
        {error ? (
          <Text variant="caption" tone="danger" className="px-1 pt-3">
            {t(`errors.${error}`)}
          </Text>
        ) : null}
        <View className="flex-row items-center justify-between px-1 pt-4">
          <Text variant="caption" tone="subtle" className="font-inter">
            {t('forgot.noCode')}
          </Text>
          {wait > 0 ? (
            <Text variant="caption" tone="subtle" className="tabular-nums">
              {t('forgot.resendIn', { time: formatDuration(wait) })}
            </Text>
          ) : (
            <TextButton label={t('forgot.resend')} tone="accent" onPress={resend} />
          )}
        </View>
      </View>
    </StepScreen>
  );
}
