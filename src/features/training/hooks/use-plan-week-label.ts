import { useTranslation } from 'react-i18next';

import type { PlanStatus, PlanSummary } from '@/shared/data/plans';

/** Where a plan stands: "Woche 2 von 5" in a block, "Deload-Woche", or "Woche 3" without blocks. */
export function usePlanWeekLabel() {
  const { t } = useTranslation('training');
  return (plan: Pick<PlanSummary, 'blockWeeks'>, status: PlanStatus) => {
    if (status.deload) return t('plan.deload');
    if (status.blockWeek !== null) {
      return t('plan.blockWeek', { week: status.blockWeek, weeks: plan.blockWeeks });
    }
    return t('plan.week', { week: status.week });
  };
}
