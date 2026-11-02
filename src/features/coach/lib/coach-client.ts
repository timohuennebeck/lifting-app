import { fetch } from 'expo/fetch';

import { env } from '@/shared/config/env';
import { supabase } from '@/shared/data/supabase';

import type { CoachChart } from './charts';

/** Why there is no answer; each has its own message in coach.json (errors). */
export type CoachFailure =
  'offline' | 'limitDaily' | 'limitMonthly' | 'failed' | 'refused' | 'tooYoung' | 'notPro';

/** The function's error codes that have their own message. */
const REFUSALS: Record<string, CoachFailure> = { too_young: 'tooYoung', not_pro: 'notPro' };

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
  // expo/fetch, unlike React Native's own fetch, hands over the answer while it arrives.
  const response = await fetch(`${env.supabaseUrl}/functions/v1/coach-chat`, {
    method: 'POST',
    headers: {
      apikey: env.supabasePublishableKey,
      Authorization: `Bearer ${data.session.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
    signal,
  }).catch((error: unknown) => {
    if (!signal.aborted) console.warn('coach-chat could not be called', error);
    throw new CoachError('offline');
  });
  if (!response.ok || !response.body) {
    const text = await response.text().catch(() => '');
    console.warn(`coach-chat answered ${response.status}: ${text.slice(0, 300)}`);
    throw failureOf(response.status, parseBody(text));
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { value, done } = await reader.read().catch((error: unknown) => {
      if (!signal.aborted) console.warn('coach-chat broke off', error);
      throw new CoachError('offline');
    });
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    // Server-sent events: one `data:` line each, separated by a blank line.
    let end: number;
    while ((end = buffer.indexOf('\n\n')) >= 0) {
      const line = buffer.slice(0, end);
      buffer = buffer.slice(end + 2);
      if (!line.startsWith('data:')) continue;
      const event = JSON.parse(line.slice(5)) as
        CoachEvent | { type: 'done' } | { type: 'error'; error: string };
      if (event.type === 'done') return;
      if (event.type === 'error') {
        throw new CoachError(event.error === 'refused' ? 'refused' : 'failed');
      }
      onEvent(event);
    }
  }
  // Ended without "done": the function stopped halfway.
  throw new CoachError('failed');
}

function parseBody(text: string): ErrorBody {
  try {
    return JSON.parse(text) as ErrorBody;
  } catch {
    return {};
  }
}
