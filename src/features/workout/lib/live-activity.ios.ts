import { addUserInteractionListener, type LiveActivity } from 'expo-widgets';

import { workoutActivity } from '../components/workout-activity';
import type { WorkoutActivityProps } from './activity-props';

let current: LiveActivity<WorkoutActivityProps> | null = null;
let sent: WorkoutActivityProps | null = null;
let sentJson = '';
/** Workouts whose activity was ended: a render that comes late doesn't bring it back. */
const ended = new Set<string>();

/**
 * Starts the workout's Live Activity or updates it (nothing when `props` didn't change). During
 * a rest it goes stale when the rest ends: drawn again, it shows the next set without the app.
 */
export async function showWorkoutActivity(props: WorkoutActivityProps) {
  const json = JSON.stringify(props);
  if (json === sentJson || ended.has(props.workoutId)) return;
  sent = props;
  sentJson = json;
  const staleDate = props.rest ? new Date(props.rest.to) : undefined;
  try {
    // One left from before a restart is picked up; one dismissed on the Lock Screen is gone.
    current ??= workoutActivity.getInstances()[0] ?? null;
    if (current) {
      await current.update(props, staleDate).catch(() => {
        current = workoutActivity.start(props, undefined, staleDate);
      });
    } else {
      current = workoutActivity.start(props, undefined, staleDate);
    }
  } catch {
    // Live Activities turned off, or the app isn't in the foreground: tried again on the next change.
    current = null;
    sentJson = '';
  }
}

/** Ends the Live Activity (and any left over), right away. */
export async function endWorkoutActivity() {
  if (sent) ended.add(sent.workoutId);
  current = null;
  sent = null;
  sentJson = '';
  try {
    await Promise.all(workoutActivity.getInstances().map((a) => a.end('immediate')));
  } catch (error) {
    console.warn(error);
  }
}

/** Calls `listener` with the target of a Live Activity button the user pressed. */
export function onActivityButton(listener: (target: string) => void) {
  const subscription = addUserInteractionListener((event) => listener(event.target));
  return () => subscription.remove();
}
