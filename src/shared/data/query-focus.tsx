import { useIsFocused } from 'expo-router';
import { type ComponentType, createContext, type ReactNode, useContext } from 'react';

/** Whether the tab around a query is shown; always true outside a QueryFocus. */
const QueryFocusContext = createContext(true);

/**
 * Pauses the watched queries rendered inside it while its tab is hidden (another tab, or a
 * workout pushed over the tabs). Queries a change made stale run once when the tab shows again
 * (staleTime is Infinity). Tabs get it with `withQueryFocus`.
 */
export function QueryFocus({ children }: { children: ReactNode }) {
  const focused = useIsFocused();
  return <QueryFocusContext value={focused}>{children}</QueryFocusContext>;
}

export const useQueryFocus = () => useContext(QueryFocusContext);

/**
 * A tab's screen inside a QueryFocus, so the queries the screen itself runs pause too: the tabs
 * stay mounted, and a hidden tab's queries would otherwise re-run on every write (a logged set).
 */
export function withQueryFocus<P extends object>(Screen: ComponentType<P>) {
  return function FocusedScreen(props: P) {
    return (
      <QueryFocus>
        <Screen {...props} />
      </QueryFocus>
    );
  };
}
