import { CameraView, PermissionStatus, useCameraPermissions } from 'expo-camera';
import { router, useIsFocused } from 'expo-router';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, AppState, Linking, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFooterInset } from '@/shared/hooks/use-footer-inset';
import { useHardwareBack } from '@/shared/hooks/use-hardware-back';
import { cn } from '@/shared/lib/cn';
import { haptics } from '@/shared/lib/haptics';
import { Button } from '@/shared/ui/button';
import { IconButton } from '@/shared/ui/icon-button';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { StepTitle } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';

import { FlipCameraIcon, FramingCorners } from '../components/camera-chrome';
import { PoseStrip } from '../components/pose-strip';
import { Scrim } from '../components/scrim';
import { useCloseCheck } from '../hooks/use-close-check';
import { assessPhoto } from '../lib/body-check-service';
import { deleteFile, storeShot } from '../lib/photo-files';
import { POSES } from '../lib/poses';
import { startBodyCheck, useBodyCheckStore } from '../stores/body-check-store';

/** Design offsets (390×844 frame) of the framing corners above the controls. */
const FRAME_TOP = 74;
const FRAME_BOTTOM = 228;

/** 08a: full-screen camera that walks through the four poses, with self-timer. */
export function CameraScreen() {
  const { t } = useTranslation(['bodyCheck', 'common']);
  const insets = useSafeAreaInsets();
  const footerInset = useFooterInset();
  const focused = useIsFocused();
  // Read after the async capture: the user may have left the camera meanwhile.
  const focusedRef = useRef(focused);
  useEffect(() => {
    focusedRef.current = focused;
  }, [focused]);
  const close = useCloseCheck();
  // Android back on the flow's first screen would drop the modal without asking.
  useHardwareBack(close);
  const [permission, requestPermission, getPermission] = useCameraPermissions();
  const camera = useRef<CameraView>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [count, setCount] = useState(0);
  const checkId = useBodyCheckStore((s) => s.checkId);
  const shots = useBodyCheckStore((s) => s.shots);
  const pose = useBodyCheckStore((s) => s.pose);
  const timer = useBodyCheckStore((s) => s.timer);
  const facing = useBodyCheckStore((s) => s.facing);
  const flash = useSharedValue(0);
  const flashStyle = useAnimatedStyle(() => ({ opacity: flash.get() }));
  const taken = POSES.filter((p) => shots[p]).length;

  // Opened without a running check (e.g. deep link): start one.
  useEffect(() => {
    if (!useBodyCheckStore.getState().checkId) startBodyCheck();
  }, []);

  // The user asked for the camera by starting the check, so ask the system right away.
  const permissionStatus = permission?.status;
  useEffect(() => {
    if (permissionStatus === PermissionStatus.UNDETERMINED) requestPermission();
  }, [permissionStatus, requestPermission]);

  // Coming back from the system settings may have granted the permission.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') getPermission();
    });
    return () => sub.remove();
  }, [getPermission]);

  async function capture() {
    const store = useBodyCheckStore.getState();
    if (!camera.current || !store.checkId || busy) return;
    const target = store.pose;
    const id = store.checkId;
    const wasComplete = POSES.every((p) => store.shots[p]);
    setBusy(true);
    haptics.heavy();
    flash.set(withSequence(withTiming(0.85, { duration: 40 }), withTiming(0, { duration: 250 })));
    try {
      const pic = await camera.current.takePictureAsync({ quality: 0.9 });
      const stored = await storeShot(pic, id, target);
      const current = useBodyCheckStore.getState();
      // The check was closed while the photo was processed.
      if (current.checkId !== id) return deleteFile(stored.uri);
      const issue = assessPhoto(stored);
      if (issue) haptics.warning();
      current.addShot(target, { ...stored, issue });
      const complete = POSES.every((p) => useBodyCheckStore.getState().shots[p]);
      const openReview = current.retaking || (complete && !wasComplete);
      if (openReview && focusedRef.current) router.push('/body-check/review');
    } catch (error) {
      console.warn('Body-check photo failed', error);
      Alert.alert(t('camera.error'));
    } finally {
      setBusy(false);
    }
  }

  const tick = useEffectEvent(() => {
    // Leaving the screen (review opened on top) cancels the countdown.
    if (!focused) return setCount(0);
    if (count > 1) {
      haptics.tap();
      setCount(count - 1);
      return;
    }
    setCount(0);
    void capture();
  });

  useEffect(() => {
    if (count <= 0) return;
    const id = setTimeout(tick, 1000);
    return () => clearTimeout(id);
  }, [count]);

  function shutter() {
    if (busy) return;
    if (count > 0) {
      haptics.select();
      setCount(0);
      return;
    }
    if (!timer) return void capture();
    haptics.tap();
    setCount(timer);
  }

  if (!permission) return <View className="flex-1 bg-black" />;

  if (!permission.granted) {
    return (
      <View className="flex-1 bg-bg" style={{ paddingTop: insets.top, paddingBottom: footerInset }}>
        <ScreenHeader icon="close" onBack={close} />
        <StepTitle
          title={t('camera.permission.title')}
          subtitle={t('camera.permission.body')}
          subtitleTone="subtle"
        />
        <View className="flex-1" />
        <Button
          label={t(
            permission.canAskAgain ? 'camera.permission.allow' : 'camera.permission.settings',
          )}
          icon="camera"
          className="mx-4"
          onPress={() => (permission.canAskAgain ? requestPermission() : Linking.openSettings())}
        />
      </View>
    );
  }

  const frame = {
    left: 40,
    right: 40,
    top: insets.top + FRAME_TOP,
    bottom: footerInset + FRAME_BOTTOM,
  };

  return (
    <View className="flex-1 bg-black">
      <CameraView
        ref={camera}
        style={StyleSheet.absoluteFill}
        facing={facing}
        animateShutter={false}
        active={focused}
        onCameraReady={() => setReady(true)}
        onMountError={() => Alert.alert(t('camera.error'))}
      />
      <Scrim edge="top" height={200} opacity={0.6} />
      <Scrim edge="bottom" height={300} opacity={0.85} solid={0.3} />
      <FramingCorners style={frame} />

      {count > 0 ? (
        <View pointerEvents="none" className="absolute items-center justify-center" style={frame}>
          <View
            className="size-37.5 items-center justify-center rounded-full border-2 border-accent bg-black/35"
            accessibilityLiveRegion="assertive"
          >
            <Text className="font-inter-semibold text-[76px] leading-20 text-accent">{count}</Text>
          </View>
        </View>
      ) : null}

      <View className="absolute inset-x-4" style={{ top: insets.top + 6 }}>
        <View className="flex-row items-center justify-between">
          <IconButton icon="close" accessibilityLabel={t('common:actions.close')} onPress={close} />
          <Text
            variant="bodyStrong"
            numberOfLines={1}
            className="min-w-0 flex-1 px-2.5 text-center"
          >
            {t(`poses.${pose}.short`)}
          </Text>
          <PressableScale
            haptic="select"
            accessibilityLabel={t('camera.timerA11y')}
            onPress={() => useBodyCheckStore.getState().cycleTimer()}
            className="h-10.5 justify-center rounded-full bg-elevated px-3.5"
          >
            <Text variant="caption">
              {t('camera.timer', {
                value: timer ? t('camera.seconds', { count: timer }) : t('camera.timerOff'),
              })}
            </Text>
          </PressableScale>
        </View>
        <Text variant="caption" tone="secondary" className="mt-3 text-center font-inter">
          {t(`poses.${pose}.tip`)}
        </Text>
      </View>

      <View className="absolute inset-x-0 items-center gap-5.5" style={{ bottom: footerInset }}>
        <PoseStrip
          shots={shots}
          active={pose}
          onSelect={(p) => useBodyCheckStore.getState().setPose(p)}
        />
        <View className="w-full flex-row items-center px-7">
          <View className="flex-1 items-start">
            <PressableScale
              haptic="select"
              accessibilityLabel={t('camera.flip')}
              onPress={() => useBodyCheckStore.getState().toggleFacing()}
              className="size-13 items-center justify-center rounded-full bg-elevated"
            >
              <FlipCameraIcon />
            </PressableScale>
          </View>
          <PressableScale
            haptic="none"
            activeScale={0.94}
            disabled={busy || !ready || !checkId}
            accessibilityLabel={t(count > 0 ? 'camera.cancelTimer' : 'camera.shutter')}
            onPress={shutter}
            className="size-19.5 items-center justify-center rounded-full bg-elevated"
          >
            <View
              className={cn(
                'size-15.5 rounded-full',
                count > 0 ? 'bg-fg' : 'bg-accent',
                (busy || !ready) && 'opacity-60',
              )}
            />
          </PressableScale>
          <View className="flex-1 items-end">
            {taken ? (
              <PressableScale
                haptic="press"
                disabled={busy}
                onPress={() => router.push('/body-check/review')}
                className="h-11 flex-row items-center gap-2 rounded-full bg-elevated pr-2 pl-4"
              >
                <Text variant="label">{t('common:actions.done')}</Text>
                <View className="h-6.5 min-w-6.5 items-center justify-center rounded-full bg-accent px-1.5">
                  <Text variant="caption" tone="onAccent">
                    {taken}
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
