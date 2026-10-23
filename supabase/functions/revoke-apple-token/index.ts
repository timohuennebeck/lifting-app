// Revokes the app's Apple tokens before an account that signed in with Apple is deleted. The app
// gets a fresh authorization code from Apple's sheet and sends it here; the code is exchanged and
// the tokens revoked right away, so nothing is stored.
import { reply, requestUser } from '../_shared/common.ts';
import { type AppleConfig, revokeWithCode } from './apple.ts';

const TEAM_ID = Deno.env.get('APPLE_TEAM_ID');
const KEY_ID = Deno.env.get('APPLE_KEY_ID');
const PRIVATE_KEY = Deno.env.get('APPLE_PRIVATE_KEY');
const CLIENT_ID = Deno.env.get('APPLE_CLIENT_ID') ?? 'app.loqqa.mobile';

Deno.serve(async (req) => {
  if (req.method !== 'POST') return reply(405, { error: 'method_not_allowed' });
  if (!TEAM_ID || !KEY_ID || !PRIVATE_KEY) {
    console.error(
      'APPLE_TEAM_ID, APPLE_KEY_ID or APPLE_PRIVATE_KEY is not set (supabase/functions/.env)',
    );
    return reply(500, { error: 'not_configured' });
  }

  const user = await requestUser(req);
  if (!user) return reply(401, { error: 'unauthorized' });
  const providers: unknown = user.app_metadata?.providers;
  if (!Array.isArray(providers) || !providers.includes('apple')) {
    return reply(400, { error: 'not_apple' });
  }

  const { code } = await req.json().catch(() => ({}));
  if (typeof code !== 'string' || !code) return reply(400, { error: 'bad_request' });

  const config: AppleConfig = {
    teamId: TEAM_ID,
    keyId: KEY_ID,
    privateKey: PRIVATE_KEY,
    clientId: CLIENT_ID,
  };
  try {
    const result = await revokeWithCode(config, code);
    if ('error' in result) {
      console.error('Revoking the Apple tokens failed', result.error);
      return reply(502, { error: 'apple_failed' });
    }
  } catch (error) {
    // A malformed key, or Apple unreachable.
    console.error('Revoking the Apple tokens failed', error);
    return reply(502, { error: 'apple_failed' });
  }
  return reply(200, { revoked: true });
});
