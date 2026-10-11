// Shared by the Edge Functions. They check the caller's token themselves (verify_jwt = false in
// config.toml), which works with the asymmetric signing keys.
import { createClient } from 'jsr:@supabase/supabase-js@2';

export const admin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

export const reply = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

/** The user the request's bearer token belongs to; null without a valid one. */
export async function requestUser(req: Request) {
  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const { data } = await admin.auth.getUser(token);
  return data.user;
}
