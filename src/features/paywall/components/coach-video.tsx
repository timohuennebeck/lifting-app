import { Image } from 'expo-image';
import { VideoView } from 'expo-video';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Svg, { Path } from 'react-native-svg';

import { cn } from '@/shared/lib/cn';
import { haptics } from '@/shared/lib/haptics';
import { colors } from '@/shared/lib/theme';
import { Gradient, type GradientStop } from '@/shared/ui/gradient';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { TICK_MS, useCoachPlayback } from '../hooks/use-coach-playback';
import { captionAt, COACH_POSTER, COACH_VIDEO_ASPECT } from '../lib/coach-video';
import { ProgressFrame, progressAt } from './progress-frame';

const SPEAKER = 'M2 5.5h3l4-3.5v12l-4-3.5H2z';

interface SpeakerIconProps {
  muted: boolean;
}

function SpeakerIcon({ muted }: SpeakerIconProps) {
  return (
    <Svg width={18} height={16} viewBox="0 0 18 16">
      <Path d={SPEAKER} fill={colors.fg} />
      <Path
        d={muted ? 'M12 5.5l4 5M16 5.5l-4 5' : 'M12 5a4 4 0 0 1 0 6M14.5 3a7 7 0 0 1 0 10'}
        stroke={colors.fg}
        strokeWidth={1.6}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}

/** Darkens the top (controls) and bottom (captions) of the video. */
const SHADE: GradientStop[] = [
  [0, 0.4],
  [0.22, 0],
  [0.62, 0],
  [1, 0.7],
];

export interface CoachVideoProps {
  /** False while the screen is in the background: playback pauses. */
  active: boolean;
}

/** Corner radius of the progress line's centre. */
const RADIUS = 27;
/** How far in from the frame's edge a touch grabs the progress line. */
const GRAB = 24;
/** The mute and captions buttons in the top right corner, which keep their taps. */
const CONTROLS = { width: 104, height: 60 };

/**
 * Coach message: video (or poster), captions, controls and a progress line around the frame.
 * The frame takes the video's shape, as large as the space allows. Pressing on the line and
 * dragging along it jumps through the video.
 */
export function CoachVideo({ active }: CoachVideoProps) {
  const { t } = useTranslation('paywall');
  const playback = useCoachPlayback(active);
  const [box, setBox] = useState({ width: 0, height: 0 });
  const [captions, setCaptions] = useState(true);
  const [firstFrame, setFirstFrame] = useState(false);

  const width = Math.min(box.width, box.height * COACH_VIDEO_ASPECT);
  const height = width / COACH_VIDEO_ASPECT;
  const caption = t(`welcome.captions.${captionAt(playback.elapsed)}`);
  const playLabel = t(playback.paused ? 'welcome.a11y.play' : 'welcome.a11y.pause');

  const togglePlay = () => {
    haptics.tap();
    playback.togglePlay();
  };

  const onLine = (x: number, y: number) => {
    const nearEdge = x < GRAB || y < GRAB || x > width - GRAB || y > height - GRAB;
    const onControls = x > width - CONTROLS.width && y < CONTROLS.height;
    return nearEdge && !onControls;
  };
  const seek = (x: number, y: number) => playback.scrub(progressAt(x, y, width, height, RADIUS));
  // Only a touch on the line takes over; elsewhere taps go to play/pause and the buttons.
  const scrub = Gesture.Pan()
    .runOnJS(true)
    .manualActivation(true)
    .onTouchesDown((e, manager) => {
      const touch = e.allTouches[0];
      if (touch && onLine(touch.x, touch.y)) manager.activate();
      else manager.fail();
    })
    .onStart((e) => {
      haptics.select();
      seek(e.x, e.y);
    })
    .onUpdate((e) => seek(e.x, e.y))
    .onFinalize(() => playback.endScrub());

  return (
    <View
      className="flex-1 items-center"
      onLayout={(e) => {
        const { width: w, height: h } = e.nativeEvent.layout;
        setBox({ width: w, height: h });
      }}
    >
      <GestureDetector gesture={scrub}>
        <View style={{ width, height }}>
          <View className="absolute inset-1 overflow-hidden rounded-3xl bg-surface">
            {playback.hasVideo ? (
              <VideoView
                player={playback.player}
                contentFit="cover"
                nativeControls={false}
                onFirstFrameRender={() => setFirstFrame(true)}
                style={StyleSheet.absoluteFill}
              />
            ) : null}
            {firstFrame ? null : (
              <Image
                source={COACH_POSTER}
                contentFit="cover"
                contentPosition={{ left: '50%', top: '30%' }}
                style={StyleSheet.absoluteFill}
              />
            )}
            <Gradient from="top" stops={SHADE} />
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={playLabel}
              onPress={togglePlay}
              style={StyleSheet.absoluteFill}
            />

            <View className="absolute top-3 right-3 flex-row gap-2">
              <PressableScale
                accessibilityLabel={t('welcome.a11y.subtitles')}
                accessibilityState={{ selected: captions }}
                onPress={() => setCaptions((c) => !c)}
                className="size-10 items-center justify-center rounded-full bg-elevated"
              >
                <View
                  className={cn(
                    'rounded-sm border-[1.5px] border-fg px-1 py-px',
                    !captions && 'opacity-50',
                  )}
                >
                  <Text variant="caption" className="text-[11px] leading-3.25 tracking-[0.4px]">
                    CC
                  </Text>
                </View>
              </PressableScale>
              <PressableScale
                accessibilityLabel={t(playback.muted ? 'welcome.a11y.unmute' : 'welcome.a11y.mute')}
                onPress={playback.toggleMute}
                className="size-10 items-center justify-center rounded-full bg-elevated"
              >
                <SpeakerIcon muted={playback.muted} />
              </PressableScale>
            </View>

            {/* Only while paused: during playback the face stays clear and a tap anywhere pauses. */}
            {playback.paused ? (
              <View
                pointerEvents="box-none"
                className="absolute inset-0 items-center justify-center"
              >
                <PressableScale
                  haptic="none"
                  accessibilityLabel={playLabel}
                  onPress={togglePlay}
                  className="size-18 items-center justify-center rounded-full bg-elevated"
                >
                  <Svg width={22} height={24} viewBox="0 0 22 24">
                    <Path
                      d="M7 5.6v12.8l10.6-6.4z"
                      fill={colors.fg}
                      stroke={colors.fg}
                      strokeWidth={4}
                      strokeLinejoin="round"
                    />
                  </Svg>
                </PressableScale>
              </View>
            ) : null}

            {captions ? (
              <View pointerEvents="none" className="absolute inset-x-3 bottom-3 items-center">
                <View className="max-w-full rounded-xl bg-bg px-3 py-2">
                  <Text accessibilityLiveRegion="polite" className="text-center text-sm leading-5">
                    {caption}
                  </Text>
                </View>
              </View>
            ) : null}
          </View>

          <ProgressFrame
            width={width}
            height={height}
            radius={RADIUS}
            progress={playback.progress}
            tickMs={playback.scrubbing ? 0 : TICK_MS}
          />
        </View>
      </GestureDetector>
    </View>
  );
}
