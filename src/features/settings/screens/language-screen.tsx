import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { detectLanguage } from '@/shared/i18n';
import { APP_LANGUAGES, LANGUAGE_NAMES } from '@/shared/i18n/resources';
import { colors } from '@/shared/lib/theme';
import { useSettingsStore } from '@/shared/stores/settings-store';
import { CheckBadge } from '@/shared/ui/check-item';
import { Icon } from '@/shared/ui/icon';
import { LanguageFlag } from '@/shared/ui/language-flag';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Screen } from '@/shared/ui/screen';
import { ScreenHeader } from '@/shared/ui/screen-header';
import { StepTitle } from '@/shared/ui/step-screen';
import { Text } from '@/shared/ui/text';

interface LanguageRowProps {
  icon: ReactNode;
  name: string;
  /** The language's name in the app language, so one picked by mistake can still be read. */
  detail?: string;
  selected: boolean;
  onPress: () => void;
}

function LanguageRow({ icon, name, detail, selected, onPress }: LanguageRowProps) {
  return (
    <PressableScale
      activeScale={0.98}
      haptic="select"
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      className="flex-row items-center gap-3.5 rounded-2xl px-1 py-3"
    >
      {icon}
      <View className="min-w-0 flex-1 gap-0.5">
        <Text variant="bodyStrong" numberOfLines={1}>
          {name}
        </Text>
        {detail ? (
          <Text tone="subtle" className="text-sm" numberOfLines={1}>
            {detail}
          </Text>
        ) : null}
      </View>
      {selected ? <CheckBadge size={26} glyph={12} /> : <View className="size-6.5" />}
    </PressableScale>
  );
}

/**
 * The app language (Settings and the welcome screen): the phone's language, or one of the app's.
 * A tap applies it at once; the profile, the coach and the auth emails follow.
 */
export function LanguageScreen() {
  const { t } = useTranslation();
  const picked = useSettingsStore((s) => s.language);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const device = detectLanguage();

  return (
    <Screen scroll header={<ScreenHeader />}>
      <StepTitle title={t('languagePage.title')} subtitle={t('languagePage.lead')} />
      <View accessibilityRole="radiogroup" className="px-4 pt-4">
        <LanguageRow
          icon={
            <View className="size-10 items-center justify-center rounded-full bg-control">
              <Icon name="phone" size={18} color={colors.fg} />
            </View>
          }
          name={t('languagePage.device')}
          detail={t(`languagePage.names.${device}`)}
          selected={picked === null}
          onPress={() => setLanguage(null)}
        />
        {APP_LANGUAGES.map((code) => {
          const local = t(`languagePage.names.${code}`);
          return (
            <LanguageRow
              key={code}
              icon={<LanguageFlag language={code} size={40} />}
              name={LANGUAGE_NAMES[code]}
              detail={local !== LANGUAGE_NAMES[code] ? local : undefined}
              selected={picked === code}
              onPress={() => setLanguage(code)}
            />
          );
        })}
      </View>
    </Screen>
  );
}
