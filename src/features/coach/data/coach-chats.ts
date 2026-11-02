import { and, count, desc, eq, inArray, isNotNull, min, sql } from 'drizzle-orm';

import { parseJson } from '@/shared/data/json';
import { drizzle } from '@/shared/data/powersync/database';
import { coachChats, coachMessages, workoutEntries } from '@/shared/data/powersync/schema';
import { type RowOf, useDrizzleQuery } from '@/shared/data/use-drizzle-query';

import type { ChatItem } from '../components/coach-chat-view';
import { toChart } from '../lib/charts';
import { coachKeys } from './coach-keys';

/** A chat in the history: its first question and answer, and when it was last answered. */
export interface CoachChatSummary {
  id: string;
  question: string;
  answer: string;
  updatedAt: string;
}

/** The chat's first message by `role`, for the query around it. */
const firstOf = (role: 'user' | 'coach') =>
  sql<string | null>`${drizzle
    .select({ content: coachMessages.content })
    .from(coachMessages)
    .where(and(eq(coachMessages.chat_id, coachChats.id), eq(coachMessages.role, role)))
    .orderBy(coachMessages.created_at)
    .limit(1)}`;

const chatsQuery = () =>
  drizzle
    .select({
      id: coachChats.id,
      updatedAt: coachChats.updated_at,
      question: firstOf('user'),
      answer: firstOf('coach'),
    })
    .from(coachChats)
    .orderBy(desc(coachChats.updated_at));

const toSummaries = (rows: RowOf<typeof chatsQuery>[]): CoachChatSummary[] =>
  rows.map((r) => ({
    id: r.id,
    question: r.question ?? '',
    answer: r.answer ?? '',
    updatedAt: r.updatedAt,
  }));

/** The user's chats with the coach, the most recently answered first. */
export function useCoachChats() {
  return useDrizzleQuery({
    queryKey: coachKeys.chats.queryKey,
    query: chatsQuery(),
    map: toSummaries,
  });
}

const messagesQuery = (chatId: string) =>
  drizzle
    .select()
    .from(coachMessages)
    .where(eq(coachMessages.chat_id, chatId))
    .orderBy(coachMessages.created_at, coachMessages.id);

const toItems = (rows: RowOf<typeof messagesQuery>[]): ChatItem[] =>
  rows.map((r) => ({
    id: r.id,
    role: r.role === 'coach' ? 'coach' : 'user',
    content: r.content,
    chart: toChart(parseJson<unknown>(r.chart, null)),
  }));

/** A chat's questions and answers, oldest first; none for a new chat (null). */
export function useCoachMessages(chatId: string | null) {
  return useDrizzleQuery({
    queryKey: coachKeys.messages(chatId ?? '').queryKey,
    query: messagesQuery(chatId ?? ''),
    enabled: !!chatId,
    map: toItems,
  });
}

const workoutsQuery = () =>
  drizzle
    .select({ count: count(), first: min(workoutEntries.started_at) })
    .from(workoutEntries)
    .where(isNotNull(workoutEntries.finished_at));

const toWorkouts = (rows: RowOf<typeof workoutsQuery>[]) => ({
  count: rows[0]?.count ?? 0,
  first: rows[0]?.first ?? null,
});

/** How many workouts the coach knows and when the first was: "alle 142 Einheiten seit Januar". */
export function useCoachWorkouts() {
  return useDrizzleQuery({
    queryKey: coachKeys.workouts.queryKey,
    query: workoutsQuery(),
    map: toWorkouts,
  });
}

/** Deletes chats with their messages here; PowerSync deletes them on the server too. */
export async function deleteCoachChats(chatIds: string[]) {
  await drizzle.transaction(async (tx) => {
    await tx.delete(coachMessages).where(inArray(coachMessages.chat_id, chatIds));
    await tx.delete(coachChats).where(inArray(coachChats.id, chatIds));
  });
}
