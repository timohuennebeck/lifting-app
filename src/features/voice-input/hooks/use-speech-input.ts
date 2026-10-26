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
 * Leaving the screen ends a recognition still running.
 */
export function useSpeechInput(language: string) {
  const [transcript, setTranscript] = useState<Transcript>(EMPTY_TRANSCRIPT);
  const [listening, setListening] = useState(false);
  /** A recognition ran since the text was last edited. */
  const [ran, setRan] = useState(false);
  const running = useRef(false);
  const level = useSharedValue(0);

  useSpeechRecognitionEvent('result', (event) => {
    const said = event.results[0]?.transcript ?? '';
    setTranscript((t) => addResult(t, said, event.isFinal));
  });
  useSpeechRecognitionEvent('volumechange', ({ value }) => {
    // From -2 to 10, below 0 is silence; speaking stays below 8.
    level.set(withTiming(clamp(value / 8, 0, 1), { duration: 120 }));
  });
  useSpeechRecognitionEvent('error', ({ error, message }) => {
    if (QUIET.has(error)) return;
    console.warn(`Speech recognition failed: ${error}`, message);
    if (error === 'not-allowed') showNoAccess(false);
    else showUnavailable(error === 'network');
  });
  useSpeechRecognitionEvent('end', () => {
    running.current = false;
    setListening(false);
    level.set(withTiming(0, { duration: 200 }));
    releaseAudio();
  });

  useEffect(
    () => () => {
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
    setTranscript(continueTranscript);
    setRan(true);
    setListening(true);
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

  const heard = !!transcript.final || !!transcript.partial;
  return {
    text: transcriptText(transcript),
    listening,
    /** The last recognition ended without hearing anything. */
    missed: ran && !listening && !heard,
    level,
    /** Starts listening, or stops and keeps what was said. */
    toggle: () => (listening ? ExpoSpeechRecognitionModule.stop() : void start()),
    /** The text as typed; only while not listening. */
    edit: (text: string) => {
      setTranscript({ ...EMPTY_TRANSCRIPT, before: text });
      setRan(false);
    },
  };
}
