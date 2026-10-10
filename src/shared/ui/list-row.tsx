import type { ReactNode } from 'react';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';

import { PressableScale, type PressableScaleProps } from './pressable-scale';
import { Text } from './text';

export interface ListRowProps extends Omit<PressableScaleProps, 'children'> {
  /** Short text in the leading circle, e.g. an index or a day of the month. */
  badge: ReactNode;
  /** Fills the leading circle with the accent colour. */
  highlight?: boolean;
  title: string;
  /** Line under the title, e.g. a row of stats. */
  subtitle: ReactNode;
  /** Buttons or a chevron after the text. */
  trailing?: ReactNode;
}

/** 72pt pressable list row: leading circle, title over a subtitle, trailing controls. */
export function ListRow({
  badge,
  highlight,
  title,
  subtitle,
  trailing,
  className,
  ...props
}: ListRowProps) {
  return (
    <PressableScale className={cn('h-18 flex-row items-center gap-3.5', className)} {...props}>
      <View
        className={cn(
          'size-10 items-center justify-center rounded-full',
          highlight ? 'bg-accent' : 'bg-elevated',
        )}
      >
        <Text variant="label" tone={highlight ? 'onAccent' : 'default'}>
          {badge}
        </Text>
      </View>
      <View className="min-w-0 flex-1 gap-1.5">
        <Text variant="bodyStrong" numberOfLines={1} className="text-lg leading-5.5">
          {title}
        </Text>
        {subtitle}
      </View>
      {trailing}
    </PressableScale>
  );
}
