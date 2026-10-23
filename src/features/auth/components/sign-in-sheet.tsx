import type { User } from '@supabase/supabase-js';
import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import {
  adoptSignUpName,
  isOnboardedAfterSync,
} from '@/features/onboarding/lib/persist-onboarding';
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding-store';
import { haptics } from '@/shared/lib/haptics';
import { identify, track } from '@/shared/lib/posthog';
import { afterSheetClose, Sheet } from '@/shared/ui/sheet';
import { StepTitle } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';
import { TextButton } from '@/shared/ui/text-button';

import {
  discardNewAccount,
  isNewAccount,
  signInWith,
  type SocialProvider,
} from '../lib/social-sign-in';
import { SocialSignIn } from './social-sign-in';

type Phase = 'idle' | SocialProvider | 'syncing';
/** `noAccount`: Google or Apple would have made a new account, which only onboarding does. */
type ErrorKey = 'generic' | 'noAccount';

export interface SignInSheetProps {
  visible: boolean;
  onClose: () => void;
}

/** Sign-in to an existing account, opened from the welcome screen. */
export function SignInSheet({ visible, onClose }: SignInSheetProps) {
  const { t } = useTranslation('auth');
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<ErrorKey | null>(null);
  const busy = phase !== 'idle';
  const socialBusy = phase === 'google' || phase === 'apple' ? phase : null;

  const fail = (key: ErrorKey) => {
    haptics.error();
    setError(key);
    setPhase('idle');
  };

  /** Closes the sheet; it opens again without the last error. */
  const close = () => {
    setError(null);
    onClose();
  };

  /** Closes the sheet, then opens the onboarding step once it has animated out. */
  const closeThen = (href: '/name' | '/create-account') => {
    close();
    afterSheetClose(() => router.push(href));
  };

  /** Signed in: into the app, or on into onboarding for an account that hasn't finished it. */
  const continueAs = async (user: User, method: SocialProvider) => {
    setPhase('syncing');
    const onboarded = await isOnboardedAfterSync(user.id);
    // Accounts are made at the end of onboarding, after its answers and the terms.
    if (!onboarded && isNewAccount(user)) {
      await discardNewAccount(method);
      return fail('noAccount');
    }
    haptics.success();
    identify(user.id);
    track('account:sign_in_complete', { method, is_onboarded: onboarded });
    const store = useOnboardingStore.getState();
    // The root guard switches to the app once onboarding is marked complete.
    if (onboarded) return store.complete();
    adoptSignUpName(user);
    setPhase('idle');
    // A finished draft goes to account creation, which then shows "Continue" and saves it.
    closeThen(store.draft.plan ? '/create-account' : '/name');
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

  return (
    // Stays open while signing in: what follows needs the sheet's state.
    <Sheet
      visible={visible}
      onClose={() => {
        if (!busy) close();
      }}
    >
      <StepTitle title={t('signIn.title')} subtitle={t('signIn.subtitle')} className="px-1 pt-2" />
      <View className="pt-6">
        <SocialSignIn action="signIn" onSignIn={social} busy={socialBusy} disabled={busy} />
      </View>
      {phase === 'syncing' ? (
        <Text variant="caption" tone="subtle" className="min-h-12 py-4 text-center">
          {t('signIn.syncing')}
        </Text>
      ) : null}
      {error ? (
        <View className="items-center gap-1 px-1 pt-3">
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
              onPress={() => closeThen('/name')}
            />
          ) : null}
        </View>
      ) : null}
    </Sheet>
  );
}
