import { router } from 'expo-router';

import { isProgressCheckAge } from '@/features/progress-check/lib/eligibility';
import { track } from '@/shared/lib/posthog';

import { useOnboardingStore } from '../stores/onboarding-store';
import { HAS_ACTION_BUTTON } from './flow';

/**
 * The onboarding's steps once a new account exists: the weight shortcut on iPhones with an Action
 * button (from 'account'), then the progress check offer for adults, else the app.
 */
export function afterAccount(from: 'account' | 'actionButton') {
  if (from === 'account' && HAS_ACTION_BUTTON) {
    router.push('/action-button');
    return;
  }
  if (isProgressCheckAge(useOnboardingStore.getState().draft.birthDate)) {
    router.push('/progress-check');
    return;
  }
  track('onboarding:flow_complete', { progress_check: 'not_offered' });
  useOnboardingStore.getState().complete();
}

/** The close cross on the weight shortcut step: straight into the app, past the steps left. */
export function skipRestOfOnboarding() {
  track('onboarding:flow_complete', { progress_check: 'skipped' });
  useOnboardingStore.getState().complete();
}
