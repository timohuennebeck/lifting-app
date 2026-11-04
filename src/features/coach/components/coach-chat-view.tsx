import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { KeyboardChatScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import type Animated from 'react-native-reanimated';

import { useFooterInset } from '@/shared/hooks/use-footer-inset';
import { ChatHeaderTitle } from '@/shared/ui/chat-header-title';
import { CoachMark } from '@/shared/ui/coach-mark';
import { Gradient } from '@/shared/ui/gradient';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';

import type { CoachChart } from '../lib/charts';
import type { PendingAnswer } from '../stores/coach-store';
import { QuestionBubble } from './answer-text';
import { AnswerThinking } from './answer-thinking';
import { CoachAnswer } from './coach-answer';
import { CoachComposer, type CoachComposerProps } from './coach-composer';

/** How far under the header the chat fades out, and where its first row starts at rest. */
const FADE = 28;

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
  /** The answer on its way: the question, that Kai is thinking, then the text as it streams in. */
  pending: PendingAnswer | null;
  onBack: () => void;
  composer: CoachComposerProps;
}

/**
 * A chat with Kai (design CO3): questions right, answers with their charts left. Laid out
 * like the support chat: the header with who answers, the list, and the field below it.
 */
export function CoachChatView({ subtitle, items, pending, onBack, composer }: CoachChatViewProps) {
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
        <AnswerThinking key="thinking" />
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
          paddingTop: FADE,
          paddingBottom: 16,
        }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {rows}
      </KeyboardChatScrollView>
      <Gradient from="top" size={FADE} />
      <KeyboardStickyView offset={{ closed: 0, opened: keyboardOffset }}>
        <View className="bg-bg" style={{ paddingBottom: footerInset }}>
          <CoachComposer {...composer} />
        </View>
      </KeyboardStickyView>
    </Screen>
  );
}
