import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mmkvStorage } from '@/shared/lib/storage';

import { toMs } from '../lib/ticket-format';

interface SeenState {
  /** Ticket id → time of the newest message the user has seen. */
  seen: Record<string, string>;
  markSeen: (ticketId: string, at: string) => void;
}

export const useSeenStore = create<SeenState>()(
  persist(
    (set) => ({
      seen: {},
      markSeen: (ticketId, at) =>
        set((state) => {
          const prev = state.seen[ticketId];
          if (prev && toMs(prev) >= toMs(at)) return state;
          return { seen: { ...state.seen, [ticketId]: at } };
        }),
    }),
    { name: 'support-seen', storage: createJSONStorage(() => mmkvStorage) },
  ),
);

/** True when the team has replied since the user last opened the chat. */
export function useHasUnread(ticketId: string, lastTeamAt: string | null) {
  const seenAt = useSeenStore((s) => s.seen[ticketId]);
  return !!lastTeamAt && (!seenAt || toMs(lastTeamAt) > toMs(seenAt));
}
