import type { ReactNode } from 'react';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { cn } from '@/shared/lib/cn';

import { TabHeader } from './tab-header';

export interface TabScreenProps {
  children: ReactNode;
  /** Extra header buttons, placed before settings. */
  headerActions?: ReactNode;
  /** Rendered under the header, outside the scroll area. */
  pinned?: ReactNode;
  contentClassName?: string;
}

/** Tab root: shared header plus a scroll view that clears the native tab bar. */
export function TabScreen({ children, headerActions, pinned, contentClassName }: TabScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <TabHeader actions={headerActions} />
      {pinned}
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        showsVerticalScrollIndicator={false}
        contentContainerClassName={cn('grow', contentClassName)}
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      >
        {children}
      </ScrollView>
    </View>
  );
}
