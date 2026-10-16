import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, View } from 'react-native';

import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { Button } from '@/shared/ui/button';
import { IconButton } from '@/shared/ui/icon-button';
import { PhotoReview } from '@/shared/ui/photo-review';
import { PhotoThumb } from '@/shared/ui/photo-thumb';

import { MAX_PHOTOS } from '../lib/plan-import-service';
import { useImportStore, usePhotos } from '../stores/import-store';

/** Width of a thumbnail with the gap after it, to scroll the shown page into view. */
const THUMB_STEP = 56 + 18;

/**
 * 05a-2: the captured pages full screen, like a progress check photo, always opened over the
 * camera (`?page=` the one to show): switch pages, retake one, remove one with the X on its
 * thumbnail, add one, then read the plan. The X and "add page" go back to the camera.
 */
export function ReviewScreen() {
  const { t } = useTranslation('planImport');
  const { step } = usePlanFlow();
  const params = useLocalSearchParams<{ page?: string }>();
  const photos = usePhotos();
  const removePhoto = useImportStore((s) => s.removePhoto);
  const [page, setPage] = useState(() => Number(params.page) || 0);
  const strip = useRef<ScrollView>(null);
  const empty = !photos.length;

  // Every page removed: back to the camera underneath.
  useEffect(() => {
    if (empty) router.back();
  }, [empty]);

  if (empty) return null;
  const current = Math.min(page, photos.length - 1);
  const toCamera = () => router.back();

  function show(index: number) {
    setPage(index);
    strip.current?.scrollTo({ x: Math.max(0, (index - 1) * THUMB_STEP), animated: true });
  }

  function remove(index: number) {
    removePhoto(index);
    // The shown page stays shown; if it was the one removed, the one before it.
    if (index <= current) show(Math.max(0, current - 1));
  }

  return (
    <View className="flex-1 bg-black">
      <Stack.Screen options={{ animation: 'fade' }} />
      <PhotoReview
        uri={photos[current].uri}
        // A camera photo fills the screen as its preview did; a picked one shows whole.
        fit={photos[current].fromCamera ? 'cover' : 'contain'}
        title={t('camera.page', { count: current + 1 })}
        onClose={toCamera}
        strip={
          <ScrollView
            ref={strip}
            horizontal
            showsHorizontalScrollIndicator={false}
            // Room above for the X that sits on each thumbnail's corner; the scroll view clips.
            className="-mt-2"
            contentContainerClassName="grow items-start justify-center gap-4.5 px-4 pt-2"
          >
            {photos.map((p, i) => (
              <PhotoThumb
                key={p.uri}
                uri={p.uri}
                label={String(i + 1)}
                accessibilityLabel={t('camera.page', { count: i + 1 })}
                selected={i === current}
                viewing
                remove={{
                  accessibilityLabel: t('review.remove', { count: i + 1 }),
                  onPress: () => remove(i),
                }}
                onPress={() => show(i)}
              />
            ))}
            {photos.length < MAX_PHOTOS ? (
              <PhotoThumb
                label={String(photos.length + 1)}
                accessibilityLabel={t('review.addPage')}
                selected={false}
                viewing
                onPress={toCamera}
              />
            ) : null}
          </ScrollView>
        }
      >
        <IconButton
          icon="refresh"
          size={60}
          iconSize={16}
          accessibilityLabel={t('review.retake')}
          onPress={() =>
            router.push({ pathname: step('/import/camera'), params: { retake: current } })
          }
        />
        <Button
          label={t('read')}
          onPress={() => router.push(step('/import/reading'))}
          className="flex-1"
        />
      </PhotoReview>
    </View>
  );
}
