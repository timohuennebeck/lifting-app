// Builds the plan lab: one HTML file that opens in any browser, with generate-plan's prompt,
// schema and plan builder bundled in (lab.mjs) and the Supabase project of .env.local to read the
// catalog from. The page asks for an OpenAI API key and calls OpenAI itself; each plan is a paid
// call. Usage: npm run plan:lab, then open scripts/plan-lab/out/plan-lab.html.
import { build } from 'esbuild';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

import { supabaseEnv } from '../plan-functions.mjs';

const HERE = import.meta.dirname;
const OUT = join(HERE, 'out', 'plan-lab.html');
const PLACEHOLDER = '<!-- plan-lab:script -->';

const { url, key } = supabaseEnv();
const bundle = await build({
  entryPoints: [join(HERE, 'lab.mjs')],
  bundle: true,
  format: 'iife',
  globalName: 'PlanLab',
  platform: 'browser',
  target: 'es2022',
  write: false,
  charset: 'utf8',
  legalComments: 'none',
});
const config = { supabaseUrl: url, supabaseKey: key, built: new Date().toISOString() };
const script = `<script>\nwindow.PLAN_LAB_CONFIG = ${JSON.stringify(config)};\n${bundle.outputFiles[0].text.replace(/<\/script/gi, '<\\/script')}</script>`;
const page = readFileSync(join(HERE, 'index.html'), 'utf8');
if (!page.includes(PLACEHOLDER)) throw new Error(`index.html has no ${PLACEHOLDER}.`);

mkdirSync(join(HERE, 'out'), { recursive: true });
writeFileSync(
  OUT,
  page.replace(PLACEHOLDER, () => script),
);
console.log(`Open ${relative(process.cwd(), OUT)} in a browser (catalog: ${url}).`);
