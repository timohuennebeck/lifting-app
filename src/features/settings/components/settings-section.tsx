import type { ReactNode } from 'react';
import { View } from 'react-native';

import { colors } from '@/shared/lib/theme';
import { Icon } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';
import { ToggleSwitch } from '@/shared/ui/toggle-switch';

export interface SettingsSectionProps {
  title: string;
  children: ReactNode;
}

/** Overline title plus a rounded group. */
export function SettingsSection({ title, children }: SettingsSectionProps) {
  return (
    <View className="gap-2.5 px-4 pt-7">
      <Text variant="overline" tone="subtle" className="px-1 text-[11px]">
        {title}
      </Text>
      <View className="overflow-hidden rounded-[22px] bg-surface">{children}</View>
    </View>
  );
}

export interface SettingsRowProps {
  label: string;
  value?: string;
  trailing?: ReactNode;
  onPress: () => void;
  onLongPress?: () => void;
}

/** Tappable row inside a SettingsSection; shows a chevron unless `trailing` is given. */
export function SettingsRow({ label, value, trailing, onPress, onLongPress }: SettingsRowProps) {
  return (
    <PressableScale
      activeScale={0.99}
      haptic="select"
      onPress={onPress}
      onLongPress={onLongPress}
      className="h-14 flex-row items-center gap-3 px-4"
    >
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

export interface SettingsToggleRowProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

/** A row inside a SettingsSection with an on/off switch. */
export function SettingsToggleRow({ label, value, onChange }: SettingsToggleRowProps) {
  return (
    <View className="h-15 flex-row items-center gap-3 px-4">
      <Text variant="label" className="flex-1">
        {label}
      </Text>
      <ToggleSwitch value={value} onChange={onChange} accessibilityLabel={label} />
    </View>
  );
}
