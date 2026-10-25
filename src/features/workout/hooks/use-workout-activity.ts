import { useEffect, useEffectEvent } from 'react';
import { useTranslation } from 'react-i18next';

import { isBodyweight, measuresOf, useExerciseName } from '@/shared/data/exercises';

import { REST_NUDGE } from '../components/rest-timer';
import type { WorkoutDetail } from '../data/workout-detail';
import {
  ACTIVITY_TARGETS,
  activityValues,
  nextOpenSet,
  type WorkoutActivityProps,
} from '../lib/activity-props';
import { onActivityButton, showWorkoutActivity } from '../lib/live-activity';
import { rowValues } from '../lib/row-values';
import { parseSetInput, toSetInput } from '../lib/set-input';
import { useWorkoutSessionStore } from '../stores/workout-session-store';
import type { useLiveWorkout } from './use-live-workout';

/** Marks where the set number goes in "Set {{current}} of {{total}}". */
const BADGE = '\u0000';

/**
 * Keeps the Live Activity (Lock Screen, Dynamic Island) in step with the live workout: the rest
 * while one runs, otherwise the next set to log. Its buttons act here: iOS wakes the app for
 * them in the background. `useEndWorkoutActivity` ends it.
 */
export function useWorkoutActivity(
  workout: WorkoutDetail,
  live: ReturnType<typeof useLiveWorkout>,
) {
  const { t, i18n } = useTranslation(['workout', 'common']);
  const restEndsAt = useWorkoutSessionStore((s) => s.restEndsAt);
  const restSeconds = useWorkoutSessionStore((s) => s.restSeconds);
  const logged = useWorkoutSessionStore((s) => s.logged);
  const drafts = useWorkoutSessionStore((s) => s.drafts);
  const { units } = live;

  const at = nextOpenSet(workout.exercises, live.exerciseIndex, logged);
  const exercise = at ? workout.exercises[at.exerciseIndex] : undefined;
  const exerciseName = useExerciseName(exercise?.exerciseId ?? '', i18n.language);

  let next: WorkoutActivityProps['next'] = null;
  if (at && exercise) {
    const values = rowValues(exercise, at.setIndex, logged, null, drafts);
    const measures = measuresOf(exercise.exerciseId);
    const bodyweight = isBodyweight(exercise.exerciseId);
    const { missing } = parseSetInput(toSetInput(values, units), measures, bodyweight, units);
    next = {
      ...at,
      exercise: exerciseName,
      done: exercise.sets.map((s) => !!s.completedAt || s.id in logged),
      values: activityValues(values, measures, bodyweight, {
        units,
        reps: t('activity.reps'),
        seconds: t('common:units.sec'),
      }),
      loggable: !missing,
    };
  }

  const [setBefore, setAfter = ''] = t('setOf', {
    current: BADGE,
    total: exercise?.sets.length ?? 0,
  }).split(BADGE);
  const props: WorkoutActivityProps = {
    workoutId: workout.id,
    workoutName: workout.name,
    startedAt: Date.parse(workout.startedAt),
    rest: restEndsAt != null ? { from: restEndsAt - restSeconds * 1000, to: restEndsAt } : null,
    next,
    texts: {
      rest: t('rest.title'),
      minus: t('rest.minus', { seconds: REST_NUDGE }),
      plus: t('rest.plus', { seconds: REST_NUDGE }),
      skipRest: t('activity.skipRest'),
      logSet: t('activity.logSet'),
      setBefore: setBefore.trim(),
      setAfter: setAfter.trim(),
      allDone: live.totalSets ? t('table.doneAll') : '',
    },
  };

  // After every render: it sends only what changed.
  useEffect(() => {
    void showWorkoutActivity(props);
  });

  const press = useEffectEvent((target: string) => {
    const store = useWorkoutSessionStore.getState();
    if (target === ACTIVITY_TARGETS.minus) store.addRest(-REST_NUDGE);
    else if (target === ACTIVITY_TARGETS.plus) store.addRest(REST_NUDGE);
    else if (target === ACTIVITY_TARGETS.skipRest) store.skipRest();
    else if (target === ACTIVITY_TARGETS.logSet && at) live.logSetAt(at.exerciseIndex, at.setIndex);
  });
  useEffect(() => onActivityButton((target) => press(target)), []);
}
