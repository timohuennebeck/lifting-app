import { getCalendars } from 'expo-localization';
import { router } from 'expo-router';
import type { TFunction } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useExerciseName } from '@/shared/data/exercises';
import { useProfile } from '@/shared/data/profile';
import { QueryFocus } from '@/shared/data/query-focus';
import { useAppLanguage } from '@/shared/hooks/use-app-language';
import { formatDate, formatShortDate, formatTime } from '@/shared/lib/format';
import { showError } from '@/shared/stores/error-sheet-store';

import { CoachChatView } from '../components/coach-chat-view';
import { CoachBack } from '../components/coach-header';
import { CoachStartView } from '../components/coach-start-view';
import { useCoachMessages, useCoachWorkouts } from '../data/coach-chats';
import { chartTopic } from '../lib/charts';
import { CoachError } from '../lib/coach-client';
import { ask, openChat, stopAnswer, useCoachStore } from '../stores/coach-store';

/** The phone's time zone, which decides what "today" and "this week" are in an answer. */
const timeZone = () => getCalendars()[0]?.timeZone ?? 'UTC';

/** The error sheet for a question without an answer; the ones worth another try offer it. */
function showCoachError(error: CoachError, t: TFunction<'coach'>, retry: () => void) {
  const { reason, limit } = error;
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
 */
export function CoachScreen() {
  const { t } = useTranslation('coach');
  const language = useAppLanguage();
  const { profile } = useProfile();
  const chatId = useCoachStore((s) => s.chatId);
  const pending = useCoachStore((s) => s.pending);
  const { data: messages = [] } = useCoachMessages(chatId);
  const { data: workouts } = useCoachWorkouts();
  const insets = useSafeAreaInsets();
  const [draft, setDraft] = useState('');

  // The answer in flight belongs to this chat until its saved copy has synced in.
  const synced = messages.some((m) => m.id === pending?.answerId);
  const inThisChat = pending?.chatId === chatId && !synced;
  const pendingHere = inThisChat ? pending : null;
  const answering = !!pending && !pending.done;
  const starting = !chatId && !pendingHere;
  const lastChart = pendingHere?.chart ?? messages.filter((m) => m.chart).at(-1)?.chart ?? null;
  const exerciseId = lastChart?.type === 'trend' ? lastChart.exerciseId : null;
  const exerciseName = useExerciseName(exerciseId ?? '', language);

  const send = async (text: string) => {
    const question = text.trim();
    // One answer at a time, also across chats.
    if (!question || answering) return;
    setDraft('');
    const consent = !profile?.coachConsentAt;
    const result = await ask({ question, consent, language, timeZone: timeZone() });
    // Without an answer the question goes back into the field.
    if (result === 'stopped') setDraft(question);
    if (result instanceof CoachError) {
      setDraft(question);
      showCoachError(result, t, () => void send(question));
    }
  };

  const composer = {
    value: draft,
    onChangeText: setDraft,
    onSend: () => void send(draft),
    answering,
    onStop: stopAnswer,
    consentNote: !profile?.coachConsentAt,
  };
  const onHistory = () => router.push('/coach/history');

  let subtitle: string | null = null;
  if (lastChart) subtitle = chartTopic(lastChart, t, exerciseId ? exerciseName : null);
  else if (!messages.length) subtitle = t('newChat');

  const first = workouts?.first ? new Date(workouts.first) : null;
  const since =
    first &&
    formatDate(first, {
      month: 'long',
      ...(first.getFullYear() !== new Date().getFullYear() && { year: 'numeric' }),
    });

  return (
    <QueryFocus>
      <View className="flex-1 bg-bg">
        {starting ? (
          <CoachStartView
            leading={<CoachBack onPress={() => router.back()} />}
            workouts={workouts?.count ?? 0}
            since={since}
            onHistory={onHistory}
            onAsk={(question) => void send(question)}
            composer={composer}
            bottomInset={insets.bottom}
          />
        ) : (
          <CoachChatView
            subtitle={subtitle}
            items={messages}
            pending={pendingHere}
            onBack={() => router.back()}
            onHistory={onHistory}
            onNew={() => openChat(null)}
            composer={composer}
            bottomInset={insets.bottom}
          />
        )}
      </View>
    </QueryFocus>
  );
}
