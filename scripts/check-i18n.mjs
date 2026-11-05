// Checks that every app language has the same texts as English: keys, placeholders and tags per
// namespace, and {{count}} instead of a literal number in `_one` where 0 takes that form. Also
// checks each language's native config (app.json, weight shortcut strings, iOS permission texts).
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PLURAL = /_(zero|one|two|few|many|other)$/;
const USAGE_KEYS = [
  'NSCameraUsageDescription',
  'NSPhotoLibraryUsageDescription',
  'NSMicrophoneUsageDescription',
  'NSSpeechRecognitionUsageDescription',
];

// Maps each text to its key path; plural forms of a key share one path.
function flatten(value, path = '', out = new Map()) {
  if (typeof value === 'string') {
    const key = path.replace(PLURAL, '');
    const form = path.match(PLURAL)?.[1] ?? '';
    const entry = out.get(key) ?? { texts: [], forms: {} };
    entry.texts.push(value);
    entry.forms[form] = value;
    out.set(key, entry);
  } else if (Array.isArray(value)) {
    value.forEach((item, i) => flatten(item, `${path}.${i}`, out));
  } else if (value && typeof value === 'object') {
    for (const [k, v] of Object.entries(value)) flatten(v, path ? `${path}.${k}` : k, out);
  }
  return out;
}

function tokens(texts) {
  const found = new Set();
  for (const text of texts) {
    for (const m of text.matchAll(/\{\{\s*([\w.]+)[^}]*\}\}/g)) found.add(`{{${m[1]}}}`);
    for (const m of text.matchAll(/<\/?(\w+)\s*\/?>/g)) found.add(`<${m[1]}>`);
  }
  return [...found].sort();
}

export function compareLocale(en, other, lang) {
  const problems = [];
  const source = flatten(en);
  const target = flatten(other);
  const zeroTakesOne = new Intl.PluralRules(lang).select(0) === 'one';

  for (const [key, entry] of source) {
    const found = target.get(key);
    if (!found) {
      problems.push(`${lang}: missing ${key}`);
    } else {
      const want = tokens(entry.texts);
      const have = tokens(found.texts);
      if (want.join() !== have.join()) {
        problems.push(
          `${lang}: ${key} has ${have.join(' ') || 'no tokens'}, en has ${want.join(' ') || 'none'}`,
        );
      }
    }
  }
  for (const key of target.keys()) {
    if (!source.has(key)) problems.push(`${lang}: extra ${key}`);
  }
  if (zeroTakesOne) {
    for (const [key, entry] of target) {
      const one = entry.forms.one;
      if (one !== undefined && /\d/.test(one) && !one.includes('{{count}}')) {
        problems.push(
          `${lang}: ${key}_one has a literal number instead of {{count}}, but 0 takes this form in ${lang}`,
        );
      }
    }
  }
  return problems;
}

const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));

function checkNative(root, langs) {
  const problems = [];
  const app = readJson(join(root, 'app.json')).expo;
  const lists = app.plugins
    .filter((p) => Array.isArray(p) && p[0] === 'expo-localization')
    .flatMap((p) => Object.values(p[1].supportedLocales ?? {}));
  const strings = readJson(join(root, 'plugins/weight-shortcut/strings.json'));
  for (const lang of langs) {
    if (!app.locales?.[lang]) problems.push(`${lang}: missing in app.json locales`);
    if (lists.length < 2 || lists.some((l) => !l.includes(lang))) {
      problems.push(`${lang}: missing in a supportedLocales list of expo-localization`);
    }
    if (!strings[lang]) problems.push(`${lang}: missing in plugins/weight-shortcut/strings.json`);
    const file = join(root, 'locales', `${lang}.json`);
    if (!existsSync(file)) {
      problems.push(`${lang}: missing locales/${lang}.json`);
      continue;
    }
    const ios = readJson(file).ios ?? {};
    for (const key of USAGE_KEYS) {
      if (!ios[key]) problems.push(`${lang}: locales/${lang}.json lacks ${key}`);
    }
  }
  return problems;
}

function run() {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const base = join(root, 'src/shared/i18n/locales');
  const names = (dir) => readdirSync(dir).filter((f) => f.endsWith('.json'));
  const langs = readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== 'en')
    .map((d) => d.name);
  const namespaces = names(join(base, 'en'));
  const problems = [];

  for (const lang of langs) {
    const have = names(join(base, lang));
    for (const file of namespaces) {
      if (!have.includes(file)) {
        problems.push(`${lang}: missing namespace ${file}`);
        continue;
      }
      const found = compareLocale(
        readJson(join(base, 'en', file)),
        readJson(join(base, lang, file)),
        lang,
      );
      problems.push(...found.map((p) => `${file}: ${p}`));
    }
    for (const file of have.filter((f) => !namespaces.includes(f))) {
      problems.push(`${lang}: extra namespace ${file}`);
    }
  }
  problems.push(...checkNative(root, langs));

  if (problems.length > 0) {
    console.error(problems.join('\n'));
    console.error(`\n${problems.length} problem(s) in the app languages.`);
    process.exit(1);
  }
  console.log(`All app languages match: ${['en', ...langs].join(', ')}.`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) run();
