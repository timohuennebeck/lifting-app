import { VoiceScreen } from '@/features/voice-input/screens/voice-screen';

import { useImportStore } from '../stores/import-store';

/** Voice input for the plan being reviewed or built: adds to the routine shown. */
export function ImportVoiceScreen() {
  const addSpoken = useImportStore((s) => s.addSpoken);
  return <VoiceScreen onAdd={addSpoken} />;
}
