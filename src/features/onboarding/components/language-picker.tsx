import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { LanguageSheet } from '@/shared/components/language-sheet';
import { detectLanguage } from '@/shared/i18n';
import { useSettingsStore } from '@/shared/stores/settings-store';
import { LanguageFlag } from '@/shared/ui/language-flag';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

/** Flag pill that opens a sheet to switch the app language. */
export function LanguagePicker() {
  const { t } = useTranslation();
  const { t: to } = useTranslation('onboarding');
  const language = useSettingsStore((s) => s.language) ?? detectLanguage();
  const [open, setOpen] = useState(false);

  return (
    <>
      <PressableScale
        onPress={() => setOpen(true)}
        accessibilityLabel={`${to('welcome.language')}: ${t(`languages.${language}`)}`}
        className="h-11 flex-row items-center gap-2.5 rounded-full bg-pill pr-3.5 pl-1.75"
      >
        <LanguageFlag language={language} />
        <Text variant="label">{t(`languages.${language}`)}</Text>
      </PressableScale>
      <LanguageSheet visible={open} onClose={() => setOpen(false)} />
    </>
  );
}
