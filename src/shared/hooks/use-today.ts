import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { MINUTE_MS, startOfDay } from '@/shared/lib/date';

const todayKey = () => startOfDay(new Date()).getTime();

/**
 * Local midnight of today, as a timestamp that changes when the day does: checked every minute
 * and when the app comes back, so a screen left open overnight moves on. Re-renders only then.
 */
export function useToday() {
  const [day, setDay] = useState(todayKey);
  useEffect(() => {
    const update = () => setDay(todayKey());
    const id = setInterval(update, MINUTE_MS);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') update();
    });
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, []);
  return day;
}
