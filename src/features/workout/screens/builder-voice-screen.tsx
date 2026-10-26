import { VoiceScreen } from '@/features/voice-input/screens/voice-screen';

import { useWorkoutDraftStore } from '../stores/workout-draft-store';

/**
 * Voice input for the workout being put together: what the user says is added to it; exercises
 * the catalog lacks are created once the workout starts.
 */
export function BuilderVoiceScreen() {
  const addSpoken = useWorkoutDraftStore((s) => s.addSpoken);
  return <VoiceScreen onAdd={addSpoken} />;
}
