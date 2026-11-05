// Writes a migration that publishes the legal texts in docs/legal as one legal_documents row per
// kind and locale. Rows can't be changed once inserted, so a new version needs a new migration:
//   node scripts/legal-migration.mjs <version> <effective date> <migration name> [--kind=…] [locale …]
// e.g. node scripts/legal-migration.mjs 1.0 2026-10-23 20261023130000_legal_documents_v1
// Locales after the name limit it to them, to add a translation to a version already published.
// --kind=terms or --kind=privacy publishes only that document, when only it changed.
import { readFileSync, writeFileSync } from 'node:fs';

const args = process.argv.slice(2);
const kindArg = args.find((arg) => arg.startsWith('--kind='));
const [version, effectiveAt, name, ...only] = args.filter((arg) => arg !== kindArg);
const kind = kindArg?.slice('--kind='.length);
if (!version || !effectiveAt || !name || (kindArg && kind !== 'terms' && kind !== 'privacy')) {
  console.error(
    'Usage: node scripts/legal-migration.mjs <version> <effective date> <migration name> [--kind=terms|privacy] [locale …]',
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
      return `  ('${documentKind}', '${locale}', '${version}', $md$${text}\n$md$, '${effectiveAt}')`;
    }),
);

const source = ['docs/legal', kind && `${kind} only`, ...only].filter(Boolean).join(', ');
const sql = `-- The legal texts of version ${version} (${source}), in effect from ${effectiveAt}; written by
-- scripts/legal-migration.mjs. Documents can't be changed once inserted: publish a new version.
insert into public.legal_documents (kind, locale, version, content_md, effective_at) values
${rows.join(',\n')};
`;

writeFileSync(new URL(`../supabase/migrations/${name}.sql`, import.meta.url), sql);
console.log(`supabase/migrations/${name}.sql: ${rows.length} documents`);
