import { detectLanguage } from '@/shared/i18n';
import { useSettingsStore } from '@/shared/stores/settings-store';

/** The language picked in the app, or the device's while none was picked. */
export function useAppLanguage() {
  return useSettingsStore((s) => s.language) ?? detectLanguage();
}
