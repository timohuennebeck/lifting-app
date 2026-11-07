// The AI coach's chat (README, "Coach"). The app sends a question; this function checks the user
// (signed in, 16+, Pro, limits), lets the coach answer from the user's data and streams
// the answer back as server-sent events: the design's steps, the chart and the text. Only a
// complete answer is saved, with its question (coach_chats, coach_messages); PowerSync brings
// both to the app. Every question takes a row in coach_runs first, which the limits count.
import { COACH_MIN_AGE, hasPro, isOldEnough } from '../_shared/account.ts';
import { askCoach, type CoachEvent, type CoachUsage } from '../_shared/coach/chat.ts';
import { type CoachUser, dayIn } from '../_shared/coach/data.ts';
import {
  coachCatalog,
  coachData,
  coachProfile,
  coachRoutines,
  coachTurns,
  type HistoryRow,
  type MessageRow,
  type PlanWorkoutRow,
  type ProfileRow,
  type RoutineRow,
} from '../_shared/coach/load.ts';
import { contextText } from '../_shared/coach/prompt.ts';
import {
  admin,
  envFlag,
  envLimit,
  isUuid,
  refuseAiRequest,
  reply,
  requestUser,
} from '../_shared/common.ts';
import { eventStream } from '../_shared/event-stream.ts';
import { COACH_ANSWER_MAX, COACH_QUESTION_MAX } from '../_shared/limits.ts';
import { DEFAULT_MODEL } from '../_shared/openai.ts';
import { type AppLanguage, isAppLanguage } from '../_shared/plan-events.ts';
import { loadCatalog, loadEquipment } from '../_shared/plans.ts';

const MODEL = Deno.env.get('OPENAI_COACH_MODEL') || DEFAULT_MODEL;
const EFFORT = Deno.env.get('OPENAI_COACH_REASONING_EFFORT') || 'low';
const FAST = envFlag('COACH_FAST');
const DAILY_LIMIT = envLimit('COACH_DAILY_LIMIT', 20);
const MONTHLY_LIMIT = envLimit('COACH_MONTHLY_LIMIT', 150);
const TIMEOUT_MS = 60_000;
/** Earlier questions the model reads back with their answers and tool calls. */
const HISTORY_TURNS = 6;
/** Enough of the plan's latest finished workouts to hold its latest week. */
const PLAN_WORKOUTS = 50;

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
  language: AppLanguage;
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
  const [history, plan, recent, catalog, equipment, routines, planWorkouts] = await Promise.all([
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
    loadCatalog(),
    loadEquipment(),
    admin
      .from('routines')
      .select(
        'id, name, plan_id, position, routine_exercises(exercise_id, position, rest_seconds, ' +
          'routine_sets(position, target_min, target_max, rir))',
      )
      .eq('user_id', job.userId),
    planId
      ? admin
          .from('workout_entries')
          .select('routine_id, plan_week')
          .eq('plan_id', planId)
          .not('finished_at', 'is', null)
          .order('plan_week', { ascending: false, nullsFirst: false })
          .limit(PLAN_WORKOUTS)
      : Promise.resolve({ data: [] as PlanWorkoutRow[], error: null }),
  ]);
  const failure = history.error ?? recent.error ?? routines.error ?? planWorkouts.error;
  if (failure) {
    console.error('Reading the coach data failed', failure);
    await giveBack(job.runId);
    return send({ type: 'error', error: 'failed' });
  }
  const messages = ((recent.data ?? []) as MessageRow[]).reverse();
  const answerIds = messages.filter((m) => m.role === 'coach').map((m) => m.id);
  const { data: runs } = answerIds.length
    ? await admin.from('coach_runs').select('answer_id, calls').in('answer_id', answerIds)
    : { data: [] };

  const data = coachData(
    history.data as HistoryRow,
    job.language,
    job.timeZone,
    coachCatalog(catalog, equipment, job.profile, job.language),
    coachRoutines(
      (routines.data ?? []) as unknown as RoutineRow[],
      planId && plan.data ? { id: planId, sessionsPerWeek: plan.data.sessions_per_week } : null,
      (planWorkouts.data ?? []) as PlanWorkoutRow[],
    ),
  );
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
    p_answer: reply.answer.slice(0, COACH_ANSWER_MAX),
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
  const language = body.language;
  if (
    !question ||
    question.length > COACH_QUESTION_MAX ||
    (chatId !== null && !isUuid(chatId)) ||
    !isAppLanguage(language)
  ) {
    return reply(400, { error: 'bad_request' });
  }

  // Started together; the answers are checked in order (age, Pro, chat).
  const pro = hasPro(userId);
  const [{ data: profile }, chat] = await Promise.all([
    admin
      .from('profiles')
      .select(
        'birth_date, unit_preference, goal, experience, focus, equipment, home_equipment, ' +
          'active_plan_id, coach_consent_at',
      )
      .eq('id', userId)
      .maybeSingle<ProfileRow>(),
    chatId
      ? admin.from('coach_chats').select('id').eq('id', chatId).eq('user_id', userId).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);
  if (!profile || !isOldEnough(profile.birth_date, COACH_MIN_AGE)) {
    return reply(403, { error: 'too_young' });
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

  // Asking is the consent, also after a withdrawal; recorded before any data goes to OpenAI.
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
