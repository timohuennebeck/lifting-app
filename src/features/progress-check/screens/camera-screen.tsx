import { CameraView } from 'expo-camera';
import { useKeepAwake } from 'expo-keep-awake';
import { router, useIsFocused } from 'expo-router';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFooterInset } from '@/shared/hooks/use-footer-inset';
import { useHardwareBack } from '@/shared/hooks/use-hardware-back';
import { cn } from '@/shared/lib/cn';
import { haptics } from '@/shared/lib/haptics';
import { playSound, preloadSounds } from '@/shared/lib/sounds';
import { showError } from '@/shared/stores/error-sheet-store';
import { CameraPermission } from '@/shared/ui/camera/camera-permission';
import {
  CameraSideButton,
  CaptureRow,
  DonePill,
  ShutterButton,
} from '@/shared/ui/camera/capture-controls';
import { ShutterFlash, useShutterFlash } from '@/shared/ui/camera/shutter-flash';
import { useCameraScreenPermission } from '@/shared/ui/camera/use-camera-screen-permission';
import { Gradient, type GradientStop } from '@/shared/ui/gradient';
import { IconButton } from '@/shared/ui/icon-button';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { CountdownNumber, FlipCameraIcon, FramingCorners } from '../components/camera-chrome';
import { PoseStrip } from '../components/pose-strip';
import { ShotView } from '../components/shot-view';
import { useCloseCheck } from '../hooks/use-close-check';
import { assessPhoto } from '../lib/progress-check-service';
import { deleteFile, storeShot } from '../lib/photo-files';
import { POSES, type Pose, type TimerSeconds } from '../lib/poses';
import {
  hasAllShots,
  startProgressCheck,
  useProgressCheckStore,
} from '../stores/progress-check-store';

/** Design offsets (390×844 frame) of the framing corners above the controls. */
const FRAME_TOP = 74;
const FRAME_BOTTOM = 228;
/** Bottom scrim behind the controls: solid for its first 30 %, then fading out. */
const BOTTOM_SCRIM: GradientStop[] = [
  [0, 0.85],
  [0.3, 0.85],
  [1, 0],
];

const TIMER_SOUNDS = { 3: 'photoTimer3', 10: 'photoTimer10' } as const;
/** Auto: time between two photos to turn to the next pose, before its countdown starts. */
const TURN_MS = 5000;

/**
 * 08a: full-screen camera that walks through the three poses, with self-timer. The timer sound
 * ticks the countdown and clicks when the photo is taken; with Auto on, one tap takes them all.
 * A taken photo's thumbnail shows it full screen to check or retake; "Fertig" (all three, there
 * or next to the shutter) starts the assessment, which sends photos it can't judge back here.
 */
