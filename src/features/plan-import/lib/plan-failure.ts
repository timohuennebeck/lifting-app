import { generateFailure } from '@/features/plan-create/lib/plan-answers';
import { i18n } from '@/shared/i18n';
import { showError } from '@/shared/stores/error-sheet-store';

import type { ImportFailure } from './plan-import-service';

/**
 * Shows why a plan couldn't be read or, `made`, made by the AI. "Try again" (`retry`) is offered
 * only where it can help: not past the daily limit, nor for a file that isn't a plan.
 */
export function showPlanFailure(
  reason: ImportFailure,
  made: boolean,
  retry: () => void,
  onDismiss?: () => void,
) {
  const shown = made ? generateFailure(reason) : reason;
  const key = made
    ? (`planCreate:generate.errors.${generateFailure(reason)}` as const)
    : (`planImport:reading.errors.${reason}` as const);
  showError({
    title: i18n.t(`${key}.title`),
    message: i18n.t(`${key}.message`),
    onRetry: shown === 'failed' || shown === 'offline' ? retry : undefined,
    onDismiss,
  });
}
