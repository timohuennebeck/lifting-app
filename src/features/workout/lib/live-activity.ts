import type { WorkoutActivityProps } from './activity-props';

// Live Activities are iOS only (`live-activity.ios.ts`); elsewhere these do nothing.

export async function showWorkoutActivity(_props: WorkoutActivityProps) {}

export async function endWorkoutActivity() {}

export function onActivityButton(_listener: (target: string) => void) {
  return () => {};
}
