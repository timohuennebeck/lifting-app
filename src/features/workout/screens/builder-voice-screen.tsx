import { VoiceScreen } from '@/features/voice-input/screens/voice-screen';
import { addCustomExercises } from '@/shared/data/custom-exercises';
import { requireUserId } from '@/shared/stores/session-store';

import { useWorkoutDraftStore } from '../stores/workout-draft-store';

/** Voice input for the workout being put together: what the user says is added to it. */
export function BuilderVoiceScreen() {
  const addDrafts = useWorkoutDraftStore((s) => s.addDrafts);
  return (
    <VoiceScreen
      onAdd={async ({ exercises, newExercises }) => {
        await addCustomExercises(requireUserId(), newExercises);
        addDrafts(exercises);
      }}
    />
  );
}
