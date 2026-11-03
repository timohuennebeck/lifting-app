import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';

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

/**
 * The composer's look for each state (design "Spracheingabe"): empty with the microphone where
 * send goes, typed with both, recording, being written down, and without microphone access. The
 * text grows line by line beside the buttons, up to five lines; the consent line stays above until
 * it is given.
 */
export function CoachComposerView({
  value,
  onChangeText,
  onSend,
  answering,
  onStop,
  consentNote,
  voice,
}: CoachComposerProps & { voice: VoiceInput }) {
  const { t } = useTranslation('coach');
  const typed = value.trim().length > 0;
  const [focused, setFocused] = useState(false);

  let row = (
    <View className="flex-row items-end gap-1 rounded-[26px] bg-chip py-1.5 pr-1.5 pl-[18px]">
      {/* As the support chat's box: the 2pt neon ring while typing. */}
      {focused && !answering ? (
        <View
          pointerEvents="none"
          className="absolute inset-0 rounded-[26px] border-2 border-accent"
        />
      ) : null}
      <TextInput
        value={answering ? '' : value}
        onChangeText={onChangeText}
        editable={!answering}
        multiline
        maxLength={COACH_QUESTION_MAX}
        placeholder={answering ? t('composer.answering') : t('composer.placeholder')}
        placeholderTextColor={colors.dim}
        selectionColor={colors.fg}
        cursorColor={colors.fg}
        keyboardAppearance="dark"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
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
  if (voice.phase === 'recording') row = <RecordingRow voice={voice} />;
  else if (voice.phase === 'transcribing') row = <TranscribingRow />;

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
      <View className="px-3 pt-2">{row}</View>
    </View>
  );
}
