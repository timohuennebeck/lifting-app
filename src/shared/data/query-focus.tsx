import { useIsFocused } from 'expo-router';
import { createContext, type ReactNode, useContext } from 'react';

/** Whether the screen around a query is on top; outside a tab screen always. */
const QueryFocusContext = createContext(true);

/**
 * Pauses the watched queries below while their tab is hidden (another tab, or a workout pushed
 * over the tabs), so logging a set doesn't re-run every hidden tab's queries. Queries a change
 * made stale run once when the tab shows again (staleTime is Infinity).
 */
export function QueryFocus({ children }: { children: ReactNode }) {
  const focused = useIsFocused();
  return <QueryFocusContext value={focused}>{children}</QueryFocusContext>;
}

export const useQueryFocus = () => useContext(QueryFocusContext);
