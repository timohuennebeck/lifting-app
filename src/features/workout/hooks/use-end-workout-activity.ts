import { useEffect } from 'react';

import { useActiveWorkout } from '@/shared/data/workouts';

import { endWorkoutActivity } from '../lib/live-activity';

/**
 * Ends the workout's Live Activity once no workout runs: finished, discarded, or one left on the
 * Lock Screen from before a restart. `useWorkoutActivity` starts and updates it.
 */
export function useEndWorkoutActivity() {
  const { data: active } = useActiveWorkout();
  useEffect(() => {
    if (active === null) void endWorkoutActivity();
  }, [active]);
}
