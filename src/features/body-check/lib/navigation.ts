import { router } from 'expo-router';

/** Leaves the body-check flow back to the Body tab (also when opened without history). */
export const exitBodyCheck = () => router.dismissTo('/body');
