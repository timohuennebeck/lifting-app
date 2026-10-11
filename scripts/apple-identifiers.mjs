// Lists the team's App IDs (bundle IDs) with the App Store Connect app record that uses each one,
// and deletes the ones you name. Uses an App Store Connect API key (Admin), set in .env:
//   ASC_KEY_ID, ASC_ISSUER_ID, ASC_KEY_PATH (path to the AuthKey_….p8 file)
// Usage: npm run apple:ids                    lists them
//        npm run apple:ids -- delete <id> …   deletes those App IDs after asking
import { sign } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { createInterface } from 'node:readline/promises';

const API = 'https://api.appstoreconnect.apple.com/v1';
const { ASC_KEY_ID, ASC_ISSUER_ID, ASC_KEY_PATH } = process.env;
if (!ASC_KEY_ID || !ASC_ISSUER_ID || !ASC_KEY_PATH) {
  console.error(
    'Set ASC_KEY_ID, ASC_ISSUER_ID and ASC_KEY_PATH in .env (see the top of this file).',
  );
  process.exit(1);
}
const privateKey = readFileSync(ASC_KEY_PATH.replace(/^~(?=\/)/, homedir()), 'utf8');

const base64url = (value) => Buffer.from(JSON.stringify(value)).toString('base64url');

/** A 10-minute token for the App Store Connect API (ES256, signed with the API key). */
function token() {
  const iat = Math.floor(Date.now() / 1000);
  const header = base64url({ alg: 'ES256', kid: ASC_KEY_ID, typ: 'JWT' });
  const claims = base64url({ iss: ASC_ISSUER_ID, iat, exp: iat + 600, aud: 'appstoreconnect-v1' });
  const signature = sign('sha256', Buffer.from(`${header}.${claims}`), {
    key: privateKey,
    dsaEncoding: 'ieee-p1363',
  });
  return `${header}.${claims}.${signature.toString('base64url')}`;
}

async function request(url, method = 'GET') {
  const response = await fetch(url.startsWith('http') ? url : `${API}${url}`, {
    method,
    headers: { Authorization: `Bearer ${token()}` },
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const detail = body.errors?.map((e) => e.detail ?? e.title).join('; ');
    throw new Error(`${method} ${url} → ${response.status}${detail ? `: ${detail}` : ''}`);
  }
  return response.status === 204 ? null : response.json();
}

/** Every item of a paged list. */
async function all(path) {
  const items = [];
  for (let url = path; url;) {
    const page = await request(url);
    items.push(...page.data);
    url = page.links?.next;
  }
  return items;
}

const [bundleIds, apps] = await Promise.all([
  all('/bundleIds?fields[bundleIds]=name,identifier,platform&limit=200'),
  all('/apps?fields[apps]=name,bundleId&limit=200'),
]);
const appFor = new Map(apps.map((app) => [app.attributes.bundleId, app.attributes.name]));
const [command, ...targets] = process.argv.slice(2);

if (!command) {
  const rows = bundleIds
    .map(({ attributes: a }) => ({
      identifier: a.identifier,
      name: a.name,
      platform: a.platform,
      'App Store record': appFor.get(a.identifier) ?? '',
    }))
    .sort((a, b) => a.identifier.localeCompare(b.identifier));
  console.table(rows);
  console.log('App IDs with an App Store record are kept by `delete`.');
} else if (command === 'delete' && targets.length) {
  const chosen = [];
  for (const identifier of targets) {
    const bundleId = bundleIds.find((b) => b.attributes.identifier === identifier);
    if (!bundleId) console.log(`${identifier}: not found, skipped`);
    else if (appFor.has(identifier)) {
      console.log(`${identifier}: used by the App Store record "${appFor.get(identifier)}", kept`);
    } else chosen.push(bundleId);
  }
  if (!chosen.length) process.exit(0);
  const prompt = createInterface({ input: process.stdin, output: process.stdout });
  const answer = await prompt.question(
    `Delete ${chosen.map((b) => b.attributes.identifier).join(', ')}? This can't be undone. (y/N) `,
  );
  prompt.close();
  if (answer.trim().toLowerCase() !== 'y') process.exit(0);
  for (const bundleId of chosen) {
    try {
      await request(`/bundleIds/${bundleId.id}`, 'DELETE');
      console.log(`${bundleId.attributes.identifier}: deleted`);
    } catch (error) {
      console.log(`${bundleId.attributes.identifier}: ${error.message}`);
    }
  }
} else {
  console.error('Usage: npm run apple:ids  |  npm run apple:ids -- delete <identifier> …');
  process.exit(1);
}
