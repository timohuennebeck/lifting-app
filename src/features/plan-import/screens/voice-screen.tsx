import { router } from 'expo-router';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, TextInput, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { usePlanFlow } from '@/features/plan-flow/hooks/use-plan-flow';
import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Button } from '@/shared/ui/button';
import { ProgressBar } from '@/shared/ui/progress-bar';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';

import { VoiceButton } from '../components/voice-button';
import { useSpeechInput } from '../hooks/use-speech-input';
import { IMPORT_STEPS, MAX_SPOKEN } from '../lib/plan-import-service';
import { useImportStore } from '../stores/import-store';

/** The import step this screen is, after choosing how to import. */
const STEP = 2;
/** From this length on the text gets smaller, so a whole week still fits. */
const LONG_TEXT = 120;

/**
 * 05c: the plan said out loud. Each tap on the microphone listens until the next one and adds to
 * the text, which can be corrected by hand in between; the plan is then made from it the way an
 * import reads one, so nobody has to look up each exercise.
 */
export function VoiceScreen() {
  const { t, i18n } = useTranslation(['planImport', 'common']);
  const { step } = usePlanFlow();
  const setSpokenPlan = useImportStore((s) => s.setSpokenPlan);
  const speech = useSpeechInput(i18n.language);
  const scroller = useRef<ScrollView>(null);
  const { text, listening } = speech;
  const ready = !listening && !!text.trim();
  const status = listening
    ? t('voice.listening')
    : speech.missed
      ? t('voice.missed')
      : text
        ? t('voice.more')
        : t('voice.tap');

  function create() {
    setSpokenPlan(text.trim());
    router.push(step('/import/reading'));
  }

  return (
    <Screen
      header={
        <>
          <View className="flex-row items-center gap-3.5 px-5 pt-2 pb-1">
            <ProgressBar value={STEP / IMPORT_STEPS} />
            <Text variant="caption" tone="subtle">
              {t('common:progress.stepOf', { current: STEP, total: IMPORT_STEPS })}
            </Text>
          </View>
          <ScreenHeader icon="close" title={t('voice.title')} />
        </>
      }
      // Kept the same height without the button, so the microphone doesn't move when it shows.
      footer={
        <View className="h-15">
          {ready ? (
            <Animated.View entering={FadeIn.duration(200)}>
              <Button label={t('voice.cta')} onPress={create} />
            </Animated.View>
          ) : null}
        </View>
      }
    >
      <View className="flex-1 px-5 pt-5">
        <Text variant="overline" tone="subtle">
          {t('voice.format')}
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
            placeholder={t('voice.example')}
            placeholderTextColor={colors.outline}
            accessibilityLabel={t('voice.a11y.text')}
            keyboardAppearance="dark"
            selectionColor={colors.selection}
            cursorColor={colors.fg}
            textAlignVertical="top"
            className={cn(
              'p-0 font-inter-semibold text-fg',
              text.length > LONG_TEXT ? 'text-xl leading-7' : 'text-[28px] leading-[34px]',
            )}
          />
          {text ? null : (
            <Text variant="paragraph" tone="subtle" className="mt-4 font-inter">
              {t('voice.days')}
            </Text>
          )}
        </ScrollView>
      </View>
      <View className="items-center pt-4 pb-5">
        <VoiceButton
          listening={listening}
          level={speech.level}
          label={status}
          accessibilityLabel={t(listening ? 'voice.a11y.stop' : 'voice.a11y.start')}
          onPress={speech.toggle}
        />
      </View>
    </Screen>
  );
}
