import { BodyView } from '@/features/body/components/body-view';
import { WeightCard } from '@/features/weight/components/weight-card';

import { PagerPage } from '@/shared/components/pager-page';

/** Fortschritt → Körper: the weight, then the progress checks. */
export function BodyPage() {
  return (
    <PagerPage>
      <WeightCard />
      <BodyView />
    </PagerPage>
  );
}
