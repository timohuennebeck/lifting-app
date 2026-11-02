// The AI coach's chat (README, "Coach"). The app sends a question; this function checks the user
// (signed in, 16+, consent, Pro, limits), lets the coach answer from the user's data and streams
// the answer back as server-sent events: the design's steps, the chart and the text. Only a
// complete answer is saved, with its question (coach_chats, coach_messages); PowerSync brings
// both to the app. Every question takes a row in coach_runs first, which the limits count.
import { ageFrom, hasPro } from '../_shared/account.ts';
import { askCoach, type CoachEvent, type CoachUsage } from '../_shared/coach/chat.ts';
import { type CoachUser, dayIn } from '../_shared/coach/data.ts';
import {
  coachData,
  coachProfile,
  coachTurns,
  type HistoryRow,
  type MessageRow,
  type ProfileRow,
} from '../_shared/coach/load.ts';
import { contextText } from '../_shared/coach/prompt.ts';
import { admin, isUuid, refuseAiRequest, reply, requestUser } from '../_shared/common.ts';
import { eventStream } from '../_shared/event-stream.ts';
import { LANGUAGES } from '../_shared/plan-events.ts';

/** The app's COACH_QUESTION_MAX (src/shared/lib/limits.ts), as the database checks it. */
const QUESTION_MAX = 500;
/** Training and body data go to OpenAI on the user's own consent: from 16 (GDPR, Germany). */
const MIN_AGE = 16;
const setting = (name: string, fallback: string) => Deno.env.get(name) || fallback;
const MODEL = setting('OPENAI_COACH_MODEL', 'gpt-6.1-sol');
const EFFORT = setting('OPENAI_COACH_REASONING_EFFORT', 'low');
const FAST = setting('COACH_FAST', 'true') !== 'false';
const DAILY_LIMIT = Number(setting('COACH_DAILY_LIMIT', '20'));
const MONTHLY_LIMIT = Number(setting('COACH_MONTHLY_LIMIT', '150'));
const TIMEOUT_MS = 60_000;
/** Earlier questions the model reads back with their answers and tool calls. */
const HISTORY_TURNS = 6;
/** The answers are a few sentences; the database takes up to 2,000 characters. */
const ANSWER_MAX = 2000;

/** What the app streams back, after the coach's own events. */
type Event =
  | CoachEvent
  /** First: the ids the saved chat and messages will have, so the app can swap them in. */
  | { type: 'start'; chatId: string; questionId: string; answerId: string }
  /** The answer is complete and saved. */
  | { type: 'done' }
  | { type: 'error'; error: 'failed' | 'refused' };

interface Job {
  userId: string;
  runId: string;
  question: string;
  /** null: a new chat. */
  chatId: string | null;
  profile: ProfileRow;
  timeZone: string;
  language: string;
}

/** The phone's time zone, which decides what "today" and "this week" are; UTC if unknown. */
function timeZoneOf(value: unknown) {
  if (typeof value !== 'string' || !value) return 'UTC';
  try {
    new Intl.DateTimeFormat('en', { timeZone: value });
    return value;
  } catch {
    return 'UTC';
  }
}

const usageColumns = (usage: CoachUsage, ms: number) => ({
  model: MODEL,
  fast: usage.fast > 0,
  input: usage.input,
  cached: usage.cached,
  output: usage.output,
  ms,
});

const logUsage = (usage: CoachUsage, ms: number) =>
  console.log(
    `coach: ${usage.requests} requests (${usage.fast} fast), ${usage.input} in ` +
      `(${usage.cached} cached), ${usage.output} out, ${ms} ms`,
  );

/** Ends a run that didn't save an answer; its slot stays used (OpenAI may have billed it). */
async function finishRun(runId: string, status: 'failed' | 'refused', usage?: CoachUsage, ms = 0) {
  const columns = usage ? usageColumns(usage, ms) : null;
  await admin
    .from('coach_runs')
    .update({
      status,
      ...(columns && {
        model: columns.model,
        fast: columns.fast,
        input_tokens: columns.input,
        cached_tokens: columns.cached,
        output_tokens: columns.output,
        ms,
      }),
    })
    .eq('id', runId);
}

/** Gives the slot back: nothing reached OpenAI's model. */
const giveBack = (runId: string) => admin.from('coach_runs').delete().eq('id', runId);

