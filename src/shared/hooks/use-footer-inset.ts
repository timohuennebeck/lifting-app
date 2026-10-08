import { useSafeAreaInsets } from 'react-native-safe-area-context';

/** Bottom padding for pinned CTAs: 30pt above the edge on notched iPhones, as in the design. */
export function useFooterInset() {
  const insets = useSafeAreaInsets();
  return Math.max(insets.bottom - 4, 16);
}
