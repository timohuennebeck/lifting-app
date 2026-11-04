import { router, useIsFocused, useLocalSearchParams } from 'expo-router';
import { useEffect, useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useExerciseName } from '@/shared/data/exercises';
import { QueryFocus } from '@/shared/data/query-focus';
import { useAppLanguage } from '@/shared/hooks/use-app-language';

import { CoachChatView } from '../components/coach-chat-view';
import { useCoachMessages } from '../data/coach-chats';
import { chartTopic } from '../lib/charts';
import { CoachError, timeZone } from '../lib/coach-client';
import { showCoachError } from '../lib/coach-errors';
import { ask, isAnswering, stopAnswer, useCoachStore } from '../stores/coach-store';

/**
 * The coach's chat (design "Coach Screens"), opened from the Training tab's card or the history:
 * the answer in flight below its saved questions and answers. Every chat opened is a screen of its
 * own, so going back leads to where it was opened from.
 */
export function CoachScreen() {
  const { t } = useTranslation('coach');
  const language = useAppLanguage();
  const params = useLocalSearchParams<{ chat?: string; asker?: string }>();
  const ownId = useId();
  const screenId = params.asker ?? ownId;
  // null: a new chat, until the server names the id of its first question's chat.
  const [chatId, setChatId] = useState(params.chat ?? null);
  const pending = useCoachStore((s) => s.pending);
  const { data: saved } = useCoachMessages(chatId);
  const messages = saved ?? [];
  const [draft, setDraft] = useState('');

  // The answer in flight belongs to this chat until its saved copy has synced in.
  const synced = messages.some((m) => m.id === pending?.answerId);
  const inThisChat = pending?.chatId === chatId && !synced;
  const pendingHere = inThisChat ? pending : null;
  if (!chatId && pending?.chatId && pending.screen === screenId) setChatId(pending.chatId);
  // Nothing saved and nothing coming: it was deleted, or its first answer failed. A new chat then.
  else if (chatId && saved?.length === 0 && !pendingHere) setChatId(null);
  const answering = isAnswering(pending);
  // No chat and nothing coming (its first answer failed, or it is gone): new chats start on the
  // Training tab's card, so this screen goes back.
  const empty = !chatId && !pendingHere;
  const focused = useIsFocused();
  useEffect(() => {
    if (!empty || !focused) return;
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }, [empty, focused]);
  const lastChart = pendingHere?.chart ?? messages.filter((m) => m.chart).at(-1)?.chart ?? null;
  const exerciseId = lastChart?.type === 'trend' ? lastChart.exerciseId : null;
  const exerciseName = useExerciseName(exerciseId ?? '', language);

  const send = async (text: string) => {
    const question = text.trim();
    // One answer at a time, also across chats.
    if (!question || answering) return;
    setDraft('');
    const result = await ask({ question, chatId, language, timeZone: timeZone() }, screenId);
    // Without an answer the question goes back into the field.
    if (result === 'stopped') setDraft(question);
    if (result instanceof CoachError) {
      setDraft(question);
      // Deleted on another device: the question can go into a new chat, on the card.
      if (result.reason === 'chatGone') {
        useCoachStore.setState({ draft: question });
        setChatId(null);
      } else showCoachError(result.reason, result.limit, t, () => void send(question));
    }
  };

  const composer = {
    value: draft,
    onChangeText: setDraft,
    onSend: () => void send(draft),
    answering,
    onStop: stopAnswer,
  };

  let subtitle: string | null = null;
  if (lastChart) subtitle = chartTopic(lastChart, t, exerciseId ? exerciseName : null);
  else if (!messages.length) subtitle = t('newChat');

  return (
    <QueryFocus>
      <CoachChatView
        subtitle={subtitle}
        items={messages}
        pending={pendingHere}
        onBack={() => router.back()}
        composer={composer}
      />
    </QueryFocus>
  );
}
