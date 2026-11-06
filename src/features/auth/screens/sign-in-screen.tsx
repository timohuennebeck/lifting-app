import type { User } from '@supabase/supabase-js';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { isOnboardedAfterSync } from '@/features/onboarding/lib/persist-onboarding';
import { haptics } from '@/shared/lib/haptics';
import type { AuthMethod } from '@/shared/lib/posthog';
import { Button } from '@/shared/ui/button';
import { StepScreen } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';
import { TextButton } from '@/shared/ui/text-button';

import { EmailDivider, EmailFields } from '../components/email-fields';
import { SocialSignIn } from '../components/social-sign-in';
import { EmailAuthError, type EmailAuthReason, isEmail, signInWithEmail } from '../lib/email-auth';
import { enterAccount } from '../lib/enter-account';
import {
  discardNewAccount,
  isNewAccount,
  signInWith,
  type SocialProvider,
} from '../lib/social-sign-in';

type Phase = 'idle' | SocialProvider | 'email' | 'syncing';
/** `noAccount`: Google or Apple would have made a new account, which only onboarding does. */
type ErrorKey = EmailAuthReason | 'noAccount';

/** Sign-in to an existing account, from the welcome screen: Google, Apple, or email. */
export function SignInScreen() {
  const { t } = useTranslation('auth');
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<ErrorKey | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const busy = phase !== 'idle';
  const ready = isEmail(email) && password.length > 0;

  const fail = (key: ErrorKey) => {
    haptics.error();
    setError(key);
    setPhase('idle');
  };

  /** Signed in: into the app, or on into onboarding for an account that hasn't finished it. */
  const continueAs = async (user: User, method: AuthMethod) => {
    setPhase('syncing');
    const onboarded = await isOnboardedAfterSync(user.id);
    // Accounts are made at the end of onboarding, after its answers and the terms.
    if (!onboarded && method !== 'email' && isNewAccount(user)) {
      await discardNewAccount(method);
      return fail('noAccount');
    }
    await enterAccount(user, method, onboarded);
    setPhase('idle');
  };

  const social = async (provider: SocialProvider) => {
    if (busy) return;
    setPhase(provider);
    setError(null);
    try {
      const user = await signInWith(provider);
      if (user) await continueAs(user, provider);
      else setPhase('idle');
    } catch {
      fail('generic');
    }
  };

  const signIn = async () => {
    if (busy || !ready) return;
    setPhase('email');
    setError(null);
    try {
      await continueAs(await signInWithEmail(email, password), 'email');
    } catch (e) {
      fail(e instanceof EmailAuthError ? e.reason : 'generic');
    }
  };

  return (
    <StepScreen
      title={t('signIn.title')}
      subtitle={t('signIn.subtitle')}
      scroll
      footer={
        <View className="gap-3">
          {phase === 'syncing' ? (
            <Text variant="caption" tone="subtle" className="text-center">
              {t('signIn.syncing')}
            </Text>
          ) : null}
          {error ? (
            <View className="items-center gap-1 px-1">
              <Text
                variant="caption"
                tone="danger"
                className="text-center"
                accessibilityLiveRegion="assertive"
              >
                {t(`errors.${error}`)}
              </Text>
              {error === 'noAccount' ? (
                <TextButton
                  label={t('signIn.getStarted')}
                  tone="accent"
                  className="min-h-10 px-0"
                  onPress={() => router.replace('/name')}
                />
              ) : null}
            </View>
          ) : null}
          <Button
            label={t('signIn.cta')}
            loading={phase === 'email' || phase === 'syncing'}
            disabled={!ready || busy}
            onPress={signIn}
          />
        </View>
      }
    >
      <View className="gap-5 px-4 pt-6">
        <SocialSignIn
          onSignIn={social}
          busy={phase === 'google' || phase === 'apple' ? phase : null}
          disabled={busy}
        />
        <EmailDivider />
        <EmailFields
          email={email}
          password={password}
          onChangeEmail={setEmail}
          onChangePassword={setPassword}
          onSubmit={signIn}
          onForgot={() => router.push({ pathname: '/forgot-password', params: { email } })}
          editable={!busy}
        />
      </View>
    </StepScreen>
  );
}
