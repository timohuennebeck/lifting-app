import { View } from 'react-native';

import { cn } from '@/shared/lib/cn';
import { Avatar } from '@/shared/ui/avatar';
import { PressableScale } from '@/shared/ui/pressable-scale';
import { Text } from '@/shared/ui/text';

import type { TicketSummary } from '../data/tickets';
import { useTicketRow } from '../hooks/use-ticket-row';
import { TeamAvatar } from './team-avatar';
import { TicketPills } from './ticket-pills';

export interface TicketListRowProps {
  ticket: TicketSummary;
  userName: string;
}

/** Row of "My tickets": the user's avatar with the team badge, subject and latest reply (01f-2). */
export function TicketListRow({ ticket, userName }: TicketListRowProps) {
  const { unread, when, preview, open } = useTicketRow(ticket);
  return (
    <PressableScale className="flex-row items-center gap-3 py-3" onPress={open}>
      <View>
        <View
          className={cn(
            'rounded-full border-2 p-0.5',
            unread ? 'border-accent' : 'border-transparent',
          )}
        >
          <Avatar name={userName} size={48} className="border-0" />
        </View>
        <View className="absolute right-0 bottom-0 rounded-full bg-bg p-[2.5px]">
          <TeamAvatar size={22} />
        </View>
      </View>
      <View className="min-w-0 flex-1 gap-0.75">
        <View className="flex-row items-baseline gap-2">
          <Text variant="label" numberOfLines={1} className="min-w-0 flex-1 leading-5">
            {ticket.subject}
          </Text>
          <Text className={cn('font-inter text-xs', unread ? 'text-accent' : 'text-dim')}>
            {when}
          </Text>
        </View>
        <View className="flex-row items-center gap-2">
          <Text numberOfLines={1} className="min-w-0 flex-1 font-inter text-sm text-subtle">
            {preview}
          </Text>
          {unread ? <View className="size-2.5 rounded-full bg-accent" /> : null}
        </View>
        <TicketPills kind={ticket.kind} status={ticket.status} className="mt-0.75" />
      </View>
    </PressableScale>
  );
}