export function CameraScreen() {
  const { t } = useTranslation(['progressCheck', 'common']);
  // The phone lies still while the timer runs: it would lock in the middle of the photos.
  useKeepAwake();
  const insets = useSafeAreaInsets();
  const footerInset = useFooterInset();
  const focused = useIsFocused();
  // Read after the async capture: the user may have left the camera meanwhile.
  const focusedRef = useRef(focused);
  useEffect(() => {
    focusedRef.current = focused;
  }, [focused]);
  const close = useCloseCheck();
  const shots = useProgressCheckStore((s) => s.shots);
  const viewPose = useProgressCheckStore((s) => s.viewPose);
  // A taken photo shown full screen over the (paused) camera.
  const viewShot = viewPose ? shots[viewPose] : undefined;
  // Android back closes a shown photo; on the flow's first screen it would otherwise drop the
  // modal without asking.
  useHardwareBack(() => (viewShot ? useProgressCheckStore.getState().view(null) : close()));
  const [permission, requestPermission] = useCameraScreenPermission();
  const camera = useRef<CameraView>(null);
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [count, setCount] = useState(0);
  // Auto: the pause after a photo while the user turns to the next pose.
  const [turning, setTurning] = useState(false);
  const checkId = useProgressCheckStore((s) => s.checkId);
  const pose = useProgressCheckStore((s) => s.pose);
  const timer = useProgressCheckStore((s) => s.timer);
  const retaking = useProgressCheckStore((s) => s.retaking);
  // Retaking one photo: just that one, whatever Auto says.
  const auto = useProgressCheckStore((s) => s.auto) && !retaking;
  const facing = useProgressCheckStore((s) => s.facing);
  // When the running countdown ends, and how to silence its sound if it's cancelled.
  const countdownEndsAt = useRef(0);
  const stopTimerSound = useRef<(() => void) | null>(null);
  const flash = useShutterFlash();
  const taken = POSES.filter((p) => shots[p]).length;
  // Every pose taken and none the assessment sent back: "Fertig" starts the assessment.
  const finished = hasAllShots(shots) && !POSES.some((p) => shots[p]?.rejected);

  const assess = () => router.push('/progress-check/assessment');

  const removeShot = (p: Pose) => useProgressCheckStore.getState().removeShot(p);

  // A thumbnail with a photo shows it; an empty one is the pose to shoot next.
  const selectPose = (p: Pose) => {
    const store = useProgressCheckStore.getState();
    if (store.shots[p]) store.view(p);
    else store.setPose(p);
  };

  // Opened without a running check (e.g. deep link): start one.
  useEffect(() => {
    if (!useProgressCheckStore.getState().checkId) startProgressCheck();
  }, []);

  // Loaded ahead so the countdown sound starts in step; silenced when the camera closes.
  useEffect(() => {
    preloadSounds('photoTimer3', 'photoTimer10');
    return () => stopTimerSound.current?.();
  }, []);

  function startCountdown(seconds: Exclude<TimerSeconds, 0>) {
    haptics.tap();
    countdownEndsAt.current = Date.now() + seconds * 1000;
    stopTimerSound.current = playSound(TIMER_SOUNDS[seconds]);
    setCount(seconds);
  }

  function cancelCountdown() {
    stopTimerSound.current?.();
    stopTimerSound.current = null;
    setCount(0);
    setTurning(false);
  }

  const endTurn = useEffectEvent(() => {
    setTurning(false);
    const { timer: seconds } = useProgressCheckStore.getState();
    if (focused && seconds) startCountdown(seconds);
  });

  useEffect(() => {
    if (!turning) return;
    const id = setTimeout(endTurn, TURN_MS);
    return () => clearTimeout(id);
  }, [turning]);

  /** `timed`: the timer sound already clicked, so the camera's own shutter sound stays off. */
  async function capture(timed: boolean) {
    const store = useProgressCheckStore.getState();
    if (!camera.current || !store.checkId || busy) return;
    const target = store.pose;
    const id = store.checkId;
    const wasRetaking = store.retaking;
    setBusy(true);
    haptics.heavy();
    flash.fire();
    const take = async (view: CameraView) => {
      const pic = await view.takePictureAsync({ quality: 0.9, shutterSound: !timed });
      const stored = await storeShot(pic, id, target);
      const issue = await assessPhoto(stored);
      const current = useProgressCheckStore.getState();
      // The check was closed while the photo was processed.
      if (current.checkId !== id) return deleteFile(stored.uri);
      if (issue) haptics.warning();
      // A retaken photo shows full screen right away (the store selects it).
      current.addShot(target, { ...stored, issue });
      const next = useProgressCheckStore.getState();
      const complete = hasAllShots(next.shots);
      // Auto: a pause to turn to the next missing pose (already selected), then its countdown.
      if (next.auto && next.timer && !complete && !wasRetaking && focusedRef.current) {
        setTurning(true);
      }
    };
    // A promise chain, not try/finally: the React Compiler can't compile a component with that, nor
    // with a condition like Auto's inside a try.
    await take(camera.current)
      .catch((error) => {
        console.warn('Progress-check photo failed', error);
        showError({ title: t('camera.error.title'), message: t('camera.error.message') });
      })
      .finally(() => setBusy(false));
  }

  const tick = useEffectEvent(() => {
    // Leaving the screen (the assessment opened on top) cancels the countdown.
    if (!focused) return cancelCountdown();
    if (count > 1) {
      haptics.tap();
      setCount(count - 1);
      return;
    }
    stopTimerSound.current = null;
    setCount(0);
    void capture(true);
  });

  useEffect(() => {
    if (count <= 0) return;
    // Every step is due at a fixed time from the start, so the photo is taken right on the
    // timer sound's shutter click instead of drifting with each render.
    const due = countdownEndsAt.current - (count - 1) * 1000;
    const id = setTimeout(tick, Math.max(0, due - Date.now()));
    return () => clearTimeout(id);
  }, [count]);

  function shutter() {
    if (busy) return;
    if (count > 0 || turning) {
      haptics.select();
      cancelCountdown();
      return;
    }
    if (!timer) return void capture(false);
    startCountdown(timer);
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
        active={focused && !viewShot}
        onCameraReady={() => setReady(true)}
        onMountError={() =>
          showError({
            title: t('camera.unavailable.title'),
            message: t('camera.unavailable.message'),
          })
        }
      />
      <Gradient from="top" size={200} color="black" opacity={0.6} />
      <Gradient from="bottom" size={300} color="black" stops={BOTTOM_SCRIM} />

      {count > 0 || turning ? (
        // Countdown (or Auto's pause to turn): the pose, the number and a stop button; a tap
        // anywhere cancels.
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('camera.cancelTimer')}
          onPress={shutter}
          style={StyleSheet.absoluteFill}
        >
          {turning ? null : (
            <Text
              variant="caption"
              tone="accent"
              className="absolute inset-x-0 text-center font-inter-semibold text-[13px] tracking-[1.6px] uppercase"
              style={{ top: insets.top + 18 }}
            >
              {t(`poses.${pose}.name`)}
            </Text>
          )}
          <View
            pointerEvents="none"
            className="absolute items-center justify-center"
            style={frame}
            accessibilityLiveRegion="assertive"
          >
            {turning ? (
              <Animated.View entering={FadeIn.duration(200)} className="items-center gap-2 px-6">
                <Text
                  variant="caption"
                  tone="secondary"
                  className="font-inter-semibold tracking-[1.6px] uppercase"
                >
                  {t('camera.turn.next')}
                </Text>
                <Text className="text-center font-inter-semibold text-[44px] leading-12 text-accent">
                  {t(`poses.${pose}.name`)}
                </Text>
                <Text variant="paragraph" tone="secondary" className="text-center">
                  {t(`camera.turn.${pose}`)}
                </Text>
              </Animated.View>
            ) : (
              <Animated.View key={count} entering={FadeIn.duration(160)}>
                <CountdownNumber value={count} />
              </Animated.View>
            )}
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
              {/* Retaking one photo: no Auto, it would only ever take that one. */}
              {retaking ? null : (
                <PressableScale
                  haptic="select"
                  accessibilityRole="switch"
                  accessibilityLabel={t('camera.autoA11y')}
                  accessibilityState={{ checked: auto }}
                  onPress={() => useProgressCheckStore.getState().toggleAuto()}
                  className={cn(
                    'mr-2 h-10.5 justify-center rounded-full px-3.5',
                    auto ? 'bg-accent' : 'bg-elevated',
                  )}
                >
                  <Text variant="caption" tone={auto ? 'onAccent' : 'default'}>
                    {t('camera.auto')}
                  </Text>
                </PressableScale>
              )}
              <PressableScale
                haptic="select"
                accessibilityLabel={t('camera.timerA11y')}
                onPress={() => useProgressCheckStore.getState().cycleTimer()}
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
            <PoseStrip shots={shots} active={pose} onSelect={selectPose} onRemove={removeShot} />
            <CaptureRow
              start={
                <CameraSideButton
                  haptic="select"
                  accessibilityLabel={t('camera.flip')}
                  onPress={() => useProgressCheckStore.getState().toggleFacing()}
                >
                  <FlipCameraIcon />
                </CameraSideButton>
              }
              end={
                finished ? (
                  <DonePill
                    label={t('common:actions.done')}
                    count={taken}
                    disabled={busy}
                    onPress={assess}
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
            {/* "Fertig" sends the photos to the assessment: this says where they go. */}
            {finished ? (
              <Text variant="caption" tone="subtle" className="-mt-2 px-8 text-center font-inter">
                {t('camera.consent', { done: t('common:actions.done') })}
              </Text>
            ) : null}
          </View>
        </>
      )}

      {viewPose && viewShot ? (
        <ShotView
          pose={viewPose}
          shot={viewShot}
          strip={
            <PoseStrip
              shots={shots}
              active={viewPose}
              onSelect={selectPose}
              onRemove={removeShot}
              viewing
            />
          }
          onClose={() => useProgressCheckStore.getState().view(null)}
          onRetake={() => useProgressCheckStore.getState().retake(viewPose)}
          canFinish={finished && !busy}
          onFinish={assess}
        />
      ) : null}

      <ShutterFlash opacity={flash.opacity} />
    </View>
  );
}
