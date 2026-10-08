import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Linking, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/shared/lib/cn';
import { haptics } from '@/shared/lib/haptics';
import { colors } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/button';
import { Icon } from '@/shared/ui/icon';
import { IconButton } from '@/shared/ui/icon-button';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { StepTitle } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';

import { pickPlanPhotos } from '../lib/pick-source';
import type { ImportPhoto } from '../lib/plan-import-service';
import { useImportStore, usePhotos } from '../stores/import-store';

const PANEL_HEIGHT = 194;

/** 05a: photograph the plan page by page. `?retake=<index>` replaces one page. */
export function CameraScreen() {
  const { t } = useTranslation(['planImport', 'common']);
  const insets = useSafeAreaInsets();
  const { retake } = useLocalSearchParams<{ retake?: string }>();
  const retakeIndex = retake !== undefined ? Number(retake) : null;
  const [permission, requestPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);
  const [torch, setTorch] = useState(false);
  const [busy, setBusy] = useState(false);
  const photos = usePhotos();
  const addPhotos = useImportStore((s) => s.addPhotos);
  const replacePhoto = useImportStore((s) => s.replacePhoto);
  const flash = useSharedValue(0);
  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.get() }));

  function store(picked: ImportPhoto[]) {
    if (retakeIndex !== null) {
      replacePhoto(retakeIndex, picked[0]);
      router.back();
      return true;
    }
    addPhotos(picked);
    return false;
  }

  async function shoot() {
    if (busy || !camera.current) return;
    setBusy(true);
    haptics.heavy();
    flash.set(withSequence(withTiming(0.85, { duration: 40 }), withTiming(0, { duration: 250 })));
    try {
      const pic = await camera.current.takePictureAsync({ quality: 0.7 });
      store([{ uri: pic.uri, width: pic.width, height: pic.height }]);
    } catch {
      Alert.alert(t('planImport:errors.camera'));
    } finally {
      setBusy(false);
    }
  }

  async function fromLibrary() {
    const picked = await pickPlanPhotos();
    if (picked.length && !store(picked)) router.dismissTo('/import/review');
  }

  const options = <Stack.Screen options={{ animation: 'fade' }} />;
  if (!permission) return <View className="flex-1 bg-black">{options}</View>;

  if (!permission.granted) {
    return (
      <View
        className="flex-1 bg-bg"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom + 16 }}
      >
        {options}
        <View className="px-4 py-1.5">
          <IconButton
            icon="close"
            accessibilityLabel={t('common:actions.close')}
            onPress={() => router.back()}
          />
        </View>
        <StepTitle
          title={t('planImport:camera.permission.title')}
          subtitle={t('planImport:camera.permission.body')}
          subtitleTone="subtle"
        />
        <View className="flex-1" />
        <View className="gap-2 px-4">
          <Button
            label={
              permission.canAskAgain
                ? t('planImport:camera.permission.allow')
                : t('planImport:camera.permission.settings')
            }
            icon="camera"
            onPress={() => (permission.canAskAgain ? requestPermission() : Linking.openSettings())}
          />
          <Button
            label={t('planImport:camera.library')}
            variant="ghost"
            icon="image"
            onPress={fromLibrary}
          />
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {options}
      <View className="flex-1 overflow-hidden">
        <CameraView
          ref={camera}
          style={StyleSheet.absoluteFill}
          facing="back"
          enableTorch={torch}
          animateShutter={false}
        />
        <View
          pointerEvents="none"
          className="absolute rounded-[28px] border border-white/8"
          style={{
            left: 16,
            right: 16,
            top: insets.top + 62,
            bottom: 4,
            boxShadow: '0 0 0 999px rgba(0,0,0,0.45)',
          }}
        />
        <View
          className="absolute inset-x-0 flex-row items-center justify-between px-4"
          style={{ top: insets.top + 6 }}
        >
          <IconButton
            icon="close"
            accessibilityLabel={t('common:actions.close')}
            onPress={() => router.back()}
          />
          <View className="h-[34px] justify-center rounded-full bg-elevated px-3.5">
            <Text variant="caption">
              {retakeIndex !== null
                ? t('planImport:camera.retake', { count: retakeIndex + 1 })
                : t('planImport:camera.page', { count: photos.length + 1 })}
            </Text>
          </View>
          <IconButton
            icon="bolt"
            iconSize={20}
            haptic="select"
            accessibilityLabel={t('planImport:camera.torch')}
            accessibilityState={{ selected: torch }}
            color={torch ? colors.onAccent : colors.fg}
            className={torch ? 'bg-accent' : undefined}
            onPress={() => setTorch((v) => !v)}
          />
        </View>
      </View>
      <View
        className="items-center gap-[18px] bg-black pt-1"
        style={{ height: PANEL_HEIGHT + insets.bottom, paddingBottom: insets.bottom }}
      >
        <View className="h-11 flex-row items-center justify-center gap-1.5">
          {photos.length && retakeIndex === null ? (
            photos
              .slice(-6)
              .map((p) => (
                <Image
                  key={p.uri}
                  source={{ uri: p.uri }}
                  contentFit="cover"
                  style={{ width: 32, height: 42, borderRadius: 5 }}
                />
              ))
          ) : (
            <Text variant="caption" tone="subtle" className="font-inter">
              {t('planImport:camera.hint')}
            </Text>
          )}
        </View>
        <View className="w-full flex-row items-center px-7">
          <View className="flex-1 items-start">
            <PressableScale
              accessibilityLabel={t('planImport:camera.library')}
              onPress={fromLibrary}
              className="size-[52px] items-center justify-center rounded-full bg-elevated"
            >
              <Icon name="image" size={20} />
            </PressableScale>
          </View>
          <PressableScale
            haptic="none"
            activeScale={0.94}
            disabled={busy}
            accessibilityLabel={t('planImport:camera.shutter')}
            onPress={shoot}
            className="size-[78px] items-center justify-center rounded-full bg-elevated"
          >
            <View className={cn('size-[62px] rounded-full bg-accent', busy && 'opacity-60')} />
          </PressableScale>
          <View className="flex-1 items-end">
            {photos.length && retakeIndex === null ? (
              <PressableScale
                haptic="press"
                onPress={() => router.dismissTo('/import/review')}
                className="h-11 flex-row items-center gap-2 rounded-full bg-elevated pr-2 pl-4"
              >
                <Text variant="label">{t('planImport:camera.done')}</Text>
                <View className="h-[26px] min-w-[26px] items-center justify-center rounded-full bg-accent px-1.5">
                  <Text variant="caption" tone="onAccent">
                    {photos.length}
                  </Text>
                </View>
              </PressableScale>
            ) : null}
          </View>
        </View>
      </View>
      <Animated.View
        pointerEvents="none"
        className="absolute inset-0 bg-fg"
        style={[{ opacity: 0 }, flashStyle]}
      />
    </View>
  );
}
