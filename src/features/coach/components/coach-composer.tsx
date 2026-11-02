import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { COACH_QUESTION_MAX } from '@/shared/lib/limits';
import { colors } from '@/shared/lib/theme';
import { Gradient, type GradientStop } from '@/shared/ui/gradient';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

/** Content scrolling under the field fades out: clear at the top, solid from 40 % down. */
const FADE: GradientStop[] = [
  [0, 1],
  [0.6, 1],
  [1, 0],
];

export interface CoachComposerProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  /** While the coach answers: the field rests and the button stops the answer. */
  answering: boolean;
  onStop: () => void;
  /** Before the first question: sending it is the consent, so the line says so. */
  consentNote: boolean;
}

/** "Frag deinen Coach …" with the send arrow, over a fade (design "Coach Screens"). */
export function CoachComposer({
  value,
  onChangeText,
  onSend,
  answering,
  onStop,
  consentNote,
}: CoachComposerProps) {
  const { t } = useTranslation('coach');
  const canSend = !answering && value.trim().length > 0;
  return (
    <View className="px-4 pt-[18px] pb-2.5">
      <Gradient from="bottom" stops={FADE} color={colors.bg} />
      {consentNote ? (
        <Text className="mb-2.5 px-3 text-center font-inter text-xs leading-4 text-dim">
          {t('consent')}
        </Text>
      ) : null}
      <View className="flex-row items-center gap-2 rounded-full border border-control bg-chip py-1.5 pr-1.5 pl-[18px]">
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
          submitBehavior="blurAndSubmit"
          returnKeyType="send"
          onSubmitEditing={onSend}
          // Grows with its text up to four lines, then scrolls.
          className="max-h-[100px] flex-1 py-[10px] font-inter text-label leading-5 text-fg"
        />
        <PressableScale
          haptic="press"
          accessibilityLabel={answering ? t('composer.stop') : t('composer.send')}
          accessibilityState={{ disabled: !answering && !canSend }}
          disabled={!answering && !canSend}
          onPress={answering ? onStop : onSend}
          className={cn(
            'size-10 items-center justify-center self-end rounded-full',
            answering ? 'bg-fg' : canSend ? 'bg-accent' : 'bg-control',
          )}
        >
          {answering ? (
            <View className="size-3 rounded-[3px] bg-bg" />
          ) : (
            <Icon name="arrow-up" size={16} color={canSend ? colors.onAccent : colors.dim} />
          )}
        </PressableScale>
      </View>
    </View>
  );
}
