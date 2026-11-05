import type { Ref } from 'react';
import { useTranslation } from 'react-i18next';
import { type TextInput, View } from 'react-native';

import { ChatField, ChatFooter } from '@/shared/components/chat-field';
import { useVoiceInput, type VoiceInput, withSpoken } from '@/shared/hooks/use-voice-input';
import { COACH_QUESTION_MAX } from '@/shared/lib/limits';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';

export interface CoachComposerProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  /** While Kai answers: the field rests and the button stops the answer. */
  answering: boolean;
  onStop: () => void;
}

/** The chat's composer: "Frag Kai …" with the microphone, and what voice input says above it. */
export function CoachComposer(props: CoachComposerProps) {
  const voice = useVoiceInput('coach', (said) =>
    props.onChangeText(withSpoken(props.value, said, COACH_QUESTION_MAX)),
  );
  return (
    <ChatFooter voice={voice} fade>
      <CoachField {...props} voice={voice} />
    </ChatFooter>
  );
}

export interface CoachFieldProps extends CoachComposerProps {
  voice: VoiceInput;
  inputRef?: Ref<TextInput>;
  /** While Kai answers, a tap on the resting field leads to the answer. */
  onOpenAnswer?: () => void;
  onFocusChange?: (focused: boolean) => void;
  className?: string;
  /** The corners of the field, also while recording. */
  radiusClassName?: string;
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
  radiusClassName,
}: CoachFieldProps) {
  const { t } = useTranslation('coach');
  const typed = value.trim().length > 0;
  return (
    <ChatField
      voice={voice}
      mic={!answering}
      value={answering ? '' : value}
      onChangeText={onChangeText}
      maxLength={COACH_QUESTION_MAX}
      placeholder={t(answering ? 'composer.answering' : 'composer.placeholder')}
      resting={answering}
      inputRef={inputRef}
      onFocusChange={onFocusChange}
      onPressResting={onOpenAnswer}
      className={className}
      radiusClassName={radiusClassName}
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
        ) : typed ? (
          <PressableScale
            haptic="press"
            accessibilityLabel={t('composer.send')}
            onPress={onSend}
            className="size-10 items-center justify-center rounded-full bg-accent"
          >
            <Icon name="arrow-up" size={16} color={colors.onAccent} />
          </PressableScale>
        ) : null
      }
    />
  );
}
