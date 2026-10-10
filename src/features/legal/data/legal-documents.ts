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

/**
 * The version of a document in effect now, from `public.legal_documents` (readable logged out,
 * so the links on the sign-up screen work). Null when none has been published.
 */
export async function fetchCurrentDocument(kind: LegalKind, language: string) {
  const locales = localesFor(language);
  const { data, error } = await supabase
    .from('legal_documents')
    .select('id, kind, locale, version, content_md, effective_at, requires_reacceptance')
    .eq('kind', kind)
    .in('locale', locales)
    .lte('effective_at', new Date().toISOString())
    .order('effective_at', { ascending: false });
  if (error) throw error;
  const rows = data ?? [];
  const row = locales.map((l) => rows.find((r) => r.locale === l)).find(Boolean);
  if (!row) return null;
  return {
    id: row.id,
    kind: row.kind,
    locale: row.locale,
    version: row.version,
    contentMd: row.content_md,
    effectiveAt: row.effective_at,
    requiresReacceptance: !!row.requires_reacceptance,
  } as LegalDocument;
}

export function useLegalDocument(kind: LegalKind, language: string) {
  return useQuery({
    queryKey: legalKeys.current(kind, language).queryKey,
    queryFn: () => fetchCurrentDocument(kind, language),
    staleTime: HOUR_MS,
  });
}
