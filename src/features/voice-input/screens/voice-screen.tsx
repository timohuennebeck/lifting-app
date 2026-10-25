import { router, Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { MAX_SPOKEN } from '@/features/plan-import/lib/plan-import-service';
import { haptics } from '@/shared/lib/haptics';
import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/button';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';

import { VoiceButton } from '../components/voice-button';
import { VoiceProcessing } from '../components/voice-processing';
import { useSpeechInput } from '../hooks/use-speech-input';
import {
  readSpokenExercises,
  showSpokenFailure,
  type SpokenExercises,
} from '../lib/spoken-exercises';

/** From this length on the text gets smaller, so a long workout still fits. */
const LONG_TEXT = 120;
/** The working stage shows at least this long, even when the exercises come sooner. */
const MIN_PROCESSING_MS = 2500;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));

export interface VoiceScreenProps {
  /** Adds the exercises to the workout being edited; the screen closes once it is done. */
  onAdd: (spoken: SpokenExercises) => Promise<void> | void;
}

/**
 * Exercises said out loud instead of looked up one by one. Each tap on the microphone listens
 * until the next one and adds to the text, which can be corrected by hand in between; "Add"
 * matches them to the catalog with their sets and reps, and hands them to `onAdd`.
 */
export function VoiceScreen({ onAdd }: VoiceScreenProps) {
  const { t, i18n } = useTranslation('voice');
  const speech = useSpeechInput(i18n.language);
  const scroller = useRef<ScrollView>(null);
  const reading = useRef<AbortController | null>(null);
  const [processing, setProcessing] = useState(false);
  const { text, listening } = speech;
  const ready = !listening && !!text.trim();
  const status = listening
    ? t('listening')
    : speech.missed
      ? t('missed')
      : text
        ? t('more')
        : t('tap');

  // Leaving while the exercises are matched drops them.
  useEffect(() => () => reading.current?.abort(), []);

  function add() {
    const controller = new AbortController();
    reading.current = controller;
    setProcessing(true);
    const startedAt = Date.now();
    void readSpokenExercises(text.trim(), i18n.language, controller.signal)
      .then(async (spoken) => {
        await wait(MIN_PROCESSING_MS - (Date.now() - startedAt));
        if (controller.signal.aborted) return;
        await onAdd(spoken);
        haptics.success();
        router.back();
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.warn('Adding spoken exercises failed', error);
        setProcessing(false);
        showSpokenFailure(error);
      });
  }

  if (processing) {
    return (
      <>
        <Stack.Screen options={{ gestureEnabled: false }} />
        <VoiceProcessing />
      </>
    );
  }

  return (
    <Screen
      header={<ScreenHeader icon="close" title={t('title')} />}
      // Kept the same height without the button, so the microphone doesn't move when it shows.
      footer={
        <View className="h-15">
          {ready ? (
            <Animated.View entering={FadeIn.duration(200)}>
              <Button label={t('cta')} onPress={add} />
            </Animated.View>
          ) : null}
        </View>
      }
    >
      <Stack.Screen options={{ gestureEnabled: true }} />
      <View className="flex-1 px-5 pt-5">
        <Text variant="overline" tone="subtle">
          {t('format')}
        </Text>
        <ScrollView
          ref={scroller}
          className="mt-3 flex-1"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
          // While listening the newest words stay in view.
          onContentSizeChange={() => {
            if (listening) scroller.current?.scrollToEnd({ animated: true });
          }}
        >
          <TextInput
            value={text}
            onChangeText={speech.edit}
            editable={!listening}
            multiline
            scrollEnabled={false}
            maxLength={MAX_SPOKEN}
            placeholder={t('example')}
            placeholderTextColor={colors.outline}
            accessibilityLabel={t('a11y.text')}
            keyboardAppearance="dark"
            selectionColor={colors.selection}
            cursorColor={colors.fg}
            textAlignVertical="top"
            className={cn(
              'p-0 font-inter-semibold text-fg',
              text.length > LONG_TEXT ? 'text-xl leading-7' : 'text-[28px] leading-[34px]',
            )}
          />
        </ScrollView>
      </View>
      <View className="items-center pt-4 pb-5">
        <VoiceButton
          listening={listening}
          level={speech.level}
          label={status}
          accessibilityLabel={t(listening ? 'a11y.stop' : 'a11y.start')}
          onPress={speech.toggle}
        />
      </View>
    </Screen>
  );
}
