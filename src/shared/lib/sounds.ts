import { type AudioPlayer, createAudioPlayer, setAudioModeAsync } from 'expo-audio';

const SOURCES = {
  /** Three soft ticks, then the chime at 3.0 s. */
  restEnd: require('@/assets/sounds/rest-end.wav'),
  /** Ticks each second, the shutter click at 3.0 s. */
  photoTimer3: require('@/assets/sounds/photo-timer-3s.wav'),
  /** Ticks each second, the shutter click at 10.0 s. */
  photoTimer10: require('@/assets/sounds/photo-timer-10s.wav'),
} as const;

export type SoundName = keyof typeof SOURCES;

const players: Partial<Record<SoundName, AudioPlayer>> = {};
let audioMode: Promise<void> | null = null;

function playerFor(name: SoundName) {
  // Cues also play with the phone on silent, and mix with music instead of pausing it.
  audioMode ??= setAudioModeAsync({
    playsInSilentMode: true,
    interruptionMode: 'mixWithOthers',
    shouldPlayInBackground: false,
  }).catch((error) => console.warn('Setting the audio mode failed', error));
  players[name] ??= createAudioPlayer(SOURCES[name]);
  return players[name];
}

/** Loads sounds ahead, so the first one starts on time (e.g. in step with a countdown). */
export function preloadSounds(...names: SoundName[]) {
  names.forEach(playerFor);
}

/** Plays a sound from `fromSeconds` into it; returns a function that stops it again. */
export function playSound(name: SoundName, fromSeconds = 0) {
  const player = playerFor(name);
  void player.seekTo(fromSeconds);
  player.play();
  return () => player.pause();
}
