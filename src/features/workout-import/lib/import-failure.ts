import { i18n } from '@/shared/i18n';
import { showError } from '@/shared/stores/error-sheet-store';

import { chooseImportFile, type ImportFile, type ReadFile } from './read-file';
import type { ImportFailure } from './import-service';

/** Why the file couldn't be read. "Try again" (`retry`) only where it can help. */
export function showImportFailure(reason: ImportFailure, retry: () => void) {
  showError({
    title: i18n.t(`workoutImport:errors.${reason}.title`),
    message: i18n.t(`workoutImport:errors.${reason}.message`),
    onRetry: reason === 'failed' || reason === 'offline' ? retry : undefined,
  });
}

/** 13ie: the file holds no workouts and no plan; "Choose a different file" picks another. */
export function showNothingFound(name: string, onRead: (file: ImportFile, read: ReadFile) => void) {
  showError({
    title: i18n.t('workoutImport:errors.nothing.title'),
    message: i18n.t('workoutImport:errors.nothing.message', { name }),
    action: {
      label: i18n.t('workoutImport:errors.retry'),
      onPress: () => void chooseImportFile(onRead),
    },
    dismissLabel: i18n.t('workoutImport:errors.close'),
  });
}
