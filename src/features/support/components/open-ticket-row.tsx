import { router } from 'expo-router';
import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import type { TicketSummary } from '../data/tickets';
import { useTicketFormat } from '../hooks/use-ticket-format';
import { useTicketRow } from '../hooks/use-ticket-row';
import { TeamAvatar } from './team-avatar';
import { TicketPills } from './ticket-pills';

export interface OpenTicketRowProps {
  ticket: TicketSummary;
}

/** Compact ticket row of the profile's open-tickets section (design 01b-2). */
export function OpenTicketRow({ ticket }: OpenTicketRowProps) {
  const format = useTicketFormat();
  const { unread, when, preview } = useTicketRow(ticket);
  return (
    <PressableScale
      className="flex-row items-center gap-3 py-3"
      onPress={() =>
        router.push({ pathname: '/support/[ticketId]', params: { ticketId: ticket.id } })
      }
    >
      <TeamAvatar size={40} highlight={unread} />
      <View className="min-w-0 flex-1 gap-0.75">
        <View className="flex-row items-baseline justify-between gap-2">
          <Text variant="label" numberOfLines={1} className="shrink leading-5">
            {format.title(ticket.number)}
          </Text>
          <Text className={cn('font-inter text-xs', unread ? 'text-accent' : 'text-dim')}>
            {when}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Text numberOfLines={1} className="min-w-0 flex-1 font-inter text-[13px] text-muted">
            {preview}
          </Text>
          {unread ? <View className="size-2 rounded-full bg-accent" /> : null}
        </View>
        <TicketPills kind={ticket.kind} status={ticket.status} className="mt-0.75" />
      </View>
    </PressableScale>
  );
}
