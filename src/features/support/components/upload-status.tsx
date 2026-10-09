import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { ProgressBar } from '@/shared/ui/progress-bar';
import { Text } from '@/shared/ui/text';
import { TextButton } from '@/shared/ui/text-button';

import type { ScreenshotDraft } from '../hooks/use-screenshot-draft';

export interface UploadStatusProps {
  draft: ScreenshotDraft;
  /** Shows an inline "Try again" link (the form retries through its main button instead). */
  onRetry?: () => void;
  className?: string;
}

/** "Uploading screenshots · 1/3" with a bar, or the failure note with a retry link. */
export function UploadStatus({ draft, onRetry, className }: UploadStatusProps) {
  const { t } = useTranslation('support');
  const total = draft.shots.length;
  if (draft.uploading) {
    return (
      <View className={cn('gap-2 px-1', className)}>
        <Text variant="caption" tone="subtle" className="font-inter">
          {t('upload.progress', { done: Math.min(draft.uploaded + 1, total), total })}
        </Text>
        <ProgressBar value={total ? draft.uploaded / total : 0} className="flex-none" />
      </View>
    );
  }
  if (!draft.failed) return null;
  return (
    <View className={cn('flex-row items-center gap-2 px-1', className)}>
      <Text variant="caption" tone="danger" className="flex-1 font-inter leading-4.5">
        {t('upload.failed')}
      </Text>
      {onRetry ? (
        <TextButton
          label={t('upload.retry')}
          haptic="press"
          className="min-h-0 px-0"
          textClassName="text-[13px]"
          onPress={onRetry}
        />
      ) : null}
    </View>
  );
}
