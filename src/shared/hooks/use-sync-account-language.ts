import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { saveProfile, useProfile } from '@/shared/data/profile';
import type { AppLanguage } from '@/shared/i18n/resources';
import { storage } from '@/shared/lib/storage';

// The language this device last mirrored onto the profile. Only a change of it is written, so
// two devices in different languages don't overwrite each other back and forth.
const syncedLanguageKey = (userId: string) => `account.language.${userId}`;

/**
 * Mirrors the app language onto the profile row (synced, for the team's replies). Mounted once
 * in the (app) layout.
 */
export function useSyncAccountLanguage() {
  const { i18n } = useTranslation();
  const language = i18n.language as AppLanguage;
  const { profile } = useProfile();

  useEffect(() => {
    if (!profile) return;
    const key = syncedLanguageKey(profile.id);
    if (storage.getString(key) === language) return;
    storage.set(key, language);
    if (profile.language !== language) saveProfile(profile.id, { language });
  }, [profile, language]);
}
