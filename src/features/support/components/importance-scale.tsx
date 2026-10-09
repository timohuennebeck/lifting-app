import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

const LEVELS = [1, 2, 3, 4, 5] as const;

export interface ImportanceScaleProps {
  value: number;
  onChange: (value: number) => void;
}

/** "How important is it to you?" 1–5 circles with end labels (design 01f·J). */
export function ImportanceScale({ value, onChange }: ImportanceScaleProps) {
  const { t } = useTranslation('support');
  return (
    <View className="gap-2.5">
      <Text variant="overline" tone="subtle" className="text-[11px]">
        {t('form.importance')}
      </Text>
      <View className="flex-row justify-between">
        {LEVELS.map((level) => {
          const selected = level === value;
          return (
            <PressableScale
              key={level}
              haptic="select"
              accessibilityRole="radio"
              accessibilityLabel={t('form.importanceValue', { value: level })}
              accessibilityState={{ selected }}
              onPress={() => onChange(level)}
              className={cn(
                'size-14 items-center justify-center rounded-full',
                selected ? 'bg-accent' : 'bg-chip',
              )}
            >
              <Text
                variant="headline"
                className={cn('text-xl', selected ? 'text-on-accent' : 'text-fg-mid')}
              >
                {level}
              </Text>
            </PressableScale>
          );
        })}
      </View>
      <View className="flex-row justify-between px-0.5">
        <Text className="font-inter text-xs text-dim">{t('form.importanceLow')}</Text>
        <Text className="font-inter text-xs text-dim">{t('form.importanceHigh')}</Text>
      </View>
    </View>
  );
}
