import { useQuery } from '@tanstack/react-query';

import { paywallKeys } from '../data/paywall-keys';
import { formatPrice, type PlanId, purchases } from '../lib/purchases-service';

/** Current offering (plans, prices, trial); cached for the session. */
export function useOffering() {
  const query = useQuery({
    queryKey: paywallKeys.offering.queryKey,
    queryFn: () => purchases.getOfferings(),
    staleTime: Infinity,
  });
  const offering = query.data ?? null;
  const plan = (id: PlanId) => offering?.plans.find((p) => p.id === id) ?? null;
  /** A plan's localized price; null while the offering loads. */
  const priceOf = (id: PlanId) => {
    const p = plan(id);
    return p && offering ? formatPrice(p.price, offering.currency) : null;
  };
  return {
    ...query,
    offering,
    plan,
    priceOf,
    /** Nothing to buy from: loading failed (a failed background refresh keeps the cache). */
    failed: !offering && query.isError,
    /** No offering yet: it is loading, or loading again after a failure. */
    loading: !offering && (!query.isError || query.isFetching),
  };
}
