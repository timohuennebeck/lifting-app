import { View } from 'react-native';

import { useAppLanguage } from '@/shared/hooks/use-app-language';
import { APP_LANGUAGES, LANGUAGE_NAMES } from '@/shared/i18n/resources';
import { cn } from '@/shared/lib/cn';
import { useSettingsStore } from '@/shared/stores/settings-store';
import { LanguageFlag } from '@/shared/ui/language-flag';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { RadioDot } from '@/shared/ui/radio-dot';
import { Sheet } from '@/shared/ui/sheet';
import { Text } from '@/shared/ui/text';

export interface LanguageSheetProps {
  visible: boolean;
  onClose: () => void;
}

/** Picks the app language (welcome screen and settings): a tap applies it and closes the sheet. */
export function LanguageSheet({ visible, onClose }: LanguageSheetProps) {
  const language = useAppLanguage();
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  return (
    <Sheet visible={visible} onClose={onClose}>
      <View className="gap-2">
        {APP_LANGUAGES.map((code) => {
          const selected = code === language;
          return (
            <PressableScale
              key={code}
              activeScale={1}
              haptic="select"
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => {
                setLanguage(code);
                onClose();
              }}
              className={cn(
                'h-16 flex-row items-center gap-3.5 rounded-[22px] border-2 bg-elevated px-4',
                selected ? 'border-accent' : 'border-transparent',
              )}
            >
              <LanguageFlag language={code} size={32} />
              <Text variant="bodyStrong" className="flex-1">
                {LANGUAGE_NAMES[code]}
              </Text>
              <RadioDot selected={selected} />
            </PressableScale>
          );
        })}
      </View>
    </Sheet>
  );
}
