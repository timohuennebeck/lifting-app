import { SafeAreaView } from 'react-native-safe-area-context';

const PROBE = { position: 'absolute', left: 0, right: 0, bottom: 0 } as const;

export interface TabBarInsetProps {
  onChange: (inset: number) => void;
}

/**
 * Measures how much of a tab screen's bottom the native tab bar (and the home indicator) covers:
 * an empty view padded by its own safe area. The tabs turn iOS's automatic scroll insets off,
 * which also pushed content under the header out of view, so scroll views pad for this instead.
 */
export function TabBarInset({ onChange }: TabBarInsetProps) {
  return (
    <SafeAreaView
      edges={['bottom']}
      pointerEvents="none"
      style={PROBE}
      onLayout={(e) => onChange(e.nativeEvent.layout.height)}
    />
  );
}
