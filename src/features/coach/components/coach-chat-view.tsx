import { useRef, useState } from 'react';
import { View } from 'react-native';
import { KeyboardChatScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import type Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { CoachChart } from '../lib/charts';
import { QuestionBubble } from './answer-text';
import { type AnswerProgress, AnswerSteps } from './answer-steps';
import { CoachAnswer } from './coach-answer';
import { CoachComposer, type CoachComposerProps } from './coach-composer';
import { CoachBack, CoachHeader } from './coach-header';

/** The composer with one line, and the air between it and the last message (design: 236pt with
 * the tab bar). The list keeps clear of the composer as its field grows. */
const COMPOSER = 18 + 54 + 10;
const ABOVE_COMPOSER = 72;

export interface ChatItem {
  id: string;
  role: 'user' | 'coach';
  content: string;
  chart: CoachChart | null;
}

/** The answer on its way: the question, then the steps, then the text as it streams in. */
export interface PendingAnswer {
  /** Until the saved question syncs back. */
  question: string | null;
  text: string;
  chart: CoachChart | null;
  progress: AnswerProgress;
}

export interface CoachChatViewProps {
  /** Under "Kai · KI-Coach": what the chat is about; "Neuer Chat" before its first answer. */
  subtitle: string | null;
  items: ChatItem[];
  pending: PendingAnswer | null;
  onBack: () => void;
  onHistory: () => void;
  onNew: () => void;
  composer: CoachComposerProps;
  /** What the home indicator covers at the bottom. */
  bottomInset: number;
}

/** A chat with the coach (design CO3, CO2-F): questions right, answers with their charts left. */
export function CoachChatView({
  subtitle,
  items,
  pending,
  onBack,
  onHistory,
  onNew,
  composer,
  bottomInset,
}: CoachChatViewProps) {
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<Animated.ScrollView>(null);
  const [composerHeight, setComposerHeight] = useState(COMPOSER);
  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <CoachHeader
        leading={<CoachBack onPress={onBack} />}
        subtitle={subtitle}
        onHistory={onHistory}
        onNew={onNew}
      />
      <KeyboardChatScrollView
        ref={scrollRef}
        offset={bottomInset}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          gap: 20,
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: bottomInset + composerHeight + ABOVE_COMPOSER,
        }}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {items.map((item) =>
          item.role === 'user' ? (
            <QuestionBubble key={item.id} text={item.content} />
          ) : (
            <CoachAnswer key={item.id} text={item.content} chart={item.chart} />
          ),
        )}
        {pending?.question ? <QuestionBubble text={pending.question} /> : null}
        {pending ? (
          pending.text ? (
            <CoachAnswer text={pending.text} chart={pending.chart} />
          ) : (
            <AnswerSteps progress={pending.progress} />
          )
        ) : null}
      </KeyboardChatScrollView>
      <KeyboardStickyView
        offset={{ closed: 0, opened: bottomInset }}
        style={{ position: 'absolute', left: 0, right: 0, bottom: bottomInset }}
        onLayout={(e) => setComposerHeight(e.nativeEvent.layout.height)}
      >
        <CoachComposer {...composer} />
      </KeyboardStickyView>
    </View>
  );
}
