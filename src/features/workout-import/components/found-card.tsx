import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import { CheckBox } from './check-box';

export interface FoundCardProps {
  title: string;
  /** What was found; without `found`, that it wasn't. */
  caption: string;
  /** In the file (or made from it); otherwise the card is dimmed and can't be picked. */
  found: boolean;
  picked: boolean;
  onPress: () => void;
  /** The artwork above the title. */
  children: ReactNode;
}

/** 13p: what the file holds (history or plan), picked to be imported or not. */
export function FoundCard({ title, caption, found, picked, onPress, children }: FoundCardProps) {
  const { t } = useTranslation('workoutImport');
  const on = found && picked;
  return (
    <PressableScale
      haptic="select"
      activeScale={0.985}
      onPress={onPress}
      disabled={!found}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: on, disabled: !found }}
      className={cn(
        'min-h-0 flex-1 overflow-hidden rounded-3xl border-2 bg-surface',
        on ? 'border-accent' : 'border-transparent',
      )}
    >
      <View className={cn('min-h-0 flex-1', !found && 'opacity-40')}>
        <View className="min-h-0 flex-1 items-center justify-center overflow-hidden px-5 pt-5 pb-2">
          {children}
        </View>
        <View className="gap-1 px-5.5 pt-1 pb-5.5">
          <Text className="font-inter-semibold text-[17px] text-fg">{title}</Text>
          <Text className="font-inter text-[13px] leading-[18px] text-subtle">{caption}</Text>
        </View>
      </View>
      <View className="absolute top-4.5 right-4.5">
        {found ? (
          <CheckBox checked={picked} />
        ) : (
          <View className="h-6 justify-center rounded-full bg-control px-2">
            <Text className="font-inter-semibold text-xs text-fg-mid">{t('found.notFound')}</Text>
          </View>
        )}
      </View>
    </PressableScale>
  );
}
