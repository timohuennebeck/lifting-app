import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors } from '@/shared/lib/theme';
import { Icon, type IconName } from '@/shared/ui/icon';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

export interface SourceCardProps {
  title: string;
  description: string;
  icon: IconName;
  /** Accent circle for the primary option. */
  primary?: boolean;
  onPress: () => void;
  /** Illustration in the upper part of the card. */
  children: ReactNode;
}

/** Big tappable card on "Import plan" (photo / file). */
export function SourceCard({
  title,
  description,
  icon,
  primary,
  onPress,
  children,
}: SourceCardProps) {
  return (
    <PressableScale
      haptic="press"
      activeScale={0.985}
      onPress={onPress}
      accessibilityLabel={`${title}. ${description}`}
      className="h-[232px] overflow-hidden rounded-[28px] bg-surface"
    >
      <View className="flex-1 items-center pt-[26px]">{children}</View>
      <View className="flex-row items-center gap-3 px-5 pb-[18px]">
        <View className="min-w-0 flex-1">
          <Text variant="bodyStrong" className="text-lg">
            {title}
          </Text>
          <Text variant="caption" tone="subtle" className="mt-[3px] font-inter">
            {description}
          </Text>
        </View>
        <View
          className={cn(
            'size-[52px] items-center justify-center rounded-full',
            primary ? 'bg-accent' : 'bg-elevated',
          )}
        >
          <Icon
            name={icon}
            size={primary ? 22 : 18}
            color={primary ? colors.onAccent : colors.fg}
          />
        </View>
      </View>
    </PressableScale>
  );
}

const CORNERS = [
  'top-0 left-0 border-t-[3px] border-l-[3px] rounded-tl-[10px]',
  'top-0 right-0 border-t-[3px] border-r-[3px] rounded-tr-[10px]',
  'bottom-0 left-0 border-b-[3px] border-l-[3px] rounded-bl-[10px]',
  'bottom-0 right-0 border-b-[3px] border-r-[3px] rounded-br-[10px]',
];

/** Accent viewfinder corners around a tilted page. */
export function ViewfinderArt() {
  return (
    <View className="h-32 w-[172px]">
      {CORNERS.map((c) => (
        <View key={c} className={cn('absolute size-[26px] border-accent', c)} />
      ))}
      <View
        className="absolute top-4 left-[30px] h-24 w-28 gap-2 rounded-lg bg-[#EDEAE2] p-3"
        style={{ transform: [{ rotate: '-5deg' }], boxShadow: '0 10px 24px rgba(0,0,0,0.4)' }}
      >
        <View className="h-1.5 w-[55%] rounded-[3px] bg-[#1C1A16]" />
        {['90%', '75%', '85%', '60%'].map((w) => (
          <View
            key={w}
            className="h-[5px] rounded-[3px] bg-[#C9C3B6]"
            style={{ width: w as `${number}%` }}
          />
        ))}
      </View>
    </View>
  );
}
