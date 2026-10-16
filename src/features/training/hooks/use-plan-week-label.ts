import { useTranslation } from 'react-i18next';

import type { PlanStatus } from '@/shared/data/plans';

/**
 * Where a plan stands: "Block 2" (its round of workouts, counted within the cycle when it has
 * one), or "Deload" for the cycle's last, lighter round.
 */
export function usePlanWeekLabel() {
  const { t } = useTranslation('training');
  return (status: PlanStatus) =>
    status.deload ? t('plan.deload') : t('plan.block', { n: status.blockWeek ?? status.week });
}
