import { useEventListener } from 'expo';
import { useVideoPlayer, type VideoPlayer } from 'expo-video';
import { useEffect, useState } from 'react';

import { COACH_FALLBACK_SECONDS, COACH_VIDEO_SOURCE } from '../lib/coach-video';

/** Playback clock resolution; the ring animates linearly between ticks. */
export const TICK_MS = 250;

// Player props are mutated through helpers so the React Compiler keeps hook values immutable.
function configure(player: VideoPlayer) {
  player.loop = true;
  player.muted = true;
  player.timeUpdateEventInterval = TICK_MS / 1000;
}
function setMuted(player: VideoPlayer, muted: boolean) {
  player.muted = muted;
}
function seekTo(player: VideoPlayer, seconds: number) {
  player.currentTime = seconds;
}

/** Scrubbing stops just short of the end, where the looping video would start over. */
const MAX_SCRUB = 0.995;

/**
 * Coach video state. With a source, time and duration come from expo-video;
 * without one, a looping timer of `COACH_FALLBACK_SECONDS` stands in.
 * Playback only runs while `active` (screen focused), not paused by the user and not scrubbed.
 */
export function useCoachPlayback(active: boolean) {
  const hasVideo = COACH_VIDEO_SOURCE != null;
  const player = useVideoPlayer(COACH_VIDEO_SOURCE, configure);
  const [paused, setPaused] = useState(false);
  const [muted, setMutedState] = useState(true);
  const [scrubbing, setScrubbing] = useState(false);
  const [clock, setClock] = useState({ elapsed: 0, duration: COACH_FALLBACK_SECONDS });
  const playing = active && !paused && !scrubbing;

  useEventListener(player, 'timeUpdate', ({ currentTime }) => {
    // A source-less player can still tick with 0s; the timer owns the clock then.
    if (!hasVideo) return;
    setClock({ elapsed: currentTime, duration: player.duration || COACH_FALLBACK_SECONDS });
  });

  // Starts on its own: play() before the file has loaded can be dropped, so retry once it's ready.
  useEventListener(player, 'statusChange', ({ status }) => {
    if (hasVideo && playing && status === 'readyToPlay') player.play();
  });

  useEffect(() => {
    if (!hasVideo) return;
    if (playing) player.play();
    else player.pause();
  }, [hasVideo, playing, player]);

  useEffect(() => {
    if (hasVideo) setMuted(player, muted);
  }, [hasVideo, muted, player]);

  useEffect(() => {
    if (hasVideo || !playing) return;
    let last = Date.now();
    const id = setInterval(() => {
      const now = Date.now();
      const step = (now - last) / 1000;
      last = now;
      setClock((c) => ({ ...c, elapsed: (c.elapsed + step) % c.duration }));
    }, TICK_MS);
    return () => clearInterval(id);
  }, [hasVideo, playing]);

  return {
    player,
    hasVideo,
    elapsed: clock.elapsed,
    progress: Math.min(1, clock.elapsed / clock.duration),
    paused,
    muted,
    scrubbing,
    togglePlay: () => setPaused((p) => !p),
    toggleMute: () => setMutedState((m) => !m),
    /** Jumps to `fraction` (0–1) of the video; playback holds until `endScrub`. */
    scrub: (fraction: number) => {
      setScrubbing(true);
      const elapsed = Math.min(Math.max(fraction, 0), MAX_SCRUB) * clock.duration;
      if (hasVideo) seekTo(player, elapsed);
      setClock((c) => ({ ...c, elapsed }));
    },
    endScrub: () => setScrubbing(false),
  };
}
