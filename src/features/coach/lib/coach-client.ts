import { getCalendars } from 'expo-localization';

import { postFunction, refusalOf } from '@/shared/data/edge-functions';
import { supabase } from '@/shared/data/supabase';
import { readServerEvents } from '@/shared/lib/server-events';

import type { CoachChart } from './charts';

/** The phone's time zone, which decides what "today" and "this week" are in an answer. */
export const timeZone = () => getCalendars()[0]?.timeZone ?? 'UTC';

/** Why there is no answer; each has its own message in coach.json (errors). */
export type CoachFailure =
  | 'offline'
  | 'limitDaily'
  | 'limitMonthly'
  | 'failed'
  | 'refused'
  | 'tooYoung'
  | 'notPro'
  /** The consent was withdrawn (e.g. on another device): the next question asks again. */
  | 'consent'
  /** The chat was deleted (e.g. on another device). */
  | 'chatGone';

/** The function's error codes that have their own message. */
const REFUSALS: Record<string, CoachFailure> = {
  too_young: 'tooYoung',
  not_pro: 'notPro',
  consent_required: 'consent',
  chat_not_found: 'chatGone',
};

export class CoachError extends Error {
  constructor(
    readonly reason: CoachFailure,
    /** With a limit: how many questions it allows, and when the next is possible again (ISO). */
    readonly limit: { count: number; retryAt: string } | null = null,
  ) {
    super(`The coach did not answer: ${reason}`);
  }
}

/** What coach-chat streams while it answers (Event in supabase/functions/coach-chat). */
export type CoachEvent =
  /** First: the ids the saved chat, question and answer get. */
  | { type: 'start'; chatId: string; questionId: string; answerId: string }
  | { type: 'searched'; of: 'workouts' | 'weights' | 'checks'; count: number }
  | { type: 'found'; chart: CoachChart | null }
  | { type: 'text'; text: string }
  /** The text so far wasn't the answer: drop it. */
  | { type: 'reset' };

export interface CoachQuestion {
  question: string;
  /** null: a new chat. */
  chatId: string | null;
  /** Sent while the consent notice shows: this question is the consent. */
  consent: boolean;
  language: string;
  timeZone: string;
}

interface ErrorBody {
  error?: string;
  limit?: string;
  count?: number;
  retryAt?: string;
}

/** The function's refusals before it answers, by its error code. */
function failureOf(status: number, body: ErrorBody) {
  if (status === 429 && body.error === 'limit' && body.count && body.retryAt) {
    return new CoachError(body.limit === 'monthly' ? 'limitMonthly' : 'limitDaily', {
      count: body.count,
      retryAt: body.retryAt,
    });
  }
  return new CoachError(REFUSALS[body.error ?? ''] ?? 'failed');
}

/**
 * Asks the coach-chat Edge Function, which streams the answer as server-sent events; `onEvent`
 * gets each. Resolves once the answer is saved. Throws a CoachError with the reason when there is
 * no answer, also when the stream breaks off; once `signal` stops it, the error doesn't matter.
 */
export async function streamAnswer(
  input: CoachQuestion,
  onEvent: (event: CoachEvent) => void,
  signal: AbortSignal,
) {
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new CoachError('failed');
  const response = await postFunction('coach-chat', input, {
    signal,
    token: data.session.access_token,
    offline: () => new CoachError('offline'),
  });
  if (!response.ok || !response.body) {
    throw failureOf(response.status, await refusalOf<ErrorBody>('coach-chat', response));
  }

  const done = await readServerEvents<
    CoachEvent | { type: 'done' } | { type: 'error'; error: string }
  >(
    response.body,
    (event) => {
      if (event.type === 'done') return true;
      if (event.type === 'error') {
        throw new CoachError(event.error === 'refused' ? 'refused' : 'failed');
      }
      onEvent(event);
    },
    (error) => {
      if (!signal.aborted) console.warn('coach-chat broke off', error);
      throw new CoachError('offline');
    },
  );
  // Ended without "done": the function stopped halfway.
  if (!done) throw new CoachError('failed');
}
