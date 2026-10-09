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

/**
 * Coach video state. With a source, time and duration come from expo-video;
 * without one, a looping timer of `COACH_FALLBACK_SECONDS` stands in.
 * Playback only runs while `active` (screen focused) and not paused by the user.
 */
export function useCoachPlayback(active: boolean) {
  const hasVideo = COACH_VIDEO_SOURCE != null;
  const player = useVideoPlayer(COACH_VIDEO_SOURCE, configure);
  const [paused, setPaused] = useState(false);
  const [muted, setMutedState] = useState(true);
  const [clock, setClock] = useState({ elapsed: 0, duration: COACH_FALLBACK_SECONDS });
  const playing = active && !paused;

  useEventListener(player, 'timeUpdate', ({ currentTime }) => {
    // A source-less player can still tick with 0s; the timer owns the clock then.
    if (!hasVideo) return;
    setClock({ elapsed: currentTime, duration: player.duration || COACH_FALLBACK_SECONDS });
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
    togglePlay: () => setPaused((p) => !p),
    toggleMute: () => setMutedState((m) => !m),
  };
}
