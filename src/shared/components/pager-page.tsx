import type { ReactNode } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * One page of a tab with swipeable top tabs (Fortschritt, Profil): scrolls on its own and clears
 * the native tab bar. Those tabs turn the automatic insets off for their pager, so each page asks
 * for them here.
 */
export function PagerPage({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 24 }}
    >
      {children}
    </ScrollView>
  );
}
