import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { saveProfile, useProfile } from '@/shared/data/profile';
import { supabase } from '@/shared/data/supabase';
import type { AppLanguage } from '@/shared/i18n';
import { storage } from '@/shared/lib/storage';
import { useSessionStore } from '@/shared/stores/session-store';

// The language this device last mirrored onto the account (profile row, auth metadata). Only a
// change of it is written, so two devices in different languages don't overwrite each other
// back and forth.
const syncedLanguageKey = (userId: string) => `account.language.${userId}`;
const syncedMetadataKey = (userId: string) => `account.metadataLanguage.${userId}`;

/**
 * Mirrors the app language onto the account: the profile row (synced, for the team's
 * replies) and the auth metadata (for Supabase's emails). Mounted once in the (app) layout.
 */
export function useSyncAccountLanguage() {
  const { i18n } = useTranslation();
  const language = i18n.language as AppLanguage;
  const { profile } = useProfile();
  const session = useSessionStore((s) => s.session);
  const userId = session?.user.id;
  const metadataLanguage = session?.user.user_metadata?.language as string | undefined;

  useEffect(() => {
    if (!profile) return;
    const key = syncedLanguageKey(profile.id);
    if (profile.language !== null && storage.getString(key) === language) return;
    storage.set(key, language);
    if (profile.language !== language) saveProfile(profile.id, { language });
  }, [profile, language]);

  useEffect(() => {
    if (!userId) return;
    const key = syncedMetadataKey(userId);
    if (metadataLanguage && storage.getString(key) === language) return;
    if (metadataLanguage === language) {
      storage.set(key, language);
      return;
    }
    // Needs the network; only a saved write is remembered, so a failed one is tried again on
    // the next launch or language change.
    supabase.auth.updateUser({ data: { language } }).then(
      ({ error }) => {
        if (!error) storage.set(key, language);
      },
      () => {},
    );
  }, [userId, metadataLanguage, language]);
}
