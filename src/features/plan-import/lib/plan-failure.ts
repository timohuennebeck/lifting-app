import { generateFailure } from '@/features/plan-create/lib/plan-answers';
import { i18n } from '@/shared/i18n';
import { showError } from '@/shared/stores/error-sheet-store';

import type { ImportFailure, ImportSource } from './plan-import-service';

/** Where the plan comes from: read from photos or a file, said out loud, or made by the AI. */
export type PlanOrigin = 'read' | 'spoken' | 'made';

export function originOf(source: ImportSource | null): PlanOrigin {
  if (source?.kind === 'answers') return 'made';
  return source?.kind === 'voice' ? 'spoken' : 'read';
}

/** The text keys for why a plan couldn't be had, by where it comes from. */
function failureKey(reason: ImportFailure, origin: PlanOrigin) {
  if (origin === 'made') return `planCreate:generate.errors.${generateFailure(reason)}` as const;
  // Offline and the daily limit read the same; a spoken plan is never too large (MAX_SPOKEN).
  if (origin === 'spoken' && (reason === 'failed' || reason === 'notAPlan')) {
    return `planImport:voice.errors.${reason}` as const;
  }
  return `planImport:reading.errors.${reason}` as const;
}

/**
 * Shows why a plan couldn't be read or made. "Try again" (`retry`) is offered only where it can
 * help: not past the daily limit, nor for a file that isn't a plan.
 */
export function showPlanFailure(
  reason: ImportFailure,
  origin: PlanOrigin,
  retry: () => void,
  onDismiss?: () => void,
) {
  const shown = origin === 'made' ? generateFailure(reason) : reason;
  const key = failureKey(reason, origin);
  showError({
    title: i18n.t(`${key}.title`),
    message: i18n.t(`${key}.message`),
    onRetry: shown === 'failed' || shown === 'offline' ? retry : undefined,
    onDismiss,
  });
}
