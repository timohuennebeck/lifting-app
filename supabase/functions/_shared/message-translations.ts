// Stores translations of ticket messages: detects each message's language once
// (ticket_messages.language) and adds the target language's translation where one is missing.
import { admin } from './common.ts';
import { type AppLanguage, isAppLanguage } from './plan-events.ts';
import { sameLanguage, translateText } from './translate.ts';

export interface MessageRow {
  id: string;
  user_id: string;
  author: 'user' | 'team';
  content: string;
  language: string | null;
}

export const MESSAGE_COLUMNS = 'id, user_id, author, content, language';

/**
 * The language the team reads user messages in first (the desk asks for others itself):
 * SUPPORT_LANGUAGE, German when unset or not an app language.
 */
export const TEAM_LANGUAGE: AppLanguage = (() => {
  const value = Deno.env.get('SUPPORT_LANGUAGE');
  if (isAppLanguage(value)) return value;
  if (value) console.error(`SUPPORT_LANGUAGE "${value}" is not an app language; using de`);
  return 'de';
})();

/** A user's app language, or English when they never picked one. */
export async function userLanguage(userId: string): Promise<AppLanguage> {
  const { data } = await admin.from('profiles').select('language').eq('id', userId).maybeSingle();
  return isAppLanguage(data?.language) ? data.language : 'en';
}

const CHUNK = 100;
const PARALLEL = 4;

async function inParallel<T>(items: T[], work: (item: T) => Promise<void>) {
  let next = 0;
  const workers = Array.from({ length: Math.min(PARALLEL, items.length) }, async () => {
    while (next < items.length) await work(items[next++]);
  });
  await Promise.all(workers);
}

/** Message ids among `ids` that already have a translation into `language`. */
async function translatedIds(ids: string[], language: AppLanguage) {
  const done = new Set<string>();
  for (let i = 0; i < ids.length; i += CHUNK) {
    const { data, error } = await admin
      .from('ticket_message_translations')
      .select('message_id')
      .eq('language', language)
      .in('message_id', ids.slice(i, i + CHUNK));
    if (error) throw error;
    for (const row of data) done.add(row.message_id);
  }
  return done;
}

/**
 * Adds the translations into `target` that the messages lack. Messages already in `target`, empty
 * ones (screenshots only) and ones translated before are skipped; a failure leaves a message as
 * written, to be tried again the next time it is asked for.
 */
export async function translateMessages(messages: MessageRow[], target: AppLanguage) {
  const done = await translatedIds(
    messages.map((m) => m.id),
    target,
  );
  const todo = messages.filter(
    (m) => !done.has(m.id) && m.content.trim() && !(m.language && sameLanguage(m.language, target)),
  );
  await inParallel(todo, async (message) => {
    const result = await translateText(message.content, target);
    if (!result) return;
    if (!message.language) {
      await admin
        .from('ticket_messages')
        .update({ language: result.source })
        .eq('id', message.id)
        .is('language', null);
    }
    if (result.translation) {
      const { error } = await admin.from('ticket_message_translations').upsert(
        {
          message_id: message.id,
          user_id: message.user_id,
          language: target,
          content: result.translation,
        },
        { onConflict: 'message_id,language', ignoreDuplicates: true },
      );
      if (error) console.error('Saving a translation failed', error);
    }
  });
}
