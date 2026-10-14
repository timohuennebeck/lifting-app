import { Redirect, router, Stack } from 'expo-router';
import { useRef, useState } from 'react';
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
 * 05a-2: the captured pages full screen, like a progress check photo: switch, retake or remove
 * pages, add one, then read the plan.
 */
export function ReviewScreen() {
  const { t } = useTranslation('planImport');
  const { step } = usePlanFlow();
  const photos = usePhotos();
  const removePhoto = useImportStore((s) => s.removePhoto);
  const [page, setPage] = useState(0);
  const strip = useRef<ScrollView>(null);
  if (!photos.length) return <Redirect href={step('/import/camera')} />;
  const current = Math.min(page, photos.length - 1);
  const addPage = () => router.push(step('/import/camera'));

  function show(index: number) {
    setPage(index);
    strip.current?.scrollTo({ x: Math.max(0, (index - 1) * THUMB_STEP), animated: true });
  }

  function remove() {
    removePhoto(current);
    show(Math.max(0, current - 1));
  }

  return (
    <View className="flex-1 bg-black">
      <Stack.Screen options={{ animation: 'fade' }} />
      <PhotoReview
        uri={photos[current].uri}
        // A camera photo fills the screen as its preview did; a picked one shows whole.
        fit={photos[current].fromCamera ? 'cover' : 'contain'}
        title={t('camera.page', { count: current + 1 })}
        onClose={() => router.back()}
        strip={
          <ScrollView
            ref={strip}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="grow items-start justify-center gap-4.5 px-4"
          >
            {photos.map((p, i) => (
              <PhotoThumb
                key={p.uri}
                uri={p.uri}
                label={String(i + 1)}
                accessibilityLabel={t('camera.page', { count: i + 1 })}
                selected={i === current}
                viewing
                onPress={() => show(i)}
              />
            ))}
            {photos.length < MAX_PHOTOS ? (
              <PhotoThumb
                label={String(photos.length + 1)}
                accessibilityLabel={t('review.addPage')}
                selected={false}
                viewing
                onPress={addPage}
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
        <IconButton
          icon="trash"
          size={60}
          iconSize={16}
          accessibilityLabel={t('review.remove')}
          onPress={remove}
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
