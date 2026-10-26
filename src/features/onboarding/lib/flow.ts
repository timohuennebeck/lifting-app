import * as Device from 'expo-device';
import { Platform } from 'react-native';

/**
 * iPhones with an Action button get the weight shortcut step: model ids from iPhone16,1 (15 Pro)
 * on, every iPhone since has one. The simulator ("arm64") gets it too, to try the step.
 */
const major = Number(/^iPhone(\d+),/.exec(Device.modelId ?? '')?.[1] ?? 0);
export const HAS_ACTION_BUTTON = Platform.OS === 'ios' && (!Device.isDevice || major >= 16);

/** Step counts per onboarding phase ("About you" and "Let's go"). */
export const ABOUT_STEPS = HAS_ACTION_BUTTON ? 9 : 8;
export const START_STEPS = 3;
