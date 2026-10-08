import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

export interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

/** Overline title plus a rounded group, like the profile sections. */
export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <View className="gap-2.5 px-4 pt-7">
      <Text variant="overline" tone="subtle" className="px-1 text-[11px]">
        {title}
      </Text>
      <View className="overflow-hidden rounded-[22px] border border-white/8 bg-surface">
        {children}
      </View>
    </View>
  );
}

export interface SettingsRowProps {
  label: string;
  value?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  onPress: () => void;
  first?: boolean;
  accessibilityRole?: 'button' | 'radio';
  selected?: boolean;
}

/** Tappable row inside a SettingsSection; shows a chevron unless `trailing` is given. */
export function SettingsRow({
  label,
  value,
  leading,
  trailing,
  onPress,
  first,
  accessibilityRole = 'button',
  selected,
}: SettingsRowProps) {
  return (
    <PressableScale
      activeScale={0.99}
      haptic="select"
      accessibilityRole={accessibilityRole}
      accessibilityState={accessibilityRole === 'radio' ? { checked: !!selected } : undefined}
      onPress={onPress}
      className={cn('h-14 flex-row items-center gap-3 px-4', !first && 'border-t border-white/6')}
    >
      {leading}
      <Text variant="label" className="flex-1">
        {label}
      </Text>
      {value ? (
        <Text variant="label" tone="subtle" className="font-inter">
          {value}
        </Text>
      ) : null}
      {trailing ?? <Icon name="chevron-right" size={7} color={colors.dim} />}
    </PressableScale>
  );
}
