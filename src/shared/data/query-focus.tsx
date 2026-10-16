import { useIsFocused } from 'expo-router';
import { createContext, type ReactNode, useContext } from 'react';

/** Whether the tab around a query is shown; always true outside a QueryFocus. */
const QueryFocusContext = createContext(true);

/**
 * Pauses the watched queries rendered inside it while its tab is hidden (another tab, or a
 * workout pushed over the tabs). TabScreen wraps its header and content in it; queries a tab's
 * screen runs above its TabScreen stay live. Queries a change made stale run once when the tab
 * shows again (staleTime is Infinity).
 */
export function QueryFocus({ children }: { children: ReactNode }) {
  const focused = useIsFocused();
  return <QueryFocusContext value={focused}>{children}</QueryFocusContext>;
}

export const useQueryFocus = () => useContext(QueryFocusContext);
