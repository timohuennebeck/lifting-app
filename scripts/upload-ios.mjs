// Uploads an iOS build to App Store Connect, from where it goes to TestFlight, with Xcode's altool
// instead of EAS Submit's queue. Uses the App Store Connect API key in .env.local:
//   ASC_KEY_ID, ASC_ISSUER_ID, ASC_KEY_PATH (the AuthKey_<key ID>.p8 file, named as Apple names it)
// Usage: npm run upload:ios                     uploads build/loqqa.ipa (npm run build:ios makes it)
//        npm run upload:ios -- <file.ipa>       uploads another build
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { basename, dirname } from 'node:path';

const file = process.argv[2] ?? 'build/loqqa.ipa';
const { ASC_KEY_ID, ASC_ISSUER_ID, ASC_KEY_PATH } = process.env;

function fail(message) {
  console.error(message);
  process.exit(1);
}

if (!ASC_KEY_ID || !ASC_ISSUER_ID || !ASC_KEY_PATH) {
  fail('Set ASC_KEY_ID, ASC_ISSUER_ID and ASC_KEY_PATH in .env.local (see .env.example).');
}
const keyPath = ASC_KEY_PATH.replace(/^~(?=\/)/, homedir());
if (!existsSync(keyPath)) fail(`No API key at ${keyPath} (ASC_KEY_PATH).`);
// altool looks the key up by its file name in API_PRIVATE_KEYS_DIR.
if (basename(keyPath) !== `AuthKey_${ASC_KEY_ID}.p8`) {
  fail(`The key file must be named AuthKey_${ASC_KEY_ID}.p8, as App Store Connect names it.`);
}
if (!existsSync(file)) fail(`No build at ${file}: run \`npm run build:ios\` first.`);

console.log(`Uploading ${file} to App Store Connect…`);
const { status, error } = spawnSync(
  'xcrun',
  [
    'altool',
    '--upload-app',
    '--type',
    'ios',
    '--file',
    file,
    '--apiKey',
    ASC_KEY_ID,
    '--apiIssuer',
    ASC_ISSUER_ID,
  ],
  { stdio: 'inherit', env: { ...process.env, API_PRIVATE_KEYS_DIR: dirname(keyPath) } },
);
if (error) fail(`Could not run xcrun altool (Xcode's command line tools): ${error.message}`);
if (status === 0) {
  console.log('Uploaded. Apple processes it for 5–15 minutes, then it shows in TestFlight.');
}
process.exit(status ?? 1);
