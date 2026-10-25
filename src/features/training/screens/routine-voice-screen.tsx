import { useLocalSearchParams } from 'expo-router';

import { VoiceScreen } from '@/features/voice-input/screens/voice-screen';
import { requireUserId } from '@/shared/stores/session-store';

import { addSpokenExercises } from '../data/routine-mutations';

/** Voice input for a routine: what the user says is added to its exercises. */
export function RoutineVoiceScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <VoiceScreen onAdd={(spoken) => addSpokenExercises(requireUserId(), id, spoken)} />;
}
