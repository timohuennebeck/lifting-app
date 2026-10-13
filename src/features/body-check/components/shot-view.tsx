import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFooterInset } from '@/shared/hooks/use-footer-inset';
import { colors } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/button';
import { Gradient, type GradientStop } from '@/shared/ui/gradient';
import { Icon } from '@/shared/ui/icon';
import { IconButton } from '@/shared/ui/icon-button';
import { Text } from '@/shared/ui/text';

import { WARN_COLOR, type BodyPose } from '../lib/poses';
import type { Shot } from '../stores/body-check-store';

/** Behind the strip and button: solid for its first third, then fading out. */
const BOTTOM_SCRIM: GradientStop[] = [
  [0, 0.9],
  [0.35, 0.9],
  [1, 0],
];

/** "Foto passt" in the accent, or the photo's problem in orange. */
function ShotStatus({ issue }: Pick<Shot, 'issue'>) {
  const { t } = useTranslation('bodyCheck');
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
  pose: BodyPose;
  shot: Shot;
  /** The pose thumbnails, to switch photos or go back to shooting a missing one. */
  strip: ReactNode;
  onClose: () => void;
  onRetake: () => void;
  /** Every pose taken and none sent back: "Fertig" can start the analysis. */
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
  const { t } = useTranslation(['bodyCheck', 'common']);
  const insets = useSafeAreaInsets();
  const footerInset = useFooterInset();
  return (
    <View style={StyleSheet.absoluteFill} className="bg-black">
      <Image source={{ uri: shot.uri }} contentFit="cover" style={StyleSheet.absoluteFill} />
      <Gradient from="top" size={200} color="black" opacity={0.6} />
      <Gradient from="bottom" size={340} color="black" stops={BOTTOM_SCRIM} />
      <View
        className="absolute inset-x-4 flex-row items-center gap-3"
        style={{ top: insets.top + 6 }}
      >
        <View className="min-w-0 flex-1 flex-row flex-wrap items-center gap-x-3 gap-y-1.5 pl-1">
          <Text className="font-inter-semibold text-[28px] leading-8.5">
            {t(`poses.${pose}.name`)}
          </Text>
          <ShotStatus issue={shot.issue} />
        </View>
        <IconButton icon="close" accessibilityLabel={t('common:actions.close')} onPress={onClose} />
      </View>
      <View className="absolute inset-x-0 gap-5.5" style={{ bottom: footerInset }}>
        {strip}
        <View className="flex-row gap-3 px-4">
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
        </View>
      </View>
    </View>
  );
}
