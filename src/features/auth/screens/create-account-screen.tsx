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
import { i18n } from '@/shared/i18n';
import { type AuthMethod, identify, track } from '@/shared/lib/posthog';
import { haptics } from '@/shared/lib/haptics';
import { useSessionStore } from '@/shared/stores/session-store';
import { Button } from '@/shared/ui/button';
import { CheckItem } from '@/shared/ui/check-item';
import { StepScreen } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';

import { SocialSignIn } from '../components/social-sign-in';
import { signInWith, type SocialProvider } from '../lib/social-sign-in';

/** What the account backs up, listed above the sign-in buttons. */
const BACKUP = ['plan', 'history', 'body'] as const;

export function CreateAccountScreen() {
  const { t } = useTranslation('auth');
  const { t: tc } = useTranslation();
  const session = useSessionStore((s) => s.session);
  const [busy, setBusy] = useState<SocialProvider | 'continue' | null>(null);
  const [failed, setFailed] = useState(false);

  // Already signed in (e.g. came back from the next step): just save and continue.
  const signedIn = !!session;

  const fail = (method: AuthMethod) => {
    haptics.error();
    setFailed(true);
    track('account:sign_up_fail', { method, error_code: 'generic' });
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
    // The progress check is for adults only; younger users go straight to the app.
    if (isProgressCheckAge(draft.birthDate)) router.push('/progress-check');
    else useOnboardingStore.getState().complete();
  };

  const social = async (provider: SocialProvider) => {
    if (busy) return;
    setBusy(provider);
    setFailed(false);
    try {
      // Creating the account accepts the documents linked below the buttons: the versions in
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

  /** Signed in already: saves the answers to that account and goes on. */
  const continueSignedIn = async () => {
    if (!session || busy) return;
    const method: AuthMethod = session.user.app_metadata.provider === 'apple' ? 'apple' : 'google';
    setBusy('continue');
    setFailed(false);
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
      titleClassName="pt-5.5"
      scroll
      footer={
        <View className="gap-3">
          {failed ? (
            <Text
              variant="caption"
              tone="danger"
              className="px-1 text-center"
              accessibilityLiveRegion="assertive"
            >
              {t('errors.generic')}
            </Text>
          ) : null}
          {signedIn ? (
            <Button
              label={tc('actions.continue')}
              loading={busy === 'continue'}
              onPress={continueSignedIn}
            />
          ) : (
            <SocialSignIn
              action="continue"
              onSignIn={social}
              busy={busy === 'continue' ? null : busy}
              disabled={!!busy}
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
      <View className="gap-4 px-5 pt-8">
        {BACKUP.map((item) => (
          <CheckItem key={item} size="sm" textClassName="font-inter-medium text-fg-mid">
            {t(`createAccount.backup.${item}`)}
          </CheckItem>
        ))}
      </View>
    </StepScreen>
  );
}
