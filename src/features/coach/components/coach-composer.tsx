import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { ChatInput } from '@/shared/components/chat-input';
import { COACH_QUESTION_MAX } from '@/shared/lib/limits';
import { Text } from '@/shared/ui/text';

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

/** "Frag Kai …" in the support chat's input box, with the consent line above it until given. */
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
      {consentNote ? (
        <Text className="px-6 pt-2 text-center font-inter text-xs leading-4 text-dim">
          {t('consent')}
        </Text>
      ) : null}
      <ChatInput
        value={answering ? '' : value}
        onChangeText={onChangeText}
        editable={!answering}
        placeholder={answering ? t('composer.answering') : t('composer.placeholder')}
        maxLength={COACH_QUESTION_MAX}
        onSend={onSend}
        sendLabel={t('composer.send')}
        canSend={canSend}
        ready={canSend}
        stop={answering ? { label: t('composer.stop'), onPress: onStop } : null}
      />
    </View>
  );
}
