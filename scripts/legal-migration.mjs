// Writes a migration that publishes the legal texts in docs/legal as one legal_documents row per
// kind and locale. Rows can't be changed once inserted, so a new version needs a new migration:
//   node scripts/legal-migration.mjs <version> <effective date> <migration name>
// e.g. node scripts/legal-migration.mjs 1.0 2026-10-23 20261023130000_legal_documents_v1
import { readFileSync, writeFileSync } from 'node:fs';

const [version, effectiveAt, name] = process.argv.slice(2);
if (!version || !effectiveAt || !name) {
  console.error(
    'Usage: node scripts/legal-migration.mjs <version> <effective date> <migration name>',
  );
  process.exit(1);
}

/** The documents per locale (the app's legal_documents locales; Korean shows English). */
const FILES = {
  de: { terms: 'de/nutzungsbedingungen.md', privacy: 'de/datenschutz.md' },
  en: { terms: 'en/terms.md', privacy: 'en/privacy.md' },
  'pt-PT': { terms: 'pt-PT/terms.md', privacy: 'pt-PT/privacy.md' },
  'pt-BR': { terms: 'pt-BR/terms.md', privacy: 'pt-BR/privacy.md' },
};

const rows = Object.entries(FILES).flatMap(([locale, kinds]) =>
  Object.entries(kinds).map(([kind, file]) => {
    const text = readFileSync(new URL(`../docs/legal/${file}`, import.meta.url), 'utf8').trim();
    if (text.includes('$md$')) throw new Error(`${file} contains the quote tag $md$`);
    if (text.includes('[[PLATZHALTER')) throw new Error(`${file} still has placeholders`);
    return `  ('${kind}', '${locale}', '${version}', $md$${text}\n$md$, '${effectiveAt}')`;
  }),
);

const sql = `-- The legal texts of version ${version} (docs/legal), in effect from ${effectiveAt}; written by
-- scripts/legal-migration.mjs. Documents can't be changed once inserted: publish a new version.
insert into public.legal_documents (kind, locale, version, content_md, effective_at) values
${rows.join(',\n')};
`;

writeFileSync(new URL(`../supabase/migrations/${name}.sql`, import.meta.url), sql);
console.log(`supabase/migrations/${name}.sql: ${rows.length} documents`);
