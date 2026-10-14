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

export interface PlanProgressLabels {
  /** The plan week (see `usePlanWeekLabel`); empty while the status loads. */
  week: string;
  /** Workouts done this plan week of the weekly goal, e.g. "1 von 3 Einheiten". */
  sessions: string;
}

/** A plan's week and workouts done, as its card on the Training tab and its page show them. */
export function usePlanProgressLabels(
  plan: PlanSummary | undefined,
  status: PlanStatus | undefined,
): PlanProgressLabels {
  const { t } = useTranslation('training');
  const weekLabel = usePlanWeekLabel();
  if (!plan) return { week: '', sessions: '' };
  return {
    week: status ? weekLabel(plan, status) : '',
    sessions: t('plan.sessions', { done: status?.done ?? 0, count: plan.sessionsPerWeek }),
  };
}
