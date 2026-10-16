import { router } from 'expo-router';

/** Leaves the progress-check flow back to the Körper tab (also without history). */
export const exitProgressCheck = () => router.dismissTo('/body');
