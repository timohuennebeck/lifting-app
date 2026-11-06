import { router } from 'expo-router';

import { isProgressCheckAge } from '@/features/progress-check/lib/eligibility';

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
  } else useOnboardingStore.getState().complete();
}
