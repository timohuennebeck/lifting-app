import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { KeyboardChatScrollView, KeyboardStickyView } from 'react-native-keyboard-controller';
import type Animated from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFooterInset } from '@/shared/hooks/use-footer-inset';
import { IconButton } from '@/shared/ui/icon-button';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { Text } from '@/shared/ui/text';

import type { CoachChart } from '../lib/charts';
import { QuestionBubble } from './answer-text';
import { type AnswerProgress, AnswerSteps } from './answer-steps';
import { CoachAnswer } from './coach-answer';
import { CoachComposer, type CoachComposerProps } from './coach-composer';
import { CoachMark } from './coach-mark';

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
  const insets = useSafeAreaInsets();
  const footerInset = useFooterInset();
  const scrollRef = useRef<Animated.ScrollView>(null);
  const keyboardOffset = footerInset - 8;
  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <ScreenHeader
        onBack={onBack}
        className="pt-1.5 pr-4 pb-2.5 pl-4"
        title={
          <View className="flex-row items-center gap-3">
            <CoachMark size={28} />
            <View className="min-w-0 flex-1">
              <Text variant="bodyStrong" numberOfLines={1} className="text-base leading-5">
                {t('title')}
              </Text>
              {subtitle ? (
                <Text numberOfLines={1} className="font-inter text-xs text-subtle">
                  {subtitle}
                </Text>
              ) : null}
            </View>
          </View>
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
      <KeyboardStickyView offset={{ closed: 0, opened: keyboardOffset }}>
        <View style={{ paddingBottom: footerInset }}>
          <CoachComposer {...composer} />
        </View>
      </KeyboardStickyView>
    </View>
  );
}
