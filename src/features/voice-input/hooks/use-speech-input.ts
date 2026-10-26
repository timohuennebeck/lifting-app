import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { useEffect, useRef, useState } from 'react';
import { Keyboard, Linking, Platform } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';

import { i18n } from '@/shared/i18n';
import { clamp } from '@/shared/lib/math';
import { resetAudioMode } from '@/shared/lib/sounds';
import { showError } from '@/shared/stores/error-sheet-store';

import {
  addResult,
  continueTranscript,
  EMPTY_TRANSCRIPT,
  type Transcript,
  transcriptText,
} from '../lib/transcript';

/** Recognition locales of the app languages. */
const LOCALES: Record<string, string> = {
  de: 'de-DE',
  en: 'en-US',
  'pt-PT': 'pt-PT',
  'pt-BR': 'pt-BR',
  ko: 'ko-KR',
};

/** Errors that only mean nothing (more) was heard: the text stays as it is. */
const QUIET = new Set(['aborted', 'no-speech', 'speech-timeout', 'interrupted']);
/** Of those, the ones after which iOS listening goes on by itself (a call or Siri ends it). */
const GOES_ON = new Set(['no-speech', 'speech-timeout']);
/** A recognition that ends this soon after it started failed to start; a few in a row end it. */
const QUICK_END_MS = 2000;
const MAX_QUICK_ENDS = 3;

/** Lets other apps' audio go on (music pauses while listening); app sounds set theirs anew. */
function releaseAudio() {
  resetAudioMode();
  if (Platform.OS !== 'ios') return;
  try {
    ExpoSpeechRecognitionModule.setAudioSessionActiveIOS(false, {
      notifyOthersOnDeactivation: true,
    });
  } catch (error) {
    console.warn('Releasing the audio session failed', error);
  }
}

/**
 * No microphone or speech recognition access. While the system can still ask, the next tap on
 * the microphone does; once it was refused for good, only Settings can allow it.
 */
function showNoAccess(canAskAgain: boolean) {
  const settings = {
    action: {
      label: i18n.t('common:actions.openSettings'),
      onPress: () => void Linking.openSettings(),
    },
    dismissLabel: i18n.t('common:actions.notNow'),
  };
  showError({
    title: i18n.t('voice:errors.access.title'),
    message: i18n.t('voice:errors.access.message'),
    ...(canAskAgain ? {} : settings),
  });
}

function showUnavailable(offline: boolean) {
  const key = offline ? 'network' : 'unavailable';
  showError({
    title: i18n.t(`voice:errors.${key}.title`),
    message: i18n.t(`voice:errors.${key}.message`),
  });
}

/**
 * Speech to text for the voice input, in the app language. Each recognition adds to the text,
 * which can be edited in between; `level` (0–1) follows the voice's volume while listening.
 * On iOS it listens until stopped, also with the app in the background (audio background mode):
 * a recognition iOS ends by itself (after about a minute) is followed by the next, with the
 * audio session kept, so the app isn't suspended. Leaving the screen ends it.
 */
export function useSpeechInput(language: string) {
  const [transcript, setTranscript] = useState<Transcript>(EMPTY_TRANSCRIPT);
  const [listening, setListening] = useState(false);
  /** A recognition ran since the text was last edited. */
  const [ran, setRan] = useState(false);
  const running = useRef(false);
  /** Listening until the user stops it (iOS): a recognition that ends is followed by another. */
  const goingOn = useRef(false);
  const startedAt = useRef(0);
  const quickEnds = useRef(0);
  const level = useSharedValue(0);

  /** One recognition, adding to the text so far. */
  function listen() {
    startedAt.current = Date.now();
    setTranscript(continueTranscript);
    ExpoSpeechRecognitionModule.start({
      lang: LOCALES[language] ?? 'en-US',
      interimResults: true,
      // Runs until stopped, through the pauses between exercises.
      continuous: true,
      addsPunctuation: true,
      iosTaskHint: 'dictation',
      volumeChangeEventOptions: { enabled: true, intervalMillis: 100 },
    });
  }

  useSpeechRecognitionEvent('result', (event) => {
    const said = event.results[0]?.transcript ?? '';
    setTranscript((t) => addResult(t, said, event.isFinal));
  });
  useSpeechRecognitionEvent('volumechange', ({ value }) => {
    // From -2 to 10, below 0 is silence; speaking stays below 8.
    level.set(withTiming(clamp(value / 8, 0, 1), { duration: 120 }));
  });
  useSpeechRecognitionEvent('error', ({ error, message }) => {
    if (!GOES_ON.has(error)) goingOn.current = false;
    if (QUIET.has(error)) return;
    console.warn(`Speech recognition failed: ${error}`, message);
    if (error === 'not-allowed') showNoAccess(false);
    else showUnavailable(error === 'network');
  });
  useSpeechRecognitionEvent('end', () => {
    const quick = Date.now() - startedAt.current < QUICK_END_MS;
    quickEnds.current = quick ? quickEnds.current + 1 : 0;
    if (goingOn.current && quickEnds.current < MAX_QUICK_ENDS) {
      listen();
      return;
    }
    goingOn.current = false;
    running.current = false;
    setListening(false);
    level.set(withTiming(0, { duration: 200 }));
    releaseAudio();
  });

  useEffect(
    () => () => {
      goingOn.current = false;
      if (running.current) ExpoSpeechRecognitionModule.abort();
    },
    [],
  );

  async function start() {
    if (running.current) return;
    // Taken while the system asks for access, so a second tap doesn't start another.
    running.current = true;
    const access = await ExpoSpeechRecognitionModule.requestPermissionsAsync().catch(() => null);
    if (!access?.granted) {
      running.current = false;
      showNoAccess(!!access?.canAskAgain);
      return;
    }
    Keyboard.dismiss();
    // Android beeps at every start, so a recognition that ends stays ended there.
    goingOn.current = Platform.OS === 'ios';
    quickEnds.current = 0;
    setRan(true);
    setListening(true);
    listen();
  }

  function stop() {
    goingOn.current = false;
    ExpoSpeechRecognitionModule.stop();
  }

  const heard = !!transcript.final || !!transcript.partial;
  return {
    text: transcriptText(transcript),
    listening,
    /** The last recognition ended without hearing anything. */
    missed: ran && !listening && !heard,
    level,
    /** Starts listening, or stops and keeps what was said. */
    toggle: () => (listening ? stop() : void start()),
    /** The text as typed; only while not listening. */
    edit: (text: string) => {
      setTranscript({ ...EMPTY_TRANSCRIPT, before: text });
      setRan(false);
    },
  };
}
