import { generateFailure } from '@/features/plan-create/lib/plan-answers';
import { i18n } from '@/shared/i18n';
import { showError } from '@/shared/stores/error-sheet-store';

import type { ImportFailure } from './plan-import-service';

/**
 * Shows why the AI made no plan. "Try again" (`retry`) is offered only where it can help: not
 * past the daily limit.
 */
export function showPlanFailure(reason: ImportFailure, retry: () => void, onDismiss?: () => void) {
  const shown = generateFailure(reason);
  showError({
    title: i18n.t(`planCreate:generate.errors.${shown}.title`),
    message: i18n.t(`planCreate:generate.errors.${shown}.message`),
    onRetry: shown === 'failed' || shown === 'offline' ? retry : undefined,
    onDismiss,
  });
}
