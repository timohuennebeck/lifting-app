import type { User } from '@supabase/supabase-js';
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import {
  adoptSignUpName,
  isOnboardedAfterSync,
} from '@/features/onboarding/lib/persist-onboarding';
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding-store';
import { supabase } from '@/shared/data/supabase';
import { haptics } from '@/shared/lib/haptics';
import { Button } from '@/shared/ui/button';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { StepTitle } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';
import { TextButton } from '@/shared/ui/text-button';

import { CredentialFields } from '../components/credential-fields';
import { SocialSignIn } from '../components/social-sign-in';
import { type AuthErrorKey, authErrorKey, isValidEmail } from '../lib/credentials';
import { signInWith, type SocialProvider } from '../lib/social-sign-in';

type Phase = 'idle' | 'signingIn' | SocialProvider | 'syncing';

export function SignInScreen() {
  const { t } = useTranslation('auth');
  const navigation = useNavigation();
  const params = useLocalSearchParams<{ email?: string }>();
  const [email, setEmail] = useState(params.email ?? '');
  const [password, setPassword] = useState('');
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<AuthErrorKey | null>(null);
  const valid = isValidEmail(email) && password.length > 0;
  const busy = phase !== 'idle';
  const socialBusy = phase === 'google' || phase === 'apple' ? phase : null;

  const fail = (key: AuthErrorKey) => {
    haptics.error();
    setError(key);
    setPhase('idle');
  };

  /** Signed in: into the app, or into onboarding for an account that hasn't finished it. */
  const continueAs = async (user: User) => {
    haptics.success();
    setPhase('syncing');
    const store = useOnboardingStore.getState();
    if (await isOnboardedAfterSync(user.id)) {
      // The root guard switches to the app once onboarding is marked complete.
      store.complete();
      return;
    }
    adoptSignUpName(user);
    setPhase('idle');
    // The user went back while syncing; replacing now would replace the screen they're on.
    if (!navigation.isFocused()) return;
    // A finished draft (e.g. "already registered" on Create Account) goes back there:
    // it now shows "Continue" and saves the draft instead of restarting the flow.
    if (store.draft.plan) router.dismissTo('/create-account');
    else router.replace('/name');
  };

  const submit = async () => {
    if (!valid || busy) return;
    setPhase('signingIn');
    setError(null);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) return fail(authErrorKey(signInError));
      if (!data.user) return fail('generic');
      await continueAs(data.user);
    } catch {
      fail('generic');
    }
  };

  const social = async (provider: SocialProvider) => {
    if (busy) return;
    setPhase(provider);
    setError(null);
    try {
      const user = await signInWith(provider);
      if (user) await continueAs(user);
      else setPhase('idle');
    } catch {
      fail('generic');
    }
  };

  return (
    <Screen
      scroll
      header={<ScreenHeader />}
      footer={
        <View className="gap-1">
          <Button
            label={t('signIn.submit')}
            disabled={!valid || !!socialBusy}
            loading={phase === 'signingIn' || phase === 'syncing'}
            onPress={submit}
          />
          {phase === 'syncing' ? (
            <Text variant="caption" tone="subtle" className="min-h-12 py-4 text-center">
              {t('signIn.syncing')}
            </Text>
          ) : (
            <TextButton
              prefix={t('signIn.noAccount')}
              label={t('signIn.getStarted')}
              onPress={() => router.replace('/name')}
            />
          )}
        </View>
      }
    >
      <StepTitle title={t('signIn.title')} subtitle={t('signIn.subtitle')} />
      {/* Same sign-in options as account creation. */}
      <View className="px-4 pt-5">
        <SocialSignIn onSignIn={social} busy={socialBusy} disabled={busy} />
      </View>
      <View className="px-4 pt-3.5">
        <CredentialFields
          mode="existing"
          email={email}
          password={password}
          onChangeEmail={setEmail}
          onChangePassword={setPassword}
          onSubmit={submit}
          editable={!busy}
          autoFocus
        />
        {error ? (
          <Text
            variant="caption"
            tone="danger"
            className="px-1 pt-3"
            accessibilityLiveRegion="assertive"
          >
            {t(`errors.${error}`)}
          </Text>
        ) : null}
        <TextButton
          label={t('forgot.link')}
          tone="muted"
          onPress={() => router.push('/forgot-password')}
          className="self-end"
          textClassName="text-sm"
        />
      </View>
    </Screen>
  );
}
