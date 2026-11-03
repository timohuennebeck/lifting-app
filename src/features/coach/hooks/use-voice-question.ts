import {
  AudioQuality,
  getRecordingPermissionsAsync,
  IOSOutputFormat,
  type RecordingOptions,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
} from 'expo-audio';
import { File } from 'expo-file-system';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { AppState, Keyboard } from 'react-native';

import { i18n } from '@/shared/i18n';
import { clamp } from '@/shared/lib/math';
import { resetAudioMode } from '@/shared/lib/sounds';
import { showError } from '@/shared/stores/error-sheet-store';

import {
  TranscribeError,
  type TranscribeFailure,
  transcribeQuestion,
} from '../lib/transcribe-client';

/** Speech is all the transcription needs: mono AAC at 16 kHz, about 4 KB a second. */
const RECORDING: RecordingOptions = {
  extension: '.m4a',
  sampleRate: 16000,
  numberOfChannels: 1,
  bitRate: 32000,
  isMeteringEnabled: true,
  android: { outputFormat: 'mpeg4', audioEncoder: 'aac' },
  ios: { outputFormat: IOSOutputFormat.MPEG4AAC, audioQuality: AudioQuality.MEDIUM },
  web: { mimeType: 'audio/webm' },
};
const TICK_MS = 100;
/** Levels kept for the wave: more than the widest field shows. */
const HISTORY = 80;
/** A question is at most this long; then the recording is written down by itself. */
export const MAX_RECORDING_MS = 120_000;
/** This long without speaking brings up the hint that nothing is heard. */
const SILENCE_MS = 2000;
/** Shorter than this was a slip of the finger: there is nothing to write down. */
const MIN_RECORDING_MS = 600;
/** A level above this is someone speaking, below it the room. */
export const SPEAKING = 0.2;

/** The recorder's metering (dB, about -55 in a quiet room, -10 loud) as a level from 0 to 1. */
const levelOf = (db: number | undefined) => (db === undefined ? 0 : clamp((db + 55) / 45, 0, 1));

export type VoicePhase = 'idle' | 'recording' | 'transcribing';

function showFailure(reason: TranscribeFailure | 'empty') {
  // Pro and the age are the coach's own refusals, with its texts.
  if (reason === 'notPro' || reason === 'tooYoung') {
    showError({
      title: i18n.t(`coach:errors.${reason}.title`),
      message: i18n.t(`coach:errors.${reason}.message`),
    });
    return;
  }
  showError({
    title: i18n.t(`coach:voice.errors.${reason}.title`),
    message: i18n.t(`coach:voice.errors.${reason}.message`),
  });
}

function deleteRecording(uri: string | null) {
  if (!uri) return;
  try {
    new File(uri).delete();
  } catch (error) {
    console.warn('Deleting the recording failed', error);
  }
}

/** Lets the microphone go, so app sounds and other apps' audio play as before. */
async function releaseMicrophone() {
  await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(
    (error: unknown) => console.warn('Releasing the microphone failed', error),
  );
  resetAudioMode();
}

/**
 * A spoken question for the coach's field (design "Spracheingabe"): records with the levels for
 * the wave and the time, notices silence, and has the recording written down; the text goes to
 * `onText`. `denied` stays up until access is given in the settings. Leaving the screen drops
 * a recording.
 */
export function useVoiceQuestion(language: string, onText: (text: string) => void) {
  const recorder = useAudioRecorder(RECORDING);
  const [phase, setPhase] = useState<VoicePhase>('idle');
  const [levels, setLevels] = useState<readonly number[]>([]);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [silent, setSilent] = useState(false);
  const [denied, setDenied] = useState(false);
  /** Taken from the tap on the microphone until the text is back: taps in between do nothing. */
  const busy = useRef(false);
  const recording = useRef(false);
  const loudAt = useRef(0);
  const latestOnText = useRef(onText);
  useEffect(() => {
    latestOnText.current = onText;
  });

  async function stopRecording() {
    recording.current = false;
    await recorder
      .stop()
      .catch((error: unknown) => console.warn('Stopping the recording failed', error));
    await releaseMicrophone();
    return recorder.uri;
  }

  async function beginRecording() {
    try {
      await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
      resetAudioMode();
      await recorder.prepareToRecordAsync();
      recorder.record();
      return true;
    } catch (error) {
      console.warn('Starting the recording failed', error);
      return false;
    }
  }

  async function start() {
    if (busy.current) return;
    busy.current = true;
    const access = await requestRecordingPermissionsAsync().catch(() => null);
    if (!access || !access.granted) {
      busy.current = false;
      setDenied(true);
      return;
    }
    setDenied(false);
    Keyboard.dismiss();
    if (!(await beginRecording())) {
      busy.current = false;
      await releaseMicrophone();
      showFailure('failed');
      return;
    }
    recording.current = true;
    loudAt.current = Date.now();
    setLevels([]);
    setElapsedMs(0);
    setSilent(false);
    setPhase('recording');
  }

  /** ✕: the recording is dropped. */
  async function cancel() {
    if (!recording.current) return;
    setPhase('idle');
    deleteRecording(await stopRecording());
    busy.current = false;
  }

  /** ✓ (or the time is up): the recording is written down and goes to `onText`. */
  async function finish() {
    if (!recording.current) return;
    const { durationMillis } = recorder.getStatus();
    if (durationMillis < MIN_RECORDING_MS) {
      await cancel();
      return;
    }
    setPhase('transcribing');
    const uri = await stopRecording();
    const text = uri
      ? await transcribeQuestion(uri, language).catch((error: unknown) =>
          error instanceof TranscribeError ? error : new TranscribeError('failed'),
        )
      : new TranscribeError('failed');
    deleteRecording(uri);
    busy.current = false;
    setPhase('idle');
    if (text instanceof TranscribeError) showFailure(text.reason);
    else if (!text) showFailure('empty');
    else latestOnText.current(text);
  }

  const tick = useEffectEvent(() => {
    const status = recorder.getStatus();
    const level = levelOf(status.metering);
    const now = Date.now();
    if (level > SPEAKING) loudAt.current = now;
    setLevels((shown) => [...shown.slice(1 - HISTORY), level]);
    setElapsedMs(status.durationMillis);
    setSilent(now - loudAt.current > SILENCE_MS);
    if (status.durationMillis >= MAX_RECORDING_MS) void finish();
  });
  useEffect(() => {
    if (phase !== 'recording') return;
    const id = setInterval(() => tick(), TICK_MS);
    return () => clearInterval(id);
  }, [phase]);

  // Back from the settings with access given: the hint goes.
  useEffect(() => {
    if (!denied) return;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state !== 'active') return;
      getRecordingPermissionsAsync().then(
        (access) => access.granted && setDenied(false),
        () => {},
      );
    });
    return () => subscription.remove();
  }, [denied]);

  // Leaving the screen while recording drops the recording.
  useEffect(
    () => () => {
      if (!recording.current) return;
      recording.current = false;
      void recorder
        .stop()
        .catch(() => {})
        .then(() => {
          deleteRecording(recorder.uri);
          return releaseMicrophone();
        });
    },
    [recorder],
  );

  return { phase, levels, elapsedMs, silent, denied, start, cancel, finish };
}
