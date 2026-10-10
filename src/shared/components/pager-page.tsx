import type { ReactNode } from 'react';
import { ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * One page of the Progress tab: scrolls on its own and clears the native tab bar. The tab turns
 * the automatic insets off for its pager, so each page asks for them here.
 */
export function ProgressPage({ children }: { children: ReactNode }) {
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
