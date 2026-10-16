import { router } from 'expo-router';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { isProgressCheckAge } from '@/features/progress-check/lib/eligibility';
import { LegalLink } from '@/features/legal/components/legal-link';
import { acceptDocuments } from '@/features/legal/data/legal-acceptances';
import { fetchCurrentDocuments, type LegalDocument } from '@/features/legal/data/legal-documents';
import { START_STEPS } from '@/features/onboarding/lib/flow';
import {
  isOnboardedAfterSync,
  persistOnboarding,
} from '@/features/onboarding/lib/persist-onboarding';
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
import { signInWith, type SocialProvider } from '../lib/social-sign-in';

type ErrorKey = AuthErrorKey | 'confirmEmail';

export function CreateAccountScreen() {
  const { t } = useTranslation('auth');
  const { t: tc } = useTranslation();
  const session = useSessionStore((s) => s.session);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState<'email' | SocialProvider | null>(null);
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

  /** Saves the onboarding answers to the new account with the accepted documents, then goes on. */
  const finish = async (userId: string, documents: LegalDocument[]) => {
    // An account that is already set up (e.g. signed in with Google or Apple) keeps its own
    // profile and plan. A retry after a failed save lands here too, so the acceptance is
    // recorded here as well (only missing rows are added; the profile row exists by now).
    if (await isOnboardedAfterSync(userId)) {
      await acceptDocuments(userId, documents);
      haptics.success();
      useOnboardingStore.getState().complete();
      return;
    }
    const { draft } = useOnboardingStore.getState();
    await persistOnboarding(userId, draft);
    await acceptDocuments(userId, documents);
    haptics.success();
    // The progress check is for adults only; younger users go straight to the app.
    if (isProgressCheckAge(draft.birthDate)) router.push('/progress-check');
    else useOnboardingStore.getState().complete();
  };

  /** Signs up with the email (unless already signed in), then saves the answers to the account. */
  const createAccount = async () => {
    // Creating the account accepts the documents linked below the button: the versions in
    // effect now, loaded first so that no account exists without a record of them.
    const documents = await fetchCurrentDocuments(i18n.language);
    const { draft } = useOnboardingStore.getState();
    let userId = session?.user.id;
    if (!userId) {
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
    await finish(userId, documents);
  };

  const submit = async () => {
    if (!valid || busy) return;
    setBusy('email');
    setError(null);
    await createAccount()
      .catch(() => fail('generic'))
      .finally(() => setBusy(null));
  };

  const social = async (provider: SocialProvider) => {
    if (busy) return;
    setBusy(provider);
    setError(null);
    try {
      // Loaded first for the same reason as with email: the provider creates the account at once.
      const documents = await fetchCurrentDocuments(i18n.language);
      const user = await signInWith(provider);
      if (user) await finish(user.id, documents);
    } catch {
      fail('generic');
    }
    setBusy(null);
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
            disabled={!valid || (!!busy && busy !== 'email')}
            loading={busy === 'email'}
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
        <SocialSignIn
          onSignIn={social}
          busy={busy === 'email' ? null : busy}
          disabled={signedIn || !!busy}
        />
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
