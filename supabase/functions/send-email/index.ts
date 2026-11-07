// Supabase Auth's Send Email hook (Authentication → Hooks): Auth calls this function instead of
// sending its own emails, and it sends them through Resend in the user's app language
// (profiles.language, else the language the app sent at sign-up, else English). Only the reset
// code and the sign-up confirmation are written; other types are refused, so Auth reports the
// failure. The request is signed with the hook's secret (Standard Webhooks).
import { Webhook } from 'npm:standardwebhooks@1.0.0';

import { admin, reply } from '../_shared/common.ts';
import { type AppLanguage, isAppLanguage } from '../_shared/plan-events.ts';
import { buildEmail, confirmationLink, isEmailType, SUPPORT_EMAIL } from './emails.ts';

const RESEND_URL = 'https://api.resend.com/emails';
const DEFAULT_FROM = 'Loqqa <no-reply@mail.useloqqa.com>';

interface HookUser {
  id: string;
  email: string;
  user_metadata?: { language?: unknown };
}

interface HookEmailData {
  token: string;
  token_hash: string;
  redirect_to: string;
  email_action_type: string;
  site_url: string;
}

/** The answer Auth reads when the hook fails; it passes the message on in its own error. */
const failure = (status: number, message: string) =>
  reply(status, { error: { http_code: status, message } });

async function emailLanguage(user: HookUser): Promise<AppLanguage> {
  const { data } = await admin
    .from('profiles')
    .select('language')
    .eq('id', user.id)
    .maybeSingle<{ language: string | null }>();
  if (isAppLanguage(data?.language)) return data.language;
  const fromSignUp = user.user_metadata?.language;
  return isAppLanguage(fromSignUp) ? fromSignUp : 'en';
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return failure(405, 'method not allowed');

  const secret = Deno.env.get('SEND_EMAIL_HOOK_SECRET');
  const apiKey = Deno.env.get('RESEND_API_KEY');
  if (!secret || !apiKey) {
    console.error('SEND_EMAIL_HOOK_SECRET or RESEND_API_KEY is not set');
    return failure(500, 'email sending is not configured');
  }

  const payload = await req.text();
  const headers = Object.fromEntries(req.headers);
  let event: { user: HookUser; email_data: HookEmailData };
  try {
    event = new Webhook(secret.replace('v1,whsec_', '')).verify(payload, headers) as typeof event;
  } catch {
    return failure(401, 'invalid signature');
  }

  const { user, email_data: data } = event;
  const type = data.email_action_type;
  if (!isEmailType(type)) {
    console.error(`send-email: no email for type "${type}"`);
    return failure(422, `email type ${type} is not supported`);
  }

  const language = await emailLanguage(user);
  const email = buildEmail(type, language, {
    code: data.token,
    link: confirmationLink(Deno.env.get('SUPABASE_URL')!, data),
  });

  const response = await fetch(RESEND_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      // Auth retries a hook that didn't answer; the same webhook id sends the email once.
      'Idempotency-Key': headers['webhook-id'] ?? crypto.randomUUID(),
    },
    body: JSON.stringify({
      from: Deno.env.get('EMAIL_FROM') || DEFAULT_FROM,
      to: [user.email],
      // Sent from a no-reply address; a reply still reaches support.
      reply_to: SUPPORT_EMAIL,
      subject: email.subject,
      html: email.html,
      text: email.text,
    }),
  }).catch(() => null);

  if (!response?.ok) {
    console.error('send-email: Resend refused', response?.status, await response?.text());
    return failure(502, 'the email could not be sent');
  }
  return reply(200, {});
});
