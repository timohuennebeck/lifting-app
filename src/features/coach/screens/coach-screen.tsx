import { getCalendars } from 'expo-localization';
import { router, useLocalSearchParams } from 'expo-router';
import type { TFunction } from 'i18next';
import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useExerciseName } from '@/shared/data/exercises';
import { useProfile } from '@/shared/data/profile';
import { QueryFocus } from '@/shared/data/query-focus';
import { useWorkoutStats } from '@/shared/data/workouts';
import { useAppLanguage } from '@/shared/hooks/use-app-language';
import { formatMonthYear, formatShortDate, formatTime } from '@/shared/lib/format';
import { showError } from '@/shared/stores/error-sheet-store';

import { CoachChatView } from '../components/coach-chat-view';
import { CoachStartView } from '../components/coach-start-view';
import { useCoachMessages } from '../data/coach-chats';
import { chartTopic } from '../lib/charts';
import { CoachError, type CoachFailure } from '../lib/coach-client';
import { openCoachChat } from '../lib/open-coach';
import { ask, isAnswering, stopAnswer, useCoachStore } from '../stores/coach-store';

/** The phone's time zone, which decides what "today" and "this week" are in an answer. */
const timeZone = () => getCalendars()[0]?.timeZone ?? 'UTC';

/** The error sheet for a question without an answer; the ones worth another try offer it. */
function showCoachError(
  reason: Exclude<CoachFailure, 'consent' | 'chatGone'>,
  limit: CoachError['limit'],
  t: TFunction<'coach'>,
  retry: () => void,
) {
  const values = limit && {
    count: limit.count,
    time: formatTime(new Date(limit.retryAt)),
    date: formatShortDate(limit.retryAt),
  };
  showError({
    title: t(`errors.${reason}.title`),
    message: t(`errors.${reason}.message`, values ?? {}),
    onRetry: reason === 'offline' || reason === 'failed' ? retry : undefined,
  });
}

/**
 * The coach (design "Coach Screens"), opened from the Training tab's card: the start screen for a
 * new chat, otherwise the chat with the answer in flight below its saved questions and answers.
 * Every chat opened is a screen of its own, so going back leads to where it was opened from.
 */
export function CoachScreen() {
  const { t } = useTranslation('coach');
  const language = useAppLanguage();
  const { profile } = useProfile();
  const params = useLocalSearchParams<{ chat?: string; asker?: string }>();
  const ownId = useId();
  const screenId = params.asker ?? ownId;
  // null: a new chat, until the server names the id of its first question's chat.
  const [chatId, setChatId] = useState(params.chat ?? null);
  const pending = useCoachStore((s) => s.pending);
  const { data: saved } = useCoachMessages(chatId);
  const messages = saved ?? [];
  const { data: workouts } = useWorkoutStats();
  const [draft, setDraft] = useState('');
  // The server found no consent (withdrawn on another device): the line shows again.
  const [consentAsked, setConsentAsked] = useState(false);
  const needsConsent = !profile?.coachConsentAt || consentAsked;

  // The answer in flight belongs to this chat until its saved copy has synced in.
  const synced = messages.some((m) => m.id === pending?.answerId);
  const inThisChat = pending?.chatId === chatId && !synced;
  const pendingHere = inThisChat ? pending : null;
  if (!chatId && pending?.chatId && pending.screen === screenId) setChatId(pending.chatId);
  // Nothing saved and nothing coming: it was deleted, or its first answer failed. A new chat then.
  else if (chatId && saved?.length === 0 && !pendingHere) setChatId(null);
  const answering = isAnswering(pending);
  const starting = !chatId && !pendingHere;
  const lastChart = pendingHere?.chart ?? messages.filter((m) => m.chart).at(-1)?.chart ?? null;
  const exerciseId = lastChart?.type === 'trend' ? lastChart.exerciseId : null;
  const exerciseName = useExerciseName(exerciseId ?? '', language);

  const send = async (text: string) => {
    const question = text.trim();
    // One answer at a time, also across chats.
    if (!question || answering) return;
    setDraft('');
    const result = await ask(
      { question, chatId, consent: needsConsent, language, timeZone: timeZone() },
      screenId,
    );
    if (result === 'answered') setConsentAsked(false);
    // Without an answer the question goes back into the field.
    if (result === 'stopped') setDraft(question);
    if (result instanceof CoachError) {
      setDraft(question);
      if (result.reason === 'consent') setConsentAsked(true);
      // Deleted on another device: the question can go into a new chat.
      else if (result.reason === 'chatGone') setChatId(null);
      else showCoachError(result.reason, result.limit, t, () => void send(question));
    }
  };

  const composer = {
    value: draft,
    onChangeText: setDraft,
    onSend: () => void send(draft),
    answering,
    onStop: stopAnswer,
    consentNote: needsConsent,
  };
  const onHistory = () => router.push('/coach/history');

  let subtitle: string | null = null;
  if (lastChart) subtitle = chartTopic(lastChart, t, exerciseId ? exerciseName : null);
  else if (!messages.length) subtitle = t('newChat');

  const first = workouts?.first ? new Date(workouts.first) : null;
  const since = first && formatMonthYear(first, new Date().getFullYear());

  return (
    <QueryFocus>
      {starting ? (
        <CoachStartView
          workouts={workouts?.count ?? 0}
          since={since}
          onBack={() => router.back()}
          onHistory={onHistory}
          onAsk={(question) => void send(question)}
          composer={composer}
        />
      ) : (
        <CoachChatView
          subtitle={subtitle}
          items={messages}
          pending={pendingHere}
          onBack={() => router.back()}
          onHistory={onHistory}
          onNew={() => openCoachChat(null)}
          composer={composer}
        />
      )}
    </QueryFocus>
  );
}
