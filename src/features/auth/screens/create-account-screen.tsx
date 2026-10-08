import { router } from 'expo-router';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { StepTitle } from '@/features/onboarding/components/onboarding-step';
import { TextButton } from '@/features/onboarding/components/text-button';
import { START_STEPS } from '@/features/onboarding/lib/flow';
import { persistOnboarding } from '@/features/onboarding/lib/persist-onboarding';
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding-store';
import { supabase } from '@/shared/data/supabase';
import { haptics } from '@/shared/lib/haptics';
import { useSessionStore } from '@/shared/stores/session-store';
import { Button } from '@/shared/ui/button';
import { Screen } from '@/shared/ui/screen';
import { StepHeader } from '@/shared/ui/step-header';
import { Text } from '@/shared/ui/text';

import { CredentialFields } from '../components/credential-fields';
import { SocialSignIn } from '../components/social-sign-in';
import {
  type AuthErrorKey,
  authErrorKey,
  isValidEmail,
  MIN_PASSWORD_LENGTH,
} from '../lib/credentials';

type ErrorKey = AuthErrorKey | 'confirmEmail';

export function CreateAccountScreen() {
  const { t } = useTranslation('auth');
  const { t: tc } = useTranslation();
  const session = useSessionStore((s) => s.session);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<ErrorKey | null>(null);

  // Already signed in (e.g. came back from the next step): just save and continue.
  const signedIn = !!session;
  const valid = signedIn || (isValidEmail(email) && password.length >= MIN_PASSWORD_LENGTH);

  const fail = (key: ErrorKey) => {
    haptics.error();
    setError(key);
  };

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true);
    setError(null);
    try {
      let userId = session?.user.id;
      if (!userId) {
        const draft = useOnboardingStore.getState().draft;
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { first_name: draft.firstName.trim() } },
        });
        if (signUpError) return fail(authErrorKey(signUpError));
        if (!data.session) return fail('confirmEmail');
        userId = data.session.user.id;
      }
      await persistOnboarding(userId, useOnboardingStore.getState().draft);
      haptics.success();
      router.push('/body-check');
    } catch {
      fail('generic');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen
      scroll
      header={<StepHeader step={2} total={START_STEPS} />}
      footer={
        <View className="gap-3">
          <Button
            label={signedIn ? tc('actions.continue') : t('createAccount.submit')}
            disabled={!valid}
            loading={busy}
            onPress={submit}
          />
          <Text
            variant="caption"
            tone="subtle"
            className="px-4 text-center font-inter text-xs leading-[17px]"
          >
            <Trans
              t={t}
              i18nKey="createAccount.terms"
              components={{ bold: <Text variant="caption" className="text-xs leading-[17px]" /> }}
            />
          </Text>
        </View>
      }
    >
      <View className="pt-1">
        <StepTitle title={t('createAccount.title')} subtitle={t('createAccount.subtitle')} />
      </View>
      <View className="px-4 pt-5">
        <SocialSignIn />
      </View>
      <View className="px-4 pt-3.5">
        <CredentialFields
          mode="new"
          email={signedIn ? (session.user.email ?? '') : email}
          password={signedIn ? '' : password}
          onChangeEmail={setEmail}
          onChangePassword={setPassword}
          onSubmit={submit}
          editable={!signedIn && !busy}
        />
        {error ? (
          <View className="items-start gap-1 px-1 pt-3">
            <Text variant="caption" tone="danger" accessibilityLiveRegion="assertive">
              {t(`errors.${error}`)}
            </Text>
            {error === 'alreadyRegistered' || error === 'confirmEmail' ? (
              <TextButton
                label={t('signIn.submit')}
                tone="accent"
                className="min-h-10 px-0"
                onPress={() => router.push({ pathname: '/sign-in', params: { email } })}
              />
            ) : null}
          </View>
        ) : null}
      </View>
    </Screen>
  );
}
