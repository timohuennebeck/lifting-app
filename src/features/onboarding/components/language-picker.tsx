import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useAppLanguage } from '@/shared/hooks/use-app-language';
import { LANGUAGE_NAMES } from '@/shared/i18n/resources';
import { LanguageFlag } from '@/shared/ui/language-flag';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

/** Flag pill that opens the language screen. */
export function LanguagePicker() {
  const { t } = useTranslation('onboarding');
  const language = useAppLanguage();

  return (
    <PressableScale
      onPress={() => router.push('/language')}
      accessibilityLabel={`${t('welcome.language')}: ${LANGUAGE_NAMES[language]}`}
      className="h-11 flex-row items-center gap-2.5 rounded-full bg-pill pr-3.5 pl-1.75"
    >
      <LanguageFlag language={language} />
      <Text variant="label">{LANGUAGE_NAMES[language]}</Text>
    </PressableScale>
  );
}
