import { useTranslation } from 'react-i18next';

import { hideError, useErrorSheetStore } from '@/shared/stores/error-sheet-store';
import { ErrorSheet } from '@/shared/ui/error-sheet';
import { afterSheetClose, useOpenSheets } from '@/shared/ui/sheet';

/** Shows what showError() was given, once no other sheet is open; mounted once at the root. */
export function ErrorSheetHost() {
  const { t } = useTranslation();
  const error = useErrorSheetStore((s) => s.error);
  const visible = useErrorSheetStore((s) => s.visible);
  const othersOpen = useOpenSheets((s) => s.count > 0);
  if (!error) return null;

  const action =
    error.action ?? (error.onRetry ? { label: t('actions.retry'), onPress: error.onRetry } : null);
  // The follow-up runs once the sheet has gone, so a picker or another sheet never meets it. A
  // second tap on the backdrop while it animates out doesn't run it again.
  const finish = (then?: () => void) => {
    if (!useErrorSheetStore.getState().visible) return;
    hideError();
    if (then) afterSheetClose(then);
  };

  return (
    <ErrorSheet
      visible={visible && !othersOpen}
      onClose={() => finish(error.onDismiss)}
      title={error.title}
      message={error.message}
      actionLabel={action ? action.label : t('actions.gotIt')}
      onAction={() => finish(action ? action.onPress : error.onDismiss)}
      dismissLabel={action ? (error.dismissLabel ?? t('actions.close')) : undefined}
    />
  );
}
