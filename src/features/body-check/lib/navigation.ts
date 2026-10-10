import { router } from 'expo-router';

/** Leaves the body-check flow back to the Progress tab's Körper page (also without history). */
export const exitBodyCheck = () => router.dismissTo('/progress/body');
