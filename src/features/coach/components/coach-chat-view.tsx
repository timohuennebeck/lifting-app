import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { KeyboardChatScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import type Animated from 'react-native-reanimated';

import { useFooterInset } from '@/shared/hooks/use-footer-inset';
import { ChatHeaderTitle } from '@/shared/ui/chat-header-title';
import { IconButton } from '@/shared/ui/icon-button';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';

import type { CoachChart } from '../lib/charts';
import type { PendingAnswer } from '../stores/coach-store';
import { QuestionBubble } from './answer-text';
import { AnswerSteps } from './answer-steps';
import { CoachAnswer } from './coach-answer';
import { CoachComposer, type CoachComposerProps } from './coach-composer';
import { CoachMark } from './coach-mark';

export interface ChatItem {
  id: string;
  role: 'user' | 'coach';
  content: string;
  chart: CoachChart | null;
}

export interface CoachChatViewProps {
  /** Under "Kai · KI-Coach": what the chat is about; "Neuer Chat" before its first answer. */
  subtitle: string | null;
  items: ChatItem[];
  /** The answer on its way: the question, then the steps, then the text as it streams in. */
  pending: PendingAnswer | null;
  onBack: () => void;
  onHistory: () => void;
  onNew: () => void;
  composer: CoachComposerProps;
}

/**
 * A chat with Kai (design CO3, CO2-F): questions right, answers with their charts left. Laid out
 * like the support chat: the header with who answers, the list, and the field below it.
 */
export function CoachChatView({
  subtitle,
  items,
  pending,
  onBack,
  onHistory,
  onNew,
  composer,
}: CoachChatViewProps) {
  const { t } = useTranslation('coach');
  const footerInset = useFooterInset();
  const scrollRef = useRef<Animated.ScrollView>(null);
  const keyboardOffset = footerInset - 8;
  const rows = items.map((item) =>
    item.role === 'user' ? (
      <QuestionBubble key={item.id} text={item.content} />
    ) : (
      <CoachAnswer key={item.id} text={item.content} chart={item.chart} />
    ),
  );
  // In the same list under the ids they are saved with, so the synced copies take their place
  // without the answer and its chart being drawn anew.
  if (pending) {
    rows.push(<QuestionBubble key={pending.questionId ?? 'question'} text={pending.question} />);
    rows.push(
      pending.text ? (
        <CoachAnswer
          key={pending.answerId ?? 'answer'}
          text={pending.text}
          // The chart waits for the whole text: it comes first from the server, but reads last.
          chart={pending.done ? pending.chart : null}
        />
      ) : (
        <AnswerSteps key="steps" progress={pending.progress} />
      ),
    );
  }
  return (
    <Screen
      header={
        <ScreenHeader
          onBack={onBack}
          className="pt-1.5 pr-4 pb-2.5 pl-4"
          title={
            <ChatHeaderTitle
              avatar={<CoachMark size={28} />}
              title={t('title')}
              subtitle={subtitle}
            />
          }
          action={
            <View className="flex-row gap-2">
              <IconButton
                icon="clock"
                iconSize={18}
                accessibilityLabel={t('history.title')}
                onPress={onHistory}
              />
              <IconButton
                icon="plus"
                iconSize={14}
                accessibilityLabel={t('newChat')}
                onPress={onNew}
              />
            </View>
          }
        />
      }
    >
      <KeyboardChatScrollView
        ref={scrollRef}
        offset={keyboardOffset}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          gap: 20,
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 16,
        }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {rows}
      </KeyboardChatScrollView>
      <KeyboardStickyView offset={{ closed: 0, opened: keyboardOffset }}>
        <View style={{ paddingBottom: footerInset }}>
          <CoachComposer {...composer} />
        </View>
      </KeyboardStickyView>
    </Screen>
  );
}
