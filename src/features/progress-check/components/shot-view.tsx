import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { colors } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { IconButton } from '@/shared/ui/icon-button';
import { PhotoReview } from '@/shared/ui/photo-review';
import { Text } from '@/shared/ui/text';

import { WARN_COLOR, type Pose } from '../lib/poses';
import type { Shot } from '../stores/progress-check-store';

/** "Foto passt" in the accent, or the photo's problem in orange. */
function ShotStatus({ issue }: Pick<Shot, 'issue'>) {
  const { t } = useTranslation('progressCheck');
  return (
    <View
      className="h-8 flex-row items-center gap-1.5 rounded-full bg-accent pr-3 pl-1.5"
      style={issue ? { backgroundColor: WARN_COLOR } : undefined}
    >
      <View className="size-5 items-center justify-center rounded-full bg-on-accent">
        {issue ? (
          <Text className="font-inter-bold text-[12px] leading-3.5" style={{ color: WARN_COLOR }}>
            !
          </Text>
        ) : (
          <Icon name="check" size={10} color={colors.accent} />
        )}
      </View>
      <Text variant="caption" tone="onAccent">
        {issue ? t(`photo.issues.${issue}`) : t('photo.ok')}
      </Text>
    </View>
  );
}

export interface ShotViewProps {
  pose: Pose;
  shot: Shot;
  /** The pose thumbnails, to switch photos or go back to shooting a missing one. */
  strip: ReactNode;
  onClose: () => void;
  onRetake: () => void;
  /** Every pose taken and none sent back: "Fertig" can start the assessment. */
  canFinish: boolean;
  onFinish: () => void;
}

/**
 * A taken photo full screen over the camera (08a): the pose and whether the photo works, the
 * thumbnails, a retake button and "Fertig".
 */
export function ShotView({
  pose,
  shot,
  strip,
  onClose,
  onRetake,
  canFinish,
  onFinish,
}: ShotViewProps) {
  const { t } = useTranslation(['progressCheck', 'common']);
  return (
    <PhotoReview
      uri={shot.uri}
      title={t(`poses.${pose}.name`)}
      status={<ShotStatus issue={shot.issue} />}
      onClose={onClose}
      strip={strip}
    >
      <IconButton
        icon="refresh"
        size={60}
        iconSize={16}
        accessibilityLabel={t('photo.retake')}
        onPress={onRetake}
      />
      <Button
        label={t('common:actions.done')}
        disabled={!canFinish}
        onPress={onFinish}
        className="flex-1"
      />
    </PhotoReview>
  );
}
