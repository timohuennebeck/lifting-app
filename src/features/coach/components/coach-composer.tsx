import { useTranslation } from 'react-i18next';
import { TextInput, View } from 'react-native';

import { cn } from '@/shared/lib/cn';
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

/** "Frag Kai …" in one rounded line with the send arrow, the consent line above it until given. */
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
    <View>
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
      <View className="px-3 pt-2">
        <View className="flex-row items-center gap-2 rounded-full bg-chip py-1.5 pr-1.5 pl-[18px]">
          <TextInput
            value={answering ? '' : value}
            onChangeText={onChangeText}
            editable={!answering}
            maxLength={COACH_QUESTION_MAX}
            placeholder={answering ? t('composer.answering') : t('composer.placeholder')}
            placeholderTextColor={colors.dim}
            selectionColor={colors.fg}
            cursorColor={colors.fg}
            keyboardAppearance="dark"
            returnKeyType="send"
            onSubmitEditing={() => {
              if (canSend) onSend();
            }}
            className="h-10 min-w-0 flex-1 py-0 font-inter text-base text-fg"
          />
          <PressableScale
            haptic="press"
            accessibilityLabel={answering ? t('composer.stop') : t('composer.send')}
            accessibilityState={{ disabled: !answering && !canSend }}
            disabled={!answering && !canSend}
            onPress={answering ? onStop : onSend}
            className={cn(
              'size-10 items-center justify-center rounded-full',
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
    </View>
  );
}
