import { router } from 'expo-router';

/** Leaves the progress-check flow back to Body in the Progress tab (also without history). */
export const exitProgressCheck = () => router.dismissTo('/progress/body');
