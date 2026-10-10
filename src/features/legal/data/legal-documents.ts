import { createQueryKeys } from '@lukemorales/query-key-factory';
import { useQuery } from '@tanstack/react-query';

import { supabase } from '@/shared/data/supabase';
import { HOUR_MS } from '@/shared/lib/date';

export const LEGAL_KINDS = ['terms', 'privacy'] as const;
export type LegalKind = (typeof LEGAL_KINDS)[number];

export const isLegalKind = (value: string | undefined): value is LegalKind =>
  LEGAL_KINDS.includes(value as LegalKind);

export interface LegalDocument {
  id: string;
  kind: LegalKind;
  locale: string;
  version: string;
  contentMd: string;
  effectiveAt: string;
  /** Users who accepted an older version must accept this one before they go on. */
  requiresReacceptance: boolean;
}

export const legalKeys = createQueryKeys('legalDocuments', {
  current: (kind: LegalKind, language: string) => [kind, language],
  byId: (id: string) => [id],
  accepted: null,
  pending: (language: string, acceptedIds: string[]) => [language, ...acceptedIds],
});

/** The terms and the privacy policy in effect now; a kind with nothing published is left out. */
export async function fetchCurrentDocuments(language: string) {
  const documents = await Promise.all(
    LEGAL_KINDS.map((kind) => fetchCurrentDocument(kind, language)),
  );
  return documents.filter((d): d is LegalDocument => d !== null);
}

/** The app language first; English, then the default locale, when it has no translation. */
const localesFor = (language: string) => [...new Set([language, 'en', 'pt-BR'])];

const COLUMNS = 'id, kind, locale, version, content_md, effective_at, requires_reacceptance';

interface LegalDocumentRow {
  id: string;
  kind: LegalKind;
  locale: string;
  version: string;
  content_md: string;
  effective_at: string;
  requires_reacceptance: boolean | null;
}

const toDocument = (row: LegalDocumentRow): LegalDocument => ({
  id: row.id,
  kind: row.kind,
  locale: row.locale,
  version: row.version,
  contentMd: row.content_md,
  effectiveAt: row.effective_at,
  requiresReacceptance: !!row.requires_reacceptance,
});

/**
 * The version of a document in effect now, from `public.legal_documents` (readable logged out,
 * so the links on the sign-up screen work). Null when none has been published.
 */
async function fetchCurrentDocument(kind: LegalKind, language: string) {
  const locales = localesFor(language);
  const { data, error } = await supabase
    .from('legal_documents')
    .select(COLUMNS)
    .eq('kind', kind)
    .in('locale', locales)
    .lte('effective_at', new Date().toISOString())
    .order('effective_at', { ascending: false });
  if (error) throw error;
  const rows = data ?? [];
  const row = locales.map((l) => rows.find((r) => r.locale === l)).find(Boolean);
  return row ? toDocument(row as LegalDocumentRow) : null;
}

/** One version of a document in one language, or null when it doesn't exist there. */
export async function fetchDocumentVersion(kind: LegalKind, locale: string, version: string) {
  const { data, error } = await supabase
    .from('legal_documents')
    .select(COLUMNS)
    .eq('kind', kind)
    .eq('locale', locale)
    .eq('version', version)
    .limit(1);
  if (error) throw error;
  const row = (data ?? [])[0] as LegalDocumentRow | undefined;
  return row ? toDocument(row) : null;
}

async function fetchDocumentById(id: string) {
  const { data, error } = await supabase.from('legal_documents').select(COLUMNS).eq('id', id);
  if (error) throw error;
  const row = (data ?? [])[0] as LegalDocumentRow | undefined;
  return row ? toDocument(row) : null;
}

/** A published version by its id (they never change, so it's cached for good). */
export function useLegalDocumentById(id: string | undefined) {
  return useQuery({
    queryKey: legalKeys.byId(id ?? '').queryKey,
    queryFn: () => fetchDocumentById(id ?? ''),
    enabled: !!id,
    staleTime: Infinity,
  });
}

export function useLegalDocument(kind: LegalKind, language: string) {
  return useQuery({
    queryKey: legalKeys.current(kind, language).queryKey,
    queryFn: () => fetchCurrentDocument(kind, language),
    staleTime: HOUR_MS,
  });
}
