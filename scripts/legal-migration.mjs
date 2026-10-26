// Writes a migration that publishes the legal texts in docs/legal as one legal_documents row per
// kind and locale. Rows can't be changed once inserted, so a new version needs a new migration:
//   node scripts/legal-migration.mjs <version> <effective date> <migration name> [locale …]
// e.g. node scripts/legal-migration.mjs 1.0 2026-10-23 20261023130000_legal_documents_v1
// Locales after the name limit it to them, to add a translation to a version already published.
import { readFileSync, writeFileSync } from 'node:fs';

const [version, effectiveAt, name, ...only] = process.argv.slice(2);
if (!version || !effectiveAt || !name) {
  console.error(
    'Usage: node scripts/legal-migration.mjs <version> <effective date> <migration name> [locale …]',
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
};

const unknown = only.filter((locale) => !(locale in FILES));
if (unknown.length) {
  console.error(`Unknown locale: ${unknown.join(', ')}`);
  process.exit(1);
}
const locales = only.length ? only : Object.keys(FILES);

const rows = locales.flatMap((locale) =>
  Object.entries(FILES[locale]).map(([kind, file]) => {
    const text = readFileSync(new URL(`../docs/legal/${file}`, import.meta.url), 'utf8').trim();
    if (text.includes('$md$')) throw new Error(`${file} contains the quote tag $md$`);
    if (text.includes('[[PLATZHALTER')) throw new Error(`${file} still has placeholders`);
    return `  ('${kind}', '${locale}', '${version}', $md$${text}\n$md$, '${effectiveAt}')`;
  }),
);

const source = only.length ? `docs/legal, ${only.join(', ')}` : 'docs/legal';
const sql = `-- The legal texts of version ${version} (${source}), in effect from ${effectiveAt}; written by
-- scripts/legal-migration.mjs. Documents can't be changed once inserted: publish a new version.
insert into public.legal_documents (kind, locale, version, content_md, effective_at) values
${rows.join(',\n')};
`;

writeFileSync(new URL(`../supabase/migrations/${name}.sql`, import.meta.url), sql);
console.log(`supabase/migrations/${name}.sql: ${rows.length} documents`);
