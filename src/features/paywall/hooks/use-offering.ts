import { useQuery } from '@tanstack/react-query';

import { paywallKeys } from '../data/paywall-keys';
import { type PlanId, purchases } from '../lib/purchases-service';

/** Current offering (plans, prices, trial); cached for the session. */
export function useOffering() {
  const query = useQuery({
    queryKey: paywallKeys.offering.queryKey,
    queryFn: () => purchases.getOfferings(),
    staleTime: Infinity,
  });
  const offering = query.data ?? null;
  const plan = (id: PlanId) => offering?.plans.find((p) => p.id === id) ?? null;
  return { ...query, offering, plan };
}
