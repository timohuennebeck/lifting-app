import { CameraView, PermissionStatus, useCameraPermissions } from 'expo-camera';
import { router, useIsFocused } from 'expo-router';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, AppState, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFooterInset } from '@/shared/hooks/use-footer-inset';
import { useHardwareBack } from '@/shared/hooks/use-hardware-back';
import { haptics } from '@/shared/lib/haptics';
import { CameraPermission } from '@/shared/ui/camera/camera-permission';
import {
  CameraSideButton,
  CaptureRow,
  DonePill,
  ShutterButton,
} from '@/shared/ui/camera/capture-controls';
import { ShutterFlash, useShutterFlash } from '@/shared/ui/camera/shutter-flash';
import { Gradient, type GradientStop } from '@/shared/ui/gradient';
import { IconButton } from '@/shared/ui/icon-button';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { CountdownNumber, FlipCameraIcon, FramingCorners } from '../components/camera-chrome';
import { PoseStrip } from '../components/pose-strip';
import { useCloseCheck } from '../hooks/use-close-check';
import { assessPhoto } from '../lib/body-check-service';
import { deleteFile, storeShot } from '../lib/photo-files';
import { POSES } from '../lib/poses';
import { startBodyCheck, useBodyCheckStore } from '../stores/body-check-store';

/** Design offsets (390×844 frame) of the framing corners above the controls. */
const FRAME_TOP = 74;
const FRAME_BOTTOM = 228;
/** Bottom scrim behind the controls: solid for its first 30 %, then fading out. */
const BOTTOM_SCRIM: GradientStop[] = [
  [0, 0.85],
  [0.3, 0.85],
  [1, 0],
];

/** 08a: full-screen camera that walks through the three poses, with self-timer. */
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
  const flash = useShutterFlash();
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
    flash.fire();
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
      <CameraPermission
        permission={permission}
        onRequest={requestPermission}
        onClose={close}
        copy={t('camera.permission', { returnObjects: true })}
        bottomInset={footerInset}
      />
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
      <Gradient from="top" size={200} color="black" opacity={0.6} />
      <Gradient from="bottom" size={300} color="black" stops={BOTTOM_SCRIM} />

      {count > 0 ? (
        // Countdown: only the pose, the number and a stop button; a tap anywhere cancels.
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('camera.cancelTimer')}
          onPress={shutter}
          style={StyleSheet.absoluteFill}
        >
          <Text
            variant="caption"
            tone="accent"
            className="absolute inset-x-0 text-center font-inter-semibold text-[13px] tracking-[1.6px] uppercase"
            style={{ top: insets.top + 18 }}
          >
            {t(`poses.${pose}.name`)}
          </Text>
          <View
            pointerEvents="none"
            className="absolute items-center justify-center"
            style={frame}
            accessibilityLiveRegion="assertive"
          >
            <Animated.View key={count} entering={FadeIn.duration(160)}>
              <CountdownNumber value={count} />
            </Animated.View>
          </View>
          <View
            pointerEvents="none"
            className="absolute inset-x-0 items-center gap-3.5"
            style={{ bottom: footerInset }}
          >
            <View className="size-19.5 items-center justify-center rounded-full bg-elevated">
              <View className="size-6.5 rounded-md bg-fg" />
            </View>
            <Text variant="caption" tone="subtle" className="font-inter">
              {t('camera.tapToCancel')}
            </Text>
          </View>
        </Pressable>
      ) : (
        <>
          <FramingCorners style={frame} />

          <View className="absolute inset-x-4" style={{ top: insets.top + 6 }}>
            <View className="flex-row items-center justify-between">
              <IconButton
                icon="chevron-left"
                iconSize={7}
                accessibilityLabel={t('common:actions.close')}
                onPress={close}
              />
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
                    value: timer ? t('camera.seconds', { value: timer }) : t('camera.timerOff'),
                  })}
                </Text>
              </PressableScale>
            </View>
          </View>

          <View className="absolute inset-x-0 items-center gap-5.5" style={{ bottom: footerInset }}>
            <PoseStrip
              shots={shots}
              active={pose}
              onSelect={(p) => useBodyCheckStore.getState().setPose(p)}
            />
            <CaptureRow
              start={
                <CameraSideButton
                  haptic="select"
                  accessibilityLabel={t('camera.flip')}
                  onPress={() => useBodyCheckStore.getState().toggleFacing()}
                >
                  <FlipCameraIcon />
                </CameraSideButton>
              }
              end={
                taken ? (
                  <DonePill
                    label={t('common:actions.done')}
                    count={taken}
                    disabled={busy}
                    onPress={() => router.push('/body-check/review')}
                  />
                ) : null
              }
            >
              <ShutterButton
                busy={busy || !ready}
                disabled={!checkId}
                accessibilityLabel={t('camera.shutter')}
                onPress={shutter}
              />
            </CaptureRow>
          </View>
        </>
      )}

      <ShutterFlash opacity={flash.opacity} />
    </View>
  );
}
