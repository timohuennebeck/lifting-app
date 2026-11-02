// Translates support messages, called two ways:
// - by the database (pg_net, with the X-Webhook-Secret header): { message_id } for every new
//   message, which goes into the team's language (a user's) or the user's app language (a team
//   reply); { user_id, language } when a user switched the app language, for their team replies.
// - by the support desk (the support account's token): { message_ids, language } for messages it
//   shows in a language they have no translation in yet; answers with those translations.
import { admin, isUuid } from '../_shared/common.ts';
import {
  MESSAGE_COLUMNS,
  type MessageRow,
  TEAM_LANGUAGE,
  translateMessages,
  userLanguage,
} from '../_shared/message-translations.ts';
import { openAiConfigured } from '../_shared/openai.ts';
import { corsReply, isSupportRequest, preflight } from '../_shared/support-desk.ts';
import { isAppLanguage } from '../_shared/translate.ts';

const WEBHOOK_SECRET = Deno.env.get('TRANSLATION_WEBHOOK_SECRET');
/** The most messages the desk asks for at once. */
const MAX_IDS = 100;

/** Whether the request carries the database's shared secret (compared in constant time). */
function fromDatabase(req: Request) {
  const given = req.headers.get('X-Webhook-Secret');
  if (!WEBHOOK_SECRET || !given) return false;
  const a = new TextEncoder().encode(given);
  const b = new TextEncoder().encode(WEBHOOK_SECRET);
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/** A new message: a user's into the team's language, a team reply into the user's. */
async function translateNewMessage(messageId: string) {
  const { data: message } = await admin
    .from('ticket_messages')
    .select(MESSAGE_COLUMNS)
    .eq('id', messageId)
    .maybeSingle<MessageRow>();
  if (!message) return;
  const target = message.author === 'user' ? TEAM_LANGUAGE : await userLanguage(message.user_id);
  await translateMessages([message], target);
}

/** A user switched the app language: their team replies, in it. */
async function translateReplies(userId: string, language: Parameters<typeof translateMessages>[1]) {
  const { data, error } = await admin
    .from('ticket_messages')
    .select(MESSAGE_COLUMNS)
    .eq('user_id', userId)
    .eq('author', 'team');
  if (error) throw error;
  await translateMessages(data as MessageRow[], language);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return preflight();
  if (req.method !== 'POST') return corsReply(405, { error: 'method_not_allowed' });
  if (!openAiConfigured()) {
    console.error('OPENAI_API_KEY is not set (supabase/functions/.env)');
    return corsReply(500, { error: 'not_configured' });
  }
  const body = await req.json().catch(() => null);

  if (fromDatabase(req)) {
    if (isUuid(body?.message_id)) {
      await translateNewMessage(body.message_id);
      return corsReply(200, { ok: true });
    }
    if (isUuid(body?.user_id) && isAppLanguage(body.language)) {
      await translateReplies(body.user_id, body.language);
      return corsReply(200, { ok: true });
    }
    return corsReply(400, { error: 'bad_request' });
  }

  if (!(await isSupportRequest(req))) return corsReply(401, { error: 'unauthorized' });
  const ids: unknown = body?.message_ids;
  if (
    !Array.isArray(ids) ||
    !ids.length ||
    ids.length > MAX_IDS ||
    !ids.every(isUuid) ||
    !isAppLanguage(body.language)
  ) {
    return corsReply(400, { error: 'bad_request' });
  }
  const { data: messages, error } = await admin
    .from('ticket_messages')
    .select(MESSAGE_COLUMNS)
    .in('id', ids);
  if (error) return corsReply(500, { error: 'failed' });
  await translateMessages(messages as MessageRow[], body.language);
  // Every translation these messages have in the language now, also ones made before.
  const { data: translations } = await admin
    .from('ticket_message_translations')
    .select('message_id, language, content')
    .eq('language', body.language)
    .in('message_id', ids);
  return corsReply(200, { translations: translations ?? [] });
});
