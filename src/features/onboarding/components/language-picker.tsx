import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { detectLanguage } from '@/shared/i18n';
import { APP_LANGUAGES } from '@/shared/i18n/resources';
import { cn } from '@/shared/lib/cn';
import { useSettingsStore } from '@/shared/stores/settings-store';
import { LanguageFlag } from '@/shared/ui/language-flag';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { RadioDot } from '@/shared/ui/radio-dot';
import { Sheet } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';

/** Flag pill that opens a sheet to switch the app language. */
export function LanguagePicker() {
  const { t } = useTranslation();
  const { t: to } = useTranslation('onboarding');
  const language = useSettingsStore((s) => s.language) ?? detectLanguage();
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const [open, setOpen] = useState(false);

  return (
    <>
      <PressableScale
        onPress={() => setOpen(true)}
        accessibilityLabel={`${to('welcome.language')}: ${t(`languages.${language}`)}`}
        className="h-11 flex-row items-center gap-2.5 rounded-full bg-pill pr-3.5 pl-[7px]"
      >
        <LanguageFlag language={language} />
        <Text variant="label">{t(`languages.${language}`)}</Text>
      </PressableScale>
      <Sheet visible={open} onClose={() => setOpen(false)} title={to('welcome.language')}>
        <View className="gap-2">
          {APP_LANGUAGES.map((code) => {
            const selected = code === language;
            return (
              <PressableScale
                key={code}
                haptic="select"
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                onPress={() => {
                  setLanguage(code);
                  setOpen(false);
                }}
                className={cn(
                  'h-16 flex-row items-center gap-3.5 rounded-[22px] border-2 bg-elevated px-4',
                  selected ? 'border-accent' : 'border-transparent',
                )}
              >
                <LanguageFlag language={code} size={32} />
                <Text variant="bodyStrong" className="flex-1">
                  {t(`languages.${code}`)}
                </Text>
                <RadioDot selected={selected} />
              </PressableScale>
            );
          })}
        </View>
      </Sheet>
    </>
  );
}
