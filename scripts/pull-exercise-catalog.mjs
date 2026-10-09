// Writes the exercise catalog from Supabase into the app's bundled snapshot, which new installs
// use until their first refresh. Run before a release: `npm run catalog:pull` (reads the
// Supabase URL and publishable key from .env, so point it at the project you ship against).
import { writeFileSync } from 'node:fs';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) {
  console.error('Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.');
  process.exit(1);
}

const response = await fetch(`${url}/rest/v1/exercises?select=*&order=id`, {
  headers: { apikey: key },
});
if (!response.ok) {
  console.error(`Fetching exercises failed: ${response.status} ${await response.text()}`);
  process.exit(1);
}
const rows = await response.json();
const target = new URL('../src/shared/data/exercise-catalog.json', import.meta.url);
writeFileSync(target, `${JSON.stringify(rows, null, 2)}\n`);
console.log(`Wrote ${rows.length} exercises to src/shared/data/exercise-catalog.json`);
