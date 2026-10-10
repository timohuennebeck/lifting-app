import { useQuery } from '@tanstack/react-query';
import Constants from 'expo-constants';
import { useEffect } from 'react';
import { AppState, Platform } from 'react-native';

import { newId } from '@/shared/data/json';
import { drizzle } from '@/shared/data/powersync/database';
import { legalAcceptances } from '@/shared/data/powersync/schema';
import { supabase } from '@/shared/data/supabase';
import { useDrizzleQuery } from '@/shared/data/use-drizzle-query';
import { HOUR_MS } from '@/shared/lib/date';

import { fetchCurrentDocuments, type LegalDocument, legalKeys } from './legal-documents';

const acceptedQuery = () =>
  drizzle.select({ documentId: legalAcceptances.document_id }).from(legalAcceptances);

const toSortedIds = (rows: { documentId: string }[]) => rows.map((r) => r.documentId).sort();

/**
 * Records that the user accepted these documents, with the app version and platform; the
 * server sets the time. Rows sync through PowerSync and are never changed afterwards.
 */
export async function acceptDocuments(userId: string, documents: LegalDocument[]) {
  const accepted = new Set(toSortedIds(await acceptedQuery()));
  const fresh = documents.filter((d) => !accepted.has(d.id));
  if (!fresh.length) return;
  const platform = Platform.OS === 'ios' || Platform.OS === 'android' ? Platform.OS : null;
  await drizzle.insert(legalAcceptances).values(
    fresh.map((d) => ({
      id: newId(),
      profile_id: userId,
      document_id: d.id,
      accepted_at: null,
      app_version: Constants.expoConfig?.version ?? null,
      platform,
    })),
  );
}

/**
 * Documents in effect that require a new acceptance the user hasn't given. An acceptance counts
 * for its kind and version in every language, so switching the app language never asks again.
 */
async function fetchPendingDocuments(language: string, acceptedIds: string[]) {
  const due = (await fetchCurrentDocuments(language)).filter((d) => d.requiresReacceptance);
  if (!due.length || !acceptedIds.length) return due;
  const { data, error } = await supabase
    .from('legal_documents')
    .select('kind, version')
    .in('id', acceptedIds);
  if (error) throw error;
  const accepted = new Set((data ?? []).map((r) => `${r.kind}:${r.version}`));
  return due.filter((d) => !accepted.has(`${d.kind}:${d.version}`));
}

/**
 * New versions to accept before the app can be used. Checked online on start, hourly and when
 * the app comes back to the foreground; offline nothing is pending, so nothing ever blocks.
 */
export function usePendingLegalDocuments(language: string) {
  const { data: acceptedIds } = useDrizzleQuery({
    queryKey: legalKeys.accepted.queryKey,
    query: acceptedQuery(),
    map: toSortedIds,
  });
  const { data = [], refetch } = useQuery({
    queryKey: legalKeys.pending(language, acceptedIds ?? []).queryKey,
    queryFn: () => fetchPendingDocuments(language, acceptedIds ?? []),
    enabled: !!acceptedIds,
    staleTime: HOUR_MS,
    refetchInterval: HOUR_MS,
  });
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refetch();
    });
    return () => sub.remove();
  }, [refetch]);
  return data;
}
