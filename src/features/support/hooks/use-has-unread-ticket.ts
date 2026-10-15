import { useTickets } from '../data/tickets';
import { isUnread, useSeenStore } from '../stores/seen-store';

/** True when the team has replied to any ticket since the user last opened it. */
export function useHasUnreadTicket() {
  const { data: tickets = [] } = useTickets();
  const seen = useSeenStore((s) => s.seen);
  return tickets.some((ticket) => isUnread(ticket.lastTeamAt, seen[ticket.id]));
}
