import { getLocales } from 'expo-localization';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';

import { useSettingsStore } from '@/shared/stores/settings-store';

import { type AppLanguage, resources } from './resources';

export function detectLanguage(): AppLanguage {
  const { languageCode, regionCode } = getLocales()[0] ?? {};
  if (languageCode === 'pt') return regionCode === 'BR' ? 'pt-BR' : 'pt-PT';
  if (languageCode === 'de') return 'de';
  return 'en';
}

const i18n = createInstance();

i18n.use(initReactI18next).init({
  resources,
  lng: useSettingsStore.getState().language ?? detectLanguage(),
  fallbackLng: 'en',
  defaultNS: 'common',
  interpolation: { escapeValue: false },
});

// Keep i18next in sync with the persisted language choice.
useSettingsStore.subscribe((state, prev) => {
  if (state.language !== prev.language) i18n.changeLanguage(state.language ?? detectLanguage());
});

export { i18n };
export type { AppLanguage } from './resources';
