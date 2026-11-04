import { type Ref, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, TextInput, View } from 'react-native';
import Animated, { FadeInDown, FadeOutUp } from 'react-native-reanimated';

import {
  MicButton,
  RecordingRow,
  TranscribingRow,
  VoiceInputNotes,
} from '@/shared/components/voice-input';
import { useAppLanguage } from '@/shared/hooks/use-app-language';
import { useVoiceInput, type VoiceInput, withSpoken } from '@/shared/hooks/use-voice-input';
import { COACH_QUESTION_MAX } from '@/shared/lib/limits';
import { colors } from '@/shared/lib/theme';
import { CharCount } from '@/shared/ui/char-count';
import { Gradient } from '@/shared/ui/gradient';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

/** How far above the field the content fades out. */
const FADE = 28;
/** An example question moves up as it changes. */
const HINT_IN = FadeInDown.duration(400).withInitialValues({ transform: [{ translateY: 10 }] });
const HINT_OUT = FadeOutUp.duration(400);

export interface CoachComposerProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  /** While Kai answers: the field rests and the button stops the answer. */
  answering: boolean;
  onStop: () => void;
  /** Before the first question: sending it is the consent, so the line says so. */
  consentNote: boolean;
}

/** "Frag Kai …" with the microphone; it records, writes down what was said and adds it. */
export function CoachComposer(props: CoachComposerProps) {
  const language = useAppLanguage();
  const voice = useVoiceInput(language, 'coach', (said) =>
    props.onChangeText(withSpoken(props.value, said, COACH_QUESTION_MAX)),
  );
  return <CoachComposerView {...props} voice={voice} />;
}

export interface CoachFieldProps extends Omit<CoachComposerProps, 'consentNote'> {
  voice: VoiceInput;
  inputRef?: Ref<TextInput>;
  /** An example question over the empty field, instead of the placeholder until it is tapped. */
  hint?: string;
  /** While Kai answers, a tap on the resting field leads to the answer. */
  onOpenAnswer?: () => void;
  onFocusChange?: (focused: boolean) => void;
}

/**
 * The field's look for each state (design "Spracheingabe"): empty with the microphone where send
 * goes, typed with both, recording and being written down. The text grows line by line beside the
 * buttons, up to five lines.
 */
export function CoachField({
  value,
  onChangeText,
  onSend,
  answering,
  onStop,
  voice,
  inputRef,
  hint,
  onOpenAnswer,
  onFocusChange,
}: CoachFieldProps) {
  const { t } = useTranslation('coach');
  const typed = value.trim().length > 0;
  const [focused, setFocused] = useState(false);
  const setFieldFocused = (next: boolean) => {
    setFocused(next);
    onFocusChange?.(next);
  };
  const hintShown = !!hint && !value && !focused && !answering;

  if (voice.phase === 'recording') return <RecordingRow voice={voice} />;
  if (voice.phase === 'transcribing') return <TranscribingRow />;

  return (
    <View className="flex-row items-end gap-1 rounded-[26px] bg-chip py-1.5 pr-1.5 pl-[18px]">
      {/* As the support chat's box: the 2pt neon ring while typing. */}
      {focused && !answering ? (
        <View
          pointerEvents="none"
          className="absolute inset-0 rounded-[26px] border-2 border-accent"
        />
      ) : null}
      {hintShown ? (
        // Beside the 40pt button and 6pt inset, with some air before it.
        <View
          pointerEvents="none"
          importantForAccessibility="no-hide-descendants"
          className="absolute top-1.5 right-14 bottom-1.5 left-[18px] overflow-hidden"
        >
          <Animated.Text
            key={hint}
            entering={HINT_IN}
            exiting={HINT_OUT}
            numberOfLines={1}
            className="absolute inset-x-0 top-2.5 font-inter text-sm leading-5 text-dim"
          >
            {hint}
          </Animated.Text>
        </View>
      ) : null}
      {answering && onOpenAnswer ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('composer.answering')}
          onPress={onOpenAnswer}
          className="absolute top-0 right-14 bottom-0 left-0 z-10"
        />
      ) : null}
      <TextInput
        ref={inputRef}
        accessibilityLabel={t('composer.placeholder')}
        value={answering ? '' : value}
        // Spaces and empty lines before the text count as nothing, so the placeholder stays.
        onChangeText={(text) => onChangeText(text.trimStart())}
        editable={!answering}
        multiline
        maxLength={COACH_QUESTION_MAX}
        placeholder={answering ? t('composer.answering') : t('composer.placeholder')}
        // Clear under an example question: iOS doesn't bring back a placeholder taken away.
        placeholderTextColor={hintShown ? 'transparent' : colors.dim}
        selectionColor={colors.fg}
        cursorColor={colors.fg}
        keyboardAppearance="dark"
        onFocus={() => setFieldFocused(true)}
        onBlur={() => setFieldFocused(false)}
        textAlignVertical="center"
        className="max-h-32 min-h-10 min-w-0 flex-1 py-[9px] font-inter text-base leading-[22px] text-fg"
      />
      <View>
        <CharCount length={value.length} max={COACH_QUESTION_MAX} className="pb-1" />
        <View className="flex-row items-center justify-end gap-1">
          {answering ? (
            <PressableScale
              haptic="press"
              accessibilityLabel={t('composer.stop')}
              onPress={onStop}
              className="size-10 items-center justify-center rounded-full bg-fg"
            >
              <View className="size-3 rounded-[3px] bg-bg" />
            </PressableScale>
          ) : (
            <>
              <MicButton voice={voice} alone={!typed} />
              {typed ? (
                <PressableScale
                  haptic="press"
                  accessibilityLabel={t('composer.send')}
                  onPress={onSend}
                  className="size-10 items-center justify-center rounded-full bg-accent"
                >
                  <Icon name="arrow-up" size={16} color={colors.onAccent} />
                </PressableScale>
              ) : null}
            </>
          )}
        </View>
      </View>
    </View>
  );
}

/** The chat's composer: the field, and above it the consent line until it is given. */
export function CoachComposerView({
  consentNote,
  voice,
  ...field
}: CoachComposerProps & { voice: VoiceInput }) {
  const { t } = useTranslation('coach');
  return (
    // Solid, as the chat runs on behind it while the keyboard is open.
    <View className="bg-bg">
      {/* The chat above fades into the page instead of ending at a hard edge. */}
      <Gradient
        from="bottom"
        style={{ position: 'absolute', left: 0, right: 0, top: -FADE, height: FADE }}
      />
      {consentNote ? (
        <Text className="px-6 pt-2 text-center font-inter text-xs leading-4 text-dim">
          {t('consent')}
        </Text>
      ) : null}
      <VoiceInputNotes voice={voice} />
      <View className="px-3 pt-2">
        <CoachField {...field} voice={voice} />
      </View>
    </View>
  );
}