async function answer(job: Job, send: (event: Event) => void, signal: AbortSignal) {
  const askedAt = new Date();
  const chatId = job.chatId ?? crypto.randomUUID();
  const questionId = crypto.randomUUID();
  const answerId = crypto.randomUUID();
  send({ type: 'start', chatId, questionId, answerId });

  const planId = job.profile.active_plan_id;
  const [history, plan, recent] = await Promise.all([
    admin.rpc('coach_history', { p_user_id: job.userId }),
    planId
      ? admin.from('plans').select('name, sessions_per_week').eq('id', planId).maybeSingle()
      : Promise.resolve({ data: null }),
    job.chatId
      ? admin
          .from('coach_messages')
          .select('id, role, content')
          .eq('chat_id', job.chatId)
          .order('created_at', { ascending: false })
          .limit(HISTORY_TURNS * 2)
      : Promise.resolve({ data: [] as MessageRow[], error: null }),
  ]);
  if (history.error || recent.error) {
    console.error('Reading the coach data failed', history.error ?? recent.error);
    await giveBack(job.runId);
    return send({ type: 'error', error: 'failed' });
  }
  const messages = ((recent.data ?? []) as MessageRow[]).reverse();
  const answerIds = messages.filter((m) => m.role === 'coach').map((m) => m.id);
  const { data: runs } = answerIds.length
    ? await admin.from('coach_runs').select('answer_id, calls').in('answer_id', answerIds)
    : { data: [] };

  const data = coachData(history.data as HistoryRow, job.language, job.timeZone);
  const user: CoachUser = {
    today: dayIn(askedAt.toISOString(), job.timeZone),
    timeZone: job.timeZone,
    units: job.profile.unit_preference,
    language: job.language,
  };
  const started = performance.now();
  const reply = await askCoach({
    question: job.question,
    history: coachTurns(messages, runs ?? []),
    context: contextText(user, coachProfile(job.profile, plan.data), data),
    data,
    user,
    model: MODEL,
    effort: EFFORT,
    fast: FAST,
    timeoutMs: TIMEOUT_MS,
    signal,
    onEvent: send,
  });
  const ms = Math.round(performance.now() - started);
  logUsage(reply.usage, ms);

  if ('error' in reply) {
    console.error('The coach did not answer', reply.error, reply.detail ?? '');
    if (reply.error === 'upstream' && reply.usage.requests === 0) await giveBack(job.runId);
    else
      await finishRun(job.runId, reply.error === 'refused' ? 'refused' : 'failed', reply.usage, ms);
    return send({ type: 'error', error: reply.error === 'refused' ? 'refused' : 'failed' });
  }
  // Stopped after the model was done: nothing is saved, as the app has put the question back.
  if (signal.aborted) return finishRun(job.runId, 'failed', reply.usage, ms);
  const { error } = await admin.rpc('save_coach_answer', {
    p_run_id: job.runId,
    p_user_id: job.userId,
    p_chat_id: chatId,
    p_new_chat: !job.chatId,
    p_question_id: questionId,
    p_question: job.question,
    p_asked_at: askedAt.toISOString(),
    p_answer_id: answerId,
    p_answer: reply.answer.slice(0, ANSWER_MAX),
    p_chart: reply.chart,
    p_calls: reply.calls,
    p_usage: usageColumns(reply.usage, ms),
  });
  if (error) {
    console.error('Saving the coach answer failed', error);
    await finishRun(job.runId, 'failed', reply.usage, ms);
    return send({ type: 'error', error: 'failed' });
  }
  send({ type: 'done' });
}

/** The answer as server-sent events; cancelling (the app went away) stops the model too. */
function eventResponse(job: Job) {
  return eventStream<Event>(
    (send, signal) => answer(job, send, signal),
    async (error, send, aborted) => {
      if (!aborted) console.error('The coach broke off', error);
      await finishRun(job.runId, 'failed');
      send({ type: 'error', error: 'failed' });
    },
  );
}

Deno.serve(async (req) => {
  const refused = refuseAiRequest(req);
  if (refused) return refused;
  const userId = (await requestUser(req))?.id;
  if (!userId) return reply(401, { error: 'unauthorized' });

  const body = await req.json().catch(() => ({}));
  const question = typeof body.question === 'string' ? body.question.trim() : '';
  const chatId = body.chatId ?? null;
  if (!question || question.length > QUESTION_MAX || (chatId !== null && !isUuid(chatId))) {
    return reply(400, { error: 'bad_request' });
  }

  // Started together; the answers are checked in order (age, consent, Pro, chat).
  const pro = hasPro(userId);
  const [{ data: profile }, chat] = await Promise.all([
    admin
      .from('profiles')
      .select(
        'birth_date, unit_preference, goal, experience, focus, equipment, active_plan_id, ' +
          'language, coach_consent_at',
      )
      .eq('id', userId)
      .maybeSingle<ProfileRow>(),
    chatId
      ? admin.from('coach_chats').select('id').eq('id', chatId).eq('user_id', userId).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  // An unknown birth date counts as too young, like the body check's.
  const age = profile?.birth_date ? ageFrom(profile.birth_date, new Date()) : 0;
  if (!profile || age < MIN_AGE) return reply(403, { error: 'too_young' });
  // The start screen says that sending the first question is the consent.
  if (!profile.coach_consent_at && body.consent !== true) {
    return reply(403, { error: 'consent_required' });
  }
  if (!(await pro)) return reply(403, { error: 'not_pro' });
  if (chatId && !chat.data) return reply(404, { error: 'chat_not_found' });

  const { data: slot, error } = await admin.rpc('start_coach_run', {
    p_user_id: userId,
    p_chat_id: chatId,
    p_daily_limit: DAILY_LIMIT,
    p_monthly_limit: MONTHLY_LIMIT,
  });
  if (error || !slot) {
    console.error('Starting the coach run failed', error);
    return reply(500, { error: 'failed' });
  }
  if (slot.limit) {
    const count = slot.limit === 'daily' ? DAILY_LIMIT : MONTHLY_LIMIT;
    return reply(429, { error: 'limit', limit: slot.limit, count, retryAt: slot.retry_at });
  }

  // Recorded before any of the user's data goes to OpenAI.
  if (!profile.coach_consent_at) {
    const { error: consentError } = await admin
      .from('profiles')
      .update({ coach_consent_at: new Date().toISOString() })
      .eq('id', userId);
    if (consentError) {
      console.error('Recording the coach consent failed', consentError);
      await giveBack(slot.run);
      return reply(500, { error: 'failed' });
    }
  }
  const language = LANGUAGES.includes(body.language)
    ? body.language
    : LANGUAGES.includes(profile.language ?? '')
      ? profile.language!
      : 'en';
  return eventResponse({
    userId,
    runId: slot.run,
    question,
    chatId,
    profile,
    timeZone: timeZoneOf(body.timeZone),
    language,
  });
});
