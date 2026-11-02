import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { Text } from '@/shared/ui/text';

import type { TicketKind, TicketStatus } from '../data/tickets';

const STATUS_CLASSES: Record<TicketStatus, [string, string]> = {
  open: ['bg-control', 'text-fg-mid'],
  closed: ['bg-control', 'text-dim'],
};

interface PillProps {
  label: string;
  boxClassName?: string;
  textClassName?: string;
}

function Pill({ label, boxClassName, textClassName }: PillProps) {
  return (
    <View className={cn('rounded-full px-2 py-0.75', boxClassName)}>
      <Text
        variant="caption"
        className={cn('text-[10px] leading-3.25 tracking-[0.5px] uppercase', textClassName)}
      >
        {label}
      </Text>
    </View>
  );
}

export interface TicketPillsProps {
  kind: TicketKind;
  status: TicketStatus;
  className?: string;
}

/** "BUG · OPEN" pills under a ticket row. */
export function TicketPills({ kind, status, className }: TicketPillsProps) {
  const { t } = useTranslation('support');
  const [box, text] = STATUS_CLASSES[status];
  return (
    <View className={cn('flex-row gap-1.5', className)}>
      <Pill label={t(`kind.${kind}`)} boxClassName="bg-control" textClassName="text-fg-mid" />
      <Pill label={t(`status.${status}`)} boxClassName={box} textClassName={text} />
    </View>
  );
}
