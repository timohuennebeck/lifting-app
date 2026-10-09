import { Image } from 'expo-image';
import { VideoView } from 'expo-video';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { cn } from '@/shared/lib/cn';
import { haptics } from '@/shared/lib/haptics';
import { colors } from '@/shared/lib/theme';
import { Gradient, type GradientStop } from '@/shared/ui/gradient';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { TICK_MS, useCoachPlayback } from '../hooks/use-coach-playback';
import { captionAt, COACH_POSTER } from '../lib/coach-video';
import { ProgressFrame } from './progress-frame';

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
  /** First name for the greeting caption; may be empty. */
  name: string;
}

/** Coach message: video (or poster), captions, controls and a progress line around the frame. */
export function CoachVideo({ active, name }: CoachVideoProps) {
  const { t } = useTranslation('paywall');
  const playback = useCoachPlayback(active);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [captions, setCaptions] = useState(true);
  const [firstFrame, setFirstFrame] = useState(false);

  const cue = captionAt(playback.elapsed);
  const caption =
    cue === 'hello' && !name
      ? t('welcome.captions.helloAnon')
      : t(`welcome.captions.${cue}`, { name });
  const playLabel = t(playback.paused ? 'welcome.a11y.play' : 'welcome.a11y.pause');

  const togglePlay = () => {
    haptics.tap();
    playback.togglePlay();
  };

  return (
    <View
      className="flex-1"
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setSize({ width, height });
      }}
    >
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

        <View pointerEvents="box-none" className="absolute inset-0 items-center justify-center">
          <PressableScale
            haptic="none"
            accessibilityLabel={playLabel}
            onPress={togglePlay}
            className="size-18 items-center justify-center rounded-full bg-elevated"
          >
            {playback.paused ? (
              <Svg width={22} height={24} viewBox="0 0 22 24">
                <Path
                  d="M7 5.6v12.8l10.6-6.4z"
                  fill={colors.fg}
                  stroke={colors.fg}
                  strokeWidth={4}
                  strokeLinejoin="round"
                />
              </Svg>
            ) : (
              <View className="flex-row gap-1.5">
                <View className="h-5.5 w-1.5 rounded-sm bg-fg" />
                <View className="h-5.5 w-1.5 rounded-sm bg-fg" />
              </View>
            )}
          </PressableScale>
        </View>

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
        width={size.width}
        height={size.height}
        radius={27}
        progress={playback.progress}
        tickMs={TICK_MS}
      />
    </View>
  );
}
