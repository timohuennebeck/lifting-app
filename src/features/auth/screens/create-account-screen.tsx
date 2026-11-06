import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { LegalLink } from '@/features/legal/components/legal-link';
import { acceptDocuments } from '@/features/legal/data/legal-acceptances';
import { fetchCurrentDocuments, type LegalDocument } from '@/features/legal/data/legal-documents';
import { afterAccount } from '@/features/onboarding/lib/after-account';
import { START_STEPS } from '@/features/onboarding/lib/flow';
import {
  isOnboardedAfterSync,
  persistOnboarding,
} from '@/features/onboarding/lib/persist-onboarding';
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding-store';
import { i18n } from '@/shared/i18n';
import { type AuthMethod, identify, track } from '@/shared/lib/posthog';
import { haptics } from '@/shared/lib/haptics';
import { useSessionStore } from '@/shared/stores/session-store';
import { Button } from '@/shared/ui/button';
import { StepScreen } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';

import { EmailDivider, EmailFields } from '../components/email-fields';
import { SocialSignIn } from '../components/social-sign-in';
import {
  EmailAuthError,
  type EmailAuthReason,
  isEmail,
  MIN_PASSWORD,
  signUpWithEmail,
} from '../lib/email-auth';
import { signInWith, type SocialProvider } from '../lib/social-sign-in';

/** What the screen says below the fields: a failure, or that the email needs confirming. */
type Notice = EmailAuthReason | 'checkInbox';

/**
 * The account at the end of onboarding: Google or Apple, or email and password. Creating it
 * accepts the terms and the privacy policy linked under the button.
 */
export function CreateAccountScreen() {
  const { t } = useTranslation('auth');
  const { t: tc } = useTranslation();
  const session = useSessionStore((s) => s.session);
  const [busy, setBusy] = useState<SocialProvider | 'email' | 'continue' | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Already signed in (e.g. came back from the next step): just save and continue.
  const signedIn = !!session;
  const ready = isEmail(email) && password.length >= MIN_PASSWORD;

  const fail = (method: AuthMethod, reason: EmailAuthReason = 'generic') => {
    haptics.error();
    setNotice(reason);
    track('account:sign_up_fail', { method, error_code: reason });
  };

  /** Saves the onboarding answers to the new account with the accepted documents, then goes on. */
  const finish = async (userId: string, documents: LegalDocument[], method: AuthMethod) => {
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
    // A new account: its onboarding and purchase events join it, then the sign-up counts.
    identify(userId);
    track('account:sign_up_complete', { method });
    haptics.success();
    // The weight shortcut (iPhones with an Action button), the progress check (adults), the app.
    afterAccount('account');
  };

  const social = async (provider: SocialProvider) => {
    if (busy) return;
    setBusy(provider);
    setNotice(null);
    try {
      // Creating the account accepts the documents linked under the button: the versions in
      // effect now, loaded first because the provider makes the account at once, and no
      // account may exist without a record of them.
      const documents = await fetchCurrentDocuments(i18n.language);
      const user = await signInWith(provider);
      if (user) await finish(user.id, documents, provider);
    } catch {
      fail(provider);
    }
    setBusy(null);
  };

  /** A new account with email and password; when the email needs confirming first, says so. */
  const signUp = async () => {
    if (busy || !ready) return;
    setBusy('email');
    setNotice(null);
    try {
      const documents = await fetchCurrentDocuments(i18n.language);
      const user = await signUpWithEmail(email, password);
      if (user) await finish(user.id, documents, 'email');
      else setNotice('checkInbox');
    } catch (error) {
      fail('email', error instanceof EmailAuthError ? error.reason : 'generic');
    }
    setBusy(null);
  };

  /** Signed in already: saves the answers to that account and goes on. */
  const continueSignedIn = async () => {
    if (!session || busy) return;
    const provider = session.user.app_metadata.provider;
    const method: AuthMethod = provider === 'apple' || provider === 'google' ? provider : 'email';
    setBusy('continue');
    setNotice(null);
    try {
      const documents = await fetchCurrentDocuments(i18n.language);
      await finish(session.user.id, documents, method);
    } catch {
      fail(method);
    }
    setBusy(null);
  };

  return (
    <StepScreen
      step={2}
      total={START_STEPS}
      title={t('createAccount.title')}
      subtitle={t('createAccount.subtitle')}
      scroll
      footer={
        <View className="gap-3">
          {notice ? (
            <Text
              variant="caption"
              tone={notice === 'checkInbox' ? 'muted' : 'danger'}
              className="px-1 text-center"
              accessibilityLiveRegion="assertive"
            >
              {notice === 'checkInbox' ? t('createAccount.checkInbox') : t(`errors.${notice}`)}
            </Text>
          ) : null}
          {signedIn ? (
            <Button
              label={tc('actions.continue')}
              loading={busy === 'continue'}
              onPress={continueSignedIn}
            />
          ) : (
            <Button
              label={t('createAccount.cta')}
              loading={busy === 'email'}
              disabled={!ready || !!busy}
              onPress={signUp}
            />
          )}
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
      {signedIn ? null : (
        <View className="gap-5 px-4 pt-6">
          <SocialSignIn
            onSignIn={social}
            busy={busy === 'google' || busy === 'apple' ? busy : null}
            disabled={!!busy}
          />
          <EmailDivider />
          <EmailFields
            isNew
            email={email}
            password={password}
            onChangeEmail={setEmail}
            onChangePassword={setPassword}
            onSubmit={signUp}
            editable={!busy}
          />
        </View>
      )}
    </StepScreen>
  );
}
