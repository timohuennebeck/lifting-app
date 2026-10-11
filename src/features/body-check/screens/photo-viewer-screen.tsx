import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActivityIndicator, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/shared/lib/theme';
import { Chip } from '@/shared/ui/chip';
import { IconButton } from '@/shared/ui/icon-button';
import { ZoomableView } from '@/shared/ui/zoomable-view';

import { CheckPhoto } from '../components/check-photo';
import { useBodyCheckPhotos, useBodyChecks } from '../data/body-checks';
import { POSES, type BodyPose } from '../lib/poses';
import { useBodyCheckStore } from '../stores/body-check-store';

const close = () => router.back();

/**
 * A check's photos full screen, to look closely: zoom in, swipe or pick the pose, and close with
 * the X or by dragging the photo away.
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

  function swipe(direction: 1 | -1) {
    const next = POSES[POSES.indexOf(pose) + direction];
    if (next) setPose(next);
  }

  return (
    <View className="flex-1 bg-black">
      <ZoomableView key={pose} contentAspect={aspect} onDismiss={close} onSwipe={swipe}>
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
      <View
        className="absolute inset-x-0 flex-row justify-center gap-1.5"
        style={{ bottom: insets.bottom + 16 }}
      >
        {POSES.map((p) => (
          <Chip
            key={p}
            label={t(`poses.${p}.short`)}
            selected={p === pose}
            onPress={() => setPose(p)}
            className="h-7.5 px-2.75"
          />
        ))}
      </View>
    </View>
  );
}
