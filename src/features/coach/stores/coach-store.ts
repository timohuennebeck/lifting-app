import { create } from 'zustand';

import { db } from '@/shared/data/powersync/database';
import { uploadsDone } from '@/shared/data/powersync/upload-queue';
import { track } from '@/shared/lib/posthog';

import { type CoachChart, toChart } from '../lib/charts';
import { CoachError, type CoachEvent, type CoachQuestion, streamAnswer } from '../lib/coach-client';

/** How long a question waits for changes still on their way to the server (a workout just logged). */
const UPLOAD_WAIT_MS = 5000;

/** The question being answered, shown in its chat until the saved answer has synced. */
export interface PendingAnswer {
  question: string;
  /** null until the server names a new chat's id. */
  chatId: string | null;
  /** The coach screen that asked: a new chat there takes on that id. */
  screen: string;
  questionId: string | null;
  answerId: string | null;
  text: string;
  chart: CoachChart | null;
  /** The answer is complete and saved. */
  done: boolean;
}

interface CoachState {
  pending: PendingAnswer | null;
  /** The Training tab card's question, kept when one comes back without an answer. */
  draft: string;
  /** "New chat" was tapped elsewhere: the card's field takes focus once it is on screen. */
  focusCard: boolean;
}

export const useCoachStore = create<CoachState>()(() => ({
  pending: null,
  draft: '',
  focusCard: false,
}));

/** Stops the answer in flight. */
let controller: AbortController | null = null;

const update = (patch: Partial<PendingAnswer>) =>
  useCoachStore.setState((s) => ({ pending: s.pending && { ...s.pending, ...patch } }));

/** One streamed event into the pending answer. */
function apply(event: CoachEvent) {
  const { pending } = useCoachStore.getState();
  if (!pending) return;
  if (event.type === 'start') {
    const { chatId, questionId, answerId } = event;
    update({ chatId, questionId, answerId });
  } else if (event.type === 'found') {
    // A later step without a chart (a look at single workouts) keeps the one drawn before.
    update({ chart: toChart(event.chart) ?? pending.chart });
  } else if (event.type === 'text') {
    update({ text: pending.text + event.text });
  } else if (event.type === 'reset') {
    update({ text: '' });
  }
}

/**
 * Asks the coach from the coach screen `screen` and streams the answer into `pending`. Resolves
 * with what happened: a CoachError when there is no answer. Nothing is saved then, so a new chat
 * stays new.
 */
export async function ask(input: CoachQuestion, screen: string) {
  const { pending } = useCoachStore.getState();
  if (pending && !pending.done) return 'busy';
  const stop = new AbortController();
  controller = stop;
  useCoachStore.setState({
    pending: {
      question: input.question,
      chatId: input.chatId,
      screen,
      questionId: null,
      answerId: null,
      text: '',
      chart: null,
      done: false,
    },
  });
  const is_new_chat = input.chatId === null;
  const startedAt = Date.now();
  track('coach:question_submit', { is_new_chat });
  // A workout just logged should be on the server for the answer; offline, the call says so.
  if (db.currentStatus.connected) await uploadsDone(UPLOAD_WAIT_MS);
  try {
    if (stop.signal.aborted) throw new CoachError('failed');
    await streamAnswer(input, apply, stop.signal);
    update({ done: true });
    const has_chart = !!useCoachStore.getState().pending?.chart;
    track('coach:answer_complete', { is_new_chat, has_chart, duration_ms: Date.now() - startedAt });
    return 'answered';
  } catch (error) {
    useCoachStore.setState({ pending: null });
    const is_cancelled = stop.signal.aborted;
    const failure = error instanceof CoachError ? error : new CoachError('failed');
    track('coach:answer_fail', {
      is_new_chat,
      error_code: is_cancelled ? 'stopped' : failure.reason,
      is_cancelled,
    });
    if (is_cancelled) return 'stopped';
    return failure;
  } finally {
    if (controller === stop) controller = null;
  }
}

export const stopAnswer = () => controller?.abort();

/** Deleted chats: an answer still coming for one stops, and a finished one isn't shown again. */
export function forgetChats(chatIds: string[]) {
  const { pending } = useCoachStore.getState();
  if (!pending?.chatId || !chatIds.includes(pending.chatId)) return;
  if (isAnswering(pending)) stopAnswer();
  else useCoachStore.setState({ pending: null });
}

/** Whether an answer is still coming in. */
export const isAnswering = (pending: PendingAnswer | null): pending is PendingAnswer =>
  !!pending && !pending.done;

/** Signing out: the answer in flight stops and the next account starts with a new chat. */
export function resetCoach() {
  stopAnswer();
  useCoachStore.setState({ pending: null, draft: '', focusCard: false });
}
