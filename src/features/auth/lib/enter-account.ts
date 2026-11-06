import type { User } from '@supabase/supabase-js';
import { router } from 'expo-router';

import {
  adoptSignUpName,
  isOnboardedAfterSync,
} from '@/features/onboarding/lib/persist-onboarding';
import { useOnboardingStore } from '@/features/onboarding/stores/onboarding-store';
import { haptics } from '@/shared/lib/haptics';
import { type AuthMethod, identify, track } from '@/shared/lib/posthog';

/**
 * Signed in to an existing account: into the app once it finished onboarding, else on into
 * onboarding (a finished draft goes to account creation, which then shows "Continue"). `known`:
 * whether it finished onboarding, when the caller asked already.
 */
export async function enterAccount(user: User, method: AuthMethod, known?: boolean) {
  const onboarded = known ?? (await isOnboardedAfterSync(user.id));
  haptics.success();
  identify(user.id);
  track('account:sign_in_complete', { method, is_onboarded: onboarded });
  const store = useOnboardingStore.getState();
  // The root guard switches to the app once onboarding is marked complete.
  if (onboarded) return store.complete();
  adoptSignUpName(user);
  router.replace(store.draft.plan ? '/create-account' : '/name');
}
