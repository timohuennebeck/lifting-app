import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/shared/lib/theme';
import { IconButton } from '@/shared/ui/icon-button';
import { ZoomableView } from '@/shared/ui/zoomable-view';

import { CheckPhoto } from '../components/check-photo';
import { PoseChips } from '../components/pose-chips';
import { useBodyCheckPhotos, useBodyChecks } from '../data/body-checks';
import { POSES, type BodyPose } from '../lib/poses';
import { useBodyCheckStore } from '../stores/body-check-store';

const close = () => router.back();

/**
 * A check's photos full screen, to look closely: zoom in, pick the pose, and close with the X or
 * by dragging the photo away.
 */
export function PhotoViewerScreen() {
  const params = useLocalSearchParams<{ id: string; pose?: string }>();
  const { t } = useTranslation(['bodyCheck', 'common']);
  const insets = useSafeAreaInsets();
  const { data: checks } = useBodyChecks();
  const { data: photos } = useBodyCheckPhotos();
  const draftId = useBodyCheckStore((s) => s.checkId);
  const shots = useBodyCheckStore((s) => s.shots);
  const [pose, setPose] = useState<BodyPose>(POSES.find((p) => p === params.pose) ?? POSES[0]);
  const [aspect, setAspect] = useState<number>();

  const { id } = params;
  // A check that isn't saved yet shows its draft photos.
  const draft = draftId === id && !checks?.some((c) => c.id === id);

  return (
    <View className="flex-1 bg-black">
      <ZoomableView key={pose} contentAspect={aspect} onDismiss={close}>
        <CheckPhoto
          checkId={id}
          pose={pose}
          uri={draft ? shots[pose]?.uri : undefined}
          storagePath={photos?.[id]?.[pose]}
          contentFit="contain"
          onLoad={(e) => setAspect(e.source.width / e.source.height)}
          accessibilityLabel={t(`poses.${pose}.name`)}
          fallback={<ActivityIndicator color={colors.subtle} className="flex-1" />}
        />
      </ZoomableView>
      <View className="absolute left-4" style={{ top: insets.top + 6 }}>
        <IconButton icon="close" accessibilityLabel={t('common:actions.close')} onPress={close} />
      </View>
      <View className="absolute inset-x-0" style={{ bottom: insets.bottom + 16 }}>
        <PoseChips pose={pose} onChange={setPose} />
      </View>
    </View>
  );
}
