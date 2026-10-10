import { router } from 'expo-router';

import { useProgressStore } from '@/features/progress/stores/progress-store';

/** Leaves the body-check flow back to the Progress tab's body view (also without history). */
export const exitBodyCheck = () => {
  useProgressStore.getState().setView('body');
  router.dismissTo('/progress');
};
