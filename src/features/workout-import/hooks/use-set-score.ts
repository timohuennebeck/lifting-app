import { useDraft } from '@/features/onboarding/stores/onboarding-store';
import { useWeightEntries } from '@/shared/data/weight-entries';

import { setScorer } from '../lib/imported';

/**
 * How the import's sets rank, with the body weight the app ranks them with: the latest weigh-in,
 * or before there is an account the weight given in onboarding.
 */
export function useSetScore() {
  const { entries } = useWeightEntries();
  const draftWeight = useDraft().weightKg;
  return setScorer(entries.at(-1)?.weightKg ?? draftWeight);
}
