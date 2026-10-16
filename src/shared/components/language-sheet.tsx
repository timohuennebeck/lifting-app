import { useAppLanguage } from '@/shared/hooks/use-app-language';
import { APP_LANGUAGES, LANGUAGE_NAMES } from '@/shared/i18n/resources';
import { useSettingsStore } from '@/shared/stores/settings-store';
import { LanguageFlag } from '@/shared/ui/language-flag';
import { RadioListSheet } from '@/shared/ui/radio-list-sheet';

export interface LanguageSheetProps {
  visible: boolean;
  onClose: () => void;
}

/** Picks the app language (welcome screen and settings). */
export function LanguageSheet({ visible, onClose }: LanguageSheetProps) {
  const language = useAppLanguage();
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  return (
    <RadioListSheet
      visible={visible}
      onClose={onClose}
      value={language}
      onSelect={setLanguage}
      options={APP_LANGUAGES.map((code) => ({
        value: code,
        label: LANGUAGE_NAMES[code],
        leading: <LanguageFlag language={code} size={32} />,
      }))}
    />
  );
}
