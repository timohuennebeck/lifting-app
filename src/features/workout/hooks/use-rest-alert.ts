import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { useSettingsStore } from '@/shared/stores/settings-store';

import { cancelRestAlert, scheduleRestAlert } from '../lib/rest-alert';
import { useWorkoutSessionStore } from '../stores/workout-session-store';

/** A rest that ends sooner than this when it is cleared ran out: its alert is showing. */
const ENDING_MS = 500;

/**
 * Vibrates at the end of each rest also with the app closed or the phone in a pocket: a
 * notification for when it ends (`rest-alert.ts`). Follows the session store, so a rest started,
 * moved or skipped anywhere (the Live Activity's buttons too) moves or takes back the alert.
 * Mount it once, for the whole signed-in app.
 */
export function useRestAlert() {
  const { t } = useTranslation('workout');
  const restEndsAt = useWorkoutSessionStore((s) => s.restEndsAt);
  const restSound = useSettingsStore((s) => s.restSound);

  useEffect(() => {
    if (restEndsAt == null || restEndsAt <= Date.now()) return;
    const texts = {
      title: t('rest.doneTitle'),
      body: t('rest.doneBody'),
      channel: t('rest.channel'),
    };
    scheduleRestAlert(restEndsAt, texts, restSound);
    return () => {
      if (Date.now() < restEndsAt - ENDING_MS) cancelRestAlert();
    };
  }, [restEndsAt, restSound, t]);
}
