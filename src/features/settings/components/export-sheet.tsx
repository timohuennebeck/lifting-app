import { useStatus } from '@powersync/react-native';
import type { File } from 'expo-file-system';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { useUnits } from '@/shared/data/profile';
import { useAppLanguage } from '@/shared/hooks/use-app-language';
import { formatDate } from '@/shared/lib/format';
import { haptics } from '@/shared/lib/haptics';
import { showError } from '@/shared/stores/error-sheet-store';
import { Button } from '@/shared/ui/button';
import { ProgressBar } from '@/shared/ui/progress-bar';
import { afterSheetClose, Sheet } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';

import { useExportSummary } from '../data/workout-export';
import { exportFileName, shareAndRemove, writeWorkoutsCsv } from '../lib/export-workouts';

export interface ExportSheetProps {
  visible: boolean;
  onClose: () => void;
  /** Opens the sheet again from the error shown when an export failed. */
  onRetry: () => void;
}

/**
 * What will be exported; once "Export" is tapped, the file and its progress, then "Download". The
 * share sheet opens once this sheet has closed: iOS can't show a second native modal beside one.
 * Closing the sheet without downloading deletes the file. Before the first sync the device may
 * hold only part of the history, so exporting waits for it.
 */
export function ExportSheet({ visible, onClose, onRetry }: ExportSheetProps) {
  const { t } = useTranslation('profile');
  const { hasSynced } = useStatus();
  const language = useAppLanguage();
  const { data: summary } = useExportSummary(visible);
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  /** Written and waiting for "Download". */
  const [file, setFile] = useState<File | null>(null);

  const workouts = summary?.count ?? 0;
  const first = summary?.first;
  const units = useUnits();

  let detail = t('settings.export.empty');
  if (!hasSynced) detail = t('settings.export.loading');
  else if (first) {
    detail = t('settings.export.summary', {
      count: workouts,
      date: formatDate(new Date(first), { month: 'long', year: 'numeric' }),
    });
  }

  const fail = (error: unknown) => {
    console.warn('Exporting the workouts failed', error);
    haptics.error();
    showError({
      title: t('settings.export.failed.title'),
      message: t('settings.export.failed.message'),
      onRetry,
    });
  };

  const finish = (next: () => void) => {
    setExporting(false);
    onClose();
    afterSheetClose(next);
  };

  const startExport = () => {
    setProgress(0);
    setExporting(true);
    writeWorkoutsCsv({ units, language, onProgress: setProgress }).then(
      (written) => {
        setExporting(false);
        setFile(written);
        haptics.success();
      },
      (error) => finish(() => fail(error)),
    );
  };

  const download = (ready: File) => {
    setFile(null);
    finish(() => void shareAndRemove(ready).catch(fail));
  };

  const close = () => {
    if (file?.exists) file.delete();
    setFile(null);
    onClose();
  };

  return (
    <Sheet
      visible={visible}
      onClose={exporting ? () => {} : close}
      title={t('settings.export.title')}
      subtitle={t('settings.export.subtitle')}
    >
      {exporting || file ? (
        <View className="gap-4">
          <View className="flex-row items-center gap-3.5 px-1">
            <View className="size-11 items-center justify-center rounded-full bg-track">
              <Text className="font-inter-bold text-[11px] tracking-[0.4px] uppercase">
                {t('settings.data.exportFormat')}
              </Text>
            </View>
            <View className="min-w-0 flex-1 gap-0.5">
              <Text variant="bodyStrong" numberOfLines={1}>
                {file?.name ?? exportFileName(new Date())}
              </Text>
              <Text tone="subtle" className="text-sm" numberOfLines={1}>
                {detail}
              </Text>
            </View>
          </View>
          {exporting ? (
            <View className="gap-2.5 px-1">
              <Text tone="subtle" className="text-sm">
                {t('settings.export.preparing')}
              </Text>
              <ProgressBar value={progress} className="flex-none" />
            </View>
          ) : null}
        </View>
      ) : (
        <Text tone="subtle" className="px-1 text-sm">
          {detail}
        </Text>
      )}

      <View className="pt-6">
        {file ? (
          <Button label={t('settings.export.download')} onPress={() => download(file)} />
        ) : (
          <Button
            label={t('settings.export.cta')}
            variant={exporting ? 'secondary' : 'primary'}
            disabled={exporting || !hasSynced || workouts === 0}
            onPress={startExport}
          />
        )}
      </View>
    </Sheet>
  );
}
