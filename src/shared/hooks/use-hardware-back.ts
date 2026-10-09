import { useIsFocused } from 'expo-router';
import { useEffect, useEffectEvent } from 'react';
import { BackHandler } from 'react-native';

/** Runs `onBack` instead of Android's default back while the screen is focused. */
export function useHardwareBack(onBack: () => void, enabled = true) {
  const focused = useIsFocused();
  const handle = useEffectEvent(onBack);
  useEffect(() => {
    if (!enabled || !focused) return;
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      handle();
      return true;
    });
    return () => sub.remove();
  }, [enabled, focused]);
}
