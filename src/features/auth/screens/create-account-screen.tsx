import { router } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { View } from 'react-native';

import type { LegalKind } from '@/features/legal/data/legal-documents';
import { START_STEPS } from '@/features/onboarding/lib/flow';
import { persistOnboarding } from '@/features/onboarding/lib/persist-onboarding';
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding-store';
import { supabase } from '@/shared/data/supabase';
import { i18n } from '@/shared/i18n';
import { haptics } from '@/shared/lib/haptics';
import { useSessionStore } from '@/shared/stores/session-store';
import { Button } from '@/shared/ui/button';
import { StepScreen } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';
import { TextButton } from '@/shared/ui/text-button';

import { CredentialFields } from '../components/credential-fields';
import { SocialSignIn } from '../components/social-sign-in';
import {
  type AuthErrorKey,
  authErrorKey,
  isValidEmail,
  MIN_PASSWORD_LENGTH,
} from '../lib/credentials';

type ErrorKey = AuthErrorKey | 'confirmEmail';

/** A highlighted word in the terms line that opens the document. */
function LegalLink({ kind, children }: { kind: LegalKind; children?: ReactNode }) {
  return (
    <Text
      variant="caption"
      accessibilityRole="link"
      onPress={() => {
        haptics.tap();
        router.push(`/legal/${kind}`);
      }}
      className="text-xs leading-4.25"
    >
      {children}
    </Text>
  );
}

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
  // Account errors from before the user signed in (e.g. "already registered") no longer apply.
  const shownError = signedIn && error !== 'generic' ? null : error;

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
          // The language lets Supabase send its account emails in the app language.
          options: { data: { first_name: draft.firstName.trim(), language: i18n.language } },
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
    <StepScreen
      step={2}
      total={START_STEPS}
      title={t('createAccount.title')}
      subtitle={t('createAccount.subtitle')}
      titleClassName="pt-5.5"
      scroll
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
            className="px-4 text-center font-inter text-xs leading-4.25"
          >
            <Trans
              t={t}
              i18nKey="createAccount.terms"
              components={{
                terms: <LegalLink kind="terms" />,
                privacy: <LegalLink kind="privacy" />,
              }}
            />
          </Text>
        </View>
      }
    >
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
          autoFocus={!signedIn}
        />
        {shownError ? (
          <View className="items-start gap-1 px-1 pt-3">
            <Text variant="caption" tone="danger" accessibilityLiveRegion="assertive">
              {t(`errors.${shownError}`)}
            </Text>
            {shownError === 'alreadyRegistered' || shownError === 'confirmEmail' ? (
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
    </StepScreen>
  );
}
