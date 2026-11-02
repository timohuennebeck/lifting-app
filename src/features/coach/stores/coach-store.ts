import { create } from 'zustand';

import { db } from '@/shared/data/powersync/database';
import { uploadsDone } from '@/shared/data/powersync/upload-queue';

import type { AnswerProgress } from '../components/answer-steps';
import { type CoachChart, toChart } from '../lib/charts';
import { CoachError, type CoachEvent, type CoachQuestion, streamAnswer } from '../lib/coach-client';

/** How long a question waits for changes still on their way to the server (a workout just logged). */
const UPLOAD_WAIT_MS = 5000;

/** The question being answered, shown in its chat until the saved answer has synced. */
export interface PendingAnswer {
  question: string;
  /** null until the server names a new chat's id. */
  chatId: string | null;
  questionId: string | null;
  answerId: string | null;
  progress: AnswerProgress;
  text: string;
  chart: CoachChart | null;
  /** The answer is complete and saved. */
  done: boolean;
}

interface CoachState {
  /** The chat the coach shows; null: a new one (the start screen). */
  chatId: string | null;
  pending: PendingAnswer | null;
}

export const useCoachStore = create<CoachState>()(() => ({ chatId: null, pending: null }));

/** Stops the answer in flight. */
let controller: AbortController | null = null;

/** Shows a chat in the coach; null starts a new one. */
export const openChat = (chatId: string | null) => useCoachStore.setState({ chatId });

const update = (patch: Partial<PendingAnswer>) =>
  useCoachStore.setState((s) => ({ pending: s.pending && { ...s.pending, ...patch } }));

/** One streamed event into the pending answer. */
function apply(event: CoachEvent) {
  const { chatId, pending } = useCoachStore.getState();
  if (!pending) return;
  if (event.type === 'start') {
    const { questionId, answerId } = event;
    useCoachStore.setState({
      // Still on the new chat it was asked in: that chat now has its id.
      chatId: !pending.chatId && !chatId ? event.chatId : chatId,
      pending: { ...pending, chatId: event.chatId, questionId, answerId },
    });
  } else if (event.type === 'searched') {
    update({ progress: { ...pending.progress, searched: { of: event.of, count: event.count } } });
  } else if (event.type === 'found') {
    // A later step without a chart (a look at single workouts) keeps the one drawn before.
    const chart = toChart(event.chart) ?? pending.chart;
    update({ progress: { ...pending.progress, found: true }, chart });
  } else if (event.type === 'text') {
    update({ text: pending.text + event.text });
  } else {
    update({ text: '' });
  }
}

/**
 * Asks the coach in the chat it shows and streams the answer into `pending`. Resolves with what
 * happened: a CoachError when there is no answer. Nothing is saved then, so a new chat stays new.
 */
export async function ask(input: Omit<CoachQuestion, 'chatId'>) {
  const { chatId, pending } = useCoachStore.getState();
  if (pending && !pending.done) return 'busy';
  const stop = new AbortController();
  controller = stop;
  useCoachStore.setState({
    pending: {
      question: input.question,
      chatId,
      questionId: null,
      answerId: null,
      progress: { searched: null, found: false },
      text: '',
      chart: null,
      done: false,
    },
  });
  // A workout just logged should be on the server for the answer; offline, the call says so.
  if (db.currentStatus.connected) await uploadsDone(UPLOAD_WAIT_MS);
  try {
    if (stop.signal.aborted) throw new CoachError('failed');
    await streamAnswer({ ...input, chatId }, apply, stop.signal);
    update({ done: true });
    return 'answered';
  } catch (error) {
    useCoachStore.setState((s) => ({
      chatId: !chatId && s.chatId === s.pending?.chatId ? null : s.chatId,
      pending: null,
    }));
    if (stop.signal.aborted) return 'stopped';
    return error instanceof CoachError ? error : new CoachError('failed');
  } finally {
    if (controller === stop) controller = null;
  }
}

export const stopAnswer = () => controller?.abort();

/** Whether an answer is still coming in. */
export const isAnswering = (pending: PendingAnswer | null): pending is PendingAnswer =>
  !!pending && !pending.done;

/** Signing out: the answer in flight stops and the next account starts with a new chat. */
export function resetCoach() {
  stopAnswer();
  useCoachStore.setState({ chatId: null, pending: null });
}
