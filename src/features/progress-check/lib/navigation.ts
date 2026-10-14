import { router } from 'expo-router';

/**
 * Leaves the progress-check flow back to the Progress tab's Körper page (also without history).
 */
export const exitProgressCheck = () => router.dismissTo('/progress/body');
