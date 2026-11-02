// A reply from the support desk: translated into the user's app language first, then saved with
// its translation in one transaction (insert_team_reply), so the user's app never shows it
// untranslated. Whatever language the team writes in, the user gets theirs. If translating fails,
// the reply is saved as written and the database asks for its translation again
// (translate-ticket-messages). Called with the support account's token: { ticket_id, content }.
import { admin, isUuid } from '../_shared/common.ts';
import { userLanguage } from '../_shared/message-translations.ts';
import { openAiConfigured } from '../_shared/openai.ts';
import { corsReply, isSupportRequest, preflight } from '../_shared/support-desk.ts';
import { translateText } from '../_shared/translate.ts';

/** The database's limit on a message (ticket_messages_content_length). */
const MESSAGE_MAX = 5000;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return preflight();
  if (req.method !== 'POST') return corsReply(405, { error: 'method_not_allowed' });
  if (!(await isSupportRequest(req))) return corsReply(401, { error: 'unauthorized' });

  const body = await req.json().catch(() => null);
  const content = typeof body?.content === 'string' ? body.content.trim() : '';
  if (!isUuid(body?.ticket_id)) {
    return corsReply(400, { error: 'bad_request' });
  }
  if (!content || content.length > MESSAGE_MAX) return corsReply(400, { error: 'bad_content' });

  const { data: ticket } = await admin
    .from('tickets')
    .select('user_id')
    .eq('id', body.ticket_id)
    .maybeSingle<{ user_id: string }>();
  if (!ticket) return corsReply(404, { error: 'not_found' });

  const language = await userLanguage(ticket.user_id);
  const translated = openAiConfigured() ? await translateText(content, language) : null;
  const { data: id, error } = await admin.rpc('insert_team_reply', {
    p_ticket_id: body.ticket_id,
    p_content: content,
    p_language: translated?.source ?? null,
    p_translation_language: translated?.translation ? language : null,
    p_translation: translated?.translation ?? null,
  });
  if (error) {
    console.error('Saving the reply failed', error);
    return corsReply(500, { error: 'failed' });
  }
  return corsReply(200, { id, language, translated: !!translated?.translation });
});
