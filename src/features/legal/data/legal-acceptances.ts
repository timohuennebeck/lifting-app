import { useStatus } from '@powersync/react-native';
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

import {
  fetchCurrentDocuments,
  fetchDocumentVersion,
  type LegalDocument,
  legalKeys,
} from './legal-documents';

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

/** A version to accept, with the one this user accepted last (compared on the update page). */
export interface PendingDocument {
  document: LegalDocument;
  /** The version accepted last, in the language shown now; null without one there. */
  previous: LegalDocument | null;
  /** Its version number, also when that language doesn't have it (e.g. "2.4"). */
  previousVersion: string | null;
}

/**
 * Documents in effect that require a new acceptance the user hasn't given. An acceptance counts
 * for its kind and version in every language, so switching the app language never asks again.
 */
async function fetchPendingDocuments(
  language: string,
  acceptedIds: string[],
): Promise<PendingDocument[]> {
  // Side by side: on launch the splash screen waits for this.
  const [current, accepted] = await Promise.all([
    fetchCurrentDocuments(language),
    fetchAcceptedVersions(acceptedIds),
  ]);
  const pending = await Promise.all(
    current
      .filter((d) => d.requiresReacceptance)
      .map(async (document): Promise<PendingDocument | null> => {
        const last = accepted
          .filter((a) => a.kind === document.kind)
          .sort((a, b) => b.effective_at.localeCompare(a.effective_at))[0];
        if (last?.version === document.version) return null;
        return {
          document,
          previous: last
            ? await fetchDocumentVersion(document.kind, document.locale, last.version)
            : null,
          previousVersion: last?.version ?? null,
        };
      }),
  );
  return pending.filter((p) => p !== null);
}

async function fetchAcceptedVersions(ids: string[]) {
  if (!ids.length) return [];
  const { data, error } = await supabase
    .from('legal_documents')
    .select('kind, version, effective_at')
    .in('id', ids);
  if (error) throw error;
  return data ?? [];
}

/**
 * New versions to accept before the app can be used. Checked online on start, hourly and when
 * the app comes back to the foreground; offline nothing is pending, so nothing ever blocks.
 * `settled` once the first check is done, failed included.
 */
export function usePendingLegalDocuments(language: string) {
  // Until the first sync, acceptances made on another device aren't here yet.
  const { hasSynced } = useStatus();
  const { data: acceptedIds } = useDrizzleQuery({
    queryKey: legalKeys.accepted.queryKey,
    query: acceptedQuery(),
    map: toSortedIds,
  });
  const {
    data = [],
    status,
    refetch,
  } = useQuery({
    queryKey: legalKeys.pending(language, acceptedIds ?? []).queryKey,
    queryFn: () => fetchPendingDocuments(language, acceptedIds ?? []),
    enabled: !!acceptedIds && hasSynced === true,
    staleTime: HOUR_MS,
    refetchInterval: HOUR_MS,
  });
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refetch();
    });
    return () => sub.remove();
  }, [refetch]);
  return { pending: data, settled: status !== 'pending' };
}
