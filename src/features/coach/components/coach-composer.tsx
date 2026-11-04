import type { Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { type TextInput, View } from 'react-native';

import { ChatField } from '@/shared/components/chat-field';
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

export interface CoachFieldProps extends Omit<CoachComposerProps, 'consentNote'> {
  voice: VoiceInput;
  inputRef?: Ref<TextInput>;
  /** While Kai answers, a tap on the resting field leads to the answer. */
  onOpenAnswer?: () => void;
  onFocusChange?: (focused: boolean) => void;
  className?: string;
}

/**
 * Kai's field, in the chat and on the Training card: the box chats share with the microphone where
 * send goes when empty, both once typed, and stop while Kai answers (design "Spracheingabe").
 */
export function CoachField({
  value,
  onChangeText,
  onSend,
  answering,
  onStop,
  voice,
  inputRef,
  onOpenAnswer,
  onFocusChange,
  className,
}: CoachFieldProps) {
  const { t } = useTranslation('coach');
  const typed = value.trim().length > 0;

  if (voice.phase === 'recording') return <RecordingRow voice={voice} />;
  if (voice.phase === 'transcribing') return <TranscribingRow />;

  return (
    <ChatField
      value={answering ? '' : value}
      onChangeText={onChangeText}
      maxLength={COACH_QUESTION_MAX}
      placeholder={t(answering ? 'composer.answering' : 'composer.placeholder')}
      resting={answering}
      inputRef={inputRef}
      onFocusChange={onFocusChange}
      onPressResting={onOpenAnswer}
      className={className}
      actions={
        answering ? (
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
        )
      }
    />
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
