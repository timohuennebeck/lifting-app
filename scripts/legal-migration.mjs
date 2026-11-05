// Writes a migration that publishes the legal texts in docs/legal, one legal_documents row per kind
// and locale. Rows can't be changed, so a new version needs a new migration and an effective time
// after the last one's (the app shows the latest in effect), e.g.
//   node scripts/legal-migration.mjs 1.4 '2026-11-05 18:00:00+00' 20261105180000_legal_documents_v1_4
// Locales after the name publish only those (a translation of a version already out); --kind=terms
// or --kind=privacy only that document; --reaccept has users of an older version accept again.
import { readFileSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const flags = args.filter((arg) => arg.startsWith('--'));
const [version, effectiveAt, name, ...only] = args.filter((arg) => !arg.startsWith('--'));
const kindArg = flags.find((flag) => flag.startsWith('--kind='));
const kind = kindArg?.slice('--kind='.length);
const reaccept = flags.includes('--reaccept');
const unknownFlags = flags.filter((flag) => flag !== kindArg && flag !== '--reaccept');
const badKind = kindArg && kind !== 'terms' && kind !== 'privacy';
if (!version || !effectiveAt || !name || unknownFlags.length || badKind) {
  console.error(
    'Usage: node scripts/legal-migration.mjs <version> <effective at> <migration name> [--kind=terms|privacy] [--reaccept] [locale …]',
  );
  process.exit(1);
}

/** The documents per locale (the app's legal_documents locales). */
const FILES = {
  de: { terms: 'de/nutzungsbedingungen.md', privacy: 'de/datenschutz.md' },
  en: { terms: 'en/terms.md', privacy: 'en/privacy.md' },
  'pt-PT': { terms: 'pt-PT/terms.md', privacy: 'pt-PT/privacy.md' },
  'pt-BR': { terms: 'pt-BR/terms.md', privacy: 'pt-BR/privacy.md' },
  ko: { terms: 'ko/terms.md', privacy: 'ko/privacy.md' },
  es: { terms: 'es/terms.md', privacy: 'es/privacy.md' },
  fr: { terms: 'fr/terms.md', privacy: 'fr/privacy.md' },
};

const unknown = only.filter((locale) => !(locale in FILES));
if (unknown.length) {
  console.error(`Unknown locale: ${unknown.join(', ')}`);
  process.exit(1);
}
const locales = only.length ? only : Object.keys(FILES);

const rows = locales.flatMap((locale) =>
  Object.entries(FILES[locale])
    .filter(([documentKind]) => !kind || documentKind === kind)
    .map(([documentKind, file]) => {
      const text = readFileSync(new URL(`../docs/legal/${file}`, import.meta.url), 'utf8').trim();
      if (text.includes('$md$')) throw new Error(`${file} contains the quote tag $md$`);
      if (text.includes('[[PLATZHALTER')) throw new Error(`${file} still has placeholders`);
      return `  ('${documentKind}', '${locale}', '${version}', $md$${text}\n$md$, '${effectiveAt}', ${reaccept})`;
    }),
);

const source = ['docs/legal', kind && `${kind} only`, ...only].filter(Boolean).join(', ');
const acceptance = reaccept
  ? 'Users who accepted an older version accept this one before they go on.'
  : 'No re-acceptance: the version in effect covers users who accepted an older one.';
const sql = `-- The legal texts of version ${version} (${source}), in effect from ${effectiveAt}; written by
-- scripts/legal-migration.mjs. Documents can't be changed once inserted: publish a new version.
-- ${acceptance}
insert into public.legal_documents (kind, locale, version, content_md, effective_at, requires_reacceptance) values
${rows.join(',\n')};
`;

writeFileSync(new URL(`../supabase/migrations/${name}.sql`, import.meta.url), sql);
console.log(`supabase/migrations/${name}.sql: ${rows.length} documents`);
