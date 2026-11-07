import { useUnits } from '@/shared/data/profile';
import { useSessionStore } from '@/shared/stores/session-store';

import { useDraft } from '../stores/onboarding-store';

/**
 * The user's unit system, also before there is an account: the profile's once signed in, the one
 * picked in onboarding until then (e.g. on an exercise opened from the import's "Importiert").
 */
export function useUnitsOrDraft() {
  const signedIn = useSessionStore((s) => !!s.session);
  const profileUnits = useUnits();
  const draftUnits = useDraft().unitPreference;
  return signedIn ? profileUnits : draftUnits;
}
