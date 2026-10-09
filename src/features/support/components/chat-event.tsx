import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { colors, useAccentColor } from '@/shared/lib/theme';
import { CheckBadge } from '@/shared/ui/check-item';
import { Icon } from '@/shared/ui/icon';
import { Text } from '@/shared/ui/text';

export interface DayDividerProps {
  label: string;
  first?: boolean;
}

/** "TODAY" / "YESTERDAY" between messages of different days. */
export function DayDivider({ label, first }: DayDividerProps) {
  return (
    <Text
      variant="overline"
      className={cn('self-center text-[11px] tracking-[0.9px] text-dim', !first && 'mt-2')}
    >
      {label}
    </Text>
  );
}

export interface SystemLineProps {
  title: string;
  meta?: string | null;
  /** Accent check for status changes, grey for "Ticket created". */
  highlight?: boolean;
}

/** Centred event such as "Ticket #1043 created · Bug · just now" (01f-3e, 01f·B-4b). */
export function SystemLine({ title, meta, highlight }: SystemLineProps) {
  return (
    <View className="my-4 flex-row items-center gap-2.5 self-center pr-3.5 pl-1.5">
      <CheckBadge size={20} glyph={11} className={cn(!highlight && 'bg-subtle')} />
      <View className="gap-0.5">
        <Text variant="caption" className="text-xs leading-4">
          {title}
        </Text>
        {meta ? <Text className="font-inter text-xs leading-4 text-subtle">{meta}</Text> : null}
      </View>
    </View>
  );
}

export interface DoneLineProps {
  label: string;
  /** Accent for resolved tickets, muted for ones closed without a fix. */
  resolved: boolean;
  /** Team note of the status change, e.g. "Fix ist in 1.4.3 live". */
  note?: string | null;
}

/** "✓ Resolved · Ticket closed" under the last message (01f·B-2). */
export function DoneLine({ label, resolved, note }: DoneLineProps) {
  const accent = useAccentColor();
  return (
    <View className="mt-3.5 items-center gap-0.5">
      <View className="flex-row items-center gap-1.5">
        <Icon name="check" size={12} color={resolved ? accent : colors.muted} />
        <Text variant="caption" className={cn('text-xs', resolved ? 'text-accent' : 'text-muted')}>
          {label}
        </Text>
      </View>
      {note ? <Text className="font-inter text-xs leading-4 text-subtle">{note}</Text> : null}
    </View>
  );
}
