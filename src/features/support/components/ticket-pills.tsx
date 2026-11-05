import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { Text } from '@/shared/ui/text';

import type { TicketKind, TicketStatus } from '../data/tickets';

/** The status pill's text: closed tickets dimmed. */
const STATUS_TEXT: Record<TicketStatus, string> = {
  open: 'text-fg-mid',
  closed: 'text-dim',
};

interface PillProps {
  label: string;
  textClassName: string;
}

function Pill({ label, textClassName }: PillProps) {
  return (
    <View className="rounded-full bg-control px-2 py-0.75">
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
  return (
    <View className={cn('flex-row gap-1.5', className)}>
      <Pill label={t(`kind.${kind}`)} textClassName="text-fg-mid" />
      <Pill label={t(`status.${status}`)} textClassName={STATUS_TEXT[status]} />
    </View>
  );
}
