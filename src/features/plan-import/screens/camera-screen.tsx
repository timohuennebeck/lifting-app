import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useHardwareBack } from '@/shared/hooks/use-hardware-back';
import { wait } from '@/shared/lib/async';
import { haptics } from '@/shared/lib/haptics';
import { colors } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/button';
import { CameraPermission } from '@/shared/ui/camera/camera-permission';
import {
  CameraSideButton,
  CaptureRow,
  DonePill,
  ShutterButton,
} from '@/shared/ui/camera/capture-controls';
import { ShutterFlash, useShutterFlash } from '@/shared/ui/camera/shutter-flash';
import { Icon } from '@/shared/ui/icon';
import { IconButton } from '@/shared/ui/icon-button';
import { Text } from '@/shared/ui/text';

import { pickPlanPhotos } from '../lib/pick-source';
import type { ImportPhoto } from '../lib/plan-import-service';
import { useImportStore, usePhotos } from '../stores/import-store';

/** Bottom panel height from the design, home indicator area included. */
const PANEL_HEIGHT = 194;
/** iOS takes the next shot only once the previous one is captured; retry until then. */
const SHOT_RETRIES = 30;
const SHOT_RETRY_MS = 80;

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
  // Shots still being saved: the shutter stays live, so pages can be taken in quick succession.
  const [pending, setPending] = useState(0);
  const [finishing, setFinishing] = useState(false);
  // Shots finish in any order; pages are added in the order they were taken.
  const queue = useRef({ next: 0, flushed: 0, done: new Map<number, ImportPhoto | null>() });
  const photos = usePhotos();
  const addPhotos = useImportStore((s) => s.addPhotos);
  const replacePhoto = useImportStore((s) => s.replacePhoto);
  const truncatePhotos = useImportStore((s) => s.truncatePhotos);
  // Pages that existed before this camera session survive a close; new ones are discarded.
  const keptOnClose = useRef(photos.length);
  // A capture still running when the camera closes must not add photos or navigate.
  const closed = useRef(false);
  const flash = useShutterFlash();

  function store(picked: ImportPhoto[]) {
    if (retakeIndex !== null) {
      replacePhoto(retakeIndex, picked[0]);
      router.back();
      return true;
    }
    addPhotos(picked);
    return false;
  }

  async function capture(): Promise<ImportPhoto> {
    for (let attempt = 0; ; attempt++) {
      try {
        const pic = await camera.current!.takePictureAsync({ quality: 0.7 });
        return { uri: pic.uri, width: pic.width, height: pic.height };
      } catch (error) {
        if (attempt >= SHOT_RETRIES || closed.current || !camera.current) throw error;
        await wait(SHOT_RETRY_MS);
      }
    }
  }

  function settle(seq: number, photo: ImportPhoto | null) {
    const q = queue.current;
    q.done.set(seq, photo);
    const ready: ImportPhoto[] = [];
    while (q.done.has(q.flushed)) {
      const next = q.done.get(q.flushed);
      q.done.delete(q.flushed++);
      if (next) ready.push(next);
    }
    if (ready.length && !closed.current) addPhotos(ready);
  }

  async function shoot() {
    if (busy || !camera.current) return;
    haptics.heavy();
    flash.fire();
    if (retakeIndex !== null) {
      // A retake replaces one page and leaves the camera, so it waits for its photo.
      setBusy(true);
      try {
        const photo = await capture();
        if (!closed.current) store([photo]);
      } catch {
        if (!closed.current) Alert.alert(t('planImport:errors.camera'));
      } finally {
        setBusy(false);
      }
      return;
    }
    const seq = queue.current.next++;
    setPending((n) => n + 1);
    try {
      settle(seq, await capture());
    } catch {
      settle(seq, null);
      if (!closed.current) Alert.alert(t('planImport:errors.camera'));
    } finally {
      setPending((n) => n - 1);
    }
  }

  // "Done" waits for shots that are still being saved.
  useEffect(() => {
    if (finishing && pending === 0) router.dismissTo('/import/review');
  }, [finishing, pending]);

  function close() {
    closed.current = true;
    if (retakeIndex === null) truncatePhotos(keptOnClose.current);
    router.back();
  }
  // Every way out drops this session's photos: no swipe-back, Android back runs close().
  useHardwareBack(close);

  async function fromLibrary() {
    const picked = await pickPlanPhotos();
    if (picked.length && !store(picked)) router.dismissTo('/import/review');
  }

  const options = <Stack.Screen options={{ animation: 'fade', gestureEnabled: false }} />;
  if (!permission) return <View className="flex-1 bg-black">{options}</View>;

  if (!permission.granted) {
    return (
      <>
        {options}
        <CameraPermission
          permission={permission}
          onRequest={requestPermission}
          onClose={close}
          copy={t('planImport:camera.permission', { returnObjects: true })}
          bottomInset={insets.bottom + 16}
        >
          <Button
            label={t('planImport:camera.library')}
            variant="ghost"
            icon="image"
            onPress={fromLibrary}
          />
        </CameraPermission>
      </>
    );
  }

  const panelHeight = Math.max(PANEL_HEIGHT, 160 + insets.bottom);
  const shots = photos.length + pending;

  return (
    <View className="flex-1 bg-black">
      {options}
      {/* The preview fills the whole screen; the controls float over it. */}
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
          bottom: panelHeight + 4,
          boxShadow: '0 0 0 999px rgba(0,0,0,0.45)',
        }}
      />
      <View
        className="absolute inset-x-0 flex-row items-center justify-between px-4"
        style={{ top: insets.top + 6 }}
      >
        <IconButton icon="close" accessibilityLabel={t('common:actions.close')} onPress={close} />
        <View className="h-8.5 justify-center rounded-full bg-elevated px-3.5">
          <Text variant="caption">
            {retakeIndex !== null
              ? t('planImport:camera.retake', { count: retakeIndex + 1 })
              : t('planImport:camera.page', { count: shots + 1 })}
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
      <View
        className="absolute inset-x-0 bottom-0 items-center gap-4.5 pt-1"
        style={{ height: panelHeight, paddingBottom: insets.bottom }}
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
        <CaptureRow
          start={
            <CameraSideButton
              accessibilityLabel={t('planImport:camera.library')}
              onPress={fromLibrary}
            >
              <Icon name="image" size={20} />
            </CameraSideButton>
          }
          end={
            shots && retakeIndex === null ? (
              <DonePill
                label={t('planImport:camera.done')}
                count={shots}
                disabled={finishing}
                onPress={() => setFinishing(true)}
              />
            ) : null
          }
        >
          <ShutterButton
            busy={busy}
            accessibilityLabel={t('planImport:camera.shutter')}
            onPress={shoot}
          />
        </CaptureRow>
      </View>
      <ShutterFlash opacity={flash.opacity} />
    </View>
  );
}
