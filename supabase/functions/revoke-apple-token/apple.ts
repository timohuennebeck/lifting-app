// Talks to Apple's Sign in with Apple REST API. Plain TypeScript without Deno APIs, so it can be
// tested outside the Edge runtime.
import { decodeBase64, encodeBase64Url } from 'jsr:@std/encoding@1';

const APPLE = 'https://appleid.apple.com';

export interface AppleConfig {
  /** Apple Developer team ID. */
  teamId: string;
  /** ID of the Sign in with Apple key. */
  keyId: string;
  /** The key's .p8 contents (PEM, the BEGIN/END lines optional, line breaks as \n allowed). */
  privateKey: string;
  /** The app ID the tokens were issued to. */
  clientId: string;
}

const utf8 = (text: string) => new TextEncoder().encode(text);

/** The short-lived ES256 JWT Apple takes instead of a fixed client secret. */
async function clientSecret(config: AppleConfig, now = Date.now()) {
  const der = decodeBase64(config.privateKey.replace(/-----[^-]+-----|\\n|\s/g, ''));
  const key = await crypto.subtle.importKey(
    'pkcs8',
    der,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  );
  const iat = Math.floor(now / 1000);
  const header = encodeBase64Url(utf8(JSON.stringify({ alg: 'ES256', kid: config.keyId })));
  const claims = encodeBase64Url(
    utf8(
      JSON.stringify({
        iss: config.teamId,
        iat,
        exp: iat + 300,
        aud: APPLE,
        sub: config.clientId,
      }),
    ),
  );
  // Web Crypto signs ECDSA as r‖s, the form a JWS needs.
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    key,
    utf8(`${header}.${claims}`),
  );
  return `${header}.${claims}.${encodeBase64Url(new Uint8Array(signature))}`;
}

const post = (path: string, params: Record<string, string>) =>
  fetch(`${APPLE}/auth/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params),
  });

/**
 * Exchanges a fresh authorization code for the user's tokens, then revokes them, which ends the
 * app's access to the Apple account (App Store guideline 5.1.1(v)).
 */
export async function revokeWithCode(
  config: AppleConfig,
  code: string,
): Promise<{ revoked: true } | { error: string }> {
  const secret = await clientSecret(config);
  const auth = { client_id: config.clientId, client_secret: secret };
  const tokens = await post('token', { ...auth, code, grant_type: 'authorization_code' });
  if (!tokens.ok) return { error: `token ${tokens.status}: ${await tokens.text()}` };
  const { refresh_token: refresh, access_token: access } = await tokens.json();
  const token = refresh ?? access;
  if (typeof token !== 'string') return { error: 'token: no token in the answer' };
  const revoked = await post('revoke', {
    ...auth,
    token,
    token_type_hint: refresh ? 'refresh_token' : 'access_token',
  });
  if (!revoked.ok) return { error: `revoke ${revoked.status}: ${await revoked.text()}` };
  return { revoked: true };
}
