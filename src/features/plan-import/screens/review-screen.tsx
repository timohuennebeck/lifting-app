import { Image } from 'expo-image';
import { Redirect, router } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/ui/button';
import { Card } from '@/shared/ui/card';
import { Icon } from '@/shared/ui/icon';
import { IconButton } from '@/shared/ui/icon-button';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { StepScreen } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';

import { IMPORT_STEPS } from '../lib/format';
import { useImportStore, usePhotos } from '../stores/import-store';

/** 05a-2: page through the captured photos, retake or remove pages, then analyze. */
export function ReviewScreen() {
  const { t } = useTranslation('planImport');
  const photos = usePhotos();
  const removePhoto = useImportStore((s) => s.removePhoto);
  const [page, setPage] = useState(0);
  // Pages get the card's exact size; a horizontal list does not stretch them on every platform.
  const [{ width, height }, setSize] = useState({ width: 0, height: 0 });
  const pager = useRef<FlatList>(null);
  if (!photos.length) return <Redirect href="/import/camera" />;
  const current = Math.min(page, photos.length - 1);

  function show(index: number) {
    setPage(index);
    pager.current?.scrollToOffset({ offset: index * width, animated: true });
  }

  function remove() {
    removePhoto(current);
    show(Math.max(0, current - 1));
  }

  return (
    <StepScreen
      step={2}
      total={IMPORT_STEPS}
      title={t('review.title')}
      titleClassName="pt-3.5"
      scroll
      footer={
        <View className="gap-1.5">
          <Button label={t('review.cta')} onPress={() => router.push('/import/analysis')} />
          <Button
            label={t('review.addPage')}
            variant="ghost"
            icon="plus"
            className="h-11 self-center"
            onPress={() => router.push('/import/camera')}
          />
        </View>
      }
    >
      <Card
        className="mx-4 mt-5.5 h-80 overflow-hidden p-0"
        onLayout={(e) => setSize(e.nativeEvent.layout)}
      >
        {width ? (
          <FlatList
            ref={pager}
            data={photos}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            keyExtractor={(p) => p.uri}
            getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
            onMomentumScrollEnd={(e) => setPage(Math.round(e.nativeEvent.contentOffset.x / width))}
            renderItem={({ item, index }) => (
              <View style={{ width, height }} className="items-center px-5 pt-5.5 pb-16">
                <Image
                  source={{ uri: item.uri }}
                  contentFit="contain"
                  accessibilityLabel={t('camera.page', { count: index + 1 })}
                  style={{ flex: 1, width: '100%', borderRadius: 6 }}
                />
              </View>
            )}
          />
        ) : null}
        <IconButton
          icon="close"
          size={38}
          iconSize={11}
          accessibilityLabel={t('review.remove')}
          onPress={remove}
          className="absolute top-3.5 right-3.5"
        />
        <View className="absolute bottom-3.5 left-3.5 h-9.5 justify-center rounded-full bg-elevated px-3.5">
          <Text variant="caption">
            {t('review.counter', { current: current + 1, total: photos.length })}
          </Text>
        </View>
        <PressableScale
          haptic="select"
          onPress={() => router.push({ pathname: '/import/camera', params: { retake: current } })}
          className="absolute right-3.5 bottom-3.5 h-9.5 flex-row items-center gap-1.5 rounded-full bg-elevated px-3.5"
        >
          <Icon name="refresh" size={14} />
          <Text variant="caption">{t('review.retake')}</Text>
        </PressableScale>
      </Card>
      <View className="flex-row flex-wrap gap-2.5 px-4 pt-4">
        {photos.map((p, i) => (
          <PressableScale
            key={p.uri}
            haptic="select"
            accessibilityLabel={t('camera.page', { count: i + 1 })}
            accessibilityState={{ selected: i === current }}
            onPress={() => show(i)}
            className={cn(
              'h-21 w-16 rounded-xl bg-surface p-2',
              i === current ? 'border-2 border-accent' : 'border border-white/8',
            )}
          >
            <Image
              source={{ uri: p.uri }}
              contentFit="cover"
              style={{ flex: 1, borderRadius: 6 }}
            />
          </PressableScale>
        ))}
        <PressableScale
          haptic="select"
          accessibilityLabel={t('review.addPage')}
          onPress={() => router.push('/import/camera')}
          className="h-21 w-16 items-center justify-center rounded-xl bg-elevated"
        >
          <Icon name="plus" size={16} />
        </PressableScale>
      </View>
    </StepScreen>
  );
}
