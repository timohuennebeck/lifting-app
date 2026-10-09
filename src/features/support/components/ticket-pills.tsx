import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { Text } from '@/shared/ui/text';

import type { TicketKind, TicketStatus } from '../data/tickets';
import { useTicketFormat } from '../hooks/use-ticket-format';

// Green "fixed" pill from the design; there is no success token.
const RESOLVED = { backgroundColor: 'rgba(120,200,140,0.16)', color: '#8FD6A0' };

const STATUS_CLASSES: Record<Exclude<TicketStatus, 'resolved'>, [string, string]> = {
  open: ['bg-control', 'text-fg-mid'],
  planned: ['bg-accent/16', 'text-accent'],
  closed: ['bg-control', 'text-dim'],
};

interface PillProps {
  label: string;
  boxClassName?: string;
  textClassName?: string;
  colors?: typeof RESOLVED;
}

function Pill({ label, boxClassName, textClassName, colors }: PillProps) {
  return (
    <View
      className={cn('rounded-full px-2 py-0.75', boxClassName)}
      style={colors ? { backgroundColor: colors.backgroundColor } : undefined}
    >
      <Text
        variant="caption"
        className={cn('text-[10px] leading-3.25 tracking-[0.5px] uppercase', textClassName)}
        style={colors ? { color: colors.color } : undefined}
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

/** "BUG · PLANNED" pills under a ticket row. */
export function TicketPills({ kind, status, className }: TicketPillsProps) {
  const { t } = useTranslation('support');
  const format = useTicketFormat();
  const [box, text] = status === 'resolved' ? [] : STATUS_CLASSES[status];
  return (
    <View className={cn('flex-row gap-1.5', className)}>
      <Pill label={t(`kind.${kind}`)} boxClassName="bg-control" textClassName="text-fg-mid" />
      <Pill
        label={format.status(kind, status)}
        boxClassName={box}
        textClassName={text}
        colors={status === 'resolved' ? RESOLVED : undefined}
      />
    </View>
  );
}
